const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/authmiddleware');
const User = require('../models/User');
const Submission = require('../models/Submission');

// @route   GET /api/admin/pending-evaluators
// @desc    Get pending evaluators
// @access  Private (Admin only)
router.get('/pending-evaluators', authMiddleware, adminOnly, async (req, res) => {
  try {
    const evaluators = await User.find({ role: 'evaluator', approved: false });
    res.json(evaluators);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/admin/approved-evaluators
// @desc    Get approved evaluators
// @access  Private (Admin only)
router.get('/approved-evaluators', authMiddleware, adminOnly, async (req, res) => {
  try {
    const evaluators = await User.find({ role: 'evaluator', approved: true });
    res.json(evaluators);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/admin/approve-evaluator/:userId
// @desc    Approve evaluator
// @access  Private (Admin only)
router.post('/approve-evaluator/:userId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== 'evaluator') {
      return res.status(404).json({ error: 'Evaluator not found' });
    }

    user.approved = true;
    await user.save();

    res.json({ message: 'Evaluator approved successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalEvaluators = await User.countDocuments({ role: 'evaluator', approved: true });
    const pendingEvaluators = await User.countDocuments({ role: 'evaluator', approved: false });
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    const underReview = await Submission.countDocuments({ status: 'under_review' });
    const evaluated = await Submission.countDocuments({ status: 'evaluated' });

    res.json({
      totalEvaluators,
      pendingEvaluators,
      totalSubmissions,
      pendingSubmissions,
      underReview,
      evaluated
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;