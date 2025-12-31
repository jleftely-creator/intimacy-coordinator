# AI Handoff Context - Intimacy Coordinator Project
**Date:** December 30, 2025
**Version:** v2.2 (Strict)

## Project Overview
This project is an **Intimacy Coordinator Scene Generator**, a web application that helps users generate erotic scenes using local LLMs (Ollama). It features a "MegaSelector" UI for selecting preferences (Toys, Kinks, etc.), a "Strict Prioritization" prompt engine, and a Dockerized backend.

### Key Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Python (FastAPI/Starlette), `httpx` for Ollama communication.
- **Infrastructure**: Docker Compose (services: `kink-app` [web+backend], `ollama` [external/host]).
- **AI Engine**: Ollama (running on host, accessed via `host.docker.internal`).

## Recent Critical Changes (Current State)

### 1. Model Import (GGUF)
- **Feature**: Users can import local `.gguf` files from `F:\TITAN_MODELS`.
- **Implementation**: `backend/main.py` uses the `FROM "host_path"` syntax in the Modelfile.
- **Status**: Stable. Includes a "Synchronized Import" fallback script if the API fails.

### 2. Prompt "Strict Prioritization"
- **Problem**: The AI was ignoring user priorities (Red/Wants vs Gray/Okay) and hallucinating.
- **Solution**:
    - **`src/utils/generator.js`**: Refactored `formatList` to output natural language buckets:
        - `Key Elements (Must use): [Items...]`
        - `Secondary Elements (Optional): [Items...]`
    - **Custom Templates**: Updated `flatten` helper to enforce this same logic even for custom templates.
    - **Narrative Style**: Switched default prompt from rigid blocks to a sentence-based flow to fix hallucinations.
    - **Temperature**: Lowered default to `1.1` in `PromptEditor.jsx`.

### 3. Debug View
- **Location**: `src/components/SceneDisplay.jsx`
- **Improvements**:
    - Compact UI (max-h-40/60).
    - `whitespace-pre-wrap` enabled to prevent horizontal text overflow.
    - "Copy" icon buttons added for easy data export.
    - Monospace font (`text-xs`) with green/blue contrast.

## Architecture & Data Flow
1.  **Selection**: `LoadoutScreen.jsx` collects deeply nested state (`inventory`, `kinks`, `outfit`, `settings`).
2.  **Payload Structuring**: `MegaSelector.jsx` organizes this into `{ wants: [], okay: [], not: [] }`.
3.  **Generation**:
    - `generator.js` receives the payload.
    - It calls `buildPrompt` -> `formatList` (applying the strict logic).
    - It sends the final prompt to backend via `api.js`.
4.  **Backend**: `main.py` forwards the request to the Ollama instance at `OLLAMA_HOST`.

## Known Issues / Watchlist
- **Deployment**: Windows Docker volume mounting can be finicky. Ensure `npm run build` is run before `docker-compose up --build` if frontend changes aren't showing.
- **Context Window**: Check `num_ctx` in `main.py` if long scenes get cut off.

## Deployment Commands
- **Rebuild Frontend**: `npm run build`
- **Full Redeploy**: `docker-compose up -d --build --force-recreate`

## Files of Interest
- `src/utils/generator.js`: CORE logic for prompt construction.
- `src/components/SceneDisplay.jsx`: UI for chat and debug.
- `src/components/PromptEditor.jsx`: Manages AI params and templates.
- `backend/main.py`: API endpoints and Ollama bridge.
