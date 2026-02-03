// Use environment variable for API URL, fallback to localhost for development
const getApiBaseUrl = (): string => {
  // Vite exposes env vars via import.meta.env
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  // Default to localhost for development
  return 'http://localhost:8082/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  IS_PRODUCTION: import.meta.env.PROD,
};