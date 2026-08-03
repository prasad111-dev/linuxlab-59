const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    scenario: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    difficulty: {
      type: String,
      enum: ['', 'beginner', 'intermediate', 'advanced', 'expert'],
      default: '',
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

suggestionSchema.index({ status: 1, createdAt: -1 });
suggestionSchema.index({ user: 1, createdAt: -1 });

suggestionSchema.methods.toSuggestionJSON = function toSuggestionJSON() {
  const obj = this.toObject();
  return { ...obj, id: obj._id.toString() };
};

module.exports = mongoose.model('Suggestion', suggestionSchema);
