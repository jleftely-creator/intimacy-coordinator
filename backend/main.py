# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Optional
import httpx
import random
import string
import os

app = FastAPI(title="Intimacy Coordinator API")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
# Structure: { "ROOM_CODE": { "user_id": {...}, "user_id_2": {...} } }
sessions: Dict[str, Dict] = {}

# Service endpoints (configurable via env)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
TTS_URL = os.getenv("TTS_URL", "http://host.docker.internal:8880/v1")
STT_URL = os.getenv("STT_URL", "http://host.docker.internal:8090")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "dolphin-mistral")


class UserSelection(BaseModel):
    role: str  # "dom", "sub", "switch"
    intensity: str  # "casual", "adventurous", "weird", "demon"
    inventory: List[str]
    outfit: List[str]
    kinks: List[str]


class JoinRequest(BaseModel):
    room_code: Optional[str] = None


class GenerateRequest(BaseModel):
    solo: bool = False
    user_data: Optional[UserSelection] = None

class Questionnaire(BaseModel):
    # Define questionnaire fields as needed
    theme: Optional[str] = None
    preferences: Optional[List[str]] = None
    notes: Optional[str] = None


class TTSRequest(BaseModel):
    text: str
    voice: str = "default"


# ============ ROOM MANAGEMENT ============

@app.post("/api/room")
async def create_or_join(req: JoinRequest):
    """Create a new room or join an existing one."""
    if not req.room_code:
        # Generate unique 4-char room code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        while code in sessions:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        sessions[code] = {}
        return {"room_code": code, "role": "host", "status": "created"}

    # Join existing room
    if req.room_code.upper() in sessions:
        return {"room_code": req.room_code.upper(), "role": "partner", "status": "joined"}

    raise HTTPException(status_code=404, detail="Room not found")


@app.get("/api/room/{room_code}")
async def get_room_status(room_code: str):
    """Check room status and partner count."""
    code = room_code.upper()
    if code not in sessions:
        raise HTTPException(404, "Room not found")

    return {
        "room_code": code,
        "partners_connected": len(sessions[code]),
        "partner_ids": list(sessions[code].keys())
    }


@app.post("/api/sync/{room_code}/{user_id}")
async def sync_data(room_code: str, user_id: str, data: UserSelection):
    """Sync user selections to the room."""
    code = room_code.upper()
    if code not in sessions:
        raise HTTPException(404, "Room expired or not found")

    sessions[code][user_id] = data.dict()
    return {
        "status": "synced",
        "partners_ready": len(sessions[code]),
        "your_data": data.dict()
    }

@app.post("/api/questionnaire/{room_code}/{user_id}")
async def submit_questionnaire(room_code: str, user_id: str, q: Questionnaire):
    """Receive questionnaire data for a user and store it in the session."""
    code = room_code.upper()
    if code not in sessions:
        raise HTTPException(404, "Room not found")
    if user_id not in sessions[code]:
        sessions[code][user_id] = {}
    sessions[code][user_id]["questionnaire"] = q.dict()
    return {"status": "questionnaire saved", "room": code, "user": user_id}


@app.delete("/api/room/{room_code}")
async def close_room(room_code: str):
    """Close and delete a room."""
    code = room_code.upper()
    if code in sessions:
        del sessions[code]
        return {"status": "closed"}
    raise HTTPException(404, "Room not found")


# ============ SCENE GENERATION ============

@app.post("/api/generate/{room_code}")
async def generate_scene(room_code: str, req: GenerateRequest = None):
    """Return merged data from all room partners for frontend generation."""
    code = room_code.upper()

    # Solo mode - use provided data directly
    if req and req.solo and req.user_data:
        room_data = {"solo_user": req.user_data.dict()}
    else:
        room_data = sessions.get(code)
        if not room_data or len(room_data) < 1:
            raise HTTPException(400, "Room empty or waiting for partner")

    # Merge all partner data
    all_toys = set()
    all_kinks = set()
    all_outfits = set()
    intensities = []
    roles = []

    for user_data in room_data.values():
        all_toys.update(user_data.get('inventory', []))
        all_kinks.update(user_data.get('kinks', []))
        all_outfits.update(user_data.get('outfit', []))
        intensities.append(user_data.get('intensity', 'adventurous'))
        roles.append(user_data.get('role', 'switch'))

    # Intensity escalation: highest wins
    intensity_order = ['casual', 'adventurous', 'weird', 'demon']
    final_intensity = max(intensities, key=lambda x: intensity_order.index(x) if x in intensity_order else 1)

    # Gather questionnaire data if present
    questionnaire_data = []
    for user in sessions.get(code, {}).values():
        q = user.get("questionnaire")
        if q:
            questionnaire_data.append(q)

    # Return merged data - frontend generator.js handles the actual LLM call
    return {
        "merged": True,
        "intensity": final_intensity,
        "roles": roles,
        "merged_data": {
            "toys": list(all_toys),
            "kinks": list(all_kinks),
            "outfits": list(all_outfits)
        },
        "questionnaire": questionnaire_data,
        "ollama_url": OLLAMA_URL,
        "ollama_model": OLLAMA_MODEL
    }


# ============ MODEL MANAGEMENT ============
import glob

HOST_MODELS_PATH = os.getenv("HOST_MODELS_PATH", "F:\\TITAN_MODELS")
CONTAINER_MODELS_PATH = "/models"

@app.get("/api/models/files")
async def list_model_files():
    """List .gguf files available in the mounted models directory."""
    try:
        if not os.path.exists(CONTAINER_MODELS_PATH):
            return {"files": [], "error": f"Path {CONTAINER_MODELS_PATH} not found"}
            
        files = glob.glob(os.path.join(CONTAINER_MODELS_PATH, "*.gguf"))
        # Return just filenames sorted
        return {"files": sorted([os.path.basename(f) for f in files])}
    except Exception as e:
        raise HTTPException(500, f"Failed to list models: {str(e)}")

@app.get("/api/models/tags")
async def list_ollama_tags():
    """Access Ollama API to list currently available models."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            if r.status_code == 200:
                data = r.json()
                return {"models": [m['name'] for m in data.get('models', [])]}
            return {"models": [], "error": f"Ollama returned {r.status_code}"}
    except Exception as e:
        return {"models": [], "error": f"Ollama unreachable: {str(e)}"}

@app.post("/api/models/load")
async def load_model(req: dict):
    """
    Load a GGUF file into Ollama. 
    Since Ollama is on the Host, we use the FROM <host_path> syntax
    to avoid slow blob uploads.
    """
    filename = req.get("filename")
    model_name = req.get("model_name")
    
    if not filename or not model_name:
        raise HTTPException(400, "filename and model_name required")

    # 1. Verify file exists (in container view)
    container_path = os.path.join(CONTAINER_MODELS_PATH, filename)
    if not os.path.exists(container_path):
        raise HTTPException(404, f"File {filename} not found")

    # 2. Construct Host Path for the Host-side Ollama
    host_path = f"{HOST_MODELS_PATH}/{filename}".replace("\\", "/")
    
    # 3. Create Modelfile string
    # Standardizing to uppercase FROM with quotes for safety
    modelfile = f'FROM "{host_path}"\n'
    
    print(f"DEBUG: Attempting Ollama create. Params: model={model_name}, host_path={host_path}")
    print(f"DEBUG: Modelfile content: {repr(modelfile)}")

    # 4. Call Ollama API
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            create_req = {
                "model": model_name,
                "modelfile": modelfile,
                "stream": False
            }
            
            response = await client.post(f"{OLLAMA_URL}/api/create", json=create_req)
            
            if response.status_code != 200:
                err_data = response.text
                print(f"DEBUG: Ollama error: {err_data}")
                raise HTTPException(500, f"Ollama Error: {err_data} | Modelfile: {modelfile}")

            return {"status": "success", "model": model_name}

    except Exception as e:
        print(f"DEBUG: Load exception: {str(e)}")
        raise HTTPException(500, f"Load failed: {str(e)}")

@app.get("/api/models/importer-script")
async def get_importer_script():
    """Serve the PowerShell importer script for host-side execution."""
    script_path = "Import_GGUF_Model.ps1"
    if os.path.exists(script_path):
        from fastapi.responses import FileResponse
        return FileResponse(script_path, media_type="application/octet-stream", filename=script_path)
    raise HTTPException(404, "Importer script not found")


# ============ LLM GENERATION (Ollama) ============

class LLMRequest(BaseModel):
    prompt: str
    model: Optional[str] = None # Added model selection
    temperature: float = 1.2
    max_tokens: int = 4096
    top_p: float = 0.95
    top_k: int = 80
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    context_length: int = 16384
    repeat_penalty: float = 1.1


@app.post("/api/llm")
async def generate_with_ollama(req: LLMRequest):
    """Send prompt to Ollama and return generated text."""
    target_model = req.model if req.model else OLLAMA_MODEL
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": target_model,
                    "prompt": req.prompt,
                    "stream": False,
                    "options": {
                        "temperature": req.temperature,
                        "num_predict": req.max_tokens,
                        "top_p": req.top_p,
                        "top_k": req.top_k,
                        "repeat_penalty": req.repeat_penalty,
                        "num_ctx": req.context_length
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            return {
                "text": result.get("response", ""),
                "model": target_model,
                "done": result.get("done", True)
            }
    except httpx.RequestError as e:
        raise HTTPException(503, f"Ollama unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Generation failed: {str(e)}")


# ============ TTS INTEGRATION ============

@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    """Convert text to speech using local TTS service."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{TTS_URL}/audio/speech",
                json={
                    "input": req.text,
                    "voice": req.voice,
                    "model": "tts-1"
                }
            )
            response.raise_for_status()
            # Return audio as base64 or stream
            import base64
            audio_b64 = base64.b64encode(response.content).decode()
            return {"audio": audio_b64, "format": "mp3"}
    except httpx.RequestError as e:
        raise HTTPException(503, f"TTS service unavailable: {str(e)}")


# ============ STT INTEGRATION ============

@app.post("/api/stt")
async def speech_to_text(audio_data: bytes):
    """Convert speech to text using local STT service."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{STT_URL}/transcribe",
                files={"file": ("audio.wav", audio_data, "audio/wav")}
            )
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(503, f"STT service unavailable: {str(e)}")


# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Check API and service connectivity."""
    services = {}

    # Check Ollama
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            services["ollama"] = "connected" if r.status_code == 200 else "error"
    except:
        services["ollama"] = "unavailable"

    # Check TTS
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{TTS_URL}/health")
            services["tts"] = "connected" if r.status_code == 200 else "error"
    except:
        services["tts"] = "unavailable"

    # Check STT
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{STT_URL}/health")
            services["stt"] = "connected" if r.status_code == 200 else "error"
    except:
        services["stt"] = "unavailable"

    return {"status": "running", "services": services}


# Serve static files (React build) in production
if os.path.exists("/app/static"):
    app.mount("/", StaticFiles(directory="/app/static", html=True), name="static")
