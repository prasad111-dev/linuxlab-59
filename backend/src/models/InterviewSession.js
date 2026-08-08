const mongoose = require('mongoose');
const { INTERVIEW_MODES } = require('../constants/interviewModes');

const answerSchema = new mongoose.Schema(
  {
    prompt: { type: String, default: '' },
    answer: { type: String, default: '' },
    userAnswer: { type: String, default: '' },
    correct: { type: Boolean, default: false },
    topic: { type: String, default: '' },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: {
      type: String,
      enum: INTERVIEW_MODES,
      required: true,
      index: true,
    },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 },
    wpm: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    weakTopics: { type: [String], default: [] },
    aiReport: { type: String, default: '' },
    finished: { type: Boolean, default: false },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ user: 1, mode: 1 });
interviewSessionSchema.index({ user: 1, createdAt: -1 });

interviewSessionSchema.methods.toSafeJSON = function toSafeJSON() {
  const s = this.toObject();
  return {
    id: String(s._id),
    mode: s.mode,
    score: s.score,
    maxScore: s.maxScore,
    accuracy: s.accuracy,
    pointsAwarded: s.pointsAwarded || 0,
    timeTakenSeconds: s.timeTakenSeconds,
    wpm: s.wpm,
    answers: s.answers || [],
    weakTopics: s.weakTopics || [],
    aiReport: s.aiReport || '',
    finished: s.finished,
    finishedAt: s.finishedAt,
    createdAt: s.createdAt,
  };
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
