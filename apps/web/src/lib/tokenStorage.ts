// Token storage utility for managing authentication tokens
import { User } from '@/services/api';

const ACCESS_TOKEN_KEY = 'salon_hub_access_token';
const TOKEN_TYPE_KEY = 'salon_hub_token_type';
const USER_DATA_KEY = 'salon_hub_user_data';
const TOKEN_EXPIRY_KEY = 'salon_hub_token_expiry';

export interface StoredUser {
  id?: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
  lastVisit?: string;
}

class TokenStorage {
  // Store authentication tokens and user data
  storeSession(accessToken: string, tokenType: string, userData: StoredUser, expiresIn?: number): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType || 'Bearer');
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    // Calculate expiry time (default to 1 hour if not provided)
    const expiryTime = Date.now() + (expiresIn ? expiresIn * 1000 : 3600000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Get token type
  getTokenType(): string {
    return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
  }

  // Get user data
  getUser(): StoredUser | null {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if token exists and is not expired
  hasValidSession(): boolean {
    const token = this.getAccessToken();
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return false;
    
    const expiryTime = parseInt(expiry);
    return Date.now() < expiryTime;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    return Date.now() >= expiryTime;
  }

  // Clear all stored session data
  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  // Get full authorization header
  getAuthHeader(): string | null {
    const token = this.getAccessToken();
    const tokenType = this.getTokenType();
    
    if (!token || this.isTokenExpired()) return null;
    
    return `${tokenType} ${token}`;
  }

  // Update user data without affecting tokens
  updateUserData(userData: Partial<StoredUser>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
    }
  }
}

export const tokenStorage = new TokenStorage();