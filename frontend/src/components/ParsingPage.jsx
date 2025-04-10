import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import './ParsingPage.css';

const ParsingPage = () => {
  const [parsedLogs, setParsedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const logFile = localStorage.getItem('uploadedFile');
    if (!logFile) {
      navigate('/');
      return;
    }
    fetchParsedLogs();
  }, [navigate]);

  const fetchParsedLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setParsedLogs(data.logs || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load logs. Please try uploading the file again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  if (error) {
    return (
      <div className="parsing-page">
        <Navigation />
        <div className="content">
          <div className="error-message">
            {error}
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
          <h1>Smart Parsing</h1>
          <p className="subtitle">
            Analyzing: {localStorage.getItem('uploadedFile')}
            {parsedLogs.length > 0 && 
              <span className="log-count"> ({parsedLogs.length} logs found)</span>
            }
          </p>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Analyzing log file...</p>
          </div>
        ) : parsedLogs.length === 0 ? (
          <div className="no-logs">
            <p>No logs found in the file. Please make sure the file contains valid log entries.</p>
            <button onClick={() => navigate('/')} className="retry-button">
              Upload Another File
            </button>
          </div>
        ) : (
          <div className="logs-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {parsedLogs.map((log, index) => (
                  <tr key={index} className={`log-entry ${log.level.toLowerCase()}`}>
                    <td className="timestamp">{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span className={`level-badge ${log.level.toLowerCase()}`}>
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
