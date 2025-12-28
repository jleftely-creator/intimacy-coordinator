import React, { useState } from 'react';

const outfits = [
    { id: 'latex', label: 'Latex', desc: 'Shiny, tight, second skin.' },
    { id: 'leather', label: 'Leather', desc: 'Classic, durable, sensory.' },
    { id: 'lingerie', label: 'Lingerie', desc: 'Delicate, revealing, lace.' },
    { id: 'casual', label: 'Casual', desc: 'Comfortable, unassuming.' },
    { id: 'formal', label: 'Formal', desc: 'Suits, dresses, elegant.' },
    { id: 'nude', label: 'None', desc: 'Bare skin.' },
];

const WardrobePicker = ({ onSave }) => {
    const [selectedOutfit, setSelectedOutfit] = useState('');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-1">Wardrobe Selection</h2>
                <p className="text-sm text-gray-500">Choose the aesthetic.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {outfits.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedOutfit(item.id)}
                        className={`p-4 rounded-lg border text-left transition-all relative overflow-hidden group ${selectedOutfit === item.id
                                ? 'bg-gray-700 border-gray-500 text-white ring-1 ring-gray-500'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                            }`}
                    >
                        <span className="font-medium block">{item.label}</span>
                        <span className="text-xs opacity-70 block mt-1">{item.desc}</span>
                        {selectedOutfit === item.id && (
                            <div className="absolute top-0 right-0 p-1">
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onSave(selectedOutfit)}
                disabled={!selectedOutfit}
                className="w-full mt-4 bg-gray-100 text-gray-900 py-3 rounded-lg font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Set Attire
            </button>
        </div>
    );
};

export default WardrobePicker;
