import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const defaultToys = ['cuffs', 'blindfold', 'crop', 'vibrator', 'rope', 'gag'];

const ToyChest = ({ onSave }) => {
    // load saved custom toys from localstorage or use default
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('user_inventory');
        return saved ? JSON.parse(saved) : defaultToys;
    });

    const [selected, setSelected] = useState([]);
    const [newItem, setNewItem] = useState('');

    // save inventory to localstorage whenever it changes
    useEffect(() => {
        localStorage.setItem('user_inventory', JSON.stringify(inventory));
    }, [inventory]);

    const toggleToy = (toy) => {
        if (selected.includes(toy)) {
            setSelected(selected.filter(t => t !== toy));
        } else {
            setSelected([...selected, toy]);
        }
    };

    const handleAddCustom = (e) => {
        e.preventDefault();
        if (newItem.trim() && !inventory.includes(newItem.trim())) {
            const item = newItem.trim().toLowerCase();
            setInventory([...inventory, item]);
            setSelected([...selected, item]); // auto-select the new item
            setNewItem('');
        }
    };

    const deleteItem = (e, toy) => {
        e.stopPropagation(); // don't trigger selection
        const newInv = inventory.filter(t => t !== toy);
        setInventory(newInv);
        setSelected(selected.filter(t => t !== toy)); // remove from selected if present
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600">Inventory Management</h2>
                <span className="text-xs text-gray-500 uppercase tracking-widest">v2.0</span>
            </div>

            {/* custom input area */}
            <form onSubmit={handleAddCustom} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add custom gear..."
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder-gray-600"
                />
                <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className="bg-gray-800 border border-gray-700 p-3 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Plus size={20} className="text-pink-500 group-hover:scale-110 transition-transform" />
                </button>
            </form>

            {/* grid display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {inventory.map(toy => (
                    <div
                        key={toy}
                        onClick={() => toggleToy(toy)}
                        className={`
              relative group cursor-pointer p-3 rounded-lg border transition-all duration-200 flex justify-between items-center select-none
              ${selected.includes(toy)
                                ? 'bg-pink-900/30 border-pink-500/50 text-pink-100 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-gray-600 hover:text-gray-200'
                            }
            `}
                    >
                        <span className="truncate text-sm font-medium capatalize">{toy}</span>

                        {/* delete button (only show on hover for cleanup) */}
                        <button
                            onClick={(e) => deleteItem(e, toy)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-all"
                            title="Remove item"
                        >
                            <X size={14} />
                        </button>

                        {/* Active Indicator Dot */}
                        {selected.includes(toy) && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(236,72,153,0.8)]"></div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => onSave(selected)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 rounded-lg mt-6 font-bold tracking-wide hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
                Confirm Loadout
            </button>
        </div>
    );
};

export default ToyChest;
