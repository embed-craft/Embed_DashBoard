import { Smartphone, ZoomIn, ZoomOut, Maximize2, Grid, RotateCw, Camera, MousePointer2, Hand, Play } from 'lucide-react';
import { DEVICE_PRESETS, DevicePreset } from '@/lib/devicePresets';

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
    onResetZoom
}) => {
    const currentDevice = DEVICE_PRESETS.find(d => d.id === selectedDevice);
    console.log('[PreviewToolbar] Rendering. isInteractive:', isInteractive);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            gap: '16px'
        }}>
            {/* Left: Device Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Smartphone size={16} color="#6B7280" />
                <select
                    value={selectedDevice}
                    onChange={(e) => onDeviceChange(e.target.value)}
                    style={{
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
                    }}
                >
                    {DEVICE_PRESETS.map(device => (
                        <option key={device.id} value={device.id}>
                            {device.name}
                        </option>
                    ))}
                </select>
                {currentDevice && (
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {currentDevice.width} × {currentDevice.height}
                    </span>
                )}
            </div>

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
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', minWidth: '50px', textAlign: 'center' }}>
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
                    Reset
                </button>
            </div>

            {/* Right: Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    );
};
