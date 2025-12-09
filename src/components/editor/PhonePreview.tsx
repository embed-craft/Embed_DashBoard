import React from 'react';
import { theme } from '@/styles/design-tokens';

interface DevicePreset {
    id: string;
    name: string;
    width: number;
    height: number;
    frameImage?: string;
}

interface PhonePreviewProps {
    device: DevicePreset;
    zoom: number;
    showGrid: boolean;
    children: React.ReactNode;
    backgroundUrl?: string; // App Screen Image
    pageContext?: any;      // Page Data with elements
    onElementSelect?: (elementId: string) => void;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
    device,
    zoom,
    showGrid,
    children,
    backgroundUrl,
    pageContext,
    onElementSelect
}) => {
    // Scale dimensions based on zoom
    const width = device.width * zoom;
    const height = device.height * zoom;

    // Frame Style (Simple CSS Frame mimicking an iPhone)
    const frameBorderWidth = 14 * zoom;
    const frameRadius = 40 * zoom;

    return (
        <div style={{
            position: 'relative',
            width: width + (frameBorderWidth * 2), // Add frame width
            height: height + (frameBorderWidth * 2),
            margin: '0 auto',
            transition: 'all 0.3s ease'
        }}>
            {/* Phone Body / Frame */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#1f2937', // Dark Gray Frame
                borderRadius: `${frameRadius}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 10
            }}>
                {/* Dynamic Island / Notch */}
                <div style={{
                    position: 'absolute',
                    top: `${14 * zoom}px`, // Adjusted for frame width
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${120 * zoom}px`,
                    height: `${35 * zoom}px`,
                    backgroundColor: 'black',
                    borderRadius: `${20 * zoom}px`,
                    zIndex: 20
                }} />
            </div>

            {/* Screen Content Area */}
            <div style={{
                position: 'absolute',
                top: frameBorderWidth,
                left: frameBorderWidth,
                width: width,
                height: height,
                backgroundColor: 'white',
                borderRadius: `${frameRadius - 5}px`, // Slightly smaller radius for screen
                overflow: 'hidden',
                zIndex: 11,
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* 1. App Background Layer (if selected) */}
                {backgroundUrl && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        backgroundImage: backgroundUrl.startsWith('http') ? `url(${backgroundUrl})` : `url(${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${backgroundUrl})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        opacity: 1 // Full opacity for realism
                    }}>
                        {/* Interactive Element Overlays */}
                        {pageContext?.elements?.map((el: any) => {
                            // Correctly handle potential missing rect
                            if (!el.rect) return null;

                            // Calculate scaled positions (assuming rect is in % or original px needs scaling? 
                            // Usually rect is x,y,w,h. If stored in px relative to original 1080x1920, we calculate ratio.
                            // Let's assume backend stores px relative to provided deviceMetadata.
                            // We need a way to scale correctly. 
                            // SIMPLE APPROACH: Render percentage based if possible, or ratio based.
                            // fallback to simple percentage assumption if no deviceMetadata provided.

                            const deviceMeta = pageContext?.deviceMetadata || { width: 1080, height: 1920 };
                            const scaleX = width / deviceMeta.width;
                            const scaleY = height / deviceMeta.height;

                            return (
                                <div
                                    key={el.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onElementSelect?.(el.id);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: el.rect.x * scaleX,
                                        top: el.rect.y * scaleY,
                                        width: el.rect.w * scaleX,
                                        height: el.rect.h * scaleY,
                                        border: '1px dashed rgba(124, 58, 237, 0.5)', // Purple dashed
                                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                        cursor: 'pointer',
                                        zIndex: 2, // Above background, below Campaign Layers
                                        transition: 'all 0.2s',
                                    }}
                                    className="hover:bg-purple-500/20 hover:border-purple-500"
                                    title={`Target Element: ${el.tagName} (${el.id})`}
                                />
                            )
                        })}
                    </div>
                )}

                {/* 2. Grid Layer (Optional) */}
                {showGrid && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 3,
                            pointerEvents: 'none',
                            backgroundImage: `linear-gradient(${theme.colors.border.default} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.border.default} 1px, transparent 1px)`,
                            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                        }}
                    />
                )}

                {/* 3. Campaign Canvas Children (Nudges) */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
                    {children}
                </div>

            </div>
        </div>
    );
};


