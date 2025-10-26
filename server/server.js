const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const dotenv = require("dotenv");

const apiRouter = require("./routes");
const configurePassport = require("./config/passport");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: CLIENT_ORIGIN || true,
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

configurePassport(passport);
app.use(passport.initialize());

app.use("/api", apiRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error"
  });
});

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lumostage";

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
};

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
}

module.exports = { app, connectDatabase };
