import re
from datetime import datetime
from dateutil import parser

class LogParser:
    def __init__(self):
        # Common log patterns
        self.patterns = [
            # Standard format: 2024-04-10 14:30:45,123 INFO Message here
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:,\d{3})?)\s+(?P<level>\w+)\s+(?P<message>.*)',
            # Alternative format: [INFO] 2024-04-10 14:30:45: Message here
            r'\[(?P<level>\w+)\]\s+(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}):\s+(?P<message>.*)',
        ]
        self.compiled_patterns = [re.compile(pattern) for pattern in self.patterns]
        
    def parse_line(self, line):
        """Parse a single log line into structured data."""
        for pattern in self.compiled_patterns:
            match = pattern.match(line.strip())
            if match:
                data = match.groupdict()
                try:
                    # Parse timestamp to standard format
                    timestamp = parser.parse(data['timestamp'])
                    data['timestamp'] = timestamp.isoformat()
                    
                    # Normalize log level
                    level = data['level'].upper()
                    if level not in ['INFO', 'WARN', 'ERROR']:
                        level = 'INFO'  # Default to INFO for unknown levels
                    data['level'] = level
                    
                    return data
                except (ValueError, TypeError):
                    continue
        
        # If no pattern matches, return a default structure
        return {
            'timestamp': datetime.now().isoformat(),
            'level': 'INFO',
            'message': line.strip()
        }
    
    def parse_file(self, file_content):
        """Parse entire log file content into structured data."""
        lines = file_content.splitlines()
        return [self.parse_line(line) for line in lines if line.strip()]
