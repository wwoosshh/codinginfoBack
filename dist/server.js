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
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./utils/errorHandler");
const logger_1 = require("./utils/logger");
const articles_1 = __importDefault(require("./routes/articles"));
const auth_1 = __importDefault(require("./routes/auth"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5159', 10);
const initializeServer = async () => {
    try {
        await (0, database_1.default)();
        console.log('✅ Server initialization completed');
    }
    catch (error) {
        console.error('❌ Server initialization failed:', error);
        process.exit(1);
    }
};
initializeServer();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(logger_1.requestLogger);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
(0, swagger_1.setupSwagger)(app);
app.use('/api/articles', articles_1.default);
app.use('/api/auth', auth_1.default);
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
        };
        res.json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            version: '1.2.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: {
                status: dbStatus,
                name: 'MongoDB Atlas',
            },
            memory: memUsageMB,
            node: process.version,
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📄 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 External access: http://[YOUR_IP]:${PORT}/health`);
    console.log(`🔗 Frontend should connect to: http://[YOUR_IP]:${PORT}`);
});
//# sourceMappingURL=server.js.map