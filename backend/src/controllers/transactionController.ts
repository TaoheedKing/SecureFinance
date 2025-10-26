import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createTransaction = (req: AuthRequest, res: Response): void => {
  try {
    const { encrypted_data, iv, category, amount_encrypted, date } = req.body;
    const userId = req.user!.userId;

    const transaction = TransactionModel.create({
      user_id: userId,
      encrypted_data,
      iv,
      category,
      amount_encrypted,
      date,
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    throw new AppError('Failed to create transaction', 500);
  }
};

export const getTransactions = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const { start_date, end_date } = req.query;

    let transactions;

    if (start_date && end_date) {
      transactions = TransactionModel.findByUserIdAndDateRange(
        userId,
        start_date as string,
        end_date as string
      );
    } else {
      transactions = TransactionModel.findByUserId(userId);
    }

    res.json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    throw new AppError('Failed to retrieve transactions', 500);
  }
};

export const getTransaction = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    const transaction = TransactionModel.findById(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Ensure transaction belongs to the user
    if (transaction.user_id !== userId) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    res.json({ transaction });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to retrieve transaction', 500);
  }
};

export const updateTransaction = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    const existingTransaction = TransactionModel.findById(transactionId);

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (existingTransaction.user_id !== userId) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    const { encrypted_data, iv, category, amount_encrypted, date } = req.body;

    const updatedTransaction = TransactionModel.update(transactionId, {
      encrypted_data,
      iv,
      category,
      amount_encrypted,
      date,
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update transaction', 500);
  }
};

export const deleteTransaction = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    const transaction = TransactionModel.findById(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.user_id !== userId) {
      throw new AppError('Unauthorized access to transaction', 403);
    }

    const deleted = TransactionModel.delete(transactionId);

    if (!deleted) {
      throw new AppError('Failed to delete transaction', 500);
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete transaction', 500);
  }
};
