import React, { useState } from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import {
    PlaySquare,
    Layout,
    Palette,
    Link as LinkIcon,
    Maximize,
    Square,
    Settings2,
    Repeat,
    Play,
    Code,
    FileJson
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

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

interface LottieEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const LottieEditor: React.FC<LottieEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const lottieUrl = layer?.content?.lottieUrl || '';
    const lottieJson = layer?.content?.lottieJson || '';
    const [inputMode, setInputMode] = useState<'url' | 'json'>(layer?.content?.lottieJson ? 'json' : 'url');

    return (
        <div className="p-1">
            <Tabs defaultValue="source" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="source" title="Source">
                        <PlaySquare size={14} className="mr-1.5" /> Source
                    </TabsTrigger>
                    <TabsTrigger value="playback" title="Playback">
                        <Settings2 size={14} className="mr-1.5" /> Playback
                    </TabsTrigger>
                    <TabsTrigger value="adjustments" title="Adjust">
                        <Palette size={14} className="mr-1.5" /> Adjust
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
                        <div className="relative w-full h-[120px] bg-indigo-50/50 rounded-lg overflow-hidden border border-indigo-100/50 mb-4 flex flex-col items-center justify-center gap-3 text-center p-4">
                            <div className="p-2 bg-indigo-100 rounded-full">
                                <PlaySquare className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-700">Lottie Animation</h4>
                                <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">
                                    Paste a Lottie JSON URL below to add animated vector graphics.
                                </p>
                            </div>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-md mb-4 w-full">
                            <button
                                onClick={() => setInputMode('url')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-sm transition-all ${inputMode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LinkIcon size={12} /> URL
                            </button>
                            <button
                                onClick={() => setInputMode('json')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-sm transition-all ${inputMode === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <FileJson size={12} /> JSON Data
                            </button>
                        </div>

                        {inputMode === 'url' ? (
                            <div className="space-y-2">
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={lottieUrl}
                                            onChange={(e) => handleContentUpdate('lottieUrl', e.target.value)}
                                            placeholder="https://assets.lottiefiles.com/example.json"
                                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!lottieUrl) return;
                                            try {
                                                let response = await fetch(lottieUrl);
                                                if (!response.ok) {
                                                    // Try proxy as fallback
                                                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(lottieUrl)}`;
                                                    const proxyRes = await fetch(proxyUrl);
                                                    const data = await proxyRes.json();
                                                    if (data.contents) {
                                                        handleContentUpdate('lottieJson', data.contents);
                                                        handleContentUpdate('lottieUrl', '');
                                                        setInputMode('json');
                                                        return;
                                                    }
                                                    throw new Error("Failed to fetch");
                                                }
                                                const json = await response.text();
                                                handleContentUpdate('lottieJson', json);
                                                handleContentUpdate('lottieUrl', '');
                                                setInputMode('json');
                                            } catch (e) {
                                                alert("Could not fetch Lottie JSON. The server might be blocking access. Try downloading the file and pasting its content in 'JSON Data' mode.");
                                            }
                                        }}
                                        className="px-3 py-2 text-xs bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100 font-medium whitespace-nowrap"
                                    >
                                        Fetch & Embed
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-400 italic">
                                    Tip: Use 'Fetch & Embed' if the animation doesn't show up due to CORS.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="relative flex-1">
                                    <textarea
                                        value={lottieJson}
                                        onChange={(e) => {
                                            handleContentUpdate('lottieJson', e.target.value);
                                            handleContentUpdate('lottieUrl', ''); // Clear url when json is set
                                        }}
                                        placeholder='Paste Lottie JSON here...'
                                        className="w-full p-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 transition-colors font-mono min-h-[100px] resize-y"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- PLAYBACK TAB --- */}
                <TabsContent value="playback" className="space-y-5 animate-in fade-in-50 duration-300">
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Play size={14} className="text-gray-500" />
                                <Label className="mb-0">AutoPlay</Label>
                            </div>
                            <Switch
                                checked={layer.content?.autoPlay ?? true}
                                onCheckedChange={(c) => handleContentUpdate('autoPlay', c)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Repeat size={14} className="text-gray-500" />
                                <Label className="mb-0">Loop</Label>
                            </div>
                            <Switch
                                checked={layer.content?.loop ?? true}
                                onCheckedChange={(c) => handleContentUpdate('loop', c)}
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Playback Speed</span>
                                <span>{layer.content?.speed ?? 1}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={layer.content?.speed ?? 1}
                                onChange={(e) => handleContentUpdate('speed', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>0.1x</span>
                                <span>1x</span>
                                <span>3x</span>
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
                                    <span className="text-gray-400">{layer.style?.filter?.[control.key] ?? control.def}{control.unit}</span>
                                </div>
                                <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    value={layer.style?.filter?.[control.key] ?? control.def}
                                    onChange={(e) => {
                                        const currentFilter = layer.style?.filter || {};
                                        onStyleUpdate('filter', { ...currentFilter, [control.key]: parseFloat(e.target.value) });
                                    }}
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
                        showPosition={false}
                        showPadding={false}
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
