import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import './ProductionFlow.css';

const ProductionFlow = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedBatchRef = useRef(null);

  const fetchBatchProgress = useCallback(async (batchId) => {
    if (!batchId) return;
    try {
      const response = await api.get(`/batches/${batchId}/progress`);
      setProgress(response.data.progress || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
      // Only set selectedBatch if it's not already set or if the current one doesn't exist
      if (response.data.length > 0) {
        const currentSelected = selectedBatchRef.current;
        const currentBatchExists = response.data.some(b => b.id === currentSelected);
        if (!currentSelected || !currentBatchExists) {
          const newSelected = response.data[0].id;
          setSelectedBatch(newSelected);
          selectedBatchRef.current = newSelected;
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setLoading(false);
    }
  }, []);

  // Update ref when selectedBatch changes
  useEffect(() => {
    selectedBatchRef.current = selectedBatch;
  }, [selectedBatch]);

  // Fetch batches on mount and set up interval
  useEffect(() => {
    fetchBatches();
    // Refresh batches every 3 seconds
    const batchesInterval = setInterval(fetchBatches, 3000);
    return () => clearInterval(batchesInterval);
  }, [fetchBatches]);

  // Fetch progress when selectedBatch changes
  useEffect(() => {
    if (selectedBatch) {
      fetchBatchProgress(selectedBatch);
    }
  }, [selectedBatch, fetchBatchProgress]);

  // Set up interval to refresh progress every 3 seconds
  useEffect(() => {
    if (selectedBatch) {
      const progressInterval = setInterval(() => {
        fetchBatchProgress(selectedBatch);
      }, 3000);
      return () => clearInterval(progressInterval);
    }
  }, [selectedBatch, fetchBatchProgress]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⚡';
      case 'delayed': return '⚠️';
      case 'stopped': return '🛑';
      default: return '⏸️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'delayed': return '#f59e0b';
      case 'stopped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const currentBatch = batches.find(b => b.id === selectedBatch);

  return (
    <div className="production-flow-page">
      <div className="page-header">
        <h1>🔄 Production Flow</h1>
        <p>Track material flow across all production stages</p>
      </div>

      {/* Batch Selector */}
      <div className="batch-selector card">
        <label>Select Batch:</label>
        <select
          value={selectedBatch || ''}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="batch-select"
        >
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.batch_number} - {batch.product_name} ({batch.overall_status})
            </option>
          ))}
        </select>
      </div>

      {/* Batch Info */}
      {currentBatch && (
        <div className="batch-info card">
          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Batch Number</span>
              <span className="info-value">{currentBatch.batch_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Product</span>
              <span className="info-value">{currentBatch.product_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Target Quantity</span>
              <span className="info-value">{currentBatch.target_quantity_kg} kg</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Station</span>
              <span className="badge badge-info">{currentBatch.current_station}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Overall Status</span>
              <span className={`badge badge-${currentBatch.overall_status === 'in_progress' ? 'success' : 'secondary'}`}>
                {currentBatch.overall_status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Flow Visualization */}
      <div className="flow-container">
        <h2 className="section-title">Production Pipeline</h2>
        <div className="flow-timeline">
          {progress.map((item, index) => (
            <div key={item.id} className="flow-step">
              <div 
                className="flow-node"
                style={{ borderColor: getStatusColor(item.status) }}
              >
                <div className="node-icon" style={{ background: getStatusColor(item.status) }}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="node-content">
                  <h3>{item.station_id}</h3>
                  <span className={`badge badge-${item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'info' : 'secondary'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="node-details">
                  {item.input_quantity_kg && (
                    <div className="detail">
                      <span>Input:</span>
                      <strong>{item.input_quantity_kg} kg</strong>
                    </div>
                  )}
                  {item.output_quantity_kg && (
                    <div className="detail">
                      <span>Output:</span>
                      <strong>{item.output_quantity_kg} kg</strong>
                    </div>
                  )}
                  {item.wastage_kg > 0 && (
                    <div className="detail wastage">
                      <span>Wastage:</span>
                      <strong>{item.wastage_kg} kg</strong>
                    </div>
                  )}
                  {item.start_time && (
                    <div className="detail">
                      <span>Started:</span>
                      <strong>{new Date(item.start_time).toLocaleTimeString()}</strong>
                    </div>
                  )}
                  {item.end_time && (
                    <div className="detail">
                      <span>Ended:</span>
                      <strong>{new Date(item.end_time).toLocaleTimeString()}</strong>
                    </div>
                  )}
                </div>
              </div>
              {index < progress.length - 1 && (
                <div className="flow-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Material Flow Summary */}
      <div className="material-summary card">
        <h2 className="section-title">📊 Material Flow Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Total Input</div>
            <div className="summary-value">
              {progress.reduce((sum, p) => sum + (p.input_quantity_kg || 0), 0).toFixed(2)} kg
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Output</div>
            <div className="summary-value">
              {progress.reduce((sum, p) => sum + (p.output_quantity_kg || 0), 0).toFixed(2)} kg
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Wastage</div>
            <div className="summary-value text-danger">
              {progress.reduce((sum, p) => sum + (p.wastage_kg || 0), 0).toFixed(2)} kg
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Efficiency</div>
            <div className="summary-value">
              {(() => {
                const totalInput = progress.reduce((sum, p) => sum + (p.input_quantity_kg || 0), 0);
                const totalWastage = progress.reduce((sum, p) => sum + (p.wastage_kg || 0), 0);
                const efficiency = totalInput > 0 ? ((totalInput - totalWastage) / totalInput * 100) : 0;
                return `${efficiency.toFixed(1)}%`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionFlow;