import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CodingInfo API',
      version: '1.3.2',
      description: 'API documentation for CodingInfo - Programming Learning Platform',
      contact: {
        name: 'CodingInfo Team',
        url: 'https://codinginfo.vercel.app',
      },
    },
    servers: [
      {
        url: 'https://codinginfoback-production.up.railway.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Article: {
          type: 'object',
          required: ['title', 'description', 'content', 'category', 'slug', 'author'],
          properties: {
            _id: {
              type: 'string',
              description: 'Article unique identifier',
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Article title',
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Article description',
            },
            content: {
              type: 'string',
              description: 'Article content in markdown format',
            },
            category: {
              type: 'string',
              enum: ['OVERFLOW', 'GAME_DEVELOPMENT', 'GRAPHICS', 'ALGORITHM', 'WEB_DEVELOPMENT', 'DATA_STRUCTURE'],
              description: 'Article category',
            },
            categoryDisplayName: {
              type: 'string',
              description: 'Display name for category',
            },
            slug: {
              type: 'string',
              maxLength: 100,
              description: 'URL-friendly article identifier',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft',
              description: 'Article publication status',
            },
            author: {
              type: 'string',
              description: 'Author ID reference',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 50,
              },
              description: 'Article tags',
            },
            viewCount: {
              type: 'number',
              default: 0,
              description: 'Article view count',
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Article publication timestamp',
            },
            imageUrl: {
              type: 'string',
              maxLength: 500,
              description: 'Article cover image URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Article creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Article last update timestamp',
            },
          },
        },
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User unique identifier',
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'User username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              default: 'user',
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'User active status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CodingInfo API Documentation',
  }));

  // JSON endpoint for the docs
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;