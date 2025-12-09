import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { theme } from '@/styles/design-tokens';

interface EditPageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    page: any;
    onSuccess: () => void;
}

const EditPageModal: React.FC<EditPageModalProps> = ({ open, onOpenChange, page, onSuccess }) => {
    if (!page) return null;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;

        try {
            await apiClient.deletePage(page._id);
            toast.success('Page deleted successfully');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to delete page', error);
            toast.error('Failed to delete page');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    // Determine Screenshot URL
    // Helper to constructing safe image URL
    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        // Robust base URL handling
        let baseUrl = import.meta.env.VITE_API_URL;

        // If baseUrl is missing or looks like an empty protocol (e.g. "https://"), default to localhost
        if (!baseUrl || baseUrl === 'https://' || baseUrl === 'http://') {
            baseUrl = 'http://localhost:4000';
        }

        // formatting
        baseUrl = baseUrl.replace(/\/$/, ''); // remove trailing slash
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        return `${baseUrl}${cleanPath}`;
    };

    const screenshotUrl = getImageUrl(page.imageUrl);
    console.log('DEBUG: Image URL:', screenshotUrl, 'Raw:', page.imageUrl);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1000px] w-[90vw] p-0 overflow-hidden" style={{ maxHeight: '90vh' }}>
                <div className="flex h-full" style={{ height: '600px' }}>

                    {/* LEFT COLUMN: DETAILS */}
                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto border-r border-gray-100">
                        <DialogHeader className="px-0 pt-0 pb-2">
                            <DialogTitle>Edit Page</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pageName">Page Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="pageName"
                                        defaultValue={page.name}
                                        readOnly
                                        className="bg-gray-50 font-mono text-sm"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(page.name, 'Name')}>
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pageTag">Page Tag</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="pageTag"
                                        defaultValue={page.pageTag}
                                        readOnly
                                        className="bg-gray-50 font-mono text-sm text-purple-600 font-semibold"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(page.pageTag, 'Tag')}>
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Components ({page.elements?.length || 0})</Label>
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 max-h-[250px] overflow-y-auto">
                                    {page.elements && page.elements.length > 0 ? (
                                        page.elements.map((el: any, i: number) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                className="font-mono text-xs px-2 py-1 bg-white border border-gray-200 hover:bg-gray-100"
                                            >
                                                ◈ {el.id || 'unknown'}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">No components detected.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs text-gray-400">ID: {page._id}</span>
                            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                                <Trash2 size={14} /> Delete Page
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SCREENSHOT */}
                    <div className="w-[400px] bg-gray-900 flex items-center justify-center p-8 relative">
                        {/* Phone Frame */}
                        <div className="relative bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden"
                            style={{
                                width: '300px',
                                height: '100%',
                                maxHeight: '600px',
                                aspectRatio: '9/19.5'
                            }}
                        >
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-10"></div>

                            {/* Screen Content */}
                            <img
                                src={screenshotUrl}
                                alt="Page Screenshot"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x600?text=No+Image';
                                }}
                            />

                            {/* Overlay Count Badge */}
                            <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                                <span>{page.elements?.length || 0} Products</span>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPageModal;
