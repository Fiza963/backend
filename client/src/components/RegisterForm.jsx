import React, { useState } from 'react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

const RegisterForm = ({ onRegisterSuccess, switchToLogin, onHomeClick }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'participant', teamName: '', phone: '', address: '', qualification: '', experience: ''
  });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      onRegisterSuccess(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Register</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="participant">Participant</option>
              <option value="evaluator">Evaluator</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          {formData.role === 'participant' && (
            <div className="mb-3">
              <label className="form-label">Team Name (if team lead)</label>
              <input type="text" className="form-control" value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} />
              <small className="text-muted">Maximum 5 members per team</small>
            </div>
          )}

          {formData.role === 'evaluator' && (
            <>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" />
              </div>
              <div className="mb-3">
                <label className="form-label">Qualification</label>
                <input type="text" className="form-control" value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Experience</label>
                <textarea className="form-control" value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })} rows="2" />
              </div>
            </>
          )}

          <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>Register</button>
          <div className="text-center">
            <button className="btn btn-link" onClick={switchToLogin}>Already have an account? Login</button>
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

export default RegisterForm;