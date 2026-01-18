import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StationCard from '../components/StationCard';
import WorkerCard from '../components/WorkerCard';
import AlertBanner from '../components/AlertBanner';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/dashboard/manager/${user.id}`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchDashboardData]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  const { assigned_stations, stations, workers, batches, alerts } = dashboardData || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Monitoring {assigned_stations?.length || 0} assigned stations</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Assigned Stations Overview */}
      <div className="assigned-stations-badge">
        <h3>Your Stations:</h3>
        <div className="stations-badges">
          {assigned_stations?.map((stationId) => (
            <span key={stationId} className="badge badge-info">
              {stationId}
            </span>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <AlertBanner alerts={alerts} />
      )}

      {/* Active Batches in Assigned Stations */}
      {batches && batches.length > 0 && (
        <div className="section">
          <h2 className="section-title">📦 Batches in Your Stations</h2>
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
                    <span className="detail-label">Current Station:</span>
                    <span className="detail-value badge badge-info">{batch.current_station}</span>
                  </div>
                  <div className="batch-detail">
                    <span className="detail-label">Target:</span>
                    <span className="detail-value">{batch.target_quantity_kg} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stations */}
      <div className="section">
        <h2 className="section-title">🏭 Your Stations</h2>
        <div className="stations-grid">
          {stations && stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      </div>

      {/* Workers */}
      <div className="section">
        <h2 className="section-title">👷 Your Team ({workers?.length || 0} Workers)</h2>
        <div className="workers-grid">
          {workers && workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;