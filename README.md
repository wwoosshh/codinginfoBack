# CodingInfo Backend API

프로그래밍 학습 플랫폼 백엔드 API 서버

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📊 Current Status

- **Version**: v1.3.2
- **Status**: Active Development
- **Environment**: Node.js + Express + TypeScript + MongoDB

## 🔗 Links

- **Production**: https://codinginfoback-production.up.railway.app
- **API Docs**: https://codinginfoback-production.up.railway.app/api-docs
- **Health Check**: https://codinginfoback-production.up.railway.app/health
- **Frontend**: https://codinginfo.vercel.app

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston
- **Deployment**: Railway
- **Testing**: Jest

## 📋 API Endpoints

### Public APIs
- `GET /api/articles` - Get published articles (with pagination)
- `GET /api/articles/search` - Search articles
- `GET /api/articles?category=CATEGORY_KEY` - Get articles by category
- `GET /api/categories` - Get all active categories
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin APIs (🔒 Admin Only)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/articles` - Get all articles (admin view)
- `POST /api/admin/articles` - Create new article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/articles` - Article management
- `PATCH /api/admin/articles/:id/status` - Update article status
- `DELETE /api/admin/articles/:id` - Delete article
- `GET /api/admin/system/health` - System health

### Protected APIs (🔐 Auth Required)
- `POST /api/articles` - Create article
- `PUT /api/articles/:slug` - Update article
- `DELETE /api/articles/:slug` - Delete article

## 🗂 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Utility scripts
├── types/           # TypeScript definitions
└── utils/           # Helper utilities
```

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5159
NODE_ENV=production
CORS_ORIGIN=https://codinginfo.vercel.app
```

## 📈 Version History

### v1.3.1 (2025-09-19) - Category System Integration
**🔧 Major Fixes:**
- ✅ Unified category system - replaced hardcoded enums with dynamic database categories
- ✅ Fixed database index duplication warnings on Category model
- ✅ Article model now uses string category keys instead of enum values
- ✅ Added public `/api/categories` endpoint for frontend category fetching
- ✅ Enhanced article responses to include category display names and colors
- ✅ Frontend AdminArticleEditPage now uses dynamic categories from backend
- ✅ Created migration script to convert existing data to new category system

**🐛 Critical Bug Fixes:**
- Fixed Mongoose duplicate index warnings
- Resolved category mismatch between frontend hardcoded values and backend dynamic system
- Ensured backward compatibility during transition period

**📋 New API Endpoints:**
- `GET /api/categories` - Public endpoint to fetch all active categories

**🔄 Database Changes:**
- Category model index optimization
- Article category field changed from enum to string
- Migration script for existing data conversion

### v1.3.0 (2025-09-18) - Week 2: Admin System
**🎯 Major Features:**
- ✅ Enhanced Article model with status management (draft/published/archived)
- ✅ Complete admin API system for user and article management
- ✅ Dashboard statistics and system monitoring
- ✅ Advanced search, filtering, and pagination support

**🔧 Technical Improvements:**
- Role-based access control strengthened
- Comprehensive logging for all admin actions
- TypeScript types updated and expanded
- Swagger documentation enhanced with admin APIs

**🔒 Security & Access Control:**
- Admin-only route protection implemented
- User management with safety constraints (can't delete admins)
- Article status workflow with publishedAt tracking
- Request logging and performance monitoring

**🚀 New API Endpoints:**
- Admin dashboard with real-time statistics
- User management (list, search, activate/deactivate, delete)
- Article management with status control
- System health monitoring endpoint

### v1.2.2 (2025-09-18) - Week 1: Quality & Stability
**✅ Completed Features:**
- Swagger/OpenAPI 3.0 complete implementation
- Winston logging system with request/auth/performance tracking
- Health check endpoint with database monitoring
- Hard-coded data removal and pure MongoDB integration
- TypeScript build stability improvements

**🐛 Bug Fixes:**
- Railway deployment TypeScript import errors
- Windows/Linux environment compatibility
- Database connection status monitoring

### v1.2.1 (2025-09-18)
**🔄 Rollback & Fixes:**
- Fixed TypeScript import errors in cleanDatabase script
- Railway deployment compatibility improvements

### v1.2.0 (2025-09-17)
**🔍 Infrastructure:**
- Hard-coded data detection and removal
- Database integrity verification
- Initial quality improvements setup

### v1.1.x (Earlier Versions)
**🏗 Foundation:**
- React 19 + TypeScript frontend setup
- Node.js + Express + TypeScript backend
- MongoDB Atlas integration
- JWT authentication system
- Basic CRUD operations
- Vercel + Railway deployment

## 🎯 Roadmap

### Week 3 (Next): Content Management
- [ ] Image upload and management system
- [ ] Dynamic category management
- [ ] Enhanced tag system with auto-suggestions
- [ ] Content versioning and revision history

### Week 4: User Experience
- [ ] Advanced search with full-text indexing
- [ ] Article recommendations
- [ ] User preferences and bookmarks
- [ ] Mobile-responsive optimizations

### Week 5: Social Features
- [ ] Comment system with threading
- [ ] Article likes and reactions
- [ ] User following system
- [ ] Notification system

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Test TypeScript compilation: `npx tsc --noEmit`

## 📝 License

This project is part of a graduation project for educational purposes.

---

🎓 **CodingInfo** - Programming Learning Platform
📧 Contact: [Your Contact Information]
🌐 Live Demo: https://codinginfo.vercel.app