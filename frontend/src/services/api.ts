import axios, { AxiosInstance } from 'axios';
import { AuthResponse, Transaction, Anomaly } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle unauthorized responses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', {
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getProfile(): Promise<{ id: number; email: string; created_at: string }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Transaction endpoints
  async createTransaction(data: {
    encrypted_data: string;
    iv: string;
    category?: string;
    amount_encrypted: string;
    date: string;
  }): Promise<{ message: string; transaction: Transaction }> {
    const response = await this.api.post('/transactions', data);
    return response.data;
  }

  async getTransactions(
    startDate?: string,
    endDate?: string
  ): Promise<{ count: number; transactions: Transaction[] }> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await this.api.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: number): Promise<{ transaction: Transaction }> {
    const response = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  async updateTransaction(
    id: number,
    data: {
      encrypted_data: string;
      iv: string;
      category?: string;
      amount_encrypted: string;
      date: string;
    }
  ): Promise<{ message: string; transaction: Transaction }> {
    const response = await this.api.put(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/transactions/${id}`);
    return response.data;
  }

  // Anomaly endpoints
  async getAnomalies(limit?: number): Promise<{ count: number; anomalies: Anomaly[] }> {
    const params = limit ? { limit } : {};
    const response = await this.api.get('/anomalies', { params });
    return response.data;
  }

  async getUnacknowledgedAnomalies(): Promise<{ count: number; anomalies: Anomaly[] }> {
    const response = await this.api.get('/anomalies/unacknowledged');
    return response.data;
  }

  async acknowledgeAnomaly(id: number): Promise<{ message: string }> {
    const response = await this.api.patch(`/anomalies/${id}/acknowledge`);
    return response.data;
  }

  async createAnomaly(data: {
    transaction_id?: number;
    anomaly_type: string;
    severity: 'low' | 'medium' | 'high';
    description?: string;
  }): Promise<{ message: string; anomaly: Anomaly }> {
    const response = await this.api.post('/anomalies', data);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const api = new ApiService();
