#!/usr/bin/env python3
from pathlib import Path
import re
import sys

css_path = Path('css/style.css')
lines = css_path.read_text(encoding='utf-8').splitlines()
errors = []
brace_depth = 0
property_pattern = re.compile(r'^[a-zA-Z-]+\s*:')

for idx, line in enumerate(lines, start=1):
    stripped = line.strip()
    if not stripped or stripped.startswith('/*'):
        brace_depth += stripped.count('{') - stripped.count('}')
        continue

    opening = stripped.count('{')
    closing = stripped.count('}')

    # Check declarations only inside blocks.
    if brace_depth > 0 and ':' in stripped and property_pattern.match(stripped):
        if not stripped.endswith(';'):
            errors.append(f"{css_path}:{idx} missing semicolon -> {stripped}")

    brace_depth += opening - closing

if brace_depth != 0:
    errors.append(f'{css_path}: unmatched curly braces')

if errors:
    print('CSS lint failed:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print('CSS lint passed.')
