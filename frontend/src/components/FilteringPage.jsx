import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { Filter, ArrowLeft, Search, Clock } from 'lucide-react';
import './FilteringPage.css';

const FilteringPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  // ✅ Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check for valid session file
  useEffect(() => {
    const logFile = sessionStorage.getItem('selectedLogFile');
    if (!logFile) {
      navigate('/');
      return;
    }
    fetchLogs(); // initial fetch
  }, []);

  // Apply filters with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5001/api/logs';

      const params = new URLSearchParams();
      if (filters.level !== 'all') params.append('level', filters.level);
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.startDate) params.append('start_time', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('end_time', new Date(filters.endDate).toISOString());

      const query = params.toString();
      if (query) {
        url += `?${query}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch logs');
        setLogs([]);
      }
    } catch (error) {
      setError('Error connecting to server');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filtering-page">
      <Navigation />
      <div className="content">
        <h1>Advanced Filtering</h1>
        <p className="subtitle">Analyzing: {sessionStorage.getItem('selectedLogFile')}</p>

        <div className="filters">
          <div className="filters-header">
            <Filter className="header-icon" />
            <h2>Filter Options</h2>
          </div>

          <div className="filters-grid">
            <div className="search-container">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search in logs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="level-select">
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            <div className="time-range">
              <Clock className="input-icon" />
              <div className="datetime-inputs">
                <input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="filter-date"
                />
                <span>to</span>
                <input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="filter-date"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading logs...</div>
        ) : (
          <div className="logs-container">
            <h3>Filtered Logs</h3>
            {logs.length === 0 ? (
              <p>No logs match the current filters.</p>
            ) : (
              <div className="log-table">
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
                        <td>{log.timestamp}</td>
                        <td className={`level-${log.level.toLowerCase()}`}>{log.level}</td>
                        <td>{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteringPage;
