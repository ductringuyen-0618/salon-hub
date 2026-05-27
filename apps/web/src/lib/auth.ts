// Authentication utility functions

export interface User {
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'EMPLOYEE';
  preferredServices?: string[];
  lastVisit?: string;
}

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'userToken',
  ROLE: 'userRole',
  USER: 'userData'
} as const;

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

/**
 * Get current user role
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
};

/**
 * Check if current user is admin
 */
export const isAdmin = (): boolean => {
  return getUserRole() === 'ADMIN';
};

/**
 * Check if current user is employee
 */
export const isEmployee = (): boolean => {
  const role = getUserRole();
  return role === 'EMPLOYEE' || role === 'ADMIN';
};

/**
 * Get stored user data
 */
export const getUserData = (): User | null => {
  const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Store user data in localStorage
 */
export const setUserData = (user: User, token: string): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, user.role);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};
