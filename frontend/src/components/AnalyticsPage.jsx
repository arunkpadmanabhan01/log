import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from './Navigation';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [levelData, setLevelData] = useState([]);
  const [timeData, setTimeData] = useState([]);

  const COLORS = ['#3b82f6', '#4fd1c5', '#f43f5e', '#f59e0b', '#8b5cf6'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/metrics');
      const data = await response.json();
      
      // Transform level data for pie chart
      const levelCounts = data.level_distribution;
      const levelChartData = Object.entries(levelCounts).map(([level, count]) => ({
        name: level.toUpperCase(),
        value: count,
      }));
      setLevelData(levelChartData);

      // Transform time data for bar chart
      const timeCounts = data.time_distribution;
      const timeChartData = Object.entries(timeCounts).map(([time, count]) => ({
        time: time,
        count: count,
      }));
      setTimeData(timeChartData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`${label}: ${payload[0].value} logs`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-page">
      <Navigation />
      <div className="content">
        <h1>Visual Analytics</h1>
        <p className="subtitle">Visualize your log data through interactive charts</p>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : levelData.length === 0 ? (
          <div className="no-data">No log data available for analysis</div>
        ) : (
          <div className="charts">
            <div className="chart-container">
              <h3>Log Level Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
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

            <div className="chart-container">
              <h3>Log Count Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={timeData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" label={{ value: 'Number of Logs', position: 'bottom' }} />
                  <YAxis 
                    dataKey="time" 
                    type="category"
                    label={{ value: 'Time Period', angle: -90, position: 'left' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    name="Log Count"
                    label={{ position: 'right' }}
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
