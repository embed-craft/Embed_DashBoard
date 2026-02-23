import React, { useState, useEffect, useMemo } from 'react';
import { theme } from '../styles/design-tokens';
import { toast } from 'sonner';
import { Activity, Radio, Plus, Layers, ShieldCheck, Database } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

// Components
import PageHeader from '../components/layout/PageHeader';
import PageContainer from '../components/layout/PageContainer';
import DataTable, { Column } from '../components/shared/DataTable';
import SearchInput from '../components/shared/SearchInput';
import EventDetailPanel from '@/components/events/EventDetailPanel';
import CreateEventModal from '@/components/events/CreateEventModal';
import { metadataService, EventDefinition } from '@/services/metadataService';

interface EventWithId extends EventDefinition {
    id: string;
}

const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }: any) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.xl,
        padding: '24px',
        border: `1px solid ${theme.colors.border.default}`,
        boxShadow: theme.shadows.sm,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'all 0.2s ease',
    }} className="hover:shadow-md hover:border-gray-300">
        <div className={`p-4 rounded-2xl ${bgColorClass} ${colorClass}`}>
            <Icon size={28} strokeWidth={1.5} />
        </div>
        <div>
            <p style={{ fontSize: '14px', color: theme.colors.text.secondary, fontWeight: 500, marginBottom: '4px' }}>
                {title}
            </p>
            <h3 style={{ fontSize: '28px', fontWeight: 700, color: theme.colors.text.primary, letterSpacing: '-0.5px' }}>
                {value}
            </h3>
        </div>
    </div>
);

const Events: React.FC = () => {
    const [rawEvents, setRawEvents] = useState<EventWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EventDefinition | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showStats, setShowStats] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowStats(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await metadataService.getEvents();
            const formattedEvents = data.map(event => ({
                ...event,
                id: event._id
            }));
            setRawEvents(formattedEvents as EventWithId[]);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (event: EventDefinition) => {
        try {
            const updatedEvent = await metadataService.updateEvent(event._id, {
                isActive: !event.isActive
            });

            setRawEvents(prev => prev.map(e =>
                e._id === event._id ? { ...e, isActive: updatedEvent.isActive } : e
            ));

            toast.success(`Event ${updatedEvent.isActive ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Failed to toggle event status:', error);
            toast.error('Failed to update event status');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Memoize Data Deduplication
    // Reduces multiple events with the exact same name down to a single instance (taking the latest one by createdAt/updatedAt)
    const deduplicatedEvents = useMemo(() => {
        const map = new Map<string, EventWithId>();
        rawEvents.forEach(event => {
            const existing = map.get(event.name);
            if (!existing) {
                map.set(event.name, event);
            } else {
                // If existing is older than current, replace it with the newer one
                const currentIsNewer = new Date(event.updatedAt || event.createdAt).getTime() > new Date(existing.updatedAt || existing.createdAt).getTime();
                if (currentIsNewer) {
                    map.set(event.name, event);
                }
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [rawEvents]);

    const activeEventCount = deduplicatedEvents.filter(e => e.isActive).length;

    // Filter data by search query
    const filteredData = deduplicatedEvents.filter((row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.displayName && row.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const columns: Column<EventWithId>[] = [
        {
            key: 'name',
            header: 'Event Name',
            width: '35%',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '8px',
                        backgroundColor: theme.colors.gray[100],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: theme.colors.gray[600]
                    }}>
                        <Activity size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.gray[900] }}>
                            {row.displayName || row.name}
                        </span>
                        <span style={{ fontSize: '12px', color: theme.colors.gray[500], fontFamily: 'monospace' }}>
                            {row.name}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'enabled',
            header: 'Tracking Status',
            width: '15%',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Switch
                        checked={row.isActive}
                        onCheckedChange={() => handleToggleStatus(row)}
                        onClick={(e) => e.stopPropagation()}
                        className={row.isActive ? "bg-blue-600" : "bg-gray-200"}
                    />
                    <span
                        style={{ fontSize: '13px', fontWeight: 500 }}
                        className={row.isActive ? "text-blue-600" : "text-gray-500"}
                    >
                        {row.isActive ? 'Active' : 'Paused'}
                    </span>
                </div>
            )
        },
        {
            key: 'propertiesCount',
            header: 'Properties',
            width: '15%',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} className="text-gray-400" />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.text.primary }}>
                        {row.properties?.length || (row.jsonSchema ? Object.keys(row.jsonSchema).length : 0)}
                    </span>
                </div>
            )
        },
        {
            key: 'source',
            header: 'Source',
            width: '15%',
            render: (row) => {
                const isSdk = (row.source as string) === 'sdk_autodetected';
                const isClient = row.source === 'client';
                const SourceBg = isClient || isSdk ? theme.colors.info + '1A' : theme.colors.gray[100];
                const SourceColor = isClient || isSdk ? theme.colors.info : theme.colors.gray[700];
                const SourceBorder = isClient || isSdk ? theme.colors.info + '33' : theme.colors.gray[200];

                return (
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        backgroundColor: SourceBg,
                        color: SourceColor,
                        border: `1px solid ${SourceBorder}`
                    }}>
                        {isSdk ? 'Auto-detected' : row.source || 'Unknown'}
                    </span>
                );
            }
        },
        {
            key: 'category',
            header: 'Category',
            width: '20%',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.colors.gray[400] }} />
                    <span style={{ fontSize: '14px', color: theme.colors.text.secondary, textTransform: 'capitalize' }}>
                        {row.category || 'General'}
                    </span>
                </div>
            )
        }
    ];

    const handleEventClick = (event: any) => {
        setSelectedEvent(event as EventDefinition);
        setIsDetailOpen(true);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Event Library"
                subtitle="Centralized management for all your application tracking events."
            />

            {/* Custom Full Width Container */}
            <div style={{ padding: '32px', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* Auto-Hiding Stats Section */}
                <div style={{ transition: 'all 0.4s ease-in-out' }}>
                    {showStats ? (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                            width: '100%',
                            opacity: 1,
                            transform: 'translateY(0)'
                        }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <StatCard
                                    title="Total Unique Events"
                                    value={deduplicatedEvents.length.toString()}
                                    icon={Layers}
                                    colorClass="text-black"
                                    bgColorClass="bg-gray-100"
                                />
                            </div>
                            <div style={{ flex: '1 1 300px' }}>
                                <StatCard
                                    title="Actively Tracking"
                                    value={activeEventCount.toString()}
                                    icon={Radio}
                                    colorClass="text-blue-600"
                                    bgColorClass="bg-blue-50"
                                />
                            </div>
                            <div style={{ flex: '1 1 300px' }}>
                                <StatCard
                                    title="Strictly Validated"
                                    value={deduplicatedEvents.filter(e => e.validationLevel === 'strict').length.toString()}
                                    icon={ShieldCheck}
                                    colorClass="text-gray-700"
                                    bgColorClass="bg-gray-100"
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setShowStats(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                padding: '12px 24px',
                                backgroundColor: 'white',
                                borderRadius: theme.borderRadius.lg,
                                border: `1px solid ${theme.colors.border.default}`,
                                cursor: 'pointer',
                                width: 'fit-content',
                                boxShadow: theme.shadows.sm
                            }}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>
                                <Layers size={14} /> Total Events: <span style={{ color: theme.colors.text.primary }}>{deduplicatedEvents.length}</span>
                            </div>
                            <div style={{ width: '1px', height: '14px', backgroundColor: theme.colors.border.default }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>
                                <Radio size={14} className="text-blue-600" /> Active: <span style={{ color: theme.colors.text.primary }}>{activeEventCount}</span>
                            </div>
                            <div style={{ width: '1px', height: '14px', backgroundColor: theme.colors.border.default }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: theme.colors.text.secondary }}>
                                <ShieldCheck size={14} /> Validated: <span style={{ color: theme.colors.text.primary }}>{deduplicatedEvents.filter(e => e.validationLevel === 'strict').length}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginLeft: '16px', fontWeight: 500 }}>
                                (Click to expand)
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Container - Expanded Width */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: theme.borderRadius.xl,
                    border: `1px solid ${theme.colors.border.default}`,
                    boxShadow: theme.shadows.sm,
                    overflow: 'hidden',
                    width: '100%' // Ensure full width utilization
                }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: `1px solid ${theme.colors.border.default}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        backgroundColor: theme.colors.white
                    }}>
                        <div style={{ width: '360px' }}>
                            <SearchInput
                                placeholder="Search events by name or display name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        {/* We inject custom styling to the nested DataTable to make it wider and more spacious */}
                        <div style={{ minWidth: '1200px', width: '100%' }}>
                            <DataTable
                                data={filteredData}
                                columns={columns}
                                isLoading={loading}
                                onRowClick={handleEventClick}
                                emptyMessage="No unique events found. Add one to get started."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <EventDetailPanel
                event={selectedEvent}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onEventUpdated={(updatedEvent) => {
                    setRawEvents(prev => prev.map(e => e._id === updatedEvent._id ? { ...updatedEvent, id: updatedEvent._id } : e));
                    setSelectedEvent(updatedEvent);
                }}
            />

            <CreateEventModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchEvents}
            />
        </div>
    );
};

export default Events;
