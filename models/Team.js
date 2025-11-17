const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: [true, 'Team name is required'],
    unique: true,
    trim: true
  },
  teamLead: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Validation: Max 5 members
TeamSchema.path('members').validate(function(members) {
  return members.length <= 5;
}, 'Team can have maximum 5 members');

module.exports = mongoose.model('Team', TeamSchema);