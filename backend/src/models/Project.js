const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold', 'Archived'],
    default: 'Active'
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure owner is always in members list as Admin
ProjectSchema.pre('save', function (next) {
  const ownerInMembers = this.members.some(m => m.user?.toString() === this.owner.toString());
  if (!ownerInMembers) {
    this.members.unshift({ user: this.owner, role: 'Admin' });
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
