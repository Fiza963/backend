import React, { useState } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
const LoginForm = ({ onLoginSuccess, switchToRegister, onHomeClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      onLoginSuccess(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Login</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>
          <div className="text-center">
            <button className="btn btn-link" onClick={switchToRegister}>Don't have an account? Register</button>
          </div>
          
          {/* Back to Home Link */}
          <div className="text-center mt-3">
            <a 
              href="#!" 
              onClick={onHomeClick} 
              className="btn btn-link text-decoration-none text-muted"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;