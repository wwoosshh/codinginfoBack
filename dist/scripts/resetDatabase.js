"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Article_1 = __importDefault(require("../models/Article"));
const Category_1 = __importDefault(require("../models/Category"));
const database_1 = __importDefault(require("../config/database"));
dotenv_1.default.config();
const resetDatabase = async () => {
    try {
        await (0, database_1.default)();
        console.log('Connected to MongoDB');
        const articlesDeleted = await Article_1.default.deleteMany({});
        console.log(`Deleted ${articlesDeleted.deletedCount} articles`);
        const categoriesDeleted = await Category_1.default.deleteMany({});
        console.log(`Deleted ${categoriesDeleted.deletedCount} categories`);
        console.log('Database reset completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};
resetDatabase();
//# sourceMappingURL=resetDatabase.js.map