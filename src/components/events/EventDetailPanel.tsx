import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Calendar, Code, Database, FileJson, Tag, Trash2, X, Plus, List, Search, Loader2, Clock } from 'lucide-react';
import { theme } from '../../styles/design-tokens';

import { metadataService, EventDefinition, PropertyDefinition } from '@/services/metadataService';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { toast } from 'sonner';

interface EventDetailPanelProps {
    event: EventDefinition | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEventUpdated?: (event: EventDefinition) => void;
}

const EventDetailPanel: React.FC<EventDetailPanelProps> = ({ event, open, onOpenChange, onEventUpdated }) => {
    const [recentEvents, setRecentEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uniqueProperties, setUniqueProperties] = useState<string[]>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyDefinition[]>([]);
    const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

    // Property Creation State
    const [isCreatePropertyOpen, setIsCreatePropertyOpen] = useState(false);
    const [newPropertyName, setNewPropertyName] = useState('');
    const [newPropertyType, setNewPropertyType] = useState<'string' | 'number' | 'boolean'>('string');
    const [newPropertyDescription, setNewPropertyDescription] = useState('');
    const [isCreatingProperty, setIsCreatingProperty] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (event && open) {
                setLoading(true);
                try {
                    // Fetch recent events of this type to infer properties
                    // Temporary workaround until api.ts update:
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://localhost:4000/v1/admin/analytics/events?limit=50&type=${encodeURIComponent(event.name)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    const filteredEvents = data.events || [];

                    setRecentEvents(filteredEvents);

                    // Extract unique property keys
                    const keys = new Set<string>();
                    filteredEvents.forEach((e: any) => {
                        if (e.metadata) {
                            Object.keys(e.metadata).forEach(k => keys.add(k));
                        }
                        if (e.properties) {
                            Object.keys(e.properties).forEach(k => keys.add(k));
                        }
                    });
                    setUniqueProperties(Array.from(keys));

                } catch (error) {
                    console.error('Failed to fetch event details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchEventDetails();
    }, [event, open]);

    useEffect(() => {
        const fetchProperties = async () => {
            if (open) {
                try {
                    const props = await metadataService.getProperties();
                    setAvailableProperties(props);
                } catch (error) {
                    console.error('Failed to fetch properties:', error);
                }
            }
        };
        fetchProperties();
    }, [open]);

    const handleAddProperty = async (property: PropertyDefinition) => {
        if (!event) return;
        try {
            const currentPropertyIds = event.properties?.map(p => p._id) || [];
            const updatedEvent = await metadataService.updateEvent(event._id, {
                properties: [...currentPropertyIds, property._id]
            });
            if (onEventUpdated) {
                onEventUpdated(updatedEvent);
            }
            setIsAddPropertyOpen(false);
            toast.success('Property added to event');
        } catch (error) {
            console.error('Failed to add property:', error);
            toast.error('Failed to add property');
        }
    };

    const handleRemoveProperty = async (propertyId: string) => {
        if (!event) return;
        try {
            const currentPropertyIds = event.properties?.map(p => p._id) || [];
            const updatedEvent = await metadataService.updateEvent(event._id, {
                properties: currentPropertyIds.filter(id => id !== propertyId)
            });
            if (onEventUpdated) {
                onEventUpdated(updatedEvent);
            }
            toast.success('Property removed from event');
        } catch (error) {
            console.error('Failed to remove property:', error);
            toast.error('Failed to remove property');
        }
    };

    const handleCreateProperty = async () => {
        if (!newPropertyName.trim() || !event) return;

        setIsCreatingProperty(true);
        try {
            const newProperty = await metadataService.createProperty({
                name: newPropertyName,
                displayName: newPropertyName,
                description: newPropertyDescription,
                type: newPropertyType,
                isPrivate: false,
                organization_id: event.organization_id
            });

            // Auto-link the new property to the event
            await handleAddProperty(newProperty);

            toast.success('Property created and linked successfully');
            setIsCreatePropertyOpen(false);
            setNewPropertyName('');
            setNewPropertyDescription('');

            // Refresh available properties
            const props = await metadataService.getProperties();
            setAvailableProperties(props);
        } catch (error) {
            console.error('Failed to create property:', error);
            toast.error('Failed to create property');
        } finally {
            setIsCreatingProperty(false);
        }
    };

    if (!event) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[600px] p-0 bg-gray-50">
                <div className="bg-white p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{event.displayName || event.name}</h2>
                            <p className="text-sm text-gray-500">{event.name}</p>
                        </div>
                    </div>
                    {event.description && (
                        <p className="mt-4 text-sm text-gray-600">{event.description}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <Badge variant="outline">{event.source}</Badge>
                        <Badge variant="outline">{event.category}</Badge>
                        <Badge variant="outline">v{event.version}</Badge>
                        <Badge variant="outline" className={event.isActive ? "text-green-600 bg-green-50" : "text-gray-500"}>
                            {event.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    {/* Full Metadata View */}
                    <div className="mt-6 pt-4 border-t">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Metadata</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-gray-600">
                            <div className="flex justify-between">
                                <span className="text-gray-400">_id:</span>
                                <span>{event._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">organization_id:</span>
                                <span>{event.organization_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">createdAt:</span>
                                <span>{new Date(event.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">updatedAt:</span>
                                <span>{new Date(event.updatedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">validationLevel:</span>
                                <span>{event.validationLevel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">isDeprecated:</span>
                                <span>{String(event.isDeprecated)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollArea className="h-[calc(100vh-100px)] p-6">
                    <div className="space-y-8">
                        {/* Schema / Properties Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Code size={16} />
                                Event Schema
                            </h3>
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                {event.jsonSchema && Object.keys(event.jsonSchema).length > 0 ? (
                                    <pre className="text-xs text-gray-600 font-mono overflow-x-auto">
                                        {JSON.stringify(event.jsonSchema, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 italic mb-2">No schema defined.</p>
                                        <p className="text-xs text-muted-foreground">Schemas are automatically generated when events are ingested from the SDK.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Linked Properties Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <List size={16} />
                                    Defined Properties
                                </h3>
                                <Popover open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                            <Plus size={14} />
                                            Add Property
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="end">
                                        <Command>
                                            <CommandInput placeholder="Search properties..." />
                                            <CommandEmpty>No properties found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableProperties
                                                    .filter(p => !event.properties?.some(ep => ep._id === p._id))
                                                    .map((property) => (
                                                        <CommandItem
                                                            key={property._id}
                                                            onSelect={() => handleAddProperty(property)}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{property.displayName || property.name}</span>
                                                                <span className="text-xs text-gray-500">{property.type}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                <CommandItem
                                                    onSelect={() => {
                                                        setIsAddPropertyOpen(false);
                                                        setIsCreatePropertyOpen(true);
                                                    }}
                                                    className="cursor-pointer text-primary"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create New Property
                                                </CommandItem>
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {event.properties && event.properties.length > 0 ? (
                                <div className="space-y-3">
                                    {event.properties.map(prop => (
                                        <div key={prop._id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm group hover:border-purple-200 transition-all">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900">{prop.displayName || prop.name}</span>
                                                <span className="text-xs text-gray-500 font-mono">{prop.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 rounded-full">
                                                    {prop.type}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                    onClick={() => handleRemoveProperty(prop._id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                                    <p className="text-sm text-gray-500 italic">No properties explicitly defined for this event.</p>
                                </div>
                            )}
                        </div>

                        {/* Detected Properties Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Activity size={16} />
                                Detected Properties (from logs)
                            </h3>
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                {uniqueProperties.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueProperties.map(propName => {
                                            const isLinked = event.properties?.some(p => p.name === propName);
                                            if (isLinked) return null; // Skip if already linked

                                            return (
                                                <div key={propName} className="flex items-center gap-1 pl-3 pr-1 py-1 bg-gray-50 border rounded-full group hover:border-purple-200 transition-colors">
                                                    <span className="font-mono text-xs text-gray-700">{propName}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 rounded-full hover:bg-purple-100 hover:text-purple-600"
                                                        onClick={() => {
                                                            setNewPropertyName(propName);
                                                            setNewPropertyDescription(`Automatically detected from event logs.`);
                                                            // Try to infer type from recent events
                                                            const sampleEvent = recentEvents.find(e =>
                                                                (e.metadata && e.metadata[propName] !== undefined) ||
                                                                (e.properties && e.properties[propName] !== undefined)
                                                            );
                                                            if (sampleEvent) {
                                                                const val = (sampleEvent.metadata || {})[propName] || (sampleEvent.properties || {})[propName];
                                                                const inferredType = typeof val;
                                                                if (['string', 'number', 'boolean'].includes(inferredType)) {
                                                                    setNewPropertyType(inferredType as any);
                                                                }
                                                            }
                                                            setIsCreatePropertyOpen(true);
                                                        }}
                                                    >
                                                        <Plus size={12} />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                        {uniqueProperties.every(p => event.properties?.some(ep => ep.name === p)) && (
                                            <p className="text-sm text-gray-500 italic w-full text-center py-2">All detected properties are already linked.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-500 italic">No properties detected in recent events.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Occurrences Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Clock size={16} />
                                Recent Occurrences
                            </h3>
                            <div className="space-y-3">
                                {recentEvents.map((event, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs text-gray-500 font-mono">
                                                {new Date(event.created_at).toLocaleString()}
                                            </div>
                                            <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                User: {event.user_id}
                                            </div>
                                        </div>

                                        {(event.metadata || event.properties) && (
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                                <pre className="text-[10px] text-gray-600 overflow-x-auto font-mono">
                                                    {JSON.stringify(event.metadata || event.properties, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {recentEvents.length === 0 && !loading && (
                                    <p className="text-sm text-gray-500 italic">No recent events found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Create Property Dialog */}
                <Dialog open={isCreatePropertyOpen} onOpenChange={setIsCreatePropertyOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Property</DialogTitle>
                            <DialogDescription>
                                Define a new property and link it to this event.
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
                                    placeholder="Description of the property"
                                    value={newPropertyDescription}
                                    onChange={(e) => setNewPropertyDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreatePropertyOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateProperty} disabled={isCreatingProperty || !newPropertyName}>
                                {isCreatingProperty && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create & Link
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    );
};

export default EventDetailPanel;
