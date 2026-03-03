const axios = require("axios");

// Baseline values
let heartRate = 80;
let spo2 = 98;
let temperature = 36.8;
let respiratoryRate = 16;
let systolic = 120;
let diastolic = 80;

const ages = [22, 30, 35, 40, 50, 60];
const genders = ["Male", "Female"];
const weights = [55, 65, 75, 85];
const heights = [1.6, 1.7, 1.75, 1.8];

const conditions = [
    "Normal",
    "Fever",
    "Hypertension",
    "Hypotension",
    "Tachycardia",
    "Bradycardia",
    "Hypoxia",
    "Respiratory Distress",
    "Sepsis"
];

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function applyCondition(condition) {
    switch (condition) {

        case "Fever":
            temperature = 38 + Math.random() * 2;
            heartRate = 95 + Math.random() * 20;
            respiratoryRate = 18 + Math.random() * 6;
            break;

        case "Hypertension":
            systolic = 145 + Math.random() * 25;
            diastolic = 95 + Math.random() * 15;
            heartRate = 85 + Math.random() * 15;
            break;

        case "Hypotension":
            systolic = 85 + Math.random() * 15;
            diastolic = 55 + Math.random() * 10;
            heartRate = 90 + Math.random() * 20;
            break;

        case "Tachycardia":
            heartRate = 110 + Math.random() * 30;
            break;

        case "Bradycardia":
            heartRate = 40 + Math.random() * 15;
            break;

        case "Hypoxia":
            spo2 = 80 + Math.random() * 8;
            heartRate = 100 + Math.random() * 20;
            respiratoryRate = 20 + Math.random() * 8;
            break;

        case "Respiratory Distress":
            respiratoryRate = 25 + Math.random() * 10;
            spo2 = 85 + Math.random() * 10;
            heartRate = 100 + Math.random() * 20;
            break;

        case "Sepsis":
            heartRate = 115 + Math.random() * 25;
            temperature = 39 + Math.random() * 2;
            systolic = 85 + Math.random() * 20;
            diastolic = 55 + Math.random() * 15;
            respiratoryRate = 24 + Math.random() * 8;
            spo2 = 88 + Math.random() * 8;
            break;

        default: // Normal
            heartRate = 70 + Math.random() * 15;
            spo2 = 96 + Math.random() * 3;
            temperature = 36.5 + Math.random() * 0.5;
            respiratoryRate = 14 + Math.random() * 4;
            systolic = 115 + Math.random() * 15;
            diastolic = 75 + Math.random() * 10;
    }
}

function generateFakeData() {

    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    applyCondition(condition);

    // Clamp to safe medical bounds
    heartRate = clamp(heartRate, 30, 180);
    spo2 = clamp(spo2, 70, 100);
    temperature = clamp(temperature, 34, 42);
    respiratoryRate = clamp(respiratoryRate, 8, 40);
    systolic = clamp(systolic, 70, 200);
    diastolic = clamp(diastolic, 40, 130);

    return {
        heart_rate: Math.round(heartRate),
        respiratory_rate: Math.round(respiratoryRate),
        temperature: Number(temperature.toFixed(2)),
        spo2: Math.round(spo2),
        systolic_bp: Math.round(systolic),
        diastolic_bp: Math.round(diastolic),

        age: ages[Math.floor(Math.random() * ages.length)],
        gender: genders[Math.floor(Math.random() * genders.length)],
        weight: weights[Math.floor(Math.random() * weights.length)],
        height: heights[Math.floor(Math.random() * heights.length)],

        condition: condition,
        timestamp: new Date().toISOString()
    };
}

async function sendData() {
    const data = generateFakeData();
    console.log("📤 Sending:", data);

    try {
        await axios.post("http://localhost:5000/api/health-data", data);
        console.log("✔ Sent\n");
    } catch (err) {
        console.log("❌ Error:", err.message);
    }
}

setInterval(sendData, 5000);