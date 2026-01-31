import React from 'react';
import { Sparkles, Move, Maximize2, Brush, Percent, Palette, Image as ImageIcon } from 'lucide-react';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { PositionEditor } from '@/components/editor/style/PositionEditor';

// UI Components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface ScratchFoilEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleTooltipUpdate: (key: string, value: any) => void;
    colors: any;
}

export const ScratchFoilEditor: React.FC<ScratchFoilEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    colors
}) => {
    // Helper for content updates
    const updateContent = (key: string, value: any) => {
        updateLayer(selectedLayerId, {
            content: { ...layer.content, [key]: value }
        });
    };

    const content = layer.content || {};
    const coverType = content.coverImage ? 'image' : 'color';

    // Tab State
    const [activeTab, setActiveTab] = React.useState<'design' | 'interaction' | 'layout'>('design');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="pb-4 mb-2 border-b border-gray-100 flex-shrink-0">
                <h4 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Sparkles size={14} className="text-indigo-600" />
                    </div>
                    Scratch Foil Settings
                </h4>
                <p className="text-[11px] text-gray-500 ml-9 mt-1">
                    Configure the scratchable overlay properties.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/50 rounded-lg mb-4 gap-1 flex-shrink-0">
                {(['design', 'interaction', 'layout'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === tab
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        {tab === 'design' && <Palette size={12} />}
                        {tab === 'interaction' && <Brush size={12} />}
                        {tab === 'layout' && <Move size={12} />}
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-20 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                {/* 1. DESIGN TAB */}
                {activeTab === 'design' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        {/* Surface */}
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Surface Style</h5>
                            <div className="flex p-1 bg-gray-100 rounded-md">
                                <button
                                    onClick={() => updateContent('coverImage', '')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${coverType === 'color' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Solid Color
                                </button>
                                <button
                                    onClick={() => updateContent('coverImage', 'https://')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${coverType === 'image' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Image Pattern
                                </button>
                            </div>

                            {coverType === 'image' ? (
                                <div className="space-y-3 pt-1">
                                    <Label className="text-[10px] text-gray-500">Image URL</Label>
                                    <div className="space-y-2">
                                        <Input
                                            value={content.coverImage === 'https://' ? '' : (content.coverImage || '')}
                                            onChange={(e) => updateContent('coverImage', e.target.value)}
                                            placeholder="https://example.com/foil.png"
                                            className="h-8 text-xs bg-white"
                                        />
                                        {content.coverImage && content.coverImage !== 'https://' && (
                                            <div className="w-full h-24 rounded-md border border-gray-200 overflow-hidden bg-gray-50 relative group">
                                                <img src={content.coverImage} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    <Label className="text-[10px] text-gray-500">Cover Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={content.coverColor || '#CCCCCC'}
                                            onChange={(e) => updateContent('coverColor', e.target.value)}
                                            className="w-9 h-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white"
                                        />
                                        <Input
                                            type="text"
                                            value={content.coverColor || '#CCCCCC'}
                                            onChange={(e) => updateContent('coverColor', e.target.value)}
                                            className="flex-1 h-9 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Dimensions */}
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900 flex items-center gap-2">
                                Dimensions
                            </h5>
                            <SizeControls
                                layer={layer}
                                selectedLayerId={selectedLayerId}
                                updateLayer={updateLayer}
                                onStyleUpdate={onStyleUpdate}
                                colors={colors}
                            />
                            {/* Corner Radius */}
                            <div className="space-y-3 mt-4 pt-2 border-t border-gray-50">
                                <Label className="text-[10px] text-gray-500">Corner Radius</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        value={content.borderRadius || 0}
                                        onChange={(e) => updateContent('borderRadius', Number(e.target.value))}
                                        className="h-8 text-xs bg-white font-mono"
                                    />
                                    <span className="text-xs text-gray-400 font-medium w-6">px</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* 2. INTERACTION TAB */}
                {activeTab === 'interaction' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h5 className="text-[12px] font-semibold text-gray-900">Scratch Behavior</h5>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] text-gray-500 block">Brush Size ({content.scratchSize || 40}px)</Label>
                                    <Slider
                                        min={10} max={100} step={5}
                                        value={[content.scratchSize || 40]}
                                        onValueChange={([val]) => updateContent('scratchSize', val)}
                                        className="py-1"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] text-gray-500 block">Reveal Threshold ({content.revealThreshold || 50}%)</Label>
                                    <Slider
                                        min={1} max={95} step={5}
                                        value={[content.revealThreshold || 50]}
                                        onValueChange={([val]) => updateContent('revealThreshold', val)}
                                        className="py-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Cursor Image */}
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Custom Cursor</h5>
                            <p className="text-[10px] text-gray-500">Optional image to replace the mouse cursor when scratching.</p>

                            <div className="flex gap-2">
                                <Input
                                    value={content.cursorImage || ''}
                                    onChange={(e) => updateContent('cursorImage', e.target.value)}
                                    placeholder="https://example.com/coin.png"
                                    className="h-8 text-xs bg-white flex-1"
                                />
                                {content.cursorImage && (
                                    <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        <img src={content.cursorImage} className="w-full h-full object-contain" alt="Cursor" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* 3. LAYOUT TAB */}
                {activeTab === 'layout' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <div className="space-y-3">
                            <h5 className="text-[12px] font-semibold text-gray-900">Position & Stacking</h5>
                            <PositionEditor
                                style={layer.style || {}}
                                onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                                colors={colors}
                                showZIndex={true}
                                showCoordinates={true}
                                showPositionType={false} // HIDDEN as requested
                                allowedPositions={['absolute']}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
