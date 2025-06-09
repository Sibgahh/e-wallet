import { ZodSchema } from 'zod';
import { ApiResponse } from '../types';
/**
 * Validates data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns An object with the validation result
 */
export declare function validateSchema<T>(schema: ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
};
/**
 * Formats an API response
 * @param success Whether the operation was successful
 * @param data Optional data to include in the response
 * @param error Optional error message
 * @returns A formatted API response
 */
export declare function formatApiResponse<T>(success: boolean, data?: T, error?: string): ApiResponse<T>;
/**
 * Validates and formats currency codes
 * @param currency The currency code to validate
 * @returns The validated currency code
 */
export declare function validateCurrency(currency: string): string;
/**
 * Validates and formats monetary amounts
 * @param amount The amount to validate
 * @returns The validated amount
 */
export declare function validateAmount(amount: number): number;
