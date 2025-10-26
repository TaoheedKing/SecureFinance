import { Transaction } from '../models/Transaction';
import { AnomalyModel, AnomalyCreateInput } from '../models/Anomaly';

interface DecryptedTransaction {
  id: number;
  amount: number;
  category: string | null;
  date: string;
  description?: string;
}

interface AnomalyResult {
  isAnomaly: boolean;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Anomaly Detection Algorithm
 * Detects unusual spending patterns using statistical methods
 */
export class AnomalyDetector {
  /**
   * Calculate mean of an array of numbers
   */
  private static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private static standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate z-score for a value
   */
  private static zScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  /**
   * Detect if a transaction amount is anomalous using z-score method
   */
  static detectAmountAnomaly(
    amount: number,
    historicalAmounts: number[],
    threshold: number = 2.5
  ): AnomalyResult {
    if (historicalAmounts.length < 5) {
      return {
        isAnomaly: false,
        type: 'insufficient_data',
        severity: 'low',
        description: 'Not enough historical data for analysis',
      };
    }

    const mean = this.mean(historicalAmounts);
    const stdDev = this.standardDeviation(historicalAmounts);
    const zScore = this.zScore(amount, mean, stdDev);

    if (Math.abs(zScore) > threshold) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (Math.abs(zScore) > 4) severity = 'high';
      else if (Math.abs(zScore) > 3) severity = 'medium';

      return {
        isAnomaly: true,
        type: 'unusual_amount',
        severity,
        description: `Transaction amount ($${amount.toFixed(2)}) is ${Math.abs(zScore).toFixed(1)} standard deviations from your average ($${mean.toFixed(2)})`,
      };
    }

    return {
      isAnomaly: false,
      type: 'normal',
      severity: 'low',
      description: 'Transaction amount is within normal range',
    };
  }

  /**
   * Detect unusual frequency of transactions in a category
   */
  static detectFrequencyAnomaly(
    category: string,
    recentCount: number,
    historicalAverage: number,
    threshold: number = 2.0
  ): AnomalyResult {
    if (historicalAverage === 0) {
      return {
        isAnomaly: false,
        type: 'new_category',
        severity: 'low',
        description: 'New category - establishing baseline',
      };
    }

    const ratio = recentCount / historicalAverage;

    if (ratio > threshold) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (ratio > 4) severity = 'high';
      else if (ratio > 3) severity = 'medium';

      return {
        isAnomaly: true,
        type: 'unusual_frequency',
        severity,
        description: `Unusual number of ${category} transactions (${recentCount} vs average ${historicalAverage.toFixed(1)})`,
      };
    }

    return {
      isAnomaly: false,
      type: 'normal',
      severity: 'low',
      description: 'Transaction frequency is normal',
    };
  }

  /**
   * Detect large transactions (above certain threshold)
   */
  static detectLargeTransaction(
    amount: number,
    percentile90: number
  ): AnomalyResult {
    if (amount > percentile90 * 2) {
      return {
        isAnomaly: true,
        type: 'large_transaction',
        severity: amount > percentile90 * 5 ? 'high' : 'medium',
        description: `Large transaction detected: $${amount.toFixed(2)} (significantly above your typical spending)`,
      };
    }

    return {
      isAnomaly: false,
      type: 'normal',
      severity: 'low',
      description: 'Transaction size is normal',
    };
  }

  /**
   * Detect spending spikes in a time period
   */
  static detectSpendingSpike(
    periodTotal: number,
    historicalPeriodAverages: number[],
    threshold: number = 1.5
  ): AnomalyResult {
    if (historicalPeriodAverages.length < 3) {
      return {
        isAnomaly: false,
        type: 'insufficient_data',
        severity: 'low',
        description: 'Not enough historical data',
      };
    }

    const avgPeriodSpending = this.mean(historicalPeriodAverages);

    if (periodTotal > avgPeriodSpending * threshold) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (periodTotal > avgPeriodSpending * 2.5) severity = 'high';
      else if (periodTotal > avgPeriodSpending * 2) severity = 'medium';

      return {
        isAnomaly: true,
        type: 'spending_spike',
        severity,
        description: `High spending period: $${periodTotal.toFixed(2)} (avg: $${avgPeriodSpending.toFixed(2)})`,
      };
    }

    return {
      isAnomaly: false,
      type: 'normal',
      severity: 'low',
      description: 'Spending is within normal range',
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private static percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Comprehensive anomaly analysis for a new transaction
   * Note: This operates on decrypted data on the client side
   * The server only stores encrypted transactions
   */
  static analyzeTransaction(
    newTransaction: { amount: number; category: string | null },
    historicalTransactions: { amount: number; category: string | null; date: string }[]
  ): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];

    // Extract amounts
    const amounts = historicalTransactions.map(t => t.amount);
    const sortedAmounts = [...amounts].sort((a, b) => a - b);

    // Check for unusual amount
    const amountAnomaly = this.detectAmountAnomaly(newTransaction.amount, amounts);
    if (amountAnomaly.isAnomaly) {
      anomalies.push(amountAnomaly);
    }

    // Check for large transaction
    if (amounts.length >= 10) {
      const p90 = this.percentile(sortedAmounts, 90);
      const largeTransAnomaly = this.detectLargeTransaction(newTransaction.amount, p90);
      if (largeTransAnomaly.isAnomaly) {
        anomalies.push(largeTransAnomaly);
      }
    }

    // Category-based analysis
    if (newTransaction.category) {
      const categoryTransactions = historicalTransactions.filter(
        t => t.category === newTransaction.category
      );

      if (categoryTransactions.length >= 5) {
        const categoryAmounts = categoryTransactions.map(t => t.amount);
        const categoryAnomaly = this.detectAmountAnomaly(
          newTransaction.amount,
          categoryAmounts,
          2.0
        );

        if (categoryAnomaly.isAnomaly) {
          anomalies.push({
            ...categoryAnomaly,
            type: 'unusual_category_amount',
            description: `Unusual amount for ${newTransaction.category}: ${categoryAnomaly.description}`,
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Analyze all transactions for anomalies
   * This should be called periodically or after batch imports
   */
  static batchAnalyze(
    userId: number,
    transactions: { id: number; amount: number; category: string | null; date: string }[]
  ): void {
    if (transactions.length < 10) return;

    const amounts = transactions.map(t => t.amount);
    const mean = this.mean(amounts);
    const stdDev = this.standardDeviation(amounts);

    // Detect anomalous transactions
    transactions.forEach(transaction => {
      const zScore = this.zScore(transaction.amount, mean, stdDev);

      if (Math.abs(zScore) > 2.5) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (Math.abs(zScore) > 4) severity = 'high';
        else if (Math.abs(zScore) > 3) severity = 'medium';

        const anomalyData: AnomalyCreateInput = {
          user_id: userId,
          transaction_id: transaction.id,
          anomaly_type: 'unusual_amount',
          severity,
          description: `Amount ($${transaction.amount.toFixed(2)}) is ${Math.abs(zScore).toFixed(1)}σ from average`,
        };

        AnomalyModel.create(anomalyData);
      }
    });
  }
}
