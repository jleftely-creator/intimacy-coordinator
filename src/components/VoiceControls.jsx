import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import api from '../utils/api';

const VoiceControls = ({ onTranscript, textToSpeak }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(new Audio());

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            audioRef.current.pause();
        };
    }, []);

    // Auto-speak when textToSpeak changes
    useEffect(() => {
        if (textToSpeak && !isMuted) {
            speakText(textToSpeak);
        }
    }, [textToSpeak]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Microphone access denied or unavailable');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudio = async (audioBlob) => {
        setLoading(true);
        try {
            const result = await api.speechToText(audioBlob);
            setTranscript(result.text || result.transcript || '');
            onTranscript?.(result.text || result.transcript || '');
        } catch (error) {
            console.error('STT failed:', error);
            setTranscript('[STT Error - Check service connection]');
        } finally {
            setLoading(false);
        }
    };

    const speakText = async (text) => {
        if (isMuted || !text) return;

        setLoading(true);
        try {
            const audioBlob = await api.textToSpeech(text);
            const audioUrl = URL.createObjectURL(audioBlob);

            audioRef.current.src = audioUrl;
            audioRef.current.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            setIsPlaying(true);
            await audioRef.current.play();
        } catch (error) {
            console.error('TTS failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const stopAudio = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
            {/* Record Button */}
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`
          p-3 rounded-full transition-all
          ${isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : isRecording ? (
                    <MicOff size={20} />
                ) : (
                    <Mic size={20} />
                )}
            </button>

            {/* Mute/Unmute TTS */}
            <button
                onClick={() => {
                    if (isPlaying) stopAudio();
                    setIsMuted(!isMuted);
                }}
                className={`
          p-3 rounded-full transition-all
          ${isMuted
                        ? 'bg-gray-800 text-gray-500'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
        `}
                title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Status/Transcript Display */}
            <div className="flex-1 text-sm text-gray-400 truncate">
                {loading && 'Processing...'}
                {isRecording && 'Recording...'}
                {isPlaying && 'Speaking...'}
                {!loading && !isRecording && !isPlaying && transcript && (
                    <span className="text-gray-300">"{transcript}"</span>
                )}
                {!loading && !isRecording && !isPlaying && !transcript && (
                    <span className="text-gray-500">Voice controls ready</span>
                )}
            </div>
        </div>
    );
};

export default VoiceControls;
