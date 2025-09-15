# Omnirelay ↔ Omari API Adapter

A secure, high-performance bridge that enables any Empire application to communicate with Omari AI assistant and receive real-time events back through the Empire grid.

## 🔥 Features

### 🛡️ Security First
- **HMAC-SHA256 Authentication**: Every request cryptographically signed
- **IP Allowlisting**: CIDR-based network access control
- **Timestamp Validation**: Prevents replay attacks
- **Rate Limiting**: 60 RPM with burst protection
- **Idempotency**: Safe request retries with 24-hour caching

### ⚡ High Performance
- **Batch Processing**: Handle up to 50 operations in single request
- **Memory Store**: In-memory caching for development
- **PostgreSQL Ready**: Production-grade persistence
- **Event Streaming**: Real-time webhook delivery

### 🔌 Complete Integration
- **Memory Management**: Query, add, update, delete memory blocks
- **Personality Control**: Dynamic AI trait configuration
- **Chat Interface**: Full conversational AI access
- **External Integrations**: GitHub, Notion, Gmail, Netlify support
- **Conversation Management**: Create, list, delete conversations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- PostgreSQL (optional - uses in-memory storage by default)

### Installation

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install Dependencies**
   ```bash
   cd packages/omnirelay-adapter
   npm install
   ```

3. **Start Omari with Adapter**
   ```bash
   # From project root
   npm run dev
   ```

4. **Verify Installation**
   ```bash
   curl http://localhost:5000/api/relay/v1/health
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Core Omari
OPENAI_API_KEY=your_openai_api_key_here

# Omnirelay Security
OMNIRELAY_SHARED_SECRET=your-secure-secret-key
OMNIRELAY_ALLOWED_IPS=127.0.0.1/32,10.0.0.0/8

# Optional
OMNIRELAY_WEBHOOK_URL=http://omnirelay.local/api/events
OMARI_MODE=local
RATE_LIMIT_RPM=60
DATABASE_URL=postgresql://user:pass@localhost:5432/omari
```

### Operating Modes

#### Mode A: Local Sovereign (GhostVault, LAN)
```env
OMARI_MODE=local
DATABASE_URL=postgresql://ghostvault:secret@localhost:5432/omari
OMNIRELAY_ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8
OMNIRELAY_WEBHOOK_URL=http://omnirelay.local/api/events
```

#### Mode B: Public Relay (Neon, Cloud)
```env
OMARI_MODE=cloud
DATABASE_URL=postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/omari
OMNIRELAY_ALLOWED_IPS=0.0.0.0/0
OMNIRELAY_WEBHOOK_URL=https://omnirelay.example.com/api/events
```

## 📡 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/relay/v1/health` | Health check and status |
| GET | `/api/relay/v1/version` | Version information |
| POST | `/api/relay/v1/ingest` | Process single command |
| POST | `/api/relay/v1/batch` | Process multiple commands |
| POST | `/api/relay/v1/emit` | Emit event to webhook |

### Authentication Headers

All requests require HMAC authentication:

```http
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
X-Timestamp: 2025-09-03T07:20:35Z
X-Device-Id: dev_4Q9K
X-Signature: base64-encoded-hmac-sha256
```

### Message Envelope

```json
{
  "v": "1.0",
  "id": "uuid-v4",
  "ts": "2025-09-03T07:20:35Z",
  "source": "omnirelay",
  "target": "omari",
  "op": "memory.query",
  "actor": {
    "device_id": "dev_4Q9K",
    "persona": "Omnirelay",
    "scopes": ["memory:read"]
  },
  "context": {
    "personality": {
      "wisdom": true,
      "analytical": true
    }
  },
  "payload": {},
  "trace": {
    "request_id": "uuid-v4"
  }
}
```

## 🎯 Operations

### Memory Operations
- `memory.query` - Search memory blocks
- `memory.add` - Create new memory block
- `memory.update` - Modify existing memory
- `memory.delete` - Remove memory block

### Chat Operations
- `omari.chat` - Send chat message

### Personality Operations
- `personality.get` - Get current settings
- `personality.set` - Update personality traits

### Integration Operations
- `integration.invoke` - Execute integration action

### Conversation Operations
- `conversation.create` - Start new conversation
- `conversation.list` - List conversations
- `conversation.delete` - Remove conversation
- `message.append` - Add message
- `message.list` - Get conversation history

## 🧪 Demo Scripts

Interactive demo scripts are provided in the `demo/` directory:

```bash
# Add memory block
./demo/01_send_memory_add.sh

# Query memory blocks
./demo/02_query_memory.sh

# Chat with Omari
./demo/03_chat.sh

# Invoke GitHub integration
./demo/04_invoke_github.sh
```

Each script includes:
- ✅ HMAC signature generation
- ✅ Interactive examples
- ✅ Error handling
- ✅ Colored output
- ✅ Idempotency testing

## 🔒 Security Features

### HMAC Authentication
```bash
# Generate signature
STRING_TO_SIGN="${METHOD}${PATH}${BODY}${TIMESTAMP}"
SIGNATURE=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)
```

### IP Allowlisting
```env
# Single IP
OMNIRELAY_ALLOWED_IPS=192.168.1.100/32

# Multiple networks
OMNIRELAY_ALLOWED_IPS=127.0.0.1/32,10.0.0.0/8,192.168.0.0/16

# Public access (cloud mode)
OMNIRELAY_ALLOWED_IPS=0.0.0.0/0
```

### Rate Limiting
- **Standard**: 60 requests per minute per IP/device
- **Burst**: 20 requests per 10 seconds
- **Idempotency**: Cached responses for 24 hours

## 🧪 Testing

### Run Test Suite
```bash
npm test
npm run test:coverage
```

### Contract Tests
- HMAC signature validation
- Idempotency behavior
- Rate limiting enforcement
- Integration routing
- Error handling

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/relay/v1/health

# Version info
curl http://localhost:5000/api/relay/v1/version

# Debug endpoints (development only)
curl http://localhost:5000/api/relay/v1/debug/allowlist
```

## 📊 Monitoring

### Metrics Endpoint
```bash
curl http://localhost:5000/api/relay/v1/metrics
```

Returns:
- Process uptime
- Memory usage
- Request statistics
- Health status

### Audit Logging
All requests are logged with:
- Request ID
- Operation type
- Device ID
- Response status
- Processing time

## 🐳 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables
```env
NODE_ENV=production
PORT=5000
OMNIRELAY_SHARED_SECRET=production-secret
DATABASE_URL=postgresql://prod-user:pass@db:5432/omari
OMNIRELAY_ALLOWED_IPS=10.0.0.0/8
OMNIRELAY_WEBHOOK_URL=https://omnirelay.prod.example.com/api/events
```

## 🔧 Development

### Project Structure
```
packages/omnirelay-adapter/
├── src/
│   ├── handlers/          # Request handlers
│   ├── domain/           # Business logic
│   ├── security/         # Auth & security
│   ├── schemas/          # Data validation
│   └── test/            # Test suites
├── demo/                # Demo scripts
├── openapi.yaml         # API specification
└── README.md           # This file
```

### Adding New Operations

1. **Define Schema** (schemas/envelope.ts)
2. **Create Handler** (domain/[feature].ts)
3. **Add Route** (handlers/ingest.ts)
4. **Write Tests** (test/contract/[feature].test.ts)
5. **Update OpenAPI** (openapi.yaml)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure 90%+ test coverage
5. Update documentation
6. Submit pull request

## 📚 Documentation

- **OpenAPI Spec**: `src/server/openapi.yaml`
- **Contract Tests**: `src/test/contract/`
- **Demo Scripts**: `demo/`
- **Main Omari Docs**: `../../README.md`

## 🆘 Troubleshooting

### Common Issues

**HMAC Authentication Fails**
- Check shared secret matches
- Verify timestamp is current (±5 minutes)
- Ensure signature includes all required data

**Rate Limiting**
- Default: 60 RPM per device/IP
- Adjust `RATE_LIMIT_RPM` environment variable
- Use idempotency keys for retries

**IP Allowlist Rejection**
- Verify CIDR notation: `192.168.1.0/24`
- Check client IP in logs
- Use `0.0.0.0/0` for development (insecure)

**Integration Failures**
- Ensure integration is configured and active
- Check API credentials and permissions
- Verify integration templates are loaded

## 📄 License

MIT License - see LICENSE file for details.

---

**Omari, Spirit of Old** - *Overseer of the GodsIMiJ Empire*
