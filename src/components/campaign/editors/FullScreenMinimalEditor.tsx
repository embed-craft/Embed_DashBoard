import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Layout,
    Clock,
    Plus,
    Trash2,
    Settings2,
    ImageIcon,
    Video,
    VolumeX
} from 'lucide-react';

const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const FullScreenMinimalEditor = () => {
    const {
        currentCampaign,
        activeInterfaceId,
        updateFullScreenConfig,
        updateCampaign
    } = useEditorStore();

    // Resolve Config
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.fullscreenConfig : currentCampaign?.fullscreenConfig;

    // Initial Defaults
    useEffect(() => {
        if (!config) {
            updateFullScreenConfig({
                showSystemColor: false,
                cannotClash: false,
                backgroundColor: '#FFFFFF',
                overlay: { enabled: true, color: '#000000', opacity: 1, dismissOnClick: false },
                timing: { delay: 0, duration: 0 },
                parameters: {},
                media: { url: '', type: 'none', autoPlay: true, muted: false, loop: true, fit: 'cover' }
            });
        }
    }, [config, updateFullScreenConfig]);

    if (!config) return null;

    const updateConfig = (key: string, value: any) => updateFullScreenConfig({ [key]: value });
    const updateNested = (parent: string, key: string, value: any) => {
        // @ts-ignore
        const parentObj = config[parent] || {};
        updateFullScreenConfig({ [parent]: { ...parentObj, [key]: value } });
    };

    const isVideo = (config.media?.url && (
        config.media.url.includes('youtube.com') ||
        config.media.url.includes('youtu.be') ||
        config.media.url.endsWith('.mp4') ||
        config.media.url.endsWith('.webm')
    )) || config.media?.type === 'video' || config.media?.type === 'youtube';

    // Helper logic for "Type" toggle (Color vs Media)
    const mode = (config.media?.type && config.media.type !== 'none') ? 'media' : 'color';

    // Parameter Management
    const addParameter = () => {
        const newParams = { ...config.parameters, [`param_${Object.keys(config.parameters || {}).length + 1}`]: '' };
        updateConfig('parameters', newParams);
    };

    const removeParameter = (key: string) => {
        const newParams = { ...config.parameters };
        delete newParams[key];
        updateConfig('parameters', newParams);
    };

    const updateParameter = (oldKey: string, newKey: string, value: string) => {
        const newParams = { ...config.parameters };
        if (oldKey !== newKey) {
            delete newParams[oldKey];
            newParams[newKey] = value;
        } else {
            newParams[oldKey] = value;
        }
        updateConfig('parameters', newParams);
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Layout className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Full Screen Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general"><Settings2 className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="media"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Background</TabsTrigger>
                    <TabsTrigger value="controls"><Settings2 className="w-3.5 h-3.5 mr-1.5" /> Controls</TabsTrigger>
                    <TabsTrigger value="timing"><Clock className="w-3.5 h-3.5 mr-1.5" /> Timing</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* Basic Settings */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Display Settings</Label>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-gray-500">Name</Label>
                                {/* Name is usually handled at campaign level, but UI showed it. Use activeInterface name if available or disabled input */}
                                <Input
                                    value={currentCampaign?.name || ''}
                                    className="h-8 text-xs font-medium"
                                    onChange={(e) => updateCampaign({ name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[10px] text-gray-500">Cannot Clash (Priority)</Label>
                                <Select value={config.cannotClash ? 'true' : 'false'} onValueChange={(val) => updateConfig('cannotClash', val === 'true')}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Allow Clash (Low Priority)</SelectItem>
                                        <SelectItem value="true">Cannot Clash (High Priority)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <Label className="text-[10px] text-gray-600">Add System Color</Label>
                                <Switch checked={config.showSystemColor} onCheckedChange={(c) => updateConfig('showSystemColor', c)} />
                            </div>
                        </div>
                    </div>

                    <Separator />





                </TabsContent>

                {/* --- MEDIA TAB --- */}
                <TabsContent value="media" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Background Content</Label>

                        {/* Toggle Type */}
                        <div className="flex p-1 bg-gray-100 rounded-md">
                            <button
                                onClick={() => updateFullScreenConfig({ media: { ...config.media, url: '', type: 'none' }, backgroundColor: config.backgroundColor || '#FFFFFF' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'color' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Solid Color
                            </button>
                            <button
                                onClick={() => updateFullScreenConfig({ media: { ...config.media, url: 'https://placehold.co/1080x1920', type: 'image' } })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'media' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Image / Video
                            </button>
                        </div>

                        {/* Content Based on Toggle */}
                        {mode === 'color' && (
                            <div className="space-y-2">
                                <Label className="text-[10px] text-gray-500">Base Canvas Color</Label>
                                <div className="flex flex-wrap gap-2">
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
                                        className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                                        value={config.backgroundColor || '#FFFFFF'}
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
                                            let type: any = 'image';
                                            if (url.includes('youtube') || url.includes('youtu.be')) type = 'youtube';
                                            else if (url.endsWith('.mp4') || url.endsWith('.webm')) type = 'video';
                                            updateFullScreenConfig({
                                                media: {
                                                    ...config.media,
                                                    url,
                                                    type
                                                }
                                            });
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
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Close Button</Label>
                        <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Show Close Button</Label>
                                <Switch
                                    checked={config.controls?.closeButton?.show ?? true}
                                    onCheckedChange={c => updateNested('controls', 'closeButton', { ...(config.controls?.closeButton || {}), show: c })}
                                />
                            </div>

                            {(config.controls?.closeButton?.show ?? true) && (
                                <>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Icon Image URL (Optional)</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="https://... (Default: 'X' icon)"
                                            value={config.controls?.closeButton?.iconUrl || ''}
                                            onChange={e => updateNested('controls', 'closeButton', { ...(config.controls?.closeButton || {}), iconUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-gray-500">Position</Label>
                                            <Select
                                                value={config.controls?.closeButton?.position || 'top-right'}
                                                onValueChange={val => updateNested('controls', 'closeButton', { ...(config.controls?.closeButton || {}), position: val })}
                                            >
                                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="top-right">Top Right</SelectItem>
                                                    <SelectItem value="top-left">Top Left</SelectItem>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-gray-500">Size (px)</Label>
                                            <Input
                                                type="number"
                                                className="h-8 text-xs"
                                                value={config.controls?.closeButton?.size || 24}
                                                onChange={e => updateNested('controls', 'closeButton', { ...(config.controls?.closeButton || {}), size: parseInt(e.target.value) || 24 })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Interaction</Label>
                        <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Tap to Dismiss</Label>
                                <Switch
                                    checked={config.behavior?.tapToDismiss ?? false}
                                    onCheckedChange={c => updateNested('behavior', 'tapToDismiss', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Double Tap to Dismiss</Label>
                                <Switch
                                    checked={config.behavior?.doubleTapToDismiss ?? false}
                                    onCheckedChange={c => updateNested('behavior', 'doubleTapToDismiss', c)}
                                />
                            </div>
                        </div>
                    </div>

                    {isVideo && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <Label className="text-xs font-semibold text-gray-700">Video Controls</Label>
                                <div className="border rounded-lg p-3 bg-gray-50/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs text-gray-600">Show Progress Bar</Label>
                                        <Switch
                                            checked={config.controls?.progressBar?.show ?? false}
                                            onCheckedChange={c => updateNested('controls', 'progressBar', { ...(config.controls?.progressBar || {}), show: c })}
                                        />
                                    </div>
                                    {(config.controls?.progressBar?.show ?? false) && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-gray-500">Progress Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    className="w-10 h-8 p-0 border-0"
                                                    value={config.controls?.progressBar?.color || '#FFFFFF'}
                                                    onChange={e => updateNested('controls', 'progressBar', { ...(config.controls?.progressBar || {}), color: e.target.value })}
                                                />
                                                <Input
                                                    className="h-8 text-xs flex-1"
                                                    value={config.controls?.progressBar?.color || '#FFFFFF'}
                                                    onChange={e => updateNested('controls', 'progressBar', { ...(config.controls?.progressBar || {}), color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                </TabsContent>

                {/* --- TIMING TAB --- */}
                <TabsContent value="timing" className="space-y-5 animate-in fade-in-50">

                    {/* Timing */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Timing</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-gray-500">Delay (Seconds)</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={config.timing?.delay || 0}
                                    onChange={(e) => updateNested('timing', 'delay', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-gray-500">Duration (Seconds)</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={config.timing?.duration || 0}
                                    onChange={(e) => updateNested('timing', 'duration', parseFloat(e.target.value))}
                                />
                                <p className="text-[9px] text-gray-400">0 = Infinite</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parameters */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">Parameters</Label>
                            <Button variant="ghost" size="sm" onClick={addParameter} className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full">
                                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(config.parameters || {}).map(([key, value], index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        className="h-7 text-[10px] w-1/3"
                                        placeholder="Key"
                                        value={key}
                                        onChange={(e) => updateParameter(key, e.target.value, value as string)}
                                    />
                                    <Input
                                        className="h-7 text-[10px] flex-1"
                                        placeholder="Value"
                                        value={value as string}
                                        onChange={(e) => updateParameter(key, key, e.target.value)}
                                    />
                                    <Button variant="ghost" size="sm" onClick={() => removeParameter(key)} className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            {Object.keys(config.parameters || {}).length === 0 && (
                                <p className="text-[10px] text-gray-400 italic text-center py-2">No custom parameters added</p>
                            )}
                        </div>
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
};
