// API client for the Intimacy Coordinator backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.roomCode = null;
        this.userId = this.generateUserId();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substring(2, 9);
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Request failed' }));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // ============ ROOM MANAGEMENT ============

    async createRoom() {
        const result = await this.request('/room', {
            method: 'POST',
            body: JSON.stringify({})
        });
        this.roomCode = result.room_code;
        return result;
    }

    async joinRoom(roomCode) {
        const result = await this.request('/room', {
            method: 'POST',
            body: JSON.stringify({ room_code: roomCode })
        });
        this.roomCode = result.room_code;
        return result;
    }

    async getRoomStatus() {
        if (!this.roomCode) throw new Error('Not in a room');
        return this.request(`/room/${this.roomCode}`);
    }

    async closeRoom() {
        if (!this.roomCode) return;
        await this.request(`/room/${this.roomCode}`, { method: 'DELETE' });
        this.roomCode = null;
    }

    // ============ DATA SYNC ============

    async syncSelection(data) {
        if (!this.roomCode) throw new Error('Not in a room');
        return this.request(`/sync/${this.roomCode}/${this.userId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ============ SCENE GENERATION ============

    async generateScene(soloData = null) {
        if (!this.roomCode && !soloData) {
            throw new Error('Either join a room or provide solo data');
        }

        const endpoint = this.roomCode ? `/generate/${this.roomCode}` : '/generate/SOLO';
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                solo: !this.roomCode,
                user_data: soloData
            })
        });
    }

    // ============ AI GENERATION (Ollama) ============

    async getOllamaTags() {
        return this.request('/models/tags');
    }

    async getModelFiles() {
        return this.request('/models/files');
    }

    async loadModel(filename, modelName) {
        return this.request('/models/load', {
            method: 'POST',
            body: JSON.stringify({ filename, model_name: modelName })
        });
    }

    async generateWithAI(prompt, params = {}) {
        return this.request('/llm', {
            method: 'POST',
            body: JSON.stringify({
                prompt: prompt,
                model: params.model, // Pass selected model
                temperature: params.temperature || 1.2,
                max_tokens: params.max_tokens || 4096,
                top_p: params.top_p || 0.95,
                top_k: params.top_k || 80,
                frequency_penalty: params.frequency_penalty || 0,
                presence_penalty: params.presence_penalty || 0,
                context_length: params.context_length || 16384,
                repeat_penalty: params.repeat_penalty || 1.1
            })
        });
    }

    // ============ TTS/STT ============

    async textToSpeech(text, voice = 'default') {
        const result = await this.request('/tts', {
            method: 'POST',
            body: JSON.stringify({ text, voice })
        });

        // Convert base64 to audio blob
        const audioData = atob(result.audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
            uint8Array[i] = audioData.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: 'audio/mp3' });
    }

    async speechToText(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        const response = await fetch(`${API_BASE}/stt`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('STT request failed');
        return response.json();
    }

    // ============ HEALTH CHECK ============

    async checkHealth() {
        return this.request('/health');
    }
}

export const api = new ApiClient();
export default api;
