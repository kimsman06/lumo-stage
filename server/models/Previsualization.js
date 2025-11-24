const mongoose = require("mongoose");

const SceneSnapshotSchema = new mongoose.Schema(
  {
    lightsCount: { type: Number, default: null },
    cameraAngle: {
      position: { type: [Number], default: undefined },
      target: { type: [Number], default: undefined }
    },
    mannequinPose: { type: String, default: null }
  },
  { _id: false }
);

const GenerationParamsSchema = new mongoose.Schema(
  {
    model: { type: String, default: "nano-banana-v1" },
    steps: { type: Number, default: 20 },
    guidanceScale: { type: Number, default: 7.5 },
    strength: { type: Number, default: 0.75 },
    seed: { type: Number, default: null },
    aspectRatio: { type: String, default: null },
    imageSize: { type: String, default: null }
  },
  { _id: false }
);

const PrevisualizationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Previsualization", default: null },
    prompt: { type: String, required: true, maxlength: 1000 },
    negativePrompt: { type: String, maxlength: 500, default: null },
    sceneRenderUrl: { type: String, required: true },
    sceneRenderKey: { type: String, required: true, select: false },
    sceneRenderMimeType: { type: String, required: true },
    generatedImageUrl: { type: String, default: null },
    generatedImageKey: { type: String, default: null, select: false },
    generatedImageMimeType: { type: String, default: null },
    sceneSnapshot: { type: SceneSnapshotSchema, default: undefined },
    generationParams: { type: GenerationParamsSchema, default: undefined },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending"
    },
    errorMessage: { type: String, default: null },
    metadata: {
      processingTime: { type: Number, default: null },
      apiProvider: { type: String, default: null },
      apiVersion: { type: String, default: null },
      retryCount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

PrevisualizationSchema.index({ owner: 1, createdAt: -1 });
PrevisualizationSchema.index({ project: 1, createdAt: -1 });
PrevisualizationSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("Previsualization", PrevisualizationSchema);
