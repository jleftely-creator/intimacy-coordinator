import { useState, useEffect } from 'react';
import { RefreshCw, Download, FileText, Check, Database, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const ModelSelector = ({ selectedModel, onModelSelect }) => {
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'gguf'
    const [models, setModels] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modelNameInput, setModelNameInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [polling, setPolling] = useState(false);
    const [manualStep, setManualStep] = useState(false);

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    // Polling effect to detect when a model is imported manually
    useEffect(() => {
        let interval;
        if (polling && modelNameInput) {
            interval = setInterval(async () => {
                try {
                    const res = await api.getOllamaTags();
                    if (res.models && res.models.includes(modelNameInput)) {
                        setPolling(false);
                        setManualStep(false);
                        setStatusMsg(`Detected ${modelNameInput}! Selection updated.`);
                        setActiveTab('active');
                        onModelSelect(modelNameInput);
                        setModelNameInput('');
                        setSelectedFile(null);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [polling, modelNameInput, onModelSelect]);

    const refreshData = async () => {
        setLoading(true);
        setStatusMsg('');
        try {
            if (activeTab === 'active') {
                const res = await api.getOllamaTags();
                setModels(res.models || []);
            } else {
                const res = await api.getModelFiles();
                setFiles(res.files || []);
            }
        } catch (e) {
            console.error(e);
            setStatusMsg('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadModel = async () => {
        if (!selectedFile || !modelNameInput) return;

        setLoading(true);
        setManualStep(false);
        setStatusMsg('Attempting instant import...');

        try {
            const res = await api.loadModel(selectedFile, modelNameInput);
            if (res.status === 'success') {
                setStatusMsg(`Successfully loaded ${modelNameInput}!`);
                setActiveTab('active');
                onModelSelect(modelNameInput);
                setModelNameInput('');
                setSelectedFile(null);
            }
        } catch (e) {
            console.log("API Import blocked (Docker barrier). Switching to Synchronized Import mode.");
            setManualStep(true);
            setPolling(true);
            setStatusMsg('API Load blocked by Docker. Please use the command below - I will detect when it finishes!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${activeTab === 'active' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        Active Models
                    </button>
                    <button
                        onClick={() => setActiveTab('gguf')}
                        className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${activeTab === 'gguf' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                        Import GGUF
                    </button>
                </div>
                <button
                    onClick={refreshData}
                    disabled={loading}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* ERROR / STATUS MSG */}
            {statusMsg && (
                <div className={`text-xs mb-3 p-2 rounded ${statusMsg.includes('Error') || statusMsg.includes('Failed') ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
                    {statusMsg}
                </div>
            )}

            {/* ACTIVE MODELS TAB */}
            {activeTab === 'active' && (
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Select Running AI Model</div>
                    {models.length === 0 && !loading && (
                        <div className="text-xs text-gray-500 italic">No models found. Switch to Import tab to load one.</div>
                    )}
                    <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                        {models.map(m => (
                            <button
                                key={m}
                                onClick={() => onModelSelect(m)}
                                className={`flex items-center justify-between px-3 py-2 rounded text-left text-sm transition-colors ${selectedModel === m ? 'bg-pink-900/40 border border-pink-500/50 text-pink-300' : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'}`}
                            >
                                <span className="truncate">{m}</span>
                                {selectedModel === m && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* IMPORT GGUF TAB */}
            {activeTab === 'gguf' && (
                <div className="space-y-3">
                    <div className="text-xs text-gray-400">
                        Select a .gguf file from <span className="font-mono bg-gray-800 px-1 rounded">F:\TITAN_MODELS</span>
                    </div>

                    <div className="bg-gray-950 rounded border border-gray-800 max-h-40 overflow-y-auto">
                        {files.map(f => (
                            <button
                                key={f}
                                onClick={() => {
                                    setSelectedFile(f);
                                    // Auto-generate name: remove .gguf extension, lowercase, replace symbols
                                    const base = f.replace('.gguf', '').toLowerCase();
                                    const sanitized = base.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                                    setModelNameInput(sanitized);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors border-b border-gray-900 last:border-0 ${selectedFile === f ? 'bg-blue-900/30 text-blue-300' : 'text-gray-400 hover:bg-gray-900'}`}
                            >
                                <FileText size={12} />
                                <span className="truncate">{f}</span>
                            </button>
                        ))}
                        {files.length === 0 && !loading && (
                            <div className="p-3 text-gray-600 text-xs italic text-center">No .gguf files found</div>
                        )}
                    </div>

                    {selectedFile && !manualStep && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Name for Ollama</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={modelNameInput}
                                    onChange={(e) => {
                                        // Auto-sanitize: lowercase, replace spaces/symbols with dashes
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                                        setModelNameInput(val);
                                    }}
                                    placeholder="e.g. gemma-12b-erotic"
                                    className="flex-1 bg-gray-800 border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleLoadModel}
                                    disabled={!modelNameInput || loading}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold flex items-center gap-1"
                                >
                                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                                    LOAD
                                </button>
                            </div>
                        </div>
                    )}

                    {manualStep && (
                        <div className="bg-gray-950 p-4 rounded-lg border border-blue-500/50 space-y-3 animate-in fade-in zoom-in-95">
                            <div className="text-xs text-blue-300 font-bold uppercase flex items-center gap-2">
                                <AlertCircle size={14} /> Synchronized Import Required
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase font-bold">1. Run this command in your terminal:</label>
                                <div className="flex gap-2">
                                    <code className="flex-1 bg-black p-2 rounded text-xs text-pink-400 border border-gray-800 break-all">
                                        ollama create {modelNameInput || 'model-name'} --file "F:/TITAN_MODELS/{selectedFile}"
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`ollama create ${modelNameInput} --file "F:/TITAN_MODELS/${selectedFile}"`)}
                                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400"
                                        title="Copy Command"
                                    >
                                        <FileText size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-900">
                                <div className="text-[10px] text-gray-400 uppercase font-bold">2. Standing by...</div>
                                <div className="flex items-center gap-2 text-xs text-blue-400">
                                    <RefreshCw size={12} className="animate-spin" />
                                    Detecting model...
                                </div>
                            </div>

                            <a
                                href="/api/models/importer-script"
                                className="block w-full text-center py-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 border border-blue-800/50 rounded text-xs font-bold transition-colors"
                            >
                                <Download size={14} className="inline mr-1" />
                                Download Convenience Script (.ps1)
                            </a>

                            <button
                                onClick={() => { setManualStep(false); setPolling(false); setSelectedFile(null); }}
                                className="w-full text-center text-[10px] text-gray-600 hover:text-gray-400 uppercase font-bold pt-2"
                            >
                                Cancel Import
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
