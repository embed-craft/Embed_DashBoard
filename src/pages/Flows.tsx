import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Filter,
    MoreHorizontal,
    Workflow,
    Trash2,
    PlayCircle,
    PauseCircle
} from 'lucide-react';
import { theme } from '@/styles/design-tokens';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Flows = () => {
    const { flows, fetchFlows, addFlow, deleteFlow } = useStore();

    React.useEffect(() => {
        fetchFlows();
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFlowTitle, setNewFlowTitle] = useState('');

    const handleCreate = () => {
        if (!newFlowTitle) {
            toast.error('Please enter a flow title');
            return;
        }
        addFlow({ title: newFlowTitle });
        setNewFlowTitle('');
        setIsCreateOpen(false);
        toast.success('Flow created successfully');
    };

    const handleDelete = (id: string) => {
        deleteFlow(id);
        toast.success('Flow deleted');
    };

    const filteredFlows = flows.filter(flow =>
        flow.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'title',
            header: 'Title',
            width: '40%',
            render: (row: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: theme.colors.primary[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.primary[600]
                    }}>
                        <Workflow size={16} />
                    </div>
                    <span style={{ fontWeight: 500, color: theme.colors.text.primary }}>{row.title}</span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            width: '15%',
            render: (row: any) => <StatusBadge status={row.status as any} />
        },
        {
            key: 'createdAt',
            header: 'Created at',
            width: '20%',
            render: (row: any) => <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{new Date(row.createdAt).toLocaleString()}</span>
        },
        {
            key: 'updatedAt',
            header: 'Updated at',
            width: '20%',
            render: (row: any) => <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{new Date(row.updatedAt).toLocaleString()}</span>
        },
        {
            key: 'actions',
            header: '',
            width: '5%',
            render: (row: any) => (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                title="Flows"
                subtitle="Manage your user journey flows"
                actions={
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus size={16} />
                                New Flow
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Flow</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Flow Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Onboarding Flow"
                                        value={newFlowTitle}
                                        onChange={(e) => setNewFlowTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">Create Flow</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
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
                                placeholder="Search Flows (Title or ID)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: `1px solid ${theme.colors.border.default}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: theme.colors.text.secondary,
                                cursor: 'pointer'
                            }}>
                                <Filter size={16} />
                                Status
                            </button>
                        </div>
                    </div>

                    <DataTable
                        data={filteredFlows}
                        columns={columns}
                        emptyMessage="No flows found. Get started by creating your first flow."
                    />
                </div>
            </PageContainer>
        </div>
    );
};

export default Flows;
