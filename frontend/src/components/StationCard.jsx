import React from 'react';
import './StationCard.css';

const StationCard = ({ station, progress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'delayed': return 'warning';
      case 'stopped': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '⚡';
      case 'completed': return '✅';
      case 'delayed': return '⚠️';
      case 'stopped': return '🛑';
      default: return '⏸️';
    }
  };

  return (
    <div className="station-card">
      <div className="station-header">
        <div>
          <h3 className="station-name">{station.station_name}</h3>
          <p className="station-id">{station.station_id}</p>
        </div>
        <span className={`badge badge-${getStatusColor(station.current_status)}`}>
          {getStatusIcon(station.current_status)} {station.current_status}
        </span>
      </div>
      
      <div className="station-body">
        <div className="station-info">
          <div className="info-item">
            <span className="info-label">Expected Time</span>
            <span className="info-value">{station.expected_time_minutes} min</span>
          </div>
          {progress && (
            <>
              <div className="info-item">
                <span className="info-label">Input</span>
                <span className="info-value">{progress.input_quantity_kg || 0} kg</span>
              </div>
              <div className="info-item">
                <span className="info-label">Output</span>
                <span className="info-value">{progress.output_quantity_kg || 0} kg</span>
              </div>
              <div className="info-item">
                <span className="info-label">Wastage</span>
                <span className="info-value text-danger">{progress.wastage_kg || 0} kg</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationCard;