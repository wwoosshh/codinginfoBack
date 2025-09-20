"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    },
});
router.post('/upload', auth_1.authenticate, auth_1.requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '업로드할 이미지 파일이 없습니다.'
            });
        }
        const timestamp = Date.now();
        const originalName = req.file.originalname;
        const fileExtension = originalName.split('.').pop();
        const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadOptions = {
            resource_type: 'image',
            folder: 'codinginfo/articles',
            public_id: `article-${timestamp}`,
            overwrite: false,
            transformation: [
                { width: 1200, crop: 'limit' },
                { quality: 'auto' },
                { format: 'auto' }
            ],
            tags: ['article', 'codinginfo'],
        };
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            streamifier_1.default.createReadStream(req.file.buffer).pipe(uploadStream);
        });
        logger_1.default.info('Image uploaded successfully', {
            userId: req.user?.userId,
            filename: originalName,
            cloudinaryId: result.public_id,
            url: result.secure_url,
            size: result.bytes
        });
        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            filename: originalName,
            size: result.bytes,
            width: result.width,
            height: result.height,
            format: result.format
        });
    }
    catch (error) {
        console.error('Image upload error:', error);
        logger_1.default.error('Image upload failed', {
            userId: req.user?.userId,
            filename: req.file?.originalname,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            success: false,
            error: '이미지 업로드 중 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const maxResults = Math.min(limit, 100);
        const result = await cloudinary_1.default.search
            .expression('folder:codinginfo/articles AND resource_type:image')
            .sort_by('created_at', 'desc')
            .max_results(maxResults)
            .execute();
        const images = result.resources.map((resource) => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            filename: resource.filename || resource.public_id,
            size: resource.bytes,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            createdAt: resource.created_at,
            tags: resource.tags
        }));
        res.json({
            success: true,
            images,
            pagination: {
                currentPage: page,
                totalImages: result.total_count,
                hasMore: result.total_count > page * maxResults
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch images:', error);
        res.status(500).json({
            success: false,
            error: '이미지 목록을 가져오는 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:publicId', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { publicId } = req.params;
        const decodedPublicId = decodeURIComponent(publicId);
        const result = await cloudinary_1.default.uploader.destroy(decodedPublicId);
        if (result.result === 'ok') {
            logger_1.default.info('Image deleted successfully', {
                userId: req.user?.userId,
                publicId: decodedPublicId
            });
            res.json({
                success: true,
                message: '이미지가 성공적으로 삭제되었습니다.'
            });
        }
        else if (result.result === 'not found') {
            res.status(404).json({
                success: false,
                error: '삭제할 이미지를 찾을 수 없습니다.'
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: '이미지 삭제에 실패했습니다.'
            });
        }
    }
    catch (error) {
        console.error('Image deletion error:', error);
        logger_1.default.error('Image deletion failed', {
            userId: req.user?.userId,
            publicId: req.params.publicId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            success: false,
            error: '이미지 삭제 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=images.js.map