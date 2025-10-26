import React, { useState } from 'react';
import { DecryptedTransaction } from '../types';
import { Trash2, Edit2, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: DecryptedTransaction[];
  onEdit: (transaction: DecryptedTransaction) => void;
  onDelete: (id: number) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchQuery === '' ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.merchant?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number, description: string) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {transaction.description}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {transaction.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                    {transaction.merchant && <span>{transaction.merchant}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <span className="text-lg font-bold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id, transaction.description)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
