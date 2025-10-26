import { Response } from 'express';
import { AnomalyModel } from '../models/Anomaly';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAnomalies = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const anomalies = AnomalyModel.findByUserId(userId, limit);

    res.json({
      count: anomalies.length,
      anomalies,
    });
  } catch (error) {
    throw new AppError('Failed to retrieve anomalies', 500);
  }
};

export const getUnacknowledgedAnomalies = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;

    const anomalies = AnomalyModel.findUnacknowledged(userId);

    res.json({
      count: anomalies.length,
      anomalies,
    });
  } catch (error) {
    throw new AppError('Failed to retrieve unacknowledged anomalies', 500);
  }
};

export const acknowledgeAnomaly = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const anomalyId = parseInt(req.params.id);

    const anomaly = AnomalyModel.findById(anomalyId);

    if (!anomaly) {
      throw new AppError('Anomaly not found', 404);
    }

    if (anomaly.user_id !== userId) {
      throw new AppError('Unauthorized access to anomaly', 403);
    }

    const acknowledged = AnomalyModel.acknowledge(anomalyId);

    if (!acknowledged) {
      throw new AppError('Failed to acknowledge anomaly', 500);
    }

    res.json({ message: 'Anomaly acknowledged successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to acknowledge anomaly', 500);
  }
};

export const createAnomaly = (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.userId;
    const { transaction_id, anomaly_type, severity, description } = req.body;

    const anomaly = AnomalyModel.create({
      user_id: userId,
      transaction_id,
      anomaly_type,
      severity,
      description,
    });

    res.status(201).json({
      message: 'Anomaly created successfully',
      anomaly,
    });
  } catch (error) {
    throw new AppError('Failed to create anomaly', 500);
  }
};
