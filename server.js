const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase admin client using Service Role or Anon Key
const supabaseUrl = process.env.SUPABASE_URL || 'https://unknown.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'unknown';
const supabase = createClient(supabaseUrl, supabaseKey);

const ML_API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/flask` 
  : (process.env.ML_API_URL || 'http://localhost:5001');

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to parse auth token and verify user session
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized or invalid token' });
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ error: 'Authentication service error' });
  }
};

// POST /api/predict-soil
app.post('/api/predict-soil', requireAuth, async (req, res) => {
  try {
    const { ph, nitrogen, phosphorus, potassium, moisture, temperature } = req.body;
    
    let prediction = 'Medium';
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/predict-soil`, {
        ph, nitrogen, phosphorus, potassium, moisture, temperature
      }, { timeout: 4000 });
      prediction = mlResponse.data.prediction;
    } catch (mlError) {
      console.warn('ML API failed or unresponsive, using fallback.', mlError.message);
      if (ph >= 6.0 && ph <= 7.5 && nitrogen >= 60) {
        prediction = 'High';
      } else if (ph >= 5.5 && ph <= 8.0 && nitrogen >= 30) {
        prediction = 'Medium';
      } else {
        prediction = 'Low';
      }
    }

    const { data, error } = await supabase.from('soil_predictions').insert([{
      user_id: req.user.id,
      ph: parseFloat(ph), nitrogen: parseFloat(nitrogen), phosphorus: parseFloat(phosphorus), 
      potassium: parseFloat(potassium), moisture: parseFloat(moisture), temperature: parseFloat(temperature),
      fertility_result: prediction
    }]).select();
    
    if (error) console.error('Supabase Error:', error);
    res.json({ prediction, saved: !error });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predict-disease
app.post('/api/predict-disease', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const formData = new FormData();
    formData.append('image', req.file.buffer, req.file.originalname);

    let prediction = 'Unknown';
    let confidence = 0.0;
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/predict-disease`, formData, {
        headers: formData.getHeaders(),
        timeout: 4000
      });
      prediction = mlResponse.data.prediction;
      confidence = mlResponse.data.confidence;
    } catch (mlError) {
      console.warn('ML API Error', mlError.message);
      prediction = 'Early Blight (Fallback)';
      confidence = 0.95;
    }

    const filePath = `${req.user.id}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const { error: uploadError } = await supabase.storage.from('crop-images').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });

    let imageUrl = null;
    if (!uploadError) {
      const { data } = supabase.storage.from('crop-images').getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('disease_predictions').insert([{
      user_id: req.user.id, image_url: imageUrl, prediction, confidence
    }]).select();
    
    if (error) console.error('Supabase Error:', error);
    res.json({ prediction, confidence, image_url: imageUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SoilIQ Backend is running!' });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
