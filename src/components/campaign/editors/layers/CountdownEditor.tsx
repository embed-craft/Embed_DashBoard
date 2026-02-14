import React, { useEffect } from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid, Palette, Move, // Tab Icons
    Timer, Calendar, ListChecks, Type, Box, Layers, MousePointer2, PaintBucket, // Section Icons
    AlignLeft, AlignCenter, AlignRight, Type as TypeIcon
} from 'lucide-react';

// Unified Palette (Matching Floater/Scratch editors)
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

interface CountdownEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const CountdownEditor: React.FC<CountdownEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1' }
    }
}) => {
    // Defaults
    const content = layer.content || {};
    const style = layer.style || {};

    // Helper for deep updates
    const updateNested = (parent: string, key: string, value: any) => {
        if (parent === 'style') {
            onStyleUpdate(key, value);
        } else if (parent === 'content') {
            handleContentUpdate(key, value);
        }
    };

    // Robust Initialization
    useEffect(() => {
        if (!content.targetDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            handleContentUpdate('targetDate', tomorrow.toISOString().slice(0, 16));
        }

        // Visibility Flags
        if (content.showDays === undefined) handleContentUpdate('showDays', true);
        if (content.showHours === undefined) handleContentUpdate('showHours', true);
        if (content.showMinutes === undefined) handleContentUpdate('showMinutes', true);
        if (content.showSeconds === undefined) handleContentUpdate('showSeconds', true);
        if (!content.preset) handleContentUpdate('preset', 'box');

        // Styles
        if (style.fontSize === undefined) onStyleUpdate('fontSize', 32);
        if (style.color === undefined) onStyleUpdate('color', '#111827');
        if (style.gap === undefined) onStyleUpdate('gap', 4);
        if (style.justifyContent === undefined) onStyleUpdate('justifyContent', 'center');

        // Labels
        if (content.showLabels === undefined) handleContentUpdate('showLabels', true);
        if (!content.labels) {
            handleContentUpdate('labels', { days: 'Days', hours: 'Hrs', minutes: 'Mins', seconds: 'Secs' });
        }
    }, [content.targetDate]); // Run only on mount checking targetDate

    // Preset Logic
    const applyPreset = (preset: string) => {
        handleContentUpdate('preset', preset);

        if (preset === 'digital') {
            onStyleUpdate('backgroundColor', 'transparent');
            onStyleUpdate('borderWidth', 0);
            onStyleUpdate('borderRadius', 0);
            onStyleUpdate('padding', 0);
            onStyleUpdate('color', '#111827');
            handleContentUpdate('digitColor', '#111827');
            onStyleUpdate('gap', 4);
        } else if (preset === 'flip') {
            onStyleUpdate('backgroundColor', 'transparent');
            handleContentUpdate('tileColor', '#1f2937');
            handleContentUpdate('digitColor', '#ffffff');
            onStyleUpdate('borderRadius', 4);
            onStyleUpdate('gap', 8);
        } else if (preset === 'tiles') {
            onStyleUpdate('backgroundColor', 'transparent');
            handleContentUpdate('tileColor', '#ffffff');
            handleContentUpdate('digitColor', '#111827');
            onStyleUpdate('gap', 8);
        } else if (preset === 'ring') {
            onStyleUpdate('backgroundColor', 'transparent');
            handleContentUpdate('ringColor', '#6366f1');
            handleContentUpdate('digitColor', '#111827');
            onStyleUpdate('gap', 12);
        }
    };

    // Reusable Color Picker Component
    const ColorPicker = ({ label, value, onChange, allowTransparent = false }: { label: string, value: string, onChange: (val: string) => void, allowTransparent?: boolean }) => (
        <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500">{label}</Label>
            <div className="flex items-center gap-2">
                {/* Current Color Display Button */}
                <div className="relative flex-1">
                    <label className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer bg-white">
                        <div
                            className="w-4 h-4 rounded border border-gray-300 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: value === 'transparent' ? 'white' : value }}
                        >
                            {value === 'transparent' && (
                                <div className="w-full h-px bg-red-400 rotate-45 translate-y-[7px]" />
                            )}
                        </div>
                        <span className="text-[11px] font-mono text-gray-600 flex-1">{value === 'transparent' ? 'None' : value.toUpperCase()}</span>
                        <input
                            type="color"
                            value={value === 'transparent' ? '#ffffff' : value}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute opacity-0 w-0 h-0"
                        />
                    </label>
                </div>
                {/* Quick Transparent Toggle */}
                {allowTransparent && (
                    <button
                        onClick={() => onChange(value === 'transparent' ? '#ffffff' : 'transparent')}
                        className={`px-2 py-1.5 text-[9px] font-medium rounded border transition-all ${value === 'transparent'
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        title="Toggle Transparent"
                    >
                        ∅
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white font-sans text-gray-900">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Timer className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Countdown</h3>
            </div>

            <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 pt-3 pb-0 bg-gray-50/50 border-b border-gray-100 shrink-0">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-200/50 p-1 rounded-lg">
                        <TabsTrigger value="content" className="text-[11px] h-7 gap-1.5"><LayoutGrid size={12} /> Content</TabsTrigger>
                        <TabsTrigger value="design" className="text-[11px] h-7 gap-1.5"><Palette size={12} /> Design</TabsTrigger>
                        <TabsTrigger value="layout" className="text-[11px] h-7 gap-1.5"><Move size={12} /> Layout</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                    {/* --- TAB: CONTENT --- */}
                    <TabsContent value="content" className="space-y-6 mt-0 animate-in fade-in-50">

                        {/* PRESETS */}
                        <div>
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Layers size={12} /> Presets
                            </h6>
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { id: 'box', label: 'Box', emoji: '📦', preview: '24' },
                                    { id: 'ring', label: 'Ring', emoji: '⭕', preview: '●' }
                                ].map(({ id, label, emoji, preview }) => (
                                    <button
                                        key={id}
                                        onClick={() => applyPreset(id)}
                                        className={`relative p-3 border-2 rounded-xl text-left transition-all group ${content.preset === id ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100/50 shadow-sm' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/80 hover:shadow-sm'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-lg">{emoji}</span>
                                            {content.preset === id && (
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <div className={`text-[10px] font-semibold ${content.preset === id ? 'text-indigo-700' : 'text-gray-600 group-hover:text-gray-800'}`}>
                                            {label}
                                        </div>
                                        <div className={`text-[8px] mt-0.5 font-mono ${content.preset === id ? 'text-indigo-500' : 'text-gray-400'}`}>
                                            {preview}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* TARGET */}
                        <div className="space-y-3">
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={12} /> Target
                            </h6>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">End Date & Time</Label>
                                    <Input
                                        type="datetime-local"
                                        value={content.targetDate || ''}
                                        onChange={(e) => handleContentUpdate('targetDate', e.target.value)}
                                        className="bg-white h-8 text-xs"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-normal text-gray-600">Use Device Local Time</Label>
                                    <Switch
                                        checked={content.useLocalTime ?? true}
                                        onCheckedChange={(c) => handleContentUpdate('useLocalTime', c)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* DISPLAY UNITS */}
                        <div className="space-y-3">
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ListChecks size={12} /> Display Units
                            </h6>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'showDays', label: 'Days' },
                                    { key: 'showHours', label: 'Hrs' },
                                    { key: 'showMinutes', label: 'Mins' },
                                    { key: 'showSeconds', label: 'Secs' }
                                ].map(({ key, label }) => (
                                    <label key={key} className={`border rounded px-2 py-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all ${content[key] ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={content[key] ?? true}
                                            onChange={(e) => handleContentUpdate(key, e.target.checked)}
                                            className="accent-indigo-600 w-3.5 h-3.5"
                                        />
                                        <span className={`text-[10px] font-medium ${content[key] ? 'text-indigo-700' : 'text-gray-500'}`}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* SEPARATOR CONTROLS */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-100">
                                <Label className="text-xs font-normal text-gray-600">Show Separators (:)</Label>
                                <Switch
                                    checked={content.showSeparator !== false}
                                    onCheckedChange={(c) => handleContentUpdate('showSeparator', c)}
                                />
                            </div>

                            {(content.showSeparator !== false) && (
                                <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 space-y-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Separator Color</Label>
                                        <ColorPicker
                                            label=""
                                            value={content.separatorColor || style.color || '#111827'}
                                            onChange={(val) => handleContentUpdate('separatorColor', val)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Vertical Offset</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="number"
                                                value={content.separatorOffsetY || 0}
                                                onChange={(e) => handleContentUpdate('separatorOffsetY', Number(e.target.value))}
                                                className="h-7 text-xs bg-white"
                                                placeholder="Offset"
                                            />
                                            <Input
                                                type="number"
                                                value={content.separatorFontSize ?? 32}
                                                onChange={(e) => handleContentUpdate('separatorFontSize', Number(e.target.value))}
                                                className="h-7 text-xs bg-white"
                                                placeholder="Size"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* LABELS */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <TypeIcon size={12} /> Labels
                                </h6>
                                <Switch
                                    checked={content.showLabels ?? true}
                                    onCheckedChange={(c) => handleContentUpdate('showLabels', c)}
                                />
                            </div>

                            {(content.showLabels ?? true) && (
                                <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                                            <div key={unit}>
                                                <Label className="capitalize text-[10px] text-gray-500 mb-1 block">{unit}</Label>
                                                <Input
                                                    value={content.labels?.[unit] || ''}
                                                    placeholder={unit === 'days' ? 'Days' : unit === 'hours' ? 'Hrs' : unit === 'minutes' ? 'Mins' : 'Secs'}
                                                    onChange={(e) => updateNested('content', 'labels', { ...content.labels, [unit]: e.target.value })}
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="bg-gray-200" />
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <ColorPicker
                                                label="Label Color"
                                                value={content.labelColor || '#6b7280'}
                                                onChange={(val) => handleContentUpdate('labelColor', val)}
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Label className="text-[10px] text-gray-500">Size</Label>
                                            <Input
                                                type="number"
                                                value={content.labelFontSize ?? 12} // Default to 12 if not set (relying on renderer default)
                                                onChange={(e) => handleContentUpdate('labelFontSize', Number(e.target.value))}
                                                className="h-7 text-xs bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* EXPIRY ACTION */}
                        <div className="space-y-3">
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MousePointer2 size={12} /> On Expiry
                            </h6>
                            <Select value={content.onExpiry || 'none'} onValueChange={(val) => handleContentUpdate('onExpiry', val)}>
                                <SelectTrigger className="h-8 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Do Nothing (Stop at 0)</SelectItem>
                                    <SelectItem value="hide">Hide Layer</SelectItem>
                                    <SelectItem value="message">Show "Expired" Message</SelectItem>
                                    <SelectItem value="redirect">Redirect URL</SelectItem>
                                </SelectContent>
                            </Select>

                            {content.onExpiry === 'message' && (
                                <div className="mt-2 space-y-1.5">
                                    <Label className="text-xs">Expired Message</Label>
                                    <Input
                                        value={content.expiryMessage || 'Ended'}
                                        onChange={(e) => handleContentUpdate('expiryMessage', e.target.value)}
                                        placeholder="e.g. Campaign Ended"
                                        className="h-8 text-xs"
                                    />
                                </div>
                            )}
                            {content.onExpiry === 'redirect' && (
                                <div className="mt-2 space-y-1.5">
                                    <Label className="text-xs">Redirect URL</Label>
                                    <Input
                                        value={content.expiryUrl || ''}
                                        onChange={(e) => handleContentUpdate('expiryUrl', e.target.value)}
                                        placeholder="https://..."
                                        className="h-8 text-xs"
                                    />
                                </div>
                            )}
                        </div>

                    </TabsContent>

                    {/* --- TAB: DESIGN --- */}
                    <TabsContent value="design" className="space-y-6 mt-0 animate-in fade-in-50">

                        {/* DIGIT STYLING */}
                        <div>
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Type size={12} /> Digit Styling
                            </h6>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Font Family</Label>
                                        <Select value={content.fontFamily || 'Inter'} onValueChange={(val) => handleContentUpdate('fontFamily', val)}>
                                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inter">Inter</SelectItem>
                                                <SelectItem value="Roboto">Roboto</SelectItem>
                                                <SelectItem value="Poppins">Poppins</SelectItem>
                                                <SelectItem value="Space Mono">Space Mono</SelectItem>
                                                <SelectItem value="Oswald">Oswald</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Weight</Label>
                                        <Select value={String(content.fontWeight || '700')} onValueChange={(val) => handleContentUpdate('fontWeight', val)}>
                                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="400">Regular</SelectItem>
                                                <SelectItem value="500">Medium</SelectItem>
                                                <SelectItem value="600">Semibold</SelectItem>
                                                <SelectItem value="700">Bold</SelectItem>
                                                <SelectItem value="800">Extra Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Size (px)</Label>
                                        <Input
                                            type="number"
                                            value={style.fontSize ?? 32}
                                            onChange={(e) => onStyleUpdate('fontSize', Number(e.target.value))}
                                            className="h-8 text-xs bg-white"
                                        />
                                    </div>
                                    <ColorPicker
                                        label="Color"
                                        value={content.digitColor || '#111827'}
                                        onChange={(val) => handleContentUpdate('digitColor', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* CONTAINER STYLING - Box Preset Only */}
                        {content.preset === 'box' && (
                            <>
                                <div>
                                    <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Box size={12} /> Container Styling
                                    </h6>

                                    <div className="mb-4 space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-xs">Opacity</Label>
                                            <span className="text-[10px] text-gray-400">{Math.round((style.opacity ?? 1) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={style.opacity ?? 1}
                                            onChange={(e) => onStyleUpdate('opacity', parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>

                                    <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 space-y-4">
                                        <ColorPicker
                                            label="Container Background"
                                            value={style.backgroundColor || 'transparent'}
                                            onChange={(val) => onStyleUpdate('backgroundColor', val)}
                                            allowTransparent
                                        />

                                        {/* Shadow Section */}
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label className="text-xs font-medium text-gray-600">Drop Shadow</Label>
                                                <Switch
                                                    checked={style.shadowEnabled ?? false}
                                                    onCheckedChange={(c) => onStyleUpdate('shadowEnabled', c)}
                                                />
                                            </div>
                                            {style.shadowEnabled && (
                                                <div className="space-y-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Offset X</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={style.shadowOffsetX || 0}
                                                                onChange={e => onStyleUpdate('shadowOffsetX', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Offset Y</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={style.shadowOffsetY || 0}
                                                                onChange={e => onStyleUpdate('shadowOffsetY', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Spread</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={style.shadowSpread || 0}
                                                                onChange={e => onStyleUpdate('shadowSpread', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 col-span-2">
                                                            <Label className="text-[10px] text-gray-500">Blur</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={style.shadowBlur || 0}
                                                                onChange={e => onStyleUpdate('shadowBlur', Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="text-[10px] text-gray-500">Color</Label>
                                                            {/* We use shadowColor for style */}
                                                            <ColorPicker
                                                                label=""
                                                                value={style.shadowColor || '#000000'}
                                                                onChange={(val) => onStyleUpdate('shadowColor', val)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="text-[10px] text-gray-500">Opacity</Label>
                                                            <span className="text-[10px] text-gray-400">{Math.round(((style.shadowOpacity ?? 0.25) * 100))}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={style.shadowOpacity ?? 0.25}
                                                            onChange={(e) => onStyleUpdate('shadowOpacity', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Border W</Label>
                                                <Input
                                                    type="number"
                                                    className="h-7 text-xs bg-white"
                                                    value={style.borderWidth ?? 0}
                                                    onChange={(e) => onStyleUpdate('borderWidth', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Radius</Label>
                                                <Input
                                                    type="number"
                                                    className="h-7 text-xs bg-white"
                                                    value={style.borderRadius ?? 0}
                                                    onChange={(e) => onStyleUpdate('borderRadius', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <ColorPicker
                                                    label="Color"
                                                    value={style.borderColor || '#e5e7eb'}
                                                    onChange={(val) => onStyleUpdate('borderColor', val)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />
                            </>
                        )}

                        {/* UNIT STYLING */}
                        <div>
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <PaintBucket size={12} /> Unit Styling
                            </h6>

                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 space-y-4">
                                {content.preset === 'box' && (
                                    <ColorPicker
                                        label="Unit Background"
                                        value={content.unitBackgroundColor || content.tileColor || 'transparent'}
                                        onChange={(val) => handleContentUpdate('unitBackgroundColor', val)}
                                        allowTransparent
                                    />
                                )}

                                {content.preset === 'ring' && (
                                    <ColorPicker
                                        label="Ring Color"
                                        value={content.ringColor || '#6366f1'}
                                        onChange={(val) => handleContentUpdate('ringColor', val)}
                                    />
                                )}

                                {content.preset === 'box' && (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Border W</Label>
                                                <Input
                                                    type="number"
                                                    className="h-7 text-xs bg-white"
                                                    value={content.unitBorderWidth ?? 0}
                                                    onChange={(e) => handleContentUpdate('unitBorderWidth', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Radius</Label>
                                                <Input
                                                    type="number"
                                                    className="h-7 text-xs bg-white"
                                                    value={content.unitBorderRadius ?? 0}
                                                    onChange={(e) => handleContentUpdate('unitBorderRadius', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <ColorPicker
                                                    label="Color"
                                                    value={content.unitBorderColor || '#e5e7eb'}
                                                    onChange={(val) => handleContentUpdate('unitBorderColor', val)}
                                                />
                                            </div>
                                        </div>

                                        {/* Unit Shadow Section */}
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label className="text-xs font-medium text-gray-600">Unit Shadow</Label>
                                                <Switch
                                                    checked={content.unitShadowEnabled ?? false}
                                                    onCheckedChange={(c) => handleContentUpdate('unitShadowEnabled', c)}
                                                />
                                            </div>
                                            {content.unitShadowEnabled && (
                                                <div className="space-y-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Offset X</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={content.unitShadowX || 0}
                                                                onChange={e => handleContentUpdate('unitShadowX', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Offset Y</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={content.unitShadowY || 0}
                                                                onChange={e => handleContentUpdate('unitShadowY', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Spread</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={content.unitShadowSpread || 0}
                                                                onChange={e => handleContentUpdate('unitShadowSpread', Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-gray-500">Blur</Label>
                                                            <Input
                                                                className="h-7 text-xs bg-white"
                                                                type="number"
                                                                value={content.unitShadowBlur || 0}
                                                                onChange={e => handleContentUpdate('unitShadowBlur', Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex justify-between items-center">
                                                            <Label className="text-[10px] text-gray-500">Opacity</Label>
                                                            <span className="text-[10px] text-gray-400">{Math.round(((content.unitShadowOpacity ?? 0.25) * 100))}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={content.unitShadowOpacity ?? 0.25}
                                                            onChange={(e) => handleContentUpdate('unitShadowOpacity', parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <Separator />



                    </TabsContent>

                    {/* --- TAB: LAYOUT --- */}
                    <TabsContent value="layout" className="space-y-6 mt-0 animate-in fade-in-50">

                        {/* Flex Layout: Gap & Justify */}
                        <div>
                            <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <LayoutGrid size={12} /> Flex Layout
                            </h6>
                            <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Gap (px)</Label>
                                    <Input
                                        type="number"
                                        value={style.gap ?? 4}
                                        onChange={(e) => onStyleUpdate('gap', Number(e.target.value))}
                                        className="h-8 text-xs bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Position, Z-Index, etc */}
                        <CommonStyleControls
                            layer={layer}
                            selectedLayerId={selectedLayerId}
                            updateLayer={updateLayer}
                            onStyleUpdate={onStyleUpdate}
                            colors={colors}
                            showPosition={true}
                            showPadding={true}
                        />
                    </TabsContent>

                </div>
            </Tabs >
        </div >
    );
};
