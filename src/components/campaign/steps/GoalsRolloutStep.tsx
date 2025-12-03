import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

export const GoalsRolloutStep: React.FC = () => {
    const { currentCampaign, updateGoal } = useEditorStore();

    if (!currentCampaign) return null;

    const { goal } = currentCampaign;

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-gray-50/50">
            <div className="max-w-4xl mx-auto w-full p-8 space-y-8">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Goals & Rollout</h1>
                    <p className="text-muted-foreground">Define what success looks like and how widely to roll this campaign out.</p>
                </div>

                {/* Goal Selection */}
                <section className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Which events mark success?</Label>
                        <p className="text-sm text-muted-foreground">Select goal events for your experience.</p>

                        <Select
                            value={goal?.event || ''}
                            onValueChange={(val) => updateGoal({ event: val })}
                        >
                            <SelectTrigger className="w-full max-w-md">
                                <SelectValue placeholder="Select event..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="conversion">Conversion</SelectItem>
                                <SelectItem value="signup">Sign Up</SelectItem>
                                <SelectItem value="purchase">Purchase</SelectItem>
                                <SelectItem value="share">Share</SelectItem>
                                <SelectItem value="custom">Custom Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                {/* Rollout Percentage */}
                <section className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">What percent of users should see this experience?</Label>
                        <p className="text-sm text-muted-foreground">Set the rollout for your campaign</p>

                        <div className="flex items-center gap-4 pt-4">
                            <Slider
                                value={[goal?.rolloutPercentage || 100]}
                                max={100}
                                step={1}
                                onValueChange={(vals) => updateGoal({ rolloutPercentage: vals[0] })}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2 w-20">
                                <Input
                                    type="number"
                                    value={goal?.rolloutPercentage || 100}
                                    onChange={(e) => updateGoal({ rolloutPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                    className="h-9 text-right"
                                />
                                <span className="text-sm font-medium">%</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};
