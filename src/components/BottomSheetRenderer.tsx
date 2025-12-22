import React, { useRef } from 'react';
import { Layer, BottomSheetConfig, LayerStyle } from '@/store/useEditorStore';
import { Settings2, X, Code } from 'lucide-react';
import { ShadowDomWrapper } from '@/components/ShadowDomWrapper';

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
    scale = 1 // Default to 1
}) => {
    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal; // Ignore percentages
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };
    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;

        console.log('Action triggered:', action);

        switch (action.type) {
            case 'close':
            case 'dismiss': // Handle both temporarily
                if (onDismiss) onDismiss();
                else console.log('Dismiss action (no handler)');
                break;
            case 'deeplink':
                if (action.url) {
                    window.open(action.url, '_blank');
                    // notification handled by browser opening new tab, but redundant toast doesn't hurt
                }
                break;
            case 'navigate':
                if (action.screenName && onNavigate) {
                    onNavigate(action.screenName);
                } else {
                    console.log('Navigation action triggered:', action.screenName);
                }
                break;
            case 'custom':
                console.log(`Custom Event: ${action.eventName}`);
                break;
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    // Find the generic 'container' layer if it exists, otherwise use config
    // In "Minimal Solid", we might just rely on config for the container style 
    // and treat 'layers' as children of that container.
    // However, the legacy structure often had a "Container" layer. 
    // We will iterate all layers. If a layer is a child of another, we skip it (handled by recursion if we did that, but ModalRenderer does flat map).
    // ModalRenderer defines 'childLayers' as layers where parent === modalLayer.id.

    // Let's assume a simplified Model:
    // The BottomSheet ITSELF is the container.
    // All top-level layers (parent === null) are children of the sheet?
    // Or if there is a 'container' layer, we use that?
    // Let's try to find a root container layer.
    const rootLayer = layers.find(l => l.type === 'container' && l.name === 'Bottom Sheet')
        || layers.find(l => l.type === 'container')
        || null;

    // If we have a root layer, we render its children.
    // If no root layer, we render all layers (fallback).
    // If we have a root layer, we render its children.
    // If no root layer, we render all layers (fallback).
    let children = rootLayer
        ? layers.filter(l => l.parent === rootLayer.id)
        : layers;

    // Detect Full Page Mode: Only if explicitly flagged
    const fullPageLayer = layers.find(l =>
        l.type === 'custom_html' &&
        l.content?.fullPageMode === true
    );
    const isFullPageModeRef = !!fullPageLayer;

    console.log('BottomSheetRenderer Debug:', {
        totalLayers: layers.length,
        isFullPageMode: isFullPageModeRef,
        customLayer: fullPageLayer
    });

    if (isFullPageModeRef) {
        // EXCLUSIVE MODE: Filter to show ONLY the Custom HTML layer(s) that are flagged as full page
        children = layers.filter(l => l.type === 'custom_html' && l.content?.fullPageMode === true);
    } else {
        // Sort by zIndex to ensure correct stacking context
        children = children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }

    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';

        // Apply Scaling to Style Properties (SDK Logic)
        const scaledStyle: any = {
            ...layer.style,
            top: safeScale(layer.style?.top, scale),
            bottom: safeScale(layer.style?.bottom, scale),
            left: safeScale(layer.style?.left, scale),
            right: safeScale(layer.style?.right, scale),
            // SDK Logic: Wrapper Width = style.width || size.width
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scale),
            marginTop: safeScale(layer.style?.marginTop, scale),
            marginBottom: safeScale(layer.style?.marginBottom, scale),
            marginLeft: safeScale(layer.style?.marginLeft, scale),
            marginRight: safeScale(layer.style?.marginRight, scale),
            paddingTop: safeScale(layer.style?.paddingTop, scale),
            paddingBottom: safeScale(layer.style?.paddingBottom, scale),
            paddingLeft: safeScale(layer.style?.paddingLeft, scale),
            paddingRight: safeScale(layer.style?.paddingRight, scale),
            // Handle borderRadius: if object, serialize to string, if number/string, scale
            borderRadius: typeof layer.style?.borderRadius === 'object'
                ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
                : safeScale(layer.style?.borderRadius, scale),
            fontSize: safeScale(layer.style?.fontSize, scale),
        };

        // SDK PARITY: Margin Precedence Logic
        // 1. Explicit marginTop/Bottom > 2. Shorthand margin > 3. Default (for relative only)

        let finalMarginTop = safeScale(layer.style?.marginTop, scale);
        let finalMarginBottom = safeScale(layer.style?.marginBottom, scale);
        let finalMarginLeft = safeScale(layer.style?.marginLeft, scale);
        let finalMarginRight = safeScale(layer.style?.marginRight, scale);
        let finalMargin = undefined;

        // Handle generic margin shorthand
        if (layer.style?.margin) {
            if (typeof layer.style.margin === 'string' && layer.style.margin.includes(' ')) {
                // Complex string (e.g. "10px 20px") - pass through
                finalMargin = layer.style.margin;
            } else {
                // Simple number/string - scale it
                finalMargin = safeScale(layer.style.margin, scale);
            }
        }

        // Apply defaults if NO margin is set
        if (!isAbsolute && layer.type !== 'custom_html') {
            // If no explicit marginBottom AND no shorthand margin, apply default
            if (finalMarginBottom === undefined && finalMargin === undefined) {
                finalMarginBottom = safeScale(10, scale);
            }
        }

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            margin: finalMargin, // Shorthand first
            marginTop: finalMarginTop, // Specific overrides second (wins)
            marginBottom: finalMarginBottom,
            marginLeft: finalMarginLeft,
            marginRight: finalMarginRight,
            ...scaledStyle
        };

        // FORCE overrides for Full Page Mode Custom HTML
        // This ensures even if layer.style is missing width/height, the wrapper fills the screen
        if (isFullPageModeRef && layer.type === 'custom_html') {
            baseStyle.width = '100%';
            baseStyle.height = '100%';
            baseStyle.position = 'absolute';
            baseStyle.top = 0;
            baseStyle.left = 0;
            baseStyle.right = 0;
            baseStyle.bottom = 0;
            baseStyle.marginBottom = 0;
        }

        let content = null;

        switch (layer.type) {
            case 'text':
                // Construct Text Shadow
                const textShadow = (layer.content?.textShadowX || layer.content?.textShadowY || layer.content?.textShadowBlur)
                    ? `${safeScale(layer.content.textShadowX || 0, scale)} ${safeScale(layer.content.textShadowY || 0, scale)} ${safeScale(layer.content.textShadowBlur || 0, scale)} ${layer.content.textShadowColor || '#000000'}`
                    : undefined;

                content = (
                    <div style={{
                        fontSize: layer.content.fontSize || 16,
                        color: layer.content.textColor || 'black',
                        fontWeight: layer.content.fontWeight || 400, // Now purely numeric
                        textAlign: layer.content.textAlign || 'left',
                        fontFamily: layer.content.fontFamily ? `'${layer.content.fontFamily}', sans-serif` : 'inherit',
                        textShadow: textShadow,
                        whiteSpace: 'pre-wrap' // Better multi-line support
                    }}>
                        {/* Inject Custom Font CSS if URL provided */}
                        {layer.content.fontUrl && (
                            <style>
                                {`@import url('${layer.content.fontUrl}');`}
                            </style>
                        )}
                        {layer.content.text || 'Text'}
                    </div>
                );
                break;
            case 'media': // Handle 'media' as alias for 'image'
                content = (
                    <img
                        src={layer.content.imageUrl || 'https://via.placeholder.com/150'} // Fallback
                        alt={layer.name}
                        style={{
                            // SDK Logic: Inner Image is ALWAYS 100% of Wrapper
                            width: '100%',
                            height: '100%',
                            display: 'block', // Prevent inline whitespace issues
                            borderRadius: typeof layer.style?.borderRadius === 'object'
                                ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
                                : (layer.style?.borderRadius || 0),
                            objectFit: (layer.style?.objectFit as any) || 'cover'
                        }}
                    />
                );
                break;
            case 'handle':
                content = (
                    <div style={{
                        width: layer.size?.width || 40,
                        height: layer.size?.height || 4,
                        backgroundColor: layer.style?.backgroundColor || '#e5e7eb',
                        borderRadius: typeof layer.style?.borderRadius === 'object'
                            ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
                            : (layer.style?.borderRadius || 2),
                        margin: '0 auto'
                    }} />
                );
                break;
            case 'button':
                // SDK Match: padding 10px 20px (scaled), inherit border-radius, font-weight 600 default
                content = (
                    <button style={{
                        padding: `${safeScale(10, scale)} ${safeScale(20, scale)}`,
                        backgroundColor: 'transparent', // Wrapper handles background
                        color: layer.content.textColor || 'white',
                        border: 'none',
                        borderRadius: 'inherit',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: safeScale(layer.content.fontSize || 14, scale),
                        fontWeight: layer.style?.fontWeight || 600,
                        fontFamily: 'inherit',
                        lineHeight: 'inherit'
                    }}>
                        {layer.content.label || 'Button'}
                    </button>
                );
                break;
            case 'custom_html':
                content = (
                    <ShadowDomWrapper
                        html={layer.content?.html || '<div style="padding:10px; border:1px dashed #ccc; color:#999">Empty HTML Layer</div>'}
                        style={{ width: '100%', height: '100%' }}
                    />
                );
                break;
            default:
                content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown Layer: {layer.type}</div>;
        }

        // Calculate Clip Path
        let clipPath = layer.style?.clipPath;
        const shape = layer.style?.clipPathShape;

        if (shape === 'circle') {
            clipPath = 'circle(50% at 50% 50%)';
        } else if (shape === 'pill') {
            const r = layer.style?.borderRadius || 9999;
            // For pill, high border radius usually does the trick, but clip-path is safer for images
            // Actually, border-radius is often better for simple pills, but let's support explicit clip
            // if user selected 'pill', we might want to force border radius?
            // Let's rely on standard border-radius for 'pill' shape usually, but here we can enforce it.
            // If valid clip-path string provided (custom), use it.
        }

        // Apply clip-path if it exists (for custom or circle)
        // Note: For 'rectangle' and 'pill', we usually rely on borderRadius, so we don't strictly need clip-path
        // unless provided.
        if (clipPath) {
            // @ts-ignore
            scaledStyle.clipPath = clipPath;
            // @ts-ignore
            scaledStyle.WebkitClipPath = clipPath;
        } else if (shape === 'pill') {
            // Enforce pill via border radius if not using clip-path
            scaledStyle.borderRadius = 9999;
        }

        return (
            <div
                key={layer.id}
                onClick={(e) => {
                    e.stopPropagation();
                    if (config?.isInteractive) {
                        handleAction(layer.content?.action);
                    } else {
                        onLayerSelect(layer.id);
                    }
                }}
                style={{
                    ...baseStyle,
                    outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box', // SDK Match
                    // Apply button background to wrapper to match SDK "Container" behavior
                    ...(layer.type === 'button' ? {
                        backgroundColor: layer.style?.backgroundColor || layer.content.themeColor || '#6366f1'
                    } : {})
                }}
            >
                {content}
            </div>
        );
    };

    const overlayOpacity = config?.overlay?.enabled ? (config.overlay.opacity ?? 0.5) : 0;
    // SDK Fallback: Black 50%
    const overlayColor = config?.overlay?.color || '#000000';

    const sheetStyle: React.CSSProperties = isFullPageModeRef ? {
        // FULL PAGE OVERRIDE: Transparent Canvas
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderRadius: 0,
        padding: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden', // SDK Parity: Clipping
        lineHeight: 1.5, // SDK Global Reset
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    } : {
        // STANDARD MODE
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: config?.height || 'auto',
        minHeight: '100px',
        // SDK Parity: Transparent Background Support
        // If config.backgroundColor is 'transparent' or '#00000000', treat as transparent.
        backgroundColor: (config?.backgroundColor === 'transparent' || config?.backgroundColor === '#00000000')
            ? 'transparent'
            : (config?.backgroundColor || 'white'),
        backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
        backgroundSize: config?.backgroundSize || 'contain',  // Use contain to show full image
        backgroundPosition: 'bottom center',
        backgroundRepeat: 'no-repeat',
        borderTopLeftRadius: safeScale(config?.borderRadius?.topLeft || 16, scale),
        borderTopRightRadius: safeScale(config?.borderRadius?.topRight || 16, scale),
        boxShadow: config?.boxShadow || 'none',
        overflow: 'visible', // Allow background to extend beyond bounds
        // SDK Parity: Use minimal explicit padding if configured, else 0
        paddingTop: safeScale(config?.padding?.top || 0, scale),
        paddingRight: safeScale(config?.padding?.right || 0, scale),
        paddingBottom: safeScale(config?.padding?.bottom || 0, scale),
        paddingLeft: safeScale(config?.padding?.left || 0, scale),

        zIndex: 100, // SDK Parity: Sheet (100) > Overlay (99)
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        boxSizing: 'border-box',
        lineHeight: 1.5, // SDK Global Reset
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#111827',
        ...config?.style
    };


    const showHandle = config?.dragHandle && !isFullPageModeRef;
    const showClose = config?.showCloseButton && !isFullPageModeRef;

    console.log('🖼️ Dashboard Background Debug:', {
        backgroundImageUrl: config?.backgroundImageUrl,
        backgroundSize: config?.backgroundSize,
        height: config?.height,
        sheetStyleBgImage: sheetStyle.backgroundImage,
        sheetStyleBgSize: sheetStyle.backgroundSize,
        sheetStyleBgPosition: sheetStyle.backgroundPosition
    });

    return (
        <>
            {/* Overlay */}
            {config?.overlay?.enabled && (
                <div
                    onClick={() => { if (config.overlay.dismissOnClick && onDismiss) onDismiss(); }}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: overlayColor,
                        opacity: overlayOpacity,
                        zIndex: 99
                    }}
                />
            )}

            {/* Sheet */}
            <div
                ref={containerRef}
                style={sheetStyle}
            >
                {/* Handle bar (cosmetic) - Controlled by config */}
                {showHandle && (
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        margin: '0 auto 16px auto',
                        flexShrink: 0
                    }} />
                )}

                {/* Close Button - Controlled by config */}
                {config?.showCloseButton && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDismiss) onDismiss();
                        }}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    >
                        <span style={{ fontSize: '20px', lineHeight: 1 }}>×</span>
                    </button>
                )}

                {/* SDK Parity: SPLIT LAYERS */}
                {/* 1. Relative Layers -> Scrollable Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
                    {children
                        .filter(l => {
                            const isAbs = l.style?.position === 'absolute' || l.style?.position === 'fixed';
                            return !isAbs;
                        })
                        .map(layer => renderLayer(layer))}
                </div>

                {/* 2. Absolute Layers -> Direct Overlay (Fixed to Sheet) */}
                {children
                    .filter(l => {
                        const isAbs = l.style?.position === 'absolute' || l.style?.position === 'fixed';
                        return isAbs;
                    })
                    .map(renderLayer)}

            </div>
        </>
    );
};
