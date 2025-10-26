const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    naverId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
