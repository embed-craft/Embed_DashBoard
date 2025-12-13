import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Settings2, Image as ImageIcon, X, Code, Plus, Palette, Layers, Maximize } from 'lucide-react';

const colors = {
    primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
    gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 500: '#6b7280', 700: '#374151' },
    text: { primary: '#111827', secondary: '#6b7280' }
};

export const BottomSheetMinimalEditor = () => {
    const { currentCampaign, updateBottomSheetConfig, addLayer, selectedLayerId } = useEditorStore();
    const config = currentCampaign?.bottomSheetConfig;

    if (!config) return null;

    // Helper to update config
    const updateConfig = (key: string, value: any) => {
        updateBottomSheetConfig({ [key]: value });
    };

    const updateNestedConfig = (parent: string, key: string, value: any) => {
        updateBottomSheetConfig({
            [parent]: { ...((config as any)[parent] || {}), [key]: value }
        });
    };

    // Check if a layer is selected (if so, we might not want to show this, or show it minimized?)
    // The architecture report says "Dedicated, isolated editor... renders ONLY when nudgeType === 'bottomsheet'".
    // DesignStep usually renders renderLayerProperties() if a layer is selected.
    // We'll leave that logic to DesignStep. This component renders the Container Properties.

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings2 size={16} />
                    Bottom Sheet Settings
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                    Minimal configuration for solid performance.
                </p>
            </div>

            {/* Dimensions (Height) */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Maximize size={14} />
                    Dimensions
                </h5>

                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Height</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.height}
                            onChange={(e) => updateConfig('height', e.target.value)}
                            placeholder="e.g. 50% or 400px"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: `1px solid ${colors.gray[200]}`,
                                borderRadius: '6px',
                                fontSize: '13px'
                            }}
                        />
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                        {['auto', '40%', '50%', '80%', '400px'].map(val => (
                            <button
                                key={val}
                                onClick={() => updateConfig('height', val)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    border: `1px solid ${colors.gray[200]}`,
                                    borderRadius: '4px',
                                    background: config.height === val ? colors.primary[50] : 'white',
                                    color: config.height === val ? colors.primary[600] : colors.text.secondary,
                                    cursor: 'pointer'
                                }}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={14} />
                    Background
                </h5>

                {/* Color */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="color"
                            value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                            disabled={config.backgroundColor === 'transparent'}
                            style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'cursor' }}
                        />
                        <input
                            type="text"
                            value={config.backgroundColor}
                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                            style={{ flex: 1, padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.backgroundColor === 'transparent'}
                            onChange={(e) => updateConfig('backgroundColor', e.target.checked ? 'transparent' : '#FFFFFF')}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.secondary }}>Transparent Background</span>
                    </label>
                </div>

                {/* Image */}
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Background Image URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.backgroundImageUrl || ''}
                            onChange={(e) => updateConfig('backgroundImageUrl', e.target.value)}
                            placeholder="https://..."
                            style={{ flex: 1, padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                        />
                    </div>
                    {config.backgroundImageUrl && (
                        <div style={{ marginTop: '8px' }}>
                            <select
                                value={config.backgroundSize || 'cover'}
                                onChange={(e) => updateConfig('backgroundSize', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px' }}
                            >
                                <option value="cover">Cover (Fill)</option>
                                <option value="contain">Contain (Fit)</option>
                                <option value="fill">Stretch</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} />
                        Overlay (Scrim)
                    </h5>
                    <input
                        type="checkbox"
                        checked={config.overlay?.enabled ?? true}
                        onChange={(e) => updateNestedConfig('overlay', 'enabled', e.target.checked)}
                    />
                </div>

                {config.overlay?.enabled && (
                    <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${colors.gray[200]}` }}>
                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="color"
                                    value={config.overlay.color}
                                    onChange={(e) => updateNestedConfig('overlay', 'color', e.target.value)}
                                    style={{ border: 'none', background: 'none', width: '24px', height: '24px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '12px', color: colors.text.secondary }}>{config.overlay.color}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Opacity: {Math.round((config.overlay.opacity || 0.5) * 100)}%</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={config.overlay.opacity || 0.5}
                                onChange={(e) => updateNestedConfig('overlay', 'opacity', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={config.overlay.dismissOnClick}
                                onChange={(e) => updateNestedConfig('overlay', 'dismissOnClick', e.target.checked)}
                            />
                            <span style={{ fontSize: '12px', color: colors.text.secondary }}>Dismiss on click</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Layer Actions */}
            <div>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} />
                    Special Layers
                </h5>
                <button
                    onClick={() => {
                        // Find root container to add to
                        const container = currentCampaign?.layers?.find(l => l.type === 'container' && l.parent === null); // Rough guess
                        const parentId = container?.id || null;
                        // Actually DesignStep might handle parentId resolution better, but let's try to find the "Bottom Sheet" layer
                        const sheetLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
                        addLayer('custom_html', sheetLayer?.id || null);
                    }}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: colors.primary[50], // Light indigo
                        color: colors.primary[600],
                        border: `1px solid ${colors.primary[500]}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Plus size={14} />
                    Add Custom HTML Layer
                </button>
            </div>

        </div>
    );
};
