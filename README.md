# Intimacy Coordinator - Scene Architect v2.0

A collaborative scene planning tool with local LLM integration, partner sync, and voice controls.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend dev)
- **Docker** (for deployment)
- **Ollama** running locally with a model (e.g., `dolphin-mistral`)
- Optional: Local TTS service on port 8880, STT on port 8090

### Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Production Deployment

```bash
# 1. Build the React app
npm run build

# 2. Start Ollama on your machine
ollama run dolphin-mistral

# 3. Launch with Docker
docker-compose up --build

# App available at http://localhost:8000
```

## 📱 Mobile Access (Same WiFi)

1. Find your desktop IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On phone browser: `http://192.168.x.x:8000`
3. Save to home screen for app-like experience (hides browser chrome)

## 🔗 Partner Sync Flow

1. **Host**: Click "Create Room" → Get 4-digit code (e.g., `AB12`)
2. **Partner**: Click "Join Room" → Enter code
3. **Both**: Configure intensity, inventory, kinks independently
4. **Host**: Click "Generate Shared Scene"
5. **Result**: Backend merges both configs, sends to Ollama, returns shared scene

## 🛠 Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Phone A       │     │   Phone B       │
│   (React PWA)   │     │   (React PWA)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   FastAPI   │
              │   Backend   │
              │  (Docker)   │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
    │ Ollama  │ │   TTS   │ │   STT   │
    │ :11434  │ │  :8880  │ │  :8090  │
    └─────────┘ └─────────┘ └─────────┘
```

## 📁 Project Structure

```
intimacy-coordinator/
├── src/
│   ├── components/
│   │   ├── LoadoutScreen.jsx    # Main selection interface
│   │   ├── MegaSelector.jsx     # Expandable category picker
│   │   ├── IntensitySelector.jsx # Intensity level picker
│   │   ├── RoomManager.jsx      # Partner sync UI
│   │   ├── VoiceControls.jsx    # STT/TTS controls
│   │   └── SceneDisplay.jsx     # Generated scene output
│   ├── data/
│   │   └── schema.js            # Inventory/outfit/kink definitions
│   ├── utils/
│   │   ├── api.js               # Backend API client
│   │   └── generator.js         # Local scene generation fallback
│   └── App.jsx
├── backend/
│   ├── main.py                  # FastAPI server
│   └── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API URL |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama endpoint |
| `TTS_URL` | `http://host.docker.internal:8880/v1` | Text-to-speech service |
| `STT_URL` | `http://host.docker.internal:8090` | Speech-to-text service |
| `OLLAMA_MODEL` | `dolphin-mistral` | LLM model name |

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/room` | Create or join a room |
| `GET` | `/api/room/{code}` | Get room status |
| `POST` | `/api/sync/{code}/{user}` | Sync user selections |
| `POST` | `/api/generate/{code}` | Generate merged scene |
| `POST` | `/api/tts` | Text to speech |
| `POST` | `/api/stt` | Speech to text |
| `GET` | `/api/health` | Service health check |

## ⚡ Intensity Levels

| Level | Description |
|-------|-------------|
| **Casual** | Vanilla with sprinkles. Good vibes, low stakes. |
| **Adventurous** | Pushing boundaries. Toys, light restraint. |
| **Weird** | Niche kinks. Heavy roleplay. Things get sticky. |
| **Demon** | ABSOLUTE CHAOS. Feral, unhinged, primal fear. |

---

Built with ❤️ and questionable judgment.
