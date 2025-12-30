import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Settings2, Image as ImageIcon, X, Code, Plus, Palette, Layers, Maximize, ArrowUp, ArrowDown, Play } from 'lucide-react';

const colors = {
    primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
    gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 500: '#6b7280', 700: '#374151' },
    text: { primary: '#111827', secondary: '#6b7280' }
};

export const BannerMinimalEditor = () => {
    const { currentCampaign, updateBannerConfig, addLayer, updateLayer, updateLayerStyle } = useEditorStore();
    const config = currentCampaign?.bannerConfig;
    console.log('BannerMinimalEditor rendered', { configPresent: !!config, config });

    // Auto-migrate: specific defaults
    React.useEffect(() => {
        if (!config) return;

        let hasUpdates = false;
        const updates: any = {};

        // Fix transparency: 'transparent' -> '#00000000'
        if (config.backgroundColor === 'transparent') {
            updates.backgroundColor = '#00000000';
            hasUpdates = true;
        }

        // Fix Close Button: undefined -> false (Default to OFF per user request)
        if (config.showCloseButton === undefined) {
            updates.showCloseButton = false;
            hasUpdates = true;
        }

        // Initialize Position if missing
        if (!(config as any).position) {
            updates.position = 'top';
            hasUpdates = true;
        }

        if (hasUpdates) {
            console.log('Auto-migrating Banner Config:', updates);
            updateBannerConfig(updates);

            // Sync background if changed
            if (updates.backgroundColor) {
                const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Banner Container');
                if (rootLayer) {
                    const { updateLayerStyle } = useEditorStore.getState();
                    updateLayerStyle(rootLayer.id, { backgroundColor: updates.backgroundColor });
                }
            }
        }
    }, [config?.backgroundColor, config?.showCloseButton, (config as any)?.position, currentCampaign?.layers, updateBannerConfig]); // Added missing deps for safety

    if (!config) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: colors.text.secondary }}>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Configuration missing</p>
                <button
                    onClick={() => {
                        // Hydrate from existing root layer if possible
                        const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Banner Container');

                        // Defaults
                        const defaults = {
                            position: 'top',
                            width: '100%',
                            height: 'auto',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 0,
                            elevation: 1,
                            overlay: { enabled: false, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
                            animation: { type: 'slide', duration: 300, easing: 'ease-out' }
                        };

                        if (rootLayer) {
                            // Extract existing style
                            const style: any = rootLayer.style || {};
                            const size: any = rootLayer.size || {};

                            if (style.backgroundColor) defaults.backgroundColor = style.backgroundColor;
                            if (size.width) defaults.width = size.width;
                            if (size.height) defaults.height = size.height;

                            // Check for background image (could be in backgroundImage or background)
                            const bgImage = style.backgroundImage || style.background;
                            if (bgImage && bgImage.startsWith('url(')) {
                                // Extract url from url("...")
                                const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
                                if (match && match[1]) {
                                    (defaults as any).backgroundImageUrl = match[1];
                                }
                            }

                            // Check background size
                            if (style.backgroundSize) (defaults as any).backgroundSize = style.backgroundSize;

                            console.log('Hydrated Banner Config from Root Layer:', defaults);
                        }

                        updateBannerConfig(defaults as any);
                    }}
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
        updateBannerConfig({ [key]: value });

        // Sync dimensions and background to root layer
        if (['width', 'height', 'backgroundColor', 'backgroundImageUrl', 'backgroundSize', 'backgroundPosition'].includes(key)) {
            const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && l.name === 'Banner Container');
            if (rootLayer) {
                if (key === 'backgroundColor') {
                    const styleValue = (value === 'transparent' || value === '#00000000') ? '#00000000' : value;
                    updateLayerStyle(rootLayer.id, { backgroundColor: styleValue });
                } else if (key === 'backgroundImageUrl') {
                    updateLayerStyle(rootLayer.id, { backgroundImage: value }); // Map to standard CSS prop
                } else if (key === 'backgroundSize') {
                    updateLayerStyle(rootLayer.id, { backgroundSize: value });
                } else if (key === 'backgroundPosition') {
                    updateLayerStyle(rootLayer.id, { backgroundPosition: value });
                } else {
                    // Sync Dimensions (Width/Height)
                    updateLayer(rootLayer.id, {
                        size: {
                            ...rootLayer.size,
                            [key]: value
                        } as any
                    });
                }
            }
        }
    };

    const updateNestedConfig = (parent: string, key: string, value: any) => {
        updateBannerConfig({
            [parent]: { ...((config as any)[parent] || {}), [key]: value }
        });
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings2 size={16} />
                    Banner Settings
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                    Minimal configuration for solid performance.
                </p>
            </div>

            {/* Position Control (Banner Specific) */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowUp size={14} />
                    Position
                </h5>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => updateConfig('position', 'top')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: `1px solid ${(config as any).position === 'top' ? colors.primary[500] : colors.gray[200]}`,
                            borderRadius: '6px',
                            background: (config as any).position === 'top' ? colors.primary[50] : 'white',
                            color: (config as any).position === 'top' ? colors.primary[600] : colors.text.secondary,
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowUp size={14} />
                        Top
                    </button>
                    <button
                        onClick={() => updateConfig('position', 'bottom')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: `1px solid ${(config as any).position === 'bottom' ? colors.primary[500] : colors.gray[200]}`,
                            borderRadius: '6px',
                            background: (config as any).position === 'bottom' ? colors.primary[50] : 'white',
                            color: (config as any).position === 'bottom' ? colors.primary[600] : colors.text.secondary,
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowDown size={14} />
                        Bottom
                    </button>
                </div>
            </div>

            {/* Fine Tune Position */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${colors.gray[200]}` }}>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '6px' }}>Fine Tune Position (px)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Offset X</label>
                        <input
                            type="number"
                            value={(config as any).margin?.left || 0}
                            onChange={(e) => updateNestedConfig('margin', 'left', Number(e.target.value))}
                            style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Offset Y</label>
                        <input
                            type="number"
                            value={((config as any).position === 'bottom' ? (config as any).margin?.bottom : (config as any).margin?.top) || 0}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if ((config as any).position === 'bottom') {
                                    updateNestedConfig('margin', 'bottom', val);
                                    updateNestedConfig('margin', 'top', undefined); // Clear opposite
                                } else {
                                    updateNestedConfig('margin', 'top', val);
                                    updateNestedConfig('margin', 'bottom', undefined); // Clear opposite
                                }
                            }}
                            style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Dimensions */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Maximize size={14} />
                    Dimensions
                </h5>

                {/* Width */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Width</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.width}
                            onChange={(e) => updateConfig('width', e.target.value)}
                            placeholder="e.g. 90% or 340px"
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
                        {['100%', '80%', '90%', '340px', '500px'].map(val => (
                            <button
                                key={val}
                                onClick={() => updateConfig('width', val)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    border: `1px solid ${colors.gray[200]}`,
                                    borderRadius: '4px',
                                    background: config.width === val ? colors.primary[50] : 'white',
                                    color: config.width === val ? colors.primary[600] : colors.text.secondary,
                                    cursor: 'pointer'
                                }}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Height */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Height</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.height}
                            onChange={(e) => updateConfig('height', e.target.value)}
                            placeholder="e.g. auto or 400px"
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
                        {['auto', '400px', '60%'].map(val => (
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

                    {/* Swipe to Close Custom Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: colors.gray[100], borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Layers size={14} color={colors.text.secondary} style={{ transform: 'rotate(180deg)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: colors.text.primary }}>
                                Swipe {config.position === 'bottom' ? 'Down' : 'Up'} to Close
                            </span>
                        </div>
                        <button
                            onClick={() => updateNestedConfig('overlay', 'dismissOnSwipe', !config.overlay?.dismissOnSwipe)}
                            style={{
                                width: '36px', height: '20px',
                                borderRadius: '12px',
                                backgroundColor: config.overlay?.dismissOnSwipe ? colors.primary[500] : colors.gray[300],
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                cursor: 'pointer', border: 'none'
                            }}
                        >
                            <div style={{
                                width: '16px', height: '16px',
                                borderRadius: '50%', backgroundColor: 'white',
                                position: 'absolute', top: '2px',
                                left: config.overlay?.dismissOnSwipe ? '18px' : '2px',
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

                {/* Appearance Controls - Close Button */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.gray[200]}` }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
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

            {/* Shadow Controls - Requested ".shadow (with its properties)" */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} />
                        Shadow
                    </h5>
                    <input
                        type="checkbox"
                        checked={(config as any).shadow?.enabled ?? false}
                        onChange={(e) => updateNestedConfig('shadow', 'enabled', e.target.checked)}
                    />
                </div>
                {(config as any).shadow?.enabled ? (
                    <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${colors.gray[200]}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Blur & Spread</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Blur"
                                    value={(config as any).shadow?.blur ?? 12}
                                    onChange={(e) => updateNestedConfig('shadow', 'blur', parseInt(e.target.value))}
                                    style={{ padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', width: '100%' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Spread"
                                    value={(config as any).shadow?.spread ?? 0}
                                    onChange={(e) => updateNestedConfig('shadow', 'spread', parseInt(e.target.value))}
                                    style={{ padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', width: '100%' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Offset (X / Y)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="X"
                                    value={(config as any).shadow?.x ?? 0}
                                    onChange={(e) => updateNestedConfig('shadow', 'x', parseInt(e.target.value))}
                                    style={{ padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', width: '100%' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Y"
                                    value={(config as any).shadow?.y ?? 4}
                                    onChange={(e) => updateNestedConfig('shadow', 'y', parseInt(e.target.value))}
                                    style={{ padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', width: '100%' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Color & Opacity</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="color"
                                    value={(config as any).shadow?.color?.startsWith('#') ? (config as any).shadow?.color : '#000000'}
                                    onChange={(e) => updateNestedConfig('shadow', 'color', e.target.value)}
                                    style={{ width: '32px', height: '32px', border: 'none', padding: 0, borderRadius: '4px', cursor: 'pointer' }}
                                />
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={(config as any).shadow?.opacity ?? 0.15}
                                    onChange={(e) => updateNestedConfig('shadow', 'opacity', parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ fontSize: '11px', color: colors.text.secondary }}>{Math.round(((config as any).shadow?.opacity ?? 0.15) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Fallback to simple Elevation if Shadow disabled */
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Elevation</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[0, 1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    onClick={() => updateConfig('elevation', level)}
                                    style={{
                                        flex: 1, padding: '6px 0', fontSize: '11px',
                                        border: `1px solid ${(config.elevation ?? 1) === level ? colors.primary[500] : colors.gray[200]}`,
                                        borderRadius: '4px',
                                        backgroundColor: (config.elevation ?? 1) === level ? colors.primary[50] : 'white',
                                        color: (config.elevation ?? 1) === level ? colors.primary[600] : colors.text.secondary,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
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

            {/* Animation Controls - Requested "addd animation too" */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Play size={14} />
                        Animation
                    </h5>
                    <input
                        type="checkbox"
                        checked={config.animation?.enabled !== false}
                        onChange={(e) => updateNestedConfig('animation', 'enabled', e.target.checked)}
                    />
                </div>

                {config.animation?.enabled !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Type */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Type</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['slide', 'fade'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateNestedConfig('animation', 'type', type)}
                                        style={{
                                            flex: 1, padding: '6px', fontSize: '12px', textTransform: 'capitalize',
                                            border: `1px solid ${(config.animation?.type || 'slide') === type ? colors.primary[500] : colors.gray[200]}`,
                                            borderRadius: '4px',
                                            backgroundColor: (config.animation?.type || 'slide') === type ? colors.primary[50] : 'white',
                                            color: (config.animation?.type || 'slide') === type ? colors.primary[600] : colors.text.secondary,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ fontSize: '11px', color: colors.text.secondary }}>Duration</label>
                                <span style={{ fontSize: '11px', color: colors.text.primary }}>{config.animation?.duration || 300}ms</span>
                            </div>
                            <input
                                type="range"
                                min="100" max="1000" step="50"
                                value={config.animation?.duration || 300}
                                onChange={(e) => updateNestedConfig('animation', 'duration', parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Easing */}
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Easing</label>
                            <select
                                value={config.animation?.easing || 'ease-out'}
                                onChange={(e) => updateNestedConfig('animation', 'easing', e.target.value)}
                                style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                            >
                                <option value="ease-out">Ease Out (Smooth)</option>
                                <option value="ease-in">Ease In (Accelerate)</option>
                                <option value="linear">Linear (Constant)</option>
                                <option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Bounce</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Special Layers Shortcut */}
            <div>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} />
                    Special Layers
                </h5>
                <button
                    onClick={() => {
                        // Find root container to add to
                        // For Modal, the root container typically has name "Banner Container" or similar if we stick to conventions
                        // Or we find the top-level container
                        const container = currentCampaign?.layers?.find(l => l.type === 'container' && l.parent === null);
                        addLayer('custom_html', container?.id || null);
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

        </div >
    );
};
