const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authmiddleware');
const Team = require('../models/Team');
const User = require('../models/User');

// @route   POST /api/teams/add-member
// @desc    Add member to team
// @access  Private
router.post('/add-member', authMiddleware, async (req, res) => {
  try {
    const { memberEmail } = req.body;
    const team = await Team.findOne({ teamLead: req.user._id });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.members.length >= 5) {
      return res.status(400).json({ error: 'Team is full (maximum 5 members)' });
    }

    const member = await User.findOne({ email: memberEmail });
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (member.teamId) {
      return res.status(400).json({ error: 'User already in a team' });
    }

    team.members.push(member._id);
    await team.save();

    member.teamId = team._id;
    await member.save();

    res.json({ message: 'Member added successfully', team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;