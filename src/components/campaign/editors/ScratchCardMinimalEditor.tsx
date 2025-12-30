import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
    Sparkles,
    Palette,
    Gift,
    Layers,
    Type,
    Image as ImageIcon,
    MousePointerClick,
    MonitorPlay,
    Move,
    Maximize,
    Eraser,
    CheckCircle2
} from 'lucide-react';

const colors = {
    primary: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937' },
    white: '#ffffff',
    text: { primary: '#111827', secondary: '#4b5563' }
};

export const ScratchCardMinimalEditor = () => {
    // Access Store
    const {
        currentCampaign,
        updateScratchCardConfig,
        updateLayerStyle,
        updateLayer,
        addLayer
    } = useEditorStore();

    const config = currentCampaign?.scratchCardConfig;

    // View State: 'foil' (Scratch Surface) vs 'prize' (Reveal Layers)
    // We default based on the current preview state
    const [activeTab, setActiveTab] = useState<'foil' | 'prize'>(config?.previewRevealed ? 'prize' : 'foil');

    // Defaults / Migration
    useEffect(() => {
        if (!config) {
            updateScratchCardConfig({
                width: 320, height: 480, borderRadius: 16,
                coverType: 'color', coverColor: '#CCCCCC',
                scratchSize: 40, revealThreshold: 50, autoReveal: true,
                completionAnimation: { enabled: false, type: 'confetti' },
                overlay: { enabled: true, opacity: 0.5, color: '#000000', dismissOnClick: true },
                position: 'center'
            });
        }
    }, [config, updateScratchCardConfig]);

    if (!config) return null;

    // --- Helpers ---
    const updateConfig = (key: string, value: any) => updateScratchCardConfig({ [key]: value });
    const updateNested = (parent: string, key: string, value: any) => {
        // @ts-ignore
        const parentObj = config[parent] || {};
        updateScratchCardConfig({ [parent]: { ...parentObj, [key]: value } });
    };

    // Sync Tab Switch with Preview Mode
    const handleTabChange = (mode: 'foil' | 'prize') => {
        setActiveTab(mode);
        // Automatically toggle the preview so user sees what they are editing
        updateConfig('previewRevealed', mode === 'prize');
    };

    // Handle adding layers (Prize Content)
    const handleAddLayer = (type: 'text' | 'media' | 'button') => {
        const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.parent === null);
        if (rootLayer) {
            addLayer(type, rootLayer.id);
            // Ensure we show the prize
            if (activeTab !== 'prize') handleTabChange('prize');
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* --- 1. Header & Global Settings (The Shell) --- */}
            <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} className="text-indigo-600" />
                    Scratch Card Setup
                </h4>

                {/* Global Positioning & Size */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Position Mode */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>Card Position</label>
                        <select
                            value={config.position || 'center'}
                            onChange={(e) => updateConfig('position', e.target.value)}
                            style={{
                                width: '100%', padding: '8px', borderRadius: '6px',
                                border: `1px solid ${colors.gray[300]}`, fontSize: '13px', color: colors.text.primary
                            }}
                        >
                            <option value="center">Center of Screen</option>
                            <option value="bottom">Bottom Sheet (Bottom-Center)</option>
                            <option value="custom">Custom (Absolute X/Y)</option>
                        </select>
                    </div>

                    {/* Width / Height */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>Width</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={String(config.width).replace('px', '')}
                                onChange={(e) => updateConfig('width', parseInt(e.target.value))}
                                style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '6px', border: `1px solid ${colors.gray[300]}`, fontSize: '13px' }}
                            />
                            <Maximize size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: colors.gray[400] }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>Height</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={String(config.height).replace('px', '')}
                                onChange={(e) => updateConfig('height', parseInt(e.target.value))}
                                style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '6px', border: `1px solid ${colors.gray[300]}`, fontSize: '13px' }}
                            />
                            <Move size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: colors.gray[400] }} />
                        </div>
                    </div>

                    {/* Custom Position Inputs */}
                    {config.position === 'custom' && (
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', padding: '12px', background: colors.gray[50], borderRadius: '8px', border: `1px dashed ${colors.gray[300]}` }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.gray[500] }}>X Offset</label>
                                <input type="number" value={config.x || 0} onChange={e => updateConfig('x', parseInt(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[300]}`, borderRadius: '4px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.gray[500] }}>Y Offset</label>
                                <input type="number" value={config.y || 0} onChange={e => updateConfig('y', parseInt(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[300]}`, borderRadius: '4px' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 2. The Great Divide: Foil vs Prize --- */}
            <div style={{ backgroundColor: colors.gray[50], padding: '4px', borderRadius: '10px', border: `1px solid ${colors.gray[200]}`, display: 'flex' }}>
                <button
                    onClick={() => handleTabChange('foil')}
                    style={{
                        flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: activeTab === 'foil' ? colors.white : 'transparent',
                        color: activeTab === 'foil' ? colors.primary[600] : colors.gray[500],
                        boxShadow: activeTab === 'foil' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        border: activeTab === 'foil' ? `1px solid ${colors.gray[200]}` : 'none'
                    }}
                >
                    <Palette size={16} />
                    Scratch Foil
                </button>
                <button
                    onClick={() => handleTabChange('prize')}
                    style={{
                        flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: activeTab === 'prize' ? colors.white : 'transparent',
                        color: activeTab === 'prize' ? colors.primary[600] : colors.gray[500],
                        boxShadow: activeTab === 'prize' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        border: activeTab === 'prize' ? `1px solid ${colors.gray[200]}` : 'none'
                    }}
                >
                    <Gift size={16} />
                    Reveal Prize
                </button>
            </div>

            {/* --- 3A. FOIL EDITOR --- */}
            {activeTab === 'foil' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>

                    {/* Appearance Card */}
                    <div style={{ border: `1px solid ${colors.gray[200]}`, borderRadius: '12px', padding: '16px' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Before Scratching (Look)</h5>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '8px' }}>Surface Style</label>

                            {/* Color Picker / Input */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden',
                                    border: `1px solid ${colors.gray[300]}`, position: 'relative'
                                }}>
                                    <input
                                        type="color"
                                        value={config.coverColor || '#CCCCCC'}
                                        onChange={e => updateConfig('coverColor', e.target.value)}
                                        style={{ width: '150%', height: '150%', position: 'absolute', top: '-25%', left: '-25%', cursor: 'pointer' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Image URL (Seamless Pattern)"
                                        value={config.coverImage || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Smart Logic: If Image provided, use it. Else toggle back to color.
                                            updateScratchCardConfig({ coverImage: val, coverType: val ? 'image' : 'color' });
                                        }}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.gray[300]}`, fontSize: '13px' }}
                                    />
                                </div>
                            </div>
                            <p style={{ fontSize: '11px', color: colors.gray[500] }}>
                                {config.coverImage ? '✅ Using Image Pattern' : 'ℹ️ Using Solid Color (Paste URL for Image)'}
                            </p>
                        </div>

                        {/* Scratch Area */}
                        <div style={{ paddingTop: '12px', borderTop: `1px solid ${colors.gray[100]}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 500, color: colors.text.primary }}>Scratchable Zone</label>
                                <button
                                    onClick={() => updateConfig('scratchArea', undefined)} // Reset
                                    style={{ fontSize: '10px', color: colors.primary[600], background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Reset to Full
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input type="number" placeholder="W" value={config.scratchArea?.width ?? config.width} onChange={e => updateNested('scratchArea', 'width', parseInt(e.target.value))} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${colors.gray[200]}`, fontSize: '12px' }} />
                                <input type="number" placeholder="H" value={config.scratchArea?.height ?? config.height} onChange={e => updateNested('scratchArea', 'height', parseInt(e.target.value))} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${colors.gray[200]}`, fontSize: '12px' }} />
                            </div>
                        </div>
                    </div>

                    {/* Physics Card */}
                    <div style={{ border: `1px solid ${colors.gray[200]}`, borderRadius: '12px', padding: '16px' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Eraser size={14} />
                            Scratch Physics
                        </h5>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>
                                <span>Brush Size</span>
                                <span>{config.scratchSize || 40}px</span>
                            </label>
                            <input
                                type="range" min="10" max="100"
                                value={config.scratchSize || 40}
                                onChange={(e) => updateConfig('scratchSize', parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>
                                <span>Completion Threshold</span>
                                <span>{config.revealThreshold || 50}%</span>
                            </label>
                            <input
                                type="range" min="10" max="90"
                                value={config.revealThreshold || 50}
                                onChange={(e) => updateConfig('revealThreshold', parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <p style={{ fontSize: '11px', color: colors.gray[400], marginTop: '4px' }}>
                                Card auto-reveals when this much is scratched.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* --- 3B. PRIZE EDITOR --- */}
            {activeTab === 'prize' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>

                    {/* Add Layers Card */}
                    <div style={{ border: `1px solid ${colors.gray[200]}`, borderRadius: '12px', padding: '16px', backgroundColor: colors.primary[50] }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.primary[700], display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={14} />
                            Prize Content Layers
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <button
                                onClick={() => handleAddLayer('text')}
                                style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'white', border: `1px solid ${colors.primary[100]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                            >
                                <Type size={16} color={colors.primary[600]} />
                                <span style={{ fontSize: '11px', fontWeight: 500, color: colors.gray[700] }}>Text</span>
                            </button>
                            <button
                                onClick={() => handleAddLayer('media')}
                                style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'white', border: `1px solid ${colors.primary[100]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                            >
                                <ImageIcon size={16} color={colors.primary[600]} />
                                <span style={{ fontSize: '11px', fontWeight: 500, color: colors.gray[700] }}>Image</span>
                            </button>
                            <button
                                onClick={() => handleAddLayer('button')}
                                style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'white', border: `1px solid ${colors.primary[100]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                            >
                                <MousePointerClick size={16} color={colors.primary[600]} />
                                <span style={{ fontSize: '11px', fontWeight: 500, color: colors.gray[700] }}>Button</span>
                            </button>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '11px', color: colors.primary[700], textAlign: 'center' }}>
                            Added layers appear on the "Canvas". Drag them to arrange.
                        </p>
                    </div>

                    {/* Background Settings */}
                    <div style={{ border: `1px solid ${colors.gray[200]}`, borderRadius: '12px', padding: '16px' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Prize Background</h5>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>Color</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '4px', border: `1px solid ${colors.gray[300]}`, background: config.backgroundColor || '#fff', position: 'relative', overflow: 'hidden' }}>
                                    <input type="color" value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor} onChange={e => updateConfig('backgroundColor', e.target.value)} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                                </div>
                                <span style={{ fontSize: '13px', color: colors.text.primary, minWidth: '60px' }}>{config.backgroundColor || '#FFFFFF'}</span>
                                <button
                                    onClick={() => updateConfig('backgroundColor', 'transparent')}
                                    style={{
                                        fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${colors.gray[300]}`, backgroundColor: 'white', cursor: 'pointer',
                                        color: config.backgroundColor === 'transparent' ? colors.primary[600] : colors.text.secondary
                                    }}
                                >
                                    Transparent
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.gray[500], marginBottom: '6px' }}>Image URL</label>
                            <input
                                type="text"
                                value={config.backgroundImageUrl || ''}
                                onChange={(e) => updateConfig('backgroundImageUrl', e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.gray[300]}`, fontSize: '13px' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- 4. COMPLETION (Global) --- */}
            <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MonitorPlay size={16} />
                    After Fully Scratched
                </h4>

                <div style={{ backgroundColor: colors.gray[50], padding: '12px', borderRadius: '8px', border: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary }}>Play Celebration Video</label>
                        <input
                            type="checkbox"
                            checked={config.completionAnimation?.enabled ?? false}
                            onChange={e => updateNested('completionAnimation', 'enabled', e.target.checked)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                    </div>

                    {config.completionAnimation?.enabled && (
                        <div style={{ animation: 'fadeIn 0.2s' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <button
                                    onClick={() => updateNested('completionAnimation', 'type', 'video')}
                                    style={{
                                        padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                                        border: `1px solid ${config.completionAnimation?.type === 'video' ? colors.primary[500] : colors.gray[300]}`,
                                        backgroundColor: config.completionAnimation?.type === 'video' ? colors.primary[50] : 'white',
                                        color: config.completionAnimation?.type === 'video' ? colors.primary[700] : colors.text.secondary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                    }}
                                >
                                    🎬 Video
                                </button>
                                <button
                                    onClick={() => updateNested('completionAnimation', 'type', 'confetti')}
                                    style={{
                                        padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                                        border: `1px solid ${config.completionAnimation?.type === 'confetti' ? colors.primary[500] : colors.gray[300]}`,
                                        backgroundColor: config.completionAnimation?.type === 'confetti' ? colors.primary[50] : 'white',
                                        color: config.completionAnimation?.type === 'confetti' ? colors.primary[700] : colors.text.secondary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                    }}
                                >
                                    🎊 Confetti
                                </button>
                                <button
                                    onClick={() => updateNested('completionAnimation', 'type', 'fireworks')}
                                    style={{
                                        padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                                        border: `1px solid ${config.completionAnimation?.type === 'fireworks' ? colors.primary[500] : colors.gray[300]}`,
                                        backgroundColor: config.completionAnimation?.type === 'fireworks' ? colors.primary[50] : 'white',
                                        color: config.completionAnimation?.type === 'fireworks' ? colors.primary[700] : colors.text.secondary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                    }}
                                >
                                    🎆 Fireworks
                                </button>
                                <button
                                    onClick={() => updateNested('completionAnimation', 'type', 'money')}
                                    style={{
                                        padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                                        border: `1px solid ${config.completionAnimation?.type === 'money' ? colors.primary[500] : colors.gray[300]}`,
                                        backgroundColor: config.completionAnimation?.type === 'money' ? colors.primary[50] : 'white',
                                        color: config.completionAnimation?.type === 'money' ? colors.primary[700] : colors.text.secondary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                    }}
                                >
                                    💸 Money Rain
                                </button>
                            </div>

                            {config.completionAnimation?.type === 'video' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Video URL (MP4/WebM)"
                                        value={config.completionAnimation.videoUrl || ''}
                                        onChange={(e) => updateNested('completionAnimation', 'videoUrl', e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${colors.gray[300]}`, fontSize: '13px' }}
                                    />
                                    <p style={{ marginTop: '6px', fontSize: '11px', color: colors.gray[500] }}>
                                        Video plays full-screen immediately after scratch completion.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
