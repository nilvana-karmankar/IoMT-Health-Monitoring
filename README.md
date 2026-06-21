# IoT Health Project (IoMT)

## Project Overview
This project is an Internet of Medical Things (IoMT) system that simulates health sensor data, processes it through a backend API, stores it in a database, and uses Machine Learning for condition prediction. Finally, it displays the data on a frontend health dashboard.

## Implementation Details

The project consists of three main components:

### 1. Backend (Node.js/Express)
- Provides REST APIs to receive sensor data and retrieve the latest records.
- Connects to a MongoDB database to store health metrics.
- Integrates with a Python Machine Learning script (`predict.py`) to analyze incoming metrics (Heart Rate, Respiratory Rate, Temperature, SpO2, Blood Pressure, etc.) and predict the patient's condition.

### 2. Frontend (React)
- A dashboard that visualizes real-time health data from the backend.
- Displays metrics in a user-friendly interface.
- Shows real-time ML-predicted health conditions based on user input or simulated data.

### 3. Sensor Simulator (Node.js)
- Simulates real-time IoT medical sensor data.
- Generates mock patient readings (Heart Rate, Temperature, SpO2, etc.) and periodically sends POST requests to the backend API.

## Setup and Installation

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your `PORT` and `MONGO_URI`.
4. Run the server: `npm start` or `node server.js`.
5. Note: Python must be installed to run the ML prediction script.

### Frontend
1. Navigate to the `frontend/health-dashboard` directory.
2. Install dependencies: `npm install`.
3. Start the dashboard: `npm start`.

### Sensor Simulator
1. Navigate to the `sensor-simulator` directory.
2. Install dependencies: `npm install`.
3. Start the simulator: `node simulate.js`.

## Technologies Used
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Machine Learning**: Python
- **Simulation**: Node.js scripts
