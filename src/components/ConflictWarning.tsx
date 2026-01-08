import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface ConflictWarningProps {
    triggerEvent: string;
    currentCampaignId?: string;
    currentPriority: number;
}

interface ConflictCampaign {
    _id: string;
    campaign_name: string;
    priority: number;
    status: string;
}

export function ConflictWarning({ triggerEvent, currentCampaignId, currentPriority }: ConflictWarningProps) {
    const [conflicts, setConflicts] = useState<ConflictCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [maxPriority, setMaxPriority] = useState(0);

    useEffect(() => {
        if (!triggerEvent) {
            setConflicts([]);
            return;
        }

        async function checkConflicts() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    event: triggerEvent,
                    ...(currentCampaignId && { exclude: currentCampaignId })
                });

                const response = await fetch(`/api/v1/admin/campaigns/check-conflicts?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setConflicts(data.campaigns || []);
                    setMaxPriority(data.maxPriority || 0);
                }
            } catch (error) {
                console.error('Failed to check conflicts:', error);
            } finally {
                setLoading(false);
            }
        }

        checkConflicts();
    }, [triggerEvent, currentCampaignId]);

    if (loading || conflicts.length === 0) {
        return null;
    }

    const suggestedPriority = maxPriority + 10;
    const willShowFirst = currentPriority > maxPriority;

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                        {conflicts.length} {conflicts.length === 1 ? 'campaign' : 'campaigns'} also use this event
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        These campaigns will rotate in priority order when triggered
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {conflicts.slice(0, 3).map((campaign, index) => (
                    <div
                        key={campaign._id}
                        className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-800 rounded border border-amber-200 dark:border-amber-700"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                #{index + 1}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {campaign.campaign_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {campaign.status}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Priority: {campaign.priority || 0}
                            </span>
                        </div>
                    </div>
                ))}
                {conflicts.length > 3 && (
                    <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                        +{conflicts.length - 3} more campaigns
                    </p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        {willShowFirst ? (
                            <p className="text-green-700 dark:text-green-300">
                                <strong>✓ Your campaign will show first</strong> (Priority: {currentPriority} &gt; {maxPriority})
                            </p>
                        ) : (
                            <div className="space-y-1">
                                <p className="text-amber-700 dark:text-amber-300">
                                    <strong>Current priority:</strong> {currentPriority || 0}
                                </p>
                                <p className="text-amber-700 dark:text-amber-300">
                                    💡 <strong>Tip:</strong> Set priority to <strong>{suggestedPriority}</strong> or higher to show first
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Display Order:</strong> Campaigns rotate based on priority (highest → lowest → repeat)
            </div>
        </div>
    );
}
