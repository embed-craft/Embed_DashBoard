import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, MoreVertical, Trash2, Copy, Edit3,
    Globe, Building2, LayoutTemplate, Layers, Clock,
    Sparkles, Loader2, Rocket, X, AlertTriangle,
    PanelBottom, MessageSquare, PictureInPicture, Maximize
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
    { id: 'all',          label: 'All Templates' },
    { id: 'bottomsheet',  label: 'Bottom Sheet' },
    { id: 'tooltip',      label: 'Tooltip' },
    { id: 'floater',      label: 'Floater' },
    { id: 'fullscreen',   label: 'Full Screen' }
];

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
            containerStyle.backgroundImage = `url(${config.backgroundImageUrl})`;
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
            containerStyle.backgroundImage = bgImage.includes('url(') ? bgImage : `url(${bgImage})`;
            containerStyle.backgroundSize = containerLayer.style.backgroundSize || 'cover';
            containerStyle.backgroundPosition = containerLayer.style.backgroundPosition || 'center';
            containerStyle.backgroundRepeat = 'no-repeat';
        } else if (containerLayer.style.backgroundImageUrl) {
            containerStyle.backgroundImage = `url(${containerLayer.style.backgroundImageUrl})`;
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
                <div className="flex flex-col gap-0.5 w-full h-full justify-center p-1.5">
                    <div className="h-1 w-2/3 bg-slate-900 rounded-full" />
                    <div className="h-0.5 w-full bg-slate-350 rounded-full" />
                    <div className="h-0.5 w-4/5 bg-slate-200 rounded-full" />
                    <div className="h-2 w-full bg-blue-600 rounded-[2px] flex items-center justify-center mt-0.5">
                        <div className="h-[0.5px] w-1/3 bg-white rounded-full opacity-60" />
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
                                <div className="h-[1.5px] w-full rounded-full" style={{ backgroundColor: textColor }} />
                                <div className="h-[1px] w-3/4 rounded-full opacity-60" style={{ backgroundColor: textColor }} />
                            </div>
                        );
                    }

                    if (lType === 'button') {
                        const btnBg = layer.style?.backgroundColor || '#2563eb';
                        const btnColor = layer.style?.color || '#ffffff';
                        const borderRadius = layer.style?.borderRadius || 2;
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
                                <div className="h-[1px] w-1/4 rounded-full opacity-60" style={{ backgroundColor: btnColor }} />
                            </div>
                        );
                    }

                    if (lType === 'media' || lType === 'image') {
                        const imgUrl = layer.content?.imageUrl;
                        return (
                            <div
                                key={layer.id || index}
                                style={parsedStyle}
                                className="rounded-[2px] bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden"
                            >
                                {imgUrl ? (
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-2 h-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="w-full h-full relative bg-slate-900 flex flex-col overflow-hidden">
            {/* Status Bar */}
            <div className="h-2 w-full bg-slate-950 border-b border-slate-800/10 px-1 flex items-center justify-between shrink-0">
                <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
                <div className="flex gap-0.5 items-center">
                    <div className="w-0.5 h-0.5 bg-slate-700 rounded-full" />
                    <div className="w-1 h-0.5 bg-slate-700 rounded-full" />
                    <div className="w-1.5 h-0.5 bg-blue-500 rounded-full" />
                </div>
            </div>

            {/* Device Screen Body */}
            <div className="flex-1 w-full relative p-1 flex flex-col justify-between"
                 style={{
                     backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.04) 0.5px, transparent 0.5px)',
                     backgroundSize: '4px 4px',
                     backgroundColor: '#0f172a'
                 }}>
                
                {/* Background Content Mockup (Text Lines) */}
                {normalizedType !== 'fullscreen' && normalizedType !== 'banner' && (
                    <div className="w-full space-y-0.5 opacity-[0.15] pointer-events-none mt-0.5">
                        <div className="h-0.5 w-1/4 bg-slate-400 rounded" />
                        <div className="h-2.5 w-full bg-slate-800 rounded border border-slate-700/20" />
                        <div className="h-0.5 w-full bg-slate-500 rounded" />
                        <div className="h-0.5 w-5/6 bg-slate-500 rounded" />
                    </div>
                )}

                {/* Conditional Mockup layouts */}
                {normalizedType === 'bottomsheet' && (
                    <div style={containerStyle} className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl rounded-t-md p-1.5 flex flex-col gap-1 z-10 max-h-[58%] min-h-[48%]">
                        <div className="w-4 h-0.5 bg-slate-200 rounded-full mx-auto shrink-0 mb-0.5" />
                        {renderWireframeLayers()}
                    </div>
                )}

                {normalizedType === 'modal' && (
                    <div style={containerStyle} className="m-auto w-[85%] bg-white border border-slate-200 shadow-lg rounded p-1.5 flex flex-col gap-1 z-10 min-h-[52%] justify-center relative">
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-slate-50 flex items-center justify-center">
                            <div className="w-1 h-1 bg-slate-300 rounded-full scale-75" />
                        </div>
                        {renderWireframeLayers()}
                    </div>
                )}

                {normalizedType === 'fullscreen' && (
                    <div style={containerStyle} className="absolute inset-0 bg-white flex flex-col z-10 p-2 justify-between">
                        <div className="flex justify-between items-center mb-0.5 shrink-0">
                            <div className="w-6 h-1 bg-slate-200 rounded" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-50 flex items-center justify-center">
                                <div className="w-1 h-1 bg-slate-300 rounded-full scale-75" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            {renderWireframeLayers()}
                        </div>
                    </div>
                )}

                {normalizedType === 'banner' && (
                    <div style={containerStyle} className="absolute top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm p-1 flex items-center justify-between gap-1 z-10">
                        <div className="flex-1 flex flex-col gap-0.5">
                            <div className="h-0.5 w-2/3 bg-slate-900 rounded-full" />
                            <div className="h-[0.5px] w-full bg-slate-300 rounded-full" />
                        </div>
                        <div className="bg-blue-600 rounded-[2px] px-1 py-0.5 flex items-center shrink-0">
                            <div className="w-3 h-0.5 bg-white rounded-full opacity-80" />
                        </div>
                    </div>
                )}

                {normalizedType === 'tooltip' && (
                    <div className="m-auto relative flex flex-col items-center">
                        {/* Anchor element */}
                        <div className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/50 rounded text-[5px] text-slate-500 font-semibold mb-0.5 shadow flex items-center gap-0.5">
                            <div className="w-0.5 h-0.5 bg-blue-500 rounded-full" />
                            Anchor
                        </div>
                        {/* Tooltip bubble */}
                        <div style={containerStyle} className="bg-slate-900 text-white border border-slate-800 shadow-md rounded p-1 flex flex-col gap-0.5 max-w-[80px] relative">
                            <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 border-l border-t border-slate-800 rotate-45" />
                            <div className="h-[1.5px] w-2/3 bg-white rounded-full" />
                            <div className="h-[1px] w-full bg-slate-400 rounded-full" />
                            <div className="h-1.5 w-full bg-blue-600 rounded-[1px] flex items-center justify-center mt-0.5">
                                <div className="h-[0.5px] w-1/4 bg-white rounded-full opacity-60" />
                            </div>
                        </div>
                    </div>
                )}

                {normalizedType === 'floater' && (
                    <div style={containerStyle} className="absolute bottom-1 right-1 bg-white border border-slate-200 shadow-md rounded p-1 flex flex-col gap-0.5 z-10 w-[70%] max-w-[80px]">
                        <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-slate-50 flex items-center justify-center">
                            <div className="w-1 h-1 bg-slate-300 rounded-full scale-75" />
                        </div>
                        <div className="h-1.5 w-1/2 bg-slate-900 rounded-full mb-0.5" />
                        <div className="h-0.5 w-full bg-slate-300 rounded-full" />
                        <div className="h-1.5 w-full bg-blue-600 rounded-[1.5px] flex items-center justify-center mt-0.5">
                            <div className="h-[0.5px] w-1/4 bg-white rounded-full opacity-60" />
                        </div>
                    </div>
                )}

                {normalizedType === 'spinthewheel' && (
                    <div style={containerStyle} className="m-auto w-[85%] bg-white border border-slate-200 shadow-md rounded p-1.5 flex flex-col items-center justify-center gap-1 z-10">
                        <div className="h-1 w-1/2 bg-slate-900 rounded-full mb-0.5" />
                        <div className="w-10 h-10 rounded-full border border-slate-800 bg-white relative flex items-center justify-center shadow-inner overflow-hidden shrink-0">
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
                            <svg viewBox="0 0 10 10" className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-2 h-2.5 z-20">
                                <path d="M0,0 L10,0 L5,10 Z" fill="#2563eb" />
                            </svg>
                        </div>
                        <div className="h-1.5 w-full bg-blue-600 rounded-[1.5px] flex items-center justify-center shrink-0">
                            <div className="h-[0.5px] w-1/4 bg-white rounded-full opacity-60" />
                        </div>
                    </div>
                )}
                
                {/* Fallback layout */}
                {['bottomsheet', 'modal', 'fullscreen', 'banner', 'tooltip', 'floater', 'spinthewheel'].indexOf(normalizedType) === -1 && (
                    <div className="m-auto w-[85%] bg-white border border-slate-200 shadow-md rounded p-1.5 flex flex-col gap-1">
                        {renderWireframeLayers()}
                    </div>
                )}

                {/* Bottom Nav Bar mockup */}
                {normalizedType !== 'fullscreen' && (
                    <div className="h-2 w-full bg-slate-950 border-t border-slate-800/10 flex items-center justify-around shrink-0 mt-auto">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    </div>
                )}

            </div>
        </div>
    );
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
    const hasThumbnail = template.thumbnail && template.thumbnail.startsWith('data:');
    const timeAgo = template.updatedAt
        ? formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })
        : null;

    return (
        <div
            className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer
                transition-all duration-300 hover:shadow-xl hover:shadow-blue-50 hover:border-blue-500 flex flex-col"
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
        >
            {/* Thumbnail — Phone Preview */}
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-1.5 select-none">
                <div className="absolute inset-0 flex items-center justify-center p-1.5">
                    <div className="relative h-full aspect-[9/19.5] rounded-[8px] border-[2.5px] border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[5px] bg-slate-800 rounded-b-[4px] z-10" />
                        <MiniTemplatePreview type={nudgeType} layers={template.layers} config={template.config} />
                    </div>
                </div>

                {/* Badges container */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none z-20">
                    <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm shadow-sm text-[10px] font-semibold px-2.5 py-1 rounded-full text-gray-700">
                        {(() => {
                            const IconComponent = NudgeTypeIcon[nudgeType];
                            return IconComponent ? <IconComponent size={10} className="text-gray-500" /> : null;
                        })()}
                        {nudgeTypeLabel[nudgeType] || nudgeType}
                    </span>
                    {template.is_system && (
                        <span className="bg-slate-900 text-white border border-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
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
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                        title="Edit Design"
                    >
                        <Edit3 size={11} /> Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
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
        const tType = (t.type || t.config?.type || '').toLowerCase();
        // Scratch card is not a nudge, filter it out completely
        if (tType === 'scratchcard' || tType === 'scratch_card' || tType === 'spinthewheel' || tType === 'spin_the_wheel' || tType === 'modal' || tType === 'banner') return false;
        
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
        <div className="flex h-full bg-slate-50/30 overflow-hidden">
            {/* ── Left Sidebar ────────────────────────────────────────────── */}
            <aside className="w-52 shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
                {/* Sidebar Header */}
                <div className="px-4 pt-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
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
                            {NUDGE_TYPES.map((nt) => {
                                const active = typeFilter === nt.id;
                                return (
                                    <button
                                        key={nt.id}
                                        onClick={() => setTypeFilter(nt.id)}
                                        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
                                            ${active
                                                ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-blue-600 rounded-r-lg rounded-l-none shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
                                            }`}
                                    >
                                        {nt.id !== 'all' ? (
                                            (() => {
                                                const IconComponent = NudgeTypeIcon[nt.id];
                                                return IconComponent ? (
                                                    <IconComponent size={14} className={`shrink-0 ${active ? 'text-slate-850' : 'text-slate-400 group-hover:text-slate-650'}`} />
                                                ) : null;
                                            })()
                                        ) : (
                                            <LayoutTemplate size={14} className={`shrink-0 ${active ? 'text-slate-850' : 'text-slate-400 group-hover:text-slate-655'}`} />
                                        )}
                                        {nt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search templates…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 focus:bg-white"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {typeFilter !== 'all' && (
                                <span className="text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    {nudgeTypeLabel[typeFilter]}
                                    <button onClick={() => setTypeFilter('all')} className="hover:text-slate-900"><X size={10} /></button>
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
                        className="bg-slate-900 hover:bg-slate-800 text-white text-sm gap-2 shadow-sm transition-all"
                    >
                        <Plus size={15} />
                        New Template
                    </Button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-24">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <Sparkles size={30} className="text-slate-400 animate-pulse" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shadow-lg">
                                    <Plus size={14} className="text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">No templates found</p>
                            <p className="text-sm text-gray-400 mb-6 max-w-xs">
                                Create your first template, or save a campaign design as a template from the Campaign Builder.
                            </p>
                            <Button onClick={() => setCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm">
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
