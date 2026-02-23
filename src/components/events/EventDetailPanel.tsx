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




    if (!event) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[90vw] sm:w-[45vw] sm:max-w-none p-0 bg-gray-50 flex flex-col h-full">
                <div className="bg-white p-6 border-b z-10 shadow-sm relative">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{event.displayName || event.name}</h2>
                            <p className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded w-fit border border-gray-100">{event.name}</p>
                        </div>
                    </div>
                    {event.description && (
                        <p className="mt-4 text-[15px] leading-relaxed text-gray-600">{event.description}</p>
                    )}
                    <div className="flex gap-2 mt-5">
                        <Badge variant="outline" className="px-3 py-1 font-medium bg-gray-50 text-gray-700">{event.source === 'sdk_autodetected' ? 'Auto-detected' : event.source}</Badge>
                        <Badge variant="outline" className="px-3 py-1 font-medium bg-gray-50 text-gray-700 capitalize">{event.category || 'General'}</Badge>
                        <Badge variant="outline" className="px-3 py-1 font-medium bg-gray-50 text-gray-700 font-mono">v{event.version}</Badge>
                        <Badge variant="outline" className={`px-3 py-1 font-medium ${event.isActive ? "text-blue-700 bg-blue-50 border-blue-200" : "text-gray-500 bg-gray-50"}`}>
                            {event.isActive ? 'Tracking Active' : 'Tracking Paused'}
                        </Badge>
                    </div>

                    {/* Full Metadata View */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">System Identity</h4>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[13px] text-gray-600">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Event ID</span>
                                <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">{event._id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Organization ID</span>
                                <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">{event.organization_id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Created At</span>
                                <span className="font-medium text-gray-900">{new Date(event.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Last Updated</span>
                                <span className="font-medium text-gray-900">{new Date(event.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8 pb-10">
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


                    </div>
                </ScrollArea>


            </SheetContent>
        </Sheet>
    );
};

export default EventDetailPanel;
