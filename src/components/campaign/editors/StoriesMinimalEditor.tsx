import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Layout,
    ImageIcon,
    MousePointer2,
    Sparkles,
    X,
    Pause,
    BarChart3,
    ArrowLeft,
    Palette,
} from 'lucide-react';

const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

/**
 * StoriesMinimalEditor — Floater-style editor for Slide Container root layer.
 * 3 Tabs: General (dimensions, timing, transition), Background (color/media), Controls (close, mute, pause, progress bar)
 */
export const StoriesMinimalEditor = () => {
    const {
        currentCampaign,
        activeStoryId,
        updateCampaign,
    } = useEditorStore();

    const activeStory = currentCampaign?.stories?.find(s => s.id === activeStoryId);
    if (!activeStory) return null;

    const rootSlide = activeStory.layers.find(l => l.type === 'container' && !l.parent);
    if (!rootSlide) return null;

    // Slide count for progress bar preview
    const slides = activeStory.layers.filter(l => l.parent === rootSlide.id && l.type === 'container');

    // Content helpers (story config lives in rootSlide.content)
    const cfg = (rootSlide.content || {}) as any;

    const updateContent = (key: string, value: any) => {
        if (!currentCampaign?.stories) return;
        const updatedStories = currentCampaign.stories.map(s => {
            if (s.id !== activeStoryId) return s;
            return {
                ...s,
                layers: s.layers.map(l => {
                    if (l.id !== rootSlide.id) return l;
                    return { ...l, content: { ...l.content, [key]: value } };
                }),
                updatedAt: new Date().toISOString(),
            };
        });
        updateCampaign({ stories: updatedStories, isDirty: true } as any);
    };

    const updateNested = (parent: string, key: string, value: any) => {
        const parentObj = cfg[parent] || {};
        updateContent(parent, { ...parentObj, [key]: value });
    };

    const updateControl = (controlType: string, key: string, value: any) => {
        const controls = cfg.controls || {};
        const specific = controls[controlType] || {};
        updateContent('controls', {
            ...controls,
            [controlType]: { ...specific, [key]: value },
        });
    };

    const updateSlideStyle = (key: string, value: any) => {
        if (!currentCampaign?.stories) return;
        const updatedStories = currentCampaign.stories.map(s => {
            if (s.id !== activeStoryId) return s;
            return {
                ...s,
                layers: s.layers.map(l => {
                    if (l.id !== rootSlide.id) return l;
                    return { ...l, style: { ...l.style, [key]: value } };
                }),
                updatedAt: new Date().toISOString(),
            };
        });
        updateCampaign({ stories: updatedStories, isDirty: true } as any);
    };

    // Resolve controls config with defaults
    const controls = cfg.controls || {};
    const closeBtn = controls.closeButton || { show: true, position: 'top-right', size: 24 };
    const muteBtn = controls.muteButton || { show: true, position: 'top-right', size: 20 };
    const pauseBtn = controls.pauseButton || { show: false, position: 'top-right', size: 20 };
    const progressBar = controls.progressBar || {
        show: true,
        height: 3,
        gap: 3,
        position: 'top',
        activeColor: 'rgba(255,255,255,0.95)',
        inactiveColor: 'rgba(255,255,255,0.35)',
        topOffset: 8,
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-50 rounded-md">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold">Slide Container Setup</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="general"><Layout className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="controls"><MousePointer2 className="w-3.5 h-3.5 mr-1.5" /> Controls</TabsTrigger>
                </TabsList>

                {/* =================== GENERAL TAB =================== */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">
                    {/* Display Settings */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Display Settings</Label>
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Name</Label>
                            <Input
                                className="h-8 text-xs"
                                value={currentCampaign?.name || 'New Campaign'}
                                readOnly
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Transition */}

                    {/* Transition */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Slide Transition</Label>
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Effect</Label>
                            <Select
                                value={cfg.transition || 'slide'}
                                onValueChange={(val) => updateContent('transition', val)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="slide">Slide</SelectItem>
                                    <SelectItem value="fade">Fade</SelectItem>
                                    <SelectItem value="cube">Cube</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                    </div>
                </TabsContent>

                {/* =================== CONTROLS TAB =================== */}
                <TabsContent value="controls" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">UI Controls</Label>

                        {/* ─── Progress Bar ─── */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5" /> Progress Bar
                                </Label>
                                <Switch checked={progressBar.show} onCheckedChange={c => updateControl('progressBar', 'show', c)} />
                            </div>
                            {progressBar.show && (
                                <>
                                    {/* Live Preview */}
                                    <div className="bg-gray-800 rounded-lg p-3">
                                        <div className="flex" style={{ gap: `${progressBar.gap || 3}px` }}>
                                            {slides.map((_, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        height: `${progressBar.height || 3}px`,
                                                        borderRadius: `${(progressBar.height || 3) / 2}px`,
                                                        backgroundColor: i === 0
                                                            ? (progressBar.activeColor || 'rgba(255,255,255,0.95)')
                                                            : (progressBar.inactiveColor || 'rgba(255,255,255,0.35)'),
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-2 text-center">{slides.length} slides × {progressBar.height || 3}px bar</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-gray-500">Height (px)</Label>
                                            <Input type="number" className="h-7 text-xs" value={progressBar.height || 3} onChange={e => updateControl('progressBar', 'height', parseInt(e.target.value) || 3)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-gray-500">Gap (px)</Label>
                                            <Input type="number" className="h-7 text-xs" value={progressBar.gap || 3} onChange={e => updateControl('progressBar', 'gap', parseInt(e.target.value) || 3)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Top Offset (px)</Label>
                                        <Input type="number" className="h-7 text-xs" value={progressBar.topOffset ?? 8} onChange={e => updateControl('progressBar', 'topOffset', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Active / Inactive)</Label>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Active</Label>
                                                <input
                                                    type="color"
                                                    className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                    value="#FFFFFF"
                                                    onChange={e => updateControl('progressBar', 'activeColor', e.target.value)}
                                                    title="Active segment color"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Inactive</Label>
                                                <input
                                                    type="color"
                                                    className="w-8 h-6 rounded cursor-pointer border border-gray-200"
                                                    value="#666666"
                                                    onChange={e => updateControl('progressBar', 'inactiveColor', e.target.value)}
                                                    title="Inactive segment color"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ─── Close / Back Button ─── */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <X className="w-3.5 h-3.5" /> Close Button
                                </Label>
                                <Switch checked={closeBtn.show ?? true} onCheckedChange={c => updateControl('closeButton', 'show', c)} />
                            </div>
                            {closeBtn.show && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Select value={closeBtn.position || 'top-right'} onValueChange={(val) => updateControl('closeButton', 'position', val)}>
                                            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-right">Top Right</SelectItem>
                                                <SelectItem value="top-left">Top Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" placeholder="Size" className="h-7 text-xs" value={closeBtn.size || 24} onChange={e => updateControl('closeButton', 'size', parseInt(e.target.value))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">X</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={closeBtn.offsetX || 0} onChange={e => updateControl('closeButton', 'offsetX', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] text-gray-400 w-4">Y</Label>
                                            <Input type="number" placeholder="0" className="h-7 text-xs" value={closeBtn.offsetY || 0} onChange={e => updateControl('closeButton', 'offsetY', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Icon</Label>
                                                <input type="color" className="w-8 h-6 rounded cursor-pointer border border-gray-200" value={closeBtn.color || '#FFFFFF'} onChange={e => updateControl('closeButton', 'color', e.target.value)} />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Bg</Label>
                                                <input type="color" className={`w-8 h-6 rounded cursor-pointer border border-gray-200 ${closeBtn.backgroundColor === '#00000000' ? 'opacity-30' : ''}`} value={closeBtn.backgroundColor === '#00000000' ? '#000000' : (closeBtn.backgroundColor || '#00000080')} onChange={e => updateControl('closeButton', 'backgroundColor', e.target.value)} />
                                            </div>
                                            <div className="flex flex-col items-center gap-1 ml-1">
                                                <Label className="text-[9px] text-gray-400">Transp.</Label>
                                                <Switch className="scale-75" checked={closeBtn.backgroundColor === '#00000000'} onCheckedChange={(checked) => updateControl('closeButton', 'backgroundColor', checked ? '#00000000' : '#00000080')} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ─── Back Button ─── */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back Button
                                </Label>
                                <Switch checked={controls.backButton?.show ?? false} onCheckedChange={c => updateControl('backButton', 'show', c)} />
                            </div>
                            {controls.backButton?.show && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Select value={controls.backButton?.position || 'top-left'} onValueChange={(val) => updateControl('backButton', 'position', val)}>
                                            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-right">Top Right</SelectItem>
                                                <SelectItem value="top-left">Top Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" placeholder="Size" className="h-7 text-xs" value={controls.backButton?.size || 24} onChange={e => updateControl('backButton', 'size', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Icon</Label>
                                                <input type="color" className="w-8 h-6 rounded cursor-pointer border border-gray-200" value={controls.backButton?.color || '#FFFFFF'} onChange={e => updateControl('backButton', 'color', e.target.value)} />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Bg</Label>
                                                <input type="color" className="w-8 h-6 rounded cursor-pointer border border-gray-200" value={controls.backButton?.backgroundColor || '#00000080'} onChange={e => updateControl('backButton', 'backgroundColor', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>


                        {/* ─── Pause Button ─── */}
                        <div className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium flex items-center gap-2">
                                    <Pause className="w-3.5 h-3.5" /> Pause Button
                                </Label>
                                <Switch checked={pauseBtn.show ?? false} onCheckedChange={c => updateControl('pauseButton', 'show', c)} />
                            </div>
                            {pauseBtn.show && (
                                <>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Select value={pauseBtn.position || 'top-right'} onValueChange={(val) => updateControl('pauseButton', 'position', val)}>
                                            <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top-right">Top Right</SelectItem>
                                                <SelectItem value="top-left">Top Left</SelectItem>
                                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" placeholder="Size" className="h-7 text-xs" value={pauseBtn.size || 20} onChange={e => updateControl('pauseButton', 'size', parseInt(e.target.value))} />
                                    </div>
                                    <div className="space-y-1 mt-2 p-2 bg-gray-50 rounded border">
                                        <Label className="text-[10px] text-gray-500 block">Colors (Icon / Bg)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Icon</Label>
                                                <input type="color" className="w-8 h-6 rounded cursor-pointer border border-gray-200" value={pauseBtn.color || '#FFFFFF'} onChange={e => updateControl('pauseButton', 'color', e.target.value)} />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-[9px] text-gray-400">Bg</Label>
                                                <input type="color" className="w-8 h-6 rounded cursor-pointer border border-gray-200" value={pauseBtn.backgroundColor || '#00000080'} onChange={e => updateControl('pauseButton', 'backgroundColor', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StoriesMinimalEditor;
