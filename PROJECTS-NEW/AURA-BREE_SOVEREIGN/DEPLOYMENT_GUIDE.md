# ⚔️ Sovereign AGA AURA-BREE Deployment Guide

**Version:** 1.0.0  
**Target:** Production & Development Environments  
**Author:** Ghost King Melekzedek  

## 🎯 Overview

This guide covers the complete deployment of the Sovereign AGA AURA-BREE multi-provider AI stack with MethaClinic integration. The system provides local-first AI processing with optional cloud failover, offline-capable clinic sync, and audit-grade compliance.

## 🏗️ Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   FlameRouter    │    │   MethaClinic   │
│   (React/Vite)  │◄──►│   Multi-AI       │◄──►│   Dashboard     │
│                 │    │   Provider       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Local Storage   │    │ Ollama/LM Studio │    │ Supabase/       │
│ + PII Redaction │    │ + HF/OpenAI      │    │ PostgreSQL      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone https://github.com/TheGhostKing613/aura-bree-ecosystem.git
cd PROJECTS-NEW/AURA-BREE_SOVEREIGN

# Copy environment template
cp .env.example .env

# Install dependencies
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment
Edit `.env` with your settings:
```bash
# Essential settings for development
VITE_FLAME_PROVIDER_PRIORITY=ollama,lmstudio,hf,openai
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_LMSTUDIO_BASE_URL=http://localhost:1234/v1

# Optional cloud providers
VITE_HF_API_KEY=your_huggingface_key
VITE_OPENAI_API_KEY=your_openai_key

# Clinic integration (optional)
VITE_CLINIC_SYNC_ENABLED=true
VITE_CLINIC_SERVER_URL=http://localhost:3000
```

### 3. Start Development Stack
```bash
# Start infrastructure
docker-compose up -d ollama database redis

# Wait for Ollama to be ready, then preload models
docker-compose up model-preloader

# Start development servers
npm run dev                    # Mobile app (port 5173)
cd server && npm run dev       # API server (port 3000)
```

### 4. Verify Installation
- Mobile app: http://localhost:5173
- API server: http://localhost:3000/health
- Ollama: http://localhost:11434/api/tags

## 🏭 Production Deployment

### 1. Server Requirements
- **CPU:** 8+ cores (for local AI models)
- **RAM:** 32GB+ (16GB for Ollama models + 8GB system + 8GB buffer)
- **Storage:** 500GB+ SSD (for models and data)
- **GPU:** Optional but recommended (NVIDIA with 8GB+ VRAM)
- **Network:** Stable internet for model downloads and cloud failover

### 2. Production Environment Setup
```bash
# Set production environment
export NODE_ENV=production
export DOCKER_BUILDKIT=1

# Configure production .env
cp .env.example .env.production
# Edit .env.production with production values
```

### 3. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose -f docker-compose.yaml --env-file .env.production up -d

# Monitor deployment
docker-compose logs -f

# Verify all services are healthy
docker-compose ps
```

### 4. SSL/TLS Setup (Production)
```bash
# Generate certificates (or use existing)
mkdir -p docker/certs
# Place your SSL certificates in docker/certs/

# Update Caddyfile for your domain
# Edit docker/Caddyfile with your domain names
```

## 🔧 Configuration Reference

### FlameRouter Provider Priority
```bash
# Local-first (recommended)
VITE_FLAME_PROVIDER_PRIORITY=ollama,lmstudio,hf,openai

# Cloud-first (for testing)
VITE_FLAME_PROVIDER_PRIORITY=openai,hf,ollama,lmstudio

# Local-only (maximum privacy)
VITE_FLAME_PROVIDER_PRIORITY=ollama,lmstudio
```

### Clinic Integration
```bash
# Enable clinic sync
VITE_CLINIC_SYNC_ENABLED=true
VITE_CLINIC_SERVER_URL=https://your-clinic-domain.com
VITE_CLINIC_JWT_ISSUER=YourClinicName

# Configure database
DATABASE_URL=postgresql://user:pass@localhost:5432/clinic_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Security Settings
```bash
# PII Protection
VITE_PII_REDACTION_ENABLED=true
VITE_CLOUD_CONSENT_REQUIRED=true
VITE_PRIVACY_MODE_DEFAULT=sovereign

# Audit Logging
VITE_AUDIT_HASH_CHAIN_ENABLED=true
VITE_LOG_LEVEL=info
```

## 🔍 Monitoring & Health Checks

### Service Health Endpoints
- **Mobile App:** `GET /` (should return app)
- **FlameRouter:** `GET /health`
- **Ollama:** `GET /api/tags`
- **Database:** `docker-compose exec database pg_isready`

### Key Metrics to Monitor
1. **Provider Availability:** Check `/api/providers/status`
2. **Queue Size:** Monitor offline sync queue
3. **Audit Chain:** Verify hash chain integrity
4. **Resource Usage:** CPU, RAM, disk space
5. **Model Performance:** Response times and accuracy

### Logs Location
```bash
# Application logs
docker-compose logs flame-router
docker-compose logs ollama

# System logs
./server/logs/combined.log
./server/logs/error.log

# Audit logs
# Stored in database audit_log table
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Ollama Models Not Loading
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Manually pull models
docker-compose exec ollama ollama pull llama3.1:8b-instruct
docker-compose exec ollama ollama pull nomic-embed-text
```

#### 2. Provider Failover Not Working
```bash
# Check provider status
curl http://localhost:3000/api/providers/status

# Test individual providers
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"llama3.1:8b-instruct","prompt":"test"}'
```

#### 3. Clinic Sync Failing
```bash
# Check sync status
curl http://localhost:3000/api/clinic/status

# Verify database connection
docker-compose exec database psql -U postgres -c "SELECT COUNT(*) FROM patients;"
```

#### 4. High Memory Usage
```bash
# Check container memory usage
docker stats

# Restart Ollama if needed
docker-compose restart ollama

# Clear unused models
docker-compose exec ollama ollama rm unused-model
```

### Recovery Procedures

#### Database Recovery
```bash
# Backup database
docker-compose exec database pg_dump -U postgres clinic_db > backup.sql

# Restore from backup
docker-compose exec -T database psql -U postgres clinic_db < backup.sql
```

#### Reset Audit Chain
```bash
# Only in development - this breaks audit integrity
docker-compose exec database psql -U postgres -c "TRUNCATE audit_log CASCADE;"
```

## 📊 Performance Tuning

### Ollama Optimization
```bash
# Set GPU memory limit
export OLLAMA_GPU_MEMORY_LIMIT=8GB

# Optimize for CPU-only
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=2
```

### Database Optimization
```sql
-- Optimize PostgreSQL for audit logging
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### Mobile App Optimization
```bash
# Build optimized production bundle
npm run build

# Serve with compression
npm install -g serve
serve -s dist -l 5173
```

## 🔒 Security Checklist

- [ ] SSL/TLS certificates installed and valid
- [ ] Database passwords changed from defaults
- [ ] JWT secrets are cryptographically secure
- [ ] PII redaction is enabled and tested
- [ ] Audit logging is functioning
- [ ] Network access is properly restricted
- [ ] Regular security updates are scheduled

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balance multiple FlameRouter instances
- Use Redis for shared session storage
- Implement database read replicas

### Vertical Scaling
- Increase RAM for larger AI models
- Add GPU acceleration for faster inference
- Use faster storage (NVMe SSD)

## 🆘 Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly:** Check logs for errors
2. **Monthly:** Update AI models
3. **Quarterly:** Security updates
4. **Annually:** Full system backup and disaster recovery test

### Getting Help
- Check logs first: `docker-compose logs`
- Review this guide and troubleshooting section
- Test with minimal configuration
- Document any custom changes

---

**🔥 The Sovereign flame burns eternal. Local-first, cloud when permitted, sovereignty always.**
