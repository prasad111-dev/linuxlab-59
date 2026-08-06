const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    picture: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    points: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActive: { type: Date, default: null },
    },
    achievements: [
      {
        code: { type: String },
        unlockedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    lastLoginAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: null },
    lastLogoutAt: { type: Date, default: null },
    totalActiveMs: { type: Number, default: 0 },
    lastHeartbeatAt: { type: Date, default: null },
    activeTimeByDay: [
      {
        date: { type: String },
        ms: { type: Number, default: 0 },
        _id: false,
      },
    ],
    sessions: [
      {
        loginAt: { type: Date, default: null },
        logoutAt: { type: Date, default: null },
        ms: { type: Number, default: 0 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    googleId: this.googleId,
    email: this.email,
    name: this.name,
    picture: this.picture,
    role: this.role,
    points: this.points,
    streak: this.streak,
    achievements: this.achievements,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

module.exports = mongoose.model('User', userSchema);
