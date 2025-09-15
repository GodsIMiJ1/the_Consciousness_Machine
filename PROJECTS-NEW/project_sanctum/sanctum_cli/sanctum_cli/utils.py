
import fnmatch
import os
from pathlib import Path

DEFAULT_IGNORES = [
    ".git", ".hg", ".svn", ".DS_Store", "__pycache__", "node_modules", ".venv", "venv",
    ".mypy_cache", ".pytest_cache", "dist", "build", ".next", ".turbo", ".cache", ".idea", ".vscode"
]

DEFAULT_FILE_PATTERNS = ["*.md", "*.py", "*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.yml", "*.yaml", "*.toml", "Dockerfile", "docker-compose.yml"]

def should_ignore(path: Path, extra_ignores=None):
    parts = set(path.parts)
    ignore_set = set(DEFAULT_IGNORES) | set(extra_ignores or [])
    return any(part in ignore_set for part in parts)

def iter_files(root: Path, include_patterns=None, extra_ignores=None):
    include_patterns = include_patterns or DEFAULT_FILE_PATTERNS
    for dirpath, dirnames, filenames in os.walk(root):
        pruned = []
        for d in list(dirnames):
            p = Path(dirpath) / d
            if should_ignore(p, extra_ignores):
                pruned.append(d)
        for d in pruned:
            dirnames.remove(d)
        for fname in filenames:
            fp = Path(dirpath) / fname
            if should_ignore(fp, extra_ignores):
                continue
            if any(fnmatch.fnmatch(fname, pat) for pat in include_patterns) or fname in include_patterns:
                yield fp
