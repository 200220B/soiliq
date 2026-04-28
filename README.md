# 🌱 SoilIQ — Soil Intelligence & Crop Health Prediction System

> Final Year Project | AI-powered Soil Fertility & Crop Disease Detection

---

## 📁 Project Structure

```
project/
├── index.html              ← Main frontend (React CDN + Tailwind)
├── app.js                  ← Root React component + routing
├── server.js               ← Node.js Express backend
├── flask_api.py            ← Python Flask ML API server
├── ml_model.py             ← Train soil Random Forest model
├── disease_model.py        ← Train crop disease CNN model
├── package.json            ← Node dependencies
├── requirements.txt        ← Python dependencies
├── supabase_schema.sql     ← Database setup SQL
├── .env.example            ← Environment variable template
│
├── config/
│   └── supabase.js         ← Supabase client config
│
├── routes/
│   └── predict.js          ← Express route handlers
│
├── frontend/
│   ├── auth.js             ← Login & Signup pages
│   └── dashboard.js        ← Dashboard, Soil, Disease, History pages
│
└── models/                 ← (auto-created after training)
    ├── soil_model.pkl
    └── disease_model.h5
```

---

## 🚀 Setup Instructions

### STEP 1 — Supabase Setup

1. Go to https://supabase.com → Create New Project
2. Copy your **Project URL** and **Anon Key** (Settings → API)
3. Copy your **Service Role Key** (Settings → API → service_role)
4. Open **SQL Editor** → paste contents of `supabase_schema.sql` → Run
5. Go to **Storage** → Create bucket `crop-images` → Set to Public

---

### STEP 2 — Configure Supabase in Frontend

Open `config/supabase.js` and replace:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

---

### STEP 3 — Setup Backend (Node.js)

```bash
cd project
npm install
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

Start backend:
```bash
node server.js
```
✅ Backend runs on: http://localhost:3001

---

### STEP 4 — Setup Python ML API

Install dependencies:
```bash
pip install -r requirements.txt
```

Train the soil prediction model (Random Forest):
```bash
python ml_model.py
```

Train the disease detection model (CNN):
```bash
python disease_model.py
```

Start Flask API:
```bash
python flask_api.py
```
✅ ML API runs on: http://localhost:5001

---

### STEP 5 — Run Frontend

Simply open `index.html` in your browser:
```
Double-click index.html  OR
Open with VS Code Live Server
```

✅ Frontend runs in browser — No build tools needed!

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /predict-soil | Predict soil fertility |
| POST | /predict-disease | Detect crop disease |
| GET | /history | Get user prediction history |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (CDN), Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js |
| ML - Soil | Python, Flask, Scikit-learn (Random Forest) |
| ML - Disease | Python, TensorFlow/Keras (MobileNetV2 CNN) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |

---

## ✅ Features Checklist

- [x] Email/Password Authentication (Signup & Login)
- [x] Session Management (Supabase Auth)
- [x] Soil Fertility Prediction (pH, N, P, K, Moisture, Temp)
- [x] Crop Disease Detection (Image Upload → CNN)
- [x] Image Storage (Supabase Storage)
- [x] Smart Fertilizer Recommendations
- [x] Dashboard with Charts (Pie + Bar)
- [x] Prediction History (user-specific, RLS protected)
- [x] Input Validation (frontend + backend)
- [x] Fallback predictions when ML server is offline
- [x] Row Level Security — users see only their own data

---

## 📝 Notes for Viva / Presentation

- The system uses **Random Forest** for soil classification — a proven ensemble ML method
- Disease detection uses **MobileNetV2** (Transfer Learning on ImageNet weights)
- All data is **user-isolated** using Supabase RLS (Row Level Security)
- The backend has a **smart fallback** if the Python ML server is down
- Charts use **Chart.js** for real-time visual analytics

---

*Built with 💚 using React, Node.js, Python Flask, and Supabase*
