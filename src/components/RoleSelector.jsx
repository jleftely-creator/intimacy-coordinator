import React, { useState } from 'react';

const rolesList = [
    { id: 'dom', label: 'Dominant', desc: 'Takes control and directs the scene.' },
    { id: 'sub', label: 'Submissive', desc: 'Surrenders control and follows direction.' },
    { id: 'switch', label: 'Switch', desc: 'Can take either role depending on the flow.' },
    { id: 'observer', label: 'Observer', desc: 'Watches without direct participation.' },
];

const RoleSelector = ({ onSave }) => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [partnerRole, setPartnerRole] = useState(null);

    const handleSave = () => {
        if (selectedRole && partnerRole) {
            onSave({ user: selectedRole, partner: partnerRole });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-1">Role Assignment</h2>
                <p className="text-sm text-gray-500">Define the dynamic.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Your Role</label>
                    <div className="grid grid-cols-2 gap-2">
                        {rolesList.map(role => (
                            <button
                                key={`user-${role.id}`}
                                onClick={() => setSelectedRole(role.id)}
                                className={`p-3 rounded-lg border text-left transition-all ${selectedRole === role.id
                                        ? 'bg-pink-600 border-pink-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                                    }`}
                            >
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs opacity-70 mt-1">{role.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Partner Role</label>
                    <div className="grid grid-cols-2 gap-2">
                        {rolesList.map(role => (
                            <button
                                key={`partner-${role.id}`}
                                onClick={() => setPartnerRole(role.id)}
                                className={`p-3 rounded-lg border text-left transition-all ${partnerRole === role.id
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                                    }`}
                            >
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs opacity-70 mt-1">{role.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={!selectedRole || !partnerRole}
                className="w-full mt-4 bg-gray-100 text-gray-900 py-3 rounded-lg font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Confirm Dynamics
            </button>
        </div>
    );
};

export default RoleSelector;
