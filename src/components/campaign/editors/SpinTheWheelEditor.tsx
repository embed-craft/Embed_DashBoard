import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Gamepad2,
    Maximize2,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    X,
    Palette,
    Settings2,
    Layers,
    PartyPopper,
    Zap,
} from 'lucide-react';
import { AssetPickerDialog } from '@/components/shared/AssetPickerDialog';

// Colors for palette picker (Same as Floater)
const PALETTE = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#b8f33f', '#FF6B6B', '#4ECDC4',
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const SpinTheWheelEditor = () => {
    const {
        currentCampaign,
        activeInterfaceId,
        activeStoryId,
        updateLayer,
        updateLayerContent,
        updateLayerStyle,
        updateSpinTheWheelConfig,
    } = useEditorStore();
    const { rewards } = useStore();

    // selectedLayerId lives inside currentCampaign, NOT at store root
    const selectedLayerId = currentCampaign?.selectedLayerId || null;

    // Find layer across all contexts: active story > active interface > main campaign
    const activeInterface = activeInterfaceId
        ? currentCampaign?.interfaces?.find((i: any) => i.id === activeInterfaceId)
        : null;
    const activeStory = activeStoryId
        ? currentCampaign?.stories?.find((s: any) => s.id === activeStoryId)
        : null;
    const allLayers = activeStory?.layers || activeInterface?.layers || currentCampaign?.layers || [];
    const layer = allLayers.find((l: any) => l.id === selectedLayerId);

    // ─── State (MUST be before any conditional return — React Rules of Hooks) ───
    const [assetTarget, setAssetTarget] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [wheelUrlMode, setWheelUrlMode] = useState(false);
    const [pointerUrlMode, setPointerUrlMode] = useState(false);
    const [spinButtonUrlMode, setSpinButtonUrlMode] = useState(false);
    const [confettiUrlMode, setConfettiUrlMode] = useState(false);
    const [sectionUrlMode, setSectionUrlMode] = useState<Record<string, boolean>>({});

    // ─── Guard ─────────────────────────────────────────────────────────────────
    if (!layer || layer.type !== 'spinthewheel') return null;

    const content = layer.content;
    const style = layer.style;
    const sections = currentCampaign?.spinTheWheelConfig?.sections || [];

    // ─── Helpers ────────────────────────────────────────────────────────────────
    const updateContent = (updates: Record<string, any>) => updateLayerContent(layer.id, updates);
    const updateStyle = (updates: Record<string, any>) => updateLayerStyle(layer.id, updates);

    const handleToggleChild = (childName: string, visible: boolean) => {
        const childIds = layer.children || [];
        for (const childId of childIds) {
            const cl = allLayers.find((l: any) => l.id === childId);
            if (cl && cl.name === childName) updateLayer(childId, { visible });
        }
    };

    const handleAssetSelect = (assetUrl: string, _asset?: any) => {
        if (!assetTarget || !assetUrl) return;
        if (assetTarget === 'wheel') updateContent({ wheelImage: assetUrl });
        else if (assetTarget === 'pointer') updateContent({ pointerImage: assetUrl });
        else if (assetTarget === 'spinButton') updateContent({ spinButtonImage: assetUrl });
        else if (assetTarget === 'confetti') updateContent({ confettiImage: assetUrl });
        else if (assetTarget.startsWith('section_')) {
            const sectionId = assetTarget.replace('section_', '');
            const newSections = sections.map((s: any) =>
                s.id === sectionId ? { ...s, image: assetUrl } : s
            );
            updateSpinTheWheelConfig({ sections: newSections });
        }
        setAssetTarget(null);
    };

    const toggleSection = (id: string) =>
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

    const getRewardName = (rewardId: string) => {
        const r = rewards?.find((rw: any) => rw.id === rewardId);
        return r ? r.name : 'Not assigned';
    };

    return (
        <div className="p-1 pb-20 space-y-4 font-sans text-gray-900">
            {/* Header — same as FloaterMinimalEditor */}
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <Gamepad2 className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold">Spin The Wheel</h3>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general"><Settings2 className="w-3.5 h-3.5 mr-1.5" /> General</TabsTrigger>
                    <TabsTrigger value="sections"><Layers className="w-3.5 h-3.5 mr-1.5" /> Sections</TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="w-3.5 h-3.5 mr-1.5" /> Style</TabsTrigger>
                </TabsList>

                {/* ═══════════════ GENERAL TAB ═══════════════ */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50">

                    {/* ─── Size ──────────────────────────────── */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Dimensions</Label>

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
                                            value={String(style.width).replace(/[^\d.]/g, '') || '320'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const isPercent = String(style.width).includes('%');
                                                const cleanVal = val === '' ? 0 : Number(val);
                                                updateStyle({ width: isPercent ? `${cleanVal}%` : cleanVal });
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const isPercent = String(style.width).includes('%');
                                            const val = parseInt(String(style.width).replace(/[^\d.]/g, '') || '0');
                                            if (isPercent) {
                                                updateStyle({ width: val });
                                            } else {
                                                updateStyle({ width: `${Math.min(val, 100)}%` });
                                            }
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(style.width).includes('%') ? '%' : 'px'}
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
                                            value={String(style.height).replace(/[^\d.]/g, '') || '800'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const isPercent = String(style.height).includes('%');
                                                const cleanVal = val === '' ? 0 : Number(val);
                                                updateStyle({ height: isPercent ? `${cleanVal}%` : cleanVal });
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const isPercent = String(style.height).includes('%');
                                            const val = parseInt(String(style.height).replace(/[^\d.]/g, '') || '0');
                                            if (isPercent) {
                                                updateStyle({ height: val });
                                            } else {
                                                updateStyle({ height: `${Math.min(val, 100)}%` });
                                            }
                                        }}
                                        className="px-2 h-8 text-[10px] font-medium bg-gray-100 rounded border hover:bg-gray-200 w-10 shrink-0"
                                    >
                                        {String(style.height).includes('%') ? '%' : 'px'}
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
                                            const widthVal = parseInt(String(style.width).replace(/[^\d.]/g, '') || '320');
                                            const isPercent = String(style.width).includes('%');
                                            if (isPercent) return;
                                            const [w, h] = ratio.split(':').map(Number);
                                            const newHeight = Math.round(widthVal * (h / w));
                                            updateStyle({ height: newHeight });
                                        }}
                                        className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-200 transition-colors"
                                        title={`Apply ${ratio} ratio based on Width`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>


                    </div>

                    <Separator />

                    {/* ─── Game Settings ────────────────────────────────── */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Game Settings</Label>

                        {/* Max Attempts */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Max Attempts</Label>
                            <Input
                                type="number"
                                className="h-8 text-xs"
                                min={1}
                                value={content.maxAttempts ?? 50}
                                onChange={(e) => updateContent({ maxAttempts: parseInt(e.target.value) || 1 })}
                            />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Show Spin Counter</Label>
                                <Switch
                                    checked={content.showSpinCounter ?? false}
                                    onCheckedChange={(c) => updateContent({ showSpinCounter: c })}
                                />
                            </div>
                        </div>

                        {/* Wheel Scale */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-gray-500 mb-0">Wheel Scale</Label>
                                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                    {Math.round((content.wheelScale ?? 1.0) * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.3"
                                max="3"
                                step="0.05"
                                value={content.wheelScale ?? 1.0}
                                onChange={(e) => updateContent({ wheelScale: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[9px] text-gray-400">
                                <span>30%</span>
                                <span>100%</span>
                                <span>300%</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Wheel Image */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Wheel Image</Label>
                            {content.wheelImage ? (
                                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                        <img src={content.wheelImage} alt="" className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 truncate">{content.wheelImage.split('/').pop()}</p>
                                    </div>
                                    <button onClick={() => updateContent({ wheelImage: '' })} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            ) : null}
                            <div className="flex gap-2 mt-1.5">
                                <button
                                    onClick={() => setAssetTarget('wheel')}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                >
                                    <ImageIcon size={14} />
                                    {content.wheelImage ? 'Replace' : 'Choose asset'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Switch checked={wheelUrlMode} onCheckedChange={setWheelUrlMode} className="scale-75" />
                                <span className="text-[10px] text-gray-500">Add URL</span>
                            </div>
                            {wheelUrlMode && (
                                <>
                                    <Input placeholder="https://..." className={`h-7 text-xs mt-1 ${content.wheelImage && content.wheelImage.includes(' ') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={content.wheelImage || ''} onChange={(e) => updateContent({ wheelImage: e.target.value })} />
                                    {content.wheelImage && content.wheelImage.includes(' ') && (
                                        <p className="text-[10px] text-red-500 font-medium">URL cannot contain spaces</p>
                                    )}
                                </>
                            )}
                            {content.wheelImage && (
                                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mt-2 leading-relaxed">
                                    ⚠️ Custom wheel image overrides section colors. Ensure the image sections match the <strong>section count ({sections.length || 0})</strong> in the Rewards tab.
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Pointer Image */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Pointer Image</Label>
                            {content.pointerImage ? (
                                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                        <img src={content.pointerImage} alt="" className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 truncate">{content.pointerImage.split('/').pop()}</p>
                                    </div>
                                    <button onClick={() => updateContent({ pointerImage: '' })} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            ) : null}
                            <div className="flex gap-2 mt-1.5">
                                <button
                                    onClick={() => setAssetTarget('pointer')}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                >
                                    <ImageIcon size={14} />
                                    {content.pointerImage ? 'Replace' : 'Choose asset'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Switch checked={pointerUrlMode} onCheckedChange={setPointerUrlMode} className="scale-75" />
                                <span className="text-[10px] text-gray-500">Add URL</span>
                            </div>
                            {pointerUrlMode && (
                                <>
                                    <Input placeholder="https://..." className={`h-7 text-xs mt-1 ${content.pointerImage && content.pointerImage.includes(' ') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={content.pointerImage || ''} onChange={(e) => updateContent({ pointerImage: e.target.value })} />
                                    {content.pointerImage && content.pointerImage.includes(' ') && (
                                        <p className="text-[10px] text-red-500 font-medium">URL cannot contain spaces</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Pointer Offset */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500">Pointer Offset X</Label>
                                <Input type="number" className="h-7 text-xs" value={content.pointerOffsetX ?? 0}
                                    onChange={(e) => updateContent({ pointerOffsetX: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500">Pointer Offset Y</Label>
                                <Input type="number" className="h-7 text-xs" value={content.pointerOffsetY ?? 0}
                                    onChange={(e) => updateContent({ pointerOffsetY: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <Separator />

                        {/* Spin Button Image */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Spin Button Image</Label>
                            {content.spinButtonImage ? (
                                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                        <img src={content.spinButtonImage} alt="" className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 truncate">{content.spinButtonImage.split('/').pop()}</p>
                                    </div>
                                    <button onClick={() => updateContent({ spinButtonImage: '' })} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                            ) : null}
                            <div className="flex gap-2 mt-1.5">
                                <button
                                    onClick={() => setAssetTarget('spinButton')}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                >
                                    <ImageIcon size={14} />
                                    {content.spinButtonImage ? 'Replace' : 'Choose asset'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Switch checked={spinButtonUrlMode} onCheckedChange={setSpinButtonUrlMode} className="scale-75" />
                                <span className="text-[10px] text-gray-500">Add URL</span>
                            </div>
                            {spinButtonUrlMode && (
                                <>
                                    <Input placeholder="https://..." className={`h-7 text-xs mt-1 ${content.spinButtonImage && content.spinButtonImage.includes(' ') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        value={content.spinButtonImage || ''} onChange={(e) => updateContent({ spinButtonImage: e.target.value })} />
                                    {content.spinButtonImage && content.spinButtonImage.includes(' ') && (
                                        <p className="text-[10px] text-red-500 font-medium">URL cannot contain spaces</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Spin Button Offset */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500">Button Offset X</Label>
                                <Input type="number" className="h-7 text-xs" value={content.spinButtonOffsetX ?? 0}
                                    onChange={(e) => updateContent({ spinButtonOffsetX: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500">Button Offset Y</Label>
                                <Input type="number" className="h-7 text-xs" value={content.spinButtonOffsetY ?? 0}
                                    onChange={(e) => updateContent({ spinButtonOffsetY: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>

                        <Separator />

                        {/* Screen Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Show Congrats Screen</Label>
                                <Switch
                                    checked={content.showCongratsScreen ?? true}
                                    onCheckedChange={(c) => {
                                        updateContent({ showCongratsScreen: c });
                                        handleToggleChild('Congrats Screen', c);
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-gray-600">Show Better Luck Next Time</Label>
                                <Switch
                                    checked={content.showBetterLuckScreen ?? true}
                                    onCheckedChange={(c) => {
                                        updateContent({ showBetterLuckScreen: c });
                                        handleToggleChild('Better Luck Next Time', c);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ─── Confetti Properties ─────────────────────────── */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Confetti</Label>

                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-600">Add Confetti</Label>
                            <Switch
                                checked={content.addConfetti ?? true}
                                onCheckedChange={(c) => updateContent({ addConfetti: c })}
                            />
                        </div>

                        {content.addConfetti !== false && (
                            <>
                                {/* Confetti Asset */}
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Confetti Image</Label>
                                    {content.confettiImage ? (
                                        <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                                            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                <img src={content.confettiImage} alt="" className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 truncate">{content.confettiImage.split('/').pop()}</p>
                                            </div>
                                            <button onClick={() => updateContent({ confettiImage: '' })} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ) : null}
                                    <div className="flex gap-2 mt-1.5">
                                        <button
                                            onClick={() => setAssetTarget('confetti')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                        >
                                            <ImageIcon size={14} />
                                            {content.confettiImage ? 'Replace' : 'Choose asset'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Switch checked={confettiUrlMode} onCheckedChange={setConfettiUrlMode} className="scale-75" />
                                        <span className="text-[10px] text-gray-500">Add URL</span>
                                    </div>
                                    {confettiUrlMode && (
                                        <>
                                            <Input placeholder="https://..." className={`h-7 text-xs mt-1 ${content.confettiImage && content.confettiImage.includes(' ') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                value={content.confettiImage || ''} onChange={(e) => updateContent({ confettiImage: e.target.value })} />
                                            {content.confettiImage && content.confettiImage.includes(' ') && (
                                                <p className="text-[10px] text-red-500 font-medium">URL cannot contain spaces</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Object Fit */}
                                <div>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">Object Fit</Label>
                                    <Select value={content.confettiObjectFit || 'cover'} onValueChange={(val) => updateContent({ confettiObjectFit: val })}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover</SelectItem>
                                            <SelectItem value="contain">Contain</SelectItem>
                                            <SelectItem value="fill">Fill</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>

                </TabsContent>

                {/* ═══════════════ SECTIONS TAB ═══════════════ */}
                <TabsContent value="sections" className="space-y-5 animate-in fade-in-50">
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Wheel Sections</Label>
                        <p className="text-[10px] text-gray-400">Section rewards & weights are configured in the Rewards tab. Edit names, images, and colors here.</p>

                        {sections.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-gray-200 rounded-lg">
                                <Layers className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                <p className="text-xs font-medium text-gray-500">No sections yet</p>
                                <p className="text-[10px] text-gray-400 mt-1">Add sections in the <span className="text-indigo-500 font-medium">Rewards</span> tab first</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sections.map((sec: any, idx: number) => {
                                    const isExpanded = expandedSections[sec.id] ?? (idx === 0);
                                    return (
                                        <div key={sec.id} className="border rounded-lg bg-white overflow-hidden">
                                            {/* Section Header */}
                                            <button
                                                type="button"
                                                onClick={() => toggleSection(sec.id)}
                                                className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: sec.color || '#b8f33f' }} />
                                                    <span className="text-xs font-medium text-gray-800">
                                                        {sec.name || `Section ${idx + 1}`}
                                                    </span>
                                                </div>
                                                {isExpanded
                                                    ? <ChevronDown size={14} className="text-gray-400" />
                                                    : <ChevronRight size={14} className="text-gray-400" />
                                                }
                                            </button>

                                            {isExpanded && (
                                                <div className="px-3 pb-3 border-t border-gray-100 space-y-3 pt-3">
                                                    {/* Section Name (Editable) */}
                                                    <div>
                                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Section Name</Label>
                                                        <Input
                                                            className="h-8 text-xs"
                                                            value={sec.name}
                                                            onChange={(e) => {
                                                                const newSections = sections.map((s: any) =>
                                                                    s.id === sec.id ? { ...s, name: e.target.value } : s
                                                                );
                                                                updateSpinTheWheelConfig({ sections: newSections });
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Section Image (Editable) */}
                                                    <div>
                                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Section Image</Label>
                                                        {sec.image ? (
                                                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                                                <div className="w-8 h-8 rounded bg-gray-100 border overflow-hidden shrink-0">
                                                                    <img src={sec.image} alt="" className="w-full h-full object-cover"
                                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[9px] text-gray-500 truncate">{sec.image.split('/').pop()}</p>
                                                                </div>
                                                                <button onClick={() => {
                                                                    const newSections = sections.map((s: any) =>
                                                                        s.id === sec.id ? { ...s, image: '' } : s
                                                                    );
                                                                    updateSpinTheWheelConfig({ sections: newSections });
                                                                }} className="p-0.5 text-gray-400 hover:text-red-500"><X size={12} /></button>
                                                            </div>
                                                        ) : null}
                                                        <button
                                                            onClick={() => setAssetTarget(`section_${sec.id}`)}
                                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 mt-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                                                        >
                                                            <ImageIcon size={12} />
                                                            {sec.image ? 'Replace' : 'Choose asset'}
                                                        </button>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Switch checked={sectionUrlMode[sec.id] || false}
                                                                onCheckedChange={(v) => setSectionUrlMode(prev => ({ ...prev, [sec.id]: v }))}
                                                                className="scale-75" />
                                                            <span className="text-[10px] text-gray-500">Add URL</span>
                                                        </div>
                                                        {sectionUrlMode[sec.id] && (
                                                            <>
                                                                <Input placeholder="https://..." className={`h-7 text-xs mt-1 ${sec.image && sec.image.includes(' ') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                                    value={sec.image || ''} onChange={(e) => {
                                                                        const newSections = sections.map((s: any) =>
                                                                            s.id === sec.id ? { ...s, image: e.target.value } : s
                                                                        );
                                                                        updateSpinTheWheelConfig({ sections: newSections });
                                                                    }}
                                                                />
                                                                {sec.image && sec.image.includes(' ') && (
                                                                    <p className="text-[10px] text-red-500 font-medium">URL cannot contain spaces</p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Section Color (Editable) */}
                                                    <div>
                                                        <Label className="text-[10px] text-gray-500 mb-1.5 block">Section Color</Label>
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                                                                value={sec.color || '#b8f33f'}
                                                                onChange={(e) => {
                                                                    const newSections = sections.map((s: any) =>
                                                                        s.id === sec.id ? { ...s, color: e.target.value } : s
                                                                    );
                                                                    updateSpinTheWheelConfig({ sections: newSections });
                                                                }}
                                                            />
                                                            <Input
                                                                className="h-8 text-xs flex-1 font-mono"
                                                                value={sec.color || '#b8f33f'}
                                                                onChange={(e) => {
                                                                    const newSections = sections.map((s: any) =>
                                                                        s.id === sec.id ? { ...s, color: e.target.value } : s
                                                                    );
                                                                    updateSpinTheWheelConfig({ sections: newSections });
                                                                }}
                                                            />
                                                        </div>
                                                        {/* Quick palette */}
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {PALETTE.slice(0, 12).map(c => (
                                                                <button
                                                                    key={c}
                                                                    onClick={() => {
                                                                        const newSections = sections.map((s: any) =>
                                                                            s.id === sec.id ? { ...s, color: c } : s
                                                                        );
                                                                        updateSpinTheWheelConfig({ sections: newSections });
                                                                    }}
                                                                    className={`w-5 h-5 rounded border transition-all ${sec.color === c ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-gray-200 hover:scale-110'}`}
                                                                    style={{ backgroundColor: c }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    {/* Read-Only Fields */}
                                                    <div className="space-y-2 p-2 bg-gray-50 rounded border text-xs">
                                                        <Label className="text-[10px] text-gray-400 font-medium">Synced from Rewards tab</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] text-gray-400">Reward</Label>
                                                                <div className="h-7 text-[10px] flex items-center px-2 rounded bg-white border border-gray-200 text-gray-500 truncate">
                                                                    {getRewardName(sec.rewardId)}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[9px] text-gray-400">Quantity</Label>
                                                                <div className="h-7 text-[10px] flex items-center px-2 rounded bg-white border border-gray-200 text-gray-500">
                                                                    {sec.quantity ?? 1}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] text-gray-400">Weight</Label>
                                                            <div className="h-7 text-[10px] flex items-center px-2 rounded bg-white border border-gray-200 text-gray-500 w-1/2">
                                                                {sec.weight ?? 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ═══════════════ STYLE TAB ═══════════════ */}
                <TabsContent value="appearance" className="space-y-5 animate-in fade-in-50">

                    {/* ─── Colors ───────────────────────────────────────── */}
                    <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                        <Label className="text-xs font-semibold text-gray-700">Colors</Label>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { label: 'Primary Color', key: 'primaryColor', def: '#ffffff' },
                                { label: 'Accent Color', key: 'accentColor', def: '#000000' },
                                { label: 'Text Color', key: 'textColor', def: '#000000' },
                            ].map(({ label, key, def }) => (
                                <div key={key}>
                                    <Label className="text-[10px] text-gray-500 mb-1.5 block">{label}</Label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                                            value={(content as any)[key] || def}
                                            onChange={(e) => updateContent({ [key]: e.target.value })}
                                        />
                                        <Input
                                            className="h-8 text-xs flex-1 font-mono"
                                            value={(content as any)[key] || def}
                                            onChange={(e) => updateContent({ [key]: e.target.value })}
                                        />
                                    </div>
                                    {/* Quick palette */}
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {PALETTE.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => updateContent({ [key]: c })}
                                                className={`w-5 h-5 rounded border transition-all ${(content as any)[key] === c ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-gray-200 hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* ─── Appearance ───────────────────────────────────── */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Appearance</Label>

                        {/* Corner Radius */}
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1.5 block">Corner Radius</Label>
                            <Input
                                type="number"
                                className="h-8 text-xs"
                                min={0}
                                value={typeof style.borderRadius === 'number' ? style.borderRadius : 0}
                                onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Border Properties — 3 col like Floater */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Border W</Label>
                                <Input
                                    type="number"
                                    className="h-8 text-xs"
                                    value={typeof style.borderWidth === 'number' ? style.borderWidth : 0}
                                    onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0, borderStyle: 'solid' })}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1.5 block">Style</Label>
                                <Select value={style.borderStyle || 'solid'} onValueChange={(val) => updateStyle({ borderStyle: val })}>
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
                                        value={style.borderColor || '#000000'}
                                        onChange={(e) => updateStyle({ borderColor: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ─── Background ───────────────────────────────────── */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Background</Label>

                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-600">Add Background</Label>
                            <Switch
                                checked={!!style.backgroundColor && style.backgroundColor !== 'transparent'}
                                onCheckedChange={(c) => {
                                    if (c) updateStyle({ backgroundColor: '#ffffff' });
                                    else updateStyle({ backgroundColor: 'transparent' });
                                }}
                            />
                        </div>

                        {style.backgroundColor && style.backgroundColor !== 'transparent' && (
                            <div className={`flex flex-wrap gap-2`}>
                                {PALETTE.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => updateStyle({ backgroundColor: c })}
                                        className={`w-6 h-6 rounded border transition-all ${style.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-1' : 'border-gray-200 hover:scale-110'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <div className="w-full flex items-center gap-2 mt-1">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                                        value={style.backgroundColor || '#ffffff'}
                                        onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                                    />
                                    <Input
                                        className="h-8 text-xs flex-1 font-mono"
                                        value={style.backgroundColor || '#ffffff'}
                                        onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* ─── Spacing ──────────────────────────────────────── */}
                    <div className="space-y-4">
                        <Label className="text-xs font-semibold text-gray-700">Spacing</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { k: 'marginTop', l: 'Margin Top' },
                                { k: 'marginBottom', l: 'Margin Bottom' },
                                { k: 'marginLeft', l: 'Margin Left' },
                                { k: 'marginRight', l: 'Margin Right' },
                            ].map(({ k, l }) => (
                                <div key={k}>
                                    <Label className="text-[10px] text-gray-500 mb-1">{l}</Label>
                                    <Input
                                        type="number"
                                        className="h-8 text-xs"
                                        value={(style as any)[k] ?? 0}
                                        onChange={(e) => updateStyle({ [k]: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </TabsContent>
            </Tabs>

            {/* ─── Asset Picker Dialog ────────────────────────────────────── */}
            <AssetPickerDialog
                isOpen={!!assetTarget}
                onClose={() => setAssetTarget(null)}
                onSelect={(assetUrl, asset) => handleAssetSelect(assetUrl, asset)}
                accept="image"
            />
        </div>
    );
};
