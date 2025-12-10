import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false); // 控制窗口打开/关闭
  const [messages, setMessages] = useState([
    { text: "你好！我是你的 AI 助手，有什么可以帮你的吗？🐶🐱", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 自动滚动到底部
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 发送消息的函数
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1.先把用户的消息显示出来
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 2. 发送请求给你的后端 (Server)
      // 注意：这里用的是你刚才测试成功的那个后端地址
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      // 3. 把 AI 的回复显示出来
      const botMessage = { text: data.reply || "AI 暂时没反应...", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { text: "⚠️ 连接服务器失败，请检查后端是否开启。", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 简单的样式 (为了方便，直接写在 JS 里)
  const styles = {
    floatingButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#4A90E2',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      fontSize: '30px',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chatWindow: {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: '#4A90E2',
      color: 'white',
      padding: '15px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    messagesArea: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',
    },
    inputArea: {
      padding: '10px',
      borderTop: '1px solid #ddd',
      display: 'flex',
      backgroundColor: 'white',
    },
    input: {
      flex: 1,
      padding: '10px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      outline: 'none',
    },
    sendButton: {
      marginLeft: '10px',
      padding: '10px 20px',
      backgroundColor: '#4A90E2',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
    },
    messageBubble: (sender) => ({
      maxWidth: '80%',
      padding: '10px 15px',
      borderRadius: '15px',
      marginBottom: '10px',
      alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
      backgroundColor: sender === 'user' ? '#4A90E2' : 'white',
      color: sender === 'user' ? 'white' : '#333',
      border: sender === 'bot' ? '1px solid #ddd' : 'none',
    }),
    messageRow: (sender) => ({
      display: 'flex',
      justifyContent: sender === 'user' ? 'flex-end' : 'flex-start',
    })
  };

  return (
    <>
      {/* 1. 悬浮按钮 (点击打开/关闭) */}
      <button style={styles.floatingButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 2. 聊天窗口 (只有 isOpen 为 true 时显示) */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span>🐾 PET Found Us Assistant</span>
            <span style={{cursor:'pointer'}} onClick={() => setIsOpen(false)}>−</span>
          </div>

          <div style={styles.messagesArea}>
            {messages.map((msg, index) => (
              <div key={index} style={styles.messageRow(msg.sender)}>
                <div style={styles.messageBubble(msg.sender)}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div style={{color: '#999', fontSize: '12px', marginLeft: '10px'}}>AI 正在思考... 🤔</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="问我关于领养的问题..."
            />
            <button style={styles.sendButton} onClick={handleSend} disabled={isLoading}>
              发送
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;