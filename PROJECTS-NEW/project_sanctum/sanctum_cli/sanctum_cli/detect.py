
from pathlib import Path

def detect_project_type(root: Path):
    markers = {
        "python": ["pyproject.toml", "setup.py", "requirements.txt"],
        "node": ["package.json", "pnpm-lock.yaml", "yarn.lock"],
        "docker": ["Dockerfile", "docker-compose.yml"],
        "rust": ["Cargo.toml"],
        "go": ["go.mod"],
        "java": ["pom.xml", "build.gradle", "settings.gradle"],
        "swift": ["Package.swift"],
        "php": ["composer.json"],
    }
    found = []
    for kind, files in markers.items():
        for f in files:
            if (root / f).exists():
                found.append(kind); break
    return sorted(set(found))

def read_project_name(root: Path):
    import json
    try:
        import tomllib
    except Exception:
        tomllib = None
    if (root / "package.json").exists():
        try:
            return json.loads((root/"package.json").read_text()).get("name")
        except Exception:
            pass
    if tomllib and (root / "pyproject.toml").exists():
        try:
            data = tomllib.loads((root/"pyproject.toml").read_text())
            return (data.get("project") or {}).get("name")
        except Exception:
            pass
    if tomllib and (root / "Cargo.toml").exists():
        try:
            data = tomllib.loads((root/"Cargo.toml").read_text())
            return (data.get("package") or {}).get("name")
        except Exception:
            pass
    return root.name
