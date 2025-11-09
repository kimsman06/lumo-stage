const mongoose = require("mongoose");

const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ["hdri", "gltf", "image"],
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileKey: {
      type: String,
      required: true,
      unique: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    metadata: {
      width: {
        type: Number,
        default: null
      },
      height: {
        type: Number,
        default: null
      },
      compression: {
        type: String,
        default: null
      }
    },
    storageProvider: {
      type: String,
      default: "r2"
    }
  },
  {
    timestamps: {
      createdAt: "uploadedAt",
      updatedAt: "updatedAt"
    }
  }
);

assetSchema.index({ owner: 1, uploadedAt: -1 });
assetSchema.index({ projectId: 1, type: 1 });

module.exports = mongoose.models.Asset || mongoose.model("Asset", assetSchema);
