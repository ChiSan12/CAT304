import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page Component
 * Handles user authentication via email and password.
 * * Props:
 * - onLoginSuccess: Callback function to execute after successful login (usually redirects to Home).
 * - onSwitchToRegister: Callback function to switch the view to the Registration page.
 */
const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState(''); // Reverted back to email
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Access login function from AuthContext

  // Handle form submission
  const handleSubmit = async (e) => { 
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      // 1. Call the backend API
      const response = await fetch('http://localhost:5000/api/adopters/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Sending email
      });

      const data = await response.json();

      if (data.success) {
        // 2. Success Scenario
        alert("Login successful! Welcome back! 🎉");
        
        // 3. Merge adopter details with ID for easier access
        // Structure: { adopter: {...}, adopterId: "..." }
        const userData = { ...data.adopter, id: data.adopterId };
        
        // 4. Update Global Auth State
        login(userData); 
        
        // 5. Navigate to Home Page
        onLoginSuccess(); 
      } else {
        // Failure Scenario (e.g., Wrong password, User not found)
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Network error. Is the backend server running?");
    }
  };

  // Inline styles for the component
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      width: '300px',
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    },
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '16px'
    },
    button: {
      padding: '12px',
      backgroundColor: '#ff914d', // Brand Orange
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      marginTop: '10px'
    },
    footerText: {
      marginTop: '15px',
      fontSize: '14px',
      color: '#666'
    },
    link: {
      color: '#ff914d',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginLeft: '5px',
      textDecoration: 'underline'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: '#ff914d', marginBottom: '20px'}}>Sign In</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Email Input */}
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        
        {/* Password Input */}
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        
        <button type="submit" style={styles.button}>Login</button>

        {/* Register Link */}
        <div style={styles.footerText}>
          Don't have an account? 
          <span 
            style={styles.link} 
            onClick={onSwitchToRegister} // Switch to Registration Page
          >
            Sign Up
          </span>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;