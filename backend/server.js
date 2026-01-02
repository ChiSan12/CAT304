require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");
const ChatHistory = require('./models/chatHistory');


const app = express();



// Middleware
app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const adopterRoutes = require('./routes/adopters');
app.use('/api/adopters', adopterRoutes);

const shelterRoutes = require('./routes/shelters');
app.use('/api/shelters', shelterRoutes);

const reportRouter = require('./routes/reports');
app.use('/api/reports', reportRouter); // only mount once

const careReminderRoutes = require('./routes/careReminder');
app.use('/api/reminders', careReminderRoutes);

const petUpdateRoutes = require('./routes/petUpdates');
app.use('/api/pet-updates', petUpdateRoutes);

const vetClinicRoutes = require('./routes/vetClinics');
app.use('/api/vet-clinics', vetClinicRoutes);

// Google GenAI setup
const ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    // Extract user message and authenticated user ID from request body
    const { message, userId, sessionId  } = req.body;

    // Basic request validation
    // Both message content and user identity are required
    if (!message || (!userId && !sessionId)) {
      return res.status(400).json({ error: "Message and user identification are required" });
    }

    // Retrieve chat history by user or session
    let history;

    if (typeof userId === 'string' && userId !== 'undefined' && userId.trim() !== '') {
      history = await ChatHistory.findOne({ userId });
    } else if (typeof sessionId === 'string' && sessionId.trim() !== '') {
      history = await ChatHistory.findOne({ sessionId });
    } else {
      return res.status(400).json({
        error: 'No valid userId or sessionId provided'
      });
    }

    // Create new history if not found
    if (!history) {
      history = new ChatHistory({
        userId: userId ? userId : null,
        sessionId: userId ? null : sessionId,
        messages: []
      });
    }

    const SYSTEM_PROMPT = `
    You are the official virtual assistant for "PET Found Us", a pet rescue and rehoming platform.

    Your role is to guide users in using the platform, explain features clearly, and promote responsible pet adoption.

    Platform overview:
    - PET Found Us connects shelters, adopters, and the community.
    - Users can browse available pets, submit adoption requests, and track request status.
    - Shelters manage pets and adoption requests.
    - Smart Pet Matching recommends pets based on adopter preferences.

    Key features you may guide users on:
    - Browse Pets
    - Pet Details
    - Smart Pet Matching
    - Adoption Requests
    - Profile Page
    - Dashboard
    - Reporting stray animals

    Rules:
    - Always relate answers to PET Found Us features
    - Do not mention code, APIs, databases, or implementation details
    - Encourage users to complete their profile
    - Be friendly and supportive
    `;

    
    // Combine previous conversation history with the new user message
    // This context is provided to the AI model to generate coherent responses
    const contents = [
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    },
    ...history.messages.map(m => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

    // Generate AI response using the Gemini model with conversational context
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    });

    // Extract AI-generated text response
    const reply = response.text || "AI is currently unresponsive.";

    // Append the latest user message and AI response to conversation memory
    history.messages.push(
      { role: "user", content: message },
      { role: "model", content: reply }
    );

    // Retain only the most recent 20 messages to control memory size
    // and reduce unnecessary context length
    history.messages = history.messages.slice(-20);

    // Persist updated conversation history to the database
    await history.save();

    // Return AI response to the frontend
    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "AI processing failed" });
  }
});

    const aiRoutes = require('./routes/ai');
    app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PET Found Us API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/chat/history', async (req, res) => {
  const { userId, sessionId } = req.query;

  let history = null;

  if (typeof userId === 'string' && userId !== 'undefined' && userId.trim() !== '') {
    history = await ChatHistory.findOne({ userId });
  } else if (typeof sessionId === 'string' && sessionId.trim() !== '') {
    history = await ChatHistory.findOne({ sessionId });
  }

  res.json({
    messages: history?.messages || []
  });
});

// DB & server
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected Successfully!"))
//   .catch((err) => console.log("MongoDB Connection Error:", err));
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'test'
})
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    console.log("Connected DB:", mongoose.connection.name);
  })
  .catch((err) => console.log("MongoDB Connection Error:", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API Docs: http://localhost:${PORT}/api/health`);
});
