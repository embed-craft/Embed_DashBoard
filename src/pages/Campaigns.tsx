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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    // Optimistic update
    updateCampaignStatus(id, newStatus);

    try {
      const api = await import('@/lib/api');
      // Map 'paused' to 'inactive' for backend
      const backendStatus = newStatus === 'paused' ? 'inactive' : newStatus;
      await api.updateCampaign(id, { status: backendStatus } as any);
      toast.success(`Campaign ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
      // Revert on failure
      updateCampaignStatus(id, currentStatus as any);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const name = campaign.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: 'name',
      header: 'Title',
      width: '300px',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={row.status === 'active'}
              onCheckedChange={() => handleToggleStatus(row.id, row.status)}
            />
          </div>
          <span style={{ fontWeight: 500, color: theme.colors.text.primary }}>{row.name}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (row: any) => <StatusBadge status={row.status as any} />
    },
    {
      key: 'experience',
      header: 'Experience',
      width: '150px',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '4px', height: '16px', backgroundColor: row.experience === 'In-App' ? '#3b82f6' : '#ec4899', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: theme.colors.text.primary }}>{row.experience || 'In-App'}</span>
        </div>
      )
    },
    {
      key: 'events',
      header: 'Events',
      width: '150px',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {(row.events || []).map((tag: string, i: number) => (
            <span key={i} style={{
              padding: '2px 8px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              {tag}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'tags',
      header: 'Tags',
      width: '150px',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {(row.tags || []).map((tag: string, i: number) => (
            <span key={i} style={{
              padding: '2px 8px',
              backgroundColor: theme.colors.gray[100],
              color: theme.colors.text.secondary,
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              {tag}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created at',
      width: '180px',
      render: (row: any) => <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{new Date(row.createdAt).toLocaleString()}</span>
    },
    {
      key: 'updatedAt',
      header: 'Updated at',
      width: '180px',
      render: (row: any) => <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{new Date(row.updatedAt).toLocaleString()}</span>
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (row: any) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-500 hover:text-gray-900 gap-1.5"
              onClick={() => {
                navigator.clipboard.writeText(row.id);
                toast.success('Campaign ID copied to clipboard');
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Copy ID</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-500 hover:text-gray-900 gap-1.5"
              onClick={() => handleEdit(row.id)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Edit</span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigator.clipboard.writeText(row.id);
                toast.success('Campaign ID copied to clipboard');
              }}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/analytics')}>
                <BarChart2 className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Campaigns"
        subtitle=""
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus size={16} />
            Create Campaign
          </Button>
        }
      />

      <PageContainer>
        <div style={{
          backgroundColor: 'white',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.default}`,
          boxShadow: theme.shadows.sm,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 140px)' // Fill remaining height (Header ~80px + Padding ~60px)
        }}>
          {/* Filters Bar */}
          <div style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${theme.colors.border.default}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ width: '300px' }}>
              <SearchInput
                placeholder="Search Campaigns (Title or ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="outline" className="gap-2 h-9 text-gray-600">
                <SlidersHorizontal size={14} />
                Status
              </Button>
              <Button variant="outline" className="gap-2 h-9 text-gray-600">
                <SlidersHorizontal size={14} />
                Experience
              </Button>
              <Button variant="outline" className="gap-2 h-9 text-gray-600">
                <SlidersHorizontal size={14} />
                Tags
              </Button>
              <Button variant="outline" className="gap-2 h-9 text-gray-600">
                <SlidersHorizontal size={14} />
                Events
              </Button>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" className="text-gray-500">Select</Button>
              <Button variant="secondary" className="gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                Generate Report
              </Button>
              <Button variant="ghost" className="gap-2 text-gray-500">
                <Columns size={14} />
                Toggle Columns
              </Button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <DataTable
              data={filteredCampaigns}
              columns={columns}
              onRowClick={(row) => handleEdit(row.id)}
              emptyMessage="No campaigns found. Get started by creating your first campaign."
            />
          </div>
        </div>
      </PageContainer>

      <CreateCampaignModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default Campaigns;
