import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Transaction, DecryptedTransaction, TransactionInput } from '../types';
import { encryptTransaction, decryptTransaction } from '../utils/encryption';

export const useTransactions = (encryptionKey: CryptoKey | null) => {
  const [transactions, setTransactions] = useState<DecryptedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!encryptionKey) {
        setError('Encryption key not available');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getTransactions(startDate, endDate);

        // Decrypt all transactions
        const decrypted = await Promise.all(
          response.transactions.map(async (tx) => {
            try {
              const decryptedData = await decryptTransaction(
                tx.encrypted_data,
                tx.iv,
                encryptionKey
              );

              return {
                id: tx.id,
                ...decryptedData,
                date: tx.date,
                created_at: tx.created_at,
                updated_at: tx.updated_at,
              };
            } catch (err) {
              console.error('Error decrypting transaction:', err);
              throw new Error('Failed to decrypt transaction data');
            }
          })
        );

        setTransactions(decrypted);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    },
    [encryptionKey]
  );

  const createTransaction = async (input: TransactionInput) => {
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const encrypted = await encryptTransaction(input, encryptionKey);

      await api.createTransaction({
        ...encrypted,
        category: input.category,
        date: input.date,
      });

      // Refresh transactions
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: number, input: TransactionInput) => {
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const encrypted = await encryptTransaction(input, encryptionKey);

      await api.updateTransaction(id, {
        ...encrypted,
        category: input.category,
        date: input.date,
      });

      // Refresh transactions
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.deleteTransaction(id);

      // Remove from local state
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (encryptionKey) {
      fetchTransactions();
    }
  }, [encryptionKey, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
