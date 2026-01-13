import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import {
    Image as ImageIcon,
    Sliders,
    Layout,
    Palette,
    Link as LinkIcon,
    Maximize,
    Square
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Helper components
const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <label className={`text-xs font-medium text-gray-700 block mb-1.5 ${className}`}>
        {children}
    </label>
);

const AspectRatioButton = ({ label, ratio, current, onClick }: { label: string, ratio: string | number | undefined, current: string | number | undefined, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${current === ratio
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
    >
        {label}
    </button>
);

interface MediaEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, target: 'layer' | 'background' | 'tooltip_image_only') => void;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    handleImageUpload,
    colors = {
        gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const imageUrl = layer?.content?.imageUrl || layer?.content?.videoUrl || '';

    // SAFE ACCESSORS for Style Properties
    const filter = typeof layer.style?.filter === 'object' ? layer.style.filter : {
        blur: 0,
        brightness: 100,
        contrast: 100,
        grayscale: 0
    };

    const handleFilterUpdate = (key: string, value: number) => {
        const newFilter = { ...filter, [key]: value };
        updateLayer(selectedLayerId, { style: { ...layer.style, filter: newFilter } });
    };

    return (
        <div className="p-1">
            <Tabs defaultValue="source" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="source" title="Source">
                        <ImageIcon size={14} className="mr-1.5" /> Source
                    </TabsTrigger>
                    <TabsTrigger value="adjustments" title="Adjustments">
                        <Sliders size={14} className="mr-1.5" /> Filter
                    </TabsTrigger>
                    <TabsTrigger value="layout" title="Layout">
                        <Layout size={14} className="mr-1.5" /> Layout
                    </TabsTrigger>
                    <TabsTrigger value="style" title="Style">
                        <Palette size={14} className="mr-1.5" /> Style
                    </TabsTrigger>
                </TabsList>

                {/* --- SOURCE TAB --- */}
                <TabsContent value="source" className="space-y-4 animate-in fade-in-50 duration-300">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="relative w-full h-[180px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4 group">
                            {imageUrl ? (
                                <>
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-full"
                                        style={{
                                            objectFit: layer.style?.objectFit || 'contain',
                                            filter: `brightness(${filter.brightness}%) contrast(${filter.contrast}%) blur(${filter.blur}px) grayscale(${filter.grayscale}%)`
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-md text-sm font-medium shadow-lg backdrop-blur-sm transition-transform transform scale-95 group-hover:scale-100">
                                            Replace Image
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'layer')} className="hidden" />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <ImageIcon size={32} />
                                    <span className="text-xs">No image selected</span>
                                    <label className="mt-2 text-indigo-600 text-xs font-medium cursor-pointer hover:underline">
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'layer')} className="hidden" />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => handleContentUpdate(layer.type === 'video' ? 'videoUrl' : 'imageUrl', e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- ADJUSTMENTS TAB --- */}
                <TabsContent value="adjustments" className="space-y-5 animate-in fade-in-50 duration-300">
                    <div className="space-y-4">
                        {[
                            { label: 'Brightness', key: 'brightness', min: 0, max: 200, def: 100, unit: '%' },
                            { label: 'Contrast', key: 'contrast', min: 0, max: 200, def: 100, unit: '%' },
                            { label: 'Blur', key: 'blur', min: 0, max: 20, def: 0, unit: 'px' },
                            { label: 'Grayscale', key: 'grayscale', min: 0, max: 100, def: 0, unit: '%' },
                        ].map((control) => (
                            <div key={control.key} className="space-y-1.5">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{control.label}</span>
                                    <span className="text-gray-400">{filter[control.key] ?? control.def}{control.unit}</span>
                                </div>
                                <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    value={filter[control.key] ?? control.def}
                                    onChange={(e) => handleFilterUpdate(control.key, parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* --- LAYOUT TAB --- */}
                <TabsContent value="layout" className="space-y-5 animate-in fade-in-50 duration-300">
                    {/* Object Fit */}
                    <div className="space-y-2">
                        <Label>Fill Mode</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['cover', 'contain', 'fill'].map((fit) => (
                                <button
                                    key={fit}
                                    onClick={() => onStyleUpdate('objectFit', fit)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${layer.style?.objectFit === fit
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {fit === 'cover' && <Maximize size={16} />}
                                    {fit === 'contain' && <Square size={16} />}
                                    {fit === 'fill' && <Layout size={16} />}
                                    <span className="capitalize">{fit}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <div className="flex flex-wrap gap-2">
                            <AspectRatioButton label="Free" ratio={undefined} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', undefined)} />
                            <AspectRatioButton label="1:1" ratio={1} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 1)} />
                            <AspectRatioButton label="4:3" ratio={4 / 3} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 4 / 3)} />
                            <AspectRatioButton label="16:9" ratio={16 / 9} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 16 / 9)} />
                        </div>
                    </div>

                    {/* Dimensions */}
                    <SizeControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        colors={colors}
                    />
                </TabsContent>

                {/* --- STYLE TAB --- */}
                <TabsContent value="style" className="space-y-5 animate-in fade-in-50 duration-300">
                    {/* Opacity */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Opacity</span>
                            <span>{Math.round((layer.style?.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={layer.style?.opacity ?? 1}
                            onChange={(e) => onStyleUpdate('opacity', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>

                    {/* Reuse Common Style Controls - they cover Border, Shadow, Radius */}
                    <CommonStyleControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        handleTooltipUpdate={handleTooltipUpdate}
                        showPosition={false} // Position handled elsewhere or context dependent
                        showPadding={true}
                        colors={colors}
                    />

                    {/* Shadow Controls */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-700">Drop Shadow</span>
                            <input
                                type="checkbox"
                                checked={!!layer.style?.boxShadow && layer.style.boxShadow !== 'none'}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onStyleUpdate('boxShadow', '0px 4px 12px 0px rgba(0,0,0,0.1)');
                                    } else {
                                        onStyleUpdate('boxShadow', 'none');
                                    }
                                }}
                                className="toggle-checkbox"
                            />
                        </div>

                        {layer.style?.boxShadow && layer.style.boxShadow !== 'none' && (() => {
                            // Simple parser for shadow string: "x y blur spread color"
                            // NOTE: This assumes px units and rgba. A robust regex might be better for production.
                            // Regex matches: <offset-x> <offset-y> <blur-radius> <spread-radius> <color>
                            const match = layer.style.boxShadow.match(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(.*)/);
                            const defaults = { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)' };

                            const current = match ? {
                                x: parseFloat(match[1]),
                                y: parseFloat(match[2]),
                                blur: parseFloat(match[3]),
                                spread: parseFloat(match[4]),
                                color: match[5]
                            } : defaults;

                            const updateShadow = (key: string, val: any) => {
                                const next = { ...current, [key]: val };
                                onStyleUpdate('boxShadow', `${next.x}px ${next.y}px ${next.blur}px ${next.spread}px ${next.color}`);
                            };

                            return (
                                <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                                    {/* Color */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Color</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                                                style={{ backgroundColor: current.color }}
                                            />
                                            <input
                                                type="text"
                                                value={current.color}
                                                onChange={(e) => updateShadow('color', e.target.value)}
                                                className="w-32 text-xs border border-gray-200 rounded px-1.5 py-0.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Sliders */}
                                    {[
                                        { label: 'X Offset', key: 'x', min: -50, max: 50 },
                                        { label: 'Y Offset', key: 'y', min: -50, max: 50 },
                                        { label: 'Blur', key: 'blur', min: 0, max: 100 },
                                        { label: 'Spread', key: 'spread', min: -20, max: 50 },
                                    ].map(s => (
                                        <div key={s.key} className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{s.label}</span>
                                                <span>{current[s.key]}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={s.min}
                                                max={s.max}
                                                value={current[s.key]}
                                                onChange={(e) => updateShadow(s.key, parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
