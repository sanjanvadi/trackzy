// Validation Utilities

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password validation
 * Requirements: At least 8 characters
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Get password strength
 * Returns: 'weak', 'medium', 'strong'
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';

  let strength = 0;

  // Length bonus
  if (password.length >= 12) strength++;

  // Has lowercase and uppercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;

  // Has numbers
  if (/\d/.test(password)) strength++;

  // Has special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 1) return 'weak';
  if (strength <= 3) return 'medium';
  return 'strong';
};

/**
 * Name validation (at least 2 characters)
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Amount validation
 */
export const isValidAmount = (amount: number | string): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && isFinite(num) && num > 0;
};

/**
 * Note validation (optional, max 500 characters)
 */
export const isValidNote = (note: string): boolean => {
  return note.length <= 500;
};

/**
 * Ledger name validation
 */
export const isValidLedgerName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

/**
 * Get validation error message
 */
export const getValidationError = (
  field: string,
  value: any,
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  }
): string | null => {
  const { required, minLength, maxLength, pattern, custom } = rules || {};

  // Required check
  if (required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${field} is required`;
  }

  // Skip other checks if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // Min length
  if (minLength && typeof value === 'string' && value.length < minLength) {
    return `${field} must be at least ${minLength} characters`;
  }

  // Max length
  if (maxLength && typeof value === 'string' && value.length > maxLength) {
    return `${field} must not exceed ${maxLength} characters`;
  }

  // Pattern matching
  if (pattern && typeof value === 'string' && !pattern.test(value)) {
    return `${field} format is invalid`;
  }

  // Custom validation
  if (custom && !custom(value)) {
    return `${field} is invalid`;
  }

  return null;
};

/**
 * Validate entire form object
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, Parameters<typeof getValidationError>[2]>
): Record<keyof T, string | null> => {
  const errors: any = {};

  for (const field in rules) {
    const error = getValidationError(
      String(field),
      data[field],
      rules[field]
    );
    errors[field] = error;
  }

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasFormErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some((error) => error !== null);
};

/**
 * Sanitize input (remove extra whitespace, trim)
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate date (must be valid date, not in future)
 */
export const isValidExpenseDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();

  // Check if valid date
  if (isNaN(date.getTime())) return false;

  // Check if not in future
  return date <= now;
};
