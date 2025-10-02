# 🏗️ Byggare Bob - AI Construction CRM

**Byggare Bob** is a comprehensive AI-driven construction management system designed for Swedish contractors. It features an intelligent voice agent that can handle customer calls, automatically create projects, schedule appointments, and manage the entire construction workflow from initial contact to invoicing.

## 🌟 Features

### 🤖 AI Voice Agent
- **OpenAI Realtime API** integration for natural Swedish conversations
- **Twilio** phone system integration
- **Automatic transcription** using OpenAI Whisper
- **Intent recognition** for construction-specific requests (plumbing, electrical, general)
- **Automatic project creation** from phone calls

### 📊 Complete CRM System
- **Customer Management** - Contact database with call history
- **Project Tracking** - From initial inquiry to completion
- **Appointment Scheduling** - Automated booking suggestions
- **Invoice Generation** - Automatic billing based on project work
- **Real-time Dashboard** - Live updates via WebSocket

### 🏗️ Construction-Specific
- **Swedish Language Support** - Complete Swedish interface and AI responses
- **Industry Categories** - VVS (plumbing), electrical, general construction
- **Cost Tracking** - Material and labor cost logging
- **Staff Notifications** - Email/SMS alerts for new projects

## 🛠️ Technology Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js (Microservices Architecture)
- **Database**: PostgreSQL
- **Message Queue**: Redis, NATS
- **AI**: OpenAI GPT-4o Realtime, Whisper
- **Voice**: Twilio
- **Infrastructure**: Docker, Docker Compose
- **Real-time**: WebSockets

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- OpenAI API Key (for voice AI features)
- Twilio Account (for phone integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/byggare-bob.git
   cd byggare-bob
   ```

2. **Start the system**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Web Interface: http://localhost:5173
   - API Gateway: http://localhost:8080

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **Web App** | 5173 | React frontend with Swedish interface |
| **API Gateway** | 8080 | Central entry point with WebSocket support |
| **CRM Service** | 3001 | Customer & project management |
| **Voice AI Service** | 3002 | AI phone system with OpenAI integration |
| **Scheduling Service** | 3003 | Appointment management |
| **Invoicing Service** | 3004 | Billing system |
| **Notification Service** | 3005 | Email/SMS notifications |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Caching layer |
| **NATS** | 4222 | Message streaming |

## 📱 Usage

### Web Interface
Navigate to `http://localhost:5173` to access the Swedish interface with:

- 🏠 **Dashboard** - Overview and statistics
- 📄 **Ärenden** (Cases) - Project management
- 📅 **Kalender** (Calendar) - Scheduling
- 📞 **Voice Agent** - AI phone system
- 💰 **Fakturor** (Invoices) - Billing
- ⚙️ **Inställningar** (Settings)

### Voice AI Setup
To enable the voice AI features:

1. **Set OpenAI API Key**
   ```bash
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. **Configure Twilio** (optional for phone integration)
   - Set up Twilio webhook to point to: `http://your-domain/voice/twilio/webhook`

## 🏗️ Architecture

The system follows a **microservices architecture**:

```
┌─────────────────┐    ┌──────────────────┐
│   React Web     │    │   API Gateway    │
│   Frontend      │◄──►│   (WebSocket)    │
└─────────────────┘    └──────────────────┘
                                │
                       ┌────────┼────────┐
                       ▼        ▼        ▼
                 ┌──────────┐ ┌──────┐ ┌─────────┐
                 │   CRM    │ │Voice │ │Schedule │
                 │ Service  │ │  AI  │ │Service  │
                 └──────────┘ └──────┘ └─────────┘
                       │        │        │
                       ▼        ▼        ▼
                 ┌──────────────────────────────┐
                 │      PostgreSQL Database     │
                 └──────────────────────────────┘
```

## 🔄 Voice Agent Workflow

1. **Customer calls** → Twilio receives call
2. **AI Assistant** greets in Swedish using GPT-4o Realtime
3. **Customer describes** construction issue
4. **Whisper transcribes** the conversation
5. **AI extracts intent** (plumbing, electrical, general, quote)
6. **System automatically**:
   - Creates/updates customer contact
   - Creates new project case
   - Suggests appointment times
   - Sends staff notifications
   - Logs call for follow-up

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start individual services
cd services/crm-service && npm run dev
cd services/voice-ai-service && npm run dev
# ... etc

# Start frontend
cd apps/web && npm run dev
```

### Project Structure
```
byggare-bob/
├── apps/
│   ├── api-gateway/          # Central API gateway
│   └── web/                  # React frontend
├── services/
│   ├── crm-service/          # Customer & project management
│   ├── voice-ai-service/     # AI phone system
│   ├── scheduling-service/   # Appointments
│   ├── invoicing-service/    # Billing
│   └── notification-service/ # Communications
├── packages/
│   └── shared-types/         # Shared TypeScript types
├── infra/
│   └── docker/              # Database initialization
└── docker-compose.yml       # Container orchestration
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY` - Required for voice AI features
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `TWILIO_*` - Twilio configuration (optional)

### Database
The PostgreSQL database is automatically initialized with:
- Contacts table
- Projects table  
- Calls table (for voice AI logs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o Realtime API and Whisper
- **Twilio** for voice communication infrastructure
- **Swedish Construction Industry** for inspiration and requirements

---

**Built with ❤️ for Swedish contractors** 🇸🇪
