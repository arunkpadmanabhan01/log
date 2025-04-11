import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, Terminal } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const existingFile = sessionStorage.getItem('uploadedFile');
    if (existingFile) {
      setUploadedFile(existingFile);
    }
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/api/upload', {  // Updated port to 5001
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadedFile(file.name);
        sessionStorage.setItem('selectedLogFile', file.name);
        sessionStorage.setItem('uploadedFile', file.name);
        navigate('/parsing');
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (error) {
      setError('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="container">
        <div className="content">
          <Terminal className="logo" />
          <h1 className="title">Welcome to Log Analyzer</h1>
          <p className="subtitle">
            Transform your log files into actionable insights. Analyze, filter, and visualize your logs with ease.
          </p>
          
          <div className="upload-section">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {uploadedFile ? (
              <div className="current-file">
                <h3>Current Log File</h3>
                <p>{uploadedFile}</p>
                <div className="button-group">
                  <label className="upload-button">
                    <input
                      type="file"
                      accept=".log,.txt"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <div className="button-content">
                      <FileUp />
                      <span>{uploading ? 'Uploading...' : 'Upload New File'}</span>
                    </div>
                  </label>
                  <button
                    className="analyze-button"
                    onClick={() => navigate('/parsing')}
                    disabled={uploading}
                  >
                    Analyze Current File
                  </button>
                </div>
              </div>
            ) : (
              <label className="upload-button large">
                <input
                  type="file"
                  accept=".log,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="button-content">
                  <FileUp size={32} />
                  <span>{uploading ? 'Uploading...' : 'Upload Log File'}</span>
                  <p className="upload-hint">Drag and drop a log file here or click to browse</p>
                </div>
              </label>
            )}
          </div>

          <div className="features">
            <FeatureCard
              title="Smart Parsing"
              description="Automatically parse and structure your log data with timestamp, level, and message detection."
              onClick={() => navigate('/parsing')}
              disabled={!uploadedFile}
            />
            <FeatureCard
              title="Advanced Filtering"
              description="Filter logs by level, time range, and keywords to find exactly what you need."
              onClick={() => navigate('/filtering')}
              disabled={!uploadedFile}
            />
            <FeatureCard
              title="Visual Analytics"
              description="Gain insights through interactive charts and visualizations of your log data."
              onClick={() => navigate('/analytics')}
              disabled={!uploadedFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, onClick, disabled }) => (
  <div 
    className={`feature-card ${disabled ? 'disabled' : ''}`}
    onClick={disabled ? undefined : onClick}
    role={disabled ? undefined : "button"}
    tabIndex={disabled ? undefined : 0}
  >
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
    {disabled && (
      <div className="card-overlay">
        <p>Upload a log file first</p>
      </div>
    )}
  </div>
);

export default LandingPage;