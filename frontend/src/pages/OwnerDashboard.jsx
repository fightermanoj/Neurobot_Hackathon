import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StationCard from '../components/StationCard';
import AlertBanner from '../components/AlertBanner';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await api.get('/dashboard/owner');
      setDashboardData(response.data);
      setLastUpdate(new Date());
      setLoading(false);
      console.log('Dashboard data updated at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.detail || error.message || 'Failed to fetch dashboard data');
      // Don't set loading to false on error to keep showing data if available
      if (!dashboardData) {
        setLoading(false);
      }
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/resolve`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const { stations, batches, alerts, workers, statistics } = dashboardData || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Complete production visibility across all stations</p>
          {lastUpdate && (
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              ⚠️ {error}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            👷
          </div>
          <div className="stat-content">
            <h3>{statistics?.total_workers || 0}</h3>
            <p>Total Workers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            ⚡
          </div>
          <div className="stat-content">
            <h3>{statistics?.active_stations || 0}</h3>
            <p>Active Stations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            📦
          </div>
          <div className="stat-content">
            <h3>{statistics?.total_batches || 0}</h3>
            <p>Active Batches</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            ⚠️
          </div>
          <div className="stat-content">
            <h3>{statistics?.delayed_stations || 0}</h3>
            <p>Delayed Stations</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <AlertBanner alerts={alerts} onResolve={handleResolveAlert} />
      )}

      {/* Active Batches */}
      <div className="section">
        <h2 className="section-title">📦 Active Batches</h2>
        {batches && batches.length > 0 ? (
          <div className="batches-grid">
            {batches.map((batch) => (
              <div key={batch.id} className="batch-card">
                <div className="batch-header">
                  <h3>{batch.batch_number}</h3>
                  <span className={`badge badge-${batch.overall_status === 'in_progress' ? 'success' : 'secondary'}`}>
                    {batch.overall_status}
                  </span>
                </div>
                <div className="batch-details">
                  <div className="batch-detail">
                    <span className="detail-label">Product:</span>
                    <span className="detail-value">{batch.product_name}</span>
                  </div>
                  <div className="batch-detail">
                    <span className="detail-label">Target:</span>
                    <span className="detail-value">{batch.target_quantity_kg} kg</span>
                  </div>
                  <div className="batch-detail">
                    <span className="detail-label">Current:</span>
                    <span className="detail-value">{batch.current_quantity_kg} kg</span>
                  </div>
                  <div className="batch-detail">
                    <span className="detail-label">Station:</span>
                    <span className="detail-value badge badge-info">{batch.current_station}</span>
                  </div>
                  <div className="batch-progress-bar">
                    <div 
                      className="batch-progress-fill"
                      style={{ width: `${(batch.current_quantity_kg / batch.target_quantity_kg * 100)}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {((batch.current_quantity_kg / batch.target_quantity_kg) * 100).toFixed(1)}% Complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No active batches at the moment</p>
          </div>
        )}
      </div>

      {/* All Stations */}
      <div className="section">
        <h2 className="section-title">🏭 All Production Stations</h2>
        <div className="stations-grid">
          {stations && stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      </div>

      {/* Workers Summary */}
      <div className="section">
        <h2 className="section-title">👷 Workers Overview</h2>
        <div className="workers-summary">
          <table className="workers-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Name</th>
                <th>Station</th>
                <th>Productivity</th>
                <th>Tasks Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workers && workers.slice(0, 10).map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.worker_id}</td>
                  <td>{worker.worker_name}</td>
                  <td>
                    <span className="badge badge-info">{worker.station_id}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${worker.productivity_score >= 80 ? 'success' : worker.productivity_score >= 60 ? 'warning' : 'danger'}`}>
                      {worker.productivity_score}%
                    </span>
                  </td>
                  <td>{worker.total_tasks_completed}</td>
                  <td>
                    <span className={`status-dot ${worker.is_active ? 'active' : 'inactive'}`}></span>
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workers && workers.length > 10 && (
            <div className="table-footer">
              <p>Showing 10 of {workers.length} workers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;