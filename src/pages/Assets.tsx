import React, { useState, useRef } from 'react';
import {
    Upload,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Copy,
    FileImage,
    FileText,
    FolderOpen,
    Download,
    Plus,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import SearchInput from '@/components/shared/SearchInput';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Asset {
    _id?: string;
    id?: string;
    name: string;
    type: 'image' | 'file';
    url: string;
    size: string;
    createdAt: string;
}

const initialAssets: Asset[] = [];
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AssetsPage = () => {
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'file'>('all');
    const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAssets = async () => {
        try {
            const api = await import('@/lib/api');
            const { assets } = await api.apiClient.listAssets();
            setAssets(assets);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            toast.error('Failed to load assets');
        }
    };

    React.useEffect(() => {
        fetchAssets();
    }, []);

    const handleAddUrl = async () => {
        if (!urlInput) {
            toast.error('Please enter a URL');
            return;
        }

        try {
            const api = await import('@/lib/api');
            const newAsset = await api.apiClient.createAssetFromUrl({
                name: nameInput,
                url: urlInput
            });
            setAssets([newAsset, ...assets]);
            toast.success('Asset added from URL');
            setIsUrlDialogOpen(false);
            setUrlInput('');
            setNameInput('');
        } catch (error) {
            console.error('Failed to add asset from URL:', error);
            toast.error('Failed to add asset');
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const api = await import('@/lib/api');
                const newAsset = await api.apiClient.uploadAsset(file);
                setAssets([newAsset, ...assets]);
                toast.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error('Upload failed:', error);
                toast.error('Failed to upload asset');
            }
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const api = await import('@/lib/api');
            await api.apiClient.deleteAsset(id);
            setAssets(assets.filter(a => a._id !== id && a.id !== id));
            toast.success('Asset deleted');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete asset');
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || asset.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Assets"
                subtitle="Manage your creative assets and files."
                actions={
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-white">
                                    <Plus size={16} />
                                    Add from URL
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Asset from URL</DialogTitle>
                                    <DialogDescription>
                                        Enter the URL of an image or file hosted on the internet.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="url">Asset URL</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://example.com/image.png"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name (Optional)</Label>
                                        <Input
                                            id="name"
                                            placeholder="My Image"
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddUrl}>Add Asset</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleUploadClick}
                        >
                            <Upload size={16} />
                            Upload Asset
                        </Button>
                    </div>
                }
            />

            <PageContainer>
                <Tabs defaultValue="your-assets" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 rounded-none mb-6">
                        <TabsTrigger
                            value="your-assets"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            Your Assets
                        </TabsTrigger>
                        <TabsTrigger
                            value="common-assets"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                        >
                            Common Assets
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="your-assets" className="mt-0">
                        <div className="flex flex-col gap-6">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-72">
                                        <SearchInput
                                            placeholder="Search assets..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Filter size={16} />
                                                {filterType === 'all' ? 'All Types' : filterType === 'image' ? 'Images' : 'Files'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType('image')}>Images</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setFilterType('file')}>Files</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {filteredAssets.length} assets found
                                </div>
                            </div>

                            {/* Grid */}
                            {filteredAssets.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {filteredAssets.map((asset) => (
                                        <div
                                            key={asset._id || asset.id}
                                            className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                                        >
                                            {/* Preview Area */}
                                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                                {asset.type === 'image' ? (
                                                    <img
                                                        src={asset.url.startsWith('http') ? asset.url : `${API_BASE}${asset.url.split('/').map(p => encodeURIComponent(p)).join('/')}`}
                                                        alt={asset.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FileText size={48} className="text-gray-400" />
                                                )}

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-gray-700"
                                                        onClick={() => handleCopyLink(asset.url.startsWith('http') ? asset.url : `${API_BASE}${asset.url.split('/').map(p => encodeURIComponent(p)).join('/')}`)}
                                                        title="Copy Link"
                                                    >
                                                        <Copy size={14} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() => handleDelete(asset._id || asset.id!)}
                                                        title="Delete Asset"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Info Area */}
                                            <div className="p-3 flex flex-col gap-1">
                                                <div className="font-medium text-sm text-gray-900 truncate" title={asset.name}>
                                                    {asset.name}
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>{asset.size}</span>
                                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <FolderOpen size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        {searchQuery ? `No results for "${searchQuery}"` : "Upload your first asset to get started"}
                                    </p>
                                    {!searchQuery && (
                                        <Button onClick={handleUploadClick} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                            <Upload size={16} />
                                            Upload Asset
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="common-assets">
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Common Assets Library</h3>
                            <p className="text-gray-500 text-sm">
                                Access shared company assets here. (Coming Soon)
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </PageContainer>
        </div>
    );
};

export default AssetsPage;
