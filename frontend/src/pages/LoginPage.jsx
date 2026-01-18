import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Handler
  const handleDemoLogin = async (role) => {
    let demoEmail = '';
    let demoPass = '';
    if (role === 'admin') {
      demoEmail = 'admin@lakshmi.com';
      demoPass = 'admin123';
    } else if (role === 'owner') {
      demoEmail = 'rajesh@lakshmi.com';
      demoPass = 'owner123';
    } else if (role === 'manager') {
      demoEmail = 'suresh@lakshmi.com';
      demoPass = 'manager123';
    }
    
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🏭 Lakshmi Food Products</h1>
          <p>Production Visibility System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Sign In</h2>
          
          <div className="demo-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button type="button" onClick={() => handleDemoLogin('admin')} className="demo-btn">Demo Admin</button>
            <button type="button" onClick={() => handleDemoLogin('owner')} className="demo-btn">Demo Owner</button>
            <button type="button" onClick={() => handleDemoLogin('manager')} className="demo-btn">Demo Manager</button>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="login-demo">
            <p>Demo Credentials:</p>
            <small>Owner: rajesh@lakshmi.com / password123</small><br />
            <small>Manager: suresh@lakshmi.com / password123</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;