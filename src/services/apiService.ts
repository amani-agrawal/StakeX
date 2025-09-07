// API Service for connecting frontend to backend
import { APP_CONFIG } from '../config/appConfig';

const API_BASE_URL = APP_CONFIG.API.BASE_URL;

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  address: string;
  memberSince: string;
  profilePicture: string;
  cart?: string[];
  historyOrders?: string[];
  ongoingBids?: string[];
  itemsToSell?: string[];
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price?: number;
  owner: string;
  isOwned: boolean;
  isBid: boolean;
  bids?: Bid[];
  onMarket: boolean;
  createdAt?: string;
  updatedAt?: string;
  // New fields
  yearsOfUse?: number;
  authenticityCertificate?: string;
  isMarketItem?: boolean;
  demandPrice?: number;
  isRentable?: boolean;
}

export interface Bid {
  _id?: string;
  productId: string;
  userId: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🚀 ApiService initialized with base URL:', this.baseURL);
    console.log('🔧 Environment variables:', {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });
  }

  // Generic API call method
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      
      const fullURL = `${this.baseURL}${endpoint}`;
      console.log('🌐 Making API call to:', fullURL);
      console.log('📤 Request options:', options);
      
      const response = await fetch(fullURL, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', json);

      if (!response.ok) {
        console.log('❌ API call failed:', json?.message || `HTTP ${response.status}`);
        return {
          success: false,
          error: json?.message || `HTTP ${response.status}`,
        };
      }

      // Unwrap once here - if backend returns {success: true, data: {...}}, extract the data
      const payload = (json && typeof json === 'object' && 'data' in json) ? json.data : json;

      console.log('✅ API call successful');
      return {
        success: true,
        data: payload,
        message: json?.message, // optional
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const body = JSON.stringify({ email, password });
    console.log('🔐 Login request body:', body);
    return this.apiCall('/api/auth/login', {
      method: 'POST',
      body,
    });
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    age: number;
    address: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const body = JSON.stringify(userData);
    console.log('📝 Signup request body:', body);
    return this.apiCall('/api/auth/register', {
      method: 'POST',
      body,
    });
  }

  // User APIs
  async getUser(userId: string, token?: string): Promise<ApiResponse<User>> {
    return this.apiCall(`/api/users/${userId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.apiCall(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Product APIs
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.apiCall('/api/posts');
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.apiCall(`/api/posts/${productId}`);
  }

  async createProduct(payload: any, token: string | null) {
    const res = await fetch(`${this.baseURL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data?.message || data?.error || text || 'Request failed',
        data,
      };
    }
    return { success: true, data };
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.apiCall(`/api/posts/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    return this.apiCall(`/api/posts/${productId}`, {
      method: 'DELETE',
    });
  }

  // Bid APIs
  async getBids(filters?: { productId?: string; userId?: string; status?: string }): Promise<ApiResponse<Bid[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.productId) queryParams.append('productId', filters.productId);
    if (filters?.userId) queryParams.append('userId', filters.userId);
    if (filters?.status) queryParams.append('status', filters.status);
    
    const endpoint = queryParams.toString() ? `/api/bids?${queryParams}` : '/api/bids';
    return this.apiCall(endpoint);
  }

  async createBid(bidData: {
    productId: string;
    amount: number;
    message?: string;
  }, token?: string): Promise<ApiResponse<Bid>> {
    return this.apiCall('/api/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  }

  async updateBid(bidId: string, bidData: Partial<Bid>, token?: string): Promise<ApiResponse<Bid>> {
    return this.apiCall(`/api/bids/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.apiCall('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
