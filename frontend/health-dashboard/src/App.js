import React, { useEffect, useState, useMemo } from "react";
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
  Stethoscope,
  Sun,
  Moon
} from "lucide-react";

const BACKEND = "http://localhost:5000";

// ── Theme Definitions ──────────────────────────────────────────
const themes = {
  dark: {
    // Root
    pageBg: "bg-slate-950",
    pageText: "text-slate-200",
    // Decor blobs
    blob1: "bg-cyan-900/20",
    blob2: "bg-indigo-900/10",
    // Header
    headerBorder: "border-slate-800/60",
    titleText: "text-white",
    subtitleText: "text-slate-400",
    timeLabel: "text-slate-500",
    timeValue: "text-slate-300",
    statusPill: "bg-slate-900/50 border-slate-700/50",
    // Toggle button
    toggleBg: "bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400",
    // Alert banner
    alertBg: "bg-red-500/10 border-red-500/30",
    alertTitle: "text-red-200",
    alertItem: "text-red-300",
    // Stat card
    cardBg: "bg-gradient-to-br",
    cardIconBg: "bg-slate-950/40",
    cardTitle: "text-slate-400",
    cardValue: "text-white",
    cardUnit: "text-slate-500",
    cardBorderExtra: "",
    cardShadow: "",
    // Chart container
    chartBg: "bg-slate-900/40 border-slate-800",
    chartTitle: "text-white",
    chartSubtitle: "text-slate-500",
    chartLegendBg: "bg-slate-800/50 border-slate-700/50",
    chartLegendText: "text-slate-300",
    chartGrid: "#1e293b",
    chartTick: "#64748b",
    tooltipBg: "#0f172a",
    tooltipBorder: "#334155",
    tooltipText: "#f1f5f9",
    gradientOpacity: 0.3,
    // AI panel
    aiIconBg: "bg-slate-950/30 border-white/10",
    aiHeading: "text-slate-300",
    aiLabel: "text-slate-500",
    aiDivider: "border-white/5",
    aiInfoLabel: "text-slate-400",
    aiInfoValue: "text-slate-200",
    aiBtnBg: "bg-white/5 hover:bg-white/10 border-white/10 shadow-none",
    aiBtnText: "text-white",
    aiBtnIcon: "text-white",
  },
  light: {
    // Root
    pageBg: "bg-slate-50",
    pageText: "text-slate-800",
    // Decor blobs
    blob1: "bg-cyan-200/30",
    blob2: "bg-indigo-200/20",
    // Header
    headerBorder: "border-slate-200",
    titleText: "text-slate-900",
    subtitleText: "text-slate-500",
    timeLabel: "text-slate-400",
    timeValue: "text-slate-700",
    statusPill: "bg-white border-slate-200 shadow-sm",
    // Toggle button
    toggleBg: "bg-white border-slate-200 text-slate-600 hover:text-cyan-600 shadow-sm",
    // Alert banner
    alertBg: "bg-red-50 border-red-300",
    alertTitle: "text-red-700",
    alertItem: "text-red-600",
    // Stat card
    cardBg: "bg-white",
    cardIconBg: "bg-slate-100",
    cardTitle: "text-slate-500",
    cardValue: "text-slate-900",
    cardUnit: "text-slate-400",
    cardBorderExtra: "border-slate-200",
    cardShadow: "shadow-sm",
    // Chart container
    chartBg: "bg-white border-slate-200 shadow-sm",
    chartTitle: "text-slate-800",
    chartSubtitle: "text-slate-400",
    chartLegendBg: "bg-slate-50 border-slate-200",
    chartLegendText: "text-slate-600",
    chartGrid: "#e2e8f0",
    chartTick: "#94a3b8",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e2e8f0",
    tooltipText: "#0f172a",
    gradientOpacity: 0.15,
    // AI panel
    aiIconBg: "bg-slate-100 border-slate-200",
    aiHeading: "text-slate-600",
    aiLabel: "text-slate-400",
    aiDivider: "border-slate-200",
    aiInfoLabel: "text-slate-500",
    aiInfoValue: "text-slate-800",
    aiBtnBg: "bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm",
    aiBtnText: "text-slate-700",
    aiBtnIcon: "text-slate-500",
  }
};

// ── Condition colors for AI Status ─────────────────────────────
const conditionConfig = {
  Normal:      { color: "text-emerald-500", border: "border-emerald-500/40", bg: "bg-emerald-500/10", label: "Stable" },
  Fever:       { color: "text-amber-500",   border: "border-amber-500/40",   bg: "bg-amber-500/10",   label: "Fever Detected" },
  LowSpO2:     { color: "text-cyan-500",    border: "border-cyan-500/40",    bg: "bg-cyan-500/10",    label: "Hypoxia Risk" },
  Tachycardia: { color: "text-rose-500",    border: "border-rose-500/40",    bg: "bg-rose-500/10",    label: "Tachycardia" },
  Bradycardia: { color: "text-indigo-500",  border: "border-indigo-500/40",  bg: "bg-indigo-500/10",  label: "Bradycardia" },
  Emergency:   { color: "text-red-600",     border: "border-red-500/50",     bg: "bg-red-500/20",     label: "CRITICAL" },
  Error:       { color: "text-slate-400",   border: "border-slate-500/40",   bg: "bg-slate-500/10",   label: "System Error" },
  Unknown:     { color: "text-slate-400",   border: "border-slate-500/40",   bg: "bg-slate-500/10",   label: "Initializing..." },
};

function App() {
  const [healthData, setHealthData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mlCondition, setMlCondition] = useState("");
  const [mlLoading, setMlLoading] = useState(false);
  const [lastPredictionAt, setLastPredictionAt] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem("dashboard-theme") || "dark");

  const t = themes[theme];

  useEffect(() => {
    localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

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
        return newData.slice(-30);
      });
      setAlerts(checkAlerts(latest));

      const payload = buildPredictPayload(latest);
      await runPrediction(payload);
    } catch (err) {
      console.error("Fetch latest error:", err.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const latest = healthData.length ? healthData[healthData.length - 1] : null;
  const activeCondition = conditionConfig[mlCondition] || conditionConfig["Unknown"];

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.pageText} font-sans selection:bg-cyan-500/30 transition-colors duration-500`}>
      
      {/* Background Decor Elements */}
      <div className={`fixed top-0 left-0 w-full h-96 ${t.blob1} rounded-full blur-[120px] -translate-y-1/2 pointer-events-none transition-colors duration-700`} />
      <div className={`fixed bottom-0 right-0 w-full h-96 ${t.blob2} rounded-full blur-[120px] translate-y-1/2 pointer-events-none transition-colors duration-700`} />

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* ─── Header ─────────────────────────────────────── */}
        <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${t.headerBorder} transition-colors duration-500`}>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                <Activity className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${t.titleText} tracking-tight transition-colors`}>IoMT Biosense</h1>
                <p className={`${t.subtitleText} text-sm font-medium transition-colors`}>Real-time Patient Telemetry</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border ${t.toggleBg} transition-all duration-300 active:scale-95 cursor-pointer`}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden md:flex flex-col items-end mr-1">
              <span className={`text-xs ${t.timeLabel} font-medium uppercase tracking-wider transition-colors`}>System Time</span>
              <span className={`text-sm font-mono ${t.timeValue} transition-colors`}>
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>

            <div className={`flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border ${t.statusPill} transition-colors duration-500`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-500 tracking-wide uppercase">Monitoring</span>
            </div>
          </div>
        </header>

        {/* ─── Alert Banner ────────────────────────────────── */}
        {alerts.length > 0 && (
          <div className={`${t.alertBg} backdrop-blur-xl border p-4 rounded-xl flex items-start gap-4 transition-colors duration-500`}>
            <div className="p-2 bg-red-500/20 rounded-full shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className={`${t.alertTitle} font-semibold text-sm uppercase tracking-wide mb-1`}>Critical Vitals Warning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.map((a, i) => (
                  <div key={i} className={`text-sm ${t.alertItem} flex items-center gap-2`}>
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    {a.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Dashboard Grid ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Stats & Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stat Cards with Sparklines */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumStatCard 
                title="Heart Rate" 
                value={latest ? latest.heartRate : "--"} 
                unit="bpm" 
                icon={Heart} 
                color="text-rose-500"
                strokeColor="#fb7185"
                bg="from-rose-500/10 to-rose-500/5"
                border="border-rose-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.heartRate }))}
                dataKey="v"
                t={t}
              />
              <PremiumStatCard 
                title="SpO₂ Level" 
                value={latest ? latest.spo2 : "--"} 
                unit="%" 
                icon={Droplets} 
                color="text-cyan-500"
                strokeColor="#22d3ee"
                bg="from-cyan-500/10 to-cyan-500/5"
                border="border-cyan-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.spo2 }))}
                dataKey="v"
                t={t}
              />
              <PremiumStatCard 
                title="Temperature" 
                value={latest ? latest.temperature : "--"} 
                unit="°C" 
                icon={Thermometer} 
                color="text-amber-500"
                strokeColor="#fbbf24"
                bg="from-amber-500/10 to-amber-500/5"
                border="border-amber-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.temperature }))}
                dataKey="v"
                t={t}
              />
              <PremiumStatCard 
                title="Blood Pressure" 
                value={latest ? `${latest.systolic}/${latest.diastolic}` : "--/--"} 
                unit="mmHg" 
                icon={Activity} 
                color="text-violet-500"
                strokeColor="#a78bfa"
                bg="from-violet-500/10 to-violet-500/5"
                border="border-violet-500/20"
                sparkData={healthData.slice(-15).map(d => ({ v: d.systolic }))}
                dataKey="v"
                t={t}
              />
            </div>

            {/* Premium Chart */}
            <div className={`${t.chartBg} backdrop-blur-md border rounded-2xl p-6 transition-colors duration-500`}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className={`text-lg font-semibold ${t.chartTitle} flex items-center gap-2 transition-colors`}>
                    <Stethoscope className="w-4 h-4 text-cyan-500" />
                    Live Metrics
                  </h3>
                  <p className={`text-xs ${t.chartSubtitle} mt-1 transition-colors`}>Real-time fusion of physiological sensors</p>
                </div>
                <div className="flex gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${t.chartLegendBg} border transition-colors`}>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className={`text-xs ${t.chartLegendText}`}>BPM</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md ${t.chartLegendBg} border transition-colors`}>
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className={`text-xs ${t.chartLegendText}`}>SpO₂</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={t.gradientOpacity}/>
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={t.gradientOpacity}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis 
                      tick={{fill: t.chartTick, fontSize: 11}} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: t.tooltipBg, 
                        borderColor: t.tooltipBorder, 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        color: t.tooltipText
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

          {/* ─── Right Column: AI Analysis Panel (4 cols) ── */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className={`relative h-full overflow-hidden rounded-2xl border ${activeCondition.border} ${activeCondition.bg} backdrop-blur-sm transition-all duration-700 flex flex-col`}>
              
              {/* Decorative Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[60px] opacity-20 bg-current ${activeCondition.color}`}></div>

              <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <div className={`p-2 rounded-lg ${t.aiIconBg} backdrop-blur border ${activeCondition.color} transition-colors`}>
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${t.aiHeading} transition-colors`}>AI Diagnostic Engine</h2>
                </div>

                <div className="flex-1">
                  <span className={`text-xs font-medium ${t.aiLabel} uppercase tracking-wider mb-2 block transition-colors`}>
                    Predicted Condition
                  </span>
                  <div className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${activeCondition.color} transition-all duration-500 drop-shadow-sm`}>
                    {mlLoading ? (
                      <span className="flex items-center gap-2 animate-pulse">
                        <Zap className="w-8 h-8" /> Analyzing
                      </span>
                    ) : (
                      activeCondition.label
                    )}
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div className={`flex justify-between items-center text-sm border-b ${t.aiDivider} pb-3 transition-colors`}>
                      <span className={t.aiInfoLabel}>Confidence</span>
                      <span className={`${t.aiInfoValue} font-mono font-semibold`}>98.4%</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm border-b ${t.aiDivider} pb-3 transition-colors`}>
                      <span className={t.aiInfoLabel}>Model Version</span>
                      <span className={`${t.aiInfoValue} font-mono font-semibold`}>v2.4.0-Quantized</span>
                    </div>
                    <div className={`flex justify-between items-center text-sm border-b ${t.aiDivider} pb-3 transition-colors`}>
                      <span className={t.aiInfoLabel}>Last Inference</span>
                      <span className={`${t.aiInfoValue} font-mono font-semibold`}>
                         {lastPredictionAt ? new Date(lastPredictionAt).toLocaleTimeString() : "--:--"}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => runPrediction(buildPredictPayload(latest))}
                  disabled={mlLoading || !latest}
                  className={`mt-auto w-full group relative flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all overflow-hidden border ${t.aiBtnBg} active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className={`relative z-10 ${t.aiBtnText}`}>Run Diagnostics</span>
                  <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10 ${t.aiBtnIcon}`} />
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
  if (diff > 0.2) return <span className="text-rose-500 text-xs font-bold">▲</span>;
  if (diff < -0.2) return <span className="text-cyan-500 text-xs font-bold">▼</span>;
  return <span className="text-slate-400 text-xs font-bold">→</span>;
}

// ── Reusable Premium Stat Card Component ───────────────────────
function PremiumStatCard({ title, value, unit, icon: Icon, color, bg, border, strokeColor, sparkData, dataKey, t }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border ${t.cardBorderExtra || border} ${t.cardBg} ${bg} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 ${t.cardShadow}`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${t.cardIconBg} ${color} transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendIndicator data={sparkData} dataKey={dataKey} />
      </div>
      
      <div className="mt-3">
        <h4 className={`${t.cardTitle} text-xs font-semibold uppercase tracking-wider transition-colors`}>{title}</h4>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-2xl md:text-3xl font-bold ${t.cardValue} tracking-tight transition-colors`}>{value}</span>
          <span className={`text-xs font-medium ${t.cardUnit} transition-colors`}>{unit}</span>
        </div>
      </div>

      <MiniSparkline data={sparkData} dataKey={dataKey} stroke={strokeColor} />
    </div>
  );
}

export default App;