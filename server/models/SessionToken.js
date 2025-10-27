const mongoose = require("mongoose");

const SessionTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    createdByIp: { type: String },
    userAgent: { type: String },
    lastUsedAt: { type: Date },
    lastUsedIp: { type: String },
    lastUsedUserAgent: { type: String },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date },
    revokedReason: { type: String },
    revokedMetadata: {
      ip: { type: String },
      userAgent: { type: String },
      replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SessionToken" }
    },
    replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SessionToken" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionToken", SessionTokenSchema);
