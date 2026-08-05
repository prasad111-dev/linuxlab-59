const mongoose = require('mongoose');
const { INTERVIEW_MODES } = require('../constants/interviewModes');

const interviewProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: {
      type: String,
      enum: INTERVIEW_MODES,
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
