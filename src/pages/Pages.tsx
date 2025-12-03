import React, { useState } from 'react';
import { theme } from '@/styles/design-tokens';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    MoreHorizontal,
    Copy,
    Trash2,
    ExternalLink,
    FileText,
    Globe
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
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

const Pages = () => {
    const { pages, addPage, deletePage } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPage, setNewPage] = useState({ name: '', url: '' });

    const handleCreate = () => {
        if (!newPage.name || !newPage.url) {
            toast.error('Please fill in all fields');
            return;
        }
        addPage(newPage);
        setNewPage({ name: '', url: '' });
        setIsCreateOpen(false);
        toast.success('Page created successfully');
    };

    const handleDelete = (id: string) => {
        deletePage(id);
        toast.success('Page deleted');
    };

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success('ID copied to clipboard');
    };

    const filteredPages = pages.filter(page =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            header: 'Name',
            width: '40%',
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                            {row.id}
                            <Copy
                                size={10}
                                className="cursor-pointer hover:text-purple-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyId(row.id);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'createdAt',
            header: 'Created at',
            width: '25%',
            render: (row: any) => (
                <span className="text-sm text-gray-500">
                    {new Date(row.createdAt).toLocaleString()}
                </span>
            )
        },
        {
            key: 'updatedAt',
            header: 'Updated at',
            width: '25%',
            render: (row: any) => (
                <span className="text-sm text-gray-500">
                    {new Date(row.updatedAt).toLocaleString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            width: '10%',
            render: (row: any) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyId(row.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(row.url, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit URL
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(row.id)}
                            >
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
                title="Pages"
                subtitle="Manage your application pages"
                actions={
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus size={16} />
                                New Page
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Page</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Page Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Home Page"
                                        value={newPage.name}
                                        onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Page URL / Path</Label>
                                    <Input
                                        id="url"
                                        placeholder="e.g., /home"
                                        value={newPage.url}
                                        onChange={(e) => setNewPage({ ...newPage, url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Create Page</Button>
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
                                placeholder="Search Page.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        data={filteredPages}
                        columns={columns}
                        emptyMessage="No pages found. Create one to get started."
                    />
                </div>
            </PageContainer>
        </div>
    );
};

export default Pages;
