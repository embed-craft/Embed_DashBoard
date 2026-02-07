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
    // Determine Position
    const position = config?.position || 'bottom';
    const isTop = position === 'top';

    // Create modified config for BottomSheet
    // Override Floater-specific properties and add defaults FloaterRenderer expects
    const bottomSheetConfig = React.useMemo(() => {
        const modifiedConfig = { ...config };

        // Force BottomSheet-specific values
        modifiedConfig.position = isTop ? 'top-center' : 'bottom-center';
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
        // Logic: Pass shadow config but disable simple boxShadow string to avoid duplicates if wrapper handles it.
        // Actually wrapper handles shadow? User asked for Shadow on Banner.
        // Implementation Plan said: Shadow logic differs.
        // Top: Offset Y positive. Bottom: Offset Y negative.
        // Let's rely on wrapper for shadow to ensure it's outside clipping.
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
    }, [config, isTop]);

    // Calculate border radius
    const radiusValue = config?.borderRadius;
    let radiusPx = 16;
    if (typeof radiusValue === 'number') {
        radiusPx = radiusValue;
    } else if (typeof radiusValue === 'object' && radiusValue !== null) {
        // If top: use bottom corners. If bottom: use top corners.
        // Editor saves to "borderRadius" object or number.
        // Usually editor saves: { topLeft: x, topRight: x } for BottomSheet.
        // For Banner legacy, it might be { bottomLeft: x, bottomRight: x }.
        // We'll just take the max value or first available.
        const values = Object.values(radiusValue).filter(v => typeof v === 'number') as number[];
        if (values.length > 0) radiusPx = Math.max(...values);
    }

    // Extract border properties
    const borderWidth = config?.borderWidth || 0;
    const borderColor = config?.borderColor || '#000000';
    const borderStyle = config?.borderStyle || 'solid';

    // BottomSheet wrapper style - always full width
    const outerWrapperStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTop ? 'flex-start' : 'flex-end', // Top vs Bottom alignment
        pointerEvents: 'none',
    };

    // Shadow Logic
    const shadow = config?.shadow;
    const boxShadow = (shadow?.enabled)
        ? `0px ${isTop ? '4px' : '-4px'} ${shadow.blur || 12}px ${shadow.spread || 0}px ${shadow.color || 'rgba(0,0,0,0.2)'}`
        : undefined;

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

                // Radius (Top has Bottom Radius, Bottom has Top Radius)
                borderTopLeftRadius: !isTop ? `${radiusPx}px` : undefined,
                borderTopRightRadius: !isTop ? `${radiusPx}px` : undefined,
                borderBottomLeftRadius: isTop ? `${radiusPx}px` : undefined,
                borderBottomRightRadius: isTop ? `${radiusPx}px` : undefined,

                // Border (Skip the edge connected to screen edge)
                borderTop: (!isTop && borderWidth > 0) ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                borderBottom: (isTop && borderWidth > 0) ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                borderLeft: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
                borderRight: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,

                boxShadow: boxShadow,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',

                // Padding for Drag Handle
                paddingTop: (!isTop && config?.dragHandle) ? '12px' : '0px',
                paddingBottom: (isTop && config?.dragHandle) ? '12px' : '0px',
            }}>


                {/* Visual Drag Handle */}
                {config?.dragHandle && (
                    <div style={{
                        position: 'absolute',
                        zIndex: 1,
                        top: !isTop ? 8 : undefined,
                        bottom: isTop ? 8 : undefined,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
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
