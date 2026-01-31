
import React, { useState } from 'react';
import { Layer } from '@/store/useEditorStore';
import { useEditorStore } from '@/store/useEditorStore';
import {
    Plus,
    Trash2,
    Settings,
    ArrowRight,
    ArrowLeft,
    Layout,
    MousePointer,
    Maximize2,
    Play,
    Repeat,
    Image,
    Palette,
    Layers,
    Navigation,
    CircleDot,
    Activity,
    Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface CarouselLayerEditorProps {
    layer: Layer;
    updateLayer: (id: string, updates: Partial<Layer> | any) => void;
}

export const CarouselLayerEditor: React.FC<CarouselLayerEditorProps> = ({ layer, updateLayer }) => {
    // Access global store to add children correctly
    const { addLayer, deleteLayer, currentCampaign } = useEditorStore();
    const layers = currentCampaign?.layers || [];

    // Derived state
    const slides = layers.filter(l => l.parent === layer.id);
    const config = (layer.content || {}) as any;

    // --- LOGIC ---
    const handleAddSlide = () => {
        const slideCount = slides.length + 1;
        // 1. Add generic container
        const newId = addLayer('container', layer.id);

        if (newId) {
            // 2. Immediately enforce Strict Slide Properties via Global Store
            const globalUpdateLayer = useEditorStore.getState().updateLayer;
            globalUpdateLayer(newId, {
                name: `Slide ${slideCount} `,
                size: { width: '100%', height: '100%' },
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '0px',
                    margin: '0px',
                    gap: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: 'rgba(0,0,0,0.1)'
                }
            });
        }
    };

    const handleDeleteSlide = (slideId: string) => {
        deleteLayer(slideId);
    };

    const updateConfig = (key: string, value: any) => {
        updateLayer(layer.id, {
            content: { ...config, [key]: value }
        });
    };

    const updateStyle = (key: string, value: any) => {
        updateLayer(layer.id, {
            style: { ...layer.style, [key]: value }
        });
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Carousel Setup</h3>
            </div>

            <Tabs defaultValue="slides" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="slides"><Layers className="w-3.5 h-3.5 mr-1.5" /> Slides</TabsTrigger>
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="style"><Palette className="w-3.5 h-3.5 mr-1.5" /> Style</TabsTrigger>
                    <TabsTrigger value="controls"><Navigation className="w-3.5 h-3.5 mr-1.5" /> Controls</TabsTrigger>
                </TabsList>

                {/* --- SLIDES TAB --- */}
                <TabsContent value="slides" className="space-y-4 animate-in fade-in-50">
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs font-semibold text-gray-700">Manage Slides ({slides.length})</Label>
                            <button
                                onClick={handleAddSlide}
                                className="flex items-center gap-1 text-[10px] font-medium bg-indigo-600 text-white px-2 py-1.5 rounded hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                <Plus size={12} /> Add Slide
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                            {slides.length === 0 && (
                                <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg bg-white">
                                    No slides yet.<br />Click "Add Slide" to start.
                                </div>
                            )}
                            {slides.map((slide, idx) => (
                                <div key={slide.id} className="flex justify-between items-center bg-white border border-gray-200 p-2.5 rounded-md text-xs group hover:border-indigo-200 transition-colors shadow-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                                            {idx + 1}
                                        </span>
                                        <span className="truncate font-medium text-gray-700">{slide.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSlide(slide.id)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Slide"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="text-[10px] text-gray-500 bg-blue-50/50 p-2 rounded border border-blue-100 flex gap-2 items-start">
                            <div className="mt-0.5 min-w-[3px] w-1 h-1 rounded-full bg-blue-400" />
                            <p>Slides are 100% width/height containers. Add content inside them like any other box.</p>
                        </div>
                    </div>
                </TabsContent>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Dimensions */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Dimensions</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Width */}
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Width</Label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                                        <Input
                                            type="number"
                                            className="pl-7 h-8 text-xs w-full"
                                            value={String(layer.style?.width || '').replace(/[^\d.]/g, '')}
                                            placeholder="Auto"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const currentVal = String(layer.style?.width || '');
                                                const isPercent = currentVal.includes('%');
                                                updateStyle('width', val === '' ? 'auto' : (isPercent ? `${val}% ` : `${val} px`));
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const currentVal = String(layer.style?.width || '');
                                            const isPercent = currentVal.includes('%');
                                            const numVal = parseFloat(currentVal) || 0;
                                            updateStyle('width', isPercent ? `${numVal} px` : `${Math.min(numVal, 100)}% `);
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(layer.style?.width || '').includes('%') ? '%' : 'px'}
                                    </button>
                                </div>
                            </div>

                            {/* Height */}
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Height</Label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400 rotate-90" />
                                        <Input
                                            type="number"
                                            className="pl-7 h-8 text-xs w-full"
                                            value={String(layer.style?.height || '').replace(/[^\d.]/g, '')}
                                            placeholder="Auto"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const currentVal = String(layer.style?.height || '');
                                                const isPercent = currentVal.includes('%');
                                                updateStyle('height', val === '' ? 'auto' : (isPercent ? `${val}% ` : `${val} px`));
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const currentVal = String(layer.style?.height || '');
                                            const isPercent = currentVal.includes('%');
                                            const numVal = parseFloat(currentVal) || 0;
                                            updateStyle('height', isPercent ? `${numVal} px` : `${Math.min(numVal, 100)}% `);
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(layer.style?.height || '').includes('%') ? '%' : 'px'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Playback Behavior */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-gray-700">Playback</Label>

                        <div className="border rounded-lg p-3 space-y-3 bg-white">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Transition Effect</Label>
                                <Select value={config.effect || 'slide'} onValueChange={(val) => updateConfig('effect', val)}>
                                    <SelectTrigger className="h-7 text-[10px] bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="slide">Slide (Default)</SelectItem>
                                        <SelectItem value="fade">Fade</SelectItem>
                                        <SelectItem value="coverflow">Coverflow</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="bg-gray-200" />

                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">Autoplay</Label>
                                <Switch checked={config.autoPlay ?? true} onCheckedChange={(c) => updateConfig('autoPlay', c)} />
                            </div>

                            {(config.autoPlay ?? true) && (
                                <div className="space-y-3 p-2 bg-gray-50 rounded border">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Interval (seconds)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={(config.interval || 3000) / 1000}
                                            onChange={(e) => updateConfig('interval', parseFloat(e.target.value) * 1000)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-500">Pause on Hover</Label>
                                        <Switch
                                            className="scale-75 origin-right"
                                            checked={config.pauseOnHover ?? true}
                                            onCheckedChange={(c) => updateConfig('pauseOnHover', c)}
                                        />
                                    </div>
                                </div>
                            )}

                            <Separator className="bg-gray-200" />

                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">Infinite Loop</Label>
                                <Switch checked={config.loop ?? true} onCheckedChange={(c) => updateConfig('loop', c)} />
                            </div>
                        </div>
                    </div>

                </TabsContent>

                {/* --- STYLE TAB --- */}
                <TabsContent value="style" className="space-y-5 animate-in fade-in-50">
                    {/* Background */}
                    <div className="space-y-3 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Background</Label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-gray-500">Color</Label>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400">Transparent</span>
                                    <Switch
                                        checked={(layer.style?.backgroundColor as string) === 'transparent' || !layer.style?.backgroundColor}
                                        onCheckedChange={(c) => updateStyle('backgroundColor', c ? 'transparent' : '#FFFFFF')}
                                        className="scale-75 origin-right"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="w-full h-8 rounded cursor-pointer border border-gray-200 p-0 bg-white disabled:opacity-50"
                                    value={((layer.style?.backgroundColor as string) === 'transparent' || !layer.style?.backgroundColor) ? '#FFFFFF' : (layer.style?.backgroundColor as string)}
                                    onChange={e => updateStyle('backgroundColor', e.target.value)}
                                    disabled={(layer.style?.backgroundColor as string) === 'transparent'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Border & Radius */}
                    <div className="space-y-3 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Border & Radius</Label>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Corner Radius</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs bg-white"
                                    value={parseInt(String(layer.style?.borderRadius || 0))}
                                    onChange={e => updateStyle('borderRadius', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <Separator className="bg-gray-200 my-2" />

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Width</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs bg-white"
                                    value={parseInt(String(layer.style?.borderWidth || 0))}
                                    onChange={e => updateStyle('borderWidth', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Style</Label>
                                <Select value={(layer.style?.borderStyle as string) || 'none'} onValueChange={(val) => updateStyle('borderStyle', val)}>
                                    <SelectTrigger className="h-8 text-[10px] bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solid">Solid</SelectItem>
                                        <SelectItem value="dashed">Dashed</SelectItem>
                                        <SelectItem value="dotted">Dotted</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="w-full h-8 rounded cursor-pointer border border-gray-200 p-0 bg-white"
                                        value={(layer.style?.borderColor as string) || '#000000'}
                                        onChange={e => updateStyle('borderColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shadow */}
                    <div className="space-y-3 border rounded-lg p-3 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">Drop Shadow</Label>
                            <Switch
                                checked={!!layer.style?.boxShadow && layer.style.boxShadow !== 'none'}
                                onCheckedChange={(c) => {
                                    if (c) updateStyle('boxShadow', '0px 0px 20px 0px rgba(0,0,0,0.15)');
                                    else updateStyle('boxShadow', 'none');
                                }}
                            />
                        </div>

                        {(!!layer.style?.boxShadow && (layer.style?.boxShadow as string) !== 'none') && (
                            <div className="space-y-2 p-2 bg-white rounded border text-xs">
                                {(() => {
                                    // Parse current shadow string: "0px 10px 20px 0px rgba(0,0,0,0.15)"
                                    const shadowStr = (layer.style?.boxShadow as string) || '';
                                    const parts = shadowStr.match(/-?\d+px|-?\d+|rgba?\(.*?\)|#[a-fA-F0-9]{3,8}|[a-z]+/g) || [];

                                    // Heuristic: Assume [x, y, blur, spread, color] pattern if 5 parts, or [x, y, blur, color] if 4
                                    // Standard Floater pattern: "0 8px 24px 4px rgba(...)" (5 parts + color)

                                    let blur = 20;
                                    let spread = 0;
                                    let color = '#000000';

                                    // Extract numbers (stripping px)
                                    const nums = parts.filter(p => /^-?\d/.test(p)).map(p => parseInt(p.replace('px', '')));
                                    const colorPart = parts.find(p => p.startsWith('#') || p.startsWith('rgb'));

                                    if (nums.length >= 3) blur = nums[2];
                                    if (nums.length >= 4) spread = nums[3];
                                    if (colorPart) color = colorPart;

                                    const updateShadow = (newBlur: number, newSpread: number, newColor: string) => {
                                        updateStyle('boxShadow', `0px 0px ${newBlur}px ${newSpread}px ${newColor} `);
                                    };

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-gray-500">Blur</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-7 text-xs"
                                                        value={blur}
                                                        onChange={e => updateShadow(parseInt(e.target.value) || 0, spread, color)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-gray-500">Spread</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-7 text-xs"
                                                        value={spread}
                                                        onChange={e => updateShadow(blur, parseInt(e.target.value) || 0, color)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500">Color</Label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-full h-7 rounded cursor-pointer border border-gray-200 p-0"
                                                        value={color.startsWith('#') ? color : '#000000'} // Color inputs only support hex
                                                        onChange={e => updateShadow(blur, spread, e.target.value)}
                                                    />
                                                </div>
                                                {!color.startsWith('#') && (
                                                    <p className="text-[9px] text-gray-400 italic">Current color: {color} (Edit overrides to Hex)</p>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- CONTROLS TAB --- */}
                <TabsContent value="controls" className="space-y-5 animate-in fade-in-50">

                    {/* Arrows */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                <ArrowRight className="w-3.5 h-3.5" /> Navigation Arrows
                            </Label>
                            <Switch checked={config.showArrows ?? true} onCheckedChange={(c) => updateConfig('showArrows', c)} />
                        </div>

                        {(config.showArrows ?? true) && (
                            <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                                {/* Type Selection */}
                                <div className="flex p-1 bg-white rounded-md border border-gray-200">
                                    <button
                                        onClick={() => updateConfig('arrowType', 'icon')}
                                        className={`flex - 1 py - 1 text - [10px] font - medium rounded - sm transition - all ${(config.arrowType || 'icon') === 'icon' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'} `}
                                    >
                                        Iterator Icon
                                    </button>
                                    <button
                                        onClick={() => updateConfig('arrowType', 'image')}
                                        className={`flex - 1 py - 1 text - [10px] font - medium rounded - sm transition - all ${config.arrowType === 'image' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'} `}
                                    >
                                        Custom Image
                                    </button>
                                </div>

                                {/* Common: Size */}
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Size (px)</Label>
                                    <Input
                                        type="number"
                                        className="h-7 text-xs bg-white"
                                        value={config.arrowSize || 32}
                                        min={10}
                                        onChange={(e) => updateConfig('arrowSize', parseInt(e.target.value))}
                                    />
                                </div>

                                {/* Icon Config */}
                                {(config.arrowType || 'icon') === 'icon' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Icon Shape</Label>
                                            <Select value={config.arrowIcon || 'chevron'} onValueChange={(val) => updateConfig('arrowIcon', val)}>
                                                <SelectTrigger className="h-7 text-[10px] bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="chevron">Chevron</SelectItem>
                                                    <SelectItem value="arrow">Arrow</SelectItem>
                                                    <SelectItem value="triangle">Triangle</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Icon Color</Label>
                                            <div className="flex gap-2 h-7">
                                                <input
                                                    type="color"
                                                    className="w-full h-full rounded cursor-pointer border border-gray-200 p-0 bg-white"
                                                    value={config.arrowColor || '#FFFFFF'}
                                                    onChange={(e) => updateConfig('arrowColor', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {/* Background Control */}
                                        <div className="col-span-2 flex items-center gap-2 bg-white p-1.5 rounded border border-gray-100">
                                            <Label className="text-[10px] text-gray-500">Backdrop:</Label>
                                            <input
                                                type="color"
                                                className="w-6 h-6 rounded cursor-pointer border border-gray-200 p-0"
                                                value={config.arrowBgColor === 'transparent' ? '#000000' : (config.arrowBgColor || 'rgba(0,0,0,0.2)')}
                                                onChange={(e) => updateConfig('arrowBgColor', e.target.value)}
                                                disabled={config.arrowBgColor === 'transparent'}
                                            />
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <span className="text-[9px] text-gray-400">Transparent</span>
                                                <Switch
                                                    className="scale-75 origin-right"
                                                    checked={config.arrowBgColor === 'transparent'}
                                                    onCheckedChange={(c) => updateConfig('arrowBgColor', c ? 'transparent' : 'rgba(0,0,0,0.2)')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Image Config */}
                                {config.arrowType === 'image' && (
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Image URL</Label>
                                        <Input
                                            className="h-7 text-xs bg-white"
                                            placeholder="https://..."
                                            value={config.arrowImageUrl || ''}
                                            onChange={(e) => updateConfig('arrowImageUrl', e.target.value)}
                                        />
                                        <p className="text-[9px] text-gray-400 mt-1 italic">
                                            *Image rotates 180° for the left arrow automatically.
                                        </p>
                                    </div>
                                )}

                                <Separator className="bg-gray-200" />

                                {/* Dimensions */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Size (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.arrowSize || 32}
                                            placeholder="32"
                                            onChange={(e) => updateConfig('arrowSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Position Offsets */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">X Offset (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.arrowOffsetX || 0}
                                            placeholder="0 = Edge"
                                            onChange={(e) => updateConfig('arrowOffsetX', parseInt(e.target.value))}
                                        />
                                        <p className="text-[8px] text-gray-400 mt-0.5">Negative = Outside</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Y Offset (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.arrowOffsetY || 0}
                                            placeholder="0 = Center"
                                            onChange={(e) => updateConfig('arrowOffsetY', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Dots */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                <CircleDot className="w-3.5 h-3.5" /> Pagination Dots
                            </Label>
                            <Switch
                                checked={config.showDots ?? true}
                                onCheckedChange={(c) => updateLayer(layer.id, {
                                    content: { ...config, showDots: c, showThumbnails: c ? false : config.showThumbnails }
                                })}
                            />
                        </div>

                        {(config.showDots ?? true) && (
                            <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                                {/* Colors */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Active Color</Label>
                                        <div className="flex gap-2 h-7">
                                            <input
                                                type="color"
                                                className="w-full h-full rounded cursor-pointer border border-gray-200 p-0 bg-white"
                                                value={config.activeDotColor || '#000000'}
                                                onChange={(e) => updateConfig('activeDotColor', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Inactive Color</Label>
                                        <div className="flex gap-2 h-7">
                                            <input
                                                type="color"
                                                className="w-full h-full rounded cursor-pointer border border-gray-200 p-0 bg-white"
                                                value={config.dotColor || '#cccccc'}
                                                onChange={(e) => updateConfig('dotColor', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Dimensions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Size (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.dotSize || 6}
                                            onChange={(e) => updateConfig('dotSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Active Size (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.activeDotSize || 8}
                                            onChange={(e) => updateConfig('activeDotSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Gap (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.dotGap || 6}
                                            onChange={(e) => updateConfig('dotGap', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Radius (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.dotRadius ?? 999}
                                            onChange={(e) => updateConfig('dotRadius', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Position */}
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Y Offset (px)</Label>
                                    <Input
                                        type="number"
                                        className="h-7 text-xs bg-white"
                                        value={config.dotOffsetY ?? -24}
                                        placeholder="-24 (Below)"
                                        onChange={(e) => updateConfig('dotOffsetY', parseInt(e.target.value))}
                                    />
                                    <p className="text-[8px] text-gray-400 mt-0.5">Negative = Outside Bottom</p>
                                </div>
                            </div>
                        )}

                    </div>

                    <Separator />

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> Progress Bar
                            </Label>
                            <Switch checked={config.showProgressBar ?? false} onCheckedChange={(c) => updateConfig('showProgressBar', c)} />
                        </div>

                        {(config.showProgressBar) && (
                            <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Color</Label>
                                        <div className="flex gap-2 h-7">
                                            <input
                                                type="color"
                                                className="w-full h-full rounded cursor-pointer border border-gray-200 p-0 bg-white"
                                                value={config.progressColor || '#6366F1'}
                                                onChange={(e) => updateConfig('progressColor', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Height (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.progressHeight || 4}
                                            onChange={(e) => updateConfig('progressHeight', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Width (%)</Label>
                                        <div className="flex items-center gap-2">
                                            <Slider
                                                value={[config.progressWidth ?? 100]}
                                                max={100}
                                                step={1}
                                                onValueChange={([v]) => updateConfig('progressWidth', v)}
                                                className="flex-1"
                                            />
                                            <span className="text-[10px] w-6">{config.progressWidth ?? 100}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Offset (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.progressOffset ?? 0}
                                            placeholder="0"
                                            onChange={(e) => updateConfig('progressOffset', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Position</Label>
                                        <Select value={config.progressPosition || 'bottom'} onValueChange={(val) => updateConfig('progressPosition', val)}>
                                            <SelectTrigger className="h-7 text-[10px] bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top">Top</SelectItem>
                                                <SelectItem value="bottom">Bottom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                <Image className="w-3.5 h-3.5" /> Thumbnails
                            </Label>
                            <Switch
                                checked={config.showThumbnails ?? false}
                                onCheckedChange={(c) => updateLayer(layer.id, {
                                    content: { ...config, showThumbnails: c, showDots: c ? false : config.showDots }
                                })}
                            />
                        </div>

                        {(config.showThumbnails) && (
                            <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Height (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.thumbnailHeight ?? 50}
                                            onChange={(e) => updateConfig('thumbnailHeight', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Gap (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.thumbnailGap ?? 4}
                                            onChange={(e) => updateConfig('thumbnailGap', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Y Offset (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-7 text-xs bg-white"
                                            value={config.thumbnailOffset ?? 0}
                                            placeholder="Default: -24"
                                            onChange={(e) => updateConfig('thumbnailOffset', parseInt(e.target.value))}
                                        />
                                        <p className="text-[8px] text-gray-400 mt-0.5">Adjust vertical distance</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
};
