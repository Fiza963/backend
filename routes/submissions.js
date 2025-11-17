const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authmiddleware');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Helper function to get 3 random evaluators
const getRandomEvaluators = async () => {
  try {
    // Get all approved evaluators
    const evaluators = await User.find({ 
      role: 'evaluator', 
      approved: true 
    });

    if (evaluators.length < 3) {
      return null; // Not enough evaluators
    }

    // Shuffle and pick 3
    const shuffled = evaluators.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(e => e._id);
  } catch (error) {
    console.error('Error getting random evaluators:', error);
    return null;
  }
};

// @route   GET /api/submissions
// @desc    Get all submissions (Admin/Evaluator)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate({
        path: 'team',
        populate: { path: 'teamLead members' }
      })
      .populate('assignedEvaluators', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/submissions/my-assignments
// @desc    Get evaluator's assigned submissions
// @access  Private (Evaluator)
router.get('/my-assignments', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'evaluator') {
      return res.status(403).json({ error: 'Only evaluators can access this' });
    }

    const submissions = await Submission.find({
      assignedEvaluators: req.user._id
    })
      .populate({
        path: 'team',
        populate: { path: 'teamLead members' }
      });
    
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/submissions/my-team
// @desc    Get team's submission
// @access  Private
router.get('/my-team', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.teamId) {
      return res.status(404).json({ error: 'No team found' });
    }
    
    const submission = await Submission.findOne({ team: user.teamId })
      .populate({
        path: 'team',
        populate: { path: 'teamLead members' }
      });
    res.json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/submissions
// @desc    Create or update submission with AUTOMATIC evaluator assignment
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { videoLink, topic, learningOutcomes, description } = req.body;
    const user = await User.findById(req.user._id).populate('teamId');
    
    if (!user.teamId) {
      return res.status(400).json({ error: 'You must be part of a team' });
    }

    const existingSubmission = await Submission.findOne({ team: user.teamId._id });
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.videoLink = videoLink;
      existingSubmission.topic = topic;
      existingSubmission.learningOutcomes = learningOutcomes;
      existingSubmission.description = description;
      existingSubmission.updatedAt = Date.now();
      await existingSubmission.save();
      return res.json({ message: 'Submission updated', submission: existingSubmission });
    }

    // ✨ AUTOMATIC EVALUATOR ASSIGNMENT
    const evaluatorIds = await getRandomEvaluators();
    
    if (!evaluatorIds) {
      return res.status(400).json({ 
        error: 'Not enough approved evaluators available. Please wait for admin to approve more evaluators.' 
      });
    }

    // Create new submission with auto-assigned evaluators
    const submission = new Submission({
      team: user.teamId._id,
      videoLink,
      topic,
      learningOutcomes,
      description,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedEvaluators: evaluatorIds,
      status: 'under_review' // Automatically set to under_review
    });

    await submission.save();
    
    // Populate evaluators for response
    await submission.populate('assignedEvaluators', 'name email');

    res.status(201).json({ 
      message: 'Submission created and evaluators automatically assigned!', 
      submission,
      assignedEvaluators: submission.assignedEvaluators.map(e => e.name)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;