"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', articleController_1.getAllArticles);
router.get('/search', articleController_1.searchArticles);
router.get('/category/:category', articleController_1.getArticlesByCategory);
router.get('/:slug', articleController_1.getArticleBySlug);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin']), articleController_1.createArticle);
router.put('/:slug', auth_1.authenticate, (0, auth_1.authorize)(['admin']), articleController_1.updateArticle);
router.delete('/:slug', auth_1.authenticate, (0, auth_1.authorize)(['admin']), articleController_1.deleteArticle);
exports.default = router;
//# sourceMappingURL=articles.js.map