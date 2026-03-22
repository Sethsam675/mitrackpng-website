#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys

HTML_FILES = [Path('index.html'), Path('about.html'), Path('service.html'), Path('contact.html')]

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag == 'link' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag == 'script' and attrs.get('src'):
            self.links.append(attrs['src'])
        if tag == 'img' and attrs.get('src'):
            self.links.append(attrs['src'])

errors = []

for html in HTML_FILES:
    extractor = LinkExtractor()
    extractor.feed(html.read_text(encoding='utf-8'))
    for link in extractor.links:
        parsed = urlparse(link)
        if parsed.scheme in {'http', 'https'} or link.startswith('mailto:') or link.startswith('tel:'):
            continue
        if link.startswith('#'):
            continue
        target = (html.parent / parsed.path).resolve()
        if not target.exists():
            errors.append(f"{html}: broken local link -> {link}")

if errors:
    print('Link check failed:')
    for err in errors:
        print(f'- {err}')
    sys.exit(1)

print('Link check passed.')
