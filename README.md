# Log Analyzer

A full-stack web application for analyzing log files with filtering and visualization capabilities.

## Features

- Upload and parse .log files
- Filter logs by:
  - Log level (INFO, WARN, ERROR)
  - Time range
  - Keyword search
- Visualizations:
  - Pie chart showing log level distribution
  - Bar chart showing logs per hour
- Real-time filtering and updates
- Modern, responsive UI using Material-UI

## Tech Stack

- Frontend:
  - React (Vite)
  - Material-UI
  - Recharts for visualization
  - Axios for API calls
- Backend:
  - Flask
  - Pandas for data processing
  - Flask-CORS for cross-origin support
- Docker for containerization

## Getting Started

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd log-analyzer
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Log File Format

The application expects log files in the following format:
```
YYYY-MM-DD HH:mm:ss [LEVEL] Message
```

Example:
```
2024-04-10 10:50:36 [INFO] Application started successfully
2024-04-10 10:50:37 [WARN] High memory usage detected
2024-04-10 10:50:38 [ERROR] Database connection failed
```

## API Endpoints

- `POST /upload`: Upload and parse a log file
- `GET /logs`: Get filtered logs
  - Query parameters:
    - level: Filter by log level
    - start_time: Filter by start time
    - end_time: Filter by end time
    - keyword: Search in log messages
- `GET /metrics`: Get log metrics for visualization

## Development

To run the application in development mode without Docker:

1. Backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
# log
