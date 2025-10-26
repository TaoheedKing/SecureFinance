import React from 'react';
import { Anomaly } from '../types';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
  onAcknowledge: (id: number) => void;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ anomalies, onAcknowledge }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
        };
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800',
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const getAnomalyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      unusual_amount: 'Unusual Amount',
      unusual_frequency: 'Unusual Frequency',
      large_transaction: 'Large Transaction',
      spending_spike: 'Spending Spike',
      unusual_category_amount: 'Unusual Category Amount',
    };
    return labels[type] || type;
  };

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Anomaly Detection</h2>
        </div>
        <p className="text-gray-600">
          No unusual spending patterns detected. Your spending appears normal.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Anomaly Detection</h2>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            {anomalies.filter((a) => !a.acknowledged).length} Active Alerts
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {anomalies.map((anomaly) => {
          const styles = getSeverityStyles(anomaly.severity);

          return (
            <div
              key={anomaly.id}
              className={`p-4 ${anomaly.acknowledged ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${styles.icon}`}>{getSeverityIcon(anomaly.severity)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getAnomalyTypeLabel(anomaly.anomaly_type)}
                    </span>
                  </div>

                  <p className={`text-sm font-medium ${styles.text} mb-1`}>
                    {anomaly.description || 'Unusual pattern detected'}
                  </p>

                  <p className="text-xs text-gray-500">
                    Detected {format(new Date(anomaly.detected_at), 'MMM dd, yyyy HH:mm')}
                  </p>

                  {anomaly.acknowledged && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Acknowledged</span>
                    </div>
                  )}
                </div>

                {!anomaly.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(anomaly.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Acknowledge this alert"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
