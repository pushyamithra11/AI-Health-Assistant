




import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  
  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
  const payload = isLogin 
    ? { username: formData.username, password: formData.password }
    : { username: formData.username, email: formData.email, password: formData.password };

  try {
    const response = await axios.post(`http://43.205.211.121:8000${endpoint}`, payload);
    
    if (isLogin) {
      // 1. SAVE THE JWT TOKEN
      localStorage.setItem("token", response.data.access_token); 
      localStorage.setItem("username", response.data.user.username);
      onLoginSuccess(response.data.user.username);
    } else {
      alert("Account created! Please log in.");
      toggleMode();
    }
  } catch (err) {
    setError(err.response?.data?.detail || "Authentication failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white border border-gray-300 w-full max-w-[350px] p-10 flex flex-col items-center shadow-sm">
        <h1 className="text-4xl font-serif italic mb-8 mt-2 select-none">SmartHealth</h1>
        
        <form onSubmit={handleSubmit} className="w-full space-y-2">
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              className="w-full bg-[#fafafa] border border-gray-300 rounded-sm px-2 py-2 text-xs focus:border-gray-400 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            className="w-full bg-[#fafafa] border border-gray-300 rounded-sm px-2 py-2 text-xs focus:border-gray-400 outline-none transition-all"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            className="w-full bg-[#fafafa] border border-gray-300 rounded-sm px-2 py-2 text-xs focus:border-gray-400 outline-none transition-all"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-1.5 rounded-lg text-sm transition-all mt-4 active:scale-95 ${loading ? 'bg-blue-300' : 'bg-[#0095f6] hover:bg-[#1877f2]'}`}
          >
            {loading ? "Logging in..." : (isLogin ? "Log in" : "Sign up")}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs mt-6 text-center font-semibold uppercase tracking-tighter">{error}</p>}
      </div>

      <div className="bg-white border border-gray-300 w-full max-w-[350px] p-6 mt-3 text-center shadow-sm">
        <p className="text-sm">
          {isLogin ? "Don't have an account?" : "Have an account?"}{" "}
          <button onClick={toggleMode} className="text-[#0095f6] font-bold">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;