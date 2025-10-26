export interface User {
  id: number;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Transaction {
  id: number;
  user_id: number;
  encrypted_data: string;
  iv: string;
  category: string | null;
  amount_encrypted: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedTransaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  date: string;
}

export interface Anomaly {
  id: number;
  user_id: number;
  transaction_id: number | null;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string | null;
  detected_at: string;
  acknowledged: boolean;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ChartData {
  date: string;
  amount: number;
  category?: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SpendingSummary {
  total: number;
  average: number;
  count: number;
  byCategory: CategorySummary[];
  byMonth: { month: string; total: number }[];
}
