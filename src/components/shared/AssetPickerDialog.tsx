import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Search, Upload, Image as ImageIcon, Film, FileText,
    CheckCircle2, Loader2, FolderOpen, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { theme } from '@/styles/design-tokens';
import { apiClient } from '@/lib/api';

// ─── URL resolver (matches Assets.tsx) ───────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
const getAssetUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `${API_BASE}${url}`;
};

interface Asset {
    _id: string;
    name: string;
    type: 'image' | 'video' | 'file';
    url: string;
    size: string;
    sizeBytes?: number;
    createdAt: string;
}

interface AssetPickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (assetUrl: string, asset: Asset) => void;
    accept?: 'image' | 'video' | 'all';
    title?: string;
}

type FilterType = 'all' | 'image' | 'video' | 'file';

export const AssetPickerDialog: React.FC<AssetPickerDialogProps> = ({
    isOpen,
    onClose,
    onSelect,
    accept = 'all',
    title = 'Choose from Asset Library'
}) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<FilterType>(accept === 'all' ? 'all' : accept);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch assets
    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.listAssets();
            setAssets(res.assets || []);
        } catch (err) {
            console.error('Failed to load assets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
            setSelectedId(null);
            setSearchQuery('');
        }
    }, [isOpen, fetchAssets]);

    // Upload inline
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error('File exceeds 10MB'); return; }

        setUploading(true);
        try {
            const newAsset = await apiClient.uploadAsset(file);
            setAssets(prev => [newAsset, ...prev]);
            setSelectedId(newAsset._id);
            toast.success('Uploaded');
        } catch (err: any) {
            toast.error(err?.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Filter
    const filtered = assets.filter(a => {
        if (accept !== 'all' && a.type !== accept) return false;
        if (filterType !== 'all' && a.type !== filterType) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const selectedAsset = assets.find(a => a._id === selectedId);

    const handleConfirm = () => {
        if (selectedAsset) {
            onSelect(getAssetUrl(selectedAsset.url), selectedAsset);
            onClose();
        }
    };

    const acceptStr = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*,.pdf';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[680px] p-0 flex flex-col" style={{ maxHeight: '80vh' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border.default}`, flexShrink: 0 }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary, margin: 0 }}>{title}</h2>
                    <p style={{ fontSize: '12px', color: theme.colors.text.tertiary, marginTop: '2px' }}>
                        Select an asset or upload a new one
                    </p>
                </div>

                {/* Toolbar */}
                <div style={{
                    padding: '10px 20px',
                    borderBottom: `1px solid ${theme.colors.border.default}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexShrink: 0
                }}>
                    {/* Filter + Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {accept === 'all' && (
                            <div style={{ display: 'flex', gap: '1px', backgroundColor: theme.colors.gray[100], padding: '2px', borderRadius: '6px' }}>
                                {(['all', 'image', 'video'] as FilterType[]).map(f => (
                                    <button key={f} onClick={() => setFilterType(f)}
                                        style={{
                                            padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 500, border: 'none',
                                            cursor: 'pointer', transition: 'all 0.1s',
                                            color: filterType === f ? theme.colors.text.primary : theme.colors.text.tertiary,
                                            backgroundColor: filterType === f ? 'white' : 'transparent',
                                            boxShadow: filterType === f ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                        }}>
                                        {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ position: 'relative', flex: 1, maxWidth: '200px' }}>
                            <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.gray[400] }} />
                            <input type="text" placeholder="Search..." value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', paddingLeft: '28px', paddingRight: '8px',
                                    paddingTop: '6px', paddingBottom: '6px', fontSize: '11px',
                                    border: `1px solid ${theme.colors.border.default}`,
                                    borderRadius: '6px', outline: 'none',
                                    backgroundColor: theme.colors.gray[50],
                                }}
                            />
                        </div>
                    </div>
                    {/* Upload */}
                    <div>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} accept={acceptStr} />
                        <Button variant="outline" className="gap-1.5 h-7 text-[11px]"
                            onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            Upload
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="animate-pulse" style={{ aspectRatio: '1', backgroundColor: theme.colors.gray[100], borderRadius: '8px' }} />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                            {filtered.map(asset => {
                                const isSelected = selectedId === asset._id;
                                return (
                                    <div
                                        key={asset._id}
                                        onClick={() => setSelectedId(asset._id)}
                                        onDoubleClick={() => { onSelect(getAssetUrl(asset.url), asset); onClose(); }}
                                        style={{
                                            borderRadius: '8px',
                                            border: `2px solid ${isSelected ? theme.colors.primary[500] : theme.colors.gray[200]}`,
                                            overflow: 'hidden', cursor: 'pointer',
                                            transition: 'all 0.1s ease',
                                            backgroundColor: isSelected ? theme.colors.primary[50] : 'white',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        <div style={{ aspectRatio: '1', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {asset.type === 'image' ? (
                                                <img
                                                    src={getAssetUrl(asset.url)}
                                                    alt={asset.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        // Fallback: hide broken img and show icon
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : asset.type === 'video' ? (
                                                <Film size={24} strokeWidth={1.2} style={{ color: theme.colors.gray[300] }} />
                                            ) : (
                                                <FileText size={24} strokeWidth={1.2} style={{ color: theme.colors.gray[300] }} />
                                            )}
                                        </div>

                                        {/* Check Badge */}
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '6px', right: '6px',
                                                backgroundColor: theme.colors.primary[500],
                                                borderRadius: '50%', width: '20px', height: '20px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                            }}>
                                                <CheckCircle2 size={14} style={{ color: 'white' }} />
                                            </div>
                                        )}

                                        {/* Name */}
                                        <div style={{ padding: '6px 8px' }}>
                                            <span style={{
                                                fontSize: '10px', fontWeight: 500, color: theme.colors.text.primary,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block'
                                            }}>{asset.name}</span>
                                            <span style={{ fontSize: '9px', color: theme.colors.text.tertiary }}>{asset.size}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            height: '200px', color: theme.colors.text.tertiary
                        }}>
                            <FolderOpen size={32} strokeWidth={1} style={{ marginBottom: '8px', color: theme.colors.gray[300] }} />
                            <p style={{ fontSize: '13px', fontWeight: 500 }}>
                                {searchQuery ? 'No matches' : 'No assets yet'}
                            </p>
                            <p style={{ fontSize: '11px', marginTop: '2px' }}>
                                {searchQuery ? 'Try different keywords' : 'Upload your first asset'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 20px',
                    borderTop: `1px solid ${theme.colors.border.default}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
                }}>
                    <div style={{ fontSize: '11px', color: theme.colors.text.tertiary }}>
                        {selectedAsset
                            ? <span>Selected: <strong style={{ color: theme.colors.text.primary }}>{selectedAsset.name}</strong> ({selectedAsset.size})</span>
                            : <span>{filtered.length} asset{filtered.length !== 1 ? 's' : ''} · Double-click to quick-select</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <Button variant="outline" className="h-8 text-xs" onClick={onClose}>Cancel</Button>
                        <Button className="h-8 text-xs" style={{ backgroundColor: theme.colors.primary[600] }}
                            onClick={handleConfirm} disabled={!selectedId}>
                            Select
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
