const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true, unique: true, index: true },
    topic: { type: String, default: 'General', trim: true, index: true },
    model: { type: String, default: '' },
    isBuiltIn: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

interviewQuestionSchema.index({ topic: 1, isActive: 1 });

interviewQuestionSchema.methods.toSafeJSON = function toSafeJSON() {
  const q = this.toObject();
  return {
    id: String(q._id),
    prompt: q.prompt,
    topic: q.topic,
    model: q.model || '',
    isBuiltIn: !!q.isBuiltIn,
    isActive: !!q.isActive,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
};

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
