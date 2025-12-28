import React, { useState } from 'react';
import { Save, Download, Upload, Check, X } from 'lucide-react';

const SettingsManager = ({ getAllState }) => {
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const saveAll = () => {
        try {
            const state = getAllState?.() || {};
            localStorage.setItem('app_full_state', JSON.stringify({
                ...state,
                savedAt: new Date().toISOString()
            }));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            setError('Save failed');
            setTimeout(() => setError(''), 2000);
        }
    };

    const exportSettings = () => {
        try {
            const data = {
                inventory: localStorage.getItem('user_inventory_v2'),
                outfit: localStorage.getItem('user_outfit_v2'),
                kinks: localStorage.getItem('user_kinks_v2'),
                setting: localStorage.getItem('user_setting_v2'),
                intensity: localStorage.getItem('user_intensity'),
                custom_inventory: localStorage.getItem('custom_user_inventory_v2'),
                custom_outfit: localStorage.getItem('custom_user_outfit_v2'),
                custom_kinks: localStorage.getItem('custom_user_kinks_v2'),
                saved_scenarios: localStorage.getItem('saved_scenarios'),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scene-architect-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError('Export failed');
            setTimeout(() => setError(''), 2000);
        }
    };

    const importSettings = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== 'exportedAt' && value) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });
                setSaved(true);
                setTimeout(() => window.location.reload(), 1000);
            } catch (e) {
                setError('Invalid file');
                setTimeout(() => setError(''), 2000);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50 mb-4">
            <button
                onClick={saveAll}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all touch-target ${saved
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
            >
                {saved ? <Check size={16} /> : <Save size={16} />}
                <span className="hidden sm:inline">{saved ? 'Saved!' : 'Save All'}</span>
            </button>

            <button
                onClick={exportSettings}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all touch-target"
            >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
            </button>

            <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all cursor-pointer touch-target">
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
                <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                />
            </label>

            {error && (
                <span className="text-red-400 text-sm flex items-center gap-1">
                    <X size={14} /> {error}
                </span>
            )}
        </div>
    );
};

export default SettingsManager;
