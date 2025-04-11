import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { FileText, AlertCircle, Clock, Info } from 'lucide-react';
import './ParsingPage.css';

const ParsingPage = () => {
  const navigate = useNavigate();
  const [parsedLogs, setParsedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, levels: {} });

  useEffect(() => {
    const logFile = localStorage.getItem('selectedLogFile');
    if (!logFile) {
      navigate('/');
      return;
    }
    fetchParsedLogs();
  }, [navigate]);

  const fetchParsedLogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setParsedLogs(data.logs || []);
      calculateStats(data.logs);
      setError(null);
    } catch (error) {
      setError('Failed to load logs. Please try uploading the file again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs) => {
    const levels = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});
    setStats({ total: logs.length, levels });
  };

  const getLevelColor = (level) => {
    const colors = {
      ERROR: '#ff4d4f',
      WARNING: '#faad14',
      INFO: '#1890ff',
      DEBUG: '#52c41a'
    };
    return colors[level] || '#666';
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
    } catch (e) {
      return timestamp;
    }
  };

  if (error) {
    return (
      <div className="parsing-page">
        <Navigation />
        <div className="content">
          <div className="error-container">
            <AlertCircle size={48} className="error-icon" />
            <h2>Error Loading Logs</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="retry-button">
              Return to Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parsing-page">
      <Navigation />
      <div className="content">
        <div className="header">
          <div className="title-section">
            <FileText className="header-icon" />
            <div>
              <h1>Smart Parsing</h1>
              <p className="subtitle">
                Analyzing: {localStorage.getItem('selectedLogFile')}
              </p>
            </div>
          </div>
          
          {!loading && parsedLogs.length > 0 && (
            <div className="stats-container">
              <div className="stat-card">
                <Info className="stat-icon" />
                <div className="stat-content">
                  <h3>Total Logs</h3>
                  <p>{stats.total}</p>
                </div>
              </div>
              <div className="level-stats">
                {Object.entries(stats.levels).map(([level, count]) => (
                  <div key={level} className="level-stat" style={{ borderColor: getLevelColor(level) }}>
                    <span className="level-name">{level}</span>
                    <span className="level-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Analyzing log file...</p>
          </div>
        ) : parsedLogs.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h2>No Logs Found</h2>
            <p>Please make sure the file contains valid log entries.</p>
            <button onClick={() => navigate('/')} className="retry-button">
              Upload Another File
            </button>
          </div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th><Clock size={16} /> Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {parsedLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="timestamp">{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span 
                        className="level-badge"
                        style={{ color: getLevelColor(log.level) }}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="message">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParsingPage;
