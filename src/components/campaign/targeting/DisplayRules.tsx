import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select';


export const DisplayRules: React.FC = () => {
    const { currentCampaign, updateDisplayRules, availablePages } = useEditorStore();


    if (!currentCampaign || !currentCampaign.displayRules) return null;

    const { displayRules } = currentCampaign;

    return (
        <div className="space-y-8">

            {/* Frequency */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Select
                        value={displayRules.frequency.type}
                        onValueChange={(val: any) => updateDisplayRules({ frequency: { ...displayRules.frequency, type: val } })}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="every_time">Every time</SelectItem>
                            <SelectItem value="once_per_session">Once per session</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>

                    {displayRules.frequency.type !== 'every_time' && displayRules.frequency.type !== 'once_per_session' && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Show</span>
                            <Input
                                type="number"
                                className="w-20"
                                min={1}
                                value={displayRules.frequency.value || 1}
                                onChange={(e) => updateDisplayRules({ frequency: { ...displayRules.frequency, value: parseInt(e.target.value) || 1 } })}
                            />
                            <span className="text-sm">times</span>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Interaction Limits */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Total Interaction Limit</Label>
                <p className="text-sm text-muted-foreground">How many times can each user interact with this campaign?</p>

                <RadioGroup
                    value={displayRules.interactionLimit.type}
                    onValueChange={(val: any) => updateDisplayRules({ interactionLimit: { ...displayRules.interactionLimit, type: val } })}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unlimited" id="limit-unlimited" />
                        <Label htmlFor="limit-unlimited">Unlimited</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="limited" id="limit-limited" />
                        <Label htmlFor="limit-limited">Limited to</Label>
                        <Input
                            type="number"
                            className="w-20 h-8"
                            disabled={displayRules.interactionLimit.type !== 'limited'}
                            value={displayRules.interactionLimit.value || 1}
                            onChange={(e) => updateDisplayRules({ interactionLimit: { ...displayRules.interactionLimit, value: parseInt(e.target.value) || 1 } })}
                        />
                        <span className="text-sm text-muted-foreground">times total</span>
                    </div>
                </RadioGroup>

                <div className="flex items-center space-x-2 pt-2">
                    <Switch
                        checked={displayRules.sessionLimit.enabled}
                        onCheckedChange={(checked) => updateDisplayRules({ sessionLimit: { ...displayRules.sessionLimit, enabled: checked } })}
                        id="session-limit"
                    />
                    <Label htmlFor="session-limit">Add session limit</Label>
                    {displayRules.sessionLimit.enabled && (
                        <Input
                            type="number"
                            className="w-20 h-8 ml-2"
                            value={displayRules.sessionLimit.value || 1}
                            onChange={(e) => updateDisplayRules({ sessionLimit: { ...displayRules.sessionLimit, value: parseInt(e.target.value) || 1 } })}
                        />
                    )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Switch
                        checked={displayRules.overrideGlobal}
                        onCheckedChange={(checked) => updateDisplayRules({ overrideGlobal: checked })}
                        id="override-global"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="override-global">Override global limits</Label>
                        <p className="text-sm text-muted-foreground">Ignore frequency and impression limits</p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Pages Targeting */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Pages Targeting</Label>
                <p className="text-sm text-muted-foreground">Specify page names where this campaign should appear. Leave empty to run on all pages.</p>

                <div className="space-y-2">
                    <Label>Pages</Label>
                    <MultiSelect
                        options={availablePages.map(p => ({ label: p.name, value: p.pageTag }))}
                        selected={displayRules.pages || []}
                        onChange={(val) => updateDisplayRules({ pages: val })}
                        placeholder="Select pages..."
                        className="w-full"
                    />
                    <p className="text-[10px] text-muted-foreground">Select pages where this campaign should appear.</p>
                </div>
            </div>



        </div>
    );
};
