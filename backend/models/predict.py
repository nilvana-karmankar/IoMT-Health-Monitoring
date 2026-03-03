import sys
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Try to load saved objects, fallback to basic logic if missing
try:
    model = joblib.load(os.path.join(BASE_DIR, "health_condition_model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
    gender_encoder = joblib.load(os.path.join(BASE_DIR, "gender_encoder.pkl"))
    condition_encoder = joblib.load(os.path.join(BASE_DIR, "condition_encoder.pkl"))
    USE_ML = True
except FileNotFoundError:
    USE_ML = False

# Read input
raw = sys.argv[1].split(",")

if USE_ML:
    # Extract gender as string
    gender_str = raw[7]

    # Convert gender using encoder
    gender_val = gender_encoder.transform([gender_str])[0]

    # Replace gender string with encoded number
    raw[7] = str(gender_val)

    # Convert all to float
    values = [float(x) for x in raw]

    # Scale
    scaled = scaler.transform([values])

    # Predict
    pred = model.predict(scaled)[0]

    # Decode label
    final_label = condition_encoder.inverse_transform([pred])[0]
else:
    # Fallback heuristic if ML models are missing
    hr = float(raw[0])
    spo2 = float(raw[3])
    temp = float(raw[2])
    
    if spo2 < 90 or hr > 120 or hr < 50:
        final_label = "Emergency"
    elif temp > 38.0:
        final_label = "Fever"
    elif hr > 100:
        final_label = "Tachycardia"
    elif hr < 60:
        final_label = "Bradycardia"
    elif spo2 < 95:
        final_label = "LowSpO2"
    else:
        final_label = "Normal"

print(final_label)
