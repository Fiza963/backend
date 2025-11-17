import React, { useState, useEffect } from 'react';

import axios from 'axios';
import io from 'socket.io-client';
import Home from './components/Home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ParticipantDashboard from './components/ParticipantDashboard';
import AdminDashboard from './components/AdminDashboard';
import EvaluatorDashboard from './components/EvaluatorDashboard';
import Chat from './components/Chat';
const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState(token ? 'dashboard' : 'home');
  const [mySubmission, setMySubmission] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUserData();
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (user) {
      socket.emit('join', user.id);
      socket.on('receiveMessage', (message) => {
        console.log('New message:', message);
      });
    }
    return () => socket.off('receiveMessage');
  }, [user]);

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
      setActiveView('dashboard');
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const loadMySubmission = async () => {
    try {
      const response = await axios.get(`${API_URL}/submissions/my-team`);
      setMySubmission(response.data);
    } catch (error) {
      console.error('Error loading submission:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleLoginSuccess = (tokenValue, userValue) => {
    setToken(tokenValue);
    localStorage.setItem('token', tokenValue);
    setUser(userValue);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setMySubmission(null);
    setActiveView('home');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Unauthenticated / Home / Login / Register flows
  if (!token || !user) {
    if (activeView === 'register') {
      return (
        <RegisterForm
          onRegisterSuccess={(tkn, usr) => handleLoginSuccess(tkn, usr)}
          switchToLogin={() => setActiveView('login')}
          onHomeClick={() => setActiveView('home')} // <--- ADDED PROP
        />
      );
    }

    if (activeView === 'login') {
      return (
        <LoginForm
          onLoginSuccess={(tkn, usr) => handleLoginSuccess(tkn, usr)}
          switchToRegister={() => setActiveView('register')}
          onHomeClick={() => setActiveView('home')} // <--- ADDED PROP
        />
      );
    }

    // default: Home landing page
    return <Home onLoginClick={() => setActiveView('login')} onRegisterClick={() => setActiveView('register')} />;
  }

  // Authenticated UI
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-white me-3"
              onClick={() => setActiveView('dashboard')}
              style={{ textDecoration: 'none' }}
            >
              Home
            </button>
            <span className="navbar-brand">Automated Content Submission & Evaluation System</span>
          </div>

          <div className="d-flex">
            <span className="text-white me-3">{user.name} ({user.role})</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'evaluator' && <EvaluatorDashboard />}

      {user.role === 'participant' && (
        <>
          <div className="container-fluid">
            <ul className="nav nav-tabs mt-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveView('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'submit' ? 'active' : ''}`}
                  onClick={() => setActiveView('submit')}
                >
                  Submit
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'leaderboard' ? 'active' : ''}`}
                  onClick={() => setActiveView('leaderboard')}
                >
                  Leaderboard
                </button>
              </li>
              <li className="nav-item ms-auto">
                <div className="nav-link p-0">
                  <Chat currentUser={user} />
                </div>
              </li>
            </ul>
          </div>

          {activeView === 'dashboard' && (
            <ParticipantDashboard
              user={user}
              mySubmission={mySubmission}
              setActiveView={setActiveView}
              loadMySubmission={loadMySubmission}
              loadLeaderboard={loadLeaderboard}
              leaderboard={leaderboard}
            />
          )}

          {activeView === 'submit' && (
            <ParticipantDashboard.SubmissionFormView
              mySubmission={mySubmission}
              onSubmitted={() => { loadMySubmission(); setActiveView('dashboard'); }}
            />
          )}

          {activeView === 'leaderboard' && (
            <ParticipantDashboard.LeaderboardView
              leaderboard={leaderboard}
              loadLeaderboard={loadLeaderboard}
            />
          )}

          {activeView === 'evaluations' && mySubmission && (
            <ParticipantDashboard.EvaluationResults submissionId={mySubmission._id} />
          )}
        </>
      )}
    </div>
  );
}

export default App;