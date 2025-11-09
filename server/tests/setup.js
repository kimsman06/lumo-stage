const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { __memoryStore } = require("../services/storage.service");

let mongoServer;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "lumostage_test"
    }
  });

  const uri = mongoServer.getUri("lumostage_test");

  process.env.MONGO_URI = uri;
  process.env.SESSION_SECRET = "test-session-secret";
  process.env.SESSION_COOKIE_NAME = "lumostage.sid";
  process.env.NODE_ENV = "test";
  process.env.R2_BUCKET_NAME = "test-bucket";
  process.env.R2_PUBLIC_URL = "https://r2.test-bucket.local";

  await mongoose.connect(uri);
});

afterEach(async () => {
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({});
    })
  );

  __memoryStore.clear();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
