import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WorkerCard from '../components/WorkerCard';
import './WorkerTracking.css';

const WorkerTracking = () => {
  const [workers, setWorkers] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
    fetchStations();
    const interval = setInterval(fetchWorkers, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      setWorkers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await api.get('/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesStation = selectedStation === 'all' || worker.station_id === selectedStation;
    const workerName = worker.worker_name || '';
    const workerId = worker.worker_id || '';
    const matchesSearch = workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workerId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStation && matchesSearch;
  });

  const getStationDistribution = () => {
    const distribution = {};
    workers.forEach(worker => {
      const stationId = worker.station_id || 'unknown';
      distribution[stationId] = (distribution[stationId] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getStationDistribution();

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="worker-tracking-page">
      <div className="page-header">
        <h1>👷 Worker Tracking</h1>
        <p>Real-time monitoring of all {workers.length} workers</p>
      </div>

      {/* Statistics */}
      <div className="worker-stats">
        <div className="stat-card">
          <h3>{workers.length}</h3>
          <p>Total Workers</p>
        </div>
        <div className="stat-card">
          <h3>{workers.filter(w => w.is_active === true).length}</h3>
          <p>Active Now</p>
        </div>
        <div className="stat-card">
          <h3>{workers.length > 0 ? (workers.reduce((sum, w) => sum + (w.productivity_score || 0), 0) / workers.length).toFixed(1) : 0}%</h3>
          <p>Avg Productivity</p>
        </div>
        <div className="stat-card">
          <h3>{workers.reduce((sum, w) => sum + (w.total_tasks_completed || 0), 0)}</h3>
          <p>Tasks Completed</p>
        </div>
      </div>

      {/* Station Distribution */}
      <div className="station-distribution card">
        <h2 className="section-title">Station Distribution</h2>
        <div className="distribution-grid">
          {Object.entries(distribution).map(([stationId, count]) => (
            <div key={stationId} className="distribution-item">
              <div className="distribution-bar">
                <div 
                  className="distribution-fill"
                  style={{ width: `${(count / workers.length) * 100}%` }}
                ></div>
              </div>
              <div className="distribution-info">
                <span className="station-label">{stationId}</span>
                <span className="worker-count">{count} workers</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filters card">
        <div className="filter-group">
          <label>Filter by Station:</label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stations</option>
            {stations.map(station => (
              <option key={station.id} value={station.station_id}>
                {station.station_id} - {station.station_name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Search Workers:</label>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {/* Workers Grid */}
      <div className="section">
        <h2 className="section-title">
          Workers ({filteredWorkers.length})
        </h2>
        {filteredWorkers.length > 0 ? (
          <div className="workers-grid">
            {filteredWorkers.map(worker => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No workers found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerTracking;