import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';
import { validate, transactionSchema } from '../middleware/validation';

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);

router.post('/', validate(transactionSchema), createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.put('/:id', validate(transactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
