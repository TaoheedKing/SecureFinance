import React, { useMemo } from 'react';
import { DecryptedTransaction, CategorySummary } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  transactions: DecryptedTransaction[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const count = transactions.length;
    const average = count > 0 ? total / count : 0;

    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    transactions.forEach((tx) => {
      const category = tx.category || 'Uncategorized';
      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      categoryMap.set(category, {
        total: existing.total + tx.amount,
        count: existing.count + 1,
      });
    });

    const byCategory: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly breakdown (last 6 months)
    const monthlyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      const month = format(new Date(tx.date), 'MMM yyyy');
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + tx.amount);
    });

    const byMonth = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);

    // Recent trend (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentTotal = transactions
      .filter((tx) => new Date(tx.date) >= thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousTotal = transactions
      .filter((tx) => new Date(tx.date) >= sixtyDaysAgo && new Date(tx.date) < thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const trend = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      total,
      average,
      count,
      byCategory,
      byMonth,
      trend,
      recentTotal,
    };
  }, [transactions]);

  const dailySpending = useMemo(() => {
    const dailyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      const date = tx.date;
      dailyMap.set(date, (dailyMap.get(date) || 0) + tx.amount);
    });

    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.total.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.average.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.count}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">30-Day Trend</p>
              <p className={`text-2xl font-bold mt-2 ${stats.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              stats.trend >= 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {stats.trend >= 0 ? (
                <TrendingUp className="w-6 h-6 text-red-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'MM/dd')}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={stats.byCategory}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category}: $${entry.total.toFixed(0)}`}
              >
                {stats.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* Monthly Spending */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {stats.byCategory.map((category, index) => (
            <div key={category.category} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${category.total.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
              <span className="ml-3 text-xs text-gray-500 w-12 text-right">
                {category.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
