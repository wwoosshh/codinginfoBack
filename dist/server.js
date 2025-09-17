"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const seedData_1 = require("./utils/seedData");
const articles_1 = __importDefault(require("./routes/articles"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5159', 10);
const initializeServer = async () => {
    await (0, database_1.default)();
    await (0, seedData_1.seedData)();
};
initializeServer();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/articles', articles_1.default);
app.use('/api/auth', auth_1.default);
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
    });
});
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📄 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 External access: http://[YOUR_IP]:${PORT}/health`);
    console.log(`🔗 Frontend should connect to: http://[YOUR_IP]:${PORT}`);
});
//# sourceMappingURL=server.js.map