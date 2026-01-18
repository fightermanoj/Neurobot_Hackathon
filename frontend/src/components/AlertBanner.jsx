import React from 'react';
import './AlertBanner.css';

const AlertBanner = ({ alerts, onResolve }) => {
  if (!alerts || alerts.length === 0) return null;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="alert-banner">
      <h3 className="alert-title">🔔 Active Alerts ({alerts.length})</h3>
      <div className="alert-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
            <div className="alert-content">
              <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
              <div className="alert-text">
                <p className="alert-message">{alert.message}</p>
                <p className="alert-meta">
                  {alert.station_id} • {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            {onResolve && (
              <button
                className="alert-resolve-btn"
                onClick={() => onResolve(alert.id)}
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertBanner;