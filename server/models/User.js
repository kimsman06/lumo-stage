const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    naverId: { type: String, unique: true, sparse: true },
    // 프로필 정보
    profileImage: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 500 },
    // OAuth 제공자별 추가 정보
    oauthProvider: { type: String, enum: ["local", "google", "naver"], default: "local" },
    aiApiKey: { type: String, default: null, select: false },
    aiUsageStats: {
      totalGenerations: { type: Number, default: 0 },
      lastGeneratedAt: { type: Date, default: null },
      monthlyGenerations: { type: Number, default: 0 },
      monthlyWindow: { type: String, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
