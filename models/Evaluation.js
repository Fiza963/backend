const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  submission: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Submission', 
    required: true 
  },
  evaluator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  criteria: {
    relevanceToLOs: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    innovationCreativity: { 
      type: Number, 
      min: 0, 
      max: 15, 
      default: 0 
    },
    clarityAccessibility: { 
      type: Number, 
      min: 0, 
      max: 10, 
      default: 0 
    },
    depth: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    interactivityEngagement: { 
      type: Number, 
      min: 0, 
      max: 25, 
      default: 0 
    },
    useOfTechnology: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    scalabilityAdaptability: { 
      type: Number, 
      min: 0, 
      max: 10, 
      default: 0 
    },
    ethicalStandards: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    practicalApplication: { 
      type: Number, 
      min: 0, 
      max: 10, 
      default: 0 
    },
    videoQuality: { 
      type: Number, 
      min: 0, 
      max: 10, 
      default: 0 
    }
  },
  totalScore: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  comments: {
    type: String,
    trim: true
  },
  evaluatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);