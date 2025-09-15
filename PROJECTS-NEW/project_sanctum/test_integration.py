#!/usr/bin/env python3
"""
Project Sanctum Integration Test
Quick test to verify all components work together
"""

import subprocess
import time
import requests
import sqlite3
from pathlib import Path

def test_cli():
    """Test CLI functionality"""
    print("🔧 Testing CLI...")
    
    # Test init
    result = subprocess.run(['python', '-m', 'sanctum_cli.cli', 'init'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ CLI init successful")
    else:
        print(f"❌ CLI init failed: {result.stderr}")
        return False
    
    # Test scanning current project
    result = subprocess.run(['python', '-m', 'sanctum_cli.cli', 'scan', '.'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ CLI scan successful")
    else:
        print(f"❌ CLI scan failed: {result.stderr}")
        return False
    
    # Test catalog generation
    result = subprocess.run(['python', '-m', 'sanctum_cli.cli', 'catalog'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ CLI catalog generation successful")
    else:
        print(f"❌ CLI catalog failed: {result.stderr}")
        return False
    
    return True

def test_database():
    """Test database functionality"""
    print("🗄️  Testing database...")
    
    db_path = Path.home() / ".sanctum" / "sanctum.db"
    if not db_path.exists():
        print("❌ Database not found")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if projects table has data
        cursor.execute("SELECT COUNT(*) FROM projects")
        project_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM files")
        file_count = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"✅ Database has {project_count} projects and {file_count} files")
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_api():
    """Test API server"""
    print("🌐 Testing API server...")
    
    # Start API server in background
    api_process = subprocess.Popen([
        'python', '-m', 'uvicorn', 
        'sanctum_api.server:app', 
        '--port', '8787',
        '--host', '127.0.0.1'
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    time.sleep(3)
    
    try:
        # Test projects endpoint
        response = requests.get('http://127.0.0.1:8787/api/projects', timeout=5)
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ API projects endpoint working: {len(projects)} projects")
            
            # Test search endpoint
            response = requests.get('http://127.0.0.1:8787/api/search?q=sanctum', timeout=5)
            if response.status_code == 200:
                results = response.json()
                print(f"✅ API search endpoint working: {len(results)} results")
                return True
            else:
                print(f"❌ API search failed: {response.status_code}")
                return False
        else:
            print(f"❌ API projects failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API test failed: {e}")
        return False
        
    finally:
        # Clean up
        api_process.terminate()
        api_process.wait()

def main():
    """Run all tests"""
    print("🚀 Project Sanctum Integration Test")
    print("=" * 40)
    
    tests = [
        ("CLI", test_cli),
        ("Database", test_database), 
        ("API", test_api)
    ]
    
    results = {}
    for name, test_func in tests:
        print(f"\n{name} Test:")
        results[name] = test_func()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    
    all_passed = True
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! Project Sanctum is ready.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    exit(main())