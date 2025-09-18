"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['admin']));
router.get('/dashboard/stats', adminController_1.getDashboardStats);
router.get('/users', adminController_1.getAllUsers);
router.patch('/users/:id/status', adminController_1.updateUserStatus);
router.delete('/users/:id', adminController_1.deleteUser);
router.get('/articles', adminController_1.getAllArticlesAdmin);
router.patch('/articles/:id/status', adminController_1.updateArticleStatus);
router.delete('/articles/:id', adminController_1.deleteArticleAdmin);
router.get('/system/health', adminController_1.getSystemHealth);
exports.default = router;
//# sourceMappingURL=admin.js.map