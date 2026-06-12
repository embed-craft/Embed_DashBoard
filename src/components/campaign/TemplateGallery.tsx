import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search, X, Layers, Globe, Building2, ChevronRight,
    Sparkles, Loader2, ArrowLeft, PanelBottom, MessageSquare, PictureInPicture, Maximize, LayoutTemplate
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

// A premium, dynamic wireframe mockup preview representing the template's layer-based structure.
const MiniTemplatePreview: React.FC<{ type: string; layers?: any[]; config?: any }> = ({ type, layers = [], config }) => {
    const normalizedType = (type || 'modal').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Extract root container background styling
    const containerLayer = layers.find(l => l.type === 'container' && !l.parent) || layers[0];
    const containerStyle: React.CSSProperties = {};

    // 1. Apply from config first (which holds editor customizations)
    if (config) {
        if (config.backgroundColor) {
            containerStyle.backgroundColor = config.backgroundColor;
        }
        if (config.backgroundImageUrl) {
            containerStyle.backgroundImage = `url('${config.backgroundImageUrl}')`;
            containerStyle.backgroundSize = config.backgroundSize || 'cover';
            containerStyle.backgroundPosition = config.backgroundPosition || 'center';
            containerStyle.backgroundRepeat = 'no-repeat';
        }
    }

    // 2. Override/supplement with containerLayer style
    if (containerLayer && containerLayer.style) {
        if (containerLayer.style.backgroundColor) {
            containerStyle.backgroundColor = containerLayer.style.backgroundColor;
        }
        if (containerLayer.style.backgroundImage) {
            const bgImage = containerLayer.style.backgroundImage;
            containerStyle.backgroundImage = bgImage.includes('url(') ? bgImage : `url('${bgImage}')`;
            containerStyle.backgroundSize = containerLayer.style.backgroundSize || 'cover';
            containerStyle.backgroundPosition = containerLayer.style.backgroundPosition || 'center';
            containerStyle.backgroundRepeat = 'no-repeat';
        } else if (containerLayer.style.backgroundImageUrl) {
            containerStyle.backgroundImage = `url('${containerLayer.style.backgroundImageUrl}')`;
            containerStyle.backgroundSize = 'cover';
            containerStyle.backgroundPosition = 'center';
            containerStyle.backgroundRepeat = 'no-repeat';
        }
    }

    const getMiniStyle = (style: any) => {
        if (!style) return {};
        const res: React.CSSProperties = {
            position: 'absolute',
        };
        
        const parseToPercent = (val: any, isHeight: boolean) => {
            if (val == null) return undefined;
            const str = val.toString().trim();
            if (str.endsWith('%')) return str;
            const num = parseFloat(str);
            if (isNaN(num)) return undefined;
            
            // Reference design sizes: 393 x 852
            const refSize = isHeight ? 852 : 393;
            return `${(num / refSize) * 100}%`;
        };

        if (style.left !== undefined) res.left = parseToPercent(style.left, false);
        else if (style.x !== undefined) res.left = parseToPercent(style.x, false);

        if (style.top !== undefined) res.top = parseToPercent(style.top, true);
        else if (style.y !== undefined) res.top = parseToPercent(style.y, true);

        if (style.width !== undefined) res.width = parseToPercent(style.width, false);
        if (style.height !== undefined) res.height = parseToPercent(style.height, true);

        return res;
    };

    const renderWireframeLayers = () => {
        const drawableLayers = layers.filter(l => l.type && l.type !== 'container');

        if (drawableLayers.length === 0) {
            return (
                <div className="flex flex-col gap-1 w-full h-full justify-center p-2.5">
                    <div className="h-1.5 w-2/3 bg-slate-900 rounded-full" />
                    <div className="h-1 w-full bg-slate-300 rounded-full" />
                    <div className="h-1 w-4/5 bg-slate-200 rounded-full" />
                    <div className="h-3.5 w-full bg-blue-600 rounded flex items-center justify-center mt-1">
                        <div className="h-0.5 w-1/3 bg-white rounded-full opacity-60" />
                    </div>
                </div>
            );
        }

        return (
            <div className="relative w-full h-full overflow-hidden">
                {drawableLayers.map((layer, index) => {
                    const lType = (layer.type || '').toLowerCase();
                    const parsedStyle = getMiniStyle(layer.style);

                    if (lType === 'text') {
                        const textColor = layer.content?.textColor || layer.style?.color || '#0f172a';
                        return (
                            <div key={layer.id || index} style={parsedStyle} className="flex flex-col gap-0.5 justify-center overflow-hidden">
                                <div className="h-[2px] w-full rounded-full" style={{ backgroundColor: textColor }} />
                                <div className="h-[1.5px] w-3/4 rounded-full opacity-60" style={{ backgroundColor: textColor }} />
                            </div>
                        );
                    }

                    if (lType === 'button') {
                        const btnBg = layer.style?.backgroundColor || '#2563eb';
                        const btnColor = layer.style?.color || '#ffffff';
                        const borderRadius = layer.style?.borderRadius || 4;
                        return (
                            <div
                                key={layer.id || index}
                                style={{
                                    ...parsedStyle,
                                    backgroundColor: btnBg,
                                    borderRadius: `${borderRadius}px`
                                }}
                                className="flex items-center justify-center border border-slate-700/5 shadow-sm"
                            >
                                <div className="h-[1.5px] w-1/4 rounded-full opacity-60" style={{ backgroundColor: btnColor }} />
                            </div>
                        );
                    }

                    if (lType === 'media' || lType === 'image') {
                        const imgUrl = layer.content?.imageUrl;
                        return (
                            <div
                                key={layer.id || index}
                                style={parsedStyle}
                                className="rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden"
                            >
                                {imgUrl ? (
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-2.5 h-2.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                        );
                    }

                    if (lType === 'spinthewheel') {
                        return (
                            <div
                                key={layer.id || index}
                                className="absolute rounded-full border border-slate-800 bg-white flex items-center justify-center overflow-hidden"
                                style={{
                                    left: '20%',
                                    top: '20%',
                                    width: '60%',
                                    height: '60%',
                                }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin [animation-duration:20s]">
                                    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
                                    <path d="M50,50 L50,2 A48,48 0 0,1 91.5,26 Z" fill="#2563eb" />
                                    <path d="M50,50 L91.5,26 A48,48 0 0,1 91.5,74 Z" fill="#1e293b" />
                                    <path d="M50,50 L91.5,74 A48,48 0 0,1 50,98 Z" fill="#3b82f6" />
                                    <path d="M50,50 L50,98 A48,48 0 0,1 8.5,74 Z" fill="#0f172a" />
                                    <path d="M50,50 L8.5,74 A48,48 0 0,1 8.5,26 Z" fill="#60a5fa" />
                                    <path d="M50,50 L8.5,26 A48,48 0 0,1 50,2 Z" fill="#475569" />
                                    <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                                </svg>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-full relative bg-slate-900 flex items-center justify-center p-2.5 select-none overflow-hidden">
            <div className="w-full h-full rounded-lg bg-slate-950 border border-slate-800 shadow-inner relative flex flex-col overflow-hidden">
                {/* Status Bar */}
                <div className="h-2.5 w-full bg-slate-900 border-b border-slate-800/10 px-1.5 flex items-center justify-between shrink-0">
                    <div className="w-4 h-0.5 bg-slate-700 rounded-full" />
                    <div className="flex gap-0.5 items-center">
                        <div className="w-0.5 h-0.5 bg-slate-700 rounded-full" />
                        <div className="w-1 h-0.5 bg-slate-700 rounded-full" />
                        <div className="w-1.5 h-0.5 bg-blue-500 rounded-full" />
                    </div>
                </div>

                {/* Device Screen Body */}
                <div className="flex-1 w-full relative p-1.5 flex flex-col justify-between"
                     style={{
                         backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.04) 0.5px, transparent 0.5px)',
                         backgroundSize: '6px 6px',
                         backgroundColor: '#0f172a'
                     }}>
                    
                    {/* Background Content Mockup (Text Lines) */}
                    {normalizedType !== 'fullscreen' && normalizedType !== 'banner' && (
                        <div className="w-full space-y-1 opacity-[0.15] pointer-events-none mt-1">
                            <div className="h-1 w-1/4 bg-slate-400 rounded" />
                            <div className="h-4 w-full bg-slate-800 rounded border border-slate-700/20" />
                            <div className="h-1 w-full bg-slate-500 rounded" />
                            <div className="h-1 w-5/6 bg-slate-500 rounded" />
                        </div>
                    )}

                    {/* Conditional Mockup layouts */}
                    {normalizedType === 'bottomsheet' && (
                        <div style={containerStyle} className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl rounded-t-lg p-2 flex flex-col gap-1.5 z-10 max-h-[55%] min-h-[45%]">
                            <div className="w-6 h-0.5 bg-slate-200 rounded-full mx-auto shrink-0 mb-0.5" />
                            {renderWireframeLayers()}
                        </div>
                    )}

                    {normalizedType === 'modal' && (
                        <div style={containerStyle} className="m-auto w-[85%] bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex flex-col gap-1.5 z-10 min-h-[48%] justify-center relative">
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-50 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full scale-75" />
                            </div>
                            {renderWireframeLayers()}
                        </div>
                    )}

                    {normalizedType === 'fullscreen' && (
                        <div style={containerStyle} className="absolute inset-0 bg-white flex flex-col z-10 p-3 justify-between">
                            <div className="flex justify-between items-center mb-1 shrink-0">
                                <div className="w-8 h-1.5 bg-slate-200 rounded" />
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-50 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full scale-75" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                {renderWireframeLayers()}
                            </div>
                        </div>
                    )}

                    {normalizedType === 'banner' && (
                        <div style={containerStyle} className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm p-1.5 flex items-center justify-between gap-1.5 z-10">
                            <div className="flex-1 flex flex-col gap-0.5">
                                <div className="h-1 w-2/3 bg-slate-900 rounded-full" />
                                <div className="h-[0.8px] w-full bg-slate-300 rounded-full" />
                            </div>
                            <div className="bg-blue-600 rounded px-1.5 py-0.5 flex items-center shrink-0">
                                <div className="w-4 h-0.5 bg-white rounded-full opacity-80" />
                            </div>
                        </div>
                    )}

                    {normalizedType === 'tooltip' && (
                        <div className="m-auto relative flex flex-col items-center">
                            {/* Anchor element */}
                            <div className="px-2 py-0.5 bg-slate-800 border border-slate-700/50 rounded text-[6px] text-slate-500 font-semibold mb-1 shadow flex items-center gap-0.5">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                Widget
                            </div>
                            {/* Tooltip bubble */}
                            <div style={containerStyle} className="bg-slate-900 text-white border border-slate-800 shadow-lg rounded-md p-1.5 flex flex-col gap-1 max-w-[95px] relative">
                                <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 border-l border-t border-slate-800 rotate-45" />
                                <div className="h-[2px] w-2/3 bg-white rounded-full" />
                                <div className="h-[1.5px] w-full bg-slate-400 rounded-full" />
                                <div className="h-2 w-full bg-blue-600 rounded flex items-center justify-center mt-0.5">
                                    <div className="h-0.5 w-1/4 bg-white rounded-full opacity-60" />
                                </div>
                            </div>
                        </div>
                    )}

                    {normalizedType === 'floater' && (
                        <div style={containerStyle} className="absolute bottom-1 right-1 bg-white border border-slate-200 shadow-lg rounded-lg p-2 flex flex-col gap-1 z-10 w-[70%] max-w-[95px]">
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-50 flex items-center justify-center">
                                <div className="w-1 h-1 bg-slate-300 rounded-full scale-75" />
                            </div>
                            <div className="h-1.5 w-1/2 bg-slate-900 rounded-full mb-0.5" />
                            <div className="h-1 w-full bg-slate-300 rounded-full" />
                            <div className="h-2 w-full bg-blue-600 rounded flex items-center justify-center mt-1">
                                <div className="h-0.5 w-1/4 bg-white rounded-full opacity-60" />
                            </div>
                        </div>
                    )}

                    {normalizedType === 'spinthewheel' && (
                        <div style={containerStyle} className="m-auto w-[85%] bg-white border border-slate-200 shadow-xl rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 z-10">
                            <div className="h-1 w-1/2 bg-slate-900 rounded-full" />
                            <div className="w-12 h-12 rounded-full border border-slate-800 bg-white relative flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin [animation-duration:15s] shrink-0">
                                    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                                    <path d="M50,50 L50,2 A48,48 0 0,1 91.5,26 Z" fill="#2563eb" />
                                    <path d="M50,50 L91.5,26 A48,48 0 0,1 91.5,74 Z" fill="#1e293b" />
                                    <path d="M50,50 L91.5,74 A48,48 0 0,1 50,98 Z" fill="#3b82f6" />
                                    <path d="M50,50 L50,98 A48,48 0 0,1 8.5,74 Z" fill="#0f172a" />
                                    <path d="M50,50 L8.5,74 A48,48 0 0,1 8.5,26 Z" fill="#60a5fa" />
                                    <path d="M50,50 L8.5,26 A48,48 0 0,1 50,2 Z" fill="#475569" />
                                    <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                                </svg>
                                <svg viewBox="0 0 10 10" className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-2.5 h-3 z-20">
                                    <path d="M0,0 L10,0 L5,10 Z" fill="#2563eb" />
                                </svg>
                            </div>
                            <div className="h-2 w-full bg-blue-600 rounded flex items-center justify-center shrink-0">
                                <div className="h-0.5 w-1/4 bg-white rounded-full opacity-60" />
                            </div>
                        </div>
                    )}
                    
                    {/* Fallback layout */}
                    {['bottomsheet', 'modal', 'fullscreen', 'banner', 'tooltip', 'floater', 'spinthewheel'].indexOf(normalizedType) === -1 && (
                        <div className="m-auto w-[85%] bg-white border border-slate-200 shadow-xl rounded-lg p-2.5 flex flex-col gap-1">
                            {renderWireframeLayers()}
                        </div>
                    )}

                    {/* Bottom Nav Bar mockup */}
                    {normalizedType !== 'fullscreen' && (
                        <div className="h-2.5 w-full bg-slate-900 border-t border-slate-800/10 flex items-center justify-around shrink-0 mt-auto">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const typeGradients: Record<string, string> = {
    bottomsheet: 'from-blue-600 to-slate-900',
    modal:       'from-slate-850 to-slate-950',
    tooltip:     'from-slate-700 to-slate-900',
    floater:     'from-blue-500 to-slate-850',
    fullscreen:  'from-slate-900 to-black',
    banner:      'from-slate-400 to-slate-600',
    spinthewheel: 'from-blue-700 to-slate-950',
};

const typeDots: Record<string, string> = {
    bottomsheet: 'bg-blue-600',
    modal:       'bg-slate-900',
    tooltip:     'bg-slate-600',
    floater:     'bg-blue-500',
    fullscreen:  'bg-slate-950',
    banner:      'bg-slate-400',
    spinthewheel: 'bg-blue-750',
};

const nudgeTypeLabel: Record<string, string> = {
    bottomsheet: 'Bottom Sheet',
    tooltip:     'Tooltip',
    floater:     'Floater',
    fullscreen:  'Full Screen',
};

const NudgeTypeIcon: Record<string, React.ComponentType<any>> = {
    bottomsheet: PanelBottom,
    tooltip:     MessageSquare,
    floater:     PictureInPicture,
    fullscreen:  Maximize,
};

const CATEGORIES = ['All', 'Marketing', 'Onboarding', 'Feedback', 'Announcement', 'Support', 'Other'];
const NUDGE_TYPES = [
    { id: 'all', label: 'All Types' },
    { id: 'bottomsheet', label: 'Bottom Sheet' },
    { id: 'tooltip', label: 'Tooltip' },
    { id: 'floater', label: 'Floater' },
    { id: 'fullscreen', label: 'Full Screen' },
];

const TemplateCard: React.FC<{
    template: Template;
    isSelected: boolean;
    onClick: () => void;
    onUse: () => void;
}> = ({ template, isSelected, onClick, onUse }) => {
    const nudgeType = template.type || template.config?.type || 'bottomsheet';
    const dot = typeDots[nudgeType] || typeDots.bottomsheet;
    const hasThumbnail = template.thumbnail && template.thumbnail.startsWith('data:');

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200
                hover:-translate-y-1 hover:shadow-xl
                ${isSelected ? 'border-blue-600 shadow-lg shadow-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
            style={{ animationFillMode: 'both' }}
        >
            {/* Thumbnail */}
            <div className="aspect-[9/14] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                <MiniTemplatePreview type={nudgeType} layers={template.layers} config={template.config} />

                {/* Type badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                    <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
                        {(() => {
                            const IconComponent = NudgeTypeIcon[nudgeType];
                            return IconComponent ? <IconComponent size={10} className="text-gray-500" /> : null;
                        })()}
                        {nudgeTypeLabel[nudgeType] || nudgeType}
                    </span>
                </div>

                {/* System badge */}
                {template.is_system && (
                    <div className="absolute top-2.5 right-2.5 z-20">
                        <span className="bg-slate-900 text-white border border-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                            System
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[0.5px] z-30">
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
            <div className="p-3 bg-white">
                <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-850 truncate group-hover:text-blue-600 transition-colors">
                        {template.name}
                    </p>
                    {isSelected && <ChevronRight size={14} className="text-blue-600 shrink-0 mt-0.5" />}
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
        const tType = (t.type || t.config?.type || '').toLowerCase();
        if (tType === 'scratchcard' || tType === 'scratch_card' || tType === 'spinthewheel' || tType === 'spin_the_wheel') return false;
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
            <DialogContent className="max-w-[1100px] h-[88vh] p-0 flex flex-col gap-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xl">
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
                                    className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
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
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                                            ${categoryFilter === cat
                                                ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-blue-600 rounded-r-lg rounded-l-none shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
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
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all
                                                ${active
                                                    ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-blue-600 rounded-r-lg rounded-l-none shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-105 hover:text-slate-900 border-l-2 border-transparent'
                                                }`}
                                        >
                                            {nt.id !== 'all' ? (
                                                (() => {
                                                    const IconComponent = NudgeTypeIcon[nt.id];
                                                    return IconComponent ? (
                                                        <IconComponent size={14} className={`shrink-0 ${active ? 'text-slate-855' : 'text-slate-400 group-hover:text-slate-650'}`} />
                                                    ) : null;
                                                })()
                                            ) : (
                                                <LayoutTemplate size={14} className={`shrink-0 ${active ? 'text-slate-855' : 'text-slate-400 group-hover:text-slate-655'}`} />
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
                                    className="group relative bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-50"
                                >
                                    <div className="aspect-[9/14] flex flex-col items-center justify-center bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-dashed border-gray-300 group-hover:border-blue-500 flex items-center justify-center mb-3 transition-colors">
                                            <Sparkles size={22} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">Blank Canvas</p>
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
                            <div className="aspect-[9/16] rounded-xl overflow-hidden border border-slate-200/60 bg-gray-50">
                                <MiniTemplatePreview type={selected.type || 'modal'} layers={selected.layers} config={selected.config} />
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
                                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-650 bg-slate-50">
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
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm transition-colors"
                            >
                                Use Template
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelected(null)} className="w-full text-xs border-slate-200 hover:bg-slate-50">
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
