import React from 'react';
import './WorkerCard.css';

const WorkerCard = ({ worker }) => {
  const getProductivityColor = (score) => {
    if (!score && score !== 0) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Safe defaults for missing data
  const workerName = worker?.worker_name || 'Unknown';
  const workerId = worker?.worker_id || 'N/A';
  const stationId = worker?.station_id || 'N/A';
  const productivityScore = worker?.productivity_score ?? 0;
  const totalTasks = worker?.total_tasks_completed ?? 0;
  const isActive = worker?.is_active ?? false;

  // Get first letter for avatar, or '?' if name is empty
  const avatarLetter = workerName && workerName.length > 0 
    ? workerName.charAt(0).toUpperCase() 
    : '?';

  return (
    <div className="worker-card">
      <div className="worker-header">
        <div className="worker-avatar">
          {avatarLetter}
        </div>
        <div className="worker-info">
          <h4 className="worker-name">{workerName}</h4>
          <p className="worker-id">{workerId}</p>
        </div>
      </div>
      
      <div className="worker-details">
        <div className="detail-row">
          <span className="detail-label">Station:</span>
          <span className={`badge badge-info`}>{stationId}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Productivity:</span>
          <span className={`badge badge-${getProductivityColor(productivityScore)}`}>
            {productivityScore}%
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Tasks Completed:</span>
          <span className="detail-value">{totalTasks}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Active' : '🔴 Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;