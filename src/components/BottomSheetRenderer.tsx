import React from 'react';
import { FloaterRenderer } from './FloaterRenderer';

/**
 * BottomSheet Renderer - Thin wrapper around FloaterRenderer
 * 
 * Uses FloaterRenderer as the core renderer with these overrides:
 * - Position: Always bottom-center (no drag positioning)
 * - Draggable: Disabled → Replaced with swipe-to-dismiss (if needed)
 * - Expanded: Disabled (no expand feature)
 * - Border Radius: Bottom corners forced to 0
 */

interface BottomSheetRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    colors: any;
    config?: any;
    onDismiss?: () => void;
    isInteractive?: boolean;
    onNavigate?: (screenName: string) => void;
    scale?: number;
    scaleY?: number;
    onInterfaceAction?: (interfaceId: string) => void;
}

export const BottomSheetRenderer: React.FC<BottomSheetRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    config,
    onDismiss,
    isInteractive = false,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {
    // Create modified config for BottomSheet
    // Override Floater-specific properties and add defaults FloaterRenderer expects
    const bottomSheetConfig = React.useMemo(() => {
        const modifiedConfig = { ...config };

        // Force BottomSheet-specific values
        modifiedConfig.position = 'bottom-center';
        modifiedConfig.offsetX = 0;
        modifiedConfig.offsetY = 0;
        modifiedConfig.draggable = false;
        modifiedConfig.expanded = false;

        // Set default width to 100% for BottomSheet
        modifiedConfig.width = modifiedConfig.width || '100%';

        // FIX: FloaterRenderer's safeScale breaks on objects and applies radius/border to all 4 corners.
        // We move these to our wrapper div and disable them on the inner box.
        modifiedConfig.borderRadius = 0;
        modifiedConfig.backgroundColor = 'transparent';
        modifiedConfig.backgroundImageUrl = ''; // FIX: Prevent double background rendering (handled by wrapper)
        modifiedConfig.borderWidth = 0;
        modifiedConfig.shadow = { enabled: false };

        // Ensure behavior exists with disabled Floater features
        modifiedConfig.behavior = {
            ...(modifiedConfig.behavior || {}),
            draggable: false,
            snapToCorner: false,
            doubleTapToDismiss: false,
        };

        // Ensure controls exists with BottomSheet defaults
        modifiedConfig.controls = {
            ...(modifiedConfig.controls || {}),
            closeButton: { show: modifiedConfig.showCloseButton ?? false, position: 'top-right', size: 14 },
            expandButton: { show: false },
            muteButton: { show: false },
            progressBar: { show: false },
        };

        // Ensure media exists (empty default)
        modifiedConfig.media = modifiedConfig.media || { url: '', type: 'none' };

        // Pass overflow setting
        modifiedConfig.overflow = config?.overflow || 'hidden'; // Default to hide per user request

        // FIX: Disable overlay in FloaterRenderer as we render it externally in BottomSheetRenderer
        // preventing "Double Background" / Scrim-inside-sheet issue
        modifiedConfig.overlay = { enabled: false };

        return modifiedConfig;
    }, [config]);

    // Calculate top border radius
    const radiusValue = config?.borderRadius;
    let topRadius = 16;
    if (typeof radiusValue === 'number') {
        topRadius = radiusValue;
    } else if (typeof radiusValue === 'object' && radiusValue !== null) {
        topRadius = radiusValue.topLeft ?? radiusValue.topRight ?? 16;
    }

    // Extract border properties
    const borderWidth = config?.borderWidth || 0;
    const borderColor = config?.borderColor || '#000000';
    const borderStyle = config?.borderStyle || 'solid';

    // BottomSheet wrapper style - always at bottom, full height for percentage support
    const outerWrapperStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
    };

    return (
        <div style={outerWrapperStyle}>
            {/* External Overlay (Scrim) - Rendered here to be behind the sheet but cover screen */}
            {config?.overlay?.enabled && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: config.overlay.color || '#000000',
                        opacity: config.overlay.opacity ?? 0.5,
                        backdropFilter: config.overlay.blur ? `blur(${config.overlay.blur}px)` : undefined,
                        pointerEvents: 'auto', // Allow clicking scrim to dismiss
                        zIndex: 0
                    }}
                    onClick={() => {
                        if (config.overlay.dismissOnClick && onDismiss) onDismiss();
                    }}
                />
            )}

            <div style={{
                pointerEvents: 'auto',
                width: '100%',
                height: config?.height || 'auto', // Apply height here
                maxHeight: '100%',
                position: 'relative', // FIX: Position context for absolute content
                backgroundColor: (config?.backgroundColor === 'transparent' || config?.backgroundColor === '#00000000')
                    ? 'transparent'
                    : (config?.backgroundColor || '#FFFFFF'),
                backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                backgroundSize: config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover'),
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                // Radius (Top only)
                borderTopLeftRadius: `${topRadius}px`,
                borderTopRightRadius: `${topRadius}px`,
                // Border (Top and Sides)
                borderTop: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                borderLeft: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                borderRight: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                paddingTop: config?.dragHandle ? '12px' : '0px',
            }}>
                {/* Visual Drag Handle */}
                {config?.dragHandle && (
                    <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 100,
                    }}>
                        <div style={{
                            width: '40px',
                            height: '4px',
                            backgroundColor: 'rgba(0,0,0,0.15)',
                            borderRadius: '2px'
                        }} />
                    </div>
                )}

                <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0 }}>
                    <FloaterRenderer
                        layers={layers}
                        selectedLayerId={selectedLayerId}
                        onLayerSelect={onLayerSelect}
                        onLayerUpdate={onLayerUpdate}
                        colors={colors}
                        config={{
                            ...bottomSheetConfig,
                            height: '100%', // Fill the container
                            overflow: config?.overflow || 'hide'
                        }}
                        isInteractive={isInteractive}
                        onDismiss={onDismiss}
                        onNavigate={onNavigate}
                        onInterfaceAction={onInterfaceAction}
                        scale={scale}
                        scaleY={scaleY}
                    />
                </div>
            </div>
        </div>
    );
};
