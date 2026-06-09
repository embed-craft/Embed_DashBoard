import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, MoreVertical, Trash2, Copy, Edit3,
    Globe, Building2, LayoutTemplate, Layers, Clock,
    Sparkles, Loader2, Rocket, X, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { CreateTemplateDialog } from '@/components/campaign/CreateTemplateDialog';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Template {
    _id: string;
    id?: string;
    name: string;
    category: string;
    description?: string;
    thumbnail?: string;
    tags?: string[];
    type?: string;
    config?: any;
    is_system: boolean;
    layers?: any[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: { name: string };
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const NUDGE_TYPES = [
    { id: 'all',         label: 'All Types' },
    { id: 'bottomsheet', label: 'Bottom Sheet' },
    { id: 'tooltip',     label: 'Tooltip' },
    { id: 'floater',     label: 'Floater' },
    { id: 'fullscreen',  label: 'Full Screen' },
    { id: 'spinthewheel',label: 'Spin The Wheel' },
];

const typeGradients: Record<string, string> = {
    bottomsheet: 'from-indigo-500 to-violet-600',
    modal:       'from-blue-500 to-cyan-500',
    tooltip:     'from-amber-400 to-orange-500',
    floater:     'from-teal-500 to-emerald-600',
    fullscreen:  'from-slate-600 to-gray-800',
    banner:      'from-sky-400 to-blue-500',
    spinthewheel: 'from-purple-400 to-fuchsia-500',
};

const typeDots: Record<string, string> = {
    bottomsheet: 'bg-indigo-500',
    modal:       'bg-blue-500',
    tooltip:     'bg-amber-500',
    floater:     'bg-teal-500',
    fullscreen:  'bg-slate-600',
    banner:      'bg-sky-500',
    spinthewheel: 'bg-purple-500',
};

const nudgeTypeLabel: Record<string, string> = {
    bottomsheet: 'Bottom Sheet',
    modal:       'Modal',
    tooltip:     'Tooltip',
    floater:     'Floater',
    fullscreen:  'Full Screen',
    banner:      'Banner',
    spinthewheel: 'Spin The Wheel',
};

// Mini phone preview wireframes for each nudge type (inline SVG-like CSS art)
const NudgeTypePreview: React.FC<{ type: string }> = ({ type }) => {
    const phone = (
        <div className="w-full h-full rounded-[6px] border border-white/20 bg-white/10 relative overflow-hidden">
            {/* Status bar */}
            <div className="h-[6px] flex items-center justify-between px-1.5 bg-white/5">
                <div className="w-2 h-[2px] rounded-full bg-white/30" />
                <div className="w-3 h-[2px] rounded-full bg-white/30" />
            </div>
            {/* Content area */}
            <div className="absolute inset-x-0 top-[6px] bottom-0 flex flex-col">
                {type === 'bottomsheet' && (
                    <>
                        <div className="flex-1" />
                        <div className="mx-1 mb-1 rounded-t-[4px] bg-white/90 p-1 shadow-lg">
                            <div className="w-4 h-[2px] rounded-full bg-gray-300 mx-auto mb-1" />
                            <div className="w-full h-[3px] rounded-full bg-indigo-300 mb-0.5" />
                            <div className="w-3/4 h-[2px] rounded-full bg-gray-200" />
                        </div>
                    </>
                )}
                {type === 'modal' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[70%] bg-white/90 rounded-[3px] p-1.5 shadow-lg">
                            <div className="w-full h-[3px] rounded-full bg-blue-300 mb-1" />
                            <div className="w-3/4 h-[2px] rounded-full bg-gray-200 mb-1" />
                            <div className="w-full h-[5px] rounded-[2px] bg-blue-400" />
                        </div>
                    </div>
                )}
                {type === 'banner' && (
                    <>
                        <div className="mx-0 bg-white/90 p-1 shadow-sm">
                            <div className="w-full h-[3px] rounded-full bg-sky-300 mb-0.5" />
                            <div className="w-2/3 h-[2px] rounded-full bg-gray-200" />
                        </div>
                        <div className="flex-1" />
                    </>
                )}
                {type === 'tooltip' && (
                    <div className="flex-1 flex items-start justify-center pt-3">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/90 rounded-[3px] px-1.5 py-1 shadow-lg">
                                <div className="w-6 h-[2px] rounded-full bg-amber-300 mb-0.5" />
                                <div className="w-4 h-[2px] rounded-full bg-gray-200" />
                            </div>
                            <div className="w-[5px] h-[5px] bg-white/90 rotate-45 -mt-[3px]" />
                        </div>
                    </div>
                )}
                {type === 'floater' && (
                    <>
                        <div className="flex-1" />
                        <div className="absolute bottom-1.5 right-1.5 w-[14px] h-[14px] rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <div className="w-[6px] h-[6px] rounded-full bg-teal-400" />
                        </div>
                    </>
                )}
                {type === 'fullscreen' && (
                    <div className="flex-1 bg-white/10 flex flex-col items-center justify-center p-1">
                        <div className="w-[60%] h-[8px] rounded-[2px] bg-white/25 mb-1" />
                        <div className="w-[45%] h-[2px] rounded-full bg-white/20 mb-1" />
                        <div className="w-[50%] h-[5px] rounded-[2px] bg-white/40" />
                    </div>
                )}
                {type === 'spinthewheel' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[60%] aspect-square bg-white/90 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden border border-purple-200/50">
                             <div className="absolute inset-x-0 h-0.5 bg-gray-200 rotate-45" />
                             <div className="absolute inset-y-0 w-0.5 bg-gray-200 rotate-45" />
                             <div className="absolute inset-x-0 h-0.5 bg-gray-200" />
                             <div className="absolute inset-y-0 w-0.5 bg-gray-200" />
                             <div className="w-1.5 h-1.5 bg-purple-500 rounded-full z-10 shadow-sm border border-white" />
                        </div>
                    </div>
                )}
                {!['bottomsheet','modal','banner','tooltip','floater','fullscreen','spinthewheel'].includes(type) && (
                    <div className="flex-1 flex items-center justify-center">
                        <LayoutTemplate size={12} className="text-white/40" />
                    </div>
                )}
            </div>
        </div>
    );
    return phone;
};

// ─── Delete Confirm Dialog ──────────────────────────────────────────────────────

const DeleteConfirmDialog: React.FC<{
    template: Template | null;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ template, onConfirm, onCancel }) => {
    if (!template) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">Delete Template</p>
                        <p className="text-xs text-gray-400">This cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">"{template.name}"</span>?
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">Cancel</Button>
                    <Button size="sm" onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
                </div>
            </div>
        </div>
    );
};

// ─── Template Card ──────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{
    template: Template;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onUse: () => void;
    index: number;
}> = ({ template, onEdit, onDuplicate, onDelete, onUse, index }) => {
    const nudgeType = template.type || template.config?.type || 'bottomsheet';
    const gradient = typeGradients[nudgeType] || typeGradients.bottomsheet;
    const dot = typeDots[nudgeType] || typeDots.bottomsheet;
    const hasThumbnail = template.thumbnail && (
        template.thumbnail.startsWith('data:') || template.thumbnail.startsWith('http')
    );
    const timeAgo = template.updatedAt
        ? formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })
        : null;

    return (
        <div
            className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer
                transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-300 flex flex-col"
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
        >
            {/* Thumbnail — Phone Preview */}
            <div className="aspect-video relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

                {hasThumbnail ? (
                    /* Show actual captured screenshot in a phone frame */
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                        <div className="relative h-full aspect-[9/19.5] rounded-[8px] border-[2.5px] border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[5px] bg-gray-800 rounded-b-[4px] z-10" />
                            <img
                                src={template.thumbnail}
                                alt={template.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    </div>
                ) : (
                    /* CSS wireframe phone preview */
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                        <div className="relative h-full aspect-[9/19.5] rounded-[8px] border-[2.5px] border-white/25 bg-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[5px] bg-black/20 rounded-b-[4px] z-10" />
                            {/* Inner phone preview */}
                            <div className="absolute inset-[2px] top-[6px] rounded-[4px] overflow-hidden">
                                <NudgeTypePreview type={nudgeType} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Badges container */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none z-20">
                    <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-semibold px-2 py-0.5 rounded-full text-gray-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {nudgeTypeLabel[nudgeType] || nudgeType}
                    </span>
                    {template.is_system && (
                        <span className="bg-amber-100/90 backdrop-blur-sm text-amber-800 border border-amber-200/50 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            System
                        </span>
                    )}
                </div>

                {/* Hover Overlay with Use Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUse(); }}
                        className="flex items-center justify-center gap-2 bg-white text-gray-900 text-xs font-bold px-5 py-2 rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-xl translate-y-3 group-hover:translate-y-0 duration-300"
                    >
                        <Rocket size={13} />
                        Use Template
                    </button>
                </div>
            </div>

            {/* Card Body & Footer */}
            <div className="p-3 flex flex-col flex-1 bg-white relative">
                <div className="flex-1 min-w-0 mb-2.5">
                    <p className="text-[13px] font-bold text-gray-800 truncate" title={template.name}>{template.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                        {template.layers && template.layers.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                                <Layers size={10} className="text-gray-300" /> {template.layers.length} layers
                            </span>
                        )}
                        {timeAgo && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                                <Clock size={10} className="text-gray-300" /> {timeAgo}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="flex items-center gap-0.5 pt-2.5 border-t border-gray-100">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Design"
                    >
                        <Edit3 size={11} /> Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={11} /> Copy
                    </button>
                    {!template.is_system && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={11} /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Skeleton Card ──────────────────────────────────────────────────────────────

const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse flex flex-col">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50" />
        <div className="p-3.5 space-y-3 flex-1 flex flex-col">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-50 rounded w-1/2" />
            <div className="mt-auto pt-3 border-t border-gray-50 flex gap-2">
                <div className="h-6 bg-gray-50 rounded flex-1" />
                <div className="h-6 bg-gray-50 rounded flex-1" />
                <div className="h-6 bg-gray-50 rounded flex-1" />
            </div>
        </div>
    </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────────

const Templates: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates]         = useState<Template[]>([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [typeFilter, setTypeFilter]       = useState('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget]   = useState<Template | null>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.listTemplates({});
            setTemplates(res.templates || []);
        } catch {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, []);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => fetchTemplates(), 350);
        return () => clearTimeout(t);
    }, [search]);

    const filtered = templates.filter((t) => {
        const tType = t.type || t.config?.type || '';
        // Filtering all templates independent of is_system flag
        if (typeFilter !== 'all' && tType !== typeFilter) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleEdit = (template: Template) => {
        navigate(`/campaign-builder?mode=template&id=${template._id || template.id}`);
    };

    const handleDuplicate = async (template: Template) => {
        try {
            const { name, category, type, config, layers, tags } = template;
            await apiClient.createTemplate({
                name: `${name} (Copy)`,
                category,
                type,
                config,
                layers: layers || [],
                tags: tags || [],
                thumbnail: template.thumbnail || null,
                is_system: false,
            });
            toast.success('Template duplicated!');
            fetchTemplates();
        } catch {
            toast.error('Failed to duplicate template');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await apiClient.deleteTemplate(deleteTarget._id || deleteTarget.id || '');
            toast.success('Template deleted');
            setDeleteTarget(null);
            fetchTemplates();
        } catch {
            toast.error('Failed to delete template');
        }
    };

    // "Use in Campaign" — industrial standard: create new campaign from template, navigate to builder
    const handleUse = (template: Template) => {
        const nudgeType = template.type || template.config?.type || 'bottomsheet';
        const templateId = template._id || template.id;
        navigate(`/campaign-builder?experience=nudges&nudge=${nudgeType}&template=${templateId}`);
    };

    return (
        <div className="flex h-full bg-gray-50/50 overflow-hidden">
            {/* ── Left Sidebar ────────────────────────────────────────────── */}
            <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
                {/* Sidebar Header */}
                <div className="px-4 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <LayoutTemplate size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">Templates</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Reusable designs for campaigns</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-5">
                    {/* Type Filter */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Nudge Type</p>
                        <div className="space-y-0.5">
                            {NUDGE_TYPES.map((nt) => (
                                <button
                                    key={nt.id}
                                    onClick={() => setTypeFilter(nt.id)}
                                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
                                        ${typeFilter === nt.id
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    {nt.id !== 'all' && (
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDots[nt.id] || 'bg-gray-400'}`} />
                                    )}
                                    {nt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search templates…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {typeFilter !== 'all' && (
                                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    {nudgeTypeLabel[typeFilter]}
                                    <button onClick={() => setTypeFilter('all')}><X size={10} /></button>
                                </span>
                            )}
                        </div>

                        {!loading && (
                            <span className="text-xs text-gray-400 font-medium">
                                {filtered.length} template{filtered.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm gap-2 shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                    >
                        <Plus size={15} />
                        New Template
                    </Button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-24">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center">
                                    <Sparkles size={30} className="text-indigo-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                                    <Plus size={14} className="text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">No templates found</p>
                            <p className="text-sm text-gray-400 mb-6 max-w-xs">
                                Create your first template, or save a campaign design as a template from the Campaign Builder.
                            </p>
                            <Button onClick={() => setCreateDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                <Plus size={15} />
                                Create First Template
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {filtered.map((template, i) => (
                                <TemplateCard
                                    key={template._id}
                                    template={template}
                                    index={i}
                                    onEdit={() => handleEdit(template)}
                                    onDuplicate={() => handleDuplicate(template)}
                                    onDelete={() => setDeleteTarget(template)}
                                    onUse={() => handleUse(template)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Dialogs ──────────────────────────────────────────────────── */}
            <CreateTemplateDialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={() => fetchTemplates()}
            />

            <DeleteConfirmDialog
                template={deleteTarget}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default Templates;
