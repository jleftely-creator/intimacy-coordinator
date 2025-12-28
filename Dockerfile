# Multi-stage build for smaller image
FROM python:3.11-slim as backend

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/main.py .

# Production stage
FROM backend as production

# Copy pre-built React app (run 'npm run build' first)
COPY dist /app/static

# Environment variables (override at runtime)
ENV OLLAMA_URL=http://host.docker.internal:11434
ENV TTS_URL=http://host.docker.internal:8880/v1
ENV STT_URL=http://host.docker.internal:8090
ENV OLLAMA_MODEL=dolphin-mistral

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
