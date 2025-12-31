import React, { useState } from 'react';
import { Heart, ArrowRight, User, Users, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = {
    IDLE: 'idle',
    PARTNER_A: 'partner_a',
    HANDOFF: 'handoff',
    PARTNER_B: 'partner_b',
    READY: 'ready'
};

const ROLES = ['dom', 'sub', 'switch', 'voyeur'];

const TogetherMode = ({
    active,
    onPhaseChange,
    onDataReady,
    getSelections,
    onClearSelections
}) => {
    const [phase, setPhase] = useState(PHASES.PARTNER_A);
    const [partnerAName, setPartnerAName] = useState('Partner A');
    const [partnerBName, setPartnerBName] = useState('Partner B');
    const [partnerAData, setPartnerAData] = useState(null);
    const [partnerARole, setPartnerARole] = useState('switch');
    const [partnerBRole, setPartnerBRole] = useState('switch');

    if (!active) return null;

    const handlePartnerADone = () => {
        const data = getSelections?.();
        setPartnerAData({ ...data, role: partnerARole, name: partnerAName });
        // Clear selections for Partner B
        onClearSelections?.();
        setPhase(PHASES.HANDOFF);
        onPhaseChange?.(PHASES.HANDOFF);
    };

    const handleHandoffComplete = () => {
        setPhase(PHASES.PARTNER_B);
        onPhaseChange?.(PHASES.PARTNER_B);
    };

    const handlePartnerBDone = () => {
        const partnerBData = { ...getSelections?.(), role: partnerBRole, name: partnerBName };
        setPhase(PHASES.READY);
        onPhaseChange?.(PHASES.READY);
        onDataReady?.({
            partnerA: partnerAData,
            partnerB: partnerBData
        });
    };

    const reset = () => {
        setPhase(PHASES.PARTNER_A);
        setPartnerAData(null);
        setPartnerARole('switch');
        setPartnerBRole('switch');
        onClearSelections?.();
        onPhaseChange?.(PHASES.PARTNER_A);
    };



    return (
        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-xl p-4 mb-4">
            <AnimatePresence mode="wait">
                {/* Partner A Phase */}
                {phase === PHASES.PARTNER_A && (
                    <motion.div
                        key="partner-a"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <User size={18} className="text-pink-400" />
                            <span className="font-bold text-pink-200">{partnerAName || "Partner A"}'s Turn</span>
                        </div>

                        <RoleSelector
                            value={partnerARole}
                            onChange={setPartnerARole}
                            name={partnerAName}
                            onNameChange={setPartnerAName}
                            label="Partner A Name"
                        />

                        <p className="text-xs text-gray-400 mb-4 text-center">
                            Select your role above, then make your item selections below.
                        </p>
                        <button
                            onClick={handlePartnerADone}
                            className="w-full px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Done</span>
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Handoff Phase */}
                {phase === PHASES.HANDOFF && (
                    <motion.div
                        key="handoff"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="inline-block mb-4"
                        >
                            <Heart size={40} className="text-pink-500" fill="currentColor" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-pink-200 mb-2">Pass the Device</h3>
                        <p className="text-sm text-gray-400 mb-2">
                            <span className="text-pink-300 font-bold">{partnerAName}</span> selected: <span className="text-white font-bold uppercase">{partnerARole}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            Hand the device to {partnerBName}
                        </p>
                        <button
                            onClick={handleHandoffComplete}
                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold transition-all"
                        >
                            {partnerBName} Ready
                        </button>
                    </motion.div>
                )}

                {/* Partner B Phase */}
                {phase === PHASES.PARTNER_B && (
                    <motion.div
                        key="partner-b"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <User size={18} className="text-purple-400" />
                            <span className="font-bold text-purple-200">{partnerBName || "Partner B"}'s Turn</span>
                        </div>

                        <RoleSelector
                            value={partnerBRole}
                            onChange={setPartnerBRole}
                            name={partnerBName}
                            onNameChange={setPartnerBName}
                            label="Partner B Name"
                        />

                        <p className="text-xs text-gray-400 mb-4 text-center">
                            Select your role above, then make YOUR item selections.
                        </p>
                        <button
                            onClick={handlePartnerBDone}
                            className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Done</span>
                            <Check size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Ready Phase */}
                {phase === PHASES.READY && (
                    <motion.div
                        key="ready"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Users size={18} className="text-green-400" />
                            <span className="font-bold text-green-200">Both Ready!</span>
                        </div>
                        <div className="text-sm text-gray-300 mb-3">
                            <span className="text-pink-300">{partnerARole.toUpperCase()}</span>
                            <span className="text-gray-500 mx-2">+</span>
                            <span className="text-purple-300">{partnerBRole.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            Selections merged. Hit Generate!
                        </p>
                        <button
                            onClick={reset}
                            className="text-xs text-gray-500 hover:text-gray-300 underline"
                        >
                            Start Over
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RoleSelector = ({ value, onChange, name, onNameChange, label }) => (
    <div className="mb-4">
        <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1 text-center font-bold">NAME</label>
            <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-center text-sm text-white focus:border-pink-500 focus:outline-none"
                placeholder={label}
            />
        </div>

        <div className="text-xs text-gray-500 mb-2 text-center uppercase tracking-wide">ROLE</div>
        <div className="grid grid-cols-4 gap-1">
            {ROLES.map(r => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`
          p-2 rounded-lg border text-center font-medium uppercase text-xs transition-all
          ${value === r
                            ? 'border-pink-500 bg-pink-900/40 text-pink-300'
                            : 'border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-600'}
        `}
                >
                    {r}
                </button>
            ))}
        </div>
    </div>
);

export default TogetherMode;
