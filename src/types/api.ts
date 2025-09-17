import { IArticle } from '../models/Article';
import { IUser } from '../models/User';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ArticleCreateRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  slug: string;
  imageUrl?: string;
}

export interface ArticleUpdateRequest extends Partial<ArticleCreateRequest> {}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface SearchQuery {
  keyword?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}