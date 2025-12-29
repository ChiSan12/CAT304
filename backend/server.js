require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json());

// Import Routes
const adopterRoutes = require('./routes/adopters');

// Use Routes
app.use('/api/adopters', adopterRoutes);

const shelterRoutes = require('./routes/shelters');
app.use('/api/shelters', shelterRoutes);

// Initialize the Google GenAI client with the API key from environment variables
const ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });

/**
 * POST /api/chat
 * Handles chat interactions using the Gemini AI model
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    //Call the Gemini API 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
    });


    const text = response.text; 

    // Fallback response if the text is empty
    const finalReply = text || "AI is currently unresponsive.";

    res.json({ reply: finalReply });

  } catch (error) {
    console.error("Gemini Error:", error);
    /// Return a 500 error with details for debugging
    res.status(500).json({ error: error.message || "AI processing failed" });
  }
});

// SYSTEM ROUTES

// Health Check Endpoint - Used to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PET Found Us API is running',
    timestamp: new Date().toISOString()
  });
});

// DATABASE CONNECTION & SERVER START
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Docs: http://localhost:${PORT}/api/health`);
});