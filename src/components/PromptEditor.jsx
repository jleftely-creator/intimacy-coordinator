import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, RotateCcw, Eye, EyeOff, Sliders } from 'lucide-react';
import { SCENE_PROMPT_TEMPLATE, TONE_MODIFIERS } from '../data/prompts';

const STORAGE_KEY = 'custom_prompt_template';
const PARAMS_STORAGE_KEY = 'ai_model_params';

const PLACEHOLDERS = [
    { key: '{partnerA_wants}', desc: 'Partner A strongly wants' },
    { key: '{partnerA_okay}', desc: 'Partner A is okay with' },
    { key: '{partnerA_not}', desc: 'Partner A avoids' },
    { key: '{partnerB_wants}', desc: 'Partner B strongly wants' },
    { key: '{partnerB_okay}', desc: 'Partner B is okay with' },
    { key: '{partnerB_not}', desc: 'Partner B avoids' },
    { key: '{toys}', desc: 'All available toys' },
    { key: '{setting}', desc: 'Setting/furniture' },
    { key: '{wardrobe}', desc: 'Wardrobe items' },
    { key: '{intensity}', desc: 'Intensity level' },
    { key: '{toneModifier}', desc: 'Intensity tone instruction' }
];

const DEFAULT_PARAMS = {
    temperature: 1.1,
    max_tokens: 4096,
    top_k: 80,
    top_p: 0.95,
    min_p: 0.05,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    context_length: 16384,
    repeat_penalty: 1.1
};

const TEMPLATES_KEY = 'prompt_templates';

const PromptEditor = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [template, setTemplate] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [showParams, setShowParams] = useState(false);
    const [params, setParams] = useState(DEFAULT_PARAMS);

    // Template Library State
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isNaming, setIsNaming] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        setTemplate(saved || getDefaultTemplate());

        const savedParams = localStorage.getItem(PARAMS_STORAGE_KEY);
        if (savedParams) {
            setParams(JSON.parse(savedParams));
        }

        // Load templates library
        const library = localStorage.getItem(TEMPLATES_KEY);
        if (library) {
            setSavedTemplates(JSON.parse(library));
        }
    }, []);

    const getDefaultTemplate = () => {
        return `You are an intimacy coordinator creating a unique, tailored scene.

PARTNER A PREFERENCES:
- Strongly wants: {partnerA_wants}
- Is okay with: {partnerA_okay}
- Avoids: {partnerA_not}

PARTNER B PREFERENCES:
- Strongly wants: {partnerB_wants}
- Is okay with: {partnerB_okay}
- Avoids: {partnerB_not}

AVAILABLE ITEMS:
- Toys: {toys}
- Setting: {setting}
- Wardrobe: {wardrobe}

INTENSITY: {intensity}

INSTRUCTIONS:
1. Prioritize items marked as "wants" by BOTH partners
2. You MAY include "okay" items creatively if they enhance the scene
3. AVOID items marked as "avoids" (unless in Demon mode)
4. Be creative - you are NOT limited to selected items only
5. Create something unique and sometimes challenging

Generate a scene with:
 Opening narrative, COSTUMES and SETTING
- Step-by-step progression THROGH 4-8 STATIONS OR SCENES OF KINKS. TOYS. ACTS. SUBMISSIVE ACTIONS 
 - Peak moment THE HIGHEST INTENSITY AND ROUGHTEST ACTIONS
 - HUMILIATION AND CLEANUP

{toneModifier}`;
    };

    const handleParamChange = (key, value) => {
        setParams(prev => ({ ...prev, [key]: parseFloat(value) }));
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, template);
        localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(params));
        onSave?.(template, params);
        setIsOpen(false);
    };

    const handleSaveAsNew = () => {
        if (!newTemplateName) return;

        const newTemplate = {
            id: Date.now().toString(),
            name: newTemplateName,
            content: template,
            params: params
        };

        const updated = [...savedTemplates, newTemplate];
        setSavedTemplates(updated);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));

        // Select it
        setSelectedTemplateId(newTemplate.id);
        setIsNaming(false);
        setNewTemplateName('');
    };

    const handleLoadTemplate = (id) => {
        const temp = savedTemplates.find(t => t.id === id);
        if (temp) {
            setTemplate(temp.content);
            if (temp.params) setParams(temp.params);
            setSelectedTemplateId(id);
        } else {
            setSelectedTemplateId('');
        }
    };

    const handleDeleteTemplate = (e, id) => {
        e.stopPropagation();
        const updated = savedTemplates.filter(t => t.id !== id);
        setSavedTemplates(updated);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
        if (selectedTemplateId === id) setSelectedTemplateId('');
    };

    const handleReset = () => {
        const def = getDefaultTemplate();
        setTemplate(def);
        setParams(DEFAULT_PARAMS);
        localStorage.setItem(STORAGE_KEY, def);
        localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(DEFAULT_PARAMS));
        setSelectedTemplateId('');
    };

    const insertPlaceholder = (key) => {
        setTemplate(prev => prev + key);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors"
            >
                <Edit3 size={14} />
                <span>Edit Prompt</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-100">Prompt Editor</h3>

                        {/* Template Selector */}
                        <div className="relative group">
                            <select
                                value={selectedTemplateId}
                                onChange={(e) => handleLoadTemplate(e.target.value)}
                                className="bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded px-2 py-1 pr-8 appearance-none focus:outline-none focus:border-pink-500 w-40"
                            >
                                <option value="">Custom / Default</option>
                                {savedTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {selectedTemplateId && (
                                <button
                                    onClick={(e) => handleDeleteTemplate(e, selectedTemplateId)}
                                    className="absolute right-6 top-1.5 text-red-400 hover:text-red-300"
                                    title="Delete Template"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowParams(!showParams)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${showParams ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <Sliders size={12} />
                            AI Params
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* AI Model Parameters Panel */}
                {showParams && (
                    <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                        <div className="text-xs text-gray-400 mb-3 font-semibold">AI Model Parameters</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Temperature */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Temperature</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="0.05"
                                    value={params.temperature}
                                    onChange={(e) => handleParamChange('temperature', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.temperature.toFixed(2)}</div>
                            </div>

                            {/* Max Tokens */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Max Tokens</label>
                                <input
                                    type="number"
                                    min="256"
                                    max="32768"
                                    step="256"
                                    value={params.max_tokens}
                                    onChange={(e) => handleParamChange('max_tokens', e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 font-mono"
                                />
                            </div>

                            {/* Top K */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Top K</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    step="1"
                                    value={params.top_k}
                                    onChange={(e) => handleParamChange('top_k', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.top_k}</div>
                            </div>

                            {/* Top P */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Top P</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={params.top_p}
                                    onChange={(e) => handleParamChange('top_p', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.top_p.toFixed(2)}</div>
                            </div>

                            {/* Min P */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Min P</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={params.min_p}
                                    onChange={(e) => handleParamChange('min_p', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.min_p.toFixed(2)}</div>
                            </div>

                            {/* Frequency Penalty */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Freq Penalty</label>
                                <input
                                    type="range"
                                    min="-2"
                                    max="2"
                                    step="0.1"
                                    value={params.frequency_penalty}
                                    onChange={(e) => handleParamChange('frequency_penalty', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.frequency_penalty.toFixed(1)}</div>
                            </div>

                            {/* Presence Penalty */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Pres Penalty</label>
                                <input
                                    type="range"
                                    min="-2"
                                    max="2"
                                    step="0.1"
                                    value={params.presence_penalty}
                                    onChange={(e) => handleParamChange('presence_penalty', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.presence_penalty.toFixed(1)}</div>
                            </div>

                            {/* Context Length */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Context Length</label>
                                <select
                                    value={params.context_length}
                                    onChange={(e) => handleParamChange('context_length', e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200 font-mono"
                                >
                                    <option value="2048">2K</option>
                                    <option value="4096">4K</option>
                                    <option value="8192">8K</option>
                                    <option value="16384">16K</option>
                                    <option value="32768">32K</option>
                                    <option value="65536">64K</option>
                                    <option value="131072">128K</option>
                                </select>
                            </div>

                            {/* Repeat Penalty */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-wide">Repeat Penalty</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.05"
                                    value={params.repeat_penalty}
                                    onChange={(e) => handleParamChange('repeat_penalty', e.target.value)}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                                <div className="text-xs text-pink-400 font-mono text-center">{params.repeat_penalty?.toFixed(2) || '1.10'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholders */}
                <div className="p-3 border-b border-gray-800 bg-gray-800/50">
                    <div className="text-xs text-gray-500 mb-2">Click to insert:</div>
                    <div className="flex flex-wrap gap-1">
                        {PLACEHOLDERS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => insertPlaceholder(p.key)}
                                title={p.desc}
                                className="text-[10px] px-2 py-1 bg-gray-700 hover:bg-pink-600/50 text-gray-300 rounded transition-colors"
                            >
                                {p.key}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden p-4">
                    <textarea
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="w-full h-full min-h-[300px] bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 focus:border-pink-500 focus:outline-none resize-none"
                        placeholder="Enter your prompt template..."
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-800 gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>

                    <div className="flex gap-2">
                        {isNaming ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Template Name..."
                                    value={newTemplateName}
                                    onChange={e => setNewTemplateName(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-pink-500"
                                />
                                <button
                                    onClick={handleSaveAsNew}
                                    disabled={!newTemplateName}
                                    className="p-2 bg-green-600 hover:bg-green-500 text-white rounded"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={() => setIsNaming(false)}
                                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsNaming(true)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-lg hover:bg-gray-800"
                            >
                                Save As...
                            </button>
                        )}

                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Save size={14} />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to get current template
export const getPromptTemplate = () => {
    return localStorage.getItem(STORAGE_KEY) || null;
};

// Helper to get current AI params
export const getAIParams = () => {
    const saved = localStorage.getItem(PARAMS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PARAMS;
};

export default PromptEditor;

