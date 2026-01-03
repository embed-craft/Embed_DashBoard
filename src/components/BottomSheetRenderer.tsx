import React, { useRef, useEffect } from 'react';
import { Layer, BottomSheetConfig, LayerStyle } from '@/store/useEditorStore';
import { Settings2, X, Code } from 'lucide-react';
import { ShadowDomWrapper } from '@/components/ShadowDomWrapper';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';

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
    scaleY?: number; // Fix 16: Hybrid Scaling
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
    scale = 1, // Default to 1
    scaleY = 1 // Fix 16: Vertical scale default
}) => {
    // MODAL PARITY: Design Device Dimensions (iPhone 14 Pro)
    const designWidth = 393;
    const designHeight = 852;

    // SDK Parity: Safe Scale Helper (for SIZES only)
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Guard: Track when interact mode was enabled to prevent auto-triggering
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    // MODAL PARITY: Convert X position to percentage of design width
    const toPercentX = (val: any): string | undefined => {
        if (val == null) return undefined;
        const str = val.toString().trim();
        if (str.endsWith('%')) return str; // Already percentage
        const num = parseFloat(str);
        if (isNaN(num)) return undefined;
        return `${(num / designWidth) * 100}%`;
    };

    // MODAL PARITY: Convert Y position to percentage of design height
    const toPercentY = (val: any): string | undefined => {
        if (val == null) return undefined;
        const str = val.toString().trim();
        if (str.endsWith('%')) return str; // Already percentage
        const num = parseFloat(str);
        if (isNaN(num)) return undefined;
        return `${(num / designHeight) * 100}%`;
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
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
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

    // MODAL PARITY: Check for absolute positioned layers to skip padding
    const hasAbsolutePositionedLayers = children.some(l =>
        l.style?.position === 'absolute' || l.style?.position === 'fixed'
    );

    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';

        // MODAL PARITY: Use percentage-based positioning for absolute layers
        // Positions convert to percentages, sizes still use safeScale
        const scaledStyle: any = {
            ...layer.style,
            // POSITIONS: Convert to percentages (Modal Engine)
            top: toPercentY(layer.style?.top),
            bottom: toPercentY(layer.style?.bottom),
            left: toPercentX(layer.style?.left),
            right: toPercentX(layer.style?.right),
            // SIZES: Still use safeScale for width/height
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scaleY),
            // Margins
            marginTop: safeScale(layer.style?.marginTop, scaleY),
            marginBottom: safeScale(layer.style?.marginBottom, scaleY),
            marginLeft: safeScale(layer.style?.marginLeft, scale),
            marginRight: safeScale(layer.style?.marginRight, scale),
            // Paddings
            paddingTop: safeScale(layer.style?.paddingTop, scaleY),
            paddingBottom: safeScale(layer.style?.paddingBottom, scaleY),
            paddingLeft: safeScale(layer.style?.paddingLeft, scale),
            paddingRight: safeScale(layer.style?.paddingRight, scale),
            // Border Radius
            borderRadius: typeof layer.style?.borderRadius === 'object'
                ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
                : safeScale(layer.style?.borderRadius, scale),
            fontSize: safeScale(layer.style?.fontSize, scale),
        };

        // SDK PARITY: Margin Precedence Logic
        // 1. Explicit marginTop/Bottom > 2. Shorthand margin > 3. Default (for relative only)

        let finalMarginTop = safeScale(layer.style?.marginTop, scaleY);
        let finalMarginBottom = safeScale(layer.style?.marginBottom, scaleY);
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
        // SDK PARITY: Strip margin/padding for absolute elements
        if (isAbsolute) {
            finalMarginTop = undefined;
            finalMarginBottom = undefined;
            finalMarginLeft = undefined;
            finalMarginRight = undefined;
            finalMargin = undefined;
            // Also strip padding from scaledStyle for absolute elements
            scaledStyle.paddingTop = undefined;
            scaledStyle.paddingBottom = undefined;
            scaledStyle.paddingLeft = undefined;
            scaledStyle.paddingRight = undefined;
        } else if (layer.type !== 'custom_html') {
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
                content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'media': // Handle 'media' as alias for 'image'
            case 'image':
                content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />;
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
                content = (
                    <ButtonRenderer
                        layer={layer}
                        scale={scale}
                        scaleY={scaleY}
                    // onClick handled by wrapper
                    />
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
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
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
        // MODAL PARITY: Force stretch mode for layer-background alignment
        backgroundSize: '100% 100%',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
        borderTopLeftRadius: safeScale(config?.borderRadius?.topLeft || 16, scale),
        borderTopRightRadius: safeScale(config?.borderRadius?.topRight || 16, scale),
        boxShadow: config?.boxShadow || 'none',
        overflow: 'hidden', // SDK Parity: Enforce clipping (matches ClipRRect in SDK)
        // MODAL PARITY: Skip padding when absolute layers are present
        paddingTop: hasAbsolutePositionedLayers ? 0 : safeScale(config?.padding?.top || 0, scale),
        paddingRight: hasAbsolutePositionedLayers ? 0 : safeScale(config?.padding?.right || 0, scale),
        paddingBottom: hasAbsolutePositionedLayers ? 0 : safeScale(config?.padding?.bottom || 0, scale),
        paddingLeft: hasAbsolutePositionedLayers ? 0 : safeScale(config?.padding?.left || 0, scale),

        zIndex: 100, // SDK Parity: Sheet (100) > Overlay (99)
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        boxSizing: 'border-box',
        lineHeight: 1.5, // SDK Global Reset
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
                onClick={(e) => {
                    // Handle container-level action in interact mode
                    // Guard: Ignore clicks within 200ms of entering interact mode to prevent auto-trigger
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (isInteractive && rootLayer?.content?.action && timeSinceInteractEnabled > 200) {
                        handleAction(rootLayer.content.action);
                    } else if (!isInteractive && rootLayer) {
                        onLayerSelect(rootLayer.id);
                    }
                }}
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
                        .map(renderLayer)}
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
