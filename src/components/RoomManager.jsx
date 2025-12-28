import React, { useState } from 'react';
import { Users, Copy, Check, Loader2, Wifi, WifiOff, Heart } from 'lucide-react';
import api from '../utils/api';

const RoomManager = ({ onRoomJoined, onRoomLeft, onTogetherMode }) => {
    const [mode, setMode] = useState(null); // null | 'create' | 'join' | 'together'
    const [roomCode, setRoomCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [partnersConnected, setPartnersConnected] = useState(0);

    const createRoom = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await api.createRoom();
            setRoomCode(result.room_code);
            setMode('create');
            onRoomJoined?.(result.room_code, 'host');
            pollRoomStatus(result.room_code);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async () => {
        if (!inputCode.trim()) {
            setError('Enter a room code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await api.joinRoom(inputCode.trim().toUpperCase());
            setRoomCode(result.room_code);
            setMode('join');
            onRoomJoined?.(result.room_code, 'partner');
        } catch (e) {
            setError(e.message || 'Room not found');
        } finally {
            setLoading(false);
        }
    };

    const startTogetherMode = () => {
        setMode('together');
        onTogetherMode?.();
    };

    const leaveRoom = async () => {
        try {
            await api.closeRoom();
        } catch (e) { }
        setRoomCode('');
        setMode(null);
        setPartnersConnected(0);
        onRoomLeft?.();
    };

    const pollRoomStatus = async (code) => {
        const checkStatus = async () => {
            try {
                const status = await api.getRoomStatus();
                setPartnersConnected(status.partners_connected);
            } catch (e) { }
        };

        const interval = setInterval(checkStatus, 3000);
        checkStatus();
        setTimeout(() => clearInterval(interval), 600000);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Not in a room - show options
    if (!roomCode && mode !== 'together') {
        return (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-pink-500" />
                    <h3 className="text-sm font-bold text-gray-100">Partner Sync</h3>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                    Connect with partner or use Together Mode on one device.
                </p>

                {/* Mobile-friendly stacked layout */}
                <div className="space-y-2">
                    {/* Together Mode - Heart Button */}
                    <button
                        onClick={startTogetherMode}
                        className="w-full p-3 rounded-lg bg-gradient-to-r from-pink-600/30 to-red-600/30 border border-pink-500/40 text-pink-200 hover:from-pink-600/40 hover:to-red-600/40 transition-all flex items-center justify-center gap-2"
                    >
                        <Heart size={18} fill="currentColor" />
                        <span className="text-sm font-medium">Together Mode</span>
                    </button>

                    {/* Remote options */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={createRoom}
                            disabled={loading}
                            className="p-3 rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-300 hover:bg-pink-600/30 transition-all text-center text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Create Room'}
                        </button>

                        <div className="flex gap-1">
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="CODE"
                                maxLength={4}
                                className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 text-center font-mono text-sm tracking-widest focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={joinRoom}
                                disabled={loading}
                                className="px-3 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all text-sm whitespace-nowrap"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-red-400 text-xs mt-2">{error}</p>
                )}
            </div>
        );
    }

    // Together Mode active
    if (mode === 'together') {
        return (
            <div className="bg-gradient-to-r from-pink-900/30 to-red-900/30 backdrop-blur-sm rounded-xl border border-pink-500/40 p-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart size={16} className="text-pink-400" fill="currentColor" />
                        <span className="text-sm font-medium text-pink-200">Together Mode</span>
                    </div>
                    <button
                        onClick={leaveRoom}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    // In a remote room - show status
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-pink-500/30 p-3 mb-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {partnersConnected > 1 ? (
                        <Wifi size={16} className="text-green-400 flex-shrink-0" />
                    ) : (
                        <WifiOff size={16} className="text-yellow-400 animate-pulse flex-shrink-0" />
                    )}

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg tracking-widest text-pink-400">{roomCode}</span>
                            <button onClick={copyCode} className="text-gray-500 hover:text-white transition-colors">
                                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <span className="text-xs text-gray-500">
                            {partnersConnected > 1 ? `${partnersConnected} connected` : 'Waiting...'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={leaveRoom}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap"
                >
                    Leave
                </button>
            </div>
        </div>
    );
};

export default RoomManager;
