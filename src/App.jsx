import React, { useState } from 'react';
import LoadoutScreen from './components/LoadoutScreen';
import SceneDisplay from './components/SceneDisplay';
import ScenarioLibrary from './components/ScenarioLibrary';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const App = () => {
  const [view, setView] = useState('loadout'); // 'loadout' | 'scene' | 'library'
  const [sceneData, setSceneData] = useState(null);

  const handleGenerate = (data) => {
    setSceneData(data);
    setView('scene');
  };

  const handleReset = () => {
    setView('loadout');
    setSceneData(null);
  };

  const handleShowLibrary = () => {
    setView('library');
  };

  const handleLoadScenario = (scenario) => {
    setSceneData({
      ...scenario,
      generatedScene: scenario.content,
      intensity: scenario.intensity
    });
    setView('scene');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-purple-900/10 rounded-full blur-[100px] sm:blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-pink-900/10 rounded-full blur-[80px] sm:blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50 safe-top">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1
            className="text-lg sm:text-2xl font-bold tracking-tighter cursor-pointer"
            onClick={handleReset}
          >
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Scene Architect
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-gray-600 ml-1 sm:ml-2 align-top">v2.1</span>
          </h1>

          {view !== 'loadout' && (
            <button
              onClick={handleReset}
              className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors touch-target flex items-center gap-1"
            >
              <X size={14} className="sm:hidden" />
              <span className="hidden sm:inline">← Back</span>
              <span className="sm:hidden">Close</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {view === 'loadout' && (
            <motion.div
              key="loadout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoadoutScreen
                onGenerate={handleGenerate}
                onShowLibrary={handleShowLibrary}
              />
            </motion.div>
          )}

          {view === 'scene' && sceneData && (
            <motion.div
              key="scene"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SceneDisplay data={sceneData} />
            </motion.div>
          )}

          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Saved Scenarios
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Your library of generated scenes.</p>
              </div>
              <ScenarioLibrary
                onLoad={handleLoadScenario}
                onClose={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
