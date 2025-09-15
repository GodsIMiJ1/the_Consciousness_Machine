
import argparse, sys
from pathlib import Path
from .indexer import init_db, scan_project, basic_search
from .catalog import generate_catalog
from .docgen import generate_readme

SANCTUM_DB = Path.home() / ".sanctum" / "sanctum.db"
GHOSTDEX_DB = Path.home() / ".ghostdex" / "ghostdex.db"

def resolve_db(custom: Path | None):
    if custom:
        return custom
    if SANCTUM_DB.exists():
        return SANCTUM_DB
    if GHOSTDEX_DB.exists():
        return GHOSTDEX_DB
    return SANCTUM_DB

def ensure_db(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        init_db(path)

def cmd_init(args):
    db = resolve_db(args.db)
    ensure_db(db)
    print(f"Initialized Sanctum DB at {db}")

def cmd_scan(args):
    db = resolve_db(args.db)
    ensure_db(db)
    for root in args.roots:
        r = Path(root).expanduser().resolve()
        if not r.exists():
            print(f"[warn] Missing: {r}", file=sys.stderr); continue
        scan_project(db, r)
        print(f"Scanned: {r}")

def cmd_catalog(args):
    db = resolve_db(args.db)
    ensure_db(db)
    out = Path(args.out).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    generate_catalog(db, out)
    print(f"Wrote catalog: {out}")

def cmd_search(args):
    db = resolve_db(args.db)
    rows = basic_search(db, args.query)
    if not rows:
        print("No matches."); return
    for name, rel, size, mtime, root in rows:
        print(f"[{name}] {rel}  ({size} bytes)  {mtime}  @ {root}")

def cmd_docgen(args):
    count = 0
    for root in args.roots:
        r = Path(root).expanduser().resolve()
        if r.exists():
            p = generate_readme(r, overwrite=args.force)
            print(f"Generated: {p}")
            count += 1
    if count == 0:
        print("Nothing generated.")

def build_parser():
    p = argparse.ArgumentParser(prog="sanctum", description="Project Sanctum — Sovereign CLI to index, search, and catalog local projects.")
    p.add_argument("--db", type=Path, default=None, help="Path to SQLite DB (defaults to ~/.sanctum/sanctum.db; reads ~/.ghostdex/ghostdex.db if present)")
    sub = p.add_subparsers()

    sp = sub.add_parser("init", help="Initialize local index database"); sp.set_defaults(fn=cmd_init)
    sp = sub.add_parser("scan", help="Scan one or more project roots"); sp.add_argument("roots", nargs="+"); sp.setDefaults = None; sp.set_defaults(fn=cmd_scan)
    sp = sub.add_parser("catalog", help="Generate Markdown catalog of indexed projects"); sp.add_argument("--out", default="ProjectSanctum.Catalog.md"); sp.set_defaults(fn=cmd_catalog)
    sp = sub.add_parser("search", help="Search indexed files by substring"); sp.add_argument("query"); sp.set_defaults(fn=cmd_search)
    sp = sub.add_parser("docgen", help="Generate README.SANCTUM.md for each specified root"); sp.add_argument("roots", nargs="+"); sp.add_argument("--force", action="store_true"); sp.set_defaults(fn=cmd_docgen)
    return p

def main(argv=None):
    argv = argv or sys.argv[1:]
    p = build_parser()
    args = p.parse_args(argv)
    if hasattr(args, "fn"):
        return args.fn(args)
    p.print_help()

if __name__ == "__main__":
    main()
