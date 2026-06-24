import { Smartphone, ZoomIn, ZoomOut, Maximize2, Grid, RotateCw, RotateCcw, Camera, MousePointer2, Hand, Play, Image, User, Undo2, Redo2 } from 'lucide-react';
import { DEVICE_PRESETS, DevicePreset } from '@/lib/devicePresets';
import { useEditorStore } from '@/store/useEditorStore';

interface PreviewToolbarProps {
    selectedDevice: string;
    onDeviceChange: (deviceId: string) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    showGrid: boolean;
    onGridToggle: () => void;
    onScreenshot?: () => void;
    isInteractive: boolean;
    onInteractToggle: () => void;
    isPreview?: boolean;
    onPreviewToggle?: () => void;
    onResetZoom?: () => void;

    // Background Selector
    backgrounds?: { id: string; name: string; url: string }[];
    selectedBackground?: string | null;
    onBackgroundChange?: (url: string | null) => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    selectedDevice,
    onDeviceChange,
    zoom,
    onZoomChange,
    showGrid,
    onGridToggle,
    onScreenshot,
    isInteractive,
    onInteractToggle,
    isPreview = false,
    onPreviewToggle,
    onResetZoom,
    backgrounds = [],
    selectedBackground,
    onBackgroundChange
}) => {
    const currentDevice = DEVICE_PRESETS.find(d => d.id === selectedDevice);
    const { previewUserId, setPreviewUserId, undo, redo, canUndo, canRedo } = useEditorStore();
    console.log('[PreviewToolbar] Rendering. isInteractive:', isInteractive);

    const selectStyle = {
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #E5E7EB',
        fontSize: '13px',
        fontWeight: 500,
        color: '#111827',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '150px'
    };

    return (
        <div 
            className="preview-toolbar-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                width: '100%'
            }}
        >
            {/* Top Row: Device, Background, and User Simulation */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '8px 16px',
                borderBottom: '1px solid #F3F4F6',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Smartphone size={16} color="#6B7280" />
                        <select
                            value={selectedDevice}
                            onChange={(e) => onDeviceChange(e.target.value)}
                            style={selectStyle}
                        >
                            {DEVICE_PRESETS.map(device => (
                                <option key={device.id} value={device.id}>
                                    {device.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {onBackgroundChange && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '16px' }}>
                            <Image size={16} color="#6B7280" />
                            <select
                                value={selectedBackground || ''}
                                onChange={(e) => onBackgroundChange(e.target.value || null)}
                                style={{ ...selectStyle, minWidth: '180px' }}
                            >
                                <option value="">No Background</option>
                                {backgrounds.map(bg => (
                                    <option key={bg.id} value={bg.url}>
                                        {bg.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        backgroundColor: '#F9FAFB'
                    }}>
                        <User size={14} color="#6B7280" />
                        <input
                            type="text"
                            placeholder="Simulate User ID..."
                            value={previewUserId || ''}
                            onChange={(e) => setPreviewUserId(e.target.value.trim() || null)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onPaste={(e) => e.stopPropagation()}
                            style={{
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                fontSize: '12px',
                                color: '#374151',
                                width: '130px'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Editor Actions, Zoom, Undo/Redo */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '8px 16px',
                gap: '16px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Undo/Redo Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                            onClick={() => undo()}
                            disabled={!canUndo()}
                            style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: canUndo() ? '#FFFFFF' : '#F9FAFB',
                                cursor: canUndo() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                opacity: canUndo() ? 1 : 0.4,
                            }}
                            onMouseEnter={(e) => { if (canUndo()) e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = canUndo() ? '#FFFFFF' : '#F9FAFB'; }}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={14} color={canUndo() ? '#374151' : '#9CA3AF'} />
                        </button>
                        <button
                            onClick={() => redo()}
                            disabled={!canRedo()}
                            style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: canRedo() ? '#FFFFFF' : '#F9FAFB',
                                cursor: canRedo() ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                opacity: canRedo() ? 1 : 0.4,
                            }}
                            onMouseEnter={(e) => { if (canRedo()) e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = canRedo() ? '#FFFFFF' : '#F9FAFB'; }}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 size={14} color={canRedo() ? '#374151' : '#9CA3AF'} />
                        </button>
                    </div>

                    <div style={{ height: '20px', borderLeft: '1px solid #E5E7EB' }} />

                    {/* Center: Zoom Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                            style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        >
                            <ZoomOut size={14} color="#6B7280" />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', minWidth: '40px', textAlign: 'center' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
                            style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        >
                            <ZoomIn size={14} color="#6B7280" />
                        </button>
                        <button
                            onClick={() => onResetZoom ? onResetZoom() : onZoomChange(1.0)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#6B7280',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        >
                            <RotateCcw size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={onInteractToggle}
                        style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${isInteractive ? '#6366F1' : '#E5E7EB'}`,
                            backgroundColor: isInteractive ? '#EEF2FF' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title={isInteractive ? "Exite Interact Mode" : "Enter Interact Mode"}
                >
                    {isInteractive ? <Hand size={14} color={isInteractive ? '#6366F1' : '#6B7280'} /> : <MousePointer2 size={14} color={isInteractive ? '#6366F1' : '#6B7280'} />}
                </button>
                <button
                    onClick={onGridToggle}
                    style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${showGrid ? '#6366F1' : '#E5E7EB'}`,
                        backgroundColor: showGrid ? '#EEF2FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Toggle grid overlay"
                >
                    <Grid size={14} color={showGrid ? '#6366F1' : '#6B7280'} />
                </button>
                {onScreenshot && (
                    <button
                        onClick={onScreenshot}
                        style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        title="Take screenshot"
                    >
                        <Camera size={14} color="#6B7280" />
                    </button>
                )}
                <button
                    onClick={onPreviewToggle}
                    style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${isPreview ? '#10B981' : '#E5E7EB'}`,
                        backgroundColor: isPreview ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title={isPreview ? "Exit Preview" : "Preview Experience"}
                >
                    <Play size={14} color={isPreview ? '#10B981' : '#6B7280'} fill={isPreview ? '#10B981' : 'none'} />
                </button>
                </div>
            </div>
        </div>
    );
};
