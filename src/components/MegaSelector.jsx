import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Check, Plus, X, Lock, Heart, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Selection states
const STATES = {
    NEUTRAL: 'neutral',
    WANTS: 'wants',   // Pink - AI should prioritize
    OKAY: 'okay',     // Gray check - AI may use
    NOT: 'not'        // Red X - AI should avoid
};

// Initialize all items in schema as 'wants' by default
const initializeAllAsWants = (schema) => {
    const states = {};
    const extractItems = (obj) => {
        if (obj.items) {
            obj.items.forEach(item => { states[item] = STATES.WANTS; });
        }
        if (obj.subcategories) {
            Object.values(obj.subcategories).forEach(sub => {
                const items = Array.isArray(sub) ? sub : (sub.items || []);
                items.forEach(item => { states[item] = STATES.WANTS; });
            });
        }
    };
    Object.values(schema).forEach(extractItems);
    return states;
};

const MegaSelector = ({
    title,
    schema,
    storageKey,
    onSelectionChange,
    demonMode = false,
    allowCustom = true,
    resetTrigger = 0
}) => {
    // Item states: { itemName: 'neutral'|'wants'|'okay'|'not' }
    const [itemStates, setItemStates] = useState(() => {
        const saved = localStorage.getItem(`${storageKey}_states`);
        if (saved) {
            const parsed = JSON.parse(saved);
            // If saved but empty, initialize all as wants
            if (Object.keys(parsed).length === 0) {
                return initializeAllAsWants(schema);
            }
            return parsed;
        }
        // No saved state - default all to wants
        return initializeAllAsWants(schema);
    });

    const [customItems, setCustomItems] = useState(() => {
        const saved = localStorage.getItem(`custom_${storageKey}`);
        return saved ? JSON.parse(saved) : {};
    });

    const [expandedCats, setExpandedCats] = useState({});
    const [addingTo, setAddingTo] = useState(null);
    const [newItemName, setNewItemName] = useState('');

    // Handle external reset
    useEffect(() => {
        if (resetTrigger > 0) {
            setItemStates({});
            setCustomItems({});
        }
    }, [resetTrigger]);

    // Persist states
    useEffect(() => {
        localStorage.setItem(`${storageKey}_states`, JSON.stringify(itemStates));

        // Convert to categorized output for parent
        const output = {
            wants: [],
            okay: [],
            not: []
        };
        Object.entries(itemStates).forEach(([item, state]) => {
            if (output[state]) output[state].push(item);
        });
        onSelectionChange?.(output);
    }, [itemStates, storageKey, onSelectionChange]);

    // Persist custom items
    useEffect(() => {
        localStorage.setItem(`custom_${storageKey}`, JSON.stringify(customItems));
    }, [customItems, storageKey]);

    // Force sync on mount
    useEffect(() => {
        const output = {
            wants: [],
            okay: [],
            not: []
        };
        Object.entries(itemStates).forEach(([item, state]) => {
            if (output[state]) output[state].push(item);
        });
        onSelectionChange?.(output);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cycleState = useCallback((item) => {
        setItemStates(prev => {
            const current = prev[item] || STATES.NEUTRAL;
            let next;

            if (demonMode) {
                // Demon mode: neutral → wants → okay → neutral (no "not")
                const demonCycle = [STATES.NEUTRAL, STATES.WANTS, STATES.OKAY];
                const idx = demonCycle.indexOf(current);
                next = demonCycle[(idx + 1) % demonCycle.length];
            } else {
                // Normal: neutral → wants → okay → not → neutral
                const normalCycle = [STATES.NEUTRAL, STATES.WANTS, STATES.OKAY, STATES.NOT];
                const idx = normalCycle.indexOf(current);
                next = normalCycle[(idx + 1) % normalCycle.length];
            }

            if (next === STATES.NEUTRAL) {
                const { [item]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [item]: next };
        });
    }, [demonMode]);

    const handleReset = () => {
        if (!window.confirm('Clear all selections? This will reset everything to neutral.')) return;

        // Setting to empty object defaults to neutral in cycleState logic
        const newStates = {};
        setItemStates(newStates);

        // Also clear custom items
        setCustomItems({});
    };

    const toggleCategory = (catKey) => {
        setExpandedCats(prev => ({ ...prev, [catKey]: !prev[catKey] }));
    };

    const addCustomItem = (targetCategory) => {
        if (!newItemName.trim()) return;
        const item = newItemName.trim().toLowerCase();

        setCustomItems(prev => ({
            ...prev,
            [targetCategory]: [...(prev[targetCategory] || []), item]
        }));

        // Auto-set to "wants"
        setItemStates(prev => ({ ...prev, [item]: STATES.WANTS }));
        setNewItemName('');
        setAddingTo(null);
    };

    const removeCustomItem = (item, category) => {
        setCustomItems(prev => ({
            ...prev,
            [category]: (prev[category] || []).filter(i => i !== item)
        }));
        setItemStates(prev => {
            const { [item]: _, ...rest } = prev;
            return rest;
        });
    };

    const getStateCount = (category) => {
        const getAllItems = (cat) => {
            if (cat.subcategories) {
                return Object.values(cat.subcategories).flatMap(sub =>
                    Array.isArray(sub) ? sub : sub.items || []
                );
            }
            return cat.items || [];
        };

        const items = getAllItems(category);
        return items.filter(i => itemStates[i] === STATES.WANTS || itemStates[i] === STATES.OKAY).length;
    };

    const renderItem = (item, catKey, isCustom = false) => {
        const state = itemStates[item] || STATES.NEUTRAL;

        const stateStyles = {
            [STATES.NEUTRAL]: 'bg-gray-800/50 border-gray-700/50 text-gray-400',
            [STATES.WANTS]: 'bg-pink-900/40 border-pink-500/60 text-pink-200 shadow-[0_0_8px_rgba(236,72,153,0.2)]',
            [STATES.OKAY]: 'bg-gray-700/50 border-gray-500/60 text-gray-200',
            [STATES.NOT]: 'bg-red-900/30 border-red-600/50 text-red-300 opacity-60'
        };

        const stateIcons = {
            [STATES.WANTS]: <Heart size={10} fill="currentColor" className="text-pink-400" />,
            [STATES.OKAY]: <Check size={10} className="text-gray-400" />,
            [STATES.NOT]: <Ban size={10} className="text-red-400" />
        };

        return (
            <button
                key={item}
                onClick={() => cycleState(item)}
                className={`
          px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 
          transition-all duration-200 text-xs min-h-[36px]
          ${stateStyles[state]}
        `}
            >
                {stateIcons[state] && <span className="flex-shrink-0">{stateIcons[state]}</span>}
                <span className="truncate capitalize flex-1">{item}</span>
                {isCustom && (
                    <button
                        onClick={(e) => { e.stopPropagation(); removeCustomItem(item, catKey); }}
                        className="text-gray-500 hover:text-red-400 flex-shrink-0"
                    >
                        <X size={10} />
                    </button>
                )}
            </button>
        );
    };

    const renderItems = (items, catKey, customKey = null) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
            {items.map(item => renderItem(item, catKey))}
            {/* Render custom items for this subcategory */}
            {customKey && (customItems[customKey] || []).map(item =>
                renderItem(item, customKey, true)
            )}
        </div>
    );

    const totalActive = Object.values(itemStates).filter(s => s === STATES.WANTS || s === STATES.OKAY).length;

    return (
        <div className="w-full mb-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700/50">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent truncate">
                        {title}
                    </span>
                    <span className="text-xs text-gray-500">
                        {totalActive} active
                    </span>
                </div>
                <button
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* State Legend */}
            <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
                <span className="flex items-center gap-1 text-pink-300"><Heart size={8} fill="currentColor" /> Wants</span>
                <span className="flex items-center gap-1 text-gray-400"><Check size={8} /> Okay</span>
                {!demonMode && <span className="flex items-center gap-1 text-red-400"><Ban size={8} /> Avoid</span>}
            </div>

            {/* Categories */}
            <div className="space-y-2">
                {Object.entries(schema).map(([catKey, category]) => {
                    const isExpanded = expandedCats[catKey];
                    const count = getStateCount(category);

                    return (
                        <div
                            key={catKey}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 overflow-hidden"
                        >
                            {/* Category Header */}
                            <div
                                onClick={() => toggleCategory(catKey)}
                                className="flex items-center cursor-pointer p-3 text-gray-300 font-medium hover:bg-gray-800/30 transition-colors select-none"
                            >
                                <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight size={14} className="text-pink-500" />
                                </motion.div>
                                <span className="ml-2 capitalize text-sm truncate flex-1">{catKey}</span>

                                {/* Add button for category */}
                                {allowCustom && isExpanded && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === catKey ? null : catKey); }}
                                        className="p-1 rounded bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 mr-2"
                                    >
                                        <Plus size={12} />
                                    </button>
                                )}

                                <span className={`text-xs px-2 py-0.5 rounded-full ${count > 0
                                    ? 'bg-pink-900/50 text-pink-300 border border-pink-500/30'
                                    : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {count}
                                </span>
                            </div>

                            {/* Expandable Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3">
                                            {/* Add input */}
                                            {addingTo === catKey && (
                                                <div className="flex gap-1.5 mb-2 p-2 bg-gray-800/50 rounded-lg">
                                                    <input
                                                        type="text"
                                                        value={newItemName}
                                                        onChange={(e) => setNewItemName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addCustomItem(catKey)}
                                                        placeholder="Add item..."
                                                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:border-pink-500 focus:outline-none min-w-0"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => addCustomItem(catKey)}
                                                        className="px-2 py-1 bg-pink-600 text-white rounded text-xs"
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        onClick={() => { setAddingTo(null); setNewItemName(''); }}
                                                        className="p-1 text-gray-400"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {category.subcategories ? (
                                                Object.entries(category.subcategories).map(([subKey, subData]) => {
                                                    const items = Array.isArray(subData) ? subData : subData.items || [];
                                                    const customKey = `${catKey}_${subKey}`;
                                                    return (
                                                        <div key={subKey} className="mb-3 last:mb-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                                                    {subKey}
                                                                </h4>
                                                                <button
                                                                    onClick={() => setAddingTo(addingTo === customKey ? null : customKey)}
                                                                    className="p-0.5 rounded text-gray-500 hover:text-pink-400"
                                                                >
                                                                    <Plus size={10} />
                                                                </button>
                                                            </div>

                                                            {addingTo === customKey && (
                                                                <div className="flex gap-1 mb-2">
                                                                    <input
                                                                        type="text"
                                                                        value={newItemName}
                                                                        onChange={(e) => setNewItemName(e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && addCustomItem(customKey)}
                                                                        placeholder="Add..."
                                                                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:border-pink-500 focus:outline-none min-w-0"
                                                                        autoFocus
                                                                    />
                                                                    <button onClick={() => addCustomItem(customKey)} className="px-2 bg-pink-600 text-white rounded text-xs">+</button>
                                                                </div>
                                                            )}

                                                            {renderItems(items, catKey, customKey)}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                renderItems(category.items || [], catKey, catKey)
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MegaSelector;
