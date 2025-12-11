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

    const containerStyle = tooltipContainerLayer?.style || {};

    // --- Configuration & Defaults ---
    const mode = config.mode || 'standard';

    // Standard Defaults
    const STD_BG = '#1F2937';
    const STD_SHADOW = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

    // 1. Determine Background Color
    // If in Image Mode, default to transparent UNLESS user explicitly changed it to something else
    let backgroundColor = config.backgroundColor;
    if (mode === 'image') {
        // If undefined or matches standard default, force transparent
        if (!backgroundColor || backgroundColor === STD_BG) {
            backgroundColor = 'transparent';
        }
    } else {
        // Standard mode: default to dark grey
        backgroundColor = backgroundColor || STD_BG;
    }

    // 2. Determine Box Shadow
    let boxShadow = config.boxShadow;
    if (mode === 'image') {
        // If undefined or matches standard default, force none
        if (boxShadow === undefined || boxShadow === STD_SHADOW) {
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
    const padding = config.padding !== undefined ? config.padding : 12;
    const arrowSize = config.arrowSize || 8;

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

        const selectionStyle = isSelected ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: 10
        } : {};

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            color: style.color || 'white',
                            fontSize: style.fontSize || '14px',
                            fontWeight: style.fontWeight,
                            textAlign: style.textAlign,
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
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            borderRadius: '4px'
                        }}
                    >
                        {layer.content?.imageUrl ? (
                            <img src={layer.content.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Tooltip media" />
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
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            border: 'none',
                            outline: 'none',
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
                            ...style,
                            ...selectionStyle,
                            display: 'flex',
                            flexDirection: style.direction || 'column',
                            gap: style.gap ? `${style.gap}px` : '4px'
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

    // Arrow Style Calculation (Arrow hidden in image mode for now)
    const getArrowStyle = () => {
        if (mode === 'image') return { display: 'none' };

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
                        maxWidth: '200px',
                        height: 'auto',
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
                padding: `${padding}px`,
                position: 'relative',
                maxWidth: '250px',
                minWidth: '120px',
                boxShadow: boxShadow,
                width: 'max-content',
                ...containerStyle,
                // Override container position if target provided, handled by wrapper
                ...(targetElement ? { position: 'relative', top: 'auto', left: 'auto', transform: 'none' } : {})
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
                {/* Target Highlight */}
                {/* Target Highlight */}
                <div style={{
                    position: 'absolute',
                    left: `${scaledX}px`,
                    top: `${scaledY}px`,
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                    border: `2px solid ${colors.primary[500]}`, // Restored to solid blue as requested
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Slight blue tint
                    pointerEvents: 'none',
                    zIndex: 40,
                    borderRadius: '4px' // Added for better aesthetics
                }} />

                {/* Tooltip Wrapper */}
                <div style={wrapperStyle}>
                    <div
                        style={{
                            backgroundColor: mode === 'image' ? 'transparent' : backgroundColor,
                            borderRadius: `${borderRadius}px`,
                            padding: `${padding}px`,
                            position: 'relative',
                            minWidth: '120px',
                            boxShadow: mode === 'image' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            width: 'max-content',
                            ...containerStyle,
                            // Override container position if target provided, handled by wrapper
                            ...(targetElement ? { position: 'relative', top: 'auto', left: 'auto', transform: 'none' } : {})
                        }}
                        onClick={(e) => {
                            if (tooltipContainerLayer) {
                                e.stopPropagation();
                                onLayerSelect(tooltipContainerLayer.id);
                            }
                        }}
                    >
                        <div style={getArrowStyle()} />

                        {mode === 'image' && imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Tooltip"
                                style={{
                                    width: imageWidth,
                                    maxWidth: '100%', // Prevent overflow if container constraint exists
                                    height: 'auto',
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
                    </div>
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
