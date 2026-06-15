import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart2,
  Copy,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  Download,
  Columns,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import IconButton from '@/components/shared/IconButton';
import SearchInput from '@/components/shared/SearchInput';
import { theme } from '@/styles/design-tokens';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Campaigns = () => {
  const navigate = useNavigate();
  const { campaigns, deleteCampaign, updateCampaignStatus, syncCampaigns } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [eventsFilter, setEventsFilter] = useState<string[]>([]);

  // Schedule Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedCampaignForSchedule, setSelectedCampaignForSchedule] = useState<any>(null);
  const [schedStartDate, setSchedStartDate] = useState('');
  const [schedEndDate, setSchedEndDate] = useState('');
  const [schedTimeZone, setSchedTimeZone] = useState('UTC');

  const fetchCampaigns = useCallback(async () => {
    try {
      const api = await import('@/lib/api');
      const { campaigns: backendCampaigns } = await api.listCampaigns({ limit: 100 });

      // Convert backend campaigns to dashboard format
      const dashboardCampaigns = backendCampaigns.map((bc: any) => {
        let status = (bc.status === 'inactive' ? 'paused' : bc.status);

        // Apply smart status for filtering
        if (status === 'active' && bc.schedule) {
          const now = new Date();
          const start = bc.schedule.start_date || bc.schedule.startDate;
          const end = bc.schedule.end_date || bc.schedule.endDate;
          const startDate = start ? new Date(start) : null;
          const endDate = end ? new Date(end) : null;

          if (startDate && now < startDate) {
            status = 'scheduled';
          } else if (endDate && now > endDate) {
            status = 'completed';
          }
        }

        let inferredExperience = bc.experience;
        
        // Smart detection for legacy campaigns that defaulted to 'nudges'
        if (!inferredExperience || inferredExperience === 'nudges' || inferredExperience === 'nudge') {
          if (
            bc.type === 'spinthewheel' || 
            bc.campaignType === 'spinthewheel' || 
            bc.config?.spinTheWheelConfig || 
            bc.spinTheWheelConfig 
          ) {
            inferredExperience = 'spinthewheel';
          } else if (bc.campaignType === 'challenge' || bc.type === 'challenge' || bc.campaignType === 'challenges' || bc.type === 'challenges') {
            inferredExperience = 'challenge';
          } else if (bc.type === 'survey' || bc.type === 'surveys') {
            inferredExperience = 'survey';
          } else if (bc.type === 'streaks' || bc.type === 'streak') {
            inferredExperience = 'streaks';
          }
        }

        return {
          id: bc.id || bc._id || bc.nudge_id,
          name: bc.campaign_name || bc.name || 'Untitled Campaign',
          status: status as 'active' | 'paused' | 'draft' | 'completed' | 'scheduled',
          trigger: bc.trigger_event || bc.trigger,
          experience: (() => {
            switch (inferredExperience) {
              case 'story':
              case 'stories': return 'Stories';
              case 'message':
              case 'messages': return 'In-app messages';
              case 'challenge':
              case 'challenges': return 'Challenges';
              case 'spinthewheel':
              case 'gamification': return 'SPIN THE WHEEL';
              case 'survey':
              case 'surveys': return 'Survey';
              case 'streak':
              case 'streaks': return 'Streaks';
              case 'nudge':
              case 'nudges': default: return 'In-app nudges';
            }
          })(),
          events: [bc.trigger_event || bc.trigger || 'session_start'], // Show trigger event
          tags: bc.tags || [], // Show actual tags
          segment: 'All Users',
          impressions: bc.stats?.impressions || 0,
          clicks: bc.stats?.clicks || 0,
          conversions: bc.stats?.conversions || 0,
          conversion: bc.stats?.impressions > 0
            ? ((bc.stats.conversions || 0) / bc.stats.impressions * 100).toFixed(1)
            : '0.0',
          config: bc.config || {},
          rules: bc.rules || [],
          schedule: bc.schedule || null, // Include schedule from backend
          createdAt: bc.createdAt || new Date().toISOString(),
          updatedAt: bc.updatedAt || new Date().toISOString(),
        };
      });

      syncCampaigns(dashboardCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  }, [syncCampaigns]);

  // Fetch campaigns from backend on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleEdit = (id: string) => {
    navigate(`/campaign-builder?id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      toast.success('Campaign deleted');
    }
  };

  const handleClone = async (id: string) => {
    const toastId = toast.loading('Cloning campaign...');
    try {
      const api = await import('@/lib/api');
      const backendCampaign = await api.apiClient.getCampaign(id);
      
      const clonedPayload: any = {
        ...backendCampaign,
        name: `${backendCampaign.name} (Copy)`,
        status: 'draft',
      };
      
      delete clonedPayload.id;
      delete clonedPayload._id;
      delete clonedPayload.nudge_id;
      delete clonedPayload.createdAt;
      delete clonedPayload.updatedAt;
      
      await api.apiClient.createCampaign(clonedPayload);
      await fetchCampaigns();
      
      toast.success('Campaign cloned successfully', { id: toastId });
    } catch (error) {
      console.error('Failed to clone campaign:', error);
      toast.error('Failed to clone campaign', { id: toastId });
    }
  };

  const updateStatusApi = async (id: string, status: string) => {
    updateCampaignStatus(id, status as any); // Optimistic
    try {
      const api = await import('@/lib/api');
      const backendStatus = status === 'paused' ? 'inactive' : status;
      await api.updateCampaign(id, { status: backendStatus } as any);
      toast.success(`Campaign marked as ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
      // Revert logic needed here ideally
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateStatusApi(id, newStatus);
  };

  const handleSetStatus = (id: string, status: string) => {
    if (status === 'scheduled') {
      const camp = campaigns.find(c => c.id === id);
      if (camp) {
        setSelectedCampaignForSchedule(camp);
        // Load existing schedule if present
        const start = camp.schedule?.startDate || camp.schedule?.start_date || '';
        const end = camp.schedule?.endDate || camp.schedule?.end_date || '';
        const tz = camp.schedule?.timeZone || camp.schedule?.timezone || 'UTC';
        
        // Format dates if they are ISO strings (datetime-local needs 'YYYY-MM-DDTHH:MM')
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return '';
          try {
            const date = new Date(dateStr);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          } catch {
            return '';
          }
        };

        setSchedStartDate(formatDateForInput(start));
        setSchedEndDate(formatDateForInput(end));
        setSchedTimeZone(tz);
        setScheduleModalOpen(true);
      }
    } else {
      updateStatusApi(id, status);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForSchedule) return;

    try {
      const api = await import('@/lib/api');
      const schedulePayload = {
        start_date: schedStartDate ? new Date(schedStartDate).toISOString() : undefined,
        end_date: schedEndDate ? new Date(schedEndDate).toISOString() : undefined,
        timezone: schedTimeZone || 'UTC'
      };

      // Set backend status to active (scheduled campaigns are active under the hood with a future start date)
      await api.updateCampaign(selectedCampaignForSchedule.id, {
        status: 'active',
        schedule: schedulePayload
      } as any);

      // Optimistically update the store list
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === selectedCampaignForSchedule.id) {
          let displayStatus = 'scheduled';
          const now = new Date();
          const startDate = schedulePayload.start_date ? new Date(schedulePayload.start_date) : null;
          const endDate = schedulePayload.end_date ? new Date(schedulePayload.end_date) : null;

          if (startDate && now >= startDate) {
            if (endDate && now > endDate) {
              displayStatus = 'completed';
            } else {
              displayStatus = 'active';
            }
          }

          return {
            ...c,
            status: displayStatus as any,
            schedule: {
              startDate: schedulePayload.start_date,
              endDate: schedulePayload.end_date,
              timeZone: schedulePayload.timezone
            }
          };
        }
        return c;
      });

      syncCampaigns(updatedCampaigns);
      toast.success('Campaign schedule saved successfully');
      setScheduleModalOpen(false);
    } catch (error) {
      console.error('Failed to save campaign schedule:', error);
      toast.error('Failed to save campaign schedule');
    }
  };




  // Filter Logic
  const filteredCampaigns = campaigns.filter(campaign => {
    const name = campaign.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(campaign.status);
    const matchesExperience = experienceFilter.length === 0 || experienceFilter.includes(campaign.experience);
    const matchesTags = tagsFilter.length === 0 || (campaign.tags?.some(tag => tagsFilter.includes(tag)) ?? false);
    const matchesEvents = eventsFilter.length === 0 || (campaign.events?.some(event => eventsFilter.includes(event)) ?? false);

    return matchesSearch && matchesStatus && matchesExperience && matchesTags && matchesEvents;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter Options Handlers
  const uniqueTags = Array.from(new Set(campaigns.flatMap(c => c.tags || [])));
  const uniqueEvents = Array.from(new Set(campaigns.flatMap(c => c.events || [])));


  // Generate Report Logic
  const handleGenerateReport = async () => {
    toast.info('Generating detailed report...');
    try {
      const api = await import('@/lib/api');

      const reportData = await Promise.all(filteredCampaigns.map(async (camp) => {
        try {
          // Fetch detailed stats including Unique Users & Metadata breakdown
          const detailedStats = await api.getCampaignStats(camp.id);
          return {
            ...camp,
            ...detailedStats.stats,
            userList: detailedStats.users.map((u: any) => u.userId).join(', '),
            topEvents: detailedStats.events.map((e: any) => `${e.type} (${e.count})`).join('; ')
          };
        } catch (e) {
          console.warn(`Failed to fetch stats for ${camp.name}`, e);
          return camp; // Fallback to basic info
        }
      }));

      // Convert to CSV
      const csvHeader = ['ID', 'Name', 'Status', 'Experience', 'Created At', 'Impressions', 'Clicks', 'Conversions', 'CTR', 'Unique Users Count', 'User IDs', 'Event Breakdown'];
      const csvRows = reportData.map(row => [
        row.id,
        `"${row.name}"`, // Quote strings
        row.status,
        row.experience,
        new Date(row.createdAt).toLocaleDateString(),
        row.impressions || 0,
        row.clicks || 0,
        row.conversions || 0,
        `${row.ctr || 0}%`,
        row.uniqueUserCount || 0,
        `"${row.userList || ''}"`,
        `"${row.topEvents || ''}"`
      ].join(','));

      const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Report downloaded');
    } catch (error) {
      console.error('Report generation failed', error);
      toast.error('Failed to generate report');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Title',
      width: '25%', // Dynamic width
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> {/* Reduced gap */}
          <div onClick={(e) => e.stopPropagation()} style={{ transform: 'scale(0.8)' }}> {/* Compact switch */}
            <Switch
              checked={row.status === 'active'}
              onCheckedChange={() => handleToggleStatus(row.id, row.status)}
            />
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '13px', color: theme.colors.text.primary }}>{row.name}</div>
            <div style={{ fontSize: '10px', color: theme.colors.text.tertiary, display: 'flex', alignItems: 'center', gap: '4px' }}>
              ID: {row.id.substring(0, 8)}...
              <Copy size={10} className="cursor-pointer hover:text-blue-600" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(row.id); toast.success('Copied'); }} />
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (row: any) => {
        const schedule = row.schedule;
        const start = schedule?.start_date || schedule?.startDate;
        const end = schedule?.end_date || schedule?.endDate;
        const hasSchedule = schedule && (start || end);

        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        // Compute smart status based on schedule
        let displayStatus = row.status;
        let scheduleInfo = null;

        if (hasSchedule) {
          const now = new Date();
          const startDate = start ? new Date(start) : null;
          const endDate = end ? new Date(end) : null;

          if (startDate && now < startDate) {
            // Campaign hasn't started yet
            displayStatus = 'scheduled';
            scheduleInfo = { label: `Starts ${formatDate(start)}`, color: '#3b82f6' };
          } else if (endDate && now > endDate) {
            // Campaign has ended
            displayStatus = 'completed';
            scheduleInfo = { label: `Ended ${formatDate(end)}`, color: '#6b7280' };
          } else if (startDate || endDate) {
            // Campaign is in schedule period
            scheduleInfo = {
              label: `${startDate ? formatDate(start) : 'Now'} - ${endDate ? formatDate(end) : '∞'}`,
              color: '#22c55e'
            };
          }
        }

        return (
          <div>
            <div style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}>
              <StatusBadge status={displayStatus as any} />
            </div>
            {scheduleInfo && (
              <div style={{ fontSize: '9px', color: scheduleInfo.color, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Calendar size={10} />
                {scheduleInfo.label}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'experience',
      header: 'Experience',
      width: '15%',
      render: (row: any) => {
        const expColorMap: Record<string, string> = {
          'In-app nudges': '#3b82f6',
          'In-App': '#3b82f6',
          'In-app messages': '#ec4899',
          'Out-of-app Messages': '#ec4899',
          'Stories': '#8b5cf6',
          'Challenges': '#f59e0b',
          'SPIN THE WHEEL': '#ef4444',
          'Spin The Wheel': '#ef4444',
          'Survey': '#06b6d4',
          'Streaks': '#10b981',
        };
        const barColor = expColorMap[row.experience] || '#3b82f6';
        return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '4px', height: '16px', backgroundColor: barColor, borderRadius: '2px' }} />
          <span style={{ fontSize: '12px', color: theme.colors.text.primary }}>{row.experience || 'In-app nudges'}</span>
        </div>
        );
      }
    },
    {
      key: 'stats', // New Stats Column
      header: 'Metrics',
      width: '24%',
      render: (row: any) => {
        const ctr = row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(1) : '0.0';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Primary Stat: CTR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.text.primary }}>{ctr}%</span>
              <span style={{ fontSize: '10px', color: theme.colors.text.tertiary }}>CTR</span>
            </div>

            {/* Secondary Stats: Impressions & Clicks */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: theme.colors.text.secondary }}>
              <div title="Impressions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
                <span>{row.impressions?.toLocaleString() || 0}</span>
              </div>
              <div title="Clicks" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399' }} />
                <span>{row.clicks?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'tags',
      header: 'Tags',
      width: '12%',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(row.tags || []).slice(0, 2).map((tag: string, i: number) => (
            <span key={i} style={{
              padding: '1px 6px', // Compact
              backgroundColor: theme.colors.gray[100],
              color: theme.colors.text.secondary,
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 500
            }}>
              {tag}
            </span>
          ))}
          {(row.tags?.length || 0) > 2 && <span style={{ fontSize: '10px', color: theme.colors.text.tertiary }}>+{row.tags.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '15%', // Reduced width
      render: (row: any) => <span style={{ fontSize: '11px', color: theme.colors.text.secondary }}>{new Date(row.updatedAt).toLocaleDateString()}</span>
    },
    {
      key: 'actions',
      header: '',
      width: '5%',
      render: (row: any) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleEdit(row.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              {/* Status Submenu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Change Status
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={-5}>
                  <DropdownMenuItem onClick={() => handleSetStatus(row.id, 'active')}>
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatus(row.id, 'paused')}>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" /> Paused
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatus(row.id, 'draft')}>
                    <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" /> Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatus(row.id, 'scheduled')}>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Scheduled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(row.id); toast.success('Copied'); }}>
                <Copy className="mr-2 h-4 w-4" /> Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClone(row.id)}>
                <Copy className="mr-2 h-4 w-4" /> Clone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/campaigns/${row.id}/report`)}>
                <BarChart2 className="mr-2 h-4 w-4" /> Usage Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  // Helper for Dropdown Filters
  const FilterDropdown = ({ label, options, selected, onChange }: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={selected.length > 0 ? "secondary" : "outline"} className={`gap-2 h-8 text-xs ${selected.length > 0 ? 'text-primary' : 'text-gray-600'}`}>
          <SlidersHorizontal size={12} />
          {label} {selected.length > 0 && `(${selected.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((opt: string) => (
          <DropdownMenuItem key={opt} onClick={(e) => {
            e.preventDefault();
            const newSel = selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt];
            onChange(newSel);
          }}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 border rounded-sm ${selected.includes(opt) ? 'bg-primary border-primary' : 'border-gray-400'}`} />
              {opt}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Campaigns"
        subtitle="Manage your in-app experiences"
        actions={
          <Button onClick={() => navigate('/campaigns/new')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm">
            <Plus size={16} /> Create Campaign
          </Button>
        }
      />

      {/* Custom Full Width Container */}
      <div style={{ padding: '32px', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.default}`,
          boxShadow: theme.shadows.sm,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)', // Full height minus header
          width: '100%', // Full width
          maxWidth: '100%'
        }}>
          {/* Filters Bar */}
          <div style={{
            padding: '12px 16px', // Compact padding
            borderBottom: `1px solid ${theme.colors.border.default}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ width: '240px' }}>
              <SearchInput placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <FilterDropdown label="Status" options={['active', 'paused', 'draft', 'scheduled']} selected={statusFilter} onChange={setStatusFilter} />
              <FilterDropdown label="Experience" options={['In-app nudges', 'In-app messages', 'Stories', 'Challenges', 'SPIN THE WHEEL', 'Survey', 'Streaks']} selected={experienceFilter} onChange={setExperienceFilter} />
              <FilterDropdown label="Tags" options={uniqueTags} selected={tagsFilter} onChange={setTagsFilter} />
              <FilterDropdown label="Events" options={uniqueEvents} selected={eventsFilter} onChange={setEventsFilter} />
            </div>

            <div style={{ flex: 1 }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <DataTable
              data={paginatedCampaigns}
              columns={columns}
              onRowClick={(row) => handleEdit(row.id)}
              emptyMessage="No campaigns found."
              pagination={{
                page: currentPage,
                totalPages: totalPages,
                onPageChange: setCurrentPage,
                itemsPerPage: itemsPerPage,
                onItemsPerPageChange: (val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1); // Reset to first page
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 600, fontSize: '18px', color: theme.colors.text.primary }}>Set Campaign Schedule</DialogTitle>
            <DialogDescription style={{ fontSize: '13px', color: theme.colors.text.secondary }}>
              Configure when this campaign should start and end. The campaign will go live automatically once the start time is reached.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSchedule} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" style={{ fontSize: '13px', fontWeight: 500 }}>Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                required
                value={schedStartDate}
                onChange={(e) => setSchedStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" style={{ fontSize: '13px', fontWeight: 500 }}>End Date & Time (Optional)</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={schedEndDate}
                onChange={(e) => setSchedEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="timezone" style={{ fontSize: '13px', fontWeight: 500 }}>Time Zone</Label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                  onClick={() => {
                    let detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (detectedTz === 'Asia/Calcutta') {
                      detectedTz = 'Asia/Kolkata';
                    }
                    setSchedTimeZone(detectedTz);
                    const displayName = detectedTz === 'Asia/Kolkata' ? 'India (IST)' : detectedTz;
                    toast.success(`Timezone set to ${displayName}`);
                  }}
                >
                  Detect my timezone
                </button>
              </div>
              <select
                id="timezone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={schedTimeZone}
                onChange={(e) => setSchedTimeZone(e.target.value)}
              >
                {(() => {
                  const commonTzs = [
                    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                    'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Calcutta', 'Asia/Dubai', 'Asia/Singapore',
                    'Asia/Tokyo', 'Australia/Sydney'
                  ];
                  if (schedTimeZone && !commonTzs.includes(schedTimeZone)) {
                    return <option value={schedTimeZone}>{schedTimeZone}</option>;
                  }
                  return null;
                })()}
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET/CEST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
              </select>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
