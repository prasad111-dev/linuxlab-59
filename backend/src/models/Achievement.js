const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🏆' },
    points: { type: Number, default: 0 },
    criteria: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
