"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/codinginfo_test';
    await mongoose_1.default.connect(MONGODB_URI);
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
beforeEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
//# sourceMappingURL=setup.js.map