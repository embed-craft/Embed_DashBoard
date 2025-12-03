import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    User,
    Activity,
    Tags,
    Clock,
    MapPin,
    Smartphone,
    Mail
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';

interface UserDetailPanelProps {
    user: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ user, open, onOpenChange }) => {
    const [userDetails, setUserDetails] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchDetails = async () => {
            if (user?.id && open) {
                setLoading(true);
                try {
                    const api = await import('@/lib/api');
                    const data = await api.apiClient.getUser(user.id);
                    setUserDetails({ ...user, ...data.user, events: data.events });
                } catch (error) {
                    console.error('Failed to fetch user details:', error);
                    setUserDetails(user);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDetails();
    }, [user, open]);

    if (!user) return null;

    const displayUser = userDetails || user;

    // Fallback/Mock data for missing fields
    const finalUser = {
        ...displayUser,
        avatar: displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name || 'User')}&background=random`,
        location: displayUser.location || displayUser.properties?.location || 'Unknown Location',
        device: typeof displayUser.device === 'object' ? (displayUser.device.model || displayUser.device.platform) : (displayUser.device || 'Unknown Device'),
        lastSeen: displayUser.lastActive || displayUser.last_seen ? new Date(displayUser.lastActive || displayUser.last_seen).toLocaleDateString() : 'Recently',
        segments: displayUser.segments || [],
        properties: displayUser.properties || {},
        events: (displayUser.events || []).map((e: any) => ({
            name: e.event_type || e.action || 'Unknown Event',
            time: new Date(e.created_at || e.timestamp).toLocaleString(),
            type: (e.event_type || '').includes('view') ? 'view' :
                (e.event_type || '').includes('click') ? 'click' :
                    (e.event_type || '').includes('conversion') ? 'conversion' : 'other',
            metadata: e.metadata || e.properties || {}
        }))
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 bg-gray-50">
                {/* Header Profile Section */}
                <div className="bg-white p-6 border-b">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                            <AvatarImage src={finalUser.avatar} />
                            <AvatarFallback>{finalUser.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{finalUser.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Mail size={14} />
                                {finalUser.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                {finalUser.location}
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Online
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="activity" className="w-full h-[calc(100vh-140px)] flex flex-col">
                    <div className="bg-white px-6 border-b">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                            <TabsTrigger
                                value="activity"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Activity
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="segments"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Segments
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="activity" className="mt-0 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity size={16} />
                                    Recent Activity
                                </h3>
                                <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                                    {displayUser.events.length > 0 ? (
                                        displayUser.events.map((event: any, i: number) => (
                                            <div key={i} className="relative group">
                                                <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${event.type === 'conversion' ? 'bg-green-500' :
                                                    event.type === 'view' ? 'bg-blue-500' :
                                                        event.type === 'click' ? 'bg-amber-500' : 'bg-gray-400'
                                                    }`} />

                                                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{event.name}</p>
                                                            <p className="text-xs text-gray-500">{event.time}</p>
                                                        </div>
                                                        {event.type && (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5 uppercase tracking-wider">
                                                                {event.type}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Expandable Details */}
                                                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                        <details className="text-xs group/details">
                                                            <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium select-none list-none flex items-center gap-1">
                                                                <span className="group-open/details:hidden">Show Details</span>
                                                                <span className="hidden group-open/details:inline">Hide Details</span>
                                                            </summary>
                                                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 font-mono text-gray-600 overflow-x-auto">
                                                                <pre className="whitespace-pre-wrap break-all">
                                                                    {JSON.stringify(event.metadata, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="profile" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Device</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Smartphone size={14} className="text-gray-400" />
                                        {displayUser.device}
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        {displayUser.lastSeen}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">User Properties</h3>
                                <div className="bg-white rounded-lg border shadow-sm divide-y">
                                    {Object.entries(displayUser.properties).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3">
                                            <span className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-sm font-medium font-mono">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="segments" className="mt-0">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Tags size={16} />
                                    Active Segments
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser.segments.length > 0 ? (
                                        displayUser.segments.map((segment: string) => (
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
                    </ScrollArea>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
};

export default UserDetailPanel;
