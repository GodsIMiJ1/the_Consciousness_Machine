
import sqlite3, time
from pathlib import Path
from .utils import iter_files
from .detect import detect_project_type, read_project_name

SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS projects(
  id INTEGER PRIMARY KEY,
  root TEXT UNIQUE,
  name TEXT,
  types TEXT,
  first_seen INTEGER,
  last_scanned INTEGER
);
CREATE TABLE IF NOT EXISTS files(
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  path TEXT,
  relpath TEXT,
  size INTEGER,
  mtime INTEGER,
  sha1 TEXT,
  lang TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS notes(
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  key TEXT,
  value TEXT,
  UNIQUE(project_id, key),
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_relpath ON files(relpath);
"""

LANG_MAP = {
    ".py":"python",".ts":"ts",".tsx":"ts",".js":"js",".jsx":"js",".rs":"rust",".go":"go",".java":"java",".swift":"swift",".php":"php",".rb":"ruby",".c":"c",".cc":"cpp",".cpp":"cpp",
    ".md":"markdown",".json":"json",".toml":"toml",".yaml":"yaml",".yml":"yaml"
}

def connect(db_path: Path):
    return sqlite3.connect(db_path)

def init_db(db_path: Path):
    conn = connect(db_path)
    with conn:
        for stmt in SCHEMA.strip().split(";\n"):
            if stmt.strip():
                conn.execute(stmt)
    conn.close()

def sha1_of(path: Path, chunk=65536):
    import hashlib
    h = hashlib.sha1()
    try:
        with open(path,"rb") as f:
            while True:
                b = f.read(chunk)
                if not b: break
                h.update(b)
        return h.hexdigest()
    except Exception:
        return None

def upsert_project(conn, root: Path):
    cur = conn.cursor()
    now = int(time.time())
    name = read_project_name(root)
    types = ",".join(detect_project_type(root))
    cur.execute("INSERT INTO projects(root,name,types,first_seen,last_scanned) VALUES(?,?,?,?,?) ON CONFLICT(root) DO UPDATE SET name=excluded.name, types=excluded.types, last_scanned=excluded.last_scanned",
                (str(root), name, types, now, now))
    conn.commit()
    cur.execute("SELECT id FROM projects WHERE root=?", (str(root),))
    return cur.fetchone()[0]

def scan_project(db_path: Path, root: Path, extra_ignores=None):
    conn = connect(db_path)
    with conn:
        pid = upsert_project(conn, root)
        cur = conn.cursor()
        cur.execute("DELETE FROM files WHERE project_id=?", (pid,))
        for fp in iter_files(root, extra_ignores=extra_ignores):
            try:
                stat = fp.stat()
                ext = fp.suffix.lower()
                lang = LANG_MAP.get(ext)
                sha1 = sha1_of(fp)
                cur.execute(
                    "INSERT INTO files(project_id,path,relpath,size,mtime,sha1,lang) VALUES(?,?,?,?,?,?,?)",
                    (pid, str(fp), str(fp.relative_to(root)), stat.st_size, int(stat.st_mtime), sha1, lang)
                )
            except Exception:
                continue
    conn.close()

def list_projects(db_path: Path):
    conn = connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT id, name, root, types, datetime(first_seen,'unixepoch'), datetime(last_scanned,'unixepoch') FROM projects ORDER BY name")
    rows = cur.fetchall()
    conn.close()
    return rows

def basic_search(db_path: Path, query: str):
    conn = connect(db_path)
    cur = conn.cursor()
    q = f"%{query}%"
    cur.execute("""SELECT p.name,f.relpath,f.size,datetime(f.mtime,'unixepoch'),p.root
                   FROM files f JOIN projects p ON p.id=f.project_id
                   WHERE f.relpath LIKE ?
                   ORDER BY f.mtime DESC
                   LIMIT 100""", (q,))
    rows = cur.fetchall()
    conn.close()
    return rows
