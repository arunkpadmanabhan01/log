from flask import Blueprint, request, jsonify
from datetime import datetime
from collections import defaultdict
import re

api = Blueprint('api', __name__)

# In-memory storage for logs
logs = []

@api.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Clear previous logs
    logs.clear()
    
    # Read and parse the file
    content = file.read().decode('utf-8')
    for line in content.split('\n'):
        if line.strip():
            parsed_log = parse_log_line(line)
            if parsed_log:
                logs.append(parsed_log)
    
    return jsonify({
        'message': 'File uploaded successfully',
        'log_count': len(logs),
        'logs': logs  # Return parsed logs immediately
    }), 200

@api.route('/api/logs', methods=['GET'])
def get_logs():
    level = request.args.get('level', '').upper()
    start_time = request.args.get('start_time', '')
    end_time = request.args.get('end_time', '')
    search_term = request.args.get('search', '')

    filtered_logs = logs

    if level:
        filtered_logs = [log for log in filtered_logs if log['level'].upper() == level]
    
    if start_time:
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            filtered_logs = [log for log in filtered_logs if datetime.fromisoformat(log['timestamp']) >= start_dt]
        except ValueError:
            pass

    if end_time:
        try:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            filtered_logs = [log for log in filtered_logs if datetime.fromisoformat(log['timestamp']) <= end_dt]
        except ValueError:
            pass

    if search_term:
        filtered_logs = [log for log in filtered_logs if search_term.lower() in log['message'].lower()]

    return jsonify({
        'logs': filtered_logs,
        'total': len(filtered_logs)
    })

@api.route('/api/metrics', methods=['GET'])
def get_metrics():
    if not logs:
        return jsonify({
            'level_distribution': {},
            'time_distribution': {},
            'total_logs': 0
        })

    # Calculate level distribution
    level_counts = defaultdict(int)
    for log in logs:
        level_counts[log['level']] += 1

    # Calculate time distribution (by hour)
    time_counts = defaultdict(int)
    for log in logs:
        timestamp = datetime.fromisoformat(log['timestamp'])
        hour = timestamp.strftime('%Y-%m-%d %H:00')
        time_counts[hour] += 1

    # Sort time periods chronologically
    sorted_time_periods = sorted(time_counts.items())
    time_distribution = {time: count for time, count in sorted_time_periods}

    return jsonify({
        'level_distribution': dict(level_counts),
        'time_distribution': time_distribution,
        'total_logs': len(logs)
    })

def parse_log_line(line):
    # Common log patterns
    patterns = [
        # ISO timestamp with level
        r'^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(?P<level>\w+)\s+(?P<message>.+)$',
        # Date format with level
        r'^(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(?P<level>\w+)\s+(?P<message>.+)$',
        # Simple timestamp with level
        r'^(?P<timestamp>\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(?P<level>\w+)\s+(?P<message>.+)$'
    ]

    for pattern in patterns:
        match = re.match(pattern, line.strip())
        if match:
            data = match.groupdict()
            
            # Handle simple timestamp by adding today's date
            if len(data['timestamp']) <= 12:  # HH:MM:SS format
                today = datetime.now().strftime('%Y-%m-%d')
                data['timestamp'] = f"{today}T{data['timestamp']}"
            
            # Standardize timestamp format
            try:
                timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
                data['timestamp'] = timestamp.isoformat()
            except ValueError:
                try:
                    timestamp = datetime.strptime(data['timestamp'], '%Y-%m-%d %H:%M:%S')
                    data['timestamp'] = timestamp.isoformat()
                except ValueError:
                    continue

            # Standardize log level
            data['level'] = data['level'].upper()
            return data

    return None
