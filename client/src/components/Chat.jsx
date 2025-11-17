import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
let socket = null;

export default function Chat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // Initialize socket connection
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log(' Socket connected');
      setConnected(true);
      socket.emit('joinChat', currentUser._id);
      loadMessages();
    });

    socket.on('disconnect', () => {
      console.log(' Socket disconnected');
      setConnected(false);
    });

    socket.on('newMessage', (message) => {
      console.log(' New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages`);
      console.log(' Loaded messages:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !connected) {
      console.log('Cannot send: empty message or not connected');
      return;
    }

    const messageData = {
      senderId: currentUser._id,
      message: newMessage.trim()
    };

    console.log(' Sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Button */}
      <div
        className="position-fixed"
        style={{
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
      >
        <button
          className={`btn btn-${connected ? 'primary' : 'secondary'} rounded-circle shadow-lg`}
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          💬
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="position-fixed card shadow-lg"
          style={{
            bottom: '90px',
            right: '20px',
            width: '380px',
            height: '550px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0"> Support Chat 💬</h6>
                <small style={{fontSize: '0.7rem'}}>
                  {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </small>
              </div>
              <button
                className="btn btn-sm text-white"
                onClick={() => setIsOpen(false)}
                style={{fontSize: '1.5rem', lineHeight: 1}}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-grow-1 p-3 overflow-auto"
            style={{backgroundColor: '#f5f5f5'}}
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <div style={{fontSize: '3rem'}}>👋</div>
                <p>No messages yet</p>
                <p className="small">Start a conversation with support!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === currentUser.id;
                  const isAdmin = msg.sender?.role === 'admin';

                  return (
                    <div
                      key={msg._id || idx}
                      className={`mb-3 d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className={`p-2 rounded ${
                          isOwn
                            ? 'bg-primary text-white'
                            : isAdmin
                            ? 'bg-success text-white'
                            : 'bg-white'
                        }`}
                        style={{maxWidth: '75%'}}
                      >
                        {!isOwn && (
                          <div className="small fw-bold mb-1">
                            {isAdmin ? ' Admin' : msg.sender?.name}
                          </div>
                        )}
                        <div>{msg.message}</div>
                        <div
                          className={`small ${isOwn || isAdmin ? 'text-white-50' : 'text-muted'}`}
                          style={{fontSize: '0.7rem'}}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="card-footer bg-white">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!connected}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!newMessage.trim() || !connected}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}