// Form Validation Utilities
import { APP_CONFIG } from "../Config/constants";

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (10 digit)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Password strength check
export const isStrongPassword = (password: string): boolean => {
  return password.length >= APP_CONFIG.MIN_PASSWORD_LENGTH;
};

// Transaction ID validation
export const isValidTransactionId = (trxId: string): boolean => {
  return trxId.length >= 8 && trxId.length <= 20;
};

// Last 4 digits validation
export const isValidLast4Digits = (digits: string): boolean => {
  return /^[0-9]{4}$/.test(digits);
};

// Field validator
export function validateField(
  value: string,
  rules: FieldValidation
): string | null {
  // Required check
  if (rules.required && !value.trim()) {
    return "This field is required";
  }

  if (!value.trim()) {
    return null; // Empty but not required
  }

  // Min length
  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  // Max length
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  // Pattern matching
  if (rules.pattern && !rules.pattern.test(value)) {
    return "Invalid format";
  }

  // Custom validators
  if (rules.custom) {
    for (const rule of rules.custom) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
  }

  return null;
}

// Validate entire form
export function validateForm(
  formData: Record<string, string>,
  validationRules: Record<string, FieldValidation>
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, value] of Object.entries(formData)) {
    const rules = validationRules[field];
    if (rules) {
      const error = validateField(value, rules);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
}

// Predefined validation rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: [
      {
        validate: isValidEmail,
        message: "Please enter a valid email address",
      },
    ],
  } as FieldValidation,

  password: {
    required: true,
    minLength: APP_CONFIG.MIN_PASSWORD_LENGTH,
    custom: [
      {
        validate: isStrongPassword,
        message: `Password must be at least ${APP_CONFIG.MIN_PASSWORD_LENGTH} characters long`,
      },
    ],
  } as FieldValidation,

  phone: {
    required: true,
    pattern: /^[0-9]{10}$/,
    custom: [
      {
        validate: isValidPhone,
        message: "Please enter a valid 10-digit phone number",
      },
    ],
  } as FieldValidation,

  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  } as FieldValidation,

  transactionId: {
    required: true,
    minLength: 8,
    maxLength: 20,
    custom: [
      {
        validate: isValidTransactionId,
        message: "Transaction ID must be 8-20 characters",
      },
    ],
  } as FieldValidation,

  last4Digits: {
    required: true,
    pattern: /^[0-9]{4}$/,
    custom: [
      {
        validate: isValidLast4Digits,
        message: "Please enter exactly 4 digits",
      },
    ],
  } as FieldValidation,
};

// Helper to check if form has errors
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Helper to get first error message
export const getFirstError = (errors: ValidationErrors): string | null => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};
