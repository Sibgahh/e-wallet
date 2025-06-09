import { ZodError, ZodSchema } from 'zod';
import { ApiResponse } from '../types';

/**
 * Validates data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns An object with the validation result
 */
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  error?: string 
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Formats an API response
 * @param success Whether the operation was successful
 * @param data Optional data to include in the response
 * @param error Optional error message
 * @returns A formatted API response
 */
export function formatApiResponse<T>(success: boolean, data?: T, error?: string): ApiResponse<T> {
  return { success, data, error };
}

/**
 * Validates and formats currency codes
 * @param currency The currency code to validate
 * @returns The validated currency code
 */
export function validateCurrency(currency: string): string {
  const normalized = currency.toUpperCase();
  // Simple validation for currency codes (ISO 4217)
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('Invalid currency code. Must be a 3-letter code.');
  }
  return normalized;
}

/**
 * Validates and formats monetary amounts
 * @param amount The amount to validate
 * @returns The validated amount
 */
export function validateAmount(amount: number): number {
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount. Must be a non-negative number.');
  }
  
  // Convert to 2 decimal places
  return Math.round(amount * 100) / 100;
} 