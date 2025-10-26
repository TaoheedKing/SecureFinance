import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create new user
    const user = await UserModel.create({ email, password });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    UserModel.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Login failed', 500);
  }
};

export const getProfile = (req: Request, res: Response): void => {
  const authReq = req as any;
  const user = UserModel.findById(authReq.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
};
