import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Copy,
    Calendar,
    Clock,
    ChevronRight,
    User,
    Activity,
    Smartphone,
    MapPin,
    Mail
} from 'lucide-react';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 20;

    React.useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const api = await import('@/lib/api');
                const offset = (page - 1) * LIMIT;
                const data = await api.apiClient.getUser(id, LIMIT, offset);

                // Format User Data
                const formattedUser = {
                    id: data.user.user_id,
                    name: data.user.name || 'Anonymous',
                    email: data.user.email || 'No Email',
                    avatar: data.user.avatar || '',
                    location: data.user.properties?.location || data.user.location || 'Unknown Location',
                    segments: data.user.segments || [],
                    properties: {
                        ...data.user.properties,
                        'Last Seen': new Date(data.user.last_seen).toLocaleString(),
                        'Total Sessions': data.user.sessions_count || 0,
                        'Device': typeof data.user.device === 'object' ? (data.user.device.model || data.user.device.platform) : (data.user.device || 'Unknown')
                    }
                };
                setUser(formattedUser);

                // Format Events Data (Group by Date)
                const groupedEvents = data.events.reduce((acc: any, event: any) => {
                    const date = new Date(event.timestamp).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    if (!acc[date]) {
                        acc[date] = [];
                    }

                    acc[date].push({
                        id: event._id,
                        name: event.event_type,
                        time: new Date(event.timestamp).toLocaleTimeString(),
                        properties: event.metadata || {}
                    });
                    return acc;
                }, {});

                const formattedEvents = Object.keys(groupedEvents).map(date => ({
                    date,
                    items: groupedEvents[date]
                }));

                setEvents(formattedEvents);
                if (data.totalEvents) {
                    setTotalPages(Math.ceil(data.totalEvents / LIMIT));
                }
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, page]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
                    <Button variant="link" onClick={() => navigate('/users')}>Go back to users</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50], display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: `1px solid ${theme.colors.border.default}`,
                padding: '16px 24px',
            }}>
                <Button
                    variant="ghost"
                    className="gap-2 text-gray-500 mb-4 pl-0 hover:bg-transparent hover:text-gray-900"
                    onClick={() => navigate('/users')}
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>

                <div className="flex items-start gap-6">
                    <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {user.avatar ? <img src={user.avatar} alt="avatar" className="rounded-full" /> : ':)'}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Mail size={14} />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {user.location}
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
                                <span className="font-mono">{user.id}</span>
                                <Copy size={12} className="cursor-pointer hover:text-gray-900" />
                            </div>
                        </div>
                    </div>

                    <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-gray-400">Last Active</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                            <Clock size={14} />
                            {user.properties['Last Seen']}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <Tabs defaultValue="events" className="w-full flex-1 flex flex-col">
                        <div className="px-6 border-b border-gray-200">
                            <TabsList className="bg-transparent w-full justify-start h-auto p-0 rounded-none">
                                <TabsTrigger
                                    value="properties"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-3 text-sm font-medium text-gray-500"
                                >
                                    Properties
                                </TabsTrigger>
                                <TabsTrigger
                                    value="events"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-3 text-sm font-medium text-gray-500"
                                >
                                    Events
                                </TabsTrigger>
                                <TabsTrigger
                                    value="segments"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-3 text-sm font-medium text-gray-500"
                                >
                                    Segments
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="properties" className="flex-1 p-6 m-0 overflow-auto">
                            <div className="grid grid-cols-2 gap-6 max-w-4xl">
                                {Object.entries(user.properties).map(([key, value]) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                        <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                                        <Separator className="mt-2" />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="segments" className="flex-1 p-6 m-0 overflow-auto">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900">Active Segments</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.segments && user.segments.length > 0 ? (
                                        user.segments.map((segment: string) => (
                                            <Badge key={segment} variant="secondary" className="px-3 py-1 text-sm">
                                                {segment}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No active segments</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="events" className="flex-1 m-0 flex overflow-hidden">
                            {/* Timeline */}
                            <div className="flex-1 overflow-auto border-r border-gray-200 flex flex-col">
                                <div className="flex-1 overflow-auto">
                                    <div className="grid grid-cols-[1fr_200px] border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                                        <div className="px-6 py-3">Events</div>
                                        <div className="px-6 py-3">Date and Time</div>
                                    </div>

                                    {events.map((group, groupIndex) => (
                                        <div key={groupIndex}>
                                            <div className="px-6 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100 flex items-center gap-2 sticky top-[37px] z-10">
                                                <Calendar size={12} />
                                                {group.date}
                                            </div>
                                            {group.items.map((event, eventIndex) => (
                                                <div
                                                    key={event.id}
                                                    className={`grid grid-cols-[1fr_200px] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEvent?.id === event.id ? 'bg-purple-50' : ''}`}
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <div className="px-6 py-4 flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full ${event.name.includes('view') ? 'bg-blue-500' :
                                                            event.name.includes('click') ? 'bg-amber-500' :
                                                                event.name.includes('conversion') ? 'bg-green-500' : 'bg-gray-300'
                                                            }`} />
                                                        <span className="text-sm font-medium text-gray-900">{event.name}</span>
                                                    </div>
                                                    <div className="px-6 py-4 text-sm text-gray-500">
                                                        {event.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
                                    <div className="text-sm text-gray-500">
                                        Page {page} of {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1 || loading}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Event Details Panel */}
                            <div className="w-[400px] bg-white flex flex-col border-l border-gray-200">
                                <div className="p-4 border-b border-gray-200 font-medium text-sm text-gray-900">
                                    Event details
                                </div>
                                {selectedEvent ? (
                                    <div className="p-6">
                                        <div className="mb-6">
                                            <div className="text-sm text-gray-500 mb-1">Event Name</div>
                                            <div className="text-lg font-medium text-gray-900">{selectedEvent.name}</div>
                                        </div>

                                        <div className="space-y-4">
                                            {Object.entries(selectedEvent.properties).map(([key, value]) => (
                                                <div key={key}>
                                                    <div className="text-xs text-gray-500 mb-1 capitalize">{key}</div>
                                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100">
                                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                        Select an event to view details
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
