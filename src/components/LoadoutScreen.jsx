import React, { useState, useEffect, useCallback } from 'react';
import { INVENTORY_SCHEMA, OUTFIT_SCHEMA, KINK_SCHEMA, SETTING_SCHEMA } from '../data/schema';
import MegaSelector from './MegaSelector';
import IntensitySelector from './IntensitySelector';
import RoomManager from './RoomManager';
import TogetherMode from './TogetherMode';
import SettingsManager from './SettingsManager';
import PromptEditor from './PromptEditor';
import NoGoListEditor from './NoGoListEditor';
import { Sparkles, Wifi, BookOpen } from 'lucide-react';
import api from '../utils/api';

const ROLES = ['dom', 'sub', 'switch', 'voyeur'];

const LoadoutScreen = ({ onGenerate, onShowLibrary }) => {
    // Selection data from MegaSelectors { wants: [], okay: [], not: [] }
    const [inventory, setInventory] = useState({ wants: [], okay: [], not: [] });
    const [outfit, setOutfit] = useState({ wants: [], okay: [], not: [] });
    const [kinks, setKinks] = useState({ wants: [], okay: [], not: [] });
    const [setting, setSetting] = useState({ wants: [], okay: [], not: [] });

    const [role, setRole] = useState(() => localStorage.getItem('user_role') || 'switch');
    const [intensity, setIntensity] = useState(() => localStorage.getItem('user_intensity') || 'adventurous');

    // Room/Together state
    const [roomCode, setRoomCode] = useState(null);
    const [roomRole, setRoomRole] = useState(null);
    const [togetherMode, setTogetherMode] = useState(false);
    const [togetherPhase, setTogetherPhase] = useState('partner_a');
    const [togetherData, setTogetherData] = useState(null);
    const [syncing, setSyncing] = useState(false);

    // Persist
    useEffect(() => {
        localStorage.setItem('user_intensity', intensity);
    }, [intensity]);

    useEffect(() => {
        localStorage.setItem('user_role', role);
    }, [role]);

    // Sync to room
    const syncToRoom = useCallback(async () => {
        if (!roomCode) return;
        setSyncing(true);
        try {
            await api.syncSelection({
                role,
                intensity,
                inventory,
                outfit,
                kinks
            });
        } catch (e) {
            console.error('Sync failed:', e);
        } finally {
            setSyncing(false);
        }
    }, [roomCode, role, intensity, inventory, outfit, kinks]);

    useEffect(() => {
        if (!roomCode) return;
        const timeout = setTimeout(syncToRoom, 1000);
        return () => clearTimeout(timeout);
    }, [inventory, outfit, kinks, intensity, role, syncToRoom]);

    // Calculate totals
    const totalActive =
        inventory.wants.length + inventory.okay.length +
        outfit.wants.length + outfit.okay.length +
        kinks.wants.length + kinks.okay.length +
        setting.wants.length + setting.okay.length;

    const isDemonMode = intensity === 'demon';

    // Get current selections for Together Mode
    const getSelections = () => ({
        role,
        intensity,
        inventory,
        outfit,
        kinks,
        setting
    });

    const handleGenerate = async () => {
        let payload;

        if (togetherMode && togetherData) {
            // Merge both partners' data
            payload = {
                partnerA: togetherData.partnerA,
                partnerB: togetherData.partnerB,
                intensity,
                merged: true
            };
        } else {
            payload = {
                role,
                inventory,
                outfit,
                kinks,
                setting,
                intensity,
                solo: true
            };
        }

        // Try backend first
        if (roomCode) {
            try {
                const result = await api.generateScene();
                onGenerate?.({
                    ...payload,
                    generatedScene: result.scene,
                    merged: result.merged_data
                });
                return;
            } catch (e) {
                console.error('Backend generation failed:', e);
            }
        }

        onGenerate?.(payload);
    };

    const handleRoomJoined = (code, role) => {
        setRoomCode(code);
        setRoomRole(role);
        setTogetherMode(false);
    };

    const handleRoomLeft = () => {
        setRoomCode(null);
        setRoomRole(null);
    };

    const handleTogetherMode = () => {
        setTogetherMode(true);
        setRoomCode(null);
    };

    const handleTogetherDataReady = (data) => {
        setTogetherData(data);
    };

    const getAllState = () => ({
        role, intensity, inventory, outfit, kinks, setting
    });

    return (
        <div className="w-full pb-24">
            {/* Settings Row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <SettingsManager getAllState={getAllState} />
                <PromptEditor />
                <NoGoListEditor />
            </div>

            {/* Room Manager */}
            <RoomManager
                onRoomJoined={handleRoomJoined}
                onRoomLeft={handleRoomLeft}
                onTogetherMode={handleTogetherMode}
            />

            {/* Together Mode UI */}
            <TogetherMode
                active={togetherMode}
                onPhaseChange={setTogetherPhase}
                onDataReady={handleTogetherDataReady}
                getSelections={getSelections}
                onClearSelections={() => {
                    setInventory({ wants: [], okay: [], not: [] });
                    setOutfit({ wants: [], okay: [], not: [] });
                    setKinks({ wants: [], okay: [], not: [] });
                    setSetting({ wants: [], okay: [], not: [] });
                }}
            />

            {/* Intensity Selector */}
            <IntensitySelector value={intensity} onChange={setIntensity} />

            {/* Role Selector - hidden in Together Mode */}
            {!togetherMode && (
                <div className="mb-4">
                    <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Your Role
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {ROLES.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`
                  p-2 rounded-lg border text-center font-medium uppercase text-xs transition-all
                  ${role === r
                                        ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                                        : 'border-gray-800/50 bg-gray-900/30 text-gray-500 hover:border-gray-600'}
                `}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selectors */}
            <MegaSelector
                title="Toy Box"
                schema={INVENTORY_SCHEMA}
                storageKey="user_inventory_v2"
                onSelectionChange={setInventory}
                demonMode={isDemonMode}
            />

            <MegaSelector
                title="Wardrobe"
                schema={OUTFIT_SCHEMA}
                storageKey="user_outfit_v2"
                onSelectionChange={setOutfit}
                demonMode={isDemonMode}
            />

            <MegaSelector
                title="Setting & Furniture"
                schema={SETTING_SCHEMA}
                storageKey="user_setting_v2"
                onSelectionChange={setSetting}
                demonMode={isDemonMode}
            />

            <MegaSelector
                title="Kinks & Limits"
                schema={KINK_SCHEMA}
                storageKey="user_kinks_v2"
                onSelectionChange={setKinks}
                demonMode={isDemonMode}
            />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center gap-2 px-4">
                <button
                    onClick={onShowLibrary}
                    className="p-3 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 shadow-xl transition-all"
                    title="Saved Scenarios"
                >
                    <BookOpen size={18} />
                </button>

                <button
                    onClick={handleGenerate}
                    disabled={totalActive === 0 && !togetherData}
                    className={`
            flex items-center gap-2 font-bold py-3 px-6 rounded-full shadow-2xl border-2 transition-all text-sm
            ${(totalActive > 0 || togetherData)
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-pink-400/50 hover:scale-105 shadow-pink-900/50'
                            : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                        }
          `}
                >
                    {syncing && <Wifi size={14} className="animate-pulse" />}
                    <Sparkles size={16} />
                    <span>{togetherMode ? 'Generate Together' : 'Generate'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${totalActive > 0 ? 'bg-white/20' : 'bg-gray-700'}`}>
                        {totalActive}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default LoadoutScreen;
