#!/usr/bin/env python3
"""
Project Sanctum - Main Launcher
Unified interface for the sovereign project management system
"""

import sys
import subprocess
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(
        prog="sanctum",
        description="Project Sanctum - Sovereign Project Management System"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # CLI commands (delegate to sanctum_cli)
    init_parser = subparsers.add_parser("init", help="Initialize Sanctum database")
    
    scan_parser = subparsers.add_parser("scan", help="Scan project directories")
    scan_parser.add_argument("paths", nargs="+", help="Paths to scan")
    
    search_parser = subparsers.add_parser("search", help="Search indexed files")
    search_parser.add_argument("query", help="Search query")
    
    catalog_parser = subparsers.add_parser("catalog", help="Generate project catalog")
    catalog_parser.add_argument("--out", default="ProjectSanctum.Catalog.md", help="Output file")
    
    # Server commands
    serve_parser = subparsers.add_parser("serve", help="Start web dashboard")
    serve_parser.add_argument("--port", type=int, default=8787, help="Port to serve on")
    serve_parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    
    api_parser = subparsers.add_parser("api", help="Start API server only")
    api_parser.add_argument("--port", type=int, default=8787, help="Port to serve on")
    api_parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    
    dashboard_parser = subparsers.add_parser("dashboard", help="Start dashboard only")
    dashboard_parser.add_argument("--port", type=int, default=5173, help="Port to serve on")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Handle CLI commands
    if args.command in ["init", "scan", "search", "catalog"]:
        cli_args = ["python", "-m", "sanctum_cli.cli", args.command]
        
        if args.command == "scan":
            cli_args.extend(args.paths)
        elif args.command == "search":
            cli_args.append(args.query)
        elif args.command == "catalog":
            cli_args.extend(["--out", args.out])
            
        result = subprocess.run(cli_args, cwd=Path(__file__).parent)
        sys.exit(result.returncode)
    
    # Handle server commands
    elif args.command == "serve":
        print(f"🚀 Starting Project Sanctum on http://{args.host}:{args.port}")
        print("   API server + React dashboard")
        print("   Press Ctrl+C to stop")
        
        # Start API server in background
        api_proc = subprocess.Popen([
            "python", "-m", "uvicorn", 
            "sanctum_api.server:app", 
            "--host", args.host, 
            "--port", str(args.port),
            "--reload"
        ], cwd=Path(__file__).parent)
        
        # Start dashboard in background  
        dashboard_proc = subprocess.Popen([
            "npm", "run", "dev", "--", "--host", args.host
        ], cwd=Path(__file__).parent / "sanctum_dashboard")
        
        try:
            api_proc.wait()
        except KeyboardInterrupt:
            print("\\n🛑 Shutting down...")
            api_proc.terminate()
            dashboard_proc.terminate()
    
    elif args.command == "api":
        print(f"🔌 Starting Sanctum API on http://{args.host}:{args.port}")
        result = subprocess.run([
            "python", "-m", "uvicorn",
            "sanctum_api.server:app",
            "--host", args.host,
            "--port", str(args.port),
            "--reload"
        ], cwd=Path(__file__).parent)
        sys.exit(result.returncode)
        
    elif args.command == "dashboard":
        print(f"⚛️ Starting Sanctum Dashboard on http://{args.host}:{args.port}")
        result = subprocess.run([
            "npm", "run", "dev", "--", "--host", args.host, "--port", str(args.port)
        ], cwd=Path(__file__).parent / "sanctum_dashboard")
        sys.exit(result.returncode)

if __name__ == "__main__":
    main()