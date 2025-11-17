const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'evaluated' })
      .populate({
        path: 'team',
        populate: { path: 'teamLead' }
      });

    const leaderboard = await Promise.all(submissions.map(async (submission) => {
      const evaluations = await Evaluation.find({ submission: submission._id });
      const avgScore = evaluations.length > 0 
        ? (evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(2)
        : 0;
      
      return {
        team: submission.team,
        topic: submission.topic,
        avgScore,
        evaluations
      };
    }));

    leaderboard.sort((a, b) => b.avgScore - a.avgScore);
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;