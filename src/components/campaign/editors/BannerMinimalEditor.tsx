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
    MousePointer2,
    X,
    Sparkles,
    GripHorizontal,
    ChevronDown,
    Layers,
    ChevronUp,
} from 'lucide-react';

// Colors for palette picker
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const BannerMinimalEditor = () => {
    const { currentCampaign, activeInterfaceId, updateBannerConfig } = useEditorStore();

    // Resolve config from active interface OR main campaign
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.bannerConfig : currentCampaign?.bannerConfig;

    // Auto-initialize defaults
    useEffect(() => {
        if (!config) {
            updateBannerConfig({
                height: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: { bottomLeft: 16, bottomRight: 16 },
                overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                animation: { type: 'slide', duration: 300, easing: 'ease-out' },
                dragHandle: false,
                showCloseButton: false,
                swipeToDismiss: false
            });
        }
    }, [config, updateBannerConfig]);

    if (!config) {
        return (
            <div className="p-5 text-center text-gray-500">
                <p className="text-sm mb-3">Configuration missing</p>
                <button
                    onClick={() => updateBannerConfig({
                        height: 'auto',
                        backgroundColor: '#FFFFFF',
                        borderRadius: { bottomLeft: 16, bottomRight: 16 },
                        overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                        animation: { type: 'slide', duration: 300, easing: 'ease-out' }
                    } as any)}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                    Initialize Settings
                </button>
            </div>
        );
    }

    const updateConfig = (key: string, value: any) => {
        updateBannerConfig({ [key]: value });

        // Sync background color to root layer
        if (key === 'backgroundColor') {
            const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Banner'); // Changed name check
            if (rootLayer) {
                const styleValue = (value === 'transparent' || value === '#00000000') ? '#00000000' : value;
                const { updateLayerStyle } = useEditorStore.getState();
                updateLayerStyle(rootLayer.id, { backgroundColor: styleValue });
            }
        }
    };

    const updateNestedConfig = (parent: string, key: string, value: any) => {
        updateBannerConfig({
            [parent]: { ...((config as any)[parent] || {}), [key]: value }
        });
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Banner Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="background"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Background</TabsTrigger>
                    <TabsTrigger value="behavior"><MousePointer2 className="w-3.5 h-3.5 mr-1.5" /> Behavior</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Height */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Dimensions</Label>

                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Height</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Maximize2 className="absolute left-2 top-2.5 w-3 h-3 text-gray-400 rotate-90" />
                                    <Input
                                        type="text"
                                        className="pl-7 h-8 text-xs w-full"
                                        value={config.height || 'auto'}
                                        onChange={(e) => updateConfig('height', e.target.value)}
                                        placeholder="e.g. 50% or 400px"
                                    />
                                </div>
                            </div>
                            {/* Quick Presets */}
                            <div className="flex items-center gap-2 mt-2 bg-white/50 p-1.5 rounded border border-gray-100">
                                <Label className="text-[10px] text-gray-500 shrink-0">Presets:</Label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {['auto', '40%', '50%', '80%', '400px'].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => updateConfig('height', val)}
                                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${config.height === val
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Border Radius - Single value for BOTTOM corners */}
                        <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">Corner Radius (Bottom)</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={
                                        typeof config.borderRadius === 'number'
                                            ? config.borderRadius
                                            : (config.borderRadius?.bottomLeft ?? 16)
                                    }
                                    onChange={(e) => {
                                        const radius = parseInt(e.target.value) || 0;
                                        updateConfig('borderRadius', radius);
                                    }}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">Overflow Content</Label>
                                <Select
                                    value={config.overflow || 'hide'}
                                    onValueChange={(val) => updateConfig('overflow', val)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hide">Hide (Clip)</SelectItem>
                                        <SelectItem value="scroll">Scroll</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Radius is applied to bottom corners. Overflow determines if long content scrolls.</p>
                    </div>

                    <Separator />

                    {/* UI Controls */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">UI Controls</Label>

                        {/* Drag Handle */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <GripHorizontal className="w-3.5 h-3.5" /> Drag Handle
                                </Label>
                                <Switch
                                    checked={config.dragHandle ?? false}
                                    onCheckedChange={(c) => updateConfig('dragHandle', c)}
                                />
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <X className="w-3.5 h-3.5" /> Close Button
                                </Label>
                                <Switch
                                    checked={config.showCloseButton ?? false}
                                    onCheckedChange={(c) => updateConfig('showCloseButton', c)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- BACKGROUND TAB --- */}
                <TabsContent value="background" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Background</Label>

                        {/* Solid Color */}
                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
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

                        {/* Background Image */}
                        <div className="space-y-2 border rounded-lg p-3">
                            <Label className="text-[10px] text-gray-500 block">Background Image URL</Label>
                            <Input
                                type="text"
                                className="h-8 text-xs"
                                value={config.backgroundImageUrl || ''}
                                onChange={(e) => updateConfig('backgroundImageUrl', e.target.value)}
                                placeholder="https://..."
                            />

                            {/* Background Size - Added per user request */}
                            {config.backgroundImageUrl && (
                                <div className="pt-2 mt-2 border-t border-gray-100">
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Image Fit</Label>
                                    <Select
                                        value={config.backgroundSize || 'cover'}
                                        onValueChange={(val) => updateConfig('backgroundSize', val)}
                                    >
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
                        </div>
                    </div>
                </TabsContent>

                {/* --- BEHAVIOR TAB --- */}
                <TabsContent value="behavior" className="space-y-5 animate-in fade-in-50">

                    {/* Overlay/Scrim */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Overlay (Scrim)</Label>

                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" /> Enable Overlay
                                </Label>
                                <Switch
                                    checked={config.overlay?.enabled ?? true}
                                    onCheckedChange={(c) => updateNestedConfig('overlay', 'enabled', c)}
                                />
                            </div>

                            {config.overlay?.enabled && (
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    {/* Overlay Color */}
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Color</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                value={config.overlay?.color || '#000000'}
                                                onChange={e => updateNestedConfig('overlay', 'color', e.target.value)}
                                            />
                                            <span className="text-xs text-gray-500">{config.overlay?.color || '#000000'}</span>
                                        </div>
                                    </div>

                                    {/* Overlay Opacity */}
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">
                                            Opacity: {Math.round((config.overlay?.opacity ?? 0.5) * 100)}%
                                        </Label>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.05"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            value={config.overlay?.opacity ?? 0.5}
                                            onChange={(e) => updateNestedConfig('overlay', 'opacity', parseFloat(e.target.value))}
                                        />
                                    </div>

                                    {/* Overlay Blur */}
                                    <div>
                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">
                                            Blur: {config.overlay?.blur ?? 0}px
                                        </Label>
                                        <input
                                            type="range"
                                            min="0" max="20" step="1"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            value={config.overlay?.blur ?? 0}
                                            onChange={(e) => updateNestedConfig('overlay', 'blur', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Dismiss Options */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Dismiss Options</Label>

                        <div className="border rounded-lg p-3 space-y-3 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Tap Scrim to Close</Label>
                                <Switch
                                    checked={config.overlay?.dismissOnClick ?? true}
                                    onCheckedChange={(c) => updateNestedConfig('overlay', 'dismissOnClick', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600 flex items-center gap-2">
                                    <ChevronUp className="w-3 h-3" /> Swipe Up to Close
                                </Label>
                                <Switch
                                    checked={config.swipeToDismiss ?? false}
                                    onCheckedChange={(c) => updateConfig('swipeToDismiss', c)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Animation */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Animation</Label>

                        <div className="border rounded-lg p-3 space-y-3">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Entrance Type</Label>
                                <Select
                                    value={config.animation?.type || 'slide'}
                                    onValueChange={(val) => updateNestedConfig('animation', 'type', val)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="slide">Slide Down</SelectItem>
                                        <SelectItem value="fade">Fade In</SelectItem>
                                        <SelectItem value="scale">Scale</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Duration (ms)</Label>
                                    <Input
                                        type="number"
                                        className="h-8 text-xs"
                                        value={config.animation?.duration ?? 300}
                                        onChange={(e) => updateNestedConfig('animation', 'duration', parseInt(e.target.value) || 300)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1 block">Easing</Label>
                                    <Select
                                        value={config.animation?.easing || 'ease-out'}
                                        onValueChange={(val) => updateNestedConfig('animation', 'easing', val)}
                                    >
                                        <SelectTrigger className="h-8 text-[10px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ease-out">Ease Out</SelectItem>
                                            <SelectItem value="ease-in">Ease In</SelectItem>
                                            <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                                            <SelectItem value="linear">Linear</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
