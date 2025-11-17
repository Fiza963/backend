const express = require('express');
const router = express.Router();
const { authMiddleware, evaluatorOnly } = require('../middleware/authmiddleware');
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');

// @route   POST /api/evaluations
// @desc    Submit evaluation
// @access  Private (Evaluator only)
router.post('/', authMiddleware, evaluatorOnly, async (req, res) => {
  try {
    const { submissionId, criteria, comments } = req.body;
    const totalScore = Object.values(criteria).reduce((sum, val) => sum + val, 0);

    const evaluation = new Evaluation({
      submission: submissionId,
      evaluator: req.user._id,
      criteria,
      totalScore,
      comments
    });

    await evaluation.save();

    // Check if all 3 evaluations are complete
    const evaluations = await Evaluation.find({ submission: submissionId });
    if (evaluations.length >= 3) {
      const submission = await Submission.findById(submissionId);
      submission.status = 'evaluated';
      await submission.save();
    }

    res.status(201).json({ message: 'Evaluation submitted', evaluation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/evaluations/submission/:submissionId
// @desc    Get evaluations for submission
// @access  Private
router.get('/submission/:submissionId', authMiddleware, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ submission: req.params.submissionId })
      .populate('evaluator', 'name email');
    res.json(evaluations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;