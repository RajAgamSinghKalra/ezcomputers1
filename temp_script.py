from pathlib import Path
path = Path('src/app/cart/page.tsx')
lines = [line for line in path.read_text().splitlines() if 'resetStatus' not in line]
path.write_text('\n'.join(lines) + '\n')
