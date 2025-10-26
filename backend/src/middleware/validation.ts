import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};

// Common validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const transactionSchema = z.object({
  encrypted_data: z.string().min(1, 'Encrypted data is required'),
  iv: z.string().min(1, 'IV is required'),
  category: z.string().optional(),
  amount_encrypted: z.string().min(1, 'Encrypted amount is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});
