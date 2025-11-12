// Enhanced API Client with Retry Logic and Better Error Handling
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { authStore } from "../Store/auth";
import type { ApiResponse } from "../types/api.types";
import { APP_CONFIG, ERROR_MESSAGES } from "../Config/constants";
import { toast } from "sonner";
import { logger } from "../utils/logger";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Retry Logic Helper
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryRequest(
  config: CustomAxiosRequestConfig,
  maxRetries: number = APP_CONFIG.API_RETRY_ATTEMPTS,
): Promise<AxiosResponse> {
  const retryCount = config._retryCount || 0;

  if (retryCount >= maxRetries) {
    throw new Error("Max retries reached");
  }

  await wait(APP_CONFIG.API_RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff

  config._retryCount = retryCount + 1;
  return api.request(config);
}

async function refreshAccessToken() {
  try {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh-token",
      {},
    );
    return response.data.data?.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    authStore.getState().logout();
    window.location.href = "/auth/login";
    throw error;
  }
}

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    logger.request(config);

    return config;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  },
);

// Response Interceptor with Better Error Handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    logger.response(response);
    return response;
  },
  async (error: AxiosError) => {
    // Log error in development
    logger.error(error);
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle Network Errors (no response from server)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error(ERROR_MESSAGES.TIMEOUT_ERROR);
      } else if (error.message === "Network Error") {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      // Retry on network errors
      if (
        !originalRequest._retry &&
        originalRequest._retryCount! < APP_CONFIG.API_RETRY_ATTEMPTS
      ) {
        originalRequest._retry = true;
        return retryRequest(originalRequest);
      }

      return Promise.reject(error);
    }

    const status = error.response.status;

    // Handle 401 Unauthorized - Token Refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          authStore.getState().setTokens(newAccessToken);
          originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle Other Status Codes
    switch (status) {
      case 403:
        toast.error(ERROR_MESSAGES.FORBIDDEN);
        break;
      case 404:
        // Don't show toast for 404 (handled by component)
        break;
      case 429:
        toast.error("Too many requests. Please slow down.");
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
        // Retry server errors
        if (
          !originalRequest._retry &&
          originalRequest._retryCount! < APP_CONFIG.API_RETRY_ATTEMPTS
        ) {
          originalRequest._retry = true;
          return retryRequest(originalRequest);
        }
        break;
      default:
        // Let component handle specific error messages
        break;
    }

    return Promise.reject(error);
  },
);

// Helper function to check if error is an API error
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const apiError = error.response?.data as { message?: string };
    return apiError?.message || error.message || ERROR_MESSAGES.GENERIC_ERROR;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.GENERIC_ERROR;
}

export default api;
