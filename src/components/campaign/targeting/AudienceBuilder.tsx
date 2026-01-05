import React from 'react';
import { useEditorStore, TargetingRule } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Users } from 'lucide-react';

export const AudienceBuilder: React.FC = () => {
    const { currentCampaign, addTargetingRule, updateTargetingRule, deleteTargetingRule, availableProperties, availableEvents } = useEditorStore();

    if (!currentCampaign) return null;

    const rules = (currentCampaign.targeting || []).filter(r => r.type === 'user_property');

    const handleAddRule = () => {
        addTargetingRule({
            type: 'user_property',
            property: '',
            operator: 'equals',
            value: ''
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">All Users</span>
                </div>

                {rules.length === 0 ? (
                    <div className="text-sm text-muted-foreground pl-6">
                        Campaign will be shown to all users. Add filters to target specific segments.
                    </div>
                ) : (
                    <div className="space-y-3 pl-6 border-l-2 border-gray-200 ml-2">
                        {rules.map((rule, index) => (
                            <div key={rule.id} className="flex items-center gap-3">
                                {index > 0 && (
                                    <span className="text-xs font-bold text-muted-foreground bg-gray-200 px-2 py-1 rounded">AND</span>
                                )}

                                <div className="flex-1 flex items-center gap-2 bg-white p-2 rounded border shadow-sm">
                                    <span className="text-sm text-muted-foreground px-2">where</span>

                                    {/* Property Selector */}
                                    <Select
                                        value={rule.property}
                                        onValueChange={(val) => updateTargetingRule(rule.id, { property: val })}
                                    >
                                        <SelectTrigger className="w-[180px] h-8">
                                            <SelectValue placeholder="Select property" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(() => {
                                                // Calculate properties that are associated with events
                                                const eventPropertyIds = new Set(
                                                    availableEvents?.flatMap(e =>
                                                        e.properties?.map((p: any) => p._id || p.id) || []
                                                    ) || []
                                                );

                                                // Filter available properties to exclude event properties
                                                const userProperties = availableProperties.filter(p =>
                                                    !eventPropertyIds.has(p._id || p.id)
                                                );

                                                return userProperties.map(prop => (
                                                    <SelectItem key={prop.id || prop._id} value={prop.name}>
                                                        {prop.displayName || prop.name}
                                                    </SelectItem>
                                                ));
                                            })()}
                                            {/* Fallback for standard properties if not in DB yet */}
                                            {/* Fallback for standard properties if not in DB yet - Handled by store defaults now */}
                                        </SelectContent>
                                    </Select>

                                    {/* Operator Selector */}
                                    <Select
                                        value={rule.operator}
                                        onValueChange={(val) => updateTargetingRule(rule.id, { operator: val as any })}
                                    >
                                        <SelectTrigger className="w-[140px] h-8">
                                            <SelectValue placeholder="Operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">equal to</SelectItem>
                                            <SelectItem value="not_equals">not equal to</SelectItem>
                                            <SelectItem value="contains">contains</SelectItem>
                                            <SelectItem value="greater_than">greater than</SelectItem>
                                            <SelectItem value="less_than">less than</SelectItem>
                                            <SelectItem value="greater_than_or_equal">at least (&ge;)</SelectItem>
                                            <SelectItem value="less_than_or_equal">at most (&le;)</SelectItem>
                                            <SelectItem value="set">is set</SelectItem>
                                            <SelectItem value="not_set">is not set</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Value Input */}
                                    {rule.operator !== 'set' && rule.operator !== 'not_set' && (
                                        <Input
                                            className="flex-1 h-8"
                                            placeholder="Value"
                                            value={String(rule.value || '')}
                                            onChange={(e) => updateTargetingRule(rule.id, { value: e.target.value })}
                                        />
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                        onClick={() => deleteTargetingRule(rule.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 pl-6">
                    <Button variant="outline" size="sm" onClick={handleAddRule} className="text-primary hover:text-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Filter
                    </Button>
                </div>
            </div>
        </div>
    );
};
