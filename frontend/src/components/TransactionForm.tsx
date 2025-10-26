import React, { useState } from 'react';
import { X, DollarSign, FileText, Tag, Calendar, Loader } from 'lucide-react';
import { TransactionInput } from '../types';

interface TransactionFormProps {
  onSubmit: (transaction: TransactionInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TransactionInput>;
  isEdit?: boolean;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Other',
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        amount: amountNum,
        description: description.trim(),
        category,
        merchant: merchant.trim() || undefined,
        date,
      });

      // Reset form if not editing
      if (!isEdit) {
        setAmount('');
        setDescription('');
        setMerchant('');
        setCategory(CATEGORIES[0]);
        setDate(new Date().toISOString().split('T')[0]);
      }

      onCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="What was this expense for?"
                rows={3}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-2">
              Merchant (Optional)
            </label>
            <input
              id="merchant"
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Store or vendor name"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update' : 'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
