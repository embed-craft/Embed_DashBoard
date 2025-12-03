import React, { useState, useEffect } from 'react';
import { theme } from '../styles/design-tokens';
import { toast } from 'sonner';
import { Columns, Plus } from 'lucide-react';
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

const Events: React.FC = () => {
    const { eventPreferences, toggleEventStatus, toggleEventGoal } = useStore();
    const [events, setEvents] = useState<EventWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<EventDefinition | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await metadataService.getEvents();
            // Map _id to id for DataTable compatibility
            const formattedEvents = data.map(event => ({
                ...event,
                id: event._id
            }));
            setEvents(formattedEvents as EventWithId[]);
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

            setEvents(prev => prev.map(e =>
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

    // Filter data
    const filteredData = events.filter((row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<EventWithId>[] = [
        {
            key: 'enabled',
            header: 'ON/OFF',
            width: '80px',
            render: (row) => (
                <Switch
                    checked={row.isActive}
                    onCheckedChange={() => handleToggleStatus(row)}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        },
        {
            key: 'name',
            header: 'Name',
            width: '25%',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.displayName || row.name}</span>
                    <span className="text-xs text-gray-500">{row.name}</span>
                </div>
            )
        },
        {
            key: 'propertiesCount',
            header: 'Properties',
            width: '15%',
            render: (row) => (
                <span className="text-sm font-medium text-purple-600">
                    {row.properties?.length || (row.jsonSchema ? Object.keys(row.jsonSchema).length : 0)}
                </span>
            )
        },
        {
            key: 'source',
            header: 'Source',
            width: '15%',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.source === 'client' ? 'bg-blue-100 text-blue-700' :
                    row.source === 'server' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {row.source}
                </span>
            )
        },
        {
            key: 'category',
            header: 'Category',
            width: '15%',
            render: (row) => (
                <span className="text-sm text-gray-600 capitalize">{row.category}</span>
            )
        },
        {
            key: 'version',
            header: 'Version',
            width: '10%',
            render: (row) => (
                <span className="text-sm text-gray-500">v{row.version}</span>
            )
        },
        {
            key: 'validationLevel',
            header: 'Validation',
            width: '15%',
            render: (row) => (
                <span className={`text-xs font-medium ${row.validationLevel === 'strict' ? 'text-red-600' :
                    row.validationLevel === 'lax' ? 'text-yellow-600' :
                        'text-gray-500'
                    }`}>
                    {row.validationLevel.toUpperCase()}
                </span>
            )
        }
    ];

    const handleEventClick = (event: EventDefinition) => {
        setSelectedEvent(event);
        setIsDetailOpen(true);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Events"
                subtitle="Manage your application events"
                actions={null}
            />

            <PageContainer>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: theme.borderRadius.lg,
                    border: `1px solid ${theme.colors.border.default}`,
                    boxShadow: theme.shadows.sm,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${theme.colors.border.default}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ width: '300px' }}>
                            <SearchInput
                                placeholder="Search Event..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ flex: 1 }} />

                        <Button variant="ghost" className="gap-2 text-gray-500">
                            <Columns size={14} />
                            Toggle Columns
                        </Button>
                    </div>

                    <DataTable
                        data={filteredData}
                        columns={columns}
                        isLoading={loading}
                        onRowClick={handleEventClick}
                        emptyMessage="No events recorded yet."
                    />
                </div>
            </PageContainer>

            <EventDetailPanel
                event={selectedEvent}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onEventUpdated={(updatedEvent) => {
                    setEvents(prev => prev.map(e => e._id === updatedEvent._id ? { ...updatedEvent, id: updatedEvent._id } : e));
                    setSelectedEvent({ ...updatedEvent, id: updatedEvent._id });
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
