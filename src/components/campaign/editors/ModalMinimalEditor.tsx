import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
    Layout,
    Maximize2,
    Image as ImageIcon,
    MousePointer2,
    Sparkles,
    X,
    Layers,
    Palette
} from 'lucide-react';

// Colors for palette picker
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const ModalMinimalEditor = () => {
    const {
        currentCampaign,
        activeInterfaceId,
        updateModalConfig,
        updateLayer,
        updateLayerStyle,
        addLayer
    } = useEditorStore();

    // Resolve config from active interface OR main campaign
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.modalConfig : currentCampaign?.modalConfig;

    // Auto-migrate: specific defaults OR initialize if missing
    useEffect(() => {
        // If we have an active interface but NO config, initialize it immediately
        if (activeInterface && !config) {
            updateModalConfig({
                mode: 'container',
                width: '90%' as any,
                height: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                elevation: 2,
                overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                animation: { type: 'pop', duration: 300, easing: 'ease-out' },
                // Ensure legacy fields are initialized
                backgroundImageUrl: '',
                backgroundSize: 'cover',
                closeButton: { enabled: true, position: 'top-right', color: '#000000', backgroundColor: '#FFFFFF' },
                showCloseButton: true // Keep legacy for safety until migrated
            });
            return;
        }

        if (!config) return;

        let hasUpdates = false;
        const updates: any = {};

        // Fix transparency
        if (config.backgroundColor === 'transparent') {
            updates.backgroundColor = '#00000000';
            hasUpdates = true;
        }

        // Fix Close Button: undefined -> false
        if (config.showCloseButton === undefined) {
            updates.showCloseButton = false;
            hasUpdates = true;
        }

        // Initialize closeButton object if missing
        if (!config.closeButton) {
            updates.closeButton = {
                enabled: config.showCloseButton ?? true,
                position: 'top-right',
                color: '#000000',
                backgroundColor: '#FFFFFF'
            };
            hasUpdates = true;
        }

        if (hasUpdates) {
            updateModalConfig(updates);
            // Sync background if changed
            if (updates.backgroundColor) {
                const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Modal Container');
                if (rootLayer) {
                    updateLayerStyle(rootLayer.id, { backgroundColor: updates.backgroundColor });
                }
            }
        }
    }, [config, activeInterface, currentCampaign?.layers, updateModalConfig, updateLayerStyle]);

    if (!config) return null;

    // Helper to update config
    const updateConfig = (key: string, value: any) => {
        updateModalConfig({ [key]: value });

        // Sync visual properties to the root layer for immediate feedback
        if (['width', 'height', 'backgroundColor'].includes(key)) {
            const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Modal Container');
            if (rootLayer) {
                if (key === 'backgroundColor') {
                    const styleValue = (value === 'transparent' || value === '#00000000') ? '#00000000' : value;
                    updateLayerStyle(rootLayer.id, { backgroundColor: styleValue });
                } else {
                    // Sync Dimensions
                    updateLayer(rootLayer.id, {
                        size: {
                            ...rootLayer.size,
                            [key]: value
                        } as any
                    });
                }
            }
        }
    };

    const updateNested = (parent: string, key: string, value: any) => {
        // @ts-ignore
        const parentObj = config[parent] || {};
        updateModalConfig({ [parent]: { ...parentObj, [key]: value } });
    };

    // Determine current "Mode" for Background (Color vs Image)
    const mode = config.backgroundImageUrl ? 'media' : 'color';

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Modal Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="background"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Background</TabsTrigger>
                    <TabsTrigger value="settings"><MousePointer2 className="w-3.5 h-3.5 mr-1.5" /> Settings</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Size & Dimensions */}
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
                                            value={String(config.width).replace(/[^\d.]/g, '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const isPercent = String(config.width).includes('%');
                                                updateConfig('width', isPercent ? `${val}%` : val + 'px');
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const val = parseInt(String(config.width).replace(/[^\d.]/g, '') || '0');
                                            const isPercent = String(config.width).includes('%');
                                            updateConfig('width', isPercent ? val + 'px' : val + '%');
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(config.width).includes('%') ? '%' : 'px'}
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
                                            type="text" // Use text to allow "auto"
                                            className="pl-7 h-8 text-xs w-full"
                                            value={config.height === 'auto' ? 'Auto' : String(config.height).replace(/[^\d.]/g, '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.toLowerCase() === 'a' || val === '') {
                                                    updateConfig('height', 'auto');
                                                    return;
                                                }
                                                const isPercent = String(config.height).includes('%');
                                                updateConfig('height', isPercent ? `${val}%` : val + 'px');
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (config.height === 'auto') {
                                                updateConfig('height', '400px'); // Default when switching from auto
                                                return;
                                            }
                                            const val = parseInt(String(config.height).replace(/[^\d.]/g, '') || '0');
                                            const isPercent = String(config.height).includes('%');
                                            updateConfig('height', isPercent ? val + 'px' : val + '%');
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {config.height === 'auto' ? 'A' : (String(config.height).includes('%') ? '%' : 'px')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <Separator />

                    {/* Styling */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Appearance</Label>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Radius</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={typeof config.borderRadius === 'number' ? config.borderRadius : 16}
                                    onChange={e => updateConfig('borderRadius', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border W</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={config.borderWidth ?? 0}
                                    onChange={e => updateConfig('borderWidth', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Elevation</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={config.elevation ?? 2}
                                    onChange={e => updateConfig('elevation', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Border Details */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border Style</Label>
                                <Select value={config.borderStyle || 'solid'} onValueChange={(val) => updateConfig('borderStyle', val)}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
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
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="w-full h-8 rounded cursor-pointer border border-gray-200 p-0"
                                        value={config.borderColor || '#000000'}
                                        onChange={e => updateConfig('borderColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Drop Shadow */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs text-gray-600">Drop Shadow</Label>
                                <Switch checked={config.boxShadow?.enabled} onCheckedChange={(c) => updateNested('boxShadow', 'enabled', c)} />
                            </div>
                            {config.boxShadow?.enabled && (
                                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded border text-xs">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Blur</Label>
                                        <Input type="number" className="h-7 text-xs" value={config.boxShadow?.blur ?? 10} onChange={e => updateNested('boxShadow', 'blur', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Spread</Label>
                                        <Input type="number" className="h-7 text-xs" value={config.boxShadow?.spread ?? 0} onChange={e => updateNested('boxShadow', 'spread', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Color</Label>
                                        <input type="color" className="w-full h-7 rounded cursor-pointer" value={config.boxShadow?.color ?? '#00000040'} onChange={e => updateNested('boxShadow', 'color', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Animation */}
                        <div className="pt-2">
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Entrance Animation</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={config.animation?.type || 'pop'} onValueChange={(val) => updateNested('animation', 'type', val)}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pop">Pop (Scale)</SelectItem>
                                        <SelectItem value="fade">Fade In</SelectItem>
                                        <SelectItem value="slide-up">Slide Up</SelectItem>
                                        <SelectItem value="slide-down">Slide Down</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-8 text-xs pr-8"
                                        value={config.animation?.duration ?? 300}
                                        onChange={e => updateNested('animation', 'duration', parseInt(e.target.value))}
                                    />
                                    <span className="absolute right-2 top-2 text-[10px] text-gray-400">ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- BACKGROUND TAB --- */}
                <TabsContent value="background" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Background Content</Label>

                        {/* Toggle Type */}
                        <div className="flex p-1 bg-gray-100 rounded-md">
                            <button
                                onClick={() => {
                                    updateConfig('backgroundImageUrl', '');
                                    updateConfig('backgroundColor', config.backgroundColor === '#00000000' ? '#FFFFFF' : config.backgroundColor);
                                }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'color' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Solid Color
                            </button>
                            <button
                                onClick={() => {
                                    updateConfig('backgroundImageUrl', 'https://placehold.co/600x400');
                                }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'media' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Image
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
                                            onCheckedChange={(c) => updateConfig('backgroundColor', c ? '#00000000' : '#FFFFFF')}
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
                                        value={config.backgroundColor === '#00000000' ? '#FFFFFF' : (config.backgroundColor || '#FFFFFF')}
                                        onChange={e => updateConfig('backgroundColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'media' && (
                            <>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Image URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        className="text-xs mb-1"
                                        value={config.backgroundImageUrl || ''}
                                        onChange={(e) => updateConfig('backgroundImageUrl', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Image Fit</Label>
                                    <Select value={config.backgroundSize || 'cover'} onValueChange={(val) => updateConfig('backgroundSize', val)}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover (Fill)</SelectItem>
                                            <SelectItem value="contain">Contain (Fit)</SelectItem>
                                            <SelectItem value="fill">Stretch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>

                {/* --- SETTINGS TAB --- */}
                <TabsContent value="settings" className="space-y-5 animate-in fade-in-50">

                    {/* Overlay Section */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-500" />
                                <Label className="text-xs font-semibold text-gray-700">Backdrop Overlay</Label>
                            </div>
                            <Switch checked={config.overlay?.enabled} onCheckedChange={(c) => updateNested('overlay', 'enabled', c)} />
                        </div>

                        {config.overlay?.enabled && (
                            <div className="space-y-3 pt-2 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1 block">Opacity</Label>
                                        <div className="px-1 pt-1">
                                            <Slider
                                                value={[((config.overlay?.opacity ?? 0.5) * 100)]}
                                                max={100} step={1}
                                                onValueChange={([v]) => updateNested('overlay', 'opacity', v / 100)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="color"
                                            className="h-8 w-8 rounded cursor-pointer border border-gray-200 p-0 overflow-hidden"
                                            value={config.overlay?.color || '#000000'}
                                            onChange={e => updateNested('overlay', 'color', e.target.value)}
                                        />
                                        <span className="text-xs text-gray-500 font-mono">{config.overlay?.color || '#000000'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] text-gray-500">Dismiss on Click outside</Label>
                                    <Switch
                                        className="scale-75"
                                        checked={config.overlay.dismissOnClick}
                                        onCheckedChange={c => updateNested('overlay', 'dismissOnClick', c)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* UI Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between col-span-2">
                            <Label className="text-xs font-semibold text-gray-700">Close Button</Label>
                            <Switch checked={config.closeButton?.enabled ?? config.showCloseButton ?? true} onCheckedChange={(c) => {
                                updateNested('closeButton', 'enabled', c);
                                updateConfig('showCloseButton', c); // Sync legacy
                            }} />
                        </div>

                        {(config.closeButton?.enabled ?? config.showCloseButton ?? true) && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border animate-in slide-in-from-top-1">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Position</Label>
                                    <Select value={config.closeButton?.position || 'top-right'} onValueChange={(v) => updateNested('closeButton', 'position', v)}>
                                        <SelectTrigger className="h-8 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top-right">Top Right (Inside)</SelectItem>
                                            <SelectItem value="top-left">Top Left (Inside)</SelectItem>
                                            <SelectItem value="outside-right">Floating Outside</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Colors (Icon / Bg)</Label>
                                    <div className="flex gap-2">
                                        <div className="flex flex-col items-center gap-1">
                                            <Label className="text-[9px] text-gray-400">Icon</Label>
                                            <input
                                                type="color"
                                                className="w-8 h-6 rounded cursor-pointer border border-gray-200 p-0"
                                                value={config.closeButton?.color || '#000000'}
                                                onChange={e => updateNested('closeButton', 'color', e.target.value)}
                                                title="Icon Color"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-1 relative">
                                            <Label className="text-[9px] text-gray-400">Bg</Label>
                                            <input
                                                type="color"
                                                className={`w-8 h-6 rounded cursor-pointer border border-gray-200 p-0 ${config.closeButton?.backgroundColor === '#00000000' ? 'opacity-30 pointer-events-none' : ''}`}
                                                value={config.closeButton?.backgroundColor === '#00000000' ? '#FFFFFF' : (config.closeButton?.backgroundColor || '#FFFFFF')}
                                                onChange={e => updateNested('closeButton', 'backgroundColor', e.target.value)}
                                                title="Background Color"
                                            />
                                            {config.closeButton?.backgroundColor === '#00000000' && (
                                                <div className="absolute top-[18px] left-[2px] right-[2px] h-[2px] bg-red-400 rotate-45" />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center gap-1 ml-1">
                                            <Label className="text-[9px] text-gray-400">Transp.</Label>
                                            <Switch
                                                className="scale-75"
                                                checked={config.closeButton?.backgroundColor === '#00000000'}
                                                onCheckedChange={(checked) => {
                                                    updateNested('closeButton', 'backgroundColor', checked ? '#00000000' : '#FFFFFF');
                                                }}
                                            />
                                        </div>
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
