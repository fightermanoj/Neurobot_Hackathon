import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            🏭 Production Visibility System
          </h1>
          <p className="hero-subtitle">
            Real-time monitoring and analytics for Lakshmi Food Products
          </p>
          <p className="hero-description">
            Transform your MSME food production with AI-powered voice commands,
            real-time worker tracking, and intelligent production analytics.
          </p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary btn-large"
              onClick={() => navigate('/login')}
            >
              Get Started →
            </button>
          </div>
        </div>
        
        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Voice Commands</h3>
            <p>Workers use simple voice commands to update production status</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Dashboard</h3>
            <p>Monitor all 8 stations with live updates every minute</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👷</div>
            <h3>Worker Tracking</h3>
            <p>Track location and productivity of all 50 workers</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics</h3>
            <p>Reduce wastage from 12% to 6% with data insights</p>
          </div>
        </div>
      </div>
      
      <div className="landing-stats">
        <div className="stat-item">
          <h2>₹51L</h2>
          <p>Annual Savings</p>
        </div>
        <div className="stat-item">
          <h2>85%</h2>
          <p>Production Efficiency</p>
        </div>
        <div className="stat-item">
          <h2>95%</h2>
          <p>On-time Delivery</p>
        </div>
        <div className="stat-item">
          <h2>50+</h2>
          <p>Workers Monitored</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;