const mongoose = require("mongoose");

const ShareTokenSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    token: { type: String, required: true, unique: true },
    tokenHash: { type: String, required: true, unique: true },
    permission: { type: String, enum: ["view", "edit"], default: "view", index: true },
    expiresAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    deactivatedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByIp: { type: String },
    userAgent: { type: String },
    accessCount: { type: Number, default: 0 },
    lastAccessedAt: { type: Date },
    lastAccessedIp: { type: String },
    lastAccessedUserAgent: { type: String },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date },
    revokedReason: { type: String },
    revokedMetadata: {
      ip: { type: String },
      userAgent: { type: String }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ShareToken", ShareTokenSchema);
