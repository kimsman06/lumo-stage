const mongoose = require("mongoose");

const ShareTokenSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
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
