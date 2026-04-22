#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import sys

HTML_FILES = [Path('index.html'), Path('about.html'), Path('service.html'), Path('products.html'), Path('contact.html')]

class Validator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title_count = 0
        self.h1_count = 0
        self.meta_description = False
        self.og = set()
        self.has_lang = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html' and attrs.get('lang'):
            self.has_lang = True
        if tag == 'title':
            self.title_count += 1
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'meta':
            if attrs.get('name') == 'description' and attrs.get('content'):
                self.meta_description = True
            if attrs.get('property', '').startswith('og:') and attrs.get('content'):
                self.og.add(attrs['property'])

errors = []
required_og = {'og:title', 'og:description', 'og:type', 'og:url', 'og:image'}

for file_path in HTML_FILES:
    text = file_path.read_text(encoding='utf-8')
    if not text.lstrip().lower().startswith('<!doctype html>'):
        errors.append(f"{file_path}: missing or invalid doctype")

    parser = Validator()
    parser.feed(text)

    if not parser.has_lang:
        errors.append(f"{file_path}: <html> missing lang attribute")
    if parser.title_count != 1:
        errors.append(f"{file_path}: expected exactly 1 <title>, found {parser.title_count}")
    if parser.h1_count != 1:
        errors.append(f"{file_path}: expected exactly 1 <h1>, found {parser.h1_count}")
    if not parser.meta_description:
        errors.append(f"{file_path}: missing meta description")
    missing_og = required_og - parser.og
    if missing_og:
        errors.append(f"{file_path}: missing Open Graph tags: {', '.join(sorted(missing_og))}")

if errors:
    print('HTML validation failed:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print('HTML validation passed.')
