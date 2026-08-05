const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    expected: { type: String, default: '' },
    actual: { type: String, default: '' },
    passed: { type: Boolean, default: false },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    containerId: { type: String, default: '' },
    wsTicket: { type: String, default: '' },
    status: {
      type: String,
      enum: ['running', 'submitted', 'evaluated', 'terminated', 'error'],
      default: 'running',
    },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTakenSeconds: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    optimization: { type: String, default: '' },
    correctSolution: { type: String, default: '' },
    recommendedNext: {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
      title: { type: String, default: '' },
    },
    mistakes: { type: [mistakeSchema], default: [] },
    rulesSummary: { type: String, default: '' },
    hintsUsed: { type: Number, default: 0 },
    explainUsed: { type: Number, default: 0 },
    commandHistory: { type: [String], default: [] },
    terminalLog: { type: [String], default: [] },
    aiChat: {
      type: [
        {
          role: { type: String, enum: ['user', 'assistant'], default: 'user' },
          text: { type: String, default: '' },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    lastActiveAt: { type: Date, default: null },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, status: 1 });
attemptSchema.index({ user: 1, createdAt: -1 });
attemptSchema.index({ task: 1, user: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
