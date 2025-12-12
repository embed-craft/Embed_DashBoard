import React from 'react';

interface TooltipRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
    targetElement?: {
        id: string;
        rect: { x: number; y: number; width: number; height: number };
        tagName: string;
    };
    scaleX?: number;
    scaleY?: number;
}

export const TooltipRenderer: React.FC<TooltipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange,
    targetElement,
    scaleX,
    scaleY
}) => {
    // Find the root container layer for the Tooltip
    const tooltipContainerLayer = layers.find(l => l.type === 'container' && l.name === 'Tooltip Container');

    // If Image Mode, we must IGNORE the container layer styles (which often contain a default bg)
    // unless strictly needed. Ideally, we just rely on config.
    const mode = config.mode || 'standard';
    // If Image Mode, we allow layer styles to override config (assuming DesignStep cleared defaults on mode switch).
    const rawContainerStyle = tooltipContainerLayer?.style || {};
    const containerStyle = rawContainerStyle; // Don't strip properties, trust the layer state.

    // --- Configuration & Defaults ---
    // Standard Defaults
    const STD_BG = '#1F2937';
    const STD_SHADOW = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

    // 1. Determine Background Color
    // Priority: Layer Style > Config > Default (if standard)
    // If Image Mode + No specific background set, we want transparent.
    // But if user sets a background (via generic panel), we respect it.
    let backgroundColor = tooltipContainerLayer?.style?.backgroundColor || config.backgroundColor;
    
    if (mode === 'image') {
        // Only default to transparent if NOTHING is set. 
        // If it equals STD_BG, it might be a left-over default, so we might want to clear it?
        // But DesignStep should have cleared it. 
        // Let's trust that if it is set, the user wants it.
        // Fallback to transparent if undefined.
        if (!backgroundColor) {
            backgroundColor = 'transparent';
        }
    } else {
        // Standard mode: default to dark grey
        backgroundColor = backgroundColor || STD_BG;
    }

    // 2. Determine Box Shadow
    let boxShadow = tooltipContainerLayer?.style?.boxShadow || config.boxShadow;
    if (mode === 'image') {
       if (!boxShadow) {
           boxShadow = 'none';
       }
    } else {
        boxShadow = boxShadow !== undefined ? boxShadow : STD_SHADOW;
    }

    // 3. Other Properties
    const imageUrl = config.imageUrl;
    const position = config.position || 'bottom';
    const borderRadius = config.borderRadius || 8;
    // Fix duplicate declaration issue by using this single source of truth
    // Fix duplicate declaration issue by using this single source of truth
    // Fix duplicate declaration issue by using this single source of truth
    const rawPadding = tooltipContainerLayer?.style?.padding !== undefined ? tooltipContainerLayer?.style?.padding : config.padding;
    const computedPadding = typeof rawPadding === 'object'
        ? `${rawPadding.top || 0}px ${rawPadding.right || 0}px ${rawPadding.bottom || 0}px ${rawPadding.left || 0}px`
        : `${rawPadding !== undefined ? rawPadding : 12}px`;
    const arrowSize = config.arrowSize || 8;


    // Helper: Convert structured filter object to CSS string
    const getFilterString = (filterObj: any) => {
        if (!filterObj || typeof filterObj !== 'object') return filterObj;
        return [
            filterObj.blur ? `blur(${filterObj.blur}px)` : '',
            filterObj.brightness ? `brightness(${filterObj.brightness}%)` : '',
            filterObj.contrast ? `contrast(${filterObj.contrast}%)` : '',
            filterObj.grayscale ? `grayscale(${filterObj.grayscale}%)` : ''
        ].filter(Boolean).join(' ') || undefined;
    };

    // Helper: Convert structured transform object to CSS string
    const getTransformString = (transformObj: any) => {
        if (!transformObj || typeof transformObj !== 'object') return transformObj;
        return [
            transformObj.rotate ? `rotate(${transformObj.rotate}deg)` : '',
            transformObj.scale ? `scale(${transformObj.scale})` : '',
            transformObj.translateX ? `translateX(${transformObj.translateX}px)` : '',
            transformObj.translateY ? `translateY(${transformObj.translateY}px)` : ''
        ].filter(Boolean).join(' ') || undefined;
    };

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

        const selectionStyle = isSelected ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: 10
        } : {};



        const commonStyles: React.CSSProperties = {
            ...style, // Spread basic props first

            // Override strictly typed or structured properties
            filter: getFilterString(style.filter),
            transform: getTransformString(style.transform),
            boxShadow: style.boxShadow, // Usually a string already, but ensuring it's picked up

            // Positioning overrides if present in style
            position: style.position || 'relative',
            zIndex: style.zIndex,

            ...selectionStyle,
            cursor: 'pointer',
        };

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...commonStyles,
                            color: style.color || 'white',
                            fontSize: style.fontSize || '14px',
                            fontWeight: style.fontWeight,
                            textAlign: style.textAlign,
                            lineHeight: style.lineHeight,
                            letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,

                            // Size might be in 'size' prop or style
                            width: layer.size?.width || style.width || 'auto',
                            height: layer.size?.height || style.height || 'auto',

                            // Explicitly handle these if they are in the style object but not React CSS props directly
                            border: style.border,
                            borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
                            backgroundColor: style.backgroundColor,
                        }}
                    >
                        {layer.content?.text || 'Tooltip Text'}
                    </div>
                );

            case 'image':
            case 'media':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...commonStyles,
                            overflow: 'hidden',
                            borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : (style.borderRadius || '4px'),
                            width: layer.size?.width || style.width || '100%',
                            height: layer.size?.height || style.height || 'auto',
                        }}
                    >
                        {layer.content?.imageUrl ? (
                            <img src={layer.content.imageUrl} style={{ width: '100%', height: '100%', objectFit: style.objectFit || 'cover', objectPosition: style.objectPosition }} alt="Tooltip media" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Image</span>
                            </div>
                        )}
                    </div>
                );

            case 'button':
                return (
                    <button
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...commonStyles,
                            border: style.border || 'none',
                            outline: 'none',
                            backgroundColor: style.backgroundColor,
                            color: style.color,
                            borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,

                            // Size
                            width: layer.size?.width || style.width || 'auto',
                            height: layer.size?.height || style.height || 'auto',
                        }}
                    >
                        {layer.content?.label || 'Button'}
                    </button>
                );

            case 'container':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...commonStyles,
                            display: style.display || 'flex',
                            flexDirection: style.direction || style.flexDirection || 'column',
                            gap: style.gap ? `${style.gap}px` : '4px',
                            backgroundColor: style.backgroundColor,
                            borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
                            padding: style.padding,

                            // Size
                            width: layer.size?.width || style.width || '100%',
                            height: layer.size?.height || style.height || 'auto',
                        }}
                    >
                        {layer.children?.map((childId: string) => {
                            const child = layers.find(l => l.id === childId);
                            return child ? renderLayer(child) : null;
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    // Arrow Style Calculation 
    const getArrowStyle = () => {
        // if (mode === 'image') return { display: 'none' }; // Allow arrow if user sets non-transparent background


        const base = {
            position: 'absolute' as const,
            width: 0,
            height: 0,
            borderStyle: 'solid',
        };

        switch (position) {
            case 'top':
                return {
                    ...base,
                    bottom: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
                    borderColor: `${backgroundColor} transparent transparent transparent`
                };
            case 'bottom':
                return {
                    ...base,
                    top: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent ${backgroundColor} transparent`
                };
            case 'left':
                return {
                    ...base,
                    right: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent transparent ${backgroundColor}`
                };
            case 'right':
                return {
                    ...base,
                    left: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
                    borderColor: `transparent ${backgroundColor} transparent transparent`
                };
            default:
                return {};
        }
    };

    // --- RENDER ---

    // Helper function to render the actual tooltip content based on mode (excluding HTML)
    const renderTooltipContent = () => (
        <>
            {mode === 'image' && imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Tooltip"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: `${borderRadius}px`
                    }}
                />
            ) : (
                tooltipContainerLayer?.children?.map((childId: string) => {
                    const child = layers.find(l => l.id === childId);
                    return child ? renderLayer(child) : null;
                })
            )}

            {!tooltipContainerLayer && mode !== 'image' && (
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    Tooltip Content
                </div>
            )}
        </>
    );

    const TooltipContent = (
        <div
            style={{
                // Advanced Mode: Gradient Override
                ...(mode === 'advanced' && config.gradientWith && config.gradientTo ? {
                    background: `linear-gradient(${config.gradientAngle || 45}deg, ${config.gradientWith}, ${config.gradientTo})`,
                    backgroundColor: 'transparent' // Clear fallback
                } : {}),
                backgroundColor: backgroundColor,
                borderRadius: `${borderRadius}px`,
                padding: computedPadding,
                position: 'relative',
                maxWidth: config.maxWidth || '250px',
                minWidth: config.minWidth || '120px',
                width: config.width || 'max-content',
                height: config.height || 'auto',

                // --- Full Property Support ---
                // Filters
                filter: [
                    config.blur ? `blur(${config.blur}px)` : '',
                    config.brightness ? `brightness(${config.brightness}%)` : '',
                    config.contrast ? `contrast(${config.contrast}%)` : '',
                    config.grayscale ? `grayscale(${config.grayscale}%)` : ''
                ].filter(Boolean).join(' ') || (tooltipContainerLayer?.style?.filter ? getFilterString(tooltipContainerLayer.style.filter) : undefined),

                // Container Props
                opacity: tooltipContainerLayer?.style?.opacity !== undefined ? tooltipContainerLayer.style.opacity : (config.opacity !== undefined ? config.opacity / 100 : undefined),
                zIndex: config.zIndex,
                cursor: config.cursor,
                overflow: config.overflow,
                border: (tooltipContainerLayer?.style?.borderWidth ? `${typeof tooltipContainerLayer.style.borderWidth === 'object' ? 1 : tooltipContainerLayer.style.borderWidth}px solid ${tooltipContainerLayer.style.borderColor || '#000000'}` : undefined) || config.border,
                clipPath: tooltipContainerLayer?.style?.clipPath || config.clipPath,

                // Background Image
                backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
                backgroundSize: config.backgroundSize,
                backgroundRepeat: config.backgroundRepeat,
                backgroundPosition: config.backgroundPosition,

                // Layout
                // Layout
                // Layout
                display: tooltipContainerLayer?.style?.display || config.display || 'flex',
                flexDirection: tooltipContainerLayer?.style?.flexDirection || tooltipContainerLayer?.style?.direction || config.flexDirection || 'column',
                alignItems: tooltipContainerLayer?.style?.alignItems || config.alignItems,
                justifyContent: tooltipContainerLayer?.style?.justifyContent || config.justifyContent,
                gap: (tooltipContainerLayer?.style?.gap ? `${tooltipContainerLayer.style.gap}px` : undefined) || (config.gap !== undefined ? `${config.gap}px` : undefined),

                // Typography (Inherited)
                // Typography (Inherited)
                fontFamily: tooltipContainerLayer?.style?.fontFamily || config.fontFamily,
                fontSize: (tooltipContainerLayer?.style?.fontSize) || (config.fontSize ? `${config.fontSize}px` : undefined),
                color: tooltipContainerLayer?.style?.color || config.textColor,
                textAlign: tooltipContainerLayer?.style?.textAlign || config.textAlign,

                // Apply container styles first (layer defaults)
                // Omit 'transform' from spread because it might be an object which is invalid for React style
                ...(() => {
                    const { transform, ...rest } = containerStyle;
                    return rest;
                })(),

                // Apply Config Box Shadow LAST to ensure it overrides container defaults
                boxShadow: boxShadow,

                // transform logic
                // Prioritize Layer Style Transform (from Advanced Panel) over Config
                ...(() => {
                    const layerTransform = containerStyle.transform || {};
                    const rotate = layerTransform.rotate !== undefined ? layerTransform.rotate : (config.rotate || 0);
                    const scale = layerTransform.scale !== undefined ? layerTransform.scale : (config.scale || 1);

                    const transformString = `rotate(${rotate}deg) scale(${scale})`;

                    return targetElement ? {
                        position: 'relative',
                        top: 'auto',
                        left: 'auto',
                        transform: transformString
                    } : {
                        transform: transformString
                    };
                })()
            }}
            onClick={(e) => {
                if (tooltipContainerLayer) {
                    e.stopPropagation();
                    onLayerSelect(tooltipContainerLayer.id);
                }
            }}
        >
            <div style={getArrowStyle()} />

            {/* HTML Mode Content */}
            {mode === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: config.htmlContent || '<div>Custom HTML</div>' }} />
            ) : (
                // Standard/Image/Advanced Content
                renderTooltipContent()
            )}
        </div>
    );

    // Dynamic Positioning Logic
    if (targetElement) {
        const currentScaleX = scaleX || 1;
        const currentScaleY = scaleY || 1;
        const { x, y, width, height } = targetElement.rect;

        // Scale the coordinates
        const scaledX = x * currentScaleX;
        const scaledY = y * currentScaleY;
        const scaledWidth = width * currentScaleX;
        const scaledHeight = height * currentScaleY;

        const gap = (arrowSize || 8) + 4; // Gap for arrow + spacing

        // Calculate wrapper position
        // Base coordinates centered relative to target side
        let top = 0;
        let left = 0;
        let transformStr = ''; // We build transform string manually to combine with offsets

        switch (position) {
            case 'top':
                top = scaledY - gap;
                left = scaledX + scaledWidth / 2;
                transformStr = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                top = scaledY + scaledHeight + gap;
                left = scaledX + scaledWidth / 2;
                transformStr = 'translate(-50%, 0)';
                break;
            case 'left':
                top = scaledY + scaledHeight / 2;
                left = scaledX - gap;
                transformStr = 'translate(-100%, -50%)';
                break;
            case 'right':
                top = scaledY + scaledHeight / 2;
                left = scaledX + scaledWidth + gap;
                transformStr = 'translate(0, -50%)';
                break;
            default:
                top = scaledY + scaledHeight + gap;
                left = scaledX + scaledWidth / 2;
                transformStr = 'translate(-50%, 0)';
        }

        // Apply visual offsets (in pixels)
        // We add these to the CSS top/left values or transform
        // Adding to transform is smoother for "nudge"
        const offsetX = config.offsetX || 0;
        const offsetY = config.offsetY || 0;

        // Append offsets to transform. 
        // Note: transform order matters, but here we just want to shift the final result.
        // Existing transforms use % which depends on element size. 
        // Pixel offsets are absolute.
        // transform: translate(-50%, -100%) translate(10px, 20px) is valid
        const finalTransform = `${transformStr} translate(${offsetX}px, ${offsetY}px)`;

        const wrapperStyle: React.CSSProperties = {
            position: 'absolute',
            zIndex: 50,
            pointerEvents: 'auto',
            top: `${top}px`,
            left: `${left}px`,
            transform: finalTransform
        };

        const imageWidth = config.width ? `${config.width}px` : '200px';

        return (
            <>
                {/* Overlay (New) */}
                {(config.overlayOpacity !== undefined && config.overlayOpacity > 0) && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: config.overlayColor || '#000000',
                        opacity: config.overlayOpacity,
                        zIndex: 40, // Below tooltip (50), same/above highlight?
                        pointerEvents: 'auto', // Blocks clicks if configured
                    }} 
                    onClick={(e) => {
                         // We don't have a close handler prop here, but we can stop propagation
                         // The parent usually handles "outside click" via a global listener.
                         // But if we want to catch it here:
                         // config.closeOnOutsideClick
                    }}
                    />
                )}

                {/* Target Highlight */}
                {(mode === 'image' || config.targetHighlightColor) && (
                    <div style={{
                        position: 'absolute',
                        left: `${scaledX - (config.targetHighlightPadding || 4)}px`,
                        top: `${scaledY - (config.targetHighlightPadding || 4)}px`,
                        width: `${scaledWidth + (config.targetHighlightPadding || 4) * 2}px`,
                        height: `${scaledHeight + (config.targetHighlightPadding || 4) * 2}px`,
                        border: `2px solid ${config.targetHighlightColor || colors.primary[500]}`,
                        backgroundColor: 'transparent',
                        pointerEvents: 'none',
                        zIndex: 45, // Above overlay, below tooltip
                        borderRadius: `${config.targetRoundness || 4}px`,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0)' // Hack to focus? No.
                    }} />
                )}

                {/* Tooltip Wrapper */}
                <div style={wrapperStyle}>
                    {TooltipContent}
                </div>
            </>
        );
    }

    // Fallback: Centered with Mock Anchors (for when no target is selected)
    const Anchor = () => (
        <div style={{
            width: '100px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7280', fontSize: '12px', border: '2px dashed #9CA3AF'
        }}>
            Target Element
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
            {position === 'bottom' && <Anchor />}
            {position === 'right' && <Anchor />}
            {TooltipContent}
            {position === 'top' && <Anchor />}
            {position === 'left' && <Anchor />}
        </div>
    );
};
