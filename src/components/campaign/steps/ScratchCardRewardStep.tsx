import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useStore } from '@/store/useStore';
import { Gift, AlertCircle } from 'lucide-react';
import { theme } from '@/styles/design-tokens';

const ScratchCardRewardStep = () => {
    const { currentCampaign, updateScratchCardConfig } = useEditorStore();
    const { rewards, fetchRewards } = useStore();

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    const handleRewardSelect = (rewardId: string) => {
        updateScratchCardConfig({
            ...currentCampaign?.scratchCardConfig,
            rewardId: rewardId
        });
    };

    const handleFallbackStateChange = (state: string) => {
        updateScratchCardConfig({
            ...currentCampaign?.scratchCardConfig,
            fallbackRewardState: state
        });
    };

    const selectedRewardId = currentCampaign?.scratchCardConfig?.rewardId || '';
    const fallbackState = currentCampaign?.scratchCardConfig?.fallbackRewardState || '';

    const hasScratchFoil = currentCampaign?.interfaces?.some(intf => 
        intf.layers?.some((layer: any) => layer.type === 'scratch_foil')
    ) || currentCampaign?.layers?.some(layer => layer.type === 'scratch_foil');

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 h-full">
            <div className="max-w-4xl mx-auto p-8 space-y-8 pb-32">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Scratch Card Reward</h2>
                        <p className="text-sm text-gray-500">Select the reward that users will uncover when they scratch this card.</p>
                    </div>
                </div>

                <div className="space-y-4 mt-8">
                    <label className="block text-sm font-semibold text-gray-700">Linked Global Reward</label>
                    {rewards.length === 0 ? (
                        <div className="p-4 rounded-xl bg-orange-50 text-orange-800 text-sm border border-orange-100">
                            You don't have any active rewards in your Global Rewards wallet. Please create a reward first.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rewards.map(reward => (
                                <div 
                                    key={reward.id}
                                    onClick={() => handleRewardSelect(reward.id)}
                                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                        selectedRewardId === reward.id 
                                            ? 'border-indigo-600 bg-indigo-50' 
                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {selectedRewardId === reward.id && (
                                        <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                            {reward.iconUrl ? (
                                                <img src={reward.iconUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Gift className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm truncate pr-8">{reward.name}</h4>
                                            <p className="text-xs text-gray-500">{reward.type} • {reward.status}</p>
                                        </div>
                                    </div>
                                    {reward.description && (
                                        <p className="text-xs text-gray-600 mt-3 line-clamp-2">{reward.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                    <div className="mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">How Variable Injection Works</p>
                        <p>Once you select a reward, its details will be automatically available in the Design Step. You can type variables like <code>{`{{name}}`}</code>, <code>{`{{description}}`}</code>, or <code>{`{{couponCode}}`}</code> in any Text layer to dynamically display the reward info to the user.</p>
                    </div>
                </div>

                {selectedRewardId && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-md font-semibold text-gray-900">Available Variables for Selected Reward</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-hidden">
                            <table className="min-w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-100 border-b border-gray-200 uppercase">
                                    <tr>
                                        <th className="px-4 py-2 rounded-tl-lg">Variable</th>
                                        <th className="px-4 py-2">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(rewards.find(r => r.id === selectedRewardId) || {}).map(([key, value]) => {
                                        if (key === 'id' || key === '_id' || typeof value === 'object') return null;
                                        return (
                                            <tr key={key} className="border-b border-gray-100 last:border-0">
                                                <td className="px-4 py-3 font-mono text-indigo-600 bg-indigo-50/30">
                                                    {`{{${key}}}`}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]" title={String(value)}>
                                                    {String(value)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!hasScratchFoil && selectedRewardId && (
                    <div className="mt-8 p-6 rounded-2xl border-2 border-amber-200 bg-amber-50">
                        <div className="flex gap-3 mb-4">
                            <div className="mt-0.5">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-amber-900">Missing Scratch Foil Layer</h3>
                                <p className="text-sm text-amber-800 mt-1">
                                    We noticed your design doesn't include a Scratch Foil layer. Since users won't be able to "scratch" to reveal the reward, how should we save this reward to their wallet when they see this campaign?
                                </p>
                            </div>
                        </div>

                        <div className="ml-8 space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-white bg-amber-50/50 border-amber-200">
                                <input 
                                    type="radio" 
                                    name="fallbackState" 
                                    value="revealed"
                                    checked={fallbackState === 'revealed'}
                                    onChange={(e) => handleFallbackStateChange(e.target.value)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Save as Revealed (Unlocked)</p>
                                    <p className="text-xs text-gray-500">The reward will be immediately usable in their wallet.</p>
                                </div>
                            </label>
                            
                            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-white bg-amber-50/50 border-amber-200">
                                <input 
                                    type="radio" 
                                    name="fallbackState" 
                                    value="unrevealed"
                                    checked={fallbackState === 'unrevealed'}
                                    onChange={(e) => handleFallbackStateChange(e.target.value)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Save as Unrevealed (Locked)</p>
                                    <p className="text-xs text-gray-500">The reward will be saved but locked. They must scratch it later to use it.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default ScratchCardRewardStep;
