require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const adopterRoutes = require('./routes/adopters');

// Use Routes
app.use('/api/adopters', adopterRoutes);

// 【改动 2】初始化新的 AI 客户端
// 注意：新版 SDK 如果检测到环境变量有 GEMINI_API_KEY，其实甚至不需要传参，但为了保险我们显式传入
const ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 调用新版 SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
    });

    // 【修正点】这里不要加括号！
    const text = response.text; 

    // 如果 text 是空的（为了防止意外），给个默认回复
    const finalReply = text || "AI 暂时没有回应";

    res.json({ reply: finalReply });

  } catch (error) {
    console.error("Gemini Error:", error);
    // 把具体的错误打出来，方便调试
    res.status(500).json({ error: error.message || "AI 思考失败" });
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PET Found Us API is running',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
});