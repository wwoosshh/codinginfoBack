import mongoose from 'mongoose';

beforeAll(async () => {
  const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/codinginfo_test';
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear test database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});