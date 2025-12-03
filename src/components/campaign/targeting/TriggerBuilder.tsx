import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Zap, Loader2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export const TriggerBuilder: React.FC = () => {
    const {
        currentCampaign,
        addTargetingRule,
        updateTargetingRule,
        deleteTargetingRule,
        availableEvents,
        availableProperties,
        isLoadingMetadata,
        fetchMetadata,
        createEvent,
        createProperty,
        updateTrigger // ✅ FIX: Destructure updateTrigger
    } = useEditorStore();

    // Event Creation State
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [newEventDescription, setNewEventDescription] = useState('');
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);

    // Property Creation State
    const [isCreatePropertyOpen, setIsCreatePropertyOpen] = useState(false);
    const [newPropertyName, setNewPropertyName] = useState('');
    const [newPropertyType, setNewPropertyType] = useState<'string' | 'number' | 'boolean'>('string');
    const [newPropertyDescription, setNewPropertyDescription] = useState('');
    const [isCreatingProperty, setIsCreatingProperty] = useState(false);

    // Track which rule triggered the property creation
    const [activeRuleIdForProperty, setActiveRuleIdForProperty] = useState<string | null>(null);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    if (!currentCampaign) return null;

    const rules = (currentCampaign.targeting || []).filter(r => r.type === 'event');

    const handleAddRule = () => {
        addTargetingRule({
            type: 'event',
            event: '',
            count: 1,
            operator: 'greater_than',
            properties: []
        });
    };

    const handleAddPropertyFilter = (ruleId: string) => {
        const rule = rules.find(r => r.id === ruleId);
        if (!rule) return;

        const newProperties = [
            ...(rule.properties || []),
            {
                id: Math.random().toString(36).substr(2, 9),
                field: '',
                operator: 'equals' as const,
                value: ''
            }
        ];

        updateTargetingRule(ruleId, { properties: newProperties });
    };

    const updatePropertyFilter = (ruleId: string, propertyId: string, updates: any) => {
        const rule = rules.find(r => r.id === ruleId);
        if (!rule || !rule.properties) return;

        const newProperties = rule.properties.map(p =>
            p.id === propertyId ? { ...p, ...updates } : p
        );

        updateTargetingRule(ruleId, { properties: newProperties });
    };

    const removePropertyFilter = (ruleId: string, propertyId: string) => {
        const rule = rules.find(r => r.id === ruleId);
        if (!rule || !rule.properties) return;

        const newProperties = rule.properties.filter(p => p.id !== propertyId);
        updateTargetingRule(ruleId, { properties: newProperties });
    };

    const handleCreateEvent = async () => {
        if (!newEventName.trim()) return;

        setIsCreatingEvent(true);
        try {
            await createEvent({
                name: newEventName,
                displayName: newEventName,
                description: newEventDescription,
                source: 'custom',
                category: 'user_interaction'
            });
            toast.success('Event created successfully');
            setIsCreateEventOpen(false);
            setNewEventName('');
            setNewEventDescription('');
        } catch (error) {
            toast.error('Failed to create event');
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const handleCreateProperty = async () => {
        if (!newPropertyName.trim()) return;

        setIsCreatingProperty(true);
        try {
            await createProperty({
                name: newPropertyName,
                displayName: newPropertyName,
                description: newPropertyDescription,
                type: newPropertyType,
                isPrivate: false
            });
            toast.success('Property created successfully');
            setIsCreatePropertyOpen(false);
            setNewPropertyName('');
            setNewPropertyDescription('');

            // If we were adding to a rule, we could auto-select it here, 
            // but for now just closing the dialog is enough as the list will update
        } catch (error) {
            toast.error('Failed to create property');
        } finally {
            setIsCreatingProperty(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">

                {rules.length === 0 ? (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        No trigger events defined. Campaign will trigger on App Open by default.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rules.map((rule, index) => (
                            <div key={rule.id} className="flex items-center gap-3">
                                {index > 0 && (
                                    <span className="text-xs font-bold text-muted-foreground bg-gray-200 px-2 py-1 rounded">OR</span>
                                )}

                                <div className="flex-1 bg-white p-3 rounded border shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-700">When user does</span>

                                        {/* Event Selector */}
                                        <Select
                                            value={rule.event}
                                            onValueChange={(val) => {
                                                if (val === '__create_new__') {
                                                    setIsCreateEventOpen(true);
                                                } else {
                                                    updateTargetingRule(rule.id, { event: val });
                                                    updateTrigger(val); // ✅ FIX: Update main trigger
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[200px] h-9">
                                                <SelectValue placeholder="Select event" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingMetadata ? (
                                                    <div className="p-2 text-xs text-center text-muted-foreground">Loading events...</div>
                                                ) : (
                                                    <>
                                                        {Array.isArray(availableEvents) && availableEvents.map((event) => (
                                                            <SelectItem key={event._id} value={event.name}>
                                                                {event.displayName || event.name}
                                                            </SelectItem>
                                                        ))}
                                                        <div className="p-1 border-t mt-1">
                                                            <div
                                                                className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100 rounded text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setIsCreateEventOpen(true);
                                                                }}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Create New Event
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <span className="text-sm text-gray-500">at least</span>

                                        {/* Count Input */}
                                        <Input
                                            type="number"
                                            className="w-20 h-9"
                                            min={1}
                                            value={rule.count}
                                            onChange={(e) => updateTargetingRule(rule.id, { count: parseInt(e.target.value) || 1 })}
                                        />

                                        <span className="text-sm text-gray-500">time(s)</span>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="ml-auto h-8 w-8 text-muted-foreground hover:text-red-500"
                                            onClick={() => deleteTargetingRule(rule.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Property Filters */}
                                    <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                                        {rule.properties?.map((prop) => (
                                            <div key={prop.id} className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-10">where</span>

                                                {/* Property Selector */}
                                                <Select
                                                    value={prop.field}
                                                    onValueChange={(val) => {
                                                        if (val === '__create_new__') {
                                                            setActiveRuleIdForProperty(rule.id);
                                                            setIsCreatePropertyOpen(true);
                                                        } else {
                                                            updatePropertyFilter(rule.id, prop.id, { field: val });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[180px] h-8 text-sm">
                                                        <SelectValue placeholder="Select property" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(() => {
                                                            // Find the selected event definition
                                                            const selectedEventDef = availableEvents?.find(e => e.name === rule.event);
                                                            // Use event's properties if available, otherwise fallback to all (or empty)
                                                            const eventProperties = selectedEventDef?.properties || [];

                                                            return eventProperties.length > 0 ? (
                                                                eventProperties.map((p: any) => (
                                                                    <SelectItem key={p._id || p.id} value={p.name}>
                                                                        {p.displayName || p.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-xs text-muted-foreground text-center">
                                                                    No properties defined for this event.
                                                                </div>
                                                            );
                                                        })()}

                                                        <div className="p-1 border-t mt-1">
                                                            <div
                                                                className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100 rounded text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setActiveRuleIdForProperty(rule.id);
                                                                    setIsCreatePropertyOpen(true);
                                                                }}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Create New Property
                                                            </div>
                                                        </div>
                                                    </SelectContent>
                                                </Select>

                                                {/* Operator Selector */}
                                                <Select
                                                    value={prop.operator}
                                                    onValueChange={(val) => updatePropertyFilter(rule.id, prop.id, { operator: val })}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 text-sm">
                                                        <SelectValue placeholder="Operator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="equals">equals</SelectItem>
                                                        <SelectItem value="not_equals">does not equal</SelectItem>
                                                        <SelectItem value="contains">contains</SelectItem>
                                                        <SelectItem value="greater_than">greater than</SelectItem>
                                                        <SelectItem value="less_than">less than</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {/* Value Input */}
                                                <Input
                                                    className="w-[150px] h-8 text-sm"
                                                    placeholder="Value"
                                                    value={String(prop.value)}
                                                    onChange={(e) => updatePropertyFilter(rule.id, prop.id, { value: e.target.value })}
                                                />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => removePropertyFilter(rule.id, prop.id)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-primary hover:bg-primary/10"
                                            onClick={() => handleAddPropertyFilter(rule.id)}
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Add Property Filter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={handleAddRule} className="text-primary hover:text-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event Trigger
                    </Button>
                </div>

                {/* Create Event Dialog */}
                <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>
                                Define a new event to track in your application.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventName">Event Name</Label>
                                <Input
                                    id="eventName"
                                    placeholder="e.g., checkout_completed"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Unique identifier (snake_case recommended).</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventDesc">Description</Label>
                                <Input
                                    id="eventDesc"
                                    placeholder="When a user completes a purchase"
                                    value={newEventDescription}
                                    onChange={(e) => setNewEventDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateEvent} disabled={isCreatingEvent || !newEventName}>
                                {isCreatingEvent && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Event
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Property Dialog */}
                <Dialog open={isCreatePropertyOpen} onOpenChange={setIsCreatePropertyOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Property</DialogTitle>
                            <DialogDescription>
                                Define a new property to use in your filters.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="propName">Property Name</Label>
                                <Input
                                    id="propName"
                                    placeholder="e.g., cart_value"
                                    value={newPropertyName}
                                    onChange={(e) => setNewPropertyName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="propType">Type</Label>
                                <Select value={newPropertyType} onValueChange={(val: any) => setNewPropertyType(val)}>
                                    <SelectTrigger id="propType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="propDesc">Description</Label>
                                <Input
                                    id="propDesc"
                                    placeholder="Total value of items in cart"
                                    value={newPropertyDescription}
                                    onChange={(e) => setNewPropertyDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreatePropertyOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateProperty} disabled={isCreatingProperty || !newPropertyName}>
                                {isCreatingProperty && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Property
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
