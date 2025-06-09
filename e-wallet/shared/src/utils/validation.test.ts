import { validateSchema, formatApiResponse, validateCurrency, validateAmount } from './validation';
import { z } from 'zod';

describe('Validation Utilities', () => {
  describe('validateSchema', () => {
    const TestSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(3),
      age: z.number().min(18),
    });

    it('should validate a valid object', () => {
      const testData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        age: 25,
      };

      const result = validateSchema(TestSchema, testData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid object', () => {
      const testData = {
        id: 'not-a-uuid',
        name: 'Jo', // too short
        age: 16, // too young
      };

      const result = validateSchema(TestSchema, testData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('formatApiResponse', () => {
    it('should format successful response', () => {
      const data = { id: '123', name: 'Test' };
      const result = formatApiResponse(true, data);
      
      expect(result).toEqual({
        success: true,
        data,
        error: undefined,
      });
    });

    it('should format error response', () => {
      const error = 'Something went wrong';
      const result = formatApiResponse(false, undefined, error);
      
      expect(result).toEqual({
        success: false,
        data: undefined,
        error,
      });
    });
  });

  describe('validateCurrency', () => {
    it('should validate and normalize valid currency codes', () => {
      expect(validateCurrency('USD')).toBe('USD');
      expect(validateCurrency('usd')).toBe('USD');
      expect(validateCurrency('eUr')).toBe('EUR');
    });

    it('should throw error for invalid currency codes', () => {
      expect(() => validateCurrency('US')).toThrow();
      expect(() => validateCurrency('USDD')).toThrow();
      expect(() => validateCurrency('123')).toThrow();
    });
  });

  describe('validateAmount', () => {
    it('should validate and format valid amounts', () => {
      expect(validateAmount(100)).toBe(100);
      expect(validateAmount(99.99)).toBe(99.99);
      expect(validateAmount(0)).toBe(0);
    });

    it('should round to two decimal places', () => {
      expect(validateAmount(100.125)).toBe(100.13);
      expect(validateAmount(99.999)).toBe(100);
    });

    it('should throw error for negative amounts', () => {
      expect(() => validateAmount(-1)).toThrow();
      expect(() => validateAmount(-0.01)).toThrow();
    });

    it('should throw error for NaN', () => {
      expect(() => validateAmount(NaN)).toThrow();
    });
  });
}); 