import React, { useEffect, useState, useRef } from 'react';
import { generateScene } from '../utils/generator';
import { saveScenario } from './ScenarioLibrary';
import api from '../utils/api';
import { getAIParams } from './PromptEditor';
import { Loader2, Flame, Zap, Skull, Smile, Save, Check, Copy, Send, Volume2, VolumeX, Mic, MicOff, ArrowRight, Trash2 } from 'lucide-react';

const intensityIcons = {
    casual: Smile,
    adventurous: Flame,
    weird: Zap,
    demon: Skull
};

const intensityColors = {
    casual: 'text-blue-400',
    adventurous: 'text-orange-400',
    weird: 'text-purple-400',
    demon: 'text-red-500'
};

const CONTEXT_STORAGE_KEY = 'scene_chat_context';

const SceneDisplay = ({ data }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [sending, setSending] = useState(false);

    // TTS/STT toggles
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [sttEnabled, setSttEnabled] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Context summary for continuity
    const [contextSummary, setContextSummary] = useState(() => {
        const saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
        return saved || '';
    });

    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save context when it changes
    useEffect(() => {
        localStorage.setItem(CONTEXT_STORAGE_KEY, contextSummary);
    }, [contextSummary]);

    // Initial scene generation
    useEffect(() => {
        let mounted = true;

        const fetchScene = async () => {
            setLoading(true);
            setSaved(false);

            try {
                // Use pre-generated scene if provided
                if (data.generatedScene) {
                    if (mounted) {
                        setMessages([{ role: 'assistant', content: data.generatedScene }]);
                        setLoading(false);
                    }
                    return;
                }

                // Generate initial scene
                const text = await generateScene(data);
                if (mounted) {
                    setMessages([{ role: 'assistant', content: text }]);
                    setLoading(false);

                    // Auto-play TTS if enabled
                    if (ttsEnabled && text && !text.startsWith('Error:')) {
                        playTTS(text);
                    }
                }
            } catch (e) {
                if (mounted) {
                    setMessages([{ role: 'assistant', content: `Error: ${e.message}` }]);
                    setLoading(false);
                }
            }
        };

        fetchScene();
        return () => { mounted = false; };
    }, [data]);

    // Send a follow-up message
    const sendMessage = async (text) => {
        if (!text.trim() || sending) return;

        const userMessage = text.trim();
        setUserInput('');
        setSending(true);

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            const params = getAIParams();

            // Build prompt with context
            const historyText = messages.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            ).join('\n\n');

            const prompt = contextSummary
                ? `Previous context: ${contextSummary}\n\nConversation:\n${historyText}\n\nUser: ${userMessage}\n\nContinue the scene:`
                : `Conversation:\n${historyText}\n\nUser: ${userMessage}\n\nContinue the scene:`;

            const result = await api.generateWithAI(prompt, params);
            const response = result.text;

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);

            // Update context summary (simple truncation for now)
            if (messages.length > 4) {
                const summary = messages.slice(0, 2).map(m => m.content.slice(0, 200)).join(' ');
                setContextSummary(summary + '...');
            }

            // Auto-play TTS if enabled
            if (ttsEnabled && response) {
                playTTS(response);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
        } finally {
            setSending(false);
        }
    };

    // Continue scene automatically
    const continueScene = () => {
        sendMessage('Continue the scene with more detail and intensity.');
    };

    // TTS playback
    const playTTS = async (text) => {
        if (isPlaying) return;

        try {
            setIsPlaying(true);
            const audioBlob = await api.textToSpeech(text.slice(0, 500)); // Limit for TTS
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                audioRef.current.onended = () => setIsPlaying(false);
            }
        } catch (e) {
            console.error('TTS error:', e);
            setIsPlaying(false);
        }
    };

    // STT recording (simplified)
    const toggleRecording = async () => {
        if (!sttEnabled) return;

        if (isRecording) {
            setIsRecording(false);
            // Would stop recording and send to STT here
        } else {
            setIsRecording(true);
            // Would start recording here
            // For now, just show the state
        }
    };

    // Clear chat and context
    const clearChat = () => {
        setMessages([]);
        setContextSummary('');
        localStorage.removeItem(CONTEXT_STORAGE_KEY);
    };

    const handleSave = () => {
        const fullText = messages.map(m =>
            `${m.role === 'user' ? '> ' : ''}${m.content}`
        ).join('\n\n---\n\n');

        const timestamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const title = `${data.intensity.charAt(0).toUpperCase() + data.intensity.slice(1)} Chat - ${timestamp}`;

        saveScenario(fullText, data.intensity, title);
        setSaved(true);
    };

    const handleCopy = () => {
        const fullText = messages.map(m => m.content).join('\n\n---\n\n');
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const IntensityIcon = intensityIcons[data.intensity] || Flame;
    const intensityColor = intensityColors[data.intensity] || 'text-orange-400';

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
                        Scene Chat
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Interactive scene with AI</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* TTS Toggle */}
                    <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`p-2 rounded-lg transition-colors ${ttsEnabled ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title="Toggle Text-to-Speech"
                    >
                        {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    {/* STT Toggle */}
                    <button
                        onClick={() => setSttEnabled(!sttEnabled)}
                        className={`p-2 rounded-lg transition-colors ${sttEnabled ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        title="Toggle Speech-to-Text"
                    >
                        {sttEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>

                    {/* Intensity Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 ${intensityColor}`}>
                        <IntensityIcon size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{data.intensity || 'adventurous'}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-4 mb-4 space-y-4">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                        <Loader2 size={28} className="text-pink-500 animate-spin" />
                        <span className="text-gray-500 text-sm">Generating scene...</span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-pink-900/40 border border-pink-500/30 text-pink-100'
                                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-300'
                                    }`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {msg.role === 'assistant' && ttsEnabled && (
                                        <button
                                            onClick={() => playTTS(msg.content)}
                                            className="mt-2 text-xs text-gray-500 hover:text-pink-400 flex items-center gap-1"
                                            disabled={isPlaying}
                                        >
                                            <Volume2 size={12} />
                                            {isPlaying ? 'Playing...' : 'Play'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            {!loading && (
                <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={continueScene}
                            disabled={sending}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:bg-purple-800/50 transition-colors disabled:opacity-50"
                        >
                            <ArrowRight size={14} />
                            Continue Scene
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saved || messages.length === 0}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${saved
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50'
                                }`}
                        >
                            {saved ? <Check size={14} /> : <Save size={14} />}
                            {saved ? 'Saved!' : 'Save'}
                        </button>

                        <button
                            onClick={handleCopy}
                            disabled={messages.length === 0}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50'
                                }`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <button
                            onClick={clearChat}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 transition-colors"
                        >
                            <Trash2 size={14} />
                            Clear
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(userInput)}
                            placeholder="Direct the scene... (e.g., 'Now use the restraints')"
                            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:border-pink-500 focus:outline-none text-sm"
                            disabled={sending}
                        />

                        {sttEnabled && (
                            <button
                                onClick={toggleRecording}
                                className={`p-3 rounded-xl transition-colors ${isRecording
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Mic size={18} />
                            </button>
                        )}

                        <button
                            onClick={() => sendMessage(userInput)}
                            disabled={sending || !userInput.trim()}
                            className="px-4 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>

                    {/* Context indicator */}
                    {contextSummary && (
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Context maintained ({contextSummary.length} chars)
                        </div>
                    )}
                </div>
            )}

            {/* Hidden audio element for TTS */}
            <audio ref={audioRef} className="hidden" />
        </div>
    );
};

export default SceneDisplay;
