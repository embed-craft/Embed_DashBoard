import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';

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

import { apiClient } from '@/lib/api';

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
                const data = await apiClient.checkConflicts(triggerEvent, currentCampaignId);
                setConflicts(data.campaigns || []);
                setMaxPriority(data.maxPriority || 0);
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
        <div className="relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11 border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/10 dark:border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <h5 className="mb-1 leading-none tracking-tight text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-2">
                {conflicts.length} {conflicts.length === 1 ? 'campaign also uses' : 'campaigns also use'} this event
            </h5>
            <div className="text-sm [&_p]:leading-relaxed text-amber-800 dark:text-amber-300 mt-3 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    {conflicts.slice(0, 3).map((campaign, index) => (
                        <div
                            key={campaign._id}
                            className="flex items-center justify-between py-2 px-3 bg-background/60 rounded-md border border-border/50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    #{index + 1}
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">
                                        {campaign.campaign_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                        {campaign.status}
                                    </span>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-foreground px-2 py-1 bg-muted rounded">
                                Priority: {campaign.priority || 0}
                            </span>
                        </div>
                    ))}
                    {conflicts.length > 3 && (
                        <p className="text-sm text-center text-muted-foreground">
                            +{conflicts.length - 3} more campaigns
                        </p>
                    )}
                </div>

                <div className="bg-background/80 border border-border rounded-lg p-3 flex items-start gap-3 shadow-sm">
                    {willShowFirst ? (
                        <>
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                            <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                <strong>✓ Your campaign will show first</strong> (Priority: {currentPriority} &gt; {maxPriority})
                            </div>
                        </>
                    ) : (
                        <>
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="text-sm flex flex-col gap-1 text-muted-foreground">
                                <span>
                                    <strong>Current priority:</strong> {currentPriority || 0}
                                </span>
                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                    💡 Tip: Set priority to {suggestedPriority} or higher to show first
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
