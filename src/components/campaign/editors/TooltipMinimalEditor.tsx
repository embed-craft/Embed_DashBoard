import React, { useEffect, useState } from 'react';
import { useEditorStore, TooltipConfig } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
    Layout,
    Palette,
    Settings2,
    MousePointer2,
    Move,
    Maximize2,
    Image as ImageIcon,
    Sparkles,
    Target,
    ArrowUp,
    ScanLine,
    BoxSelect,
    Circle,
    Square,
    Waves,
    Eye,
    EyeOff,
    Activity,
    Zap,
    Ban,
    PaintBucket,
    Type,
    MoveHorizontal,
    MoveVertical,
    Scaling
} from 'lucide-react';

const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#000000'
];

export const TooltipMinimalEditor = () => {
    const {
        currentCampaign,
        activeInterfaceId,
        updateTooltipConfig,
        availablePages
    } = useEditorStore();

    const pages = availablePages || [];
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config: TooltipConfig = activeInterface ? (activeInterface.tooltipConfig || {}) : (currentCampaign?.tooltipConfig || {});

    const selectedPage = pages.find(p => p._id === config.targetPageId);

    useEffect(() => {
        if (!config || Object.keys(config).length === 0) {
            updateTooltipConfig({
                position: 'bottom',
                backgroundColor: '#1F2937',
                borderRadius: 12,
                padding: 16,
                arrowEnabled: true,
                arrowSize: 10,
                overlayEnabled: true,
                overlayColor: '#000000',
                overlayOpacity: 0.5,
                widthMode: 'custom',
                width: 280,
                targetBorderRadius: 4,
                targetBorderWidth: 2,
                targetBorderColor: '#6366F1',
                targetBorderStyle: 'solid',
                targetStyleEnabled: true,
                targetOffsetX: 0,
                targetOffsetY: 0,
                targetWidthAdjustment: 0,
                targetHeightAdjustment: 0,
                showTooltipBody: true,
                spotlightEffect: 'none',
            });
        }
    }, [config, updateTooltipConfig]);

    React.useEffect(() => {
        if (selectedPage && selectedPage.elements === undefined) {
            useEditorStore.getState().fetchPageDetails(selectedPage._id);
        }
    }, [selectedPage?._id, selectedPage?.elements]);

    const updateConfig = (key: string, value: any) => updateTooltipConfig({ [key]: value });
    const handleSliderChange = (key: string, value: number[]) => updateConfig(key, value[0]);

    if (!config) return null;

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Tooltip & Coachmark</h3>
            </div>

            <Tabs defaultValue="target" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 h-9 mb-4">
                    <TabsTrigger value="target" className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Target</TabsTrigger>
                    <TabsTrigger value="style" className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Style</TabsTrigger>

                    <TabsTrigger value="behavior" className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Behavior</TabsTrigger>
                </TabsList>

                {/* --- TARGET TAB --- */}
                <TabsContent value="target" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4 p-1">
                        {/* Page Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5"><ScanLine className="w-3.5 h-3.5" /> Target Page</Label>
                            <Select value={config.targetPageId || ''} onValueChange={(val) => updateConfig('targetPageId', val)}>
                                <SelectTrigger className="h-9 text-xs border-gray-200 bg-white focus:ring-1 focus:ring-blue-500">
                                    <SelectValue placeholder="Select Page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map(p => (
                                        <SelectItem key={p._id} value={p._id} className="text-xs cursor-pointer">{p.name} ({p.path})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Element Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 justify-between">
                                <span className="flex items-center gap-1.5"><BoxSelect className="w-3.5 h-3.5" /> Target Element</span>
                                <span className="text-[10px] text-gray-400 font-normal">{selectedPage?.elements?.length || 0} found</span>
                            </Label>
                            {selectedPage && !selectedPage.elements ? (
                                <div className="p-2 border border-blue-100 bg-blue-50 rounded text-xs text-blue-600 flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    Fetching element data...
                                </div>
                            ) : selectedPage && selectedPage.elements && selectedPage.elements.length > 0 ? (
                                <Select value={config.targetElementId || ''} onValueChange={(val) => updateConfig('targetElementId', val)}>
                                    <SelectTrigger className="h-9 text-xs border-gray-200 bg-white focus:ring-1 focus:ring-blue-500">
                                        <SelectValue placeholder="Select Element" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {selectedPage.elements.map((el: any) => (
                                            <SelectItem key={el.id} value={el.id} className="text-xs cursor-pointer">
                                                <span className="font-mono text-gray-500 text-[10px] mr-1">#{el.id}</span> {el.tagName && <span className="text-gray-400 text-[10px]">({el.tagName})</span>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="p-3 border border-dashed border-gray-200 rounded text-center">
                                    <p className="text-xs text-gray-500 mb-2">No elements found or page not selected.</p>
                                    <button
                                        onClick={() => selectedPage && useEditorStore.getState().fetchPageDetails(selectedPage._id)}
                                        className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                                    >
                                        Force Refresh
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Moved Fine Tune Geometry Here */}
                    <div className="space-y-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <Label className="text-xs font-semibold text-blue-900 flex items-center gap-1.5"><Move className="w-3 h-3" /> Fine Tune Position & Size</Label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500 flex items-center gap-1"><MoveHorizontal className="w-3 h-3" /> Offset X</Label>
                                <Input
                                    type="number"
                                    value={config.targetOffsetX ?? 0}
                                    onChange={(e) => updateConfig('targetOffsetX', parseInt(e.target.value) || 0)}
                                    className="h-7 text-xs bg-white"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500 flex items-center gap-1"><MoveVertical className="w-3 h-3" /> Offset Y</Label>
                                <Input
                                    type="number"
                                    value={config.targetOffsetY ?? 0}
                                    onChange={(e) => updateConfig('targetOffsetY', parseInt(e.target.value) || 0)}
                                    className="h-7 text-xs bg-white"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500 flex items-center gap-1"><Scaling className="w-3 h-3" /> Width Adj</Label>
                                <Input
                                    type="number"
                                    value={config.targetWidthAdjustment ?? 0}
                                    onChange={(e) => updateConfig('targetWidthAdjustment', parseInt(e.target.value) || 0)}
                                    className="h-7 text-xs bg-white"
                                    placeholder="+/- px"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500 flex items-center gap-1"><Scaling className="w-3 h-3 rotate-90" /> Height Adj</Label>
                                <Input
                                    type="number"
                                    value={config.targetHeightAdjustment ?? 0}
                                    onChange={(e) => updateConfig('targetHeightAdjustment', parseInt(e.target.value) || 0)}
                                    className="h-7 text-xs bg-white"
                                    placeholder="+/- px"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Dimensions Moved Here */}
                    <div className="space-y-4 pt-2">
                        <Label className="text-xs font-semibold text-gray-700">Dimensions</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Padding (px)</Label>
                                <Input
                                    type="number"
                                    value={config.targetHighlightPadding ?? 4}
                                    onChange={(e) => updateConfig('targetHighlightPadding', parseInt(e.target.value) || 0)}
                                    className="h-8 text-xs bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Roundness (px)</Label>
                                <Input
                                    type="number"
                                    value={config.targetRoundness ?? 4}
                                    onChange={(e) => updateConfig('targetRoundness', parseInt(e.target.value) || 0)}
                                    className="h-8 text-xs bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Moved Overlay Here */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><ScanLine className="w-3.5 h-3.5" /> Overlay (Spotlight)</Label>
                            <Switch
                                checked={config.overlayEnabled !== false}
                                onCheckedChange={(c) => updateConfig('overlayEnabled', c)}
                            />
                        </div>

                        {config.overlayEnabled !== false && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in">
                                <div className="space-y-2">
                                    <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Color</Label></div>
                                    <div className="flex gap-2 items-center">
                                        <div className="relative w-full h-8 rounded border border-gray-200 shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 bg-white">
                                            <div className="absolute inset-0" style={{ backgroundColor: config.overlayColor || '#000000' }} />
                                            <Input
                                                type="color"
                                                value={config.overlayColor || '#000000'}
                                                onChange={(e) => updateConfig('overlayColor', e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 p-0 border-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Opacity</Label><span className="text-[10px] text-gray-400">{((config.overlayOpacity ?? 0.5) * 100).toFixed(0)}%</span></div>
                                    <Slider
                                        value={[config.overlayOpacity ?? 0.5]}
                                        max={1} step={0.05}
                                        onValueChange={(val) => handleSliderChange('overlayOpacity', val)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                </TabsContent>


                <TabsContent value="style" className="space-y-4 pl-1 pr-1">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 h-8 mb-4 rounded-lg">
                            <TabsTrigger value="element" className="text-[10px] data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm rounded-md transition-all">Element</TabsTrigger>
                            <TabsTrigger value="tooltip" className="text-[10px] data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm rounded-md transition-all">Tooltip</TabsTrigger>
                            <TabsTrigger value="coachmark" className="text-[10px] data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm rounded-md transition-all">Coachmark</TabsTrigger>
                        </TabsList>

                        {/* ELEMENT SUB-TAB */}
                        <TabsContent value="element" className="space-y-4 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-4">
                                {/* Toggle Target Design */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex flex-col">
                                        <Label className="text-xs font-semibold text-slate-800">Target Decoration</Label>
                                        <span className="text-[10px] text-slate-500">Show box around target</span>
                                    </div>
                                    <Switch
                                        checked={config.targetStyleEnabled !== false}
                                        onCheckedChange={(c) => updateConfig('targetStyleEnabled', c)}
                                    />
                                </div>

                                {config.targetStyleEnabled !== false && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border border-slate-100 bg-white p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-700">Border</Label>
                                            <Switch
                                                checked={config.targetBorderEnabled !== false}
                                                onCheckedChange={(c) => {
                                                    updateTooltipConfig({
                                                        targetBorderEnabled: c,
                                                        ...(c === false ? { targetBorderWidth: 0 } : {})
                                                    });
                                                }}
                                            />
                                        </div>

                                        {config.targetBorderEnabled !== false && (
                                            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] text-slate-500">Style</Label>
                                                        <Select value={config.targetBorderStyle || 'solid'} onValueChange={(val) => updateConfig('targetBorderStyle', val)}>
                                                            <SelectTrigger className="h-8 text-xs bg-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="solid" className="text-xs">Solid</SelectItem>
                                                                <SelectItem value="dashed" className="text-xs">Dashed</SelectItem>
                                                                <SelectItem value="dotted" className="text-xs">Dotted</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] text-slate-500">Width (px)</Label>
                                                        <Input
                                                            type="number"
                                                            value={config.targetBorderWidth ?? 0}
                                                            onChange={(e) => updateConfig('targetBorderWidth', parseInt(e.target.value))}
                                                            className="h-8 text-xs bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] text-slate-500">Color</Label><span className="text-[10px] text-slate-400">{config.targetBorderColor}</span></div>

                                                    <div className="flex gap-1 flex-wrap mb-2">
                                                        {PALETTE.slice(0, 10).map(color => (
                                                            <button key={color} onClick={() => updateConfig('targetBorderColor', color)} className={`w-5 h-5 rounded-full border ${config.targetBorderColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-slate-200 transition-transform hover:scale-110'}`} style={{ backgroundColor: color }} />
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <div className="relative w-8 h-8 rounded border border-slate-200 shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 bg-white">
                                                            <div className="absolute inset-0" style={{ backgroundColor: config.targetBorderColor || 'transparent' }} />
                                                            <Input
                                                                type="color"
                                                                value={config.targetBorderColor?.startsWith('#') ? config.targetBorderColor : '#000000'}
                                                                onChange={(e) => updateConfig('targetBorderColor', e.target.value)}
                                                                className="absolute inset-0 w-full h-full opacity-0 p-0 border-0 cursor-pointer"
                                                            />
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            value={config.targetBorderColor || ''}
                                                            onChange={(e) => updateConfig('targetBorderColor', e.target.value)}
                                                            className="h-8 text-xs flex-1 bg-white"
                                                            placeholder="#HEX"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-700">Shadow</Label>
                                            <Switch
                                                checked={config.targetShadowEnabled || false}
                                                onCheckedChange={(c) => {
                                                    updateTooltipConfig({
                                                        targetShadowEnabled: c,
                                                        ...(c === false ? { targetShadowBlur: 0, targetShadowSpread: 0 } : {})
                                                    });
                                                }}
                                            />
                                        </div>

                                        {config.targetShadowEnabled && (
                                            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center"><Label className="text-[10px] text-slate-500">Color</Label><span className="text-[10px] text-slate-400">{config.targetShadowColor}</span></div>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {PALETTE.slice(0, 7).map(color => (
                                                            <button key={color} onClick={() => updateConfig('targetShadowColor', color)} className={`w-5 h-5 rounded-full border ${config.targetShadowColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-slate-200 transition-transform hover:scale-110'}`} style={{ backgroundColor: color }} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-slate-500">Blur</Label>
                                                        <Input type="number" className="h-7 text-xs" value={config.targetShadowBlur ?? 8} onChange={(e) => updateConfig('targetShadowBlur', parseInt(e.target.value))} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-slate-500">Spread</Label>
                                                        <Input type="number" className="h-7 text-xs" value={config.targetShadowSpread ?? 0} onChange={(e) => updateConfig('targetShadowSpread', parseInt(e.target.value))} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TOOLTIP SUB-TAB (Formerly General) */}
                        <TabsContent value="tooltip" className="space-y-4 animate-in fade-in slide-in-from-top-1">
                            {/* Body Visibility Toggle */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {config.showTooltipBody !== false ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                    <div className="flex flex-col">
                                        <Label className="text-xs font-semibold text-blue-900">Show Tooltip Body</Label>
                                        <span className="text-[10px] text-blue-600">Toggle the text bubble</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={config.showTooltipBody !== false} // Default true
                                    onCheckedChange={(c) => {
                                        if (c) {
                                            // Mutual exclusivity: disable coachmark when tooltip body is shown
                                            updateConfig('coachmarkEnabled', false);
                                        }
                                        updateConfig('showTooltipBody', c);
                                    }}
                                />
                            </div>

                            {config.showTooltipBody !== false && (
                                <div className="space-y-6 pt-2">
                                    {/* 1. PLACEMENT */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Placement</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['top', 'bottom', 'left', 'right'].map((pos) => (
                                                <button
                                                    key={pos}
                                                    onClick={() => updateConfig('position', pos)}
                                                    className={`
                                                                px-3 py-2 rounded-md text-xs border transition-all flex items-center justify-center gap-2 capitalize
                                                                ${config.position === pos
                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                                            `}
                                                >
                                                    {pos === 'top' && <ArrowUp className="w-3 h-3" />}
                                                    {pos === 'bottom' && <ArrowUp className="w-3 h-3 rotate-180" />}
                                                    {pos === 'left' && <ArrowUp className="w-3 h-3 -rotate-90" />}
                                                    {pos === 'right' && <ArrowUp className="w-3 h-3 rotate-90" />}
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Offset X (px)</Label>
                                                <Input
                                                    type="number"
                                                    value={config.offsetX ?? 0}
                                                    onChange={(e) => updateConfig('offsetX', parseInt(e.target.value) || 0)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Offset Y (px)</Label>
                                                <Input
                                                    type="number"
                                                    value={config.offsetY ?? 0}
                                                    onChange={(e) => updateConfig('offsetY', parseInt(e.target.value) || 0)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* 2. DIMENSIONS */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Scaling className="w-3.5 h-3.5" /> Dimensions</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Width */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] text-gray-500">Width</Label>
                                                    <select
                                                        className="text-[10px] border-none bg-transparent text-blue-600 font-medium focus:ring-0 cursor-pointer p-0 h-auto"
                                                        value={config.widthMode || 'auto'}
                                                        onChange={(e) => updateConfig('widthMode', e.target.value)}
                                                    >
                                                        <option value="auto">Auto</option>
                                                        <option value="custom">Custom</option>
                                                    </select>
                                                </div>
                                                {config.widthMode === 'custom' ? (
                                                    <div className="relative flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            value={parseInt(String(config.width)) || 280}
                                                            onChange={(e) => updateConfig('width', parseInt(e.target.value) || 0)}
                                                            className="h-8 text-xs pr-1"
                                                        />
                                                        <select
                                                            className="h-8 text-[10px] border-gray-200 bg-gray-50 rounded cursor-pointer focus:ring-1 focus:ring-blue-500"
                                                            value={config.widthUnit || 'px'}
                                                            onChange={(e) => updateConfig('widthUnit', e.target.value)}
                                                        >
                                                            <option value="px">px</option>
                                                            <option value="%">%</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="h-8 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded text-[10px] text-gray-400">
                                                        Auto-sized
                                                    </div>
                                                )}
                                            </div>

                                            {/* Height */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-[10px] text-gray-500">Height</Label>
                                                    <select
                                                        className="text-[10px] border-none bg-transparent text-blue-600 font-medium focus:ring-0 cursor-pointer p-0 h-auto"
                                                        value={config.heightMode || 'auto'}
                                                        onChange={(e) => updateConfig('heightMode', e.target.value)}
                                                    >
                                                        <option value="auto">Auto</option>
                                                        <option value="custom">Custom</option>
                                                    </select>
                                                </div>
                                                {config.heightMode === 'custom' ? (
                                                    <div className="relative flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            value={parseInt(String(config.height)) || 100}
                                                            onChange={(e) => updateConfig('height', parseInt(e.target.value) || 0)}
                                                            className="h-8 text-xs pr-1"
                                                        />
                                                        <select
                                                            className="h-8 text-[10px] border-gray-200 bg-gray-50 rounded cursor-pointer focus:ring-1 focus:ring-blue-500"
                                                            value={config.heightUnit || 'px'}
                                                            onChange={(e) => updateConfig('heightUnit', e.target.value)}
                                                        >
                                                            <option value="px">px</option>
                                                            <option value="%">%</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="h-8 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded text-[10px] text-gray-400">
                                                        Auto-sized
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* 3. BACKGROUND */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Background</Label>

                                        {/* Color & Opacity */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Params</Label><span className="text-[10px] text-gray-400">Opacity: {((config.backgroundOpacity ?? 1) * 100).toFixed(0)}%</span></div>
                                            <div className="flex gap-3 items-center">
                                                <div className="flex gap-2 items-center flex-1">
                                                    <div className="relative w-8 h-8 rounded border border-gray-200 shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 bg-white">
                                                        <div className="absolute inset-0" style={{ backgroundColor: config.backgroundColor || '#1F2937' }} />
                                                        <Input
                                                            type="color"
                                                            value={config.backgroundColor === 'transparent' ? '#ffffff' : (config.backgroundColor || '#1F2937')}
                                                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                                                            className="absolute inset-0 w-full h-full opacity-0 p-0 border-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <Input
                                                        className="h-8 text-xs font-mono w-20"
                                                        value={config.backgroundColor || '#1F2937'}
                                                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => updateConfig('backgroundColor', 'transparent')}
                                                        className="h-8 px-2 text-[10px] border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
                                                        title="Set Transparent"
                                                    >
                                                        Transparent
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <Slider
                                                        value={[config.backgroundOpacity ?? 1]}
                                                        max={1} step={0.05}
                                                        onValueChange={(val) => handleSliderChange('backgroundOpacity', val)}
                                                        className="py-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image */}
                                        <div className="space-y-2 pt-1">
                                            <Label className="text-[10px] text-gray-500 flex items-center justify-between">
                                                <span>Background Image URL</span>
                                                <select
                                                    className="text-[10px] border-none bg-transparent text-gray-500 font-normal focus:ring-0 cursor-pointer p-0 h-auto"
                                                    value={config.backgroundSize || 'cover'}
                                                    onChange={(e) => updateConfig('backgroundSize', e.target.value)}
                                                >
                                                    <option value="cover">Cover</option>
                                                    <option value="contain">Contain</option>
                                                    <option value="fill">Fill</option>
                                                </select>
                                            </Label>
                                            <Input
                                                className="h-8 text-xs"
                                                placeholder="https://..."
                                                value={config.backgroundImageUrl || ''}
                                                onChange={(e) => updateConfig('backgroundImageUrl', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* GLASSMORPHISM */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Waves className="w-3.5 h-3.5" /> Glassmorphism</Label>
                                            <Switch
                                                checked={config.backdropFilter?.enabled === true}
                                                onCheckedChange={(c) => updateConfig('backdropFilter', { ...config.backdropFilter, enabled: c, blur: config.backdropFilter?.blur || 10 })}
                                            />
                                        </div>

                                        {config.backdropFilter?.enabled && (
                                            <div className="space-y-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 animate-in fade-in">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Blur Amount</Label><span className="text-[10px] text-gray-400">{config.backdropFilter?.blur || 10}px</span></div>
                                                    <Slider
                                                        value={[config.backdropFilter?.blur || 10]}
                                                        max={40} step={1}
                                                        onValueChange={(val) => updateConfig('backdropFilter', { ...config.backdropFilter, blur: val[0] })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* 4. ARROW */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><Move className="w-3.5 h-3.5 rotate-45" /> Arrow</Label>
                                            <Switch
                                                checked={config.showArrow !== false}
                                                onCheckedChange={(c) => updateConfig('showArrow', c)}
                                            />
                                        </div>

                                        {config.showArrow !== false && (
                                            <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] text-gray-500">Color</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <div className="relative w-8 h-8 rounded border border-gray-200 shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 bg-white">
                                                            <div className="absolute inset-0" style={{ backgroundColor: config.arrowColor || config.backgroundColor || '#1F2937' }} />
                                                            <Input
                                                                type="color"
                                                                value={config.arrowColor || config.backgroundColor || '#1F2937'}
                                                                onChange={(e) => updateConfig('arrowColor', e.target.value)}
                                                                className="absolute inset-0 w-full h-full opacity-0 p-0 border-0 cursor-pointer"
                                                            />
                                                        </div>
                                                        <Input
                                                            className="h-8 text-xs font-mono"
                                                            value={config.arrowColor || config.backgroundColor || '#1F2937'}
                                                            onChange={(e) => updateConfig('arrowColor', e.target.value)}
                                                            placeholder="Same as bg"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] text-gray-500">Size (px)</Label>
                                                    <Input
                                                        type="number"
                                                        value={config.arrowSize ?? 10}
                                                        onChange={(e) => updateConfig('arrowSize', parseInt(e.target.value) || 0)}
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Position</Label><span className="text-[10px] text-gray-400">{config.arrowPositionPercent ?? 50}%</span></div>
                                                    <Slider
                                                        value={[config.arrowPositionPercent ?? 50]}
                                                        max={100} step={1}
                                                        onValueChange={(val) => handleSliderChange('arrowPositionPercent', val)}
                                                    />
                                                    <div className="flex justify-between text-[8px] text-gray-400"><span>Start</span><span>Center</span><span>End</span></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><Label className="text-[10px] text-gray-500">Roundness</Label><span className="text-[10px] text-gray-400">{config.arrowRoundness ?? 0}%</span></div>
                                                    <Slider
                                                        value={[config.arrowRoundness ?? 0]}
                                                        max={100} step={5}
                                                        onValueChange={(val) => handleSliderChange('arrowRoundness', val)}
                                                    />
                                                    <div className="flex justify-between text-[8px] text-gray-400"><span>Sharp</span><span>Rounded</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />
                                </div>
                            )}
                        </TabsContent>

                        {/* COACHMARK SUB-TAB */}
                        <TabsContent value="coachmark" className="space-y-4 animate-in fade-in slide-in-from-top-1">
                            {/* Enable Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <div>
                                    <Label className="text-xs font-semibold text-slate-800">Enable Coachmark</Label>
                                    <p className="text-[10px] text-slate-500">Spotlight overlay on target</p>
                                </div>
                                <Switch
                                    checked={config.coachmarkEnabled || false}
                                    onCheckedChange={(enabled) => {
                                        updateConfig('coachmarkEnabled', enabled);
                                        if (enabled) {
                                            // Mutual exclusivity: hide tooltip body when coachmark is enabled
                                            updateConfig('showTooltipBody', false);
                                            // Set wave defaults
                                            updateConfig('coachmarkShape', 'wave');
                                            updateConfig('waveCoverage', 40);
                                            updateConfig('waveCurvature', 70);
                                            updateConfig('waveOrigin', 'bottom');
                                            // Reset spotlight to 0
                                            updateConfig('spotlightWidth', 0);
                                            updateConfig('spotlightHeight', 0);
                                            updateConfig('spotlightPadding', 0);
                                            updateConfig('spotlightRadius', 0);
                                            updateConfig('spotlightBlur', 0);
                                            // Reset ring
                                            updateConfig('ringEnabled', false);
                                            updateConfig('ringCount', 0);
                                            updateConfig('ringWidth', 0);
                                            updateConfig('ringGap', 0);
                                        }
                                    }}
                                />
                            </div>



                            {config.coachmarkEnabled && (
                                <div className="space-y-4">
                                    {/* OVERLAY */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-slate-700">Overlay</Label>
                                        {/* Shape selector */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {['rectangle', 'wave'].map((shape) => (
                                                <button
                                                    key={shape}
                                                    onClick={() => updateConfig('coachmarkShape', shape)}
                                                    className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${(config.coachmarkShape || 'rectangle') === shape
                                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                                                        }`}
                                                >
                                                    {shape}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Wave settings */}
                                        {config.coachmarkShape === 'wave' && (
                                            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                                                <div className="grid grid-cols-4 gap-1">
                                                    {['bottom', 'top', 'left', 'right'].map((origin) => (
                                                        <button
                                                            key={origin}
                                                            onClick={() => updateConfig('waveOrigin', origin)}
                                                            className={`text-[10px] py-1.5 rounded border capitalize ${(config.waveOrigin || 'bottom') === origin
                                                                ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-slate-200 text-slate-500'
                                                                }`}
                                                        >
                                                            {origin}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((origin) => (
                                                        <button
                                                            key={origin}
                                                            onClick={() => updateConfig('waveOrigin', origin)}
                                                            className={`text-[10px] py-1.5 rounded border capitalize ${(config.waveOrigin || 'bottom') === origin
                                                                ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-slate-200 text-slate-500'
                                                                }`}
                                                        >
                                                            {origin.replace('-', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-slate-500">Coverage %</Label>
                                                        <Input
                                                            type="number"
                                                            value={config.waveCoverage ?? 60}
                                                            onChange={(e) => updateConfig('waveCoverage', Number(e.target.value))}
                                                            className="h-7 text-xs"
                                                            min={10} max={90}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-slate-500">Curvature</Label>
                                                        <Input
                                                            type="number"
                                                            value={config.waveCurvature ?? 80}
                                                            onChange={(e) => updateConfig('waveCurvature', Number(e.target.value))}
                                                            className="h-7 text-xs"
                                                            min={-200} max={200}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Wave Fit Switch */}
                                        {config.coachmarkShape === 'wave' && (
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                                                <div className="flex flex-col">
                                                    <Label className="text-[10px] font-medium text-slate-700">Fit to Screen Height</Label>
                                                    <span className="text-[8px] text-slate-400">Scale depth with height</span>
                                                </div>
                                                <Switch
                                                    className="scale-75 origin-right"
                                                    checked={config.waveFitToHeight || false}
                                                    onCheckedChange={(c) => updateConfig('waveFitToHeight', c)}
                                                />
                                            </div>
                                        )}

                                        {/* Color + Opacity */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-9 h-9 rounded-lg border border-slate-200 overflow-hidden cursor-pointer">
                                                <div className="absolute inset-0" style={{ backgroundColor: config.overlayColor || '#000000' }} />
                                                <Input
                                                    type="color"
                                                    value={config.overlayColor || '#000000'}
                                                    onChange={(e) => updateConfig('overlayColor', e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500">Opacity</span>
                                                    <span className="text-slate-400">{Math.round((config.overlayOpacity ?? 0.75) * 100)}%</span>
                                                </div>
                                                <Slider
                                                    value={[config.overlayOpacity ?? 0.75]}
                                                    max={1} step={0.05}
                                                    onValueChange={(val) => handleSliderChange('overlayOpacity', val)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* SPOTLIGHT */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-slate-700">Spotlight</Label>
                                        {/* Width / Height */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Width (0=auto)</Label>
                                                <Input
                                                    type="number"
                                                    value={config.spotlightWidth ?? 0}
                                                    onChange={(e) => updateConfig('spotlightWidth', Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                    min={0} max={400}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Height (0=auto)</Label>
                                                <Input
                                                    type="number"
                                                    value={config.spotlightHeight ?? 0}
                                                    onChange={(e) => updateConfig('spotlightHeight', Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                    min={0} max={400}
                                                />
                                            </div>
                                        </div>
                                        {/* Padding / Radius / Blur */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Padding</Label>
                                                <Input
                                                    type="number"
                                                    value={config.spotlightPadding ?? 12}
                                                    onChange={(e) => updateConfig('spotlightPadding', Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                    min={0}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Radius</Label>
                                                <Input
                                                    type="number"
                                                    value={config.spotlightRadius ?? 8}
                                                    onChange={(e) => updateConfig('spotlightRadius', Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                    min={0}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-500">Blur</Label>
                                                <Input
                                                    type="number"
                                                    value={config.spotlightBlur ?? 0}
                                                    onChange={(e) => updateConfig('spotlightBlur', Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                    min={0} max={15}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Tip: Set radius to 999 for circle shape</p>
                                    </div>

                                    <Separator />

                                    {/* RING */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={config.ringEnabled || false}
                                                    onCheckedChange={(c) => updateConfig('ringEnabled', c)}
                                                />
                                                <Label className="text-xs text-slate-700">Ring Effect</Label>
                                            </div>
                                            {config.ringEnabled && (
                                                <div className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer">
                                                    <div className="absolute inset-0" style={{ backgroundColor: config.ringColor || '#ffffff' }} />
                                                    <Input
                                                        type="color"
                                                        value={config.ringColor || '#ffffff'}
                                                        onChange={(e) => updateConfig('ringColor', e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {config.ringEnabled && (
                                            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
                                                {/* Shape Selector */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['rectangle', 'circle'].map((shape) => (
                                                        <button
                                                            key={shape}
                                                            onClick={() => updateConfig('ringShape', shape)}
                                                            className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${(config.ringShape || 'rectangle') === shape
                                                                ? 'bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                                                                }`}
                                                        >
                                                            {shape === 'circle' ? '○ Circle' : '□ Rectangle'}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Rectangle Mode Controls */}
                                                {(config.ringShape || 'rectangle') === 'rectangle' && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500">Count</Label>
                                                            <Input
                                                                type="number"
                                                                value={config.ringCount ?? 2}
                                                                onChange={(e) => updateConfig('ringCount', Math.max(1, Number(e.target.value)))}
                                                                className="h-8 text-xs"
                                                                min={1}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500">Width</Label>
                                                            <Input
                                                                type="number"
                                                                value={config.ringWidth ?? 2}
                                                                onChange={(e) => updateConfig('ringWidth', Number(e.target.value))}
                                                                className="h-8 text-xs"
                                                                min={1}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] text-slate-500">Gap</Label>
                                                            <Input
                                                                type="number"
                                                                value={config.ringGap ?? 6}
                                                                onChange={(e) => updateConfig('ringGap', Number(e.target.value))}
                                                                className="h-8 text-xs"
                                                                min={0}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Circle Mode Controls */}
                                                {config.ringShape === 'circle' && (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Count</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={config.ringCount ?? 1}
                                                                    onChange={(e) => updateConfig('ringCount', Math.max(1, Number(e.target.value)))}
                                                                    className="h-8 text-xs"
                                                                    min={1} max={5}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Radius</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={config.ringRadius ?? 50}
                                                                    onChange={(e) => updateConfig('ringRadius', Number(e.target.value))}
                                                                    className="h-8 text-xs"
                                                                    min={10}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Width</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={config.ringWidth ?? 4}
                                                                    onChange={(e) => updateConfig('ringWidth', Number(e.target.value))}
                                                                    className="h-8 text-xs"
                                                                    min={1}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] text-slate-500">Gap</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={config.ringGap ?? 6}
                                                                    onChange={(e) => updateConfig('ringGap', Number(e.target.value))}
                                                                    className="h-8 text-xs"
                                                                    min={0}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-[10px] text-slate-500">Arc</Label>
                                                                <span className="text-[10px] text-slate-400">{config.ringArcPercent ?? 100}%</span>
                                                            </div>
                                                            <Slider
                                                                value={[config.ringArcPercent ?? 100]}
                                                                max={100} min={10} step={5}
                                                                onValueChange={(val) => handleSliderChange('ringArcPercent', val)}
                                                            />
                                                            <div className="flex justify-between text-[8px] text-slate-400">
                                                                <span>10%</span><span>50%</span><span>100%</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <Label className="text-[10px] text-slate-500">Start Angle</Label>
                                                                <span className="text-[10px] text-slate-400">{config.ringArcStartAngle ?? 0}°</span>
                                                            </div>
                                                            <Slider
                                                                value={[config.ringArcStartAngle ?? 0]}
                                                                max={360} min={0} step={15}
                                                                onValueChange={(val) => handleSliderChange('ringArcStartAngle', val)}
                                                            />
                                                            <div className="flex justify-between text-[8px] text-slate-400">
                                                                <span>0° (top)</span><span>180°</span><span>360°</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* --- POSITION TAB --- */}
                <TabsContent value="position" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4 p-1">
                        <Label className="text-xs font-semibold text-gray-600">Placement</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['top', 'bottom', 'left', 'right'].map((pos) => (
                                <button
                                    key={pos}
                                    onClick={() => updateConfig('position', pos)}
                                    className={`
                                        flex items-center justify-center p-2 rounded text-xs transition-all border
                                        ${config.position === pos
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                                    `}
                                >
                                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4 p-1">
                        <Label className="text-xs font-semibold text-gray-600">Fine Tune</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Offset X</Label>
                                <Input type="number" value={config.offsetX ?? 0} onChange={(e) => updateConfig('offsetX', parseInt(e.target.value))} className="h-8 text-xs" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Offset Y</Label>
                                <Input type="number" value={config.offsetY ?? 0} onChange={(e) => updateConfig('offsetY', parseInt(e.target.value))} className="h-8 text-xs" />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- BEHAVIOR TAB --- */}
                <TabsContent value="behavior" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4 p-1">
                        {/* Timing */}
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold text-gray-600">Timing</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-gray-500">Delay (Seconds)</Label>
                                    <Input
                                        type="number"
                                        value={(config.timing?.delay ?? 0)}
                                        onChange={(e) => updateConfig('timing', { ...(config.timing || {}), delay: parseFloat(e.target.value) || 0 })}
                                        className="h-8 text-xs"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-gray-500">Duration (Seconds)</Label>
                                    <Input
                                        type="number"
                                        value={(config.timing?.duration ?? 0)}
                                        onChange={(e) => updateConfig('timing', { ...(config.timing || {}), duration: parseFloat(e.target.value) || 0 })}
                                        className="h-8 text-xs"
                                        placeholder="0 = Infinite"
                                    />
                                    <p className="text-[9px] text-gray-400">0 = Infinite</p>
                                </div>
                            </div>
                        </div>
                        <Separator />


                        {/* Timeline Mode */}
                        <div className="flex items-start justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-orange-900">Timeline Mode</Label>
                                <p className="text-[10px] text-orange-700/80 leading-tight">
                                    Requires user to click tooltip to proceed.
                                </p>
                            </div>
                            <Switch
                                checked={config.timelineMode || false}
                                onCheckedChange={(c) => {
                                    updateConfig('timelineMode', c);
                                    if (c && !config.closeOnTargetClick) {
                                        // Auto-configure helpful defaults for timeline mode
                                        updateConfig('closeOnTargetClick', false);
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-gray-600">Interaction Rules</Label>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-normal text-gray-600">Close on Outside Click</Label>
                                <Switch
                                    checked={config.closeOnOutsideClick ?? true}
                                    onCheckedChange={(c) => updateConfig('closeOnOutsideClick', c)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-normal text-gray-600">Close on Target Click</Label>
                                <Switch
                                    checked={config.closeOnTargetClick ?? false}
                                    onCheckedChange={(c) => updateConfig('closeOnTargetClick', c)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-normal text-gray-600">Auto Scroll to Target</Label>
                                <Switch
                                    checked={config.autoScrollToTarget ?? false}
                                    onCheckedChange={(c) => updateConfig('autoScrollToTarget', c)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs >
        </div >
    );
};
