import React, { useState, useEffect } from 'react';
import { useEditorStore, SpinTheWheelSection } from '@/store/useEditorStore';
import { useStore } from '@/store/useStore';
import { Trash2, Plus, GripVertical, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

const SpinWheelRewardsStep = () => {
    const { currentCampaign, updateSpinTheWheelConfig } = useEditorStore();
    const { rewards, segments, fetchSegments, fetchRewards } = useStore();
    
    // Expand/collapse states for sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [showPlaceholders, setShowPlaceholders] = useState(false);

    useEffect(() => {
        // Fetch segments/cohorts on mount
        fetchSegments();
        fetchRewards();
        
        // Auto-expand sections that are recently added
        if (currentCampaign?.spinTheWheelConfig?.sections) {
            const newState = { ...expandedSections };
            currentCampaign.spinTheWheelConfig.sections.forEach(sec => {
                if (newState[sec.id] === undefined) {
                    newState[sec.id] = true;
                }
            });
            setExpandedSections(newState);
        }
    }, []);

    if (!currentCampaign || currentCampaign.type !== 'spinthewheel') return null;

    const config = currentCampaign.spinTheWheelConfig || { winningCriteria: 'weight', sections: [] };
    const isAudienceBased = config.winningCriteria === 'audience';

    const toggleCriteria = (val: 'audience' | 'weight') => {
        updateSpinTheWheelConfig({ winningCriteria: val });
    };

    const addSection = () => {
        const num = config.sections.length + 1;
        const newSection: SpinTheWheelSection = {
            id: Date.now().toString(),
            name: `Section ${num}`,
            rewardId: '',
            weight: 100
        };
        updateSpinTheWheelConfig({
            sections: [...config.sections, newSection]
        });
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    const removeSection = (id: string) => {
        updateSpinTheWheelConfig({
            sections: config.sections.filter(s => s.id !== id)
        });
    };

    const updateSection = (id: string, updates: Partial<SpinTheWheelSection>) => {
        updateSpinTheWheelConfig({
            sections: config.sections.map(s => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 h-full">
            <div className="max-w-4xl mx-auto p-8 space-y-8 pb-32">
                
                {/* Header block */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Rewards</h1>
                    <p className="text-gray-500">Define the number of sections and their rewards</p>
                </div>

                {/* Placeholders Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Collapsible Header */}
                    <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setShowPlaceholders(prev => !prev)}
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-gray-700" />
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Dynamic Text & Image Placeholders</h3>
                                <p className="text-xs text-gray-500">Use double-brace placeholders to render dynamic spin, reward text, or icons in your layers.</p>
                            </div>
                        </div>
                        <div className="text-gray-500 pr-1">
                            {showPlaceholders ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                    </div>

                    {/* Content Section */}
                    {showPlaceholders && (
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{name}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Text/Button layer</span>
                                    </div>
                                    <p className="text-gray-600">Resolves to the winning reward's name. (Legacy placeholders <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{reward_name}}"}</code> and <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{section_name}}"}</code> also work).</p>
                                </div>
                                
                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{coupon_code}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Text/Button layer</span>
                                    </div>
                                    <p className="text-gray-600">Resolves to the winning reward's coupon code or code property.</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{icon}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Image layer url</span>
                                    </div>
                                    <p className="text-gray-600">Resolves to the winning reward's icon or image URL. (Alias: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{iconUrl}}"}</code> or <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{imageUrl}}"}</code>).</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{spins_left}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Text/Button layer</span>
                                    </div>
                                    <p className="text-gray-600">Resolves to the remaining number of spins allowed for the user.</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{max_spins}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Text/Button layer</span>
                                    </div>
                                    <p className="text-gray-600">Resolves to the maximum attempts configured for this campaign.</p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 font-mono rounded font-semibold text-[11px]">{"{{any_reward_property}}"}</code>
                                        <span className="text-[10px] text-gray-400 font-mono font-medium">Any layer type</span>
                                    </div>
                                    <p className="text-gray-600">Resolves dynamically to <strong className="font-medium text-gray-900">any custom property</strong> present on your reward object (e.g. <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{value}}"}</code>, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{"{{description}}"}</code>).</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-semibold text-gray-900">Which events mark success?</h2>
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Select goal events for your experience.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Winning Criteria Strategy */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Winning Criteria</label>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="winningCriteria" 
                                        checked={isAudienceBased} 
                                        onChange={() => toggleCriteria('audience')}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Audience Based</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="winningCriteria" 
                                        checked={!isAudienceBased} 
                                        onChange={() => toggleCriteria('weight')}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Weight Based</span>
                                </label>
                            </div>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-4">
                            {config.sections.map((section) => (
                                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                    {/* Section Header */}
                                    <div 
                                        className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => toggleExpand(section.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {expandedSections[section.id] ? <ChevronDown size={18} className="text-gray-500"/> : <ChevronRight size={18} className="text-gray-500"/>}
                                            <span className="font-medium text-gray-900">{section.name}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                                            className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Section Body */}
                                    {expandedSections[section.id] && (
                                        <div className="p-4 border-t border-gray-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Section Reward</label>
                                                    <select 
                                                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 border bg-white px-3 h-[42px]"
                                                        value={section.rewardId || ''}
                                                        onChange={(e) => {
                                                            const rId = e.target.value;
                                                            updateSection(section.id, { 
                                                                rewardId: rId,
                                                                quantity: rId ? (section.quantity || 1) : undefined
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        {rewards.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Reward Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        placeholder={(!section.rewardId || section.rewardId === 'no_reward') ? "N/A (No Reward)" : "Unlimited"}
                                                        disabled={!section.rewardId || section.rewardId === 'no_reward'}
                                                        value={(!section.rewardId || section.rewardId === 'no_reward') ? "" : (section.quantity === undefined || section.quantity === null ? '' : section.quantity)}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateSection(section.id, { 
                                                                quantity: val === '' ? undefined : parseInt(val)
                                                            });
                                                        }}
                                                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 border px-3 h-[42px] disabled:bg-gray-100 disabled:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            {isAudienceBased ? (
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-gray-500">Audience</label>
                                                    <select 
                                                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 border bg-white px-3 h-[42px]"
                                                        value={section.audienceId || ''}
                                                        onChange={(e) => updateSection(section.id, { audienceId: e.target.value })}
                                                    >
                                                        <option value="">Select...</option>
                                                        {segments.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name} ({s.users} users)</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 w-1/2 pr-2">
                                                    <label className="text-xs font-medium text-gray-500">Weight</label>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={section.weight || 0}
                                                        onChange={(e) => updateSection(section.id, { weight: parseInt(e.target.value) || 0 })}
                                                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 border px-3 h-[42px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Section */}
                        <button
                            onClick={addSection}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg px-4 py-2 mt-4"
                        >
                            <Plus size={16} />
                            Add Section
                        </button>
                    </div>
                </div>

                {/* Section Limits */}
                <div className="bg-[#f8f9fa] rounded-xl border border-gray-200 overflow-hidden shadow-sm pt-6 mt-8">
                    <div className="px-6 mb-4">
                        <h3 className="text-base font-semibold text-gray-900">Reward Section Win Limit</h3>
                        <p className="text-xs text-gray-500 mt-1">Maximum times a user can win each reward section</p>
                    </div>
                    
                    <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Limit to</span>
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="∞"
                                value={config.sectionWinLimit || ''}
                                onChange={(e) => updateSpinTheWheelConfig({ sectionWinLimit: parseInt(e.target.value) || undefined })}
                                className="w-24 text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-1.5 px-3 border bg-gray-50"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700">wins per section</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SpinWheelRewardsStep;
