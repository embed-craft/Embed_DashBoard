import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Switch } from '@/components/ui/switch';

export const ChallengeTypeStep: React.FC = () => {
    const { currentCampaign, updateCampaign } = useEditorStore();

    if (!currentCampaign) return null;

    const details = currentCampaign.challengeDetails || {
        executionOrder: 'any_order',
        allowMultipleSimultaneousTasks: false,
        hideOnCompletion: true,
        tasks: []
    };

    const updateDetails = (updates: Partial<typeof details>) => {
        updateCampaign({
            challengeDetails: { ...details, ...updates }
        });
    };

    return (
        <div className="p-8 max-w-[850px]">
            <div className="mb-8">
                <h2 className="text-[22px] font-semibold text-gray-900 mb-1">
                    Challenge Type
                </h2>
                <p className="text-[14px] text-gray-500">
                    Set up task level settings.
                </p>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white block overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-white">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Challenge Type</h3>
                    <p className="text-[13px] text-gray-500">Decide in which order should the challenges task be completed</p>
                </div>

                <div className="p-6">
                    <div className="flex gap-4 mb-8">
                        {/* Any Order Card */}
                        <div 
                            onClick={() => updateDetails({ executionOrder: 'any_order' })}
                            className={`flex-[1.2] rounded-xl cursor-pointer border transition-all ${details.executionOrder === 'any_order' ? 'border-[#7C3AED] bg-white ring-1 ring-[#7C3AED]/10 shadow-[0_4px_12px_rgba(124,58,237,0.08)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                            <div className="p-6 border-b border-gray-100/50 flex flex-col gap-3 min-h-[220px] justify-center px-10">
                                <div className="h-10 rounded-[6px] bg-[#EDE9FE] border-2 border-[#C4B5FD] w-full"></div>
                                <div className="h-10 rounded-[6px] bg-[#F8FAFC] border-2 border-[#F1F5F9] w-full"></div>
                                <div className="h-10 rounded-[6px] bg-[#F8FAFC] border-2 border-[#F1F5F9] w-full"></div>
                                <div className="h-10 rounded-[6px] bg-[#EDE9FE] border-2 border-[#C4B5FD] w-full"></div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${details.executionOrder === 'any_order' ? 'border-[#7C3AED]' : 'border-gray-300'}`}>
                                    {details.executionOrder === 'any_order' && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></div>}
                                </div>
                                <span className="text-[15px] font-medium text-gray-800">Any Order</span>
                            </div>
                        </div>

                        {/* Sequential Card */}
                        <div 
                            onClick={() => updateDetails({ executionOrder: 'sequential' })}
                            className={`flex-[1.2] rounded-xl cursor-pointer border transition-all ${details.executionOrder === 'sequential' ? 'border-[#7C3AED] bg-white ring-1 ring-[#7C3AED]/10 shadow-[0_4px_12px_rgba(124,58,237,0.08)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                            <div className="p-6 border-b border-gray-100/50 flex flex-col gap-3 min-h-[220px] justify-center px-10">
                                <div className="h-10 rounded-[6px] bg-[#EDE9FE] border-2 border-[#C4B5FD] w-full flex items-center px-3">
                                    <div className="w-6 h-6 rounded-[6px] bg-[#7C3AED] text-white flex items-center justify-center text-[13px] font-bold">1</div>
                                </div>
                                <div className="h-10 rounded-[6px] bg-[#EDE9FE] border-2 border-[#C4B5FD] w-full flex items-center px-3">
                                    <div className="w-6 h-6 rounded-[6px] bg-[#7C3AED] text-white flex items-center justify-center text-[13px] font-bold">2</div>
                                </div>
                                <div className="h-10 rounded-[6px] bg-[#F8FAFC] border-2 border-[#F1F5F9] w-full flex items-center px-3">
                                    <div className="w-6 h-6 rounded-[6px] bg-[#E2E8F0] text-gray-500 flex items-center justify-center text-[13px] font-bold">3</div>
                                </div>
                                <div className="h-10 rounded-[6px] bg-[#F8FAFC] border-2 border-[#F1F5F9] w-full flex items-center px-3">
                                    <div className="w-6 h-6 rounded-[6px] bg-[#E2E8F0] text-gray-500 flex items-center justify-center text-[13px] font-bold">4</div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${details.executionOrder === 'sequential' ? 'border-[#7C3AED]' : 'border-gray-300'}`}>
                                    {details.executionOrder === 'sequential' && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></div>}
                                </div>
                                <span className="text-[15px] font-medium text-gray-800">Sequential</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pl-2">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => updateDetails({ allowMultipleSimultaneousTasks: !details.allowMultipleSimultaneousTasks })}>
                            <Switch 
                                checked={details.allowMultipleSimultaneousTasks}
                                onCheckedChange={(c) => updateDetails({ allowMultipleSimultaneousTasks: c })}
                            />
                            <span className="text-[14px] text-gray-600 font-medium select-none">Allow user to complete multiple tasks at once</span>
                        </div>
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => updateDetails({ hideOnCompletion: !details.hideOnCompletion })}>
                            <Switch 
                                checked={details.hideOnCompletion}
                                onCheckedChange={(c) => updateDetails({ hideOnCompletion: c })}
                            />
                            <span className="text-[14px] text-gray-600 font-medium select-none">Hide campaign after user completes all tasks</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
