import React, { useState, useEffect } from 'react';
import { Filter, BarChart2, PieChart, Search, Clock } from 'lucide-react';
import './AnalyzerPage.css';

const AnalyzerPage = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ level_distribution: {}, time_distribution: {} });

  useEffect(() => {
    fetchLogs();
    if (showAdvanced) {
      fetchMetrics();
    }
  }, [searchTerm, selectedLevel, timeRange, showAdvanced]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLevel && selectedLevel !== 'all') params.append('level', selectedLevel);
      if (timeRange.start) params.append('start_time', new Date(timeRange.start).toISOString());
      if (timeRange.end) params.append('end_time', new Date(timeRange.end).toISOString());

      const response = await fetch(`http://localhost:5000/logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="analyzer-page">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">Log Analysis Dashboard</h1>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-grid">
          <div className="filters-section">
            <div className="section-header">
              <Filter className="header-icon" />
              <h2 className="section-title">Filters</h2>
            </div>
            
            <div className="filters-grid">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="datetime-container">
                <Clock className="datetime-icon" />
                <div className="datetime-inputs">
                  <input
                    type="datetime-local"
                    value={timeRange.start}
                    onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                    className="datetime-input"
                    placeholder="Start Time"
                  />
                  <input
                    type="datetime-local"
                    value={timeRange.end}
                    onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                    className="datetime-input"
                    placeholder="End Time"
                  />
                </div>
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="level-select"
              >
                <option value="">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
          </div>

          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span className={`log-level ${log.level.toLowerCase()}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="advanced-toggle"
          >
            <BarChart2 />
            {showAdvanced ? 'Hide Advanced Analytics' : 'Show Advanced Analytics'}
          </button>

          {showAdvanced && (
            <div className="analytics-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <PieChart className="chart-icon" />
                  <h3 className="chart-title">Log Level Distribution</h3>
                </div>
                <div className="chart-container">
                  <div className="level-distribution">
                    {Object.entries(metrics.level_distribution).map(([level, count]) => (
                      <div key={level} className="level-stat">
                        <span className={`level-badge ${level.toLowerCase()}`}>{level}</span>
                        <span className="level-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <BarChart2 className="chart-icon" />
                  <h3 className="chart-title">Logs Over Time</h3>
                </div>
                <div className="chart-container">
                  <div className="time-distribution">
                    {Object.entries(metrics.time_distribution).map(([time, count]) => (
                      <div key={time} className="time-stat">
                        <span className="time-label">{new Date(time).toLocaleString()}</span>
                        <div className="time-bar" style={{ width: `${(count / Math.max(...Object.values(metrics.time_distribution))) * 100}%` }}>
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyzerPage;