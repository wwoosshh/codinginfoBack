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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleStatus = exports.CategoryDisplayNames = exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Category;
(function (Category) {
    Category["OVERFLOW"] = "OVERFLOW";
    Category["GAME_DEVELOPMENT"] = "GAME_DEVELOPMENT";
    Category["GRAPHICS"] = "GRAPHICS";
    Category["ALGORITHM"] = "ALGORITHM";
    Category["WEB_DEVELOPMENT"] = "WEB_DEVELOPMENT";
    Category["DATA_STRUCTURE"] = "DATA_STRUCTURE";
})(Category || (exports.Category = Category = {}));
exports.CategoryDisplayNames = {
    [Category.OVERFLOW]: '오버플로우',
    [Category.GAME_DEVELOPMENT]: '게임 개발',
    [Category.GRAPHICS]: '그래픽스',
    [Category.ALGORITHM]: '알고리즘',
    [Category.WEB_DEVELOPMENT]: '웹 개발',
    [Category.DATA_STRUCTURE]: '자료구조',
};
var ArticleStatus;
(function (ArticleStatus) {
    ArticleStatus["DRAFT"] = "draft";
    ArticleStatus["PUBLISHED"] = "published";
    ArticleStatus["ARCHIVED"] = "archived";
})(ArticleStatus || (exports.ArticleStatus = ArticleStatus = {}));
const ArticleSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: Object.values(Category),
    },
    categoryDisplayName: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Slug cannot be more than 100 characters'],
    },
    status: {
        type: String,
        enum: Object.values(ArticleStatus),
        default: ArticleStatus.DRAFT,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [50, 'Tag cannot be more than 50 characters'],
        }],
    viewCount: {
        type: Number,
        default: 0,
    },
    publishedAt: {
        type: Date,
    },
    imageUrl: {
        type: String,
        trim: true,
        maxlength: [500, 'Image URL cannot be more than 500 characters'],
    },
}, {
    timestamps: true,
});
ArticleSchema.pre('save', function (next) {
    if (this.isModified('category')) {
        this.categoryDisplayName = exports.CategoryDisplayNames[this.category];
    }
    if (this.isModified('status')) {
        if (this.status === ArticleStatus.PUBLISHED && !this.publishedAt) {
            this.publishedAt = new Date();
        }
    }
    next();
});
ArticleSchema.index({ title: 'text', description: 'text', content: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ viewCount: -1 });
exports.default = mongoose_1.default.model('Article', ArticleSchema);
//# sourceMappingURL=Article.js.map