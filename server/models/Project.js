const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sceneData: { type: Object, required: true, default: {} },
    thumbnail: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
