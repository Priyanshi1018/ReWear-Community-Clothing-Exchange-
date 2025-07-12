export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50,
  },
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    LONG_TTL: 30 * 60 * 1000, // 30 minutes
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 1000,
    MESSAGE_MAX_LENGTH: 500,
    MAX_IMAGES: 5,
    MAX_TAGS: 10,
  },
  POINTS: {
    STARTING_POINTS: 100,
    BASE_POINTS: {
      clothing: 20,
      shoes: 25,
      accessories: 15,
      bags: 30,
      jewelry: 35,
      other: 10,
    },
    CONDITION_MULTIPLIER: {
      new: 1.5,
      "like-new": 1.2,
      good: 1.0,
      fair: 0.8,
    },
  },
  CATEGORIES: ["clothing", "shoes", "accessories", "bags", "jewelry", "other"],
  CONDITIONS: ["new", "like-new", "good", "fair"],
  SWAP_STATUSES: ["pending", "accepted", "rejected", "completed", "cancelled"],
} as const

export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: (field: string) => `${field} is required`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    INVALID_EMAIL: "Please enter a valid email address",
    WEAK_PASSWORD: "Password must contain at least 8 characters with uppercase, lowercase, and numbers",
    INVALID_CHOICE: (field: string, choices: string[]) => `${field} must be one of: ${choices.join(", ")}`,
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_EXISTS: "User already exists with this email",
    TOKEN_REQUIRED: "Access token required",
    INVALID_TOKEN: "Invalid or expired token",
    UNAUTHORIZED: "Unauthorized access",
    ADMIN_REQUIRED: "Admin access required",
  },
  ITEMS: {
    NOT_FOUND: "Item not found",
    NOT_AVAILABLE: "Item is not available for swap",
    OWNER_CANNOT_SWAP: "Cannot swap your own item",
    INSUFFICIENT_POINTS: "Insufficient points for this swap",
  },
  SWAPS: {
    NOT_FOUND: "Swap not found",
    NOT_PENDING: "Swap is no longer pending",
    INVALID_ITEM: "Invalid offered item",
  },
  SYSTEM: {
    INTERNAL_ERROR: "Internal server error",
    DATABASE_ERROR: "Database connection error",
    VALIDATION_ERROR: "Validation failed",
  },
} as const
