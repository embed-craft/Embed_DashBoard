import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search, X, Layers, Globe, Building2, ChevronRight,
    Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

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
}

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: Template) => void;
    onStartBlank: () => void;
    nudgeType?: string | null;
}

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

const CATEGORIES = ['All', 'Marketing', 'Onboarding', 'Feedback', 'Announcement', 'Support', 'Other'];
const NUDGE_TYPES = [
    { id: 'all', label: 'All Types' },
    { id: 'bottomsheet', label: 'Bottom Sheet' },
    { id: 'tooltip', label: 'Tooltip' },
    { id: 'floater', label: 'Floater' },
    { id: 'fullscreen', label: 'Full Screen' },
    { id: 'spinthewheel', label: 'Spin The Wheel' },
];

const TemplateCard: React.FC<{
    template: Template;
    isSelected: boolean;
    onClick: () => void;
    onUse: () => void;
}> = ({ template, isSelected, onClick, onUse }) => {
    const nudgeType = template.type || template.config?.type || 'bottomsheet';
    const gradient = typeGradients[nudgeType] || typeGradients.bottomsheet;
    const dot = typeDots[nudgeType] || typeDots.bottomsheet;
    const hasThumbnail = template.thumbnail && (
        template.thumbnail.startsWith('data:') || template.thumbnail.startsWith('http')
    );

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-xl
                ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200 hover:border-gray-300'}
            `}
            style={{ animationFillMode: 'both' }}
        >
            {/* Thumbnail */}
            <div className="aspect-[9/14] relative overflow-hidden bg-gray-50">
                {hasThumbnail ? (
                    <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-5xl opacity-80">🎨</span>
                    </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2.5 left-2.5">
                    <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm border border-white/60">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {nudgeTypeLabel[nudgeType] || nudgeType}
                    </span>
                </div>

                {/* System badge */}
                {template.is_system && (
                    <div className="absolute top-2.5 right-2.5">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            System
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onUse(); }}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                    >
                        Use Template
                    </Button>
                </div>
            </div>

            {/* Card footer */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
                        {template.name}
                    </p>
                    {isSelected && <ChevronRight size={14} className="text-indigo-500 shrink-0 mt-0.5" />}
                </div>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">{template.category}</p>
                {template.layers && template.layers.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                        <Layers size={9} />
                        <span className="text-[10px]">{template.layers.length} layers</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
    onStartBlank,
    nudgeType,
}) => {
    const [templates, setTemplates]         = useState<Template[]>([]);
    const [loading, setLoading]             = useState(false);
    const [search, setSearch]               = useState('');
    const [source, setSource]               = useState<'system' | 'mine'>('system');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter]       = useState(nudgeType || 'all');
    const [selected, setSelected]           = useState<Template | null>(null);
    const [showAllTypes, setShowAllTypes]   = useState(!nudgeType);

    // Sync type filter when nudgeType prop changes
    useEffect(() => {
        if (nudgeType) {
            setTypeFilter(nudgeType);
            setShowAllTypes(false);
        }
    }, [nudgeType]);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.listTemplates({ search: search || undefined });
            setTemplates(res.templates || []);
        } catch {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        if (isOpen) fetchTemplates();
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => fetchTemplates(), 300);
        return () => clearTimeout(t);
    }, [search, isOpen]);

    const filtered = templates.filter((t) => {
        const tType = t.type || t.config?.type || '';
        if (source === 'system' && !t.is_system) return false;
        if (source === 'mine' && t.is_system) return false;
        if (categoryFilter !== 'All' && t.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
        const activeType = showAllTypes ? 'all' : typeFilter;
        if (activeType !== 'all' && tType !== activeType) return false;
        return true;
    });

    const handleUse = (template: Template) => {
        onSelectTemplate(template);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[1100px] h-[88vh] p-0 flex flex-col gap-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Start with a professional design</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Source tabs */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                                {[
                                    { id: 'system', label: 'System', icon: Globe },
                                    { id: 'mine', label: 'Mine', icon: Building2 },
                                ].map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSource(id as 'system' | 'mine')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                            ${source === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Icon size={12} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-56">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search templates…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
                                />
                            </div>

                            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Type filter chip from builder */}
                    {nudgeType && (
                        <div className="mt-3 flex items-center gap-2">
                            {!showAllTypes ? (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-medium">
                                        Showing: {nudgeTypeLabel[nudgeType] || nudgeType} templates
                                    </span>
                                    <button
                                        onClick={() => { setShowAllTypes(true); setTypeFilter('all'); }}
                                        className="text-gray-400 hover:text-gray-600 underline underline-offset-2"
                                    >
                                        Show all types
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setShowAllTypes(false); setTypeFilter(nudgeType); }}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <ArrowLeft size={12} />
                                    Back to {nudgeTypeLabel[nudgeType] || nudgeType} templates
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left sidebar */}
                    <div className="w-48 shrink-0 border-r border-gray-100 bg-gray-50/50 overflow-y-auto p-3 space-y-5">
                        {/* Category */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Category</p>
                            <div className="space-y-0.5">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                                            ${categoryFilter === cat
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nudge Type */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Type</p>
                            <div className="space-y-0.5">
                                {NUDGE_TYPES.map((nt) => {
                                    const active = showAllTypes
                                        ? nt.id === 'all'
                                        : typeFilter === nt.id;
                                    return (
                                        <button
                                            key={nt.id}
                                            onClick={() => {
                                                setTypeFilter(nt.id);
                                                setShowAllTypes(nt.id === 'all');
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all
                                                ${active
                                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                                }`}
                                        >
                                            {nt.id !== 'all' && (
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDots[nt.id] || 'bg-gray-400'}`} />
                                            )}
                                            {nt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main grid area */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                        <div className="aspect-[9/14] bg-gray-100" />
                                        <div className="p-3 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                                            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Blank canvas */}
                                <div
                                    onClick={() => { onStartBlank(); onClose(); }}
                                    className="group relative bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-50"
                                >
                                    <div className="aspect-[9/14] flex flex-col items-center justify-center bg-gray-50 group-hover:bg-indigo-50/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-dashed border-gray-300 group-hover:border-indigo-400 flex items-center justify-center mb-3 transition-colors">
                                            <Sparkles size={22} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <p className="text-xs font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">Blank Canvas</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Start from scratch</p>
                                    </div>
                                </div>

                                {filtered.map((template, i) => (
                                    <TemplateCard
                                        key={template._id}
                                        template={template}
                                        isSelected={selected?._id === template._id}
                                        onClick={() => setSelected(selected?._id === template._id ? null : template)}
                                        onUse={() => handleUse(template)}
                                    />
                                ))}

                                {!loading && filtered.length === 0 && (
                                    <div className="col-span-4 py-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                                            <Search size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-base font-semibold text-gray-700">No templates found</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {source === 'mine' ? "You haven't saved any templates yet." : "Try adjusting your filters."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right — Preview panel (when card clicked) */}
                    {selected && (
                        <div className="w-64 shrink-0 border-l border-gray-100 bg-white overflow-y-auto p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</p>
                                <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Thumbnail */}
                            <div className="aspect-[9/16] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                {selected.thumbnail && (selected.thumbnail.startsWith('data:') || selected.thumbnail.startsWith('http')) ? (
                                    <img src={selected.thumbnail} alt={selected.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${typeGradients[selected.type || 'modal'] || typeGradients.modal} flex items-center justify-center`}>
                                        <span className="text-4xl">🎨</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{selected.name}</p>
                                    <p className="text-[11px] text-gray-400 capitalize mt-0.5">{selected.category}</p>
                                </div>
                                {selected.description && (
                                    <p className="text-xs text-gray-600 leading-relaxed">{selected.description}</p>
                                )}
                                {selected.tags && selected.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {selected.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {selected.layers && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                        <Layers size={11} />
                                        {selected.layers.length} layers
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => handleUse(selected)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                            >
                                Use Template
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelected(null)} className="w-full text-xs">
                                Back to gallery
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateGallery;
export { TemplateGallery };
