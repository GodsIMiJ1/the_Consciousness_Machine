# Omari, Spirit of Old 🧙‍♂️

A sophisticated AI personal assistant web application that provides conversational chat interface for daily task management, schedule coordination, and external application integrations.

## ✨ Features

### 🤖 AI-Powered Conversations
- **GPT-5 Integration**: Powered by OpenAI's latest model for intelligent responses
- **Context-Aware**: Maintains conversation history and device-specific context
- **Personality Customization**: Configurable AI traits and behavior patterns
- **Memory System**: Persistent memory blocks with importance ratings

### 🔧 Device-Based Authentication
- **No Traditional Login**: Uses unique device IDs stored locally
- **Privacy-First**: Each device maintains its own data and settings
- **Automatic Registration**: Seamless onboarding on first use

### 🔌 External Integrations
- **GitHub**: Repository management, issues, pull requests
- **Notion**: Database queries, page management
- **Gmail**: Email reading, sending, inbox management
- **Netlify**: Deployment status, site management
- **Custom APIs**: User-defined integrations

### 🧠 Memory & Personality
- **Smart Memory**: Store important information with priority levels
- **Personality Traits**: Wisdom, humor, creativity, analytical thinking
- **Custom Instructions**: Personalized AI behavior prompts
- **User Context**: Background, preferences, and goals

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (optional - uses in-memory storage by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GhostKingAI-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional - Database (uses in-memory storage if not provided)
   DATABASE_URL=postgresql://username:password@localhost:5432/omari_db
   
   # Optional - Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database migrations (if using PostgreSQL)
npm run db:push
```

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   │   └── integrations/   # Third-party integrations
│   ├── index.ts            # Server entry point
│   └── storage.ts          # Data storage interface
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema
└── package.json
```

## 🔧 Configuration

### AI Personality Traits

Configure Omari's personality through the settings panel:

- **Wisdom**: Ancient knowledge and philosophical insights
- **Humor**: Playful and witty responses
- **Formal**: Professional and structured communication
- **Creative**: Imaginative and artistic perspectives
- **Analytical**: Logical and data-driven approaches
- **Empathetic**: Understanding and compassionate responses

### Memory Management

- **Importance Scale**: 1-10 rating system for memory priority
- **Categories**: Organize memories by type (general, personal, work)
- **Memory Limit**: Configurable limit (default: 35 blocks)
- **Active/Inactive**: Toggle memory blocks on/off

### Integration Setup

1. Navigate to the Integrations panel
2. Select an integration template
3. Configure API credentials
4. Test connection
5. Activate integration

## 📡 API Reference

### Core Endpoints

#### Device Management
```http
GET /api/device/:deviceId
PUT /api/device/:deviceId/settings
```

#### Conversations
```http
GET /api/conversations/:deviceId
POST /api/conversations
DELETE /api/conversations/:conversationId
```

#### Messages
```http
GET /api/messages/:conversationId
POST /api/messages
```

#### AI Chat
```http
POST /api/chat
```

#### Integrations
```http
GET /api/integrations/:deviceId
POST /api/integrations
PUT /api/integrations/:integrationId
DELETE /api/integrations/:integrationId
POST /api/integrations/test
```

#### Memory Management
```http
GET /api/memory/:deviceId
POST /api/memory
PUT /api/memory/:id
DELETE /api/memory/:id
```

### External API Endpoints

For integration with other applications:

```http
POST /api/external/notify    # Send notifications to Omari
POST /api/external/query     # Query Omari from external apps
```

## 🔌 Integrations

### GitHub Integration
- Repository management
- Issue tracking
- Pull request monitoring
- Profile information

**Setup**: Requires GitHub Personal Access Token

### Notion Integration
- Database queries
- Page creation and updates
- Content management
- Search functionality

**Setup**: Requires Notion Integration Token

### Gmail Integration
- Email reading and sending
- Inbox management
- Message search
- Mark as read/unread

**Setup**: Requires OAuth2 tokens

### Netlify Integration
- Site management
- Deployment monitoring
- Build status
- Domain configuration

**Setup**: Requires Netlify Personal Access Token

## 🗄️ Database Schema

The application uses Drizzle ORM with PostgreSQL:

- **devices**: Device registration and settings
- **conversations**: Chat conversation metadata
- **messages**: Individual chat messages
- **integrations**: Third-party service configurations
- **memory_blocks**: User-defined memory storage
- **personality_settings**: AI customization preferences
- **api_keys**: Device-specific API management

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

```env
NODE_ENV=production
PORT=5000
OPENAI_API_KEY=your_production_key
DATABASE_URL=your_production_database_url
```

### Docker Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API reference

## 🔮 Roadmap

- [ ] Voice interaction capabilities
- [ ] Mobile application
- [ ] Advanced integration templates
- [ ] Multi-language support
- [ ] Plugin system for custom integrations
- [ ] Advanced analytics and insights
