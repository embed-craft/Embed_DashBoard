import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Settings2, Image as ImageIcon, X, Code, Plus, Palette, Layers, Maximize, Move, Upload } from 'lucide-react';

const colors = {
    primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
    gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 500: '#6b7280', 700: '#374151' },
    text: { primary: '#111827', secondary: '#6b7280' }
};

export const PipMinimalEditor = () => {
    const { currentCampaign, activeInterfaceId, updatePipConfig, addLayer, updateLayer, updateLayerStyle } = useEditorStore();
    const [isUploading, setIsUploading] = React.useState(false);

    // Resolve config from active interface OR main campaign
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.pipConfig : currentCampaign?.pipConfig;
    console.log('PipMinimalEditor rendered', { configPresent: !!config, config });

    // Auto-migrate: specific defaults OR initialize if missing
    React.useEffect(() => {
        // If we have an active interface but NO config, initialize it immediately
        if (activeInterface && !config) {
            console.log('Auto-initializing missing config for interface:', activeInterface.id);
            updatePipConfig({
                mode: 'image',
                width: 320,
                height: 180,
                backgroundColor: '#10B981',
                borderRadius: 16,
                position: 'bottom-right',
                offsetX: 20,
                offsetY: 20,
            });
            return;
        }

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

        if (hasUpdates) {
            console.log('Auto-migrating Pip Config:', updates);
            updatePipConfig(updates);

            // Sync background if changed
            if (updates.backgroundColor) {
                const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && (l.name === 'PIP Container' || l.name?.toLowerCase().includes('container')));
                if (rootLayer) {
                    const { updateLayerStyle } = useEditorStore.getState();
                    updateLayerStyle(rootLayer.id, { backgroundColor: updates.backgroundColor });
                }
            }
        }
    }, [config, activeInterface, currentCampaign?.layers, updatePipConfig]);

    if (!config) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: colors.text.secondary }}>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Configuration missing</p>
                <button
                    onClick={() => {
                        // Hydrate from existing root layer
                        const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && (l.name === 'PIP Container' || l.name?.toLowerCase().includes('container')));

                        const defaults = {
                            width: 320,
                            height: 180,
                            backgroundColor: '#10B981',
                            borderRadius: 16,
                            position: 'bottom-right',
                            offsetX: 20,
                            offsetY: 20,
                        };

                        if (rootLayer) {
                            const style: any = rootLayer.style || {};
                            const size: any = rootLayer.size || {};

                            if (style.backgroundColor) defaults.backgroundColor = style.backgroundColor;
                            if (size.width) defaults.width = size.width;
                            if (size.height) defaults.height = size.height;

                            if (style.backgroundColor) defaults.backgroundColor = style.backgroundColor;
                            if (size.width) defaults.width = size.width;
                            if (size.height) defaults.height = size.height;

                            console.log('Hydrated Pip Config from Root Layer:', defaults);
                        }

                        updatePipConfig(defaults as any);
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
        updatePipConfig({ [key]: value });

        // Only sync backgroundColor and dimensions to root layer (NOT background image - use config directly)
        if (['width', 'height', 'backgroundColor', 'borderRadius', 'boxShadow'].includes(key)) {
            const rootLayer = currentCampaign?.layers?.find(l => l.type === 'container' && (l.name === 'PIP Container' || l.name?.toLowerCase().includes('container')));
            if (rootLayer) {
                if (key === 'backgroundColor') {
                    const styleValue = (value === 'transparent' || value === '#00000000') ? '#00000000' : value;
                    updateLayerStyle(rootLayer.id, { backgroundColor: styleValue });
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
        updatePipConfig({
            [parent]: { ...((config as any)[parent] || {}), [key]: value }
        });
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings2 size={16} />
                    PIP Settings
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                    Minimal configuration for solid performance.
                </p>
            </div>

            {/* Position */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Move size={14} />
                        Position
                    </h5>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.position === 'custom'}
                            onChange={(e) => updateConfig('position', e.target.checked ? 'custom' : 'bottom-right')}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.secondary }}>Custom</span>
                    </label>
                </div>

                {config.position === 'custom' ? (
                    // Custom X/Y Inputs
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Left (X)</label>
                            <input
                                type="number"
                                value={config.x || 0}
                                onChange={(e) => updateConfig('x', parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Top (Y)</label>
                            <input
                                type="number"
                                value={config.y || 0}
                                onChange={(e) => updateConfig('y', parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>
                    </div>
                ) : (
                    // 3x3 Grid + Offsets
                    <>
                        {/* 3x3 Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '4px',
                            marginBottom: '12px',
                            backgroundColor: colors.gray[100],
                            padding: '4px',
                            borderRadius: '8px'
                        }}>
                            {[
                                { id: 'top-left', label: 'TL' }, { id: 'top-center', label: 'TC' }, { id: 'top-right', label: 'TR' },
                                { id: 'center-left', label: 'CL' }, { id: 'center', label: 'C' }, { id: 'center-right', label: 'CR' },
                                { id: 'bottom-left', label: 'BL' }, { id: 'bottom-center', label: 'BC' }, { id: 'bottom-right', label: 'BR' }
                            ].map((pos) => (
                                <button
                                    key={pos.id}
                                    onClick={() => updateConfig('position', pos.id)}
                                    title={pos.id}
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        backgroundColor: config.position === pos.id ? 'white' : 'transparent',
                                        color: config.position === pos.id ? colors.primary[600] : colors.text.secondary,
                                        boxShadow: config.position === pos.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.1s'
                                    }}
                                >
                                    {pos.label}
                                </button>
                            ))}
                        </div>

                        {/* Offsets */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Offset X</label>
                                <input
                                    type="number"
                                    value={config.offsetX || 20}
                                    onChange={(e) => updateConfig('offsetX', parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Offset Y</label>
                                <input
                                    type="number"
                                    value={config.offsetY || 20}
                                    onChange={(e) => updateConfig('offsetY', parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                    </>
                )}
                {/* Dimensions */}

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
                        {['80%', '90%', '340px', '500px'].map(val => (
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

                </div>
            </div>

            {/* Video Settings */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} />
                    Video Settings
                </h5>

                {/* Video URL */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Video Source</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* URL Input */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={(currentCampaign?.layers?.find(l => l.type === 'video')?.content as any)?.url || config.videoUrl || ''}
                                onChange={(e) => {
                                    const url = e.target.value;
                                    updateConfig('videoUrl', url);
                                    // Also find and update the actual video layer
                                    const videoLayer = currentCampaign?.layers?.find(l => l.type === 'video');
                                    if (videoLayer) {
                                        const { updateLayer } = useEditorStore.getState();
                                        updateLayer(videoLayer.id, { content: { ...videoLayer.content, url, videoUrl: url } as any });
                                    }
                                }}
                                placeholder="https://youtube.com/..."
                                style={{ flex: 1, padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>

                        {/* Upload Button */}
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    backgroundColor: colors.gray[100],
                                    color: colors.text.primary,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    border: `1px dashed ${colors.gray[300]}`
                                }}
                            >
                                <Upload size={14} />
                                {isUploading ? 'Uploading...' : 'Upload Video'}
                                <input
                                    type="file"
                                    accept="video/*"
                                    disabled={isUploading}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // 50MB limit for video?
                                        if (file.size > 50 * 1024 * 1024) {
                                            alert('Video must be under 50MB');
                                            return;
                                        }

                                        setIsUploading(true);
                                        try {
                                            // Import apiClient dynamically to avoid top-level import issues if any
                                            const { apiClient } = await import('@/lib/api');
                                            const res = await apiClient.uploadAsset(file);

                                            // Assume response has url. If not, fallback to what we find.
                                            const url = res.url || res.data?.url || res.secure_url; // Handle various potential responses

                                            if (url) {
                                                updateConfig('videoUrl', url);
                                                const videoLayer = currentCampaign?.layers?.find(l => l.type === 'video');
                                                if (videoLayer) {
                                                    const { updateLayer } = useEditorStore.getState();
                                                    updateLayer(videoLayer.id, { content: { ...videoLayer.content, url, videoUrl: url } as any });
                                                }
                                            } else {
                                                console.error('Upload success but no URL found', res);
                                                alert('Upload failed: No URL returned');
                                            }
                                        } catch (error) {
                                            console.error('Video upload failed', error);
                                            alert('Failed to upload video');
                                        } finally {
                                            setIsUploading(false);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Audio Settings */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.defaultMuted ?? true}
                            onChange={(e) => updateConfig('defaultMuted', e.target.checked)}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.secondary }}>Start Muted</span>
                    </label>
                </div>
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
                                min="0" max="1" step="0.01"
                                value={config.overlay.opacity ?? 0.5}
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

            {/* Appearance (Border Radius, etc.) */}
            <div style={{ paddingBottom: '20px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={14} />
                    Appearance
                </h5>

                {/* Border Radius */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', color: colors.text.secondary }}>Corner Radius</label>
                        <span style={{ fontSize: '12px', color: colors.text.primary }}>{config.borderRadius || 16}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="32"
                        value={config.borderRadius || 16}
                        onChange={(e) => updateConfig('borderRadius', parseInt(e.target.value))}
                        style={{ width: '100%', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 8, 16, 24].map((radius) => (
                            <button
                                key={radius}
                                onClick={() => updateConfig('borderRadius', radius)}
                                style={{
                                    flex: 1,
                                    padding: '4px',
                                    border: `1px solid ${colors.gray[200]}`,
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    background: (config.borderRadius || 16) === radius ? colors.primary[50] : 'white',
                                    color: (config.borderRadius || 16) === radius ? colors.primary[600] : colors.text.secondary,
                                    cursor: 'pointer'
                                }}
                            >
                                {radius}px
                            </button>
                        ))}
                    </div>
                </div>

                {/* Shadow */}
                <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Shadow</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                        {[
                            { label: 'None', val: 'none' },
                            { label: 'Sm', val: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
                            { label: 'Md', val: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
                            { label: 'Lg', val: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
                            { label: 'Xl', val: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
                        ].map((shadow) => {
                            // Check if active (handle default case for 'Md' if undefined)
                            const currentShadow = config.boxShadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                            const isActive = currentShadow === shadow.val;

                            return (
                                <button
                                    key={shadow.label}
                                    onClick={() => updateConfig('boxShadow', shadow.val)}
                                    style={{
                                        padding: '4px',
                                        border: `1px solid ${colors.gray[200]}`,
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        background: isActive ? colors.primary[50] : 'white',
                                        color: isActive ? colors.primary[600] : colors.text.secondary,
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    {shadow.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
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
