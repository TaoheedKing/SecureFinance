import React, { useState } from 'react';
import { AuthContext, useAuthState } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useAnomalies } from './hooks/useAnomalies';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import { DecryptedTransaction, TransactionInput } from './types';
import { Plus, Loader } from 'lucide-react';

function App() {
  const authState = useAuthState();
  const { isAuthenticated, isLoading: authLoading, encryptionKey } = authState;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<DecryptedTransaction | null>(null);

  const {
    transactions,
    isLoading: txLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(encryptionKey);

  const { anomalies, acknowledgeAnomaly } = useAnomalies();

  const handleAuthSubmit = async (email: string, password: string) => {
    if (authMode === 'login') {
      await authState.login(email, password);
    } else {
      await authState.register(email, password);
    }
  };

  const handleCreateTransaction = async (data: TransactionInput) => {
    await createTransaction(data);
    setShowTransactionForm(false);
  };

  const handleUpdateTransaction = async (data: TransactionInput) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    }
  };

  const handleEdit = (transaction: DecryptedTransaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContext.Provider value={authState}>
        <AuthForm
          mode={authMode}
          onSubmit={handleAuthSubmit}
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      <Layout>
        <div className="space-y-6">
          {/* Header with Add Transaction Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Financial Dashboard</h2>
              <p className="text-gray-600 mt-1">Track and analyze your spending patterns</p>
            </div>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-lg shadow-primary-500/30"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          {/* Anomaly Alerts */}
          <AnomalyAlerts anomalies={anomalies} onAcknowledge={acknowledgeAnomaly} />

          {/* Dashboard with Charts */}
          {txLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your financial data...</p>
            </div>
          ) : transactions.length > 0 ? (
            <Dashboard transactions={transactions} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-600 mb-4">No transactions yet</p>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Transaction
              </button>
            </div>
          )}

          {/* Transaction List */}
          {transactions.length > 0 && (
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={deleteTransaction}
            />
          )}
        </div>

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <TransactionForm
            onSubmit={handleCreateTransaction}
            onCancel={() => setShowTransactionForm(false)}
          />
        )}

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <TransactionForm
            onSubmit={handleUpdateTransaction}
            onCancel={handleCancelEdit}
            initialData={{
              amount: editingTransaction.amount,
              description: editingTransaction.description,
              category: editingTransaction.category,
              merchant: editingTransaction.merchant,
              date: editingTransaction.date,
            }}
            isEdit
          />
        )}
      </Layout>
    </AuthContext.Provider>
  );
}

export default App;
