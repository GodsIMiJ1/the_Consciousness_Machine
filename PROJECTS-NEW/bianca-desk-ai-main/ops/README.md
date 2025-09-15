# Production Deployment Guide

This directory contains production deployment configurations for BiancaDesk.

## Quick Start with Docker

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Manual Deployment

### Prerequisites

1. **Node.js 20+** installed on the server
2. **Nginx** for reverse proxy
3. **SSL certificate** for HTTPS

### Backend Deployment

1. **Create service user:**
```bash
sudo useradd -r -s /bin/false biancadesk
sudo mkdir -p /opt/biancadesk
sudo chown biancadesk:biancadesk /opt/biancadesk
```

2. **Deploy application:**
```bash
# Copy server files to /opt/biancadesk/server
sudo cp -r server/ /opt/biancadesk/
sudo chown -R biancadesk:biancadesk /opt/biancadesk/server
```

3. **Install systemd service:**
```bash
sudo cp ops/biancadesk-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable biancadesk-server
sudo systemctl start biancadesk-server
```

4. **Check service status:**
```bash
sudo systemctl status biancadesk-server
sudo journalctl -u biancadesk-server -f
```

### Frontend Deployment

1. **Build frontend:**
```bash
cd frontend
npm ci
npm run build
```

2. **Deploy static files:**
```bash
sudo mkdir -p /var/www/biancadesk/frontend
sudo cp -r dist/* /var/www/biancadesk/frontend/
sudo chown -R www-data:www-data /var/www/biancadesk
```

### Nginx Configuration

1. **Install configuration:**
```bash
sudo cp ops/nginx.sample.conf /etc/nginx/sites-available/biancadesk
sudo ln -s /etc/nginx/sites-available/biancadesk /etc/nginx/sites-enabled/
```

2. **Update configuration:**
- Replace `bianca.example.com` with your domain
- Update SSL certificate paths
- Update frontend build path if different

3. **Test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Variables

Create `/opt/biancadesk/server/.env`:

```bash
NODE_ENV=production
PORT=7070
FLAMEROUTER_CLOUD_URL=https://your-cloud-instance.com
FLAMEROUTER_LOCAL_URL=http://localhost:8080
ESCALATION_WEBHOOK=https://hooks.zapier.com/hooks/catch/your-webhook
```

## Monitoring

### Health Check
```bash
curl https://bianca.example.com/health
```

### Logs
```bash
# Application logs
sudo journalctl -u biancadesk-server -f

# Nginx logs
sudo tail -f /var/log/nginx/biancadesk_access.log
sudo tail -f /var/log/nginx/biancadesk_error.log
```

### Service Management
```bash
# Restart service
sudo systemctl restart biancadesk-server

# View service status
sudo systemctl status biancadesk-server

# Stop/start service
sudo systemctl stop biancadesk-server
sudo systemctl start biancadesk-server
```

## Security Notes

1. **SSL/TLS**: The nginx configuration includes secure SSL settings
2. **Headers**: Security headers are configured (HSTS, XSS protection, etc.)
3. **Systemd**: Service runs with restricted permissions
4. **File Access**: Only storage directory is writable by the service
5. **User Isolation**: Service runs as dedicated `biancadesk` user

## Backup

Important directories to backup:
- `/opt/biancadesk/server/storage/` - Ticket data
- `/opt/biancadesk/server/kb/` - Knowledge base files
- `/etc/nginx/sites-available/biancadesk` - Nginx configuration
- `/etc/systemd/system/biancadesk-server.service` - Service configuration