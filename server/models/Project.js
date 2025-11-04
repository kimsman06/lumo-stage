const mongoose = require("mongoose");

const validateVector3 = (value) => Array.isArray(value) && value.length === 3;

const OrbitControlStateSchema = new mongoose.Schema(
  {
    cameraPosition: {
      type: [Number],
      validate: {
        validator: validateVector3,
        message: "cameraPosition must be an array of three numbers"
      }
    },
    target: {
      type: [Number],
      validate: {
        validator: validateVector3,
        message: "target must be an array of three numbers"
      }
    },
    zoom: {
      type: Number,
      min: 0
    }
  },
  { _id: false }
);

const SceneDataSchema = new mongoose.Schema(
  {
    orbitControlState: OrbitControlStateSchema
  },
  {
    _id: false,
    strict: false,
    minimize: false
  }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sceneData: { type: SceneDataSchema, required: true, default: () => ({}) },
    thumbnail: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
