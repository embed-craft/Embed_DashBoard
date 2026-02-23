import React, { useState, useEffect } from 'react';
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
    Smartphone,
    RefreshCw
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable, { Column } from '@/components/shared/DataTable';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from '@/lib/api';
import PageUploadModal from '@/components/pages/PageUploadModal';
import EditPageModal from '@/components/pages/EditPageModal';

interface PageDbo {
    _id: string;
    name: string;
    pageTag: string;
    imageUrl: string;
    elements: any[];
    deviceMetadata: any;
    createdAt: string;
}

type PageRow = PageDbo & { id: string };

const Pages = () => {
    const [pages, setPages] = useState<PageDbo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState<PageDbo | null>(null);

    const fetchPages = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.listPages();
            setPages(res.pages || []);
        } catch (error) {
            console.error('Failed to fetch pages', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const copyId = (id: string, text: string = 'ID') => {
        navigator.clipboard.writeText(id);
        toast.success(`\${text} copied`);
    };

    const filteredPages = pages.filter(page =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.pageTag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<PageRow>[] = [
        {
            key: 'preview',
            header: 'Preview',
            width: '10%',
            render: (row: PageDbo) => (
                <div className="h-16 w-10 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <img
                        src={(() => {
                            const path = row.imageUrl;
                            if (!path) return '';
                            if (path?.startsWith('http')) return path;

                            let baseUrl = import.meta.env.VITE_API_URL;
                            const isProd = import.meta.env.PROD;

                            if (!baseUrl || baseUrl === 'https://' || baseUrl === 'http://') {
                                baseUrl = isProd ? '' : 'http://localhost:4000';
                            }
                            baseUrl = baseUrl.replace(/\/$/, '');
                            return `${baseUrl}${path?.startsWith('/') ? path : `/${path}`}`;
                        })()}
                        alt="Page Preview"
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        },
        {
            key: 'name',
            header: 'Page Name & Tag',
            width: '35%',
            render: (row: PageDbo) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5 flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded w-fit border border-gray-200">
                        {row.pageTag}
                        <Copy
                            size={10}
                            className="cursor-pointer hover:text-gray-800"
                            onClick={(e) => {
                                e.stopPropagation();
                                copyId(row.pageTag, 'Page Tag');
                            }}
                        />
                    </div>
                </div>
            )
        },
        {
            key: 'elements',
            header: 'Elements',
            width: '15%',
            render: (row: PageDbo) => (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                    <FileText size={14} />
                    {row.elements?.length || 0} Targets
                </span>
            )
        },
        {
            key: 'device',
            header: 'Device',
            width: '15%',
            render: (row: PageDbo) => (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Smartphone size={14} />
                    {row.deviceMetadata?.deviceType || 'Phone'}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'Captured',
            width: '20%',
            render: (row) => (
                <span className="text-sm text-gray-500">
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            width: '5%',
            render: (row: PageDbo) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyId(row.pageTag, 'Page Tag')}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Tag
                            </DropdownMenuItem>
                            {/* 
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(row._id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem> 
                            */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.background.page }}>
            <PageHeader
                title="Pages"
                subtitle="Captured app screens for visual targeting"
                actions={
                    <Button
                        className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={() => setIsUploadOpen(true)}
                    >
                        <Plus size={16} />
                        Capture New Page
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
                    overflow: 'hidden',
                    minHeight: '400px'
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
                                placeholder="Search by name or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchPages}>
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        </Button>
                    </div>

                    <DataTable
                        data={filteredPages.map(p => ({ ...p, id: p._id }))}
                        columns={columns}
                        emptyMessage="No pages captured yet. Scan QR code to start."
                        isLoading={isLoading}
                        onRowClick={(row: PageRow) => setSelectedPage(row)}
                    />
                </div>
            </div>

            <PageUploadModal
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                onSuccess={fetchPages}
            />

            <EditPageModal
                open={!!selectedPage}
                onOpenChange={(open) => !open && setSelectedPage(null)}
                page={selectedPage}
                onSuccess={() => {
                    setSelectedPage(null);
                    fetchPages();
                }}
            />
        </div>
    );
};

export default Pages;
