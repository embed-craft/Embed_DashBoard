import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Layout,
    Maximize2,
    Image as ImageIcon,
    Video,
    MousePointer2,
    X,
    VolumeX,
    Sparkles,
} from 'lucide-react';

// Colors for palette picker (Same as Scratch Card)
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const FloaterMinimalEditor = () => {
    const {
        currentCampaign,
        updateFloaterConfig,
        activeInterfaceId
    } = useEditorStore();

    // Resolve Config
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.floaterConfig : currentCampaign?.floaterConfig;

    // Initial Defaults
    useEffect(() => {
        if (!config) {
            updateFloaterConfig({
                position: 'bottom-right',
                offsetX: 20, offsetY: 20,
                width: 280, height: 180, borderRadius: 12,
                backgroundColor: '#000000',
                borderWidth: 0, borderStyle: 'solid', borderColor: '#000000',
                shadow: { enabled: true, blur: 24, spread: 4 },
                media: { url: '', type: 'none', autoPlay: true, muted: true, loop: true, fit: 'cover' },
                controls: {
                    closeButton: { show: true, position: 'top-right', size: 14 },
                    expandButton: { show: false, position: 'top-left', size: 14 },
                    muteButton: { show: false, position: 'top-left', size: 14 },
                    progressBar: { show: false },
                },
                behavior: { draggable: true, snapToCorner: true, doubleTapToDismiss: false },
                backdrop: { show: false, color: '#000000', opacity: 0.3 }
            });
        }
    }, [config, updateFloaterConfig]);

    if (!config) return null;

    const updateConfig = (key: string, value: any) => updateFloaterConfig({ [key]: value });
    const updateNested = (parent: string, key: string, value: any) => {
        // @ts-ignore
        const parentObj = config[parent] || {};
        updateFloaterConfig({ [parent]: { ...parentObj, [key]: value } });
    };

    // Helper for deeply nested controls (controls.closeButton.show)
    const updateControl = (controlType: string, key: string, value: any) => {
        const controls = config.controls || {};
        // @ts-ignore
        const specificControl = controls[controlType] || {};
        updateFloaterConfig({
            controls: {
                ...controls,
                [controlType]: { ...specificControl, [key]: value }
            }
        });
    };

    const isVideo = (config.media?.url && (
        config.media.url.includes('youtube.com') ||
        config.media.url.includes('youtu.be') ||
        config.media.url.endsWith('.mp4') ||
        config.media.url.endsWith('.webm')
    )) || config.media?.type === 'video';

    // Helper logic for "Type" toggle (Color vs Media)
    // We treat "No URL" as Color mode if backgroundColor is set, or just use a synthetic toggle state if needed.
    // However, existing config puts logic in 'media.url' and 'backgroundColor'.
    // We will simulate a 'mode' switch.
    // FIX: Don't rely solely on URL emptiness, as user might be typing/pasting. Use explicit 'type'.
    const mode = (config.media?.type && config.media.type !== 'none') ? 'media' : 'color';

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Floater Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="media"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Background</TabsTrigger>
                    <TabsTrigger value="controls"><MousePointer2 className="w-3.5 h-3.5 mr-1.5" /> Controls</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Size & Position */}
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

                        {/* Aspect Ratio Presets */}
                        <div className="flex items-center gap-2 mt-2 bg-white/50 p-1.5 rounded border border-gray-100">
                            <Label className="text-[10px] text-gray-500 shrink-0">Ratio:</Label>
                            <div className="flex gap-1.5">
                                {['16:9', '4:3', '1:1', '9:16'].map(ratio => (
                                    <button
                                        key={ratio}
                                        onClick={() => {
                                            const widthVal = parseInt(String(config.width).replace(/[^\d.]/g, '') || '280');
                                            const isPercent = String(config.width).includes('%');

                                            // If width is percent, we can't easily calculate height pixels implies aspect ratio unless we use aspect-ratio CSS which isn't fully supported in our schema yet.
                                            // Fallback: Assume PX if calculating.
                                            if (isPercent) return; // Disable for percentage for now

                                            let newHeight = widthVal;
                                            const [w, h] = ratio.split(':').map(Number);
                                            newHeight = Math.round(widthVal * (h / w));

                                            updateConfig('height', newHeight);
                                        }}
                                        className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-200 transition-colors"
                                        title={`Apply ${ratio} ratio based on Width`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Position Corner */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Anchor Corner</Label>
                            <Select value={config.position || 'bottom-right'} onValueChange={(val) => updateConfig('position', val)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="top-left">Top Left</SelectItem>
                                    <SelectItem value="top-right">Top Right</SelectItem>
                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Offsets */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1">X Offset</Label>
                                <Input type="number" className="h-8 text-xs" value={config.offsetX || 0} onChange={e => updateConfig('offsetX', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1">Y Offset</Label>
                                <Input type="number" className="h-8 text-xs" value={config.offsetY || 0} onChange={e => updateConfig('offsetY', parseInt(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Styling */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Appearance</Label>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Corner Radius</Label>
                                <Input type="number" className="h-8 text-xs" value={config.borderRadius ?? 12} onChange={e => updateConfig('borderRadius', parseInt(e.target.value))} />
                            </div>
                            {/* BG Color REMOVED from here */}
                        </div>

                        {/* Border Properties */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border W</Label>
                                <Input type="number" className="h-8 text-xs" value={config.borderWidth ?? 0} onChange={e => updateConfig('borderWidth', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Style</Label>
                                <Select value={config.borderStyle || 'solid'} onValueChange={(val) => updateConfig('borderStyle', val)}>
                                    <SelectTrigger className="h-8 text-[10px]">
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
                                        className="w-full h-8 rounded cursor-pointer border-0 p-0"
                                        value={config.borderColor || '#000000'}
                                        onChange={e => updateConfig('borderColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shadow */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs text-gray-600">Drop Shadow</Label>
                                <Switch checked={config.shadow?.enabled} onCheckedChange={(c) => updateNested('shadow', 'enabled', c)} />
                            </div>
                            {config.shadow?.enabled && (
                                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded border text-xs">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Blur</Label>
                                        <Input type="number" className="h-7 text-xs" value={config.shadow?.blur ?? 10} onChange={e => updateNested('shadow', 'blur', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Spread</Label>
                                        <Input type="number" className="h-7 text-xs" value={config.shadow?.spread ?? 0} onChange={e => updateNested('shadow', 'spread', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- MEDIA TAB (Now "Background") --- */}
                <TabsContent value="media" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Background Content</Label>

                        {/* Toggle Type */}
                        <div className="flex p-1 bg-gray-100 rounded-md">
                            <button
                                onClick={() => updateFloaterConfig({ media: { ...config.media, url: '', type: 'none' }, backgroundColor: config.backgroundColor || '#000000' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'color' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Solid Color
                            </button>
                            <button
                                onClick={() => updateFloaterConfig({ media: { ...config.media, url: 'https://placehold.co/600x400', type: 'image' } })} // Placeholder to switch
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'media' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Image / Video
                            </button>
                        </div>

                        {/* Content Based on Toggle */}
                        {mode === 'color' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] text-gray-500">Surface Color</Label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-400">Transparent</span>
                                        <Switch
                                            checked={config.backgroundColor === '#00000000'}
                                            onCheckedChange={(c) => updateConfig('backgroundColor', c ? '#00000000' : '#000000')}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                                <div className={`flex flex-wrap gap-2 ${config.backgroundColor === '#00000000' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {PALETTE.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateConfig('backgroundColor', c)}
                                            className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${config.backgroundColor === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer opacity-50 hover:opacity-100"
                                        value={config.backgroundColor === '#00000000' ? '#000000' : (config.backgroundColor || '#000000')}
                                        onChange={e => updateConfig('backgroundColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'media' && (
                            <>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Media URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        className="text-xs mb-1"
                                        value={config.media?.url || ''}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            let type = 'image';
                                            if (url.includes('youtube') || url.includes('youtu.be')) type = 'youtube';
                                            else if (url.endsWith('.mp4')) type = 'video';
                                            updateFloaterConfig({ media: { ...config.media, url, type } });
                                        }}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Supports Images, MP4 Video, and YouTube</p>
                                </div>

                                {!isVideo && (
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Image Fit</Label>
                                        <Select value={config.media?.fit || 'cover'} onValueChange={(val) => updateNested('media', 'fit', val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cover">Cover (Crop)</SelectItem>
                                                <SelectItem value="contain">Contain (Full)</SelectItem>
                                                <SelectItem value="fill">Fill (Stretch)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {isVideo && (
                                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
                                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                            <Video className="w-3 h-3" /> Video Options
                                        </Label>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-gray-600">Autoplay</Label>
                                            <Switch checked={config.media?.autoPlay} onCheckedChange={c => updateNested('media', 'autoPlay', c)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-gray-600">Muted</Label>
                                            <Switch checked={config.media?.muted} onCheckedChange={c => updateNested('media', 'muted', c)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-gray-600">Loop</Label>
                                            <Switch checked={config.media?.loop} onCheckedChange={c => updateNested('media', 'loop', c)} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </TabsContent>

                {/* --- CONTROLS TAB --- */}
                <TabsContent value="controls" className="space-y-5 animate-in fade-in-50">

                    {/* UI Controls Section */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">UI Controls</Label>

                        {/* Close Button */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <X className="w-3.5 h-3.5" /> Close Button
                                </Label>
                                <Switch checked={config.controls?.closeButton?.show ?? true} onCheckedChange={c => updateControl('closeButton', 'show', c)} />
                            </div>
                            {config.controls?.closeButton?.show && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Select value={config.controls?.closeButton?.position || 'top-right'} onValueChange={(val) => updateControl('closeButton', 'position', val)}>
                                            <SelectTrigger className="h-7 text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-right">Top Right</SelectItem>
                                                <SelectItem value="top-left">Top Left</SelectItem>
                                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" placeholder="Size" className="h-7 text-xs" value={config.controls?.closeButton?.size || 14} onChange={e => updateControl('closeButton', 'size', parseInt(e.target.value))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">X</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.closeButton?.offsetX || 0} onChange={e => updateControl('closeButton', 'offsetX', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">Y</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.closeButton?.offsetY || 0} onChange={e => updateControl('closeButton', 'offsetY', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Icon</Label>
                                                <input
                                                    type="color"
                                                    className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                    value={config.controls?.closeButton?.color || '#FFFFFF'}
                                                    onChange={e => updateControl('closeButton', 'color', e.target.value)}
                                                    title="Icon Color"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center gap-1 relative">
                                                <Label className="text-[9px] text-gray-400">Bg</Label>
                                                <input
                                                    type="color"
                                                    className={`w-8 h-6 rounded cursor-pointer border border-gray-200 ${config.controls?.closeButton?.backgroundColor === '#00000000' ? 'opacity-30 pointer-events-none' : ''}`}
                                                    value={config.controls?.closeButton?.backgroundColor === '#00000000' ? '#000000' : (config.controls?.closeButton?.backgroundColor || '#000000')}
                                                    onChange={e => updateControl('closeButton', 'backgroundColor', e.target.value)}
                                                    title="Background Color"
                                                />
                                                {config.controls?.closeButton?.backgroundColor === '#00000000' && (
                                                    <div className="absolute top-[18px] left-[2px] right-[2px] h-[2px] bg-red-400 rotate-45" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center gap-1 ml-1">
                                                <Label className="text-[9px] text-gray-400">Transp.</Label>
                                                <Switch
                                                    className="scale-75"
                                                    checked={config.controls?.closeButton?.backgroundColor === '#00000000'}
                                                    onCheckedChange={(checked) => updateControl('closeButton', 'backgroundColor', checked ? '#00000000' : '#000000')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Expand Button */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <Maximize2 className="w-3.5 h-3.5" /> Expand Button
                                </Label>
                                <Switch checked={config.controls?.expandButton?.show ?? false} onCheckedChange={c => updateControl('expandButton', 'show', c)} />
                            </div>
                            {config.controls?.expandButton?.show && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Select value={config.controls?.expandButton?.position || 'top-left'} onValueChange={(val) => updateControl('expandButton', 'position', val)}>
                                            <SelectTrigger className="h-7 text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-right">Top Right</SelectItem>
                                                <SelectItem value="top-left">Top Left</SelectItem>
                                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" placeholder="Size" className="h-7 text-xs" value={config.controls?.expandButton?.size || 14} onChange={e => updateControl('expandButton', 'size', parseInt(e.target.value))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">X</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.expandButton?.offsetX || 0} onChange={e => updateControl('expandButton', 'offsetX', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">Y</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.expandButton?.offsetY || 0} onChange={e => updateControl('expandButton', 'offsetY', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Icon</Label>
                                                <input
                                                    type="color"
                                                    className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                    value={config.controls?.expandButton?.color || '#FFFFFF'}
                                                    onChange={e => updateControl('expandButton', 'color', e.target.value)}
                                                    title="Icon Color"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center gap-1 relative">
                                                <Label className="text-[9px] text-gray-400">Bg</Label>
                                                <input
                                                    type="color"
                                                    className={`w-8 h-6 rounded cursor-pointer border border-gray-200 ${config.controls?.expandButton?.backgroundColor === '#00000000' ? 'opacity-30 pointer-events-none' : ''}`}
                                                    value={config.controls?.expandButton?.backgroundColor === '#00000000' ? '#000000' : (config.controls?.expandButton?.backgroundColor || '#000000')}
                                                    onChange={e => updateControl('expandButton', 'backgroundColor', e.target.value)}
                                                    title="Background Color"
                                                />
                                                {config.controls?.expandButton?.backgroundColor === '#00000000' && (
                                                    <div className="absolute top-[18px] left-[2px] right-[2px] h-[2px] bg-red-400 rotate-45" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center gap-1 ml-1">
                                                <Label className="text-[9px] text-gray-400">Transp.</Label>
                                                <Switch
                                                    className="scale-75"
                                                    checked={config.controls?.expandButton?.backgroundColor === '#00000000'}
                                                    onCheckedChange={(checked) => updateControl('expandButton', 'backgroundColor', checked ? '#00000000' : '#000000')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mute Button (Video Only) */}
                        {isVideo && (
                            <div className="border rounded-lg p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium flex items-center gap-2">
                                        <VolumeX className="w-3.5 h-3.5" /> Mute Toggle
                                    </Label>
                                    <Switch checked={config.controls?.muteButton?.show ?? true} onCheckedChange={c => updateControl('muteButton', 'show', c)} />
                                </div>
                                {config.controls?.muteButton?.show && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <Select value={config.controls?.muteButton?.position || 'top-left'} onValueChange={(val) => updateControl('muteButton', 'position', val)}>
                                                <SelectTrigger className="h-7 text-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="top-right">Top Right</SelectItem>
                                                    <SelectItem value="top-left">Top Left</SelectItem>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input type="number" placeholder="Size" className="h-7 text-xs" value={config.controls?.muteButton?.size || 14} onChange={e => updateControl('muteButton', 'size', parseInt(e.target.value))} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-gray-400 w-4">X</Label>
                                                <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.muteButton?.offsetX || 0} onChange={e => updateControl('muteButton', 'offsetX', parseInt(e.target.value))} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-gray-400 w-4">Y</Label>
                                                <Input type="number" placeholder="0" className="h-7 text-xs" value={config.controls?.muteButton?.offsetY || 0} onChange={e => updateControl('muteButton', 'offsetY', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                            <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                            <div className="flex gap-2">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Label className="text-[9px] text-gray-400">Icon</Label>
                                                    <input
                                                        type="color"
                                                        className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                        value={config.controls?.muteButton?.color || '#FFFFFF'}
                                                        onChange={e => updateControl('muteButton', 'color', e.target.value)}
                                                        title="Icon Color"
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center gap-1 relative">
                                                    <Label className="text-[9px] text-gray-400">Bg</Label>
                                                    <input
                                                        type="color"
                                                        className={`w-8 h-6 rounded cursor-pointer border border-gray-200 ${config.controls?.muteButton?.backgroundColor === '#00000000' ? 'opacity-30 pointer-events-none' : ''}`}
                                                        value={config.controls?.muteButton?.backgroundColor === '#00000000' ? '#000000' : (config.controls?.muteButton?.backgroundColor || '#000000')}
                                                        onChange={e => updateControl('muteButton', 'backgroundColor', e.target.value)}
                                                        title="Background Color"
                                                    />
                                                    {config.controls?.muteButton?.backgroundColor === '#00000000' && (
                                                        <div className="absolute top-[18px] left-[2px] right-[2px] h-[2px] bg-red-400 rotate-45" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center gap-1 ml-1">
                                                    <Label className="text-[9px] text-gray-400">Transp.</Label>
                                                    <Switch
                                                        className="scale-75"
                                                        checked={config.controls?.muteButton?.backgroundColor === '#00000000'}
                                                        onCheckedChange={(checked) => updateControl('muteButton', 'backgroundColor', checked ? '#00000000' : '#000000')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Logic / Behavior Section */}
                    <div className="space-y-3 mt-4">
                        <Label className="text-xs font-semibold text-gray-700">Behavior & Logic</Label>

                        <div className="border rounded-lg p-3 space-y-3 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Draggable</Label>
                                <Switch checked={config.behavior?.draggable ?? true} onCheckedChange={c => updateNested('behavior', 'draggable', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Snap to Corner</Label>
                                <Switch checked={config.behavior?.snapToCorner ?? true} onCheckedChange={c => updateNested('behavior', 'snapToCorner', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Double Tap to Close</Label>
                                <Switch checked={config.behavior?.doubleTapToDismiss ?? false} onCheckedChange={c => updateNested('behavior', 'doubleTapToDismiss', c)} />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
