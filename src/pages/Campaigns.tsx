import React, { useState, useEffect } from 'react';
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
  Columns
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import IconButton from '@/components/shared/IconButton';
import SearchInput from '@/components/shared/SearchInput';
import CreateCampaignModal from '@/components/campaign/CreateCampaignModal';
import { theme } from '@/styles/design-tokens';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Campaigns = () => {
  const navigate = useNavigate();
  const { campaigns, deleteCampaign, updateCampaignStatus, syncCampaigns } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [eventsFilter, setEventsFilter] = useState<string[]>([]);

  // Fetch campaigns from backend on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const api = await import('@/lib/api');
        const { campaigns: backendCampaigns } = await api.listCampaigns({ limit: 100 });

        // Convert backend campaigns to dashboard format
        const dashboardCampaigns = backendCampaigns.map((bc: any) => ({
          id: bc.id || bc._id || bc.nudge_id,
          name: bc.campaign_name || bc.name || 'Untitled Campaign',
          status: (bc.status === 'inactive' ? 'paused' : bc.status) as 'active' | 'paused' | 'draft' | 'completed' | 'scheduled',
          trigger: bc.trigger_event || bc.trigger,
          experience: bc.config?.type === 'modal' ? 'In-app messages' : 'In-App', // Infer experience
          events: [bc.trigger_event || bc.trigger || 'session_start'], // Show trigger event
          tags: bc.tags || [], // Show actual tags
          segment: 'All Users',
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversion: '0.0',
          config: bc.config || {},
          rules: bc.rules || [],
          createdAt: bc.createdAt || new Date().toISOString(),
          updatedAt: bc.updatedAt || new Date().toISOString(),
        }));

        syncCampaigns(dashboardCampaigns);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        toast.error('Failed to load campaigns');
      }
    };

    fetchCampaigns();
  }, [syncCampaigns]);

  const handleEdit = (id: string) => {
    navigate(`/campaign-builder?id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      toast.success('Campaign deleted');
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
    updateStatusApi(id, status);
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
      width: '10%',
      render: (row: any) => <div style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}><StatusBadge status={row.status as any} /></div>
    },
    {
      key: 'experience',
      header: 'Experience',
      width: '15%',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '4px', height: '16px', backgroundColor: row.experience === 'In-App' ? '#3b82f6' : '#ec4899', borderRadius: '2px' }} />
          <span style={{ fontSize: '12px', color: theme.colors.text.primary }}>{row.experience || 'In-App'}</span>
        </div>
      )
    },
    {
      key: 'stats', // New Stats Column
      header: 'Metrics',
      width: '20%',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: theme.colors.text.secondary }}>
          <span title="Impressions">👁️ 0</span>
          <span title="Clicks">👆 0</span>
        </div>
      )
    },
    {
      key: 'tags',
      header: 'Tags',
      width: '15%',
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
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm">
            <Plus size={16} /> Create Campaign
          </Button>
        }
      />

      <PageContainer>
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
              <FilterDropdown label="Experience" options={['In-App', 'In-app messages']} selected={experienceFilter} onChange={setExperienceFilter} />
              <FilterDropdown label="Tags" options={uniqueTags} selected={tagsFilter} onChange={setTagsFilter} />
              <FilterDropdown label="Events" options={uniqueEvents} selected={eventsFilter} onChange={setEventsFilter} />
            </div>

            <div style={{ flex: 1 }} />

            <Button variant="secondary" onClick={handleGenerateReport} className="gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-none h-8 text-xs">
              <Download size={14} /> Generate Report
            </Button>
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
      </PageContainer>

      <CreateCampaignModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
};

export default Campaigns;
