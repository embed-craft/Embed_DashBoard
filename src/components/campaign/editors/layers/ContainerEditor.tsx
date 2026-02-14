import React, { useState } from 'react';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
// import { PaddingEditor } from '@/components/editor/style/PaddingEditor'; // Direct import - REMOVED
import { PositionEditor } from '@/components/editor/style/PositionEditor'; // Direct import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Layout,
    Maximize2,
    Image as ImageIcon,
    Box,
    Move,
    Paintbrush,
    BoxSelect,
    Sun,
    LayoutGrid,
    Type
} from 'lucide-react';

// Colors for palette picker (Same as Scratch Card/Floater)
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

interface ContainerEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleTooltipUpdate: (key: string, value: any) => void;
    colors: any;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    handleTooltipUpdate,
    colors
}) => {
    // Style Helpers
    const style = layer.style || {};

    // Background Image/Color Logic
    const bgImage = style.backgroundImage;
    const bgColor = style.backgroundColor || '#ffffff';
    const bgSize = style.backgroundSize || 'cover';
    const hasBgImage = bgImage && bgImage !== 'none';
    const mode = hasBgImage ? 'media' : 'color';

    // Shadow Helpers
    const boxShadow = style.boxShadow || 'none';
    const isShadowEnabled = boxShadow !== 'none';
    const getShadowValues = () => {
        if (!isShadowEnabled) return { blur: 20, spread: 0, color: 'rgba(0,0,0,0.15)' };
        const parts = boxShadow.split('px');
        if (parts.length >= 4) {
            const colorPart = parts.slice(4).join('px').trim();
            return {
                blur: parseInt(parts[2].trim()) || 0,
                spread: parseInt(parts[3].trim()) || 0,
                color: colorPart || 'rgba(0,0,0,0.15)'
            };
        }
        return { blur: 20, spread: 0, color: 'rgba(0,0,0,0.15)' };
    };
    const { blur: shadowBlur, spread: shadowSpread, color: shadowColor } = getShadowValues();

    const updateShadow = (newBlur: number, newSpread: number, newColor: string) => {
        const newShadow = `0px 4px ${newBlur}px ${newSpread}px ${newColor}`;
        onStyleUpdate('boxShadow', newShadow);
    };

    const toggleShadow = () => {
        if (isShadowEnabled) {
            onStyleUpdate('boxShadow', 'none');
        } else {
            updateShadow(20, 0, 'rgba(0,0,0,0.15)');
        }
    };

    // Helper for Floater-like Unit Logic
    const getUnit = (val: string | number | undefined) => {
        if (typeof val === 'string' && val.endsWith('%')) return '%';
        return 'px';
    };

    const getValue = (val: string | number | undefined) => {
        if (val === undefined) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(val);
    };

    const updateDimension = (key: string, val: number, unit: string) => {
        if (unit === '%') {
            onStyleUpdate(key, `${val}%`);
        } else {
            onStyleUpdate(key, val);
        }
    };

    const toggleUnit = (key: string) => {
        const currentVal = style[key];
        const currentUnit = getUnit(currentVal);
        const numVal = getValue(currentVal);

        if (currentUnit === '%') {
            // Convert to px (approx or just switch mode)
            onStyleUpdate(key, numVal);
        } else {
            // Convert to % (clamp to 100)
            onStyleUpdate(key, `${Math.min(numVal, 100)}%`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-900">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Box className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Container Setup</h3>
            </div>

            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 pt-3 pb-0 bg-gray-50/50 border-b border-gray-100 shrink-0">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-200/50 p-1 rounded-lg">
                        <TabsTrigger value="general" className="text-[11px] h-7 gap-1.5"><Layout size={12} /> General</TabsTrigger>
                        <TabsTrigger value="design" className="text-[11px] h-7 gap-1.5"><Paintbrush size={12} /> Design</TabsTrigger>
                        <TabsTrigger value="layout" className="text-[11px] h-7 gap-1.5"><LayoutGrid size={12} /> Layout</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                    {/* --- TAB: GENERAL --- */}
                    <TabsContent value="general" className="space-y-6 mt-0 animate-in fade-in-50">

                        {/* Dimensions & Position (Matched with FloaterMinimalEditor) */}
                        <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                            <Label className="text-xs font-semibold text-gray-700">Dimensions & Position</Label>

                            {/* Width & Height */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Width</Label>
                                    <div className="flex gap-1">
                                        <div className="relative flex-1">
                                            <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                                            <Input
                                                type="number"
                                                className="pl-7 h-8 text-xs w-full"
                                                value={getValue(style.width)}
                                                onChange={(e) => updateDimension('width', parseFloat(e.target.value), getUnit(style.width))}
                                            />
                                        </div>
                                        <button
                                            onClick={() => toggleUnit('width')}
                                            className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                        >
                                            {getUnit(style.width)}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Height</Label>
                                    <div className="flex gap-1">
                                        <div className="relative flex-1">
                                            <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400 rotate-90" />
                                            <Input
                                                type="number"
                                                className="pl-7 h-8 text-xs w-full"
                                                value={getValue(style.height)}
                                                onChange={(e) => updateDimension('height', parseFloat(e.target.value), getUnit(style.height))}
                                            />
                                        </div>
                                        <button
                                            onClick={() => toggleUnit('height')}
                                            className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                        >
                                            {getUnit(style.height)}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Position Anchors (Replaces PositionEditor) */}
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Anchor Corner</Label>
                                <Select
                                    value={
                                        // Infer position from style props (simplified inference)
                                        (style.bottom !== undefined && style.right !== undefined) ? 'bottom-right' :
                                            (style.bottom !== undefined && style.left !== undefined) ? 'bottom-left' :
                                                (style.top !== undefined && style.right !== undefined) ? 'top-right' :
                                                    'top-left'
                                    }
                                    onValueChange={(val) => {
                                        // Reset
                                        const reset = { top: undefined, bottom: undefined, left: undefined, right: undefined };
                                        if (val === 'top-left') onStyleUpdate('style', { ...style, ...reset, top: '20px', left: '20px' }); // Use updates correctly
                                        // Note: ContainerEditor handles direct style updates.
                                        // Simplified Logic: Just utilize PositionEditor if complexity is high, but user asked for PARITY.
                                        // Floater uses a specific 'position' config string. Container uses generic CSS 'top', 'left', etc.
                                        // To parity this, we need to map the abstraction. 

                                        // Actually, let's keep it simple for now and just update the style props directly.
                                        if (val === 'top-left') { onStyleUpdate('top', '20px'); onStyleUpdate('left', '20px'); onStyleUpdate('bottom', undefined); onStyleUpdate('right', undefined); }
                                        if (val === 'top-right') { onStyleUpdate('top', '20px'); onStyleUpdate('right', '20px'); onStyleUpdate('bottom', undefined); onStyleUpdate('left', undefined); }
                                        if (val === 'bottom-left') { onStyleUpdate('bottom', '20px'); onStyleUpdate('left', '20px'); onStyleUpdate('top', undefined); onStyleUpdate('right', undefined); }
                                        if (val === 'bottom-right') { onStyleUpdate('bottom', '20px'); onStyleUpdate('right', '20px'); onStyleUpdate('top', undefined); onStyleUpdate('left', undefined); }
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="top-left">Top Left</SelectItem>
                                        <SelectItem value="top-right">Top Right</SelectItem>
                                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Offsets */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1">X Offset</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] text-gray-400 font-mono">X</span>
                                        <Input
                                            type="text"
                                            className="h-8 text-xs pl-6"
                                            value={style.left || style.right || 0}
                                            onChange={e => {
                                                if (style.left !== undefined) onStyleUpdate('left', e.target.value);
                                                else onStyleUpdate('right', e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1">Y Offset</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] text-gray-400 font-mono">Y</span>
                                        <Input
                                            type="text"
                                            className="h-8 text-xs pl-6"
                                            value={style.top || style.bottom || 0}
                                            onChange={e => {
                                                if (style.top !== undefined) onStyleUpdate('top', e.target.value);
                                                else onStyleUpdate('bottom', e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-200" />

                            {/* Overflow Control */}
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-2">Overflow Behavior</label>
                                <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                                    {['visible', 'hidden', 'scroll'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => onStyleUpdate('overflow', opt)}
                                            className={`flex-1 py-1.5 text-xs rounded-sm capitalize transition-all ${(style.overflow || 'visible') === opt
                                                ? 'bg-white text-indigo-600 shadow-sm font-medium'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </TabsContent>

                    {/* --- TAB: DESIGN --- */}
                    <TabsContent value="design" className="space-y-6 mt-0 animate-in fade-in-50">

                        {/* Background Section (Matching FloaterMinimalEditor) */}
                        <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                            <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                <Paintbrush size={14} className="text-gray-500" />
                                Appearance
                            </h5>

                            {/* Type Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-md mb-3">
                                <button
                                    onClick={() => onStyleUpdate('backgroundImage', 'none')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'color' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Solid Color
                                </button>
                                <button
                                    onClick={() => onStyleUpdate('backgroundImage', 'url(https://placehold.co/600x400)')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'media' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Image
                                </button>
                            </div>

                            {mode === 'color' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-500">Fill Color</Label>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-gray-400">Transparent</span>
                                            <Switch
                                                checked={bgColor === 'transparent' || bgColor === 'rgba(0,0,0,0)'}
                                                onCheckedChange={(c) => onStyleUpdate('backgroundColor', c ? 'transparent' : '#ffffff')}
                                                className="scale-75 origin-right"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {PALETTE.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onStyleUpdate('backgroundColor', c)}
                                                className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${bgColor === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                                            <input
                                                type="color"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                                                onChange={e => onStyleUpdate('backgroundColor', e.target.value)}
                                            />
                                            <div className="w-full h-full" style={{ backgroundColor: bgColor }} />
                                        </div>
                                    </div>

                                    {/* Glassmorphism */}
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 backdrop-blur-sm" />
                                                Glassmorphism
                                            </Label>
                                            <Switch
                                                checked={style.backdropFilter?.enabled ?? false}
                                                onCheckedChange={(c) => {
                                                    const current = style.backdropFilter || { enabled: false, blur: 10 };
                                                    onStyleUpdate('backdropFilter', { ...current, enabled: c });

                                                    if (c && (!bgColor || bgColor.length === 7)) {
                                                        const base = bgColor.startsWith('#') ? bgColor : '#ffffff';
                                                        onStyleUpdate('backgroundColor', `${base}80`);
                                                    }
                                                }}
                                            />
                                        </div>
                                        {style.backdropFilter?.enabled && (
                                            <div className="space-y-3 p-2 bg-indigo-50/50 rounded border border-indigo-100/50">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] text-gray-500">Blur Intensity</Label>
                                                        <span className="text-[10px] text-gray-400">{style.backdropFilter?.blur ?? 10}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="40" step="1"
                                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                        value={style.backdropFilter?.blur ?? 10}
                                                        onChange={(e) => onStyleUpdate('backdropFilter', { ...style.backdropFilter, blur: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between">
                                                        <Label className="text-[10px] text-gray-500">Opacity Helper</Label>
                                                        <span className="text-[10px] text-gray-400">
                                                            {Math.round(((parseInt((bgColor || '#ffffffFF').slice(7, 9), 16) || 255) / 255) * 100)}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="255" step="5"
                                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                        value={parseInt((bgColor || '#ffffffFF').slice(7, 9), 16) || 255}
                                                        onChange={(e) => {
                                                            const alpha = parseInt(e.target.value).toString(16).padStart(2, '0').toUpperCase();
                                                            const base = (bgColor.startsWith('#') ? bgColor : '#ffffff').slice(0, 7);
                                                            onStyleUpdate('backgroundColor', `${base}${alpha}`);
                                                        }}
                                                    />
                                                    <p className="text-[9px] text-gray-400">Lower opacity to see the blur effect efficiently.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {mode === 'media' && (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Image URL</Label>
                                        <div className="relative">
                                            <ImageIcon size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                                            <Input
                                                value={hasBgImage ? bgImage.replace('url(', '').replace(')', '') : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    onStyleUpdate('backgroundImage', val ? `url(${val})` : 'none');
                                                }}
                                                placeholder="https://..."
                                                className="pl-8 h-8 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Image Fit</Label>
                                        <Select value={bgSize} onValueChange={(val) => onStyleUpdate('backgroundSize', val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cover">Cover (Crop)</SelectItem>
                                                <SelectItem value="contain">Contain (Fit)</SelectItem>
                                                <SelectItem value="100% 100%">Stretch</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Border Section */}
                        <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                            <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                <BoxSelect size={14} className="text-gray-500" />
                                Border
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Radius</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={style.borderRadius ?? 0}
                                            onChange={(e) => onStyleUpdate('borderRadius', parseFloat(e.target.value))}
                                        />
                                        <span className="text-[10px] text-gray-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Width</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={style.borderWidth ?? 0}
                                            onChange={(e) => onStyleUpdate('borderWidth', parseFloat(e.target.value))}
                                        />
                                        <span className="text-[10px] text-gray-400">px</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="color"
                                        value={style.borderColor || '#e5e7eb'}
                                        onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 p-0.5 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Select value={style.borderStyle || 'solid'} onValueChange={(val) => onStyleUpdate('borderStyle', val)}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="solid">Solid</SelectItem>
                                            <SelectItem value="dashed">Dashed</SelectItem>
                                            <SelectItem value="dotted">Dotted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Shadow Section */}
                        <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
                                    <Sun size={14} className="text-gray-500" />
                                    Shadow
                                </h5>
                                <button
                                    onClick={toggleShadow}
                                    className={`w-11 h-6 rounded-full relative transition-colors ${isShadowEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isShadowEnabled ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            {isShadowEnabled && (
                                <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Blur</label>
                                            <span className="text-[10px] text-indigo-600 font-medium">{shadowBlur}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="50"
                                            value={shadowBlur}
                                            onChange={(e) => updateShadow(parseInt(e.target.value), shadowSpread, shadowColor)}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-semibold">Spread</label>
                                            <span className="text-[10px] text-indigo-600 font-medium">{shadowSpread}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="20"
                                            value={shadowSpread}
                                            onChange={(e) => updateShadow(shadowBlur, parseInt(e.target.value), shadowColor)}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">Color</label>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden relative shadow-sm">
                                                <input
                                                    type="color"
                                                    value={shadowColor.startsWith('#') ? shadowColor : '#000000'}
                                                    onChange={(e) => updateShadow(shadowBlur, shadowSpread, e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                                <div className="w-full h-full" style={{ backgroundColor: shadowColor }} />
                                            </div>
                                            <input
                                                type="text"
                                                value={shadowColor}
                                                onChange={(e) => updateShadow(shadowBlur, shadowSpread, e.target.value)}
                                                className="flex-1 p-1.5 text-xs border border-gray-200 rounded outline-none focus:border-indigo-500 font-mono"
                                                placeholder="rgba(0,0,0,0.15)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Opacity */}
                            <div className="mt-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Opacity</label>
                                    <span className="text-[10px] text-gray-500">{Math.round((style.opacity ?? 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={style.opacity ?? 1}
                                    onChange={(e) => onStyleUpdate('opacity', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>

                    </TabsContent>

                    {/* --- TAB: LAYOUT --- */}
                    <TabsContent value="layout" className="space-y-6 mt-0 animate-in fade-in-50">
                        {/* Flex Properties (since it's a container) */}
                        <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                            <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                <LayoutGrid size={14} className="text-gray-500" />
                                Flex Layout
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Direction</Label>
                                    <Select value={style.flexDirection || 'column'} onValueChange={(val) => onStyleUpdate('flexDirection', val)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="column">Column (Vertical)</SelectItem>
                                            <SelectItem value="row">Row (Horizontal)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Gap</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={style.gap ?? 0}
                                            onChange={(e) => onStyleUpdate('gap', parseFloat(e.target.value))}
                                        />
                                        <span className="text-[10px] text-gray-400">px</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Align Items</Label>
                                    <Select value={style.alignItems || 'stretch'} onValueChange={(val) => onStyleUpdate('alignItems', val)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stretch">Stretch</SelectItem>
                                            <SelectItem value="flex-start">Start</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="flex-end">End</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Justify Content</Label>
                                    <Select value={style.justifyContent || 'flex-start'} onValueChange={(val) => onStyleUpdate('justifyContent', val)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flex-start">Start</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                            <SelectItem value="flex-end">End</SelectItem>
                                            <SelectItem value="space-between">Space Between</SelectItem>
                                            <SelectItem value="space-around">Space Around</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
};
