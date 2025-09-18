"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const admin_1 = __importDefault(require("./routes/admin"));
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
app.use('/api/admin', admin_1.default);
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
            version: '1.3.0',
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
app.get('/debug/articles', async (req, res) => {
    try {
        const { debugArticles } = await Promise.resolve().then(() => __importStar(require('./scripts/debugArticles')));
        const result = await debugArticles();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            error: 'Debug failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/migrate/articles', async (req, res) => {
    try {
        const { migrateArticles } = await Promise.resolve().then(() => __importStar(require('./scripts/migrateArticles')));
        const result = await migrateArticles();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            error: 'Migration failed',
            message: error instanceof Error ? error.message : 'Unknown error'
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