import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Calendar, Flame, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const intensityIcons = {
    casual: '😊',
    adventurous: '🔥',
    weird: '⚡',
    demon: '💀'
};

const ScenarioLibrary = ({ onLoad, onClose }) => {
    const [scenarios, setScenarios] = useState([]);
    const [viewing, setViewing] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('saved_scenarios');
        if (saved) {
            setScenarios(JSON.parse(saved));
        }
    }, []);

    const deleteScenario = (id) => {
        const updated = scenarios.filter(s => s.id !== id);
        setScenarios(updated);
        localStorage.setItem('saved_scenarios', JSON.stringify(updated));
        if (viewing?.id === id) setViewing(null);
    };

    const loadScenario = (scenario) => {
        onLoad?.(scenario);
        onClose?.();
    };

    if (scenarios.length === 0) {
        return (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 text-center">
                <p className="text-gray-500">No saved scenarios yet.</p>
                <p className="text-xs text-gray-600 mt-2">Generate a scene and save it to build your library.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Scenario List */}
            {scenarios.map((scenario) => (
                <div
                    key={scenario.id}
                    className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden"
                >
                    <div className="flex items-center p-3 sm:p-4 gap-3">
                        {/* Intensity Badge */}
                        <div className="text-2xl">{intensityIcons[scenario.intensity] || '🔥'}</div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-200 truncate text-sm sm:text-base">
                                {scenario.title || 'Untitled Scene'}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={12} />
                                <span>{new Date(scenario.timestamp).toLocaleDateString()}</span>
                                <span className="capitalize">• {scenario.intensity}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setViewing(viewing?.id === scenario.id ? null : scenario)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors touch-target"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                onClick={() => loadScenario(scenario)}
                                className="p-2 text-pink-400 hover:text-pink-300 hover:bg-pink-900/30 rounded-lg transition-colors touch-target"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => deleteScenario(scenario.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors touch-target"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Expandable Preview */}
                    <AnimatePresence>
                        {viewing?.id === scenario.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 border-t border-gray-800/50 bg-gray-950/50">
                                    <pre className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto scrollbar-hide">
                                        {scenario.content}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

// Helper to save a scenario
export const saveScenario = (content, intensity, title = '') => {
    const saved = localStorage.getItem('saved_scenarios');
    const scenarios = saved ? JSON.parse(saved) : [];

    const newScenario = {
        id: Date.now().toString(),
        title: title || `Scene ${scenarios.length + 1}`,
        content,
        intensity,
        timestamp: new Date().toISOString()
    };

    scenarios.unshift(newScenario);
    localStorage.setItem('saved_scenarios', JSON.stringify(scenarios.slice(0, 50))); // Max 50
    return newScenario;
};

export default ScenarioLibrary;
