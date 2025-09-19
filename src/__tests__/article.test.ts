import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Article from '../models/Article';
import Category from '../models/Category';
import articleRoutes from '../routes/articles';

const app = express();
app.use(express.json());
app.use('/api/articles', articleRoutes);

describe('Article API', () => {
  describe('GET /api/articles', () => {
    it('should return empty array when no articles exist', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return articles when they exist', async () => {
      // Create test article
      const testArticle = new Article({
        title: 'Test Article',
        description: 'Test Description',
        content: 'Test Content',
        category: 'OVERFLOW',
        slug: 'test-article',
      });
      await testArticle.save();

      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Article');
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/articles/non-existent')
        .expect(404);

      expect(response.body.message).toBe('Article not found');
    });

    it('should return article when it exists', async () => {
      // Create test article
      const testArticle = new Article({
        title: 'Test Article',
        description: 'Test Description',
        content: 'Test Content',
        category: 'OVERFLOW',
        slug: 'test-article',
      });
      await testArticle.save();

      const response = await request(app)
        .get('/api/articles/test-article')
        .expect(200);

      expect(response.body.title).toBe('Test Article');
      expect(response.body.slug).toBe('test-article');
    });
  });

  describe('GET /api/articles/category/:category', () => {
    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .get('/api/articles/category/INVALID_CATEGORY')
        .expect(400);

      expect(response.body.message).toBe('Invalid category');
    });

    it('should return articles for valid category', async () => {
      // Create test articles
      const article1 = new Article({
        title: 'Overflow Article',
        description: 'Test Description',
        content: 'Test Content',
        category: 'OVERFLOW',
        slug: 'overflow-article',
      });

      const article2 = new Article({
        title: 'Graphics Article',
        description: 'Test Description',
        content: 'Test Content',
        category: 'GRAPHICS',
        slug: 'graphics-article',
      });

      await article1.save();
      await article2.save();

      const response = await request(app)
        .get('/api/articles/category/OVERFLOW')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe('OVERFLOW');
    });
  });

  describe('GET /api/articles/search', () => {
    it('should return 400 when keyword is missing', async () => {
      const response = await request(app)
        .get('/api/articles/search')
        .expect(400);

      expect(response.body.message).toBe('Keyword is required');
    });

    it('should return matching articles', async () => {
      // Create test article
      const testArticle = new Article({
        title: 'JavaScript Overflow',
        description: 'Learn about overflow in JavaScript',
        content: 'This is about JavaScript overflow issues',
        category: 'OVERFLOW',
        slug: 'javascript-overflow',
      });
      await testArticle.save();

      const response = await request(app)
        .get('/api/articles/search?keyword=JavaScript')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toContain('JavaScript');
    });
  });
});