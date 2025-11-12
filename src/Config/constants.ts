// Constants for better maintainability
export const APP_CONFIG = {
  // API Configuration
  API_TIMEOUT: 10000,
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,

  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,

  // Cache Times (in milliseconds)
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
  },

  // Booking
  ADVANCE_PAYMENT_PERCENTAGE: 0.2, // 20%
  MIN_BOOKING_ADVANCE_MINUTES: 30, // Minimum 30 minutes before slot starts
  MAX_BOOKING_DAYS_AHEAD: 30, // Can book up to 30 days in advance

  // File Upload
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGES_PER_TURF: 10,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  PHONE_REGEX: /^(\+8801|01)[3-9]\d{8}$/,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "auth_token",
    USER_PREFERENCES: "user_preferences",
    CART: "booking_cart",
    RECENT_SEARCHES: "recent_searches",
  },

  // UI
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
  ANIMATION_DURATION: 300,

  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === "true",
    ENABLE_DARK_MODE: false,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You need to log in to access this feature.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  GENERIC_ERROR: "An unexpected error occurred.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "Booking created successfully! Waiting for confirmation.",
  BOOKING_CANCELLED: "Booking cancelled successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  EMAIL_VERIFIED: "Email verified successfully.",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  REGISTRATION_SUCCESS: "Registration successful! Please verify your email.",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  TURFS: "/turfs",
  TURF_DETAILS: (slug: string) => `/turfs/${slug}`,
  ABOUT: "/about",
  CONTACT: "/contact",
  GALLERY: "/gallery",
  
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_EMAIL: "/auth/verify-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  
  // Dashboard
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",
  MY_BOOKINGS: "/dashboard/my-bookings",
  
  // Admin
  ADMIN_BOOKINGS: "/dashboard/admin/bookings",
  ADMIN_TURFS: "/dashboard/admin/turfs",
  ADMIN_STATISTICS: "/dashboard/admin/statistics",
  
  // Manager
  MANAGER_TURFS: "/dashboard/manager/turfs",
  MANAGER_CREATE_TURF: "/dashboard/manager/create-turf",
  MANAGER_USERS: "/dashboard/manager/users",
  
  // Payment
  PAYMENT_SUCCESS: "/payment/success",
  PAYMENT_FAILED: "/payment/failed",
  PAYMENT_CANCELLED: "/payment/cancelled",
} as const;

// Day Types
export const DAY_TYPES = {
  FRIDAY_SATURDAY: "friday-saturday",
  SUNDAY_THURSDAY: "sunday-thursday",
  ALL_DAYS: "all-days",
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MANAGER: "manager",
} as const;
