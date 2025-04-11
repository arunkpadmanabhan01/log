from flask import Blueprint, request, jsonify
from datetime import datetime
from collections import defaultdict
import re

api = Blueprint('api', __name__)

# In-memory store
current_logs = {
    'data': [],
    'filename': None
}

# ----------------------
# Upload Route
# ----------------------
@api.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        content = file.read().decode('utf-8')
        parsed_logs = parse_logs(content)

        global current_logs
        current_logs['data'] = parsed_logs
        current_logs['filename'] = file.filename

        return jsonify({
            'message': 'File uploaded successfully',
            'log_count': len(parsed_logs)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ----------------------
# Get All or Filtered Logs
# ----------------------
@api.route('/api/logs', methods=['GET'])
def get_logs():
    if not current_logs['data']:
        return jsonify({'error': 'No log file uploaded'}), 404

    level = request.args.get('level', '')
    search = request.args.get('search', '')
    start_time = request.args.get('start_time', '')
    end_time = request.args.get('end_time', '')

    filtered_logs = filter_logs(current_logs['data'], level, search, start_time, end_time)

    return jsonify({
        'logs': filtered_logs,
        'total': len(filtered_logs)
    })

# ----------------------
# Metrics Endpoint
# ----------------------
@api.route('/api/metrics', methods=['GET'])
def get_metrics():
    if not current_logs['data']:
        return jsonify({'error': 'No log file uploaded'}), 404

    metrics = calculate_metrics(current_logs['data'])
    return jsonify(metrics)

# ----------------------
# Log Parsing Logic
# ----------------------
def parse_logs(content):
    logs = []
    pattern = r'(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(?:,\d{3})?)\s+(\w+)\s+(.+)'

    for line in content.splitlines():
        match = re.match(pattern, line)
        if match:
            timestamp, level, message = match.groups()
            try:
                dt = datetime.strptime(timestamp.replace(',', '.'), "%Y-%m-%d %H:%M:%S.%f")
                iso_timestamp = dt.isoformat()
            except ValueError:
                try:
                    dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
                    iso_timestamp = dt.isoformat()
                except ValueError:
                    continue

            logs.append({
                'timestamp': iso_timestamp,
                'level': level.upper(),
                'message': message
            })
    return logs

# ----------------------
# Filter Logic
# ----------------------
def filter_logs(logs, level='', search='', start_time='', end_time=''):
    filtered = logs

    if level:
        filtered = [log for log in filtered if log['level'] == level.upper()]

    if search:
        filtered = [log for log in filtered if search.lower() in log['message'].lower()]

    if start_time:
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        filtered = [log for log in filtered if datetime.fromisoformat(log['timestamp']) >= start_dt]

    if end_time:
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        filtered = [log for log in filtered if datetime.fromisoformat(log['timestamp']) <= end_dt]

    return filtered

# ----------------------
# Metrics Calculation
# ----------------------
def calculate_metrics(logs):
    level_distribution = defaultdict(int)
    time_distribution = defaultdict(int)

    for log in logs:
        # Count levels
        level = log['level'].upper()
        level_distribution[level] += 1

        # Group logs by minute
        try:
            dt = datetime.fromisoformat(log['timestamp'])
            time_key = dt.strftime("%Y-%m-%d %H:%M")  # per-minute
        except Exception:
            time_key = log['timestamp'][:16]  # fallback

        time_distribution[time_key] += 1

    return {
        'level_distribution': dict(level_distribution),
        'time_distribution': dict(time_distribution)
    }
