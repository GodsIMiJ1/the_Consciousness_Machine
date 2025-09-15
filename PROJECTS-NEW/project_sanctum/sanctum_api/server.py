# server.py — Project Sanctum API v0.1
import sqlite3
from pathlib import Path
from fastapi import FastAPI, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess, shlex

SANCTUM_DB = Path.home() / ".sanctum" / "sanctum.db"
GHOSTDEX_DB = Path.home() / ".ghostdex" / "ghostdex.db"
CATALOG_DEFAULT = Path.home() / "ProjectSanctum.Catalog.md"

def db_path():
    if SANCTUM_DB.exists(): return SANCTUM_DB
    if GHOSTDEX_DB.exists(): return GHOSTDEX_DB
    return SANCTUM_DB

app = FastAPI(title="Project Sanctum API", version="0.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

def q(sql, params=()):
    con = sqlite3.connect(db_path())
    con.row_factory = sqlite3.Row
    cur = con.execute(sql, params)
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    return rows

@app.get("/api/projects")
def projects():
    sql = """        SELECT id, name, root, types,
           datetime(first_seen,'unixepoch') AS first_seen,
           datetime(last_scanned,'unixepoch') AS last_scanned
    FROM projects ORDER BY name
    """
    return q(sql)

@app.get("/api/search")
def search(qs: str = Query(..., alias="q")):
    sql = """        SELECT p.name as project, p.name, f.relpath, f.size,
           datetime(f.mtime,'unixepoch') as mtime, p.root
    FROM files f JOIN projects p ON p.id=f.project_id
    WHERE f.relpath LIKE ?
    ORDER BY f.mtime DESC
    LIMIT 200
    """
    return q(sql, (f"%{qs}%",))

class ScanReq(BaseModel):
    roots: list[str]

@app.post("/api/scan")
def scan(req: ScanReq):
    for r in req.roots:
        subprocess.run(shlex.split(f"sanctum scan {shlex.quote(r)}"), check=False)
    return {"ok": True}

@app.post("/api/catalog")
def catalog():
    out = str(CATALOG_DEFAULT)
    subprocess.run(["sanctum", "catalog", "--out", out], check=False)
    return {"ok": True, "path": out}
