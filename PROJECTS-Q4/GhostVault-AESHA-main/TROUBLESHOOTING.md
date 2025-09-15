# 🔥 GhostVault FlameCore - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### **404 Error on http://localhost:5173**

**Symptoms**: Browser shows 404 or "Cannot GET /" error

**Solutions**:

1. **Check Vite Server Status**:
   ```bash
   cd ghostvault-ui
   npx vite --host
   ```

2. **Verify TypeScript Compilation**:
   ```bash
   cd ghostvault-ui
   npm run build
   ```

3. **Clear Cache and Restart**:
   ```bash
   cd ghostvault-ui
   rm -rf node_modules/.vite
   npx vite --host
   ```

4. **Check for Port Conflicts**:
   ```bash
   lsof -i :5173
   # Kill any conflicting processes
   ```

### **Backend API Connection Issues**

**Symptoms**: Health checks fail, data not loading

**Solutions**:

1. **Verify Backend Services**:
   ```bash
   make health
   docker compose ps
   ```

2. **Restart Backend**:
   ```bash
   make restart
   ```

3. **Check API Endpoints Manually**:
   ```bash
   curl http://localhost:3000/system_settings
   curl http://localhost:9000/minio/health/live
   ```

### **CORS Issues**

**Symptoms**: Network errors in browser console

**Solutions**:

1. **Verify Vite Proxy Configuration**:
   - Check `ghostvault-ui/vite.config.ts`
   - Ensure proxy settings are correct

2. **Use Vite with Host Flag**:
   ```bash
   npx vite --host
   ```

### **TypeScript Compilation Errors**

**Symptoms**: Build fails with TS errors

**Solutions**:

1. **Check for Missing Imports**:
   - Remove unused React imports
   - Fix type assertions

2. **Rebuild from Clean State**:
   ```bash
   cd ghostvault-ui
   rm -rf node_modules
   npm install
   npm run build
   ```

## 🔧 Quick Fixes

### **Complete Reset**
```bash
# Stop everything
make down
cd ghostvault-ui && pkill -f vite

# Clean and restart
make clean
cd ghostvault-ui && rm -rf node_modules dist
cd ghostvault-ui && npm install

# Start fresh
make up
cd ghostvault-ui && npx vite --host
```

### **Development Environment**
```bash
# Terminal 1: Backend
make up && make health

# Terminal 2: Frontend
cd ghostvault-ui && npx vite --host
```

## 🌐 Access Points

- **FlameCore GUI**: http://localhost:5173
- **PostgREST API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
- **Database**: localhost:5433

## 🔍 Debug Commands

```bash
# Check all services
make health

# View logs
make logs

# Test API directly
curl http://localhost:3000/users
curl http://localhost:3000/system_settings

# Check Vite dev server
cd ghostvault-ui && npx vite --host --debug
```

## 🛡️ Security Notes

- **Local Only**: No external authentication required
- **Network Access**: Use `--host` flag for network access
- **Credentials**: ghostadmin/ghoststorage for MinIO

---

*If issues persist, check the browser console for detailed error messages.*
