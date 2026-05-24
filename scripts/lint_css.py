#!/usr/bin/env python3
from pathlib import Path
import re
import sys

css_path = Path('css/style.css')
lines = css_path.read_text(encoding='utf-8').splitlines()
errors = []
brace_depth = 0
property_pattern = re.compile(r'^[a-zA-Z-]+\s*:')
pending_property_line = None

for idx, line in enumerate(lines, start=1):
    stripped = line.strip()
    if not stripped or stripped.startswith('/*'):
        brace_depth += stripped.count('{') - stripped.count('}')
        continue

    opening = stripped.count('{')
    closing = stripped.count('}')

    # Check declarations only inside blocks.
    if brace_depth > 0 and ':' in stripped and property_pattern.match(stripped):
        if stripped.endswith(';'):
            pending_property_line = None
        else:
            # Handle multiline declarations (e.g. linear-gradient).
            pending_property_line = idx
    elif pending_property_line is not None:
        if stripped.endswith(';'):
            pending_property_line = None
        elif stripped == '}':
            source = lines[pending_property_line - 1].strip()
            errors.append(f"{css_path}:{pending_property_line} missing semicolon -> {source}")
            pending_property_line = None

    brace_depth += opening - closing

if brace_depth != 0:
    errors.append(f'{css_path}: unmatched curly braces')

if pending_property_line is not None:
    source = lines[pending_property_line - 1].strip()
    errors.append(f"{css_path}:{pending_property_line} missing semicolon -> {source}")

if errors:
    print('CSS lint failed:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print('CSS lint passed.')
