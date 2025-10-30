const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const apiRouter = require("./routes");
const configurePassport = require("./config/passport");
const {
  SESSION_COOKIE_NAME,
  SESSION_COLLECTION_NAME,
  SESSION_MAX_AGE_MS,
  getSessionSecret,
  getMongoUri,
  getSessionCookieOptions
} = require("./config/session");

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
app.use(
  session({
    name: SESSION_COOKIE_NAME,
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: getMongoUri(),
      collectionName: SESSION_COLLECTION_NAME,
      ttl: Math.ceil(SESSION_MAX_AGE_MS / 1000)
    }),
    cookie: getSessionCookieOptions()
  })
);

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
