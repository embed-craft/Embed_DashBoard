import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
    Settings2,
    Move,
    Maximize2,
    Image as ImageIcon,
    Video,
    X,
    Expand,
    Volume2,
    VolumeX,
    Palette,
    Sun,
    MousePointer2,
    Layers,
    Link2,
    Play,
    LayoutGrid,
    Circle,
    Square,
    RectangleHorizontal,
    ChevronDown,
    Eye,
    EyeOff,
    Grip,
    Upload,
    Sparkles,
    Timer,
    Zap
} from 'lucide-react';

// ============================================================================
// DESIGN SYSTEM
// ============================================================================
const colors = {
    primary: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
    text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af' },
    success: { 500: '#22c55e', 100: '#dcfce7' },
    error: { 500: '#ef4444', 100: '#fee2e2' },
    warning: { 500: '#f59e0b', 100: '#fef3c7' }
};

const styles = {
    section: {
        padding: '16px 0',
        borderBottom: `1px solid ${colors.gray[200]}`
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
    },
    sectionTitle: {
        margin: 0,
        fontSize: '13px',
        fontWeight: 600,
        color: colors.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: 500,
        color: colors.text.secondary,
        marginBottom: '6px'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.gray[300]}`,
        borderRadius: '8px',
        fontSize: '13px',
        color: colors.text.primary,
        background: 'white',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none'
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.gray[300]}`,
        borderRadius: '8px',
        fontSize: '13px',
        color: colors.text.primary,
        background: 'white',
        cursor: 'pointer'
    },
    toggle: (active: boolean) => ({
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: active ? colors.primary[500] : colors.gray[300],
        position: 'relative' as const,
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        border: 'none',
        flexShrink: 0
    }),
    toggleKnob: (active: boolean) => ({
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute' as const,
        top: '2px',
        left: active ? '22px' : '2px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }),
    chipButton: (active: boolean) => ({
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 500,
        border: `1px solid ${active ? colors.primary[500] : colors.gray[300]}`,
        borderRadius: '8px',
        background: active ? colors.primary[50] : 'white',
        color: active ? colors.primary[600] : colors.text.secondary,
        cursor: 'pointer',
        transition: 'all 0.2s'
    }),
    positionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
        width: 'fit-content'
    },
    positionCell: (active: boolean) => ({
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        border: `2px solid ${active ? colors.primary[500] : colors.gray[200]}`,
        background: active ? colors.primary[50] : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }),
    card: {
        background: colors.gray[50],
        borderRadius: '10px',
        padding: '14px',
        marginTop: '12px'
    },
    row: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        appearance: 'none' as const,
        background: colors.gray[200],
        cursor: 'pointer'
    }
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <button
        onClick={() => !disabled && onChange(!checked)}
        style={{ ...styles.toggle(checked), opacity: disabled ? 0.5 : 1 }}
        disabled={disabled}
    >
        <div style={styles.toggleKnob(checked)} />
    </button>
);

const SectionHeader = ({ icon: Icon, title, toggle, onToggle }: { icon: any; title: string; toggle?: boolean; onToggle?: (v: boolean) => void }) => (
    <div style={styles.sectionHeader}>
        <h5 style={styles.sectionTitle}>
            <Icon size={15} color={colors.primary[500]} />
            {title}
        </h5>
        {toggle !== undefined && onToggle && <Toggle checked={toggle} onChange={onToggle} />}
    </div>
);

const PositionGrid = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const positions = [
        ['top-left', 'top-center', 'top-right'],
        ['left-center', 'center', 'right-center'],
        ['bottom-left', 'bottom-center', 'bottom-right']
    ];
    return (
        <div style={styles.positionGrid}>
            {positions.flat().map((pos) => (
                <button
                    key={pos}
                    onClick={() => onChange(pos)}
                    style={styles.positionCell(value === pos)}
                    title={pos.replace('-', ' ')}
                >
                    <div style={{
                        width: value === pos ? '10px' : '6px',
                        height: value === pos ? '10px' : '6px',
                        borderRadius: '50%',
                        background: value === pos ? colors.primary[500] : colors.gray[400],
                        transition: 'all 0.2s'
                    }} />
                </button>
            ))}
        </div>
    );
};

const NumberInput = ({ label, value, onChange, unit = 'px', min = 0, max = 1000 }: {
    label: string; value: number; onChange: (v: number) => void; unit?: string; min?: number; max?: number;
}) => (
    <div style={{ flex: 1 }}>
        <label style={styles.label}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                style={{ ...styles.input, width: '80px', padding: '8px 10px' }}
            />
            <span style={{ fontSize: '12px', color: colors.text.tertiary }}>{unit}</span>
        </div>
    </div>
);

const Slider = ({ label, value, onChange, min = 0, max = 100, unit = '' }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...styles.label, marginBottom: 0 }}>{label}</label>
            <span style={{ fontSize: '12px', fontWeight: 500, color: colors.primary[600] }}>{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={styles.slider}
        />
    </div>
);

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
        <label style={styles.label}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
                type="color"
                value={value?.startsWith('#') ? value.slice(0, 7) : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                style={{ ...styles.input, flex: 1 }}
            />
        </div>
    </div>
);

const ControlCard = ({ icon: Icon, title, enabled, onToggle, children }: {
    icon: any; title: string; enabled: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode;
}) => (
    <div style={{
        background: colors.gray[50],
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '10px',
        border: enabled ? `1px solid ${colors.primary[200]}` : `1px solid transparent`
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: enabled ? colors.primary[100] : colors.gray[200],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={16} color={enabled ? colors.primary[600] : colors.gray[500]} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary }}>{title}</span>
            </div>
            <Toggle checked={enabled} onChange={onToggle} />
        </div>
        {enabled && children && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.gray[200]}` }}>
                {children}
            </div>
        )}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FloaterMinimalEditor = () => {
    const { currentCampaign, activeInterfaceId, updateFloaterConfig, addLayer, updateLayer, updateLayerStyle } = useEditorStore();

    // Resolve config from active interface OR main campaign
    const activeInterface = activeInterfaceId ? currentCampaign?.interfaces?.find(i => i.id === activeInterfaceId) : null;
    const config = activeInterface ? activeInterface.floaterConfig : currentCampaign?.floaterConfig;

    // Expanded sections state
    const [expandedSections, setExpandedSections] = useState({
        position: true,
        size: true,
        media: true,
        controls: true,
        appearance: false,
        behavior: false
    });

    // Auto-initialize config if missing
    React.useEffect(() => {
        if (!config) {
            updateFloaterConfig({
                position: 'bottom-right',
                offsetX: 20,
                offsetY: 20,
                width: 280,
                height: 180,
                borderRadius: 12,
                backgroundColor: '#000000',
                draggable: true,
                snapToCorner: true,
                controls: {
                    closeButton: { show: true, position: 'top-right' }
                }
            });
        }
    }, [config, updateFloaterConfig]);

    if (!config) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: colors.primary[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <Settings2 size={24} color={colors.primary[500]} />
                </div>
                <p style={{ fontSize: '13px', color: colors.text.secondary, marginBottom: '16px' }}>
                    Initializing Floater settings...
                </p>
            </div>
        );
    }

    // Helper functions
    const updateConfig = (key: string, value: any) => {
        updateFloaterConfig({ [key]: value });
    };

    const updateNestedConfig = (parent: string, key: string, value: any) => {
        updateFloaterConfig({
            [parent]: { ...((config as any)[parent] || {}), [key]: value }
        });
    };

    const updateControlConfig = (control: string, key: string, value: any) => {
        const currentControls = config.controls || {};
        const currentControl = (currentControls as any)[control] || {};
        updateFloaterConfig({
            controls: {
                ...currentControls,
                [control]: { ...currentControl, [key]: value }
            }
        });
    };

    // Detect if media is video
    const isVideoMedia = config.media?.type === 'video' || config.media?.type === 'youtube' ||
        (config.media?.url && (
            config.media.url.includes('youtube.com') ||
            config.media.url.includes('youtu.be') ||
            config.media.url.endsWith('.mp4') ||
            config.media.url.endsWith('.webm')
        ));

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* ===== HEADER ===== */}
            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}`, marginBottom: '8px' }}>
                <h4 style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LayoutGrid size={14} color="white" />
                    </div>
                    Floater Settings
                </h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: colors.text.secondary }}>
                    Configure your floating widget appearance and behavior
                </p>
            </div>

            {/* ===== POSITION SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={Move} title="Position" />

                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Position Grid */}
                    <div>
                        <label style={{ ...styles.label, marginBottom: '10px' }}>Corner</label>
                        <PositionGrid
                            value={config.position || 'bottom-right'}
                            onChange={(v) => updateConfig('position', v)}
                        />
                    </div>

                    {/* Offset Inputs */}
                    <div style={{ flex: 1 }}>
                        <label style={{ ...styles.label, marginBottom: '10px' }}>Offset</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <NumberInput
                                label="X"
                                value={config.offsetX || 20}
                                onChange={(v) => updateConfig('offsetX', v)}
                            />
                            <NumberInput
                                label="Y"
                                value={config.offsetY || 20}
                                onChange={(v) => updateConfig('offsetY', v)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SIZE & SHAPE SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={Maximize2} title="Size & Shape" />

                {/* Shape Selector */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Shape</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => updateConfig('shape', 'rectangle')}
                            style={{
                                ...styles.chipButton(config.shape !== 'circle'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Square size={14} />
                            Rectangle
                        </button>
                        <button
                            onClick={() => updateConfig('shape', 'circle')}
                            style={{
                                ...styles.chipButton(config.shape === 'circle'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Circle size={14} />
                            Circle
                        </button>
                    </div>
                </div>

                {/* Width */}
                <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Width</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.width || '280'}
                            onChange={(e) => updateConfig('width', e.target.value)}
                            placeholder="e.g. 280 or 80%"
                            style={{ ...styles.input, flex: 1 }}
                        />
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['160', '280', '360', '60%', '80%'].map(val => (
                            <button
                                key={val}
                                onClick={() => updateConfig('width', val)}
                                style={styles.chipButton(String(config.width) === val)}
                            >
                                {val.includes('%') ? val : `${val}px`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Height */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Height</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={config.height || '180'}
                            onChange={(e) => updateConfig('height', e.target.value)}
                            placeholder="e.g. 180 or 60%"
                            style={{ ...styles.input, flex: 1 }}
                        />
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['120', '180', '280', '50%', '80%'].map(val => (
                            <button
                                key={val}
                                onClick={() => updateConfig('height', val)}
                                style={styles.chipButton(String(config.height) === val)}
                            >
                                {val.includes('%') ? val : `${val}px`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Aspect Ratio Presets */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Aspect Ratio</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { label: '16:9', w: 280, h: 158 },
                            { label: '4:3', w: 240, h: 180 },
                            { label: '1:1', w: 180, h: 180 },
                            { label: '9:16', w: 160, h: 284 }
                        ].map(({ label, w, h }) => (
                            <button
                                key={label}
                                onClick={() => {
                                    updateConfig('width', w);
                                    updateConfig('height', h);
                                }}
                                style={styles.chipButton(config.width === w && config.height === h)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border Radius */}
                <Slider
                    label="Corner Radius"
                    value={config.borderRadius || 12}
                    onChange={(v) => updateConfig('borderRadius', v)}
                    min={0}
                    max={50}
                    unit="px"
                />
            </div>

            {/* ===== MEDIA SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={ImageIcon} title="Media" />

                {/* Media URL Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Media URL (image, video, or YouTube)</label>
                    <input
                        type="text"
                        value={config.media?.url || ''}
                        onChange={(e) => {
                            const url = e.target.value;
                            let type: 'image' | 'video' | 'youtube' = 'image';
                            if (url.includes('youtube.com') || url.includes('youtu.be')) type = 'youtube';
                            else if (url.endsWith('.mp4') || url.endsWith('.webm')) type = 'video';
                            // FIX: Update both url and type in single call to avoid race condition
                            updateFloaterConfig({
                                media: { ...(config.media || {}), url, type }
                            });
                        }}
                        placeholder="https://example.com/image.jpg or YouTube URL"
                        style={styles.input}
                    />
                </div>

                {/* Video-specific options */}
                {isVideoMedia && (
                    <div style={styles.card}>
                        <label style={{ ...styles.label, marginBottom: '12px', color: colors.primary[600] }}>
                            <Video size={12} style={{ marginRight: '6px' }} />
                            Video Playback
                        </label>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={config.media?.autoPlay ?? true}
                                    onChange={(e) => updateNestedConfig('media', 'autoPlay', e.target.checked)}
                                />
                                <span style={{ fontSize: '12px', color: colors.text.primary }}>Autoplay</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={config.media?.muted ?? true}
                                    onChange={(e) => updateNestedConfig('media', 'muted', e.target.checked)}
                                />
                                <span style={{ fontSize: '12px', color: colors.text.primary }}>Muted</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={config.media?.loop ?? false}
                                    onChange={(e) => updateNestedConfig('media', 'loop', e.target.checked)}
                                />
                                <span style={{ fontSize: '12px', color: colors.text.primary }}>Loop</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Image-specific options */}
                {config.media?.url && !isVideoMedia && (
                    <div style={styles.card}>
                        <label style={{ ...styles.label, marginBottom: '12px', color: colors.primary[600] }}>
                            <ImageIcon size={12} style={{ marginRight: '6px' }} />
                            Image Display
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['cover', 'contain', 'fill'].map((fit) => (
                                <button
                                    key={fit}
                                    onClick={() => updateNestedConfig('media', 'fit', fit)}
                                    style={styles.chipButton(config.media?.fit === fit)}
                                >
                                    {fit.charAt(0).toUpperCase() + fit.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== CONTROLS SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={MousePointer2} title="Controls" />

                {/* Close Button */}
                <ControlCard
                    icon={X}
                    title="Close Button"
                    enabled={config.controls?.closeButton?.show ?? true}
                    onToggle={(v) => updateControlConfig('closeButton', 'show', v)}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                                <button
                                    key={pos}
                                    onClick={() => updateControlConfig('closeButton', 'position', pos)}
                                    style={styles.chipButton(config.controls?.closeButton?.position === pos)}
                                >
                                    {pos.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Icon Size (px)</label>
                            <input
                                type="number"
                                value={config.controls?.closeButton?.size ?? 14}
                                onChange={(e) => updateControlConfig('closeButton', 'size', parseFloat(e.target.value) || 14)}
                                style={styles.input}
                            />
                        </div>
                    </div>
                </ControlCard>

                {/* Double Tap to Dismiss */}
                <div style={styles.card}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.doubleTapToDismiss ?? false}
                            onChange={(e) => updateFloaterConfig({ ...config, doubleTapToDismiss: e.target.checked })}
                            style={{ width: '16px', height: '16px', accentColor: colors.primary[600] }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary }}>
                            Double-tap to dismiss
                        </span>
                    </label>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', marginLeft: '24px' }}>
                        User can double-tap floater to close it
                    </p>
                </div>

                {/* Video Controls - only show if video media */}
                {isVideoMedia && (
                    <>
                        <ControlCard
                            icon={Expand}
                            title="Expand Button"
                            enabled={config.controls?.expandButton?.show ?? false}
                            onToggle={(v) => updateControlConfig('expandButton', 'show', v)}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => updateControlConfig('expandButton', 'position', pos)}
                                            style={styles.chipButton(config.controls?.expandButton?.position === pos)}
                                        >
                                            {pos.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Icon Size (px)</label>
                                    <input
                                        type="number"
                                        value={config.controls?.expandButton?.size ?? 14}
                                        onChange={(e) => updateControlConfig('expandButton', 'size', parseFloat(e.target.value) || 14)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </ControlCard>

                        <ControlCard
                            icon={config.controls?.muteButton?.show ? Volume2 : VolumeX}
                            title="Mute Toggle"
                            enabled={config.controls?.muteButton?.show ?? true}
                            onToggle={(v) => updateControlConfig('muteButton', 'show', v)}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => updateControlConfig('muteButton', 'position', pos)}
                                            style={styles.chipButton(config.controls?.muteButton?.position === pos)}
                                        >
                                            {pos.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Icon Size (px)</label>
                                    <input
                                        type="number"
                                        value={config.controls?.muteButton?.size ?? 14}
                                        onChange={(e) => updateControlConfig('muteButton', 'size', parseFloat(e.target.value) || 14)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </ControlCard>

                        <ControlCard
                            icon={Play}
                            title="Progress Bar"
                            enabled={config.controls?.progressBar?.show ?? false}
                            onToggle={(v) => updateControlConfig('progressBar', 'show', v)}
                        >
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['bottom', 'top'].map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => updateControlConfig('progressBar', 'position', pos)}
                                        style={styles.chipButton(config.controls?.progressBar?.position === pos)}
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        </ControlCard>
                    </>
                )}
            </div>

            {/* ===== APPEARANCE SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={Palette} title="Appearance" />

                {/* Background Color with Transparent Option */}
                <div>
                    <label style={styles.label}>Background Color (fallback behind media)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <input
                            type="color"
                            value={(config.backgroundColor === 'transparent' || config.backgroundColor === '#00000000') ? '#000000' : (config.backgroundColor?.startsWith('#') ? config.backgroundColor.slice(0, 7) : '#000000')}
                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                            disabled={config.backgroundColor === 'transparent' || config.backgroundColor === '#00000000'}
                            style={{
                                width: '40px',
                                height: '40px',
                                padding: 0,
                                border: `2px solid ${colors.gray[200]}`,
                                borderRadius: '8px',
                                cursor: (config.backgroundColor === 'transparent' || config.backgroundColor === '#00000000') ? 'not-allowed' : 'pointer',
                                opacity: (config.backgroundColor === 'transparent' || config.backgroundColor === '#00000000') ? 0.5 : 1
                            }}
                        />
                        <input
                            type="text"
                            value={config.backgroundColor || '#000000'}
                            onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                            placeholder="#000000"
                            style={{ ...styles.input, flex: 1 }}
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.backgroundColor === 'transparent' || config.backgroundColor === '#00000000'}
                            onChange={(e) => updateConfig('backgroundColor', e.target.checked ? 'transparent' : '#000000')}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.secondary }}>Transparent (no background)</span>
                    </label>
                </div>

                {/* Shadow */}
                <div style={{ ...styles.card, marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <label style={{ ...styles.label, marginBottom: 0 }}>
                            <Sun size={12} style={{ marginRight: '6px' }} />
                            Shadow
                        </label>
                        <Toggle
                            checked={config.shadow?.enabled ?? true}
                            onChange={(v) => updateNestedConfig('shadow', 'enabled', v)}
                        />
                    </div>
                    {config.shadow?.enabled !== false && (
                        <>
                            <Slider
                                label="Blur"
                                value={config.shadow?.blur || 24}
                                onChange={(v) => updateNestedConfig('shadow', 'blur', v)}
                                min={0}
                                max={50}
                                unit="px"
                            />
                            <div style={{ marginTop: '12px' }}>
                                <Slider
                                    label="Spread"
                                    value={config.shadow?.spread || 4}
                                    onChange={(v) => updateNestedConfig('shadow', 'spread', v)}
                                    min={0}
                                    max={20}
                                    unit="px"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ===== ANIMATION SECTION ===== */}
            <div style={styles.section}>
                <SectionHeader icon={Zap} title="Animation" />

                {/* Animation Type */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Entrance Effect</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'scale', label: 'Scale', icon: '📐' },
                            { id: 'slide', label: 'Slide', icon: '➡️' },
                            { id: 'fade', label: 'Fade', icon: '🌫️' },
                            { id: 'bounce', label: 'Bounce', icon: '🔄' }
                        ].map(({ id, label, icon }) => (
                            <button
                                key={id}
                                onClick={() => updateNestedConfig('animation', 'type', id)}
                                style={{
                                    ...styles.chipButton(config.animation?.type === id),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animation Duration */}
                <Slider
                    label="Duration"
                    value={config.animation?.duration || 300}
                    onChange={(v) => updateNestedConfig('animation', 'duration', v)}
                    min={100}
                    max={1000}
                    unit="ms"
                />

                {/* Easing Preview */}
                <div style={{ ...styles.card, marginTop: '12px' }}>
                    <label style={styles.label}>Easing</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['ease-out', 'ease-in-out', 'spring', 'linear'].map((easing) => (
                            <button
                                key={easing}
                                onClick={() => updateNestedConfig('animation', 'easing', easing)}
                                style={styles.chipButton(config.animation?.easing === easing)}
                            >
                                {easing}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== BEHAVIOR SECTION ===== */}
            <div style={{ ...styles.section, borderBottom: 'none' }}>
                <SectionHeader icon={Grip} title="Behavior" />

                <ControlCard
                    icon={Move}
                    title="Allow Drag to Move"
                    enabled={config.draggable ?? true}
                    onToggle={(v) => updateConfig('draggable', v)}
                />

                <ControlCard
                    icon={LayoutGrid}
                    title="Snap to Corner"
                    enabled={config.snapToCorner ?? true}
                    onToggle={(v) => updateConfig('snapToCorner', v)}
                />

                {/* Backdrop */}
                <ControlCard
                    icon={Layers}
                    title="Show Backdrop"
                    enabled={config.backdrop?.show ?? false}
                    onToggle={(v) => updateNestedConfig('backdrop', 'show', v)}
                >
                    <div style={{ marginBottom: '12px' }}>
                        <ColorInput
                            label="Color"
                            value={config.backdrop?.color || '#000000'}
                            onChange={(v) => updateNestedConfig('backdrop', 'color', v)}
                        />
                    </div>
                    <Slider
                        label="Opacity"
                        value={Math.round((config.backdrop?.opacity || 0.3) * 100)}
                        onChange={(v) => updateNestedConfig('backdrop', 'opacity', v / 100)}
                        min={0}
                        max={100}
                        unit="%"
                    />
                    <div style={{ marginTop: '12px' }}>
                        <Slider
                            label="Blur"
                            value={config.backdrop?.blur || 0}
                            onChange={(v) => updateNestedConfig('backdrop', 'blur', v)}
                            min={0}
                            max={20}
                            unit="px"
                        />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px' }}>
                        <input
                            type="checkbox"
                            checked={config.backdrop?.dismissOnTap ?? false}
                            onChange={(e) => updateNestedConfig('backdrop', 'dismissOnTap', e.target.checked)}
                        />
                        <span style={{ fontSize: '12px', color: colors.text.primary }}>Tap backdrop to dismiss</span>
                    </label>
                </ControlCard>
            </div>

        </div>
    );
};
