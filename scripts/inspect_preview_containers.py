import glob, re

for path in glob.glob('src/**/*.tsx', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if '816px' in content or '1056px' in content or 'print-container' in content:
        print('=== Component:', path)
        for line in content.split('\n'):
            if ('816px' in line or '1056px' in line or 'print-container' in line or 'aspect' in line) and ('className' in line or 'style' in line or 'id' in line):
                print('  ', line.strip())
