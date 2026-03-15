import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Layers, ImageIcon, LayoutTemplate, Sparkles } from 'lucide-react';

const PALETTE = [
    '#000000', '#1F2937', '#111827', '#374151', '#4B5563', '#6B7280',
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#FEF3C7', '#DBEAFE', '#EDE9FE',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
];

/**
 * SlideMinimalEditor — shown when Slide 1/2/3 is selected.
 * Allows per-slide background color, image, object-fit, and duration override.
 */
export const SlideMinimalEditor = () => {
    const {
        currentCampaign,
        activeStoryId,
        updateCampaign,
    } = useEditorStore();

    const selectedLayerId = currentCampaign?.selectedLayerId;
    const activeStory = currentCampaign?.stories?.find(s => s.id === activeStoryId);
    if (!activeStory || !selectedLayerId) return null;

    const slideLayer = activeStory.layers.find(l => l.id === selectedLayerId);
    if (!slideLayer) return null;

    const rootContainer = activeStory.layers.find(l => l.type === 'container' && !l.parent);
    const slides = activeStory.layers.filter(l => l.parent === rootContainer?.id && l.type === 'container');
    const slideIndex = slides.findIndex(s => s.id === selectedLayerId);
    const slideNumber = slideIndex + 1;

    const updateSlideContent = (key: string, value: any) => {
        if (!currentCampaign?.stories) return;
        const updatedStories = currentCampaign.stories.map(s => {
            if (s.id !== activeStoryId) return s;
            return {
                ...s,
                layers: s.layers.map(l => {
                    if (l.id !== selectedLayerId) return l;
                    return { ...l, content: { ...l.content, [key]: value } };
                }),
                updatedAt: new Date().toISOString(),
            };
        });
        updateCampaign({ stories: updatedStories, isDirty: true } as any);
    };

    const updateSlideStyle = (key: string, value: any) => {
        if (!currentCampaign?.stories) return;
        const updatedStories = currentCampaign.stories.map(s => {
            if (s.id !== activeStoryId) return s;
            return {
                ...s,
                layers: s.layers.map(l => {
                    if (l.id !== selectedLayerId) return l;
                    return { ...l, style: { ...l.style, [key]: value } };
                }),
                updatedAt: new Date().toISOString(),
            };
        });
        updateCampaign({ stories: updatedStories, isDirty: true } as any);
    };

    const content = (slideLayer.content || {}) as any;
    const style = (slideLayer.style || {}) as any;

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <LayoutTemplate className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Slide {slideNumber}</h3>
                    <p className="text-[10px] text-gray-400">Design this slide's background and content</p>
                </div>
            </div>

            <Tabs defaultValue="design" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="design"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Background</TabsTrigger>
                    <TabsTrigger value="settings"><Layers className="w-3.5 h-3.5 mr-1.5" /> Settings</TabsTrigger>
                </TabsList>

                {/* ====== BACKGROUND TAB ====== */}
                <TabsContent value="design" className="space-y-5 animate-in fade-in-50">
                    {/* Background Color */}
                    <div className="space-y-3 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Background Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {PALETTE.map(c => (
                                <button
                                    key={c}
                                    onClick={() => updateSlideStyle('backgroundColor', c)}
                                    className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${style.backgroundColor === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <input
                                type="color"
                                className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                value={style.backgroundColor || '#FFFFFF'}
                                onChange={e => updateSlideStyle('backgroundColor', e.target.value)}
                                title="Custom color"
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: style.backgroundColor || '#FFFFFF' }} />
                            <Input
                                className="h-8 text-xs font-mono flex-1"
                                value={style.backgroundColor || '#FFFFFF'}
                                onChange={e => updateSlideStyle('backgroundColor', e.target.value)}
                                placeholder="#FFFFFF"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Background Media */}
                    <div className="space-y-3 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Background Media</Label>
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Image / Video URL</Label>
                            <Input
                                placeholder="https://..."
                                className="text-xs"
                                value={content.url || ''}
                                onChange={(e) => updateSlideContent('url', e.target.value)}
                            />
                            <p className="text-[9px] text-gray-400 mt-1">Paste any image URL or MP4 link</p>
                        </div>

                        {content.url && (
                            <>
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Object Fit</Label>
                                    <Select value={content.objectFit || 'cover'} onValueChange={val => updateSlideContent('objectFit', val)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover (Crop to fill)</SelectItem>
                                            <SelectItem value="contain">Contain (Show full)</SelectItem>
                                            <SelectItem value="fill">Fill (Stretch)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Preview thumbnail */}
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                    <img
                                        src={content.url}
                                        alt="Slide background preview"
                                        className="w-full h-full"
                                        style={{ objectFit: (content.objectFit || 'cover') as any }}
                                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">
                                        Slide {slideNumber} bg
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>

                {/* ====== SETTINGS TAB ====== */}
                <TabsContent value="settings" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Slide Settings</Label>

                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Slide Name</Label>
                            <Input className="h-8 text-xs" value={slideLayer.name || `Slide ${slideNumber}`} readOnly />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Slide Timing</Label>
                            
                            <div className="space-y-3">
                                <Select 
                                    value={content.autoAdvanceMode || 'fixed'} 
                                    onValueChange={val => updateSlideContent('autoAdvanceMode', val)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed Duration</SelectItem>
                                        <SelectItem value="video_completion">On Video Completion</SelectItem>
                                        <SelectItem value="manual">Manual Only</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(content.autoAdvanceMode === 'fixed' || !content.autoAdvanceMode) && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs w-20"
                                            value={content.duration || 5}
                                            onChange={e => updateSlideContent('duration', Number(e.target.value) || 5)}
                                        />
                                        <span className="text-[10px] text-gray-500">seconds</span>
                                    </div>
                                )}

                                {content.autoAdvanceMode === 'video_completion' && (
                                    <p className="text-[9px] text-indigo-500 bg-indigo-50 p-2 rounded">
                                        Slide will advance automatically when the background video finihes.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-indigo-50/30 space-y-2">
                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Adding Content
                        </Label>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Use the <strong>+ Add</strong> button in the Layers panel to add Text, Images, Buttons, and other elements as children of this slide.
                        </p>
                        <p className="text-[9px] text-gray-400">
                            Select this slide in the layer tree first, then click + Add.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SlideMinimalEditor;
