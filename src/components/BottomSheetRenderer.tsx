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
    onAction?: (action: any) => void;
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
    scale = 1,
    scaleY = 1,
    onInterfaceAction,
    onAction,
}) => {
    // Determine Position (Fix Phase 2: Support legacy 'top-center')
    const position = config?.position || 'bottom';
    const isTop = position === 'top' || position === 'top-center';

    // Phase 2 Parity: Keyboard Avoidance via visualViewport
    const [keyboardOffset, setKeyboardOffset] = React.useState(0);
    React.useEffect(() => {
        if (!window.visualViewport || isTop) return;
        
        const viewport = window.visualViewport;
        const initialHeight = window.innerHeight; // Baseline height
        
        const handleResize = () => {
            const currentHeight = viewport.height;
            const diff = initialHeight - currentHeight;
            setKeyboardOffset(diff > 0 ? diff : 0);
        };
        
        viewport.addEventListener('resize', handleResize);
        return () => viewport.removeEventListener('resize', handleResize);
    }, [isTop]);

    // Helper to safely scale numeric values
    const safeScale = (val: string | number | undefined, scaleFactor: number): string | undefined => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === 'number') return `${val * scaleFactor}px`;
        if (typeof val === 'string') {
            if (val.endsWith('%')) return val; // Do not scale percentages physically
            if (val.endsWith('px')) {
                const num = parseFloat(val);
                if (!isNaN(num)) return `${num * scaleFactor}px`;
            }
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) return `${parsed * scaleFactor}px`;
        }
        return val;
    };

    // Find the root container layer (usually Floater Container or Bottom Sheet)
    const rootLayer = React.useMemo(() => {
        if (!layers || layers.length === 0) return null;
        return layers.find(
            l => l.type === 'container' && (l.name === 'Floater Container' || l.name === 'FloaterContainer' || l.name === 'Bottom Sheet')
        ) || layers[0];
    }, [layers]);

    // Sanitized layers: Remove background from the root container layer to avoid double background rendering
    const sanitizedLayers = React.useMemo(() => {
        if (!layers || layers.length === 0 || !rootLayer) return layers;

        return layers.map(layer => {
            if (layer.id === rootLayer.id) {
                const newStyle = { ...layer.style };
                delete newStyle.backgroundImage;
                delete newStyle.backgroundColor;
                return {
                    ...layer,
                    style: newStyle
                };
            }
            return layer;
        });
    }, [layers, rootLayer]);

    // Hoist background image URL from config OR root layer style
    const hoistedBgUrl = React.useMemo(() => {
        let bgUrl = config?.backgroundImageUrl || '';
        if (!bgUrl && rootLayer?.style?.backgroundImage) {
            const styleBg = rootLayer.style.backgroundImage;
            if (styleBg && styleBg.startsWith('url(')) {
                bgUrl = styleBg
                    .replace('url(', '')
                    .replace(')', '')
                    .replace(/"/g, '')
                    .replace(/'/g, '')
                    .trim();
            } else if (styleBg && (styleBg.startsWith('http') || styleBg.startsWith('data:'))) {
                bgUrl = styleBg.trim();
            }
        }
        return bgUrl;
    }, [config?.backgroundImageUrl, rootLayer]);

    // Hoist background color from config OR root layer style
    const hoistedBgColor = React.useMemo(() => {
        if (config?.backgroundColor && config.backgroundColor !== 'transparent' && config.backgroundColor !== '#00000000') {
            return config.backgroundColor;
        }
        if (rootLayer?.style?.backgroundColor && rootLayer.style.backgroundColor !== 'transparent' && rootLayer.style.backgroundColor !== '#00000000') {
            return rootLayer.style.backgroundColor;
        }
        return '#FFFFFF';
    }, [config?.backgroundColor, rootLayer]);

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

        // Radii/borders are handled by our outer wrapper, so we strip them from the inner box
        modifiedConfig.borderRadius = 0;
        modifiedConfig.backgroundColor = 'transparent';
        modifiedConfig.backgroundImageUrl = ''; // Prevent double background rendering
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
            closeButton: {
                show: modifiedConfig.controls?.closeButton?.show ?? modifiedConfig.showCloseButton ?? false,
                position: 'top-right',
                size: 14
            },
            expandButton: { show: false },
            muteButton: { show: false },
            progressBar: { show: false },
        };

        // Ensure media exists (empty default)
        modifiedConfig.media = modifiedConfig.media || { url: '', type: 'none' };

        // Pass overflow setting
        modifiedConfig.overflow = config?.overflow || 'hidden';

        // Disable overlay in FloaterRenderer as we render it externally in BottomSheetRenderer
        modifiedConfig.overlay = { enabled: false };

        return modifiedConfig;
    }, [config, isTop]);

    // Calculate border radius
    const radiusValue = config?.borderRadius;
    let radiusPx = 16;
    if (typeof radiusValue === 'number') {
        radiusPx = radiusValue;
    } else if (typeof radiusValue === 'object' && radiusValue !== null) {
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
        transform: `translateY(${-keyboardOffset}px)`,
        transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };

    // Shadow Logic
    const shadow = config?.shadow;
    const boxShadow = (shadow?.enabled)
        ? `0px ${isTop ? 4 * scale : -4 * scale}px ${(shadow.blur || 12) * scale}px ${(shadow.spread || 0) * scale}px ${shadow.color || 'rgba(0,0,0,0.2)'}`
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
                        backdropFilter: config.overlay.blur ? `blur(${config.overlay.blur * scale}px)` : undefined,
                        pointerEvents: 'auto', // Allow clicking scrim to dismiss
                        zIndex: 0
                    }}
                    onClick={() => {
                        const shouldDismiss = config.overlay.dismissOnClick ?? true;
                        if (shouldDismiss && onDismiss) onDismiss();
                    }}
                />
            )}

            <div style={{
                pointerEvents: 'auto',
                width: '100%',
                height: safeScale(config?.height, scaleY) || 'auto', // Apply height here
                maxHeight: '100%',
                position: 'relative', // Position context for absolute content
                backgroundColor: (hoistedBgColor === 'transparent' || hoistedBgColor === '#00000000')
                    ? 'transparent'
                    : hoistedBgColor,
                backgroundImage: hoistedBgUrl ? `url('${hoistedBgUrl}')` : undefined,
                backgroundSize: config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover'),
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',

                // Radius (Top has Bottom Radius, Bottom has Top Radius)
                borderTopLeftRadius: !isTop ? `${radiusPx * scale}px` : undefined,
                borderTopRightRadius: !isTop ? `${radiusPx * scale}px` : undefined,
                borderBottomLeftRadius: isTop ? `${radiusPx * scale}px` : undefined,
                borderBottomRightRadius: isTop ? `${radiusPx * scale}px` : undefined,

                // Border (Skip the edge connected to screen edge)
                borderTop: (!isTop && borderWidth > 0) ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderBottom: (isTop && borderWidth > 0) ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderLeft: borderWidth > 0 ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,
                borderRight: borderWidth > 0 ? `${borderWidth * scale}px ${borderStyle} ${borderColor}` : undefined,

                boxShadow: boxShadow,
                overflow: config?.overflow === 'scroll' ? 'auto' : 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',

                paddingTop: isTop ? 'env(safe-area-inset-top)' : (config?.dragHandle ? `${12 * scale}px` : '0px'),
                paddingBottom: !isTop ? 'env(safe-area-inset-bottom)' : (config?.dragHandle ? `${12 * scale}px` : '0px'),
            }}>

                {/* Visual Drag Handle */}
                {config?.dragHandle && (
                    <div style={{
                        position: 'absolute',
                        zIndex: 1,
                        top: !isTop ? 8 * scale : undefined,
                        bottom: isTop ? 8 * scale : undefined,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            width: `${40 * scale}px`,
                            height: `${4 * scale}px`,
                            backgroundColor: 'rgba(0,0,0,0.15)',
                            borderRadius: `${2 * scale}px`
                        }} />
                    </div>
                )}

                <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0 }}>
                    <FloaterRenderer
                        layers={sanitizedLayers}
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
                        onAction={onAction}
                        scale={scale}
                        scaleY={scaleY}
                    />
                </div>
            </div>
        </div>
    );
};
