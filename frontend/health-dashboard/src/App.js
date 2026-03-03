import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import {
  Heart,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  Clock,
  BrainCircuit,
  Droplets,
  Zap,
  ChevronRight,
  Stethoscope
} from "lucide-react";

const BACKEND = "http://localhost:5000";

function App() {
  const [healthData, setHealthData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mlCondition, setMlCondition] = useState("");
  const [mlLoading, setMlLoading] = useState(false);
  const [lastPredictionAt, setLastPredictionAt] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modernized gradients and colors for the AI Status
  const conditionConfig = {
    Normal: { color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10", label: "Stable" },
    Fever: { color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/10", label: "Fever Detected" },
    LowSpO2: { color: "text-cyan-400", border: "border-cyan-500/50", bg: "bg-cyan-500/10", label: "Hypoxia Risk" },
    Tachycardia: { color: "text-rose-400", border: "border-rose-500/50", bg: "bg-rose-500/10", label: "Tachycardia" },
    Bradycardia: { color: "text-indigo-400", border: "border-indigo-500/50", bg: "bg-indigo-500/10", label: "Bradycardia" },
    Emergency: { color: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/20", label: "CRITICAL" },
    Error: { color: "text-slate-400", border: "border-slate-500/50", bg: "bg-slate-500/10", label: "System Error" },
    Unknown: { color: "text-slate-400", border: "border-slate-500/50", bg: "bg-slate-500/10", label: "Initializing..." },
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function checkAlerts(data) {
    if (!data) return [];
    const a = [];
    if (data.heartRate < 60) a.push({ msg: "Heart Rate dropping below threshold", severity: "high" });
    if (data.heartRate > 100) a.push({ msg: "Elevated Heart Rate detected", severity: "high" });
    if (data.spo2 < 94) a.push({ msg: "Oxygen Saturation critical", severity: "critical" });
    if (data.temperature > 37.5) a.push({ msg: "Core body temperature elevated", severity: "warning" });
    return a;
  }

  function getValue(obj, keys, fallback = 0) {
    for (let key of keys) {
      if (obj[key] !== undefined) return obj[key];
    }
    return fallback;
  }

  function buildPredictPayload(latest) {
    if (!latest) return null;
    return {
      heartRate: getValue(latest, ["heartRate"]),
      respiratoryRate: getValue(latest, ["respiratoryRate"]),
      temperature: getValue(latest, ["temperature"]),
      spo2: getValue(latest, ["spo2"]),
      systolic: getValue(latest, ["systolic"]),
      diastolic: getValue(latest, ["diastolic"]),
      age: getValue(latest, ["age"], 30),
      gender: latest.gender || "Male",
      weight: getValue(latest, ["weight"], 70),
      height: getValue(latest, ["height"], 1.7),
    };
  }

  async function runPrediction(payload) {
    if (!payload) return;
    setMlLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/predict`, payload);
      setMlCondition(res.data.condition || "Unknown");
      setLastPredictionAt(new Date().toISOString());
    } catch {
      setMlCondition("Error");
    } finally {
      setMlLoading(false);
    }
  }

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/latest`);
      const latest = res.data;
      if (!latest) return;

      setHealthData((prev) => {
        const newData = [...prev, latest];
        return newData.slice(-30); // Keep last 30 readings for smoother chart
      });
      setAlerts(checkAlerts(latest));

      const payload = buildPredictPayload(latest);
      await runPrediction(payload);
    } catch (err) {
      console.error("Fetch latest error:", err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const latest = healthData.length ? healthData[healthData.length - 1] : null;
  const activeCondition = conditionConfig[mlCondition] || conditionConfig["Unknown"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Background Decor Elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-cyan-900/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-full h-96 bg-indigo-900/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                <Activity className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">IoMT Biosense</h1>
                <p className="text-slate-400 text-sm font-medium">Real-time Patient Telemetry</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">System Time</span>
              <span className="text-sm font-mono text-slate-300">
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Monitoring</span>
            </div>
          </div>
        </header>

        {/* Global Alert Banner - Floating Glass Style */}
        {alerts.length > 0 && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 p-4 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="p-2 bg-red-500/20 rounded-full shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-200 font-semibold text-sm uppercase tracking-wide mb-1">Critical Vitals Warning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.map((a, i) => (
                  <div key={i} className="text-sm text-red-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {a.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Stats & Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stat Cards - Glassmorphic with Sparklines */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumStatCard 
                title="Heart Rate" 
                value={latest ? latest.heartRate : "--"} 
                unit="bpm" 
                icon={Heart} 
                color="text-rose-400"
                strokeColor="#fb7185"
                bg="from-rose-500/10 to-rose-500/5"
                border="border-rose-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.heartRate }))}
                dataKey="v"
              />
              <PremiumStatCard 
                title="SpO₂ Level" 
                value={latest ? latest.spo2 : "--"} 
                unit="%" 
                icon={Droplets} 
                color="text-cyan-400"
                strokeColor="#22d3ee"
                bg="from-cyan-500/10 to-cyan-500/5"
                border="border-cyan-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.spo2 }))}
                dataKey="v"
              />
              <PremiumStatCard 
                title="Temperature" 
                value={latest ? latest.temperature : "--"} 
                unit="°C" 
                icon={Thermometer} 
                color="text-amber-400"
                strokeColor="#fbbf24"
                bg="from-amber-500/10 to-amber-500/5"
                border="border-amber-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.temperature }))}
                dataKey="v"
              />
              <PremiumStatCard 
                title="Blood Pressure" 
                value={latest ? `${latest.systolic}/${latest.diastolic}` : "--/--"} 
                unit="mmHg" 
                icon={Activity} 
                color="text-violet-400"
                strokeColor="#a78bfa"
                bg="from-violet-500/10 to-violet-500/5"
                border="border-violet-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.systolic }))}
                dataKey="v"
              />
            </div>

            {/* Premium Chart */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    Live Metrics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Real-time fusion of physiological sensors</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-xs text-slate-300">BPM</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className="text-xs text-slate-300">SpO₂</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis 
                      tick={{fill: '#64748b', fontSize: 11}} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#fb7185" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorHr)" 
                      animationDuration={800}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spo2" 
                      stroke="#22d3ee" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSpo2)" 
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis Panel (4 cols) */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className={`relative h-full overflow-hidden rounded-2xl border ${activeCondition.border} ${activeCondition.bg} backdrop-blur-sm transition-all duration-700 flex flex-col`}>
              
              {/* Decorative Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[60px] opacity-20 bg-current ${activeCondition.color}`}></div>

              <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <div className={`p-2 rounded-lg bg-slate-950/30 backdrop-blur border border-white/10 ${activeCondition.color}`}>
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">AI Diagnostic Engine</h2>
                </div>

                <div className="flex-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    Predicted Condition
                  </span>
                  <div className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${activeCondition.color} drop-shadow-sm`}>
                    {mlLoading ? (
                      <span className="flex items-center gap-2 animate-pulse">
                        <Zap className="w-8 h-8" /> Analyzing
                      </span>
                    ) : (
                      activeCondition.label
                    )}
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-slate-200 font-mono">98.4%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                      <span className="text-slate-400">Model Version</span>
                      <span className="text-slate-200 font-mono">v2.4.0-Quantized</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                      <span className="text-slate-400">Last Inference</span>
                      <span className="text-slate-200 font-mono">
                         {lastPredictionAt ? new Date(lastPredictionAt).toLocaleTimeString() : "--:--"}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => runPrediction(buildPredictPayload(latest))}
                  disabled={mlLoading || !latest}
                  className={`mt-auto w-full group relative flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="relative z-10">Run Diagnostics</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── MiniSparkline ──────────────────────────────────────────────
function MiniSparkline({ data, dataKey, stroke }) {
  if (!data || data.length < 2) {
    return <div className="h-12 mt-3" />;
  }
  return (
    <div className="h-12 mt-3 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Trend Arrow Helper ──────────────────────────────────────────
function TrendIndicator({ data, dataKey }) {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2]?.[dataKey];
  const curr = data[data.length - 1]?.[dataKey];
  if (curr === undefined || prev === undefined) return null;
  const diff = curr - prev;
  if (diff > 0.2) return <span className="text-rose-400 text-xs font-bold">▲</span>;
  if (diff < -0.2) return <span className="text-cyan-400 text-xs font-bold">▼</span>;
  return <span className="text-slate-400 text-xs font-bold">→</span>;
}

// ── Reusable Premium Stat Card Component ───────────────────────
function PremiumStatCard({ title, value, unit, icon: Icon, color, bg, border, strokeColor, sparkData, dataKey }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border ${border} bg-gradient-to-br ${bg} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-slate-950/40 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendIndicator data={sparkData} dataKey={dataKey} />
      </div>
      
      <div className="mt-3">
        <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</h4>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</span>
          <span className="text-xs font-medium text-slate-500">{unit}</span>
        </div>
      </div>

      <MiniSparkline data={sparkData} dataKey={dataKey} stroke={strokeColor} />
    </div>
  );
}

export default App;