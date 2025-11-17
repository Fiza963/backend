const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authmiddleware');
const ChatMessage = require('../models/ChatMessage');

// @route   GET /api/chat/messages
// @desc    Get all chat messages
// @access  Private
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;