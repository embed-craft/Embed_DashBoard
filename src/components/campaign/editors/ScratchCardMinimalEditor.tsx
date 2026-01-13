import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Layout,
    Palette,
    Gift,
    Settings2,
    Check,
    AlignCenterHorizontal,
    AlignVerticalSpaceAround,
    Maximize2,
    Move,
    Eraser,
    MousePointer2,
    Hand,
    Plus,
    Type,
    Image as ImageIcon,
    MousePointerClick,
    Sparkles,
    Loader2,
    X
} from 'lucide-react';
import { SizeControls } from '../shared/SizeControls';

// Colors for palette picker
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const ScratchCardMinimalEditor = () => {
    const {
        currentCampaign,
        updateScratchCardConfig,
        addLayer,
        activeInterfaceId
    } = useEditorStore();

    // Resolve Config
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.scratchCardConfig : currentCampaign?.scratchCardConfig;

    // Local State for Color Pickers (to allow smooth dragging)
    const [localColor, setLocalColor] = useState<string | null>(null);

    // Initial Defaults
    useEffect(() => {
        if (!config) {
            updateScratchCardConfig({
                width: 320, height: 400, borderRadius: 16,
                coverType: 'color', coverColor: '#CCCCCC',
                scratchSize: 40, revealThreshold: 50, autoReveal: true,
                position: 'center',
                overlay: { enabled: true, opacity: 0.5, color: '#000000', dismissOnClick: true },
                brushStyle: 'round',
                overlayHint: { enabled: true, text: 'Scratch Here!' },
                progressBar: { enabled: false, color: '#6366F1' }
            });
        }
    }, [config, updateScratchCardConfig]);

    if (!config) return null;

    const updateConfig = (key: string, value: any) => updateScratchCardConfig({ [key]: value });
    const updateNested = (parent: string, key: string, value: any) => {
        // @ts-ignore
        const parentObj = config[parent] || {};
        updateScratchCardConfig({ [parent]: { ...parentObj, [key]: value } });
    };

    const handleTabChange = (value: string) => {
        // Automatically toggle the preview so user sees what they are editing
        // Prize Tab -> Show Prize (Revealed)
        // Foil/General/Behavior -> Show Foil (Unrevealed)
        if (value === 'prize') {
            updateConfig('previewRevealed', true);
        } else {
            updateConfig('previewRevealed', false);
        }
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Scratch Card Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="foil"><Eraser className="w-3.5 h-3.5 mr-1.5" /> Foil</TabsTrigger>
                    <TabsTrigger value="prize"><Gift className="w-3.5 h-3.5 mr-1.5" /> Prize</TabsTrigger>
                    <TabsTrigger value="behavior"><Settings2 className="w-3.5 h-3.5 mr-1.5" /> Logic</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Size & Position */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Dimensions & Position</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Width</Label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                                        <Input
                                            type={typeof config.width === 'string' && config.width.includes('%') ? 'number' : 'number'}
                                            className="pl-7 h-8 text-xs w-full"
                                            value={String(config.width).replace(/[^\d.]/g, '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const isPercent = String(config.width).includes('%');
                                                updateConfig('width', isPercent ? `${val}%` : parseInt(val || '0'));
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const isPercent = String(config.width).includes('%');
                                            const val = parseInt(String(config.width).replace(/[^\d.]/g, '') || '0');
                                            updateConfig('width', isPercent ? val : `${Math.min(val, 100)}%`);
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(config.width).includes('%') ? '%' : 'px'}
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
                                            value={String(config.height).replace(/[^\d.]/g, '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const isPercent = String(config.height).includes('%');
                                                updateConfig('height', isPercent ? `${val}%` : parseInt(val || '0'));
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const isPercent = String(config.height).includes('%');
                                            const val = parseInt(String(config.height).replace(/[^\d.]/g, '') || '0');
                                            updateConfig('height', isPercent ? val : `${Math.min(val, 100)}%`);
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(config.height).includes('%') ? '%' : 'px'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Position Mode</Label>
                            <Select value={config.position || 'center'} onValueChange={(val) => updateConfig('position', val)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center">Center Modal</SelectItem>
                                    <SelectItem value="bottom">Bottom Sheet</SelectItem>
                                    <SelectItem value="custom">Absolute (Custom X/Y)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {config.position === 'custom' && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1">X Offset</Label>
                                    <Input type="number" className="h-8 text-xs" value={config.x || 0} onChange={e => updateConfig('x', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1">Y Offset</Label>
                                    <Input type="number" className="h-8 text-xs" value={config.y || 0} onChange={e => updateConfig('y', parseInt(e.target.value))} />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Borders & Shadows */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Styling</Label>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Radius</Label>
                                <Input type="number" className="h-8 text-xs" value={config.borderRadius ?? 16} onChange={e => updateConfig('borderRadius', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border W</Label>
                                <div className="flex gap-1 items-center">
                                    <Input type="number" className="h-8 text-xs px-2 w-12 shrink-0" value={config.borderWidth ?? 0} onChange={e => updateConfig('borderWidth', parseInt(e.target.value))} />
                                    {/* Border Style Selector */}
                                    <Select value={config.borderStyle || 'solid'} onValueChange={(val) => updateConfig('borderStyle', val)}>
                                        <SelectTrigger className="h-8 flex-1 text-[10px] px-2 bg-gray-50 rounded-md">
                                            <span className="truncate">{config.borderStyle || 'solid'}</span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="solid">Solid</SelectItem>
                                            <SelectItem value="dashed">Dashed</SelectItem>
                                            <SelectItem value="dotted">Dotted</SelectItem>
                                            <SelectItem value="double">Double</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                        value={config.borderColor || '#000000'}
                                        onChange={e => updateConfig('borderColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shadows */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs text-gray-600">Drop Shadow</Label>
                                <Switch checked={config.boxShadow?.enabled} onCheckedChange={(c) => updateNested('boxShadow', 'enabled', c)} />
                            </div>
                            {config.boxShadow?.enabled && (
                                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded border text-xs">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Blur</Label>
                                        <Input type="number" className="h-7 text-xs" value={config.boxShadow?.blur ?? 10} onChange={e => updateNested('boxShadow', 'blur', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Color</Label>
                                        <input type="color" className="w-full h-7 rounded cursor-pointer" value={config.boxShadow?.color ?? '#00000040'} onChange={e => updateNested('boxShadow', 'color', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Overlay / Backdrop */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">Backdrop Overlay</Label>
                            <Switch checked={config.overlay?.enabled ?? true} onCheckedChange={(c) => updateNested('overlay', 'enabled', c)} />
                        </div>

                        {(config.overlay?.enabled ?? true) && (
                            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Opacity</Label>
                                    <div className="px-1">
                                        <Slider
                                            value={[((config.overlay?.opacity ?? 0.5) * 100)]}
                                            max={100} step={1}
                                            onValueChange={([v]) => updateNested('overlay', 'opacity', v / 100)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                    <input
                                        type="color"
                                        className="h-8 w-8 rounded cursor-pointer border border-gray-200"
                                        value={config.overlay?.color || '#000000'}
                                        onChange={e => updateNested('overlay', 'color', e.target.value)}
                                    />
                                    <span className="text-xs text-gray-500">{config.overlay?.color || '#000000'}</span>
                                </div>

                                <div className="col-span-2 flex items-center justify-between pt-1">
                                    <Label className="text-[10px] text-gray-500">Dismiss on click outside</Label>
                                    <Switch
                                        checked={config.overlay?.dismissOnClick ?? true}
                                        onCheckedChange={c => updateNested('overlay', 'dismissOnClick', c)}
                                        className="scale-75 origin-right"
                                    />
                                </div>

                                <Separator className="col-span-2" />

                                {/* Close Button */}
                                <div className="col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-500 flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Close Button</Label>
                                        <Switch checked={config.closeButton?.enabled ?? true} onCheckedChange={(c) => updateNested('closeButton', 'enabled', c)} className="scale-75 origin-right" />
                                    </div>

                                    {(config.closeButton?.enabled ?? true) && (
                                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 p-2 bg-gray-50 rounded border">
                                            <div>
                                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Position</Label>
                                                <Select value={config.closeButton?.position || 'top-right'} onValueChange={(v) => updateNested('closeButton', 'position', v)}>
                                                    <SelectTrigger className="h-7 text-xs bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="top-right">Top Right (Inside)</SelectItem>
                                                        <SelectItem value="top-left">Top Left (Inside)</SelectItem>
                                                        <SelectItem value="outside-right">Floating Outside</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Label className="text-[9px] text-gray-400">Icon</Label>
                                                        <input
                                                            type="color"
                                                            className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                            value={config.closeButton?.color || '#000000'}
                                                            onChange={e => updateNested('closeButton', 'color', e.target.value)}
                                                            title="Icon Color"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 relative">
                                                        <Label className="text-[9px] text-gray-400">Bg</Label>
                                                        <input
                                                            type="color"
                                                            className={`w-8 h-6 rounded cursor-pointer border border-gray-200 ${config.closeButton?.backgroundColor === '#00000000' ? 'opacity-30 pointer-events-none' : ''}`}
                                                            value={config.closeButton?.backgroundColor === '#00000000' ? '#FFFFFF' : (config.closeButton?.backgroundColor || '#FFFFFF')}
                                                            onChange={e => updateNested('closeButton', 'backgroundColor', e.target.value)}
                                                            title="Background Color"
                                                            disabled={config.closeButton?.backgroundColor === '#00000000'}
                                                        />
                                                        {config.closeButton?.backgroundColor === '#00000000' && (
                                                            <div className="absolute top-[18px] left-[2px] right-[2px] h-[2px] bg-red-400 rotate-45" />
                                                        )}
                                                    </div>

                                                    {/* Transparent Toggle */}
                                                    <div className="flex flex-col items-center gap-1 ml-1">
                                                        <Label className="text-[9px] text-gray-400">Transp.</Label>
                                                        <Switch
                                                            className="scale-75"
                                                            checked={config.closeButton?.backgroundColor === '#00000000'}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    updateNested('closeButton', 'backgroundColor', '#00000000');
                                                                } else {
                                                                    updateNested('closeButton', 'backgroundColor', '#FFFFFF');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- FOIL TAB --- */}
                <TabsContent value="foil" className="space-y-5 animate-in fade-in-50">

                    {/* Cover Appearance */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">scratch Surface</Label>

                        <div className="flex p-1 bg-gray-100 rounded-md">
                            <button
                                onClick={() => updateConfig('coverType', 'color')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${config.coverType !== 'image' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Solid Color
                            </button>
                            <button
                                onClick={() => updateConfig('coverType', 'image')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${config.coverType === 'image' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Image Pattern
                            </button>
                        </div>

                        {config.coverType === 'image' ? (
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={config.coverImage || ''}
                                        onChange={e => updateConfig('coverImage', e.target.value)}
                                        placeholder="https://..."
                                        className="h-8 text-xs"
                                    />
                                    <div className="h-8 w-8 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {config.coverImage ? <img src={config.coverImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-300" />}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] text-gray-500">Surface Color</Label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-400">Transparent</span>
                                        <Switch
                                            checked={config.coverColor === '#00000000'}
                                            onCheckedChange={(c) => updateConfig('coverColor', c ? '#00000000' : '#CCCCCC')}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                                <div className={`flex flex-wrap gap-2 ${config.coverColor === '#00000000' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {PALETTE.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateConfig('coverColor', c)}
                                            className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${config.coverColor === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-50 hover:opacity-100"
                                        value={config.coverColor === '#00000000' ? '#CCCCCC' : (config.coverColor || '#CCCCCC')}
                                        onChange={e => updateConfig('coverColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Interaction (Hint + Brush) */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Interaction & Physics</Label>

                        {/* Overlay Hint */}
                        <div className="p-3 border rounded-lg bg-indigo-50/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-indigo-900 flex items-center gap-1.5"><Hand className="w-3.5 h-3.5" /> Instructional Hint</Label>
                                <Switch checked={config.overlayHint?.enabled ?? true} onCheckedChange={(c) => updateNested('overlayHint', 'enabled', c)} />
                            </div>
                            {(config.overlayHint?.enabled ?? true) && (
                                <div className="grid gap-2">
                                    <Input
                                        value={config.overlayHint?.text || 'Scratch Here!'}
                                        onChange={e => updateNested('overlayHint', 'text', e.target.value)}
                                        className="h-7 text-xs bg-white border-indigo-100"
                                        placeholder="Hint Text"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Brush Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-2 block">Brush Size ({config.scratchSize || 40}px)</Label>
                                <Slider
                                    min={10} max={120} step={5}
                                    value={[config.scratchSize || 40]}
                                    onValueChange={([v]) => updateConfig('scratchSize', v)}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-2 block">Reveal Threshold ({config.revealThreshold || 50}%)</Label>
                                <Slider
                                    min={10} max={90} step={5}
                                    value={[config.revealThreshold || 50]}
                                    onValueChange={([v]) => updateConfig('revealThreshold', v)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Brush Style</Label>
                            <Select value={config.brushStyle || 'round'} onValueChange={v => updateConfig('brushStyle', v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="round">Round (Clean Eraser)</SelectItem>
                                    <SelectItem value="rough">Rough (Coin Scratch)</SelectItem>
                                    <SelectItem value="spray">Spray (Soft Edge)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                {/* --- PRIZE TAB --- */}
                <TabsContent value="prize" className="space-y-5 animate-in fade-in-50">

                    {/* Background */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Prize Background</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <Label className="text-[10px] text-gray-500 block">Color</Label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-400">Transparent</span>
                                        <Switch
                                            checked={config.backgroundColor === '#00000000'}
                                            onCheckedChange={(c) => updateConfig('backgroundColor', c ? '#00000000' : '#FFFFFF')}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        disabled={config.backgroundColor === '#00000000'}
                                        className={`h-8 w-full rounded cursor-pointer border border-gray-200 ${config.backgroundColor === '#00000000' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        value={config.backgroundColor === '#00000000' ? '#FFFFFF' : (config.backgroundColor || '#FFFFFF')}
                                        onChange={e => updateConfig('backgroundColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">Image Fit</Label>
                                <Select value={config.backgroundSize || 'cover'} onValueChange={v => updateConfig('backgroundSize', v)}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cover">Cover</SelectItem>
                                        <SelectItem value="contain">Contain</SelectItem>
                                        <SelectItem value="fill">Fill</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1 block">Background Image URL</Label>
                            <Input
                                className="h-8 text-xs"
                                placeholder="https://..."
                                value={config.backgroundImageUrl || ''}
                                onChange={e => updateConfig('backgroundImageUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Layers */}
                    <div className="space-y-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                        <Label className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5" /> Add Prize Content
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => addLayer('text', currentCampaign?.layers?.find(l => l.type === 'container')?.id)}
                                className="flex flex-col items-center justify-center p-3 bg-white border rounded hover:bg-purple-50 hover:border-purple-200 transition-colors gap-1.5"
                            >
                                <Type className="w-4 h-4 text-gray-600" /><span className="text-[10px] font-medium text-gray-600">Text</span>
                            </button>
                            <button onClick={() => addLayer('media', currentCampaign?.layers?.find(l => l.type === 'container')?.id)}
                                className="flex flex-col items-center justify-center p-3 bg-white border rounded hover:bg-purple-50 hover:border-purple-200 transition-colors gap-1.5"
                            >
                                <ImageIcon className="w-4 h-4 text-gray-600" /><span className="text-[10px] font-medium text-gray-600">Image</span>
                            </button>
                            <button onClick={() => addLayer('button', currentCampaign?.layers?.find(l => l.type === 'container')?.id)}
                                className="flex flex-col items-center justify-center p-3 bg-white border rounded hover:bg-purple-50 hover:border-purple-200 transition-colors gap-1.5"
                            >
                                <MousePointerClick className="w-4 h-4 text-gray-600" /><span className="text-[10px] font-medium text-gray-600">Button</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">Add layers to the canvas to build your prize coupon.</p>
                    </div>

                </TabsContent>

                {/* --- BEHAVIOR TAB --- */}
                <TabsContent value="behavior" className="space-y-5 animate-in fade-in-50">

                    {/* Progress Bar */}
                    <div className="space-y-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5" /> Progress Bar</Label>
                            <Switch checked={config.progressBar?.enabled ?? false} onCheckedChange={c => updateNested('progressBar', 'enabled', c)} />
                        </div>

                        {(config.progressBar?.enabled) && (
                            <div className="pt-2 animate-in slide-in-from-top-1">
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Progress Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-8 w-12 rounded cursor-pointer border border-gray-200"
                                        value={config.progressBar?.color || '#6366F1'}
                                        onChange={e => updateNested('progressBar', 'color', e.target.value)}
                                    />
                                    <div className="flex-1 h-8 bg-gray-100 rounded flex items-center px-2">
                                        <div className="h-1.5 rounded-full w-2/3" style={{ backgroundColor: config.progressBar?.color || '#6366F1' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Completion</Label>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded text-xs">
                            <span className="font-medium text-gray-700">Auto Reveal</span>
                            <Switch checked={config.autoReveal ?? true} onCheckedChange={c => updateConfig('autoReveal', c)} />
                        </div>
                        <p className="text-[10px] text-gray-400 px-1">
                            Automatically fade out the foil when the completion threshold ({config.revealThreshold}%) is reached.
                        </p>


                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
};
