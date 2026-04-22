#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import sys

HTML_FILES = [Path('index.html'), Path('about.html'), Path('products.html'), Path('contact.html')]


class SectionExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.sections = {'nav': [], 'footer': []}
        self.current = None
        self.depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.sections and self.current is None:
            self.current = tag
            self.depth = 1
            self.sections[tag].append(self.get_starttag_text())
            return

        if self.current:
            if tag == self.current:
                self.depth += 1
            self.sections[self.current].append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if not self.current:
            return

        self.sections[self.current].append(f'</{tag}>')
        if tag == self.current:
            self.depth -= 1
            if self.depth == 0:
                self.current = None

    def handle_data(self, data):
        if self.current:
            self.sections[self.current].append(data)

    def handle_entityref(self, name):
        if self.current:
            self.sections[self.current].append(f'&{name};')

    def handle_charref(self, name):
        if self.current:
            self.sections[self.current].append(f'&#{name};')


def normalize(markup):
    return ' '.join(''.join(markup).split())


baseline = {}
errors = []

for file_path in HTML_FILES:
    parser = SectionExtractor()
    parser.feed(file_path.read_text(encoding='utf-8'))

    for section_name in ('nav', 'footer'):
        value = normalize(parser.sections[section_name])
        if not value:
            errors.append(f'{file_path}: missing <{section_name}>')
            continue

        if section_name not in baseline:
            baseline[section_name] = (file_path, value)
            continue

        baseline_file, baseline_value = baseline[section_name]
        if value != baseline_value:
            errors.append(f'{file_path}: <{section_name}> differs from {baseline_file}')

if errors:
    print('Shared markup check failed:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)

print('Shared markup check passed.')
