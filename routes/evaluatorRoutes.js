// backend/routes/evaluatorRoutes.js - COMPLETE FIXED VERSION
const express = require("express");
const router = express.Router();
const { protect, evaluator } = require("../middleware/authmiddleware");
const EvaluatorAssignment = require("../models/EvaluatorAssignment");

//  Get all assignments for the logged-in evaluator
router.get("/assignments", protect, evaluator, async (req, res) => {
  try {
    console.log(" Fetching assignments for evaluator:", req.user._id);

    const assignments = await EvaluatorAssignment.find({
      evaluator: req.user._id,
    })
      .populate({
        path: "submissionId",
        populate: {
          path: "teamId",
          select: "username email"
        }
      })
      .lean(); // Convert to plain JavaScript objects

    console.log(`✔ Found ${assignments.length} assignment(s)`);
    
    // Debug: Log the structure of assignments
    if (assignments.length > 0) {
      console.log(" Assignment structure:", JSON.stringify(assignments[0], null, 2));
    }

    res.json(assignments);
  } catch (err) {
    console.error(" Error fetching assignments:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ 
      message: "Server error loading assignments",
      error: err.message 
    });
  }
});

//  Grade submission route
router.put("/assignments/:id/grade", protect, evaluator, async (req, res) => {
  try {
    const { technicalScore, comment } = req.body;
    
    console.log("🔍 Grading assignment:", req.params.id);

    const assignment = await EvaluatorAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify this assignment belongs to the logged-in evaluator
    if (assignment.evaluator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to grade this assignment" });
    }

    // Update assignment with grade
    assignment.technicalScore = technicalScore;
    assignment.comment = comment;
    assignment.status = "Completed";
    await assignment.save();

    console.log(" Grade submitted successfully");

    res.json({ message: "Grade submitted successfully", assignment });
  } catch (err) {
    console.error(" Error submitting grade:", err);
    res.status(500).json({ message: "Server error submitting grade" });
  }
});

//  Mark assignment as completed
router.put("/assignments/:id/complete", protect, evaluator, async (req, res) => {
  try {
    const assignment = await EvaluatorAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Verify this assignment belongs to the logged-in evaluator
    if (assignment.evaluator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this assignment" });
    }

    assignment.status = "Completed";
    await assignment.save();

    console.log(" Assignment marked as completed");

    res.json({ message: "Assignment marked as completed" });
  } catch (err) {
    console.error(" Error marking completed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;