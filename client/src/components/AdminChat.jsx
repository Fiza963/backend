import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let socket = null;

export default function AdminChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Initialize socket
    socket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ Admin socket connected');
      setConnected(true);
      socket.emit('joinChat', currentUser._id);
      loadMessages();
    });

    socket.on('disconnect', () => {
      console.log('❌ Admin socket disconnected');
      setConnected(false);
    });

    socket.on('newMessage', (message) => {
      console.log('📨 Admin received message:', message);
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages`);
      console.log('📥 Admin loaded messages:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !connected) return;

    const messageData = {
      senderId: currentUser._id,
      message: newMessage.trim()
    };

    console.log('📤 Admin sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  // Group messages by user
  const groupedByUser = messages.reduce((acc, msg) => {
    const userId = msg.sender?._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: msg.sender,
        messages: []
      };
    }
    acc[userId].messages.push(msg);
    return acc;
  }, {});

  const conversations = Object.values(groupedByUser);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">💬 Support Chat</h2>
        <div>
          <span className={`badge ${connected ? 'bg-success' : 'bg-danger'} me-2`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <button className="btn btn-primary btn-sm" onClick={loadMessages}>
             Refresh
          </button>
        </div>
      </div>

      <div className="row">
        {/* Conversations List */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">Conversations ({conversations.length})</h6>
            </div>
            <div className="card-body p-0">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {conversations.map((conv, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{conv.user?.name || 'Unknown'}</strong>
                          <br />
                          <small className="text-muted">{conv.user?.email}</small>
                        </div>
                        <span className="badge bg-primary">{conv.messages.length}</span>
                      </div>
                      <small className="text-muted">
                        {conv.user?.role}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-8">
          <div className="card" style={{height: '600px', display: 'flex', flexDirection: 'column'}}>
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">💬 All Messages</h6>
            </div>
            
            {/* Messages */}
            <div className="card-body overflow-auto flex-grow-1" style={{backgroundColor: '#f5f5f5'}}>
              {messages.length === 0 ? (
                <div className="text-center text-muted mt-5">
                  <div style={{fontSize: '3rem'}}>💬</div>
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.sender?.role === 'admin';
                  return (
                    <div
                      key={msg._id || idx}
                      className={`mb-3 d-flex ${isAdmin ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`p-2 rounded ${
                          isAdmin ? 'bg-success text-white' : 'bg-white border'
                        }`}
                        style={{maxWidth: '75%'}}
                      >
                        <div className="small fw-bold mb-1">
                          {msg.sender?.name} ({msg.sender?.role})
                        </div>
                        <div>{msg.message}</div>
                        <div className={`small ${isAdmin ? 'text-white-50' : 'text-muted'}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="card-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Reply to all users..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={!connected}
                />
                <button
                  className="btn btn-success"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !connected}
                >
                  Send as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}