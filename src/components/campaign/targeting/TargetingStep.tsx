import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { PlatformSelector } from './PlatformSelector';
import { AudienceBuilder } from './AudienceBuilder';
import { TriggerBuilder } from './TriggerBuilder';
import { DisplayRules } from './DisplayRules';
import { PrioritySelector } from '@/components/PrioritySelector';
import { ConflictWarning } from '@/components/ConflictWarning';
import { Separator } from '@/components/ui/separator';

export const TargetingStep: React.FC = () => {
    const { currentCampaign, fetchMetadata, updateCurrentCampaign } = useEditorStore();
    const [hasConflicts, setHasConflicts] = useState(false);

    React.useEffect(() => {
        fetchMetadata();
    }, []);

    if (!currentCampaign) return null;

    // Extract trigger event from targeting rules
    const eventRules = (currentCampaign?.targeting || []).filter(r => r.type === 'event');
    const firstEventName = eventRules.length > 0 ? eventRules[0].event : null;

    // Check for conflicts when event changes
    useEffect(() => {
        async function checkConflicts() {
            if (!firstEventName || !currentCampaign) {
                setHasConflicts(false);
                return;
            }

            try {
                const params = new URLSearchParams({
                    event: firstEventName,
                    ...(currentCampaign._id && { exclude: currentCampaign._id })
                });

                const response = await fetch(`/api/v1/admin/campaigns/check-conflicts?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setHasConflicts(data.count > 0);
                }
            } catch (error) {
                console.error('Failed to check conflicts:', error);
                setHasConflicts(false);
            }
        }

        checkConflicts();
    }, [firstEventName, currentCampaign?._id]);

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-gray-50/50">
            <div className="max-w-4xl mx-auto w-full p-8 space-y-8">

                {/* Section 1: Platform */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Where should this experience run?</h2>
                        <p className="text-sm text-muted-foreground">Choose platforms on which the campaigns should go live.</p>
                    </div>
                    <PlatformSelector />
                </section>

                {/* Section 2: Audience (Who) */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Who will see this campaign?</h2>
                        <p className="text-sm text-muted-foreground">Decide who will see this campaign.</p>
                    </div>
                    <AudienceBuilder />
                </section>

                {/* Section 3: Trigger (When) */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">When will they see this campaign?</h2>
                        <p className="text-sm text-muted-foreground">Decide what events must the user do to qualify for the campaign.</p>
                    </div>
                    <TriggerBuilder />

                    {/* Conflict Warning & Priority - Only show when there are conflicts */}
                    {firstEventName && hasConflicts && (
                        <div className="mt-6 space-y-6">
                            <ConflictWarning
                                triggerEvent={firstEventName}
                                currentCampaignId={currentCampaign._id}
                                currentPriority={currentCampaign.priority || 0}
                            />

                            {/* Priority Selector - Only visible when conflicts exist */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-4">
                                    Set Campaign Priority
                                </h3>
                                <PrioritySelector
                                    value={currentCampaign.priority || 0}
                                    onChange={(priority) => updateCurrentCampaign({ priority })}
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* Section 4: Display Rules */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Campaign Display Rules</h2>
                        <p className="text-sm text-muted-foreground">Control when and how often users see this campaign.</p>
                    </div>
                    <DisplayRules />
                </section>

            </div>
        </div>
    );
};
