require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const adopterRoutes = require('./routes/adopters');
app.use('/api/adopters', adopterRoutes);

const shelterRoutes = require('./routes/shelters');
app.use('/api/shelters', shelterRoutes);

const reportRouter = require('./routes/reports');
app.use('/api/reports', reportRouter); // only mount once

// Google GenAI setup
const ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    const text = response.text;
    res.json({ reply: text || "AI is currently unresponsive." });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "AI processing failed" });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PET Found Us API is running',
    timestamp: new Date().toISOString()
  });
});

// DB & server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Docs: http://localhost:${PORT}/api/health`);
});
