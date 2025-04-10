# Log Analyzer Backend

This directory contains the backend service for the Log Analyzer application.

## Structure

```
backend/
├── src/           # Source code
├── tests/         # Test files
└── README.md      # This file
```

## Setup Instructions

1. Create a virtual environment (recommended)
2. Install dependencies
3. Run the development server

## API Endpoints

- `POST /upload` - Upload and parse log file
- `GET /logs` - Get filtered logs
- `GET /metrics` - Get metrics for visualization