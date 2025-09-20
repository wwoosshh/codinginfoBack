import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';
import { authenticate, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Multer 설정 (메모리 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  },
});

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: 이미지 업로드
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   description: 업로드된 이미지의 URL
 *                 publicId:
 *                   type: string
 *                   description: Cloudinary public ID
 *                 filename:
 *                   type: string
 *                   description: 원본 파일명
 *                 size:
 *                   type: number
 *                   description: 파일 크기 (bytes)
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       413:
 *         description: 파일 크기 초과
 *       500:
 *         description: 서버 오류
 */
router.post('/upload', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '업로드할 이미지 파일이 없습니다.'
      });
    }

    // 파일명 생성 (원본 파일명 + 타임스탬프)
    const timestamp = Date.now();
    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop();
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Cloudinary 업로드 설정
    const uploadOptions = {
      resource_type: 'image' as const,
      folder: 'codinginfo/articles', // 폴더 구조
      public_id: `article-${timestamp}`, // public ID
      overwrite: false,
      transformation: [
        { width: 1200, crop: 'limit' }, // 최대 너비 제한
        { quality: 'auto' }, // 자동 품질 최적화
        { format: 'auto' } // 자동 포맷 최적화 (WebP 등)
      ],
      tags: ['article', 'codinginfo'], // 태그 추가
    };

    // Promise로 업로드 처리
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // 파일 버퍼를 스트림으로 변환하여 업로드
      streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
    });

    // 업로드 성공 로그
    logger.info('Image uploaded successfully', {
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

  } catch (error) {
    console.error('Image upload error:', error);

    logger.error('Image upload failed', {
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

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: 업로드된 이미지 목록 조회 (관리자 전용)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: unused
 *         schema:
 *           type: boolean
 *         description: 사용되지 않은 이미지만 조회
 *     responses:
 *       200:
 *         description: 이미지 목록 조회 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 관리자 권한 필요
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unused = req.query.unused === 'true';
    const maxResults = Math.min(limit, 100); // 최대 100개까지

    // Cloudinary에서 이미지 목록 조회
    const result = await cloudinary.search
      .expression('folder:codinginfo/articles AND resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();

    let images = result.resources.map((resource: any) => ({
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

    // 사용되지 않은 이미지 필터링이 요청된 경우
    if (unused) {
      const Article = (await import('../models/Article')).default;

      // 모든 아티클에서 이미지 URL 추출
      const articles = await Article.find({}, 'content');
      const usedImageUrls = new Set<string>();

      articles.forEach(article => {
        if (article.content) {
          // 마크다운에서 이미지 URL 추출 (![](url) 형태)
          const imageMatches = article.content.match(/!\[.*?\]\((.*?)\)/g);
          if (imageMatches) {
            imageMatches.forEach(match => {
              const urlMatch = match.match(/!\[.*?\]\((.*?)\)/);
              if (urlMatch && urlMatch[1]) {
                usedImageUrls.add(urlMatch[1]);
              }
            });
          }
        }
      });

      // 사용되지 않은 이미지만 필터링
      images = images.filter((image: any) => !usedImageUrls.has(image.url));
    }

    // 각 이미지에 대해 사용 현황 추가
    const imagesWithUsage = await Promise.all(
      images.map(async (image: any) => {
        const Article = (await import('../models/Article')).default;

        // 해당 이미지를 사용하는 아티클 찾기
        const articlesUsingImage = await Article.find(
          { content: { $regex: image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
          'title slug'
        );

        return {
          ...image,
          usageCount: articlesUsingImage.length,
          usedInArticles: articlesUsingImage.map(article => ({
            title: article.title,
            slug: article.slug
          }))
        };
      })
    );

    res.json({
      success: true,
      images: imagesWithUsage,
      pagination: {
        currentPage: page,
        totalImages: result.total_count,
        hasMore: result.total_count > page * maxResults
      }
    });

  } catch (error) {
    console.error('Failed to fetch images:', error);
    res.status(500).json({
      success: false,
      error: '이미지 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/images/{publicId}:
 *   delete:
 *     summary: 이미지 삭제 (관리자 전용)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID
 *     responses:
 *       200:
 *         description: 이미지 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 이미지를 찾을 수 없음
 */
router.delete('/:publicId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const force = req.query.force === 'true'; // 강제 삭제 플래그

    // URL 디코딩 (슬래시 등이 인코딩되어 올 수 있음)
    const decodedPublicId = decodeURIComponent(publicId);

    // 먼저 Cloudinary에서 이미지 정보 조회
    const imageResource = await cloudinary.api.resource(decodedPublicId);
    if (!imageResource) {
      return res.status(404).json({
        success: false,
        error: '삭제할 이미지를 찾을 수 없습니다.'
      });
    }

    const imageUrl = imageResource.secure_url;

    // 강제 삭제가 아닌 경우, 이미지 사용 여부 확인
    if (!force) {
      const Article = (await import('../models/Article')).default;

      // 해당 이미지를 사용하는 아티클 찾기
      const articlesUsingImage = await Article.find(
        { content: { $regex: imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
        'title slug'
      );

      if (articlesUsingImage.length > 0) {
        return res.status(409).json({
          success: false,
          error: '이미지가 아티클에서 사용 중입니다.',
          usedInArticles: articlesUsingImage.map(article => ({
            title: article.title,
            slug: article.slug
          })),
          canForceDelete: true
        });
      }
    }

    // Cloudinary에서 이미지 삭제
    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === 'ok') {
      logger.info('Image deleted successfully', {
        userId: req.user?.userId,
        publicId: decodedPublicId,
        imageUrl,
        forced: force
      });

      res.json({
        success: true,
        message: '이미지가 성공적으로 삭제되었습니다.'
      });
    } else if (result.result === 'not found') {
      res.status(404).json({
        success: false,
        error: '삭제할 이미지를 찾을 수 없습니다.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: '이미지 삭제에 실패했습니다.'
      });
    }

  } catch (error) {
    console.error('Image deletion error:', error);

    logger.error('Image deletion failed', {
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

export default router;