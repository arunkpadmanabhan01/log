import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import Navigation from './Navigation';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#3b82f6', '#4fd1c5', '#f43f5e', '#f59e0b', '#8b5cf6'];

  useEffect(() => {
    const logFile = sessionStorage.getItem('selectedLogFile');
    if (!logFile) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      console.log('Raw API response:', data);

      // Pie chart data (log levels)
      const levelCounts = data.level_distribution || {};
      const levelChartData = Object.entries(levelCounts).map(([level, count]) => ({
        name: level.toUpperCase(),
        value: count,
      }));
      setLevelData(levelChartData);

      // Bar chart data (logs per timestamp group)
      const timeCounts = data.time_distribution || {};
      const timeChartData = Object.entries(timeCounts)
        .map(([timestamp, count]) => ({
          time: timestamp, // full "YYYY-MM-DD HH:MM"
          count: count
        }))
        .sort((a, b) => new Date(a.time) - new Date(b.time)); // sort by timestamp

      console.log('Processed time data:', timeChartData);
      setTimeData(timeChartData);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="analytics-page">
        <Navigation />
        <div className="content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <Navigation />
      <div className="content">
        <h1>Visual Analytics</h1>
        <p className="subtitle">
          Analytics for: {sessionStorage.getItem('selectedLogFile')}
        </p>
        <p className="subtitle">Visualize your log data through interactive charts</p>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : levelData.length === 0 ? (
          <div className="no-data">No log data available for analysis</div>
        ) : (
          <div className="charts">
            {/* Pie Chart */}
            <div className="chart-container">
              <h3>Log Level Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={levelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value} logs`}
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="chart-container">
              <h3>Logs Per Minute</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={timeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{
                      value: 'Number of Logs',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#fff' }
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Log Count"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
