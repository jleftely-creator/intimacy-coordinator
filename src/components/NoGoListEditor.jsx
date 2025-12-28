import React, { useState, useEffect } from 'react';
import { Shield, X, Plus, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_NO_GO_LIST } from '../data/prompts';

const STORAGE_KEY = 'no_go_list';

const NoGoListEditor = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        setItems(saved ? JSON.parse(saved) : DEFAULT_NO_GO_LIST);
    }, []);

    const addItem = () => {
        if (!newItem.trim()) return;
        const item = newItem.trim().toLowerCase();
        if (!items.includes(item)) {
            const updated = [...items, item];
            setItems(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        setNewItem('');
    };

    const removeItem = (item) => {
        const updated = items.filter(i => i !== item);
        setItems(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const reset = () => {
        setItems(DEFAULT_NO_GO_LIST);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NO_GO_LIST));
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 rounded-lg transition-colors"
            >
                <Shield size={14} />
                <span>No-Go List</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-800/50 rounded-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-red-900/20">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-red-500" />
                        <h3 className="font-bold text-red-200">Hard Limits (No-Go List)</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-xs text-gray-500 mb-4">
                        Items here will NEVER appear in generated scenes. These are universal hard limits.
                    </p>

                    {/* Add new */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            placeholder="Add hard limit..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                        />
                        <button
                            onClick={addItem}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <span
                                key={item}
                                className="flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-700/50 text-red-300 text-xs rounded-lg"
                            >
                                {item}
                                <button onClick={() => removeItem(item)} className="hover:text-white">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between p-4 border-t border-gray-800">
                    <button
                        onClick={reset}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                    >
                        <RotateCcw size={12} />
                        Reset to defaults
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoGoListEditor;
