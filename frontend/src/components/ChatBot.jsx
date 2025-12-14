import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle chat window
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. How can I help you find your new best friend today? 🐶🐱", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Handle Send Message
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1. Show user message immediately
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 2. Send request to Backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      // 3. Show Bot response
      const botMessage = { text: data.reply || "AI is silent...", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { text: "Connection failed. Is the backend server running?", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline Styles
  const styles = {
    floatingButton: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #FF8C42 0%, #FFA726 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      fontSize: '30px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(255, 140, 0, 0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease',
    },
    chatWindow: {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      border: '1px solid #FFE5CC',
    },
    header: {
      background: 'linear-gradient(135deg, #FF8C42 0%, #FFA726 100%)',
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
      backgroundColor: '#FFF4E6',
    },
    inputArea: {
      padding: '10px',
      borderTop: '1px solid #FFCC80',
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
      backgroundColor: '#FF8C42',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    messageBubble: (sender) => ({
      maxWidth: '80%',
      padding: '10px 15px',
      borderRadius: '15px',
      marginBottom: '10px',
      alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
      backgroundColor: sender === 'user' ? '#FF8C42' : 'white',
      color: sender === 'user' ? 'white' : '#333',
      border: sender === 'bot' ? '1px solid #FFCC80' : 'none',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }),
    messageRow: (sender) => ({
      display: 'flex',
      justifyContent: sender === 'user' ? 'flex-end' : 'flex-start',
    })
  };

  return (
    <>
      {/* 1. Floating Button */}
      <button style={styles.floatingButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 2. Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <span>🐾 AI Assistant</span>
            <span style={{cursor:'pointer', fontSize: '20px'}} onClick={() => setIsOpen(false)}>−</span>
          </div>

          <div style={styles.messagesArea}>
            {messages.map((msg, index) => (
              <div key={index} style={styles.messageRow(msg.sender)}>
                <div style={styles.messageBubble(msg.sender)}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div style={{color: '#999', fontSize: '12px', marginLeft: '10px'}}>AI is thinking... 🤔</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about adoption..."
            />
            <button style={styles.sendButton} onClick={handleSend} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;