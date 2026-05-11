import React, { useState, useEffect, useCallback } from 'react';
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
    Loader2,
    ChevronDown,
    ToggleLeft,
    Hash,
    Zap,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

// Helper components (same as LottieEditor)
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

interface RiveEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

// Rive input type constants (from @rive-app/canvas runtime)
type RiveInputType = 'bool' | 'number' | 'trigger';

interface DiscoveredInput {
    name: string;
    type: RiveInputType;
}

interface RiveMetadata {
    artboards: string[];
    stateMachines: string[];
    inputs: DiscoveredInput[];
    loading: boolean;
    error: string | null;
}

export const RiveEditor: React.FC<RiveEditorProps> = ({
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
    const riveUrl = layer?.content?.riveUrl || '';
    const [metadata, setMetadata] = useState<RiveMetadata>({
        artboards: [],
        stateMachines: [],
        inputs: [],
        loading: false,
        error: null,
    });

    // Auto-discover artboards, state machines, inputs from the .riv file
    const discoverMetadata = useCallback(async (url: string) => {
        if (!url.trim()) {
            setMetadata({ artboards: [], stateMachines: [], inputs: [], loading: false, error: null });
            return;
        }

        setMetadata(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Dynamically import Rive to introspect the file
            const { Rive } = await import('@rive-app/canvas');

            // Create a temporary offscreen canvas for introspection
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            canvas.style.display = 'none';
            document.body.appendChild(canvas);

            const rive = new Rive({
                src: url,
                canvas: canvas,
                autoplay: false,
                onLoad: () => {
                    try {
                        const artboards = (rive as any).artboardNames || [];
                        const stateMachines = (rive as any).stateMachineNames || [];

                        // Discover inputs from the active or first state machine
                        const smName = layer?.content?.stateMachineName || stateMachines[0];
                        let inputs: DiscoveredInput[] = [];

                        if (smName) {
                            try {
                                const smInputs = (rive as any).stateMachineInputs(smName) || [];
                                inputs = smInputs.map((input: any) => {
                                    let type: RiveInputType = 'number';
                                    // Rive input types: 56 = bool, 57 = number, 58 = trigger
                                    if (input.type === 56) type = 'bool';
                                    else if (input.type === 58) type = 'trigger';
                                    return { name: input.name, type };
                                });
                            } catch (e) {
                                // State machine may not have inputs
                            }
                        }

                        setMetadata({
                            artboards,
                            stateMachines,
                            inputs,
                            loading: false,
                            error: null,
                        });
                    } catch (e) {
                        setMetadata(prev => ({ ...prev, loading: false, error: 'Failed to read .riv metadata' }));
                    }

                    // Clean up
                    rive.cleanup();
                    canvas.remove();
                },
                onLoadError: () => {
                    setMetadata(prev => ({ ...prev, loading: false, error: 'Failed to load .riv file' }));
                    canvas.remove();
                },
            });
        } catch (e) {
            setMetadata(prev => ({ ...prev, loading: false, error: 'Rive runtime error' }));
        }
    }, [layer?.content?.stateMachineName]);

    // Trigger discovery when URL changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (riveUrl) discoverMetadata(riveUrl);
        }, 500); // Debounce
        return () => clearTimeout(timer);
    }, [riveUrl, discoverMetadata]);

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
                        {/* Header */}
                        <div className="relative w-full h-[100px] bg-violet-50/50 rounded-lg overflow-hidden border border-violet-100/50 mb-4 flex flex-col items-center justify-center gap-2 text-center p-4">
                            <div className="p-2 bg-violet-100 rounded-full">
                                <PlaySquare className="w-6 h-6 text-violet-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-700">Rive Animation</h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                    Paste a .riv file URL — artboards & inputs auto-discover.
                                </p>
                            </div>
                        </div>

                        {/* URL Input */}
                        <Label>Animation URL</Label>
                        <div className="flex gap-2 items-center mb-4">
                            <div className="relative flex-1">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={riveUrl}
                                    onChange={(e) => handleContentUpdate('riveUrl', e.target.value)}
                                    placeholder="https://cdn.rive.app/example.riv"
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>
                            {metadata.loading && <Loader2 size={16} className="animate-spin text-violet-400" />}
                        </div>

                        {metadata.error && (
                            <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md mb-3">{metadata.error}</div>
                        )}

                        {/* Auto-discovered Artboard selector */}
                        {metadata.artboards.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                                <Label>Artboard</Label>
                                <div className="relative">
                                    <select
                                        value={layer.content?.artboardName || ''}
                                        onChange={(e) => handleContentUpdate('artboardName', e.target.value || undefined)}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-violet-500 appearance-none bg-white pr-8"
                                    >
                                        <option value="">Default (first)</option>
                                        {metadata.artboards.map((ab) => (
                                            <option key={ab} value={ab}>{ab}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Auto-discovered State Machine selector */}
                        {metadata.stateMachines.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                                <Label>State Machine</Label>
                                <div className="relative">
                                    <select
                                        value={layer.content?.stateMachineName || ''}
                                        onChange={(e) => {
                                            handleContentUpdate('stateMachineName', e.target.value || undefined);
                                            // Re-discover inputs when state machine changes
                                            setTimeout(() => discoverMetadata(riveUrl), 100);
                                        }}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-violet-500 appearance-none bg-white pr-8"
                                    >
                                        <option value="">Default (first)</option>
                                        {metadata.stateMachines.map((sm) => (
                                            <option key={sm} value={sm}>{sm}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Auto-discovered Inputs */}
                        {metadata.inputs.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-gray-100">
                                <Label>State Machine Inputs</Label>
                                <div className="space-y-2">
                                    {metadata.inputs.map((input) => {
                                        const currentInputs = layer.content?.riveInputs || {};
                                        const currentValue = currentInputs[input.name];

                                        if (input.type === 'bool') {
                                            return (
                                                <div key={input.name} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <ToggleLeft size={12} className="text-violet-400" />
                                                        <span className="text-xs text-gray-700">{input.name}</span>
                                                    </div>
                                                    <Switch
                                                        checked={currentValue as boolean ?? false}
                                                        onCheckedChange={(c) => handleContentUpdate('riveInputs', { ...currentInputs, [input.name]: c })}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (input.type === 'number') {
                                            return (
                                                <div key={input.name} className="bg-gray-50 px-3 py-2 rounded-md space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Hash size={12} className="text-violet-400" />
                                                            <span className="text-xs text-gray-700">{input.name}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{currentValue ?? 0}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={(currentValue as number) ?? 0}
                                                        onChange={(e) => handleContentUpdate('riveInputs', { ...currentInputs, [input.name]: parseFloat(e.target.value) })}
                                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                                    />
                                                </div>
                                            );
                                        }

                                        if (input.type === 'trigger') {
                                            return (
                                                <div key={input.name} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <Zap size={12} className="text-amber-400" />
                                                        <span className="text-xs text-gray-700">{input.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 italic">trigger (runtime only)</span>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* --- PLAYBACK TAB (identical to Lottie) --- */}
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
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>0.1x</span>
                                <span>1x</span>
                                <span>3x</span>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- ADJUSTMENTS TAB (identical to Lottie) --- */}
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
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* --- LAYOUT TAB (identical to Lottie) --- */}
                <TabsContent value="layout" className="space-y-5 animate-in fade-in-50 duration-300">
                    <div className="space-y-2">
                        <Label>Fill Mode</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['cover', 'contain', 'fill'].map((fit) => (
                                <button
                                    key={fit}
                                    onClick={() => onStyleUpdate('objectFit', fit)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-md border text-xs gap-1 transition-all ${layer.style?.objectFit === fit
                                        ? 'bg-violet-50 border-violet-200 text-violet-700'
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

                    <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <div className="flex flex-wrap gap-2">
                            <AspectRatioButton label="Free" ratio={undefined} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', undefined)} />
                            <AspectRatioButton label="1:1" ratio={1} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 1)} />
                            <AspectRatioButton label="4:3" ratio={4 / 3} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 4 / 3)} />
                            <AspectRatioButton label="16:9" ratio={16 / 9} current={layer.style?.aspectRatio} onClick={() => onStyleUpdate('aspectRatio', 16 / 9)} />
                        </div>
                    </div>

                    <SizeControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        colors={colors}
                    />
                </TabsContent>

                {/* --- STYLE TAB (identical to Lottie) --- */}
                <TabsContent value="style" className="space-y-5 animate-in fade-in-50 duration-300">
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
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                    </div>

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
                            const match = layer.style.boxShadow.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(.*)/);
                            const defaults = { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)' };
                            const current: any = match ? {
                                x: parseFloat(match[1]), y: parseFloat(match[2]),
                                blur: parseFloat(match[3]), spread: parseFloat(match[4]), color: match[5]
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
                                            <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: current.color }} />
                                            <input type="text" value={current.color} onChange={(e) => updateShadow('color', e.target.value)}
                                                className="w-32 text-xs border border-gray-200 rounded px-1.5 py-0.5" />
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
                                                <span>{s.label}</span><span>{current[s.key]}px</span>
                                            </div>
                                            <input type="range" min={s.min} max={s.max} value={current[s.key]}
                                                onChange={(e) => updateShadow(s.key, parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500" />
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
