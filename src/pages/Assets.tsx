import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, Search, Trash2, Copy, FileText,
    Image as ImageIcon, Film, Pencil, ExternalLink, Eye,
    CloudUpload, Link as LinkIcon, Loader2, MoreHorizontal,
    CheckCircle2, HardDrive, X, Grid3X3, List, Sparkles,
    Plus, FolderOpen, ArrowUpCircle, ZoomIn
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Asset {
    _id: string;
    name: string;
    type: 'image' | 'video' | 'file';
    mimeType?: string;
    url: string;
    size: string;
    sizeBytes?: number;
    createdAt: string;
    updatedAt?: string;
}

interface AssetMeta {
    total: number;
    images: number;
    videos: number;
    files: number;
    totalSize: string;
    totalSizeBytes: number;
}

type FilterType = 'all' | 'image' | 'video' | 'file';
type ViewMode = 'grid' | 'list';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');

const getAssetUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `${API_BASE}${url}`;
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string; gradient: string }> = {
    image: { icon: ImageIcon, label: 'IMAGE', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    video: { icon: Film, label: 'VIDEO', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
    file: { icon: FileText, label: 'FILE', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', gradient: 'linear-gradient(135deg,#6b7280,#9ca3af)' },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div style={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(229,231,235,0.8)',
        backgroundColor: '#fff',
        animation: 'pulse 1.8s ease-in-out infinite'
    }}>
        <div style={{ aspectRatio: '1', background: 'linear-gradient(110deg, #f3f4f6 30%, #e9eaeb 50%, #f3f4f6 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '12px', borderRadius: '6px', background: 'linear-gradient(110deg, #f3f4f6 30%, #e9eaeb 50%, #f3f4f6 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', width: '70%' }} />
            <div style={{ height: '10px', borderRadius: '6px', background: 'linear-gradient(110deg, #f3f4f6 30%, #e9eaeb 50%, #f3f4f6 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', width: '40%' }} />
        </div>
    </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color, active, onClick }: {
    icon: any; label: string; value: number | string; color: string; active: boolean; onClick: () => void;
}) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            backgroundColor: active ? `${color}15` : 'transparent',
            outline: active ? `1.5px solid ${color}40` : '1.5px solid transparent',
            transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
            transform: active ? 'translateY(-1px)' : 'none'
        }}
    >
        <Icon size={13} style={{ color: active ? color : '#9ca3af', transition: 'color 0.15s' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: active ? color : '#6b7280', transition: 'color 0.15s' }}>{label}</span>
        <span style={{
            fontSize: '11px', fontWeight: 700,
            color: active ? '#fff' : '#9ca3af',
            backgroundColor: active ? color : '#e5e7eb',
            padding: '1px 7px', borderRadius: '20px',
            transition: 'all 0.15s',
            minWidth: '20px', textAlign: 'center'
        }}>{value}</span>
    </button>
);

// ─── Asset Card (Grid) ────────────────────────────────────────────────────────
const AssetCard = ({
    asset, copiedId, renamingId, renameValue,
    onView, onCopy, onRename, onDelete, onRenameChange, onRenameSubmit, onRenameCancel
}: {
    asset: Asset; copiedId: string | null; renamingId: string | null; renameValue: string;
    onView: () => void; onCopy: () => void; onRename: () => void; onDelete: () => void;
    onRenameChange: (v: string) => void; onRenameSubmit: () => void; onRenameCancel: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const typeConf = TYPE_CONFIG[asset.type] || TYPE_CONFIG.file;
    const TypeIcon = typeConf.icon;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onView}
            style={{
                borderRadius: '16px',
                border: `1.5px solid ${isHovered ? 'rgba(99,102,241,0.4)' : 'rgba(229,231,235,0.8)'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: isHovered ? 'translateY(-3px) scale(1.005)' : 'translateY(0) scale(1)',
                boxShadow: isHovered
                    ? '0 12px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.08)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
            }}
        >
            {/* Thumbnail */}
            <div style={{
                aspectRatio: '4/3',
                backgroundColor: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                borderBottom: '1px solid rgba(229,231,235,0.6)'
            }}>
                {asset.type === 'image' ? (
                    <img
                        src={getAssetUrl(asset.url)}
                        alt={asset.name}
                        loading="lazy"
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
                        }}
                    />
                ) : asset.type === 'video' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: typeConf.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 16px ${typeConf.color}40`
                        }}>
                            <Film size={22} style={{ color: '#fff' }} />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: typeConf.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 16px ${typeConf.color}40`
                        }}>
                            <FileText size={22} style={{ color: '#fff' }} />
                        </div>
                    </div>
                )}

                {/* Type badge */}
                <div style={{
                    position: 'absolute', top: '8px', left: '8px',
                    backgroundColor: typeConf.bg,
                    backdropFilter: 'blur(8px)',
                    padding: '3px 8px', borderRadius: '6px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                    color: typeConf.color,
                    border: `1px solid ${typeConf.color}30`
                }}>
                    {typeConf.label}
                </div>

                {/* Hover overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(); }}
                        style={{
                            padding: '7px 14px', borderRadius: '8px',
                            border: 'none', backgroundColor: 'rgba(255,255,255,0.92)',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: '#111827',
                            backdropFilter: 'blur(4px)',
                            transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        <ZoomIn size={13} /> Preview
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopy(); }}
                        style={{
                            padding: '7px 7px', borderRadius: '8px',
                            border: 'none', backgroundColor: 'rgba(255,255,255,0.85)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            backdropFilter: 'blur(4px)',
                            transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
                            transition: 'transform 0.25s ease 0.03s',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        {copiedId === asset._id
                            ? <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            : <Copy size={14} style={{ color: '#6b7280' }} />
                        }
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    {renamingId === asset._id ? (
                        <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => onRenameChange(e.target.value)}
                            onBlur={onRenameSubmit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onRenameSubmit();
                                if (e.key === 'Escape') onRenameCancel();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                fontSize: '12px', fontWeight: 500, flex: 1,
                                border: '1.5px solid #6366f1',
                                borderRadius: '6px', padding: '2px 7px',
                                outline: 'none', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)'
                            }}
                        />
                    ) : (
                        <span style={{
                            fontSize: '12px', fontWeight: 600, color: '#111827',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                        }} title={asset.name}>{asset.name}</span>
                    )}

                    {renamingId !== asset._id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        width: '22px', height: '22px', borderRadius: '6px', border: 'none',
                                        backgroundColor: isHovered ? '#f3f4f6' : 'transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s', flexShrink: 0
                                    }}
                                >
                                    <MoreHorizontal size={13} style={{ color: '#9ca3af' }} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[170px] shadow-lg border border-gray-100">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(); }} className="text-xs cursor-pointer gap-2">
                                    <Copy className="h-3.5 w-3.5 text-gray-400" /> Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }} className="text-xs cursor-pointer gap-2">
                                    <Pencil className="h-3.5 w-3.5 text-gray-400" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(getAssetUrl(asset.url), '_blank'); }} className="text-xs cursor-pointer gap-2">
                                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" /> Open Original
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-xs cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>{asset.size || '—'}</span>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ─── Asset Row (List) ─────────────────────────────────────────────────────────
const AssetRow = ({ asset, copiedId, onView, onCopy, onRename, onDelete }: {
    asset: Asset; copiedId: string | null;
    onView: () => void; onCopy: () => void; onRename: () => void; onDelete: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const typeConf = TYPE_CONFIG[asset.type] || TYPE_CONFIG.file;
    const TypeIcon = typeConf.icon;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onView}
            style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '10px 20px', cursor: 'pointer',
                backgroundColor: isHovered ? 'rgba(99,102,241,0.025)' : 'transparent',
                borderBottom: '1px solid rgba(229,231,235,0.7)',
                transition: 'background 0.15s ease'
            }}
        >
            {/* Thumb */}
            <div style={{
                width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
                border: '1.5px solid rgba(229,231,235,0.8)',
                backgroundColor: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {asset.type === 'image'
                    ? <img src={getAssetUrl(asset.url)} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : <TypeIcon size={20} style={{ color: typeConf.color }} />
                }
            </div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>{formatDate(asset.createdAt)}</p>
            </div>

            {/* Type badge */}
            <span style={{
                fontSize: '9px', fontWeight: 700, color: typeConf.color,
                backgroundColor: typeConf.bg, padding: '3px 8px', borderRadius: '6px',
                border: `1px solid ${typeConf.color}30`, letterSpacing: '0.05em', flexShrink: 0
            }}>{typeConf.label}</span>

            {/* Size */}
            <span style={{ fontSize: '11px', color: '#9ca3af', width: '70px', textAlign: 'right', flexShrink: 0 }}>{asset.size || '—'}</span>

            {/* Actions */}
            <div style={{
                display: 'flex', gap: '4px', flexShrink: 0,
                opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s'
            }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onCopy} style={{ padding: '5px', borderRadius: '6px', border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
                    {copiedId === asset._id ? <CheckCircle2 size={13} style={{ color: '#10b981' }} /> : <Copy size={13} style={{ color: '#6b7280' }} />}
                </button>
                <button onClick={onView} style={{ padding: '5px', borderRadius: '6px', border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
                    <Eye size={13} style={{ color: '#6b7280' }} />
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button style={{ padding: '5px', borderRadius: '6px', border: 'none', backgroundColor: '#f3f4f6', cursor: 'pointer' }}>
                            <MoreHorizontal size={13} style={{ color: '#6b7280' }} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] shadow-lg border border-gray-100">
                        <DropdownMenuItem onClick={onRename} className="text-xs cursor-pointer gap-2"><Pencil className="h-3.5 w-3.5" /> Rename</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(getAssetUrl(asset.url), '_blank')} className="text-xs cursor-pointer gap-2"><ExternalLink className="h-3.5 w-3.5" /> Open</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-xs cursor-pointer gap-2 text-red-600 focus:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AssetsPage = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [meta, setMeta] = useState<AssetMeta>({ total: 0, images: 0, videos: 0, files: 0, totalSize: '0 B', totalSizeBytes: 0 });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isDragOver, setIsDragOver] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.listAssets();
            const assetList = res.assets || [];
            setAssets(assetList);

            const formatBytes = (bytes: number) => {
                if (bytes === 0) return '0 B';
                const units = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
            };
            const totalImages = assetList.filter((a: Asset) => a.type === 'image').length;
            const totalVideos = assetList.filter((a: Asset) => a.type === 'video').length;
            const totalFiles = assetList.filter((a: Asset) => a.type === 'file').length;
            const totalSizeBytes = assetList.reduce((sum: number, a: Asset) => sum + (a.sizeBytes || 0), 0);
            setMeta({
                total: assetList.length, images: totalImages, videos: totalVideos, files: totalFiles,
                totalSize: res.meta?.totalSize || formatBytes(totalSizeBytes),
                totalSizeBytes: res.meta?.totalSizeBytes || totalSizeBytes,
            });
        } catch (err) {
            console.error('Failed to fetch assets:', err);
            toast.error('Failed to load assets');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAssets(); }, [fetchAssets]);

    const handleFiles = async (files: FileList | File[]) => {
        const arr = Array.from(files);
        if (!arr.length) return;
        const over = arr.filter(f => f.size > 10 * 1024 * 1024);
        if (over.length) { toast.error(`Files exceeding 10MB: ${over.map(f => f.name).join(', ')}`); return; }
        setUploading(true);
        try {
            if (arr.length === 1) { await apiClient.uploadAsset(arr[0]); toast.success(`✓ Uploaded ${arr[0].name}`); }
            else { const r = await apiClient.uploadMultipleAssets(arr); toast.success(`✓ Uploaded ${r.count} files`); }
            await fetchAssets();
        } catch (e: any) { toast.error(e?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { handleFiles(e.target.files); e.target.value = ''; } };
    const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); };
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };

    const handleAddUrl = async () => {
        if (!urlInput.trim()) { toast.error('Enter a URL'); return; }
        try {
            await apiClient.createAssetFromUrl({ name: nameInput.trim() || urlInput.split('/').pop()?.split('?')[0] || 'Untitled', url: urlInput.trim() });
            toast.success('Asset added');
            setIsUrlDialogOpen(false); setUrlInput(''); setNameInput('');
            await fetchAssets();
        } catch { toast.error('Failed to add asset'); }
    };

    const submitRename = async () => {
        if (!renamingId || !renameValue.trim()) { setRenamingId(null); return; }
        try {
            const u = await apiClient.renameAsset(renamingId, renameValue.trim());
            setAssets(prev => prev.map(a => a._id === renamingId ? { ...a, name: u.name } : a));
            toast.success('Renamed');
        } catch { toast.error('Rename failed'); }
        setRenamingId(null);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await apiClient.deleteAsset(deleteTarget._id);
            toast.success('Deleted');
            await fetchAssets();
        } catch { toast.error('Delete failed'); }
        setDeleteTarget(null);
    };

    const copyUrl = (a: Asset) => {
        navigator.clipboard.writeText(getAssetUrl(a.url));
        setCopiedId(a._id);
        toast.success('URL copied to clipboard');
        setTimeout(() => setCopiedId(null), 1500);
    };

    const filtered = assets.filter(a => {
        if (filterType !== 'all' && a.type !== filterType) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const FILTERS = [
        { id: 'all' as FilterType, label: 'All', value: meta.total, icon: Grid3X3, color: '#6366f1' },
        { id: 'image' as FilterType, label: 'Images', value: meta.images, icon: ImageIcon, color: '#6366f1' },
        { id: 'video' as FilterType, label: 'Videos', value: meta.videos, icon: Film, color: '#ec4899' },
        { id: 'file' as FilterType, label: 'Files', value: meta.files, icon: FileText, color: '#6b7280' },
    ];

    return (
        <>
            {/* Global keyframe injection */}
            <style>{`
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
                .asset-card-enter { animation: fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1) both; }
            `}</style>

            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <PageHeader
                    title="Asset Library"
                    subtitle="Manage all media for your campaigns"
                    actions={
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} multiple accept="image/*,video/mp4,video/webm,.pdf,.json,.csv,.txt" />
                            <Button
                                variant="outline"
                                className="gap-2 h-9 text-sm bg-white shadow-sm"
                                onClick={() => setIsUrlDialogOpen(true)}
                                style={{ borderColor: '#e5e7eb', color: '#374151' }}
                            >
                                <LinkIcon size={14} /> From URL
                            </Button>
                            <Button
                                className="gap-2 h-9 text-sm font-semibold shadow-sm"
                                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', color: '#fff' }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading
                                    ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                                    : <><ArrowUpCircle size={14} /> Upload</>
                                }
                            </Button>
                        </div>
                    }
                />

                <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', animation: mounted ? 'fadeIn 0.4s ease' : 'none' }}>

                    {/* ── Toolbar card ── */}
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        border: '1.5px solid rgba(229,231,235,0.9)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        padding: '10px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        animation: mounted ? 'slideDown 0.35s cubic-bezier(0.4,0,0.2,1) both' : 'none'
                    }}>
                        {/* Filter pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            {FILTERS.map(f => (
                                <StatPill
                                    key={f.id}
                                    icon={f.icon}
                                    label={f.label}
                                    value={f.value}
                                    color={f.color}
                                    active={filterType === f.id}
                                    onClick={() => setFilterType(f.id)}
                                />
                            ))}

                            <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 6px' }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9ca3af' }}>
                                <HardDrive size={12} />
                                <span style={{ fontWeight: 600 }}>{meta.totalSize}</span>
                            </div>
                        </div>

                        {/* Right: Search + View toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    placeholder="Search assets…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', paddingLeft: '30px', paddingRight: '28px',
                                        paddingTop: '7px', paddingBottom: '7px',
                                        fontSize: '12px', border: '1.5px solid #e5e7eb',
                                        borderRadius: '10px', outline: 'none',
                                        backgroundColor: '#f9fafb', color: '#111827',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}>
                                        <X size={12} style={{ color: '#9ca3af' }} />
                                    </button>
                                )}
                            </div>

                            {/* View mode toggle */}
                            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '2px', gap: '2px' }}>
                                {([
                                    { mode: 'grid' as ViewMode, icon: Grid3X3 },
                                    { mode: 'list' as ViewMode, icon: List },
                                ] as const).map(({ mode, icon: Icon }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        style={{
                                            width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: viewMode === mode ? '#fff' : 'transparent',
                                            boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <Icon size={13} style={{ color: viewMode === mode ? '#6366f1' : '#9ca3af' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Content card ── */}
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            border: isDragOver ? '2px dashed #6366f1' : '1.5px solid rgba(229,231,235,0.9)',
                            boxShadow: isDragOver ? '0 0 0 4px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)' : '0 1px 4px rgba(0,0,0,0.04)',
                            minHeight: '500px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={() => setIsDragOver(false)}
                    >
                        {/* Drag Overlay */}
                        {isDragOver && (
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 50,
                                background: 'rgba(99,102,241,0.03)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(2px)',
                                animation: 'fadeIn 0.15s ease'
                            }}>
                                <div style={{ textAlign: 'center', animation: 'fadeInUp 0.2s ease' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '20px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
                                    }}>
                                        <CloudUpload size={28} style={{ color: '#fff' }} />
                                    </div>
                                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>Drop files to upload</p>
                                    <p style={{ fontSize: '12px', color: '#818cf8', marginTop: '4px' }}>Images, videos, PDFs up to 10MB</p>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
                                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            /* ── Empty ── */
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '80px 40px',
                                animation: 'fadeInUp 0.4s ease both'
                            }}>
                                <div style={{
                                    width: '72px', height: '72px', borderRadius: '20px',
                                    background: searchQuery ? '#f3f4f6' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '20px',
                                    boxShadow: searchQuery ? 'none' : '0 8px 24px rgba(99,102,241,0.25)'
                                }}>
                                    {searchQuery
                                        ? <Search size={28} strokeWidth={1.5} style={{ color: '#9ca3af' }} />
                                        : <CloudUpload size={28} strokeWidth={1.5} style={{ color: '#fff' }} />
                                    }
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                    {searchQuery ? `No results for "${searchQuery}"` : 'No assets yet'}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.6' }}>
                                    {searchQuery
                                        ? 'Try a different keyword or clear the search filter.'
                                        : 'Upload images, videos, or documents to get started. You can drag & drop files anywhere here.'}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            marginTop: '20px',
                                            padding: '10px 22px', borderRadius: '10px', border: 'none',
                                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                            color: '#fff', fontSize: '13px', fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                            transition: 'transform 0.15s, box-shadow 0.15s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)'; }}
                                    >
                                        <Upload size={14} /> Upload Files
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* ── Grid ── */
                            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
                                {filtered.map((asset, idx) => (
                                    <div key={asset._id} className="asset-card-enter" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
                                        <AssetCard
                                            asset={asset}
                                            copiedId={copiedId}
                                            renamingId={renamingId}
                                            renameValue={renameValue}
                                            onView={() => setPreviewAsset(asset)}
                                            onCopy={() => copyUrl(asset)}
                                            onRename={() => { setRenamingId(asset._id); setRenameValue(asset.name); }}
                                            onDelete={() => setDeleteTarget(asset)}
                                            onRenameChange={setRenameValue}
                                            onRenameSubmit={submitRename}
                                            onRenameCancel={() => setRenamingId(null)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* ── List ── */
                            <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                {/* List header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '10px 20px',
                                    borderBottom: '1px solid rgba(229,231,235,0.8)',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    <div style={{ width: '44px', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: '10px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Name</span>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', width: '60px', flexShrink: 0 }}>Type</span>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', width: '70px', textAlign: 'right', flexShrink: 0 }}>Size</span>
                                    <div style={{ width: '80px', flexShrink: 0 }} />
                                </div>
                                {filtered.map((asset, idx) => (
                                    <div key={asset._id} style={{ animation: `fadeInUp 0.25s ease ${Math.min(idx * 25, 200)}ms both` }}>
                                        <AssetRow
                                            asset={asset}
                                            copiedId={copiedId}
                                            onView={() => setPreviewAsset(asset)}
                                            onCopy={() => copyUrl(asset)}
                                            onRename={() => { setRenamingId(asset._id); setRenameValue(asset.name); }}
                                            onDelete={() => setDeleteTarget(asset)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── URL Dialog ─── */}
            <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
                <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0">
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <DialogTitle className="text-sm font-semibold text-gray-900">Add from URL</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 mt-0.5">Paste a direct link to any media file.</DialogDescription>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Label className="text-xs font-semibold text-gray-700">Image / Video URL</Label>
                            <Input
                                placeholder="https://example.com/image.png"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                                className="h-9 text-xs rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Label className="text-xs font-semibold text-gray-700">Name <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></Label>
                            <Input
                                placeholder="My asset name"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="h-9 text-xs rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        {urlInput && urlInput.match(/\.(jpeg|jpg|gif|png|webp|svg|avif)(\?.*)?$/i) && (
                            <div style={{ borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                                <img src={urlInput} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '14px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="ghost" size="sm" onClick={() => setIsUrlDialogOpen(false)} className="h-8 text-xs">Cancel</Button>
                        <Button size="sm" onClick={handleAddUrl} className="h-8 text-xs gap-1.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none' }}>
                            <Plus size={12} /> Add Asset
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── Preview Dialog ─── */}
            <Dialog open={!!previewAsset} onOpenChange={(o) => !o && setPreviewAsset(null)}>
                <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden gap-0" style={{ borderRadius: '20px' }}>
                    {previewAsset && (
                        <>
                            {/* Media preview area */}
                            <div style={{
                                backgroundColor: '#0a0a0f',
                                minHeight: '280px', maxHeight: '420px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Ambient glow */}
                                {previewAsset.type === 'image' && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundImage: `url(${getAssetUrl(previewAsset.url)})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        filter: 'blur(40px) brightness(0.3) saturate(2)',
                                        transform: 'scale(1.2)'
                                    }} />
                                )}
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    {previewAsset.type === 'image' ? (
                                        <img src={getAssetUrl(previewAsset.url)} alt={previewAsset.name}
                                            style={{ maxWidth: '640px', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
                                    ) : previewAsset.type === 'video' ? (
                                        <video src={getAssetUrl(previewAsset.url)} controls autoPlay
                                            style={{ maxWidth: '640px', maxHeight: '400px', borderRadius: '8px' }} />
                                    ) : (
                                        <div style={{ padding: '48px', textAlign: 'center' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg,#6b7280,#9ca3af)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                <FileText size={32} style={{ color: '#fff' }} />
                                            </div>
                                            <p style={{ color: '#9ca3af', fontSize: '12px' }}>No preview available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Type badge in corner */}
                                <div style={{
                                    position: 'absolute', top: '14px', left: '14px',
                                    backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                                    padding: '4px 10px', borderRadius: '8px',
                                    fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em'
                                }}>
                                    {previewAsset.type.toUpperCase()}
                                </div>
                            </div>

                            {/* Info panel */}
                            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {previewAsset.name}
                                    </h3>
                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                                        {previewAsset.size} · Uploaded {formatDate(previewAsset.createdAt)}
                                    </p>
                                </div>

                                {/* URL row */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    backgroundColor: '#f9fafb', borderRadius: '10px',
                                    padding: '8px 12px', border: '1.5px solid #e5e7eb',
                                    minWidth: 0
                                }}>
                                    <code style={{
                                        fontSize: '10px', color: '#6b7280', flex: 1, minWidth: 0,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {getAssetUrl(previewAsset.url)}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 h-6 gap-1 text-[10px] rounded-lg"
                                        onClick={() => copyUrl(previewAsset)}
                                    >
                                        {copiedId === previewAsset._id ? <CheckCircle2 size={10} className="text-green-500" /> : <Copy size={10} />}
                                        {copiedId === previewAsset._id ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button variant="outline" className="flex-1 gap-1.5 h-9 text-xs rounded-lg" onClick={() => window.open(getAssetUrl(previewAsset.url), '_blank')}>
                                        <ExternalLink size={12} /> Open Original
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-1.5 h-9 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => { setPreviewAsset(null); setDeleteTarget(previewAsset); }}
                                    >
                                        <Trash2 size={12} /> Delete
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Delete Alert ─── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent style={{ borderRadius: '16px' }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-semibold">Delete "{deleteTarget?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-gray-500">
                            This action is permanent. Any campaigns referencing this asset will lose the image.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="h-8 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white">
                            Delete Asset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AssetsPage;
