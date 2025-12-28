import React from 'react';
import { Flame, Zap, Skull, Smile } from 'lucide-react';

const INTENSITY_LEVELS = [
    {
        id: 'casual',
        label: 'Casual',
        desc: 'Sweet & playful',
        icon: Smile,
        color: 'border-blue-400 text-blue-400',
        bg: 'bg-blue-900/20',
        glow: 'shadow-blue-500/20'
    },
    {
        id: 'adventurous',
        label: 'Adventurous',
        desc: 'Push boundaries',
        icon: Flame,
        color: 'border-orange-400 text-orange-400',
        bg: 'bg-orange-900/20',
        glow: 'shadow-orange-500/20'
    },
    {
        id: 'weird',
        label: 'Get Weird',
        desc: 'Niche & intense',
        icon: Zap,
        color: 'border-purple-400 text-purple-400',
        bg: 'bg-purple-900/20',
        glow: 'shadow-purple-500/20'
    },
    {
        id: 'demon',
        label: 'Demon',
        desc: 'CHAOS',
        icon: Skull,
        color: 'border-red-600 text-red-500',
        bg: 'bg-red-950/40',
        glow: 'shadow-red-600/40 animate-pulse'
    }
];

const IntensitySelector = ({ value, onChange }) => {
    return (
        <div className="w-full mb-4 sm:mb-6">
            <h2 className="section-header">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Intensity
                </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {INTENSITY_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isSelected = value === level.id;

                    return (
                        <button
                            key={level.id}
                            onClick={() => onChange(level.id)}
                            className={`
                relative w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-300 group touch-target
                ${isSelected
                                    ? `${level.color} ${level.bg} ${level.glow} shadow-lg scale-[1.02]`
                                    : 'border-gray-800/50 bg-gray-900/30 text-gray-500 hover:border-gray-600 hover:bg-gray-800/50'}
              `}
                        >
                            <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
                                <div className={`p-2 rounded-xl bg-black/30 ${isSelected ? level.color : 'text-gray-600'}`}>
                                    <Icon size={20} />
                                </div>

                                <div>
                                    <h3 className={`font-bold uppercase text-xs sm:text-sm ${isSelected ? '' : 'text-gray-300'}`}>
                                        {level.label}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs opacity-70 mt-0.5 hidden sm:block">
                                        {level.desc}
                                    </p>
                                </div>
                            </div>

                            {isSelected && (
                                <div className={`absolute right-2 top-2 w-2 h-2 rounded-full ${level.color.replace('border-', 'bg-').split(' ')[0]}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default IntensitySelector;
