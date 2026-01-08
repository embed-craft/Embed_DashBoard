
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Download,
    Users,
    MousePointer,
    Eye,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    RefreshCw,
    Smartphone,
    Monitor,
    Tablet,
    Clock,
    Zap,
    Activity,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import { format, subDays, parseISO, getHours, getDay, isWithinInterval } from 'date-fns';
import { theme } from '@/styles/design-tokens';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from 'recharts';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- Types ---
type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};

// --- Helper Functions ---

const processEvents = (events: any[], campaignId: string, dateRange: DateRange) => {
    // Filter events by Campaign ID (metadata.campaignId or properties.campaignId) 
    // and Date Range
    const filteredEvents = events.filter(e => {
        const eventTime = new Date(e.createdAt || e.timestamp);
        const inDateRange = dateRange.from && (!dateRange.to || isWithinInterval(eventTime, { start: dateRange.from, end: dateRange.to }));

        // Check if event belongs to this campaign
        // Check multiple possible locations for campaign ID
        const matchesCampaign =
            e.nudge_id === campaignId ||
            e.campaignId === campaignId ||
            e.metadata?.campaignId === campaignId ||
            e.metadata?.nudgeId === campaignId ||
            (e.action && e.action.includes('NINJA') && e.metadata?.CAMPAIGN_ID === campaignId);

        return inDateRange && matchesCampaign;
    });

    return filteredEvents;
};

const aggregateTrend = (events: any[], dateRange: DateRange) => {
    if (!dateRange.from) return [];

    const days = new Map<string, { date: string, impressions: number, clicks: number }>();

    // Initialize days
    const start = new Date(dateRange.from);
    const end = dateRange.to || new Date();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = format(d, 'yyyy-MM-dd');
        days.set(key, { date: format(d, 'MMM dd'), impressions: 0, clicks: 0 });
    }

    events.forEach(e => {
        const dateKey = format(new Date(e.createdAt || e.timestamp), 'yyyy-MM-dd');
        if (days.has(dateKey)) {
            const dayStats = days.get(dateKey)!;
            const action = (e.action || '').toLowerCase();
            if (action === 'impression' || action === 'campaign_impression' || action === 'ninja_experience_open' || action.includes('impression')) {
                dayStats.impressions++;
            } else if (action === 'click' || action === 'campaign_clicked' || action === 'ninja_component_cta_click' || action.includes('click')) {
                dayStats.clicks++;
            }
        }
    });

    return Array.from(days.values());
};

const aggregateFunnel = (events: any[]) => {
    let impressions = 0;
    let clicks = 0;
    let conversions = 0; // Assuming specific conversion event or inferred

    events.forEach(e => {
        const action = (e.action || '').toLowerCase();
        if (action === 'impression' || action === 'campaign_impression' || action === 'ninja_experience_open' || action.includes('impression')) impressions++;
        if (action === 'click' || action === 'campaign_clicked' || action === 'ninja_component_cta_click' || action.includes('click')) clicks++;
        if (action === 'conversion' || action === 'campaign_conversion' || action === 'ninja_conversion') conversions++;
    });

    // If no explicit conversions, maybe mock strictly based on clicks for now or hide
    // But strictly speaking, funnel is useful even with just Imp -> Click
    return [
        { name: 'Impressions', value: impressions, fill: '#8884d8' },
        { name: 'Clicks', value: clicks, fill: '#ffc658' },
        { name: 'Conversions', value: conversions, fill: '#82ca9d' },
    ];
};

const aggregateHeatmap = (events: any[]) => {
    const map = new Map<string, number>();

    events.forEach(e => {
        const d = new Date(e.createdAt || e.timestamp);
        // Recharts needs specific day/hour keys
        const dayStr = format(d, 'EEE'); // Mon, Tue...
        const hour = getHours(d);
        const key = `${dayStr}-${hour}`;
        map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from({ length: 7 }, (_, dayIndex) => {
        const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex];
        return Array.from({ length: 24 }, (_, hourIndex) => ({
            day: dayName,
            hour: hourIndex,
            value: map.get(`${dayName}-${hourIndex}`) || 0
        }));
    }).flat();
};


const MetricCard = ({ title, value, change, icon: Icon, subtext, trend }: any) => {
    const isPositive = change >= 0;
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {title}
                        </span>
                        <div className="text-2xl font-bold tracking-tight">{value}</div>
                    </div>
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                        isPositive ? "text-green-700 bg-green-50" : "text-gray-700 bg-gray-50"
                    )}>
                        {/* Dynamic change indication requires Comparison period data which we might not have efficiently */}
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    );
};

// Funnel Chart Component
const FunnelViz = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map((d: any) => d.value)) || 1;

    return (
        <div className="space-y-6 py-4">
            {data.map((step: any, index: number) => {
                const prevValue = index > 0 ? data[index - 1].value : step.value;
                const conversionRate = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(1) : '0.0';
                const totalRate = data[0].value > 0 ? ((step.value / data[0].value) * 100).toFixed(1) : '0.0';

                return (
                    <div key={step.name} className="relative group">
                        {index > 0 && (
                            <div className="absolute left-[8px] -top-4 h-4 w-0.5 bg-gray-200" />
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-sm font-medium text-gray-600 flex justify-between">
                                <span>{step.name}</span>
                                {index > 0 && (
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 rounded">{conversionRate}% conv.</span>
                                )}
                            </div>
                            <div className="flex-1 h-12 bg-gray-50 rounded-r-lg relative overflow-hidden flex items-center group-hover:bg-gray-100 transition-colors">
                                <div
                                    className="h-full rounded-r-lg transition-all duration-500 ease-out flex items-center px-3"
                                    style={{ width: `${(step.value / maxValue) * 100}%`, backgroundColor: `${step.fill}20`, borderLeft: `4px solid ${step.fill}` }}
                                >
                                    <span className="text-sm font-bold text-gray-900">{step.value.toLocaleString()}</span>
                                </div>
                                <div className="ml-auto pr-4 text-xs text-gray-400">
                                    {totalRate}% of total
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Heatmap Component
const ActivityHeatmap = ({ data }: { data: any[] }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getColor = (value: number) => {
        if (value === 0) return 'bg-gray-50';
        if (value < 2) return 'bg-blue-100';
        if (value < 5) return 'bg-blue-200';
        if (value < 10) return 'bg-blue-300';
        if (value < 20) return 'bg-blue-400';
        return 'bg-blue-500';
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="flex">
                    <div className="w-12"></div>
                    <div className="flex-1 grid grid-cols-24 gap-1 mb-2">
                        {hours.filter(h => h % 3 === 0).map(h => (
                            <div key={h} className="text-[10px] text-gray-400 col-span-3 text-left pl-1">{h}:00</div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    {days.map((day) => (
                        <div key={day} className="flex items-center gap-1">
                            <div className="w-12 text-xs font-medium text-gray-500">{day}</div>
                            <div className="flex-1 grid grid-cols-24 gap-1">
                                {hours.map((hour) => {
                                    const cell = data.find(d => d.day === day && d.hour === hour) || { value: 0 };
                                    return (
                                        <div
                                            key={`${day}-${hour}`}
                                            title={`${day} ${hour}:00 - ${cell.value} events`}
                                            className={cn("h-6 w-full rounded-sm hover:ring-2 ring-offset-1 ring-primary/50 transition-all cursor-pointer relative group", getColor(cell.value))}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const CampaignReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Fetch Campaign
    const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
        queryKey: ['campaign', id],
        queryFn: () => apiClient.getCampaign(id!),
        enabled: !!id,
    });

    // Fetch Real Stats (Totals)
    // Fetch Real Stats (Totals)
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['campaign-stats', id],
        queryFn: () => apiClient.getCampaignStats(id!),
        enabled: !!id,
    });

    // Fetch Real Events (For Dynamic Charts)
    const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
        queryKey: ['events-list', id],
        queryFn: async () => {
            try {
                return await apiClient.listEvents(1000);
            } catch (err) {
                console.warn("Analytics API unavailable:", err);
                return { events: [] };
            }
        },
        enabled: !!id,
    });

    const isLoading = isLoadingCampaign || isLoadingStats || isLoadingEvents;

    // --- Dynamic Data Transformation ---
    const { processedTrend, processedHeatmap, processedFunnel, filteredEvents } = useMemo(() => {
        if (!eventsData?.events || !date || !date.from) {
            return { processedTrend: [], processedHeatmap: [], processedFunnel: [], filteredEvents: [] };
        }

        const relevantEvents = processEvents(eventsData.events, id!, date);

        return {
            processedTrend: aggregateTrend(relevantEvents, date),
            processedHeatmap: aggregateHeatmap(relevantEvents),
            processedFunnel: aggregateFunnel(relevantEvents),
            filteredEvents: relevantEvents
        };
    }, [eventsData, id, date]);


    if (isLoading) return <PageContainer><div>Loading report...</div></PageContainer>;
    if (!campaign) return <div>Campaign not found</div>;

    const totalImpressions = statsData?.stats?.impressions || 0;
    const totalClicks = statsData?.stats?.clicks || 0;
    const ctr = statsData?.stats?.ctr || 0;

    return (
        <div className="min-h-screen bg-neutral-50/50 space-y-8 pb-10">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => navigate('/campaigns')}>
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-base font-semibold flex items-center gap-2">
                                {campaign.name}
                                <Badge variant="outline" className={cn(
                                    "ml-2 text-[10px] h-5 px-1.5 font-normal",
                                    campaign.status === 'active' ? "border-green-200 text-green-700 bg-green-50" : "text-gray-500"
                                )}>
                                    {campaign.status}
                                </Badge>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className={cn("w-[240px] justify-start text-left font-normal bg-white", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date as any}
                                    onSelect={setDate as any}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6">
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-white border shadow-sm h-9 p-1">
                        <TabsTrigger value="overview" className="text-xs px-4">Overview</TabsTrigger>
                        <TabsTrigger value="funnel" className="text-xs px-4">Funnel & Behavior</TabsTrigger>
                        <TabsTrigger value="live" className="text-xs px-4">Live Stream</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <MetricCard
                                title="Total Impressions"
                                value={totalImpressions.toLocaleString()}
                                icon={Eye}
                                subtext="Lifetime count"
                                change={0}
                            />
                            <MetricCard
                                title="Total Clicks"
                                value={totalClicks.toLocaleString()}
                                icon={MousePointer}
                                subtext="Lifetime count"
                                change={0}
                            />
                            <MetricCard
                                title="CTR"
                                value={`${ctr} % `}
                                icon={Target}
                                subtext="Click Through Rate"
                                change={0}
                            />
                        </div>

                        <Card className="col-span-full shadow-sm">
                            <CardHeader className="border-b bg-gray-50/40 py-4">
                                <CardTitle className="text-base">Engagement Trends</CardTitle>
                                <CardDescription>Based on recent event samples</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 h-[400px]">
                                {processedTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={processedTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <Tooltip />
                                            <Legend verticalAlign="top" iconType="circle" />
                                            <Area type="monotone" dataKey="impressions" stroke="#8884d8" fillOpacity={1} fill="url(#colorImpressions)" name="Impressions" />
                                            <Area type="monotone" dataKey="clicks" stroke="#82ca9d" fillOpacity={1} fill="none" name="Clicks" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">
                                        No trend data available for this period.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FUNNEL */}
                    <TabsContent value="funnel" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Conversion Funnel</CardTitle>
                                    <CardDescription>Based on filtered events</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {processedFunnel.some(d => d.value > 0) ? (
                                        <FunnelViz data={processedFunnel} />
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground">No funnel data</div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Activity Heatmap</CardTitle>
                                    <CardDescription>User activity aggregation</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ActivityHeatmap data={processedHeatmap} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* LIVE STREAM */}
                    <TabsContent value="live">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Live Event Log
                                </CardTitle>
                                <CardDescription>Recent raw events from API</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>User ID</TableHead>
                                                <TableHead>Metadata</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEvents.length > 0 ? (
                                                filteredEvents.slice(0, 10).map((ev: any, i: number) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {ev.createdAt ? format(new Date(ev.createdAt), 'HH:mm:ss') : '-'}
                                                        </TableCell>
                                                        <TableCell><Badge variant="outline">{ev.action}</Badge></TableCell>
                                                        <TableCell className="text-sm">{ev.userId}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {JSON.stringify(ev.metadata || {})}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No live events found matching the criteria.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default CampaignReport;
