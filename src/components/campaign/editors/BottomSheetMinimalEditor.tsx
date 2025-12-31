import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Settings2, Image as ImageIcon, X, Code, Plus, Palette, Layers, Maximize } from 'lucide-react';

const colors = {
    primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
    gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 500: '#6b7280', 700: '#374151' },
    text: { primary: '#111827', secondary: '#6b7280' }
};

export const BottomSheetMinimalEditor = () => {
    const { currentCampaign, activeInterfaceId, updateBottomSheetConfig, addLayer } = useEditorStore();

    // Resolve config from active interface OR main campaign
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.bottomSheetConfig : currentCampaign?.bottomSheetConfig;
    console.log('BottomSheetMinimalEditor rendered', { configPresent: !!config, config });

    // Auto-migrate legacy values OR initialize if missing
    React.useEffect(() => {
        // If we have an active interface but NO config, initialize it immediately
        if (activeInterface && !config) {
            console.log('Auto-initializing missing config for interface:', activeInterface.id);
            updateBottomSheetConfig({
                height: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: { topLeft: 16, topRight: 16 },
                elevation: 2,
                overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                animation: { type: 'slide', duration: 300, easing: 'ease-out' }
            });
            return;
        }

        if (!config) return;

        let hasUpdates = false;
        const updates: any = {};

        // Fix Transparency: 'transparent' -> '#00000000'
        if (config.backgroundColor === 'transparent') {
            updates.backgroundColor = '#00000000';
            hasUpdates = true;
        }

        // Fix Close Button: undefined -> false
        if (config.showCloseButton === undefined) {
            updates.showCloseButton = false;
            hasUpdates = true;
        }

        // Fix Drag Handle: undefined -> false (per user request) or true (default) -> false
        // We force it to false if it's the old default (true) or undefined
        if (config.dragHandle === undefined || config.dragHandle === true) {
            updates.dragHandle = false;
            hasUpdates = true;
        }

        if (hasUpdates) {
            console.log('Auto-migrating Bottom Sheet Config:', updates);
            updateBottomSheetConfig(updates);

            // Also sync layer style if background changed
            if (updates.backgroundColor) {
                const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
                if (rootLayer) {
                    const { updateLayerStyle } = useEditorStore.getState();
                    updateLayerStyle(rootLayer.id, { backgroundColor: updates.backgroundColor });
                    console.log('Auto-migrated root layer background to:', updates.backgroundColor);
                }
            }
        }
    }, [config, activeInterface, currentCampaign?.layers, updateBottomSheetConfig]);

    if (!config) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: colors.text.secondary }}>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Configuration missing</p>
                <button
                    onClick={() => updateBottomSheetConfig({
                        height: 'auto',
                        backgroundColor: '#FFFFFF',
                        borderRadius: { topLeft: 16, topRight: 16 },
                        elevation: 2,
                        overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                        animation: { type: 'slide', duration: 300, easing: 'ease-out' }
                    } as any)}
                    style={{
                        padding: '8px 16px',
                        background: colors.primary[500],
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    Initialize Settings
                </button>
            </div>
        );
    }

    // Helper to update config
    const updateConfig = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        updateBottomSheetConfig({ [key]: value });

        // FIX: If updating background color, ALSO update the root container layer style
        // This ensures the App (which might render the container directly) matches the config
        if (key === 'backgroundColor') {
            const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
            if (rootLayer) {
                // If value is transparent hex, use that. If 'transparent' string (legacy), use hex.
                const styleValue = (value === 'transparent' || value === '#00000000') ? '#00000000' : value;
                const { updateLayerStyle } = useEditorStore.getState();
                updateLayerStyle(rootLayer.id, { backgroundColor: styleValue });
                console.log('Synced background color to root layer:', rootLayer.id, styleValue);
            }
        }
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

            {/* Dismiss Options */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <X size={14} />
                    Dismiss Options
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    {/* Tap Scrim Custom Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: colors.gray[100], borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Maximize size={14} color={colors.text.secondary} />
                            </div>
                            <span style={{ fontSize: '13px', color: colors.text.primary }}>Tap Scrim to Close</span>
                        </div>
                        <button
                            onClick={() => updateNestedConfig('overlay', 'dismissOnClick', !config.overlay?.dismissOnClick)}
                            style={{
                                width: '36px', height: '20px',
                                borderRadius: '12px',
                                backgroundColor: config.overlay?.dismissOnClick ? colors.primary[500] : colors.gray[300],
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer', border: 'none'
                            }}
                        >
                            <div style={{
                                width: '16px', height: '16px',
                                borderRadius: '50%', backgroundColor: 'white',
                                position: 'absolute', top: '2px',
                                left: config.overlay?.dismissOnClick ? '18px' : '2px',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }} />
                        </button>
                    </div>

                    {/* Swipe Down Custom Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: colors.gray[100], borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Layers size={14} color={colors.text.secondary} style={{ transform: 'rotate(180deg)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: colors.text.primary }}>Swipe Down to Close</span>
                        </div>
                        <button
                            onClick={() => updateConfig('swipeToDismiss', !config.swipeToDismiss)}
                            style={{
                                width: '36px', height: '20px',
                                borderRadius: '12px',
                                backgroundColor: config.swipeToDismiss ? colors.primary[500] : colors.gray[300],
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer', border: 'none'
                            }}
                        >
                            <div style={{
                                width: '16px', height: '16px',
                                borderRadius: '50%', backgroundColor: 'white',
                                position: 'absolute', top: '2px',
                                left: config.swipeToDismiss ? '18px' : '2px',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }} />
                        </button>
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
                            value={config.backgroundColor === '#00000000' || config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                            disabled={config.backgroundColor === '#00000000' || config.backgroundColor === 'transparent'}
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
                            checked={config.backgroundColor === '#00000000' || config.backgroundColor === 'transparent'}
                            onChange={(e) => updateConfig('backgroundColor', e.target.checked ? '#00000000' : '#FFFFFF')}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.secondary }}>Transparent Background</span>
                    </label>
                </div>

                {/* Appearance Controls - Drag / Close */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={config.dragHandle ?? false}
                                onChange={(e) => updateConfig('dragHandle', e.target.checked)}
                            />
                            <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Drag Handle</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={config.showCloseButton ?? false}
                                onChange={(e) => updateConfig('showCloseButton', e.target.checked)}
                            />
                            <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Close Button</span>
                        </label>
                    </div>
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
