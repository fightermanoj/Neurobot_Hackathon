import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'];

const Analytics = () => {
  const [productivityData, setProductivityData] = useState(null);
  const [wastageData, setWastageData] = useState(null);
  const [costsData, setCostsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Refresh analytics every 3 seconds
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [productivity, wastage, costs] = await Promise.all([
        api.get('/analytics/productivity'),
        api.get('/analytics/wastage'),
        api.get('/analytics/costs')
      ]);
      
      setProductivityData(productivity.data);
      setWastageData(wastage.data);
      setCostsData(costs.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  // Prepare station productivity data for chart
  const stationProductivityChart = productivityData?.station_productivity 
    ? Object.entries(productivityData.station_productivity).map(([station, data]) => ({
        station,
        avgScore: data.average_score.toFixed(1),
        workers: data.workers.length
      }))
    : [];

  // Prepare wastage data for chart
  const wastageChart = wastageData 
    ? Object.entries(wastageData).map(([station, data]) => ({
        station,
        avgWastage: data.average_wastage.toFixed(2)
      }))
    : [];

  // Prepare cost data for pie chart
  const costsPieData = costsData ? [
    { name: 'Raw Materials', value: costsData.raw_material_cost },
    { name: 'Packaging', value: costsData.packaging_cost },
    { name: 'Wastage', value: costsData.wastage_cost }
  ] : [];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>📈 Analytics & Insights</h1>
        <p>Data-driven insights for better decision making</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            👷
          </div>
          <div className="metric-content">
            <h3>{productivityData?.workers?.length || 0}</h3>
            <p>Active Workers</p>
            <div className="metric-trend positive">
              ↑ {((productivityData?.workers?.length || 0) / 50 * 100).toFixed(0)}% Active
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            📊
          </div>
          <div className="metric-content">
            <h3>
              {productivityData?.station_productivity 
                ? Object.values(productivityData.station_productivity)
                    .reduce((sum, s) => sum + s.average_score, 0) / 
                  Object.keys(productivityData.station_productivity).length
                : 0
              }%
            </h3>
            <p>Avg Productivity</p>
            <div className="metric-trend positive">
              ↑ Target: 85%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            💰
          </div>
          <div className="metric-content">
            <h3>₹{costsData?.total_cost?.toLocaleString() || 0}</h3>
            <p>Total Costs</p>
            <div className="metric-trend negative">
              ↓ Wastage: ₹{costsData?.wastage_cost?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            ♻️
          </div>
          <div className="metric-content">
            <h3>
              {wastageData 
                ? Object.values(wastageData)
                    .reduce((sum, s) => sum + s.total_wastage, 0)
                    .toFixed(1)
                : 0
              } kg
            </h3>
            <p>Total Wastage</p>
            <div className="metric-trend negative">
              ↓ Target: 6%
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {/* Productivity by Station */}
        <div className="chart-card">
          <h2 className="chart-title">Station Productivity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationProductivityChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="station" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgScore" fill="#667eea" name="Avg Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wastage by Station */}
        <div className="chart-card">
          <h2 className="chart-title">Wastage Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wastageChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="station" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgWastage" fill="#ef4444" name="Avg Wastage (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Cost Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costsPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costsPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Worker Performance */}
        <div className="chart-card">
          <h2 className="chart-title">Top 10 Performers</h2>
          <div className="top-performers">
            {productivityData?.workers
              ?.sort((a, b) => b.productivity_score - a.productivity_score)
              .slice(0, 10)
              .map((worker, index) => (
                <div key={worker.worker_id} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <span className="performer-name">{worker.worker_name}</span>
                    <span className="performer-id">{worker.worker_id}</span>
                  </div>
                  <div className="performer-score">
                    <span className={`badge badge-${worker.productivity_score >= 80 ? 'success' : 'warning'}`}>
                      {worker.productivity_score}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section card">
        <h2 className="section-title">💡 Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon">📊</div>
            <h3>Productivity Trend</h3>
            <p>Average productivity across all workers is {
              productivityData?.workers 
                ? (productivityData.workers.reduce((sum, w) => sum + w.productivity_score, 0) / 
                   productivityData.workers.length).toFixed(1)
                : 0
            }%. Target is 85%.</p>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">♻️</div>
            <h3>Wastage Reduction</h3>
            <p>Current wastage is {
              wastageData 
                ? Object.values(wastageData).reduce((sum, s) => sum + s.total_wastage, 0).toFixed(1)
                : 0
            } kg. Implementing our system can reduce this by 50%.</p>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">💰</div>
            <h3>Cost Savings</h3>
            <p>By reducing wastage from 12% to 6%, you can save ₹{
              (costsData?.wastage_cost * 0.5)?.toLocaleString() || 0
            } annually.</p>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">⚡</div>
            <h3>Station Efficiency</h3>
            <p>STATION_5 (Drying) is the bottleneck. Consider running it 24/7 for better throughput.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;