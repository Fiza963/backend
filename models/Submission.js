const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  videoLink: { 
    type: String, 
    required: [true, 'Video link is required'],
    trim: true
  },
  topic: { 
    type: String, 
    required: [true, 'Topic is required'],
    trim: true
  },
  learningOutcomes: { 
    type: String, 
    required: [true, 'Learning outcomes are required']
  },
  description: {
    type: String,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'evaluated'], 
    default: 'pending' 
  },
  assignedEvaluators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  deadline: { 
    type: Date, 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', SubmissionSchema);