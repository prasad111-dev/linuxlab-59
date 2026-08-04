const mongoose = require('mongoose');

const interviewProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: {
      type: String,
      enum: ['flashcard', 'quest', 'typing'],
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

interviewProgressSchema.index({ user: 1, mode: 1 }, { unique: true });

interviewProgressSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: String(this._id),
    mode: this.mode,
    data: this.data || {},
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('InterviewProgress', interviewProgressSchema);
