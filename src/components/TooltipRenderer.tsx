import React, { useRef, useEffect } from 'react';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { Layer, LayerStyle, TooltipConfig } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { ContainerRenderer } from './campaign/renderers/ContainerRenderer';
import { InputRenderer } from './campaign/renderers/InputRenderer';
import { CopyButtonRenderer } from './campaign/renderers/CopyButtonRenderer';
import { X } from 'lucide-react';

const getTransformString = (transform?: LayerStyle['transform']) => {
    if (!transform || typeof transform !== 'object') return undefined;
    const parts = [];
    if (transform.rotate) parts.push(`rotate(${transform.rotate}deg)`);
    if (transform.scale) parts.push(`scale(${transform.scale})`);
    if (transform.translateX !== undefined) {
        const val = transform.translateX;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateX(${valStr})`);
    }
    if (transform.translateY !== undefined) {
        const val = transform.translateY;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateY(${valStr})`);
    }
    return parts.join(' ');
};

const getFilterString = (filter?: LayerStyle['filter']) => {
    if (!filter || typeof filter !== 'object') return undefined;
    const parts = [];
    if (filter.blur) parts.push(`blur(${filter.blur}px)`);
    if (filter.brightness) parts.push(`brightness(${filter.brightness}%)`);
    if (filter.contrast) parts.push(`contrast(${filter.contrast}%)`);
    if (filter.grayscale) parts.push(`grayscale(${filter.grayscale}%)`);
    return parts.join(' ');
};

// ============ PROPS ============
interface TooltipRendererProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config: TooltipConfig;
    onConfigChange?: (config: TooltipConfig) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    targetElement?: { rect: { x: number; y: number; width: number; height: number } };
    scale?: number;
    scaleY?: number;
    isInteractive?: boolean;
    onDismiss?: () => void;
    onInterfaceAction?: (interfaceId: string) => void;
}

// ============ MAIN COMPONENT ============
export const TooltipRenderer: React.FC<TooltipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config,
    onConfigChange,
    onLayerUpdate,
    targetElement,
    scale = 1,
    scaleY = 1,
    isInteractive = false,
    onDismiss,
    onInterfaceAction
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Guard: Track when interact mode was enabled to prevent auto-triggering
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    // ============ SCALING HELPERS (Same as Modal) ============
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const designWidth = 393;
    const designHeight = 852;

    const toPercentX = (val: any): string | undefined => {
        if (val == null) return undefined;
        const str = val.toString().trim();
        if (str.endsWith('%')) return str;
        const num = parseFloat(str);
        if (isNaN(num)) return undefined;
        return `${(num / designWidth) * 100}%`;
    };

    const toPercentY = (val: any): string | undefined => {
        if (val == null) return undefined;
        const str = val.toString().trim();
        if (str.endsWith('%')) return str;
        const num = parseFloat(str);
        if (isNaN(num)) return undefined;
        return `${(num / designHeight) * 100}%`;
    };

    // ============ ACTION HANDLER ============
    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;
        switch (action.type) {
            case 'close':
            case 'dismiss':
                if (onDismiss) onDismiss();
                break;
            case 'deeplink':
                if (action.url) window.open(action.url, '_blank');
                break;
            case 'link':
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
                break;
            default:
                console.log('Action triggered:', action);
        }
    };

    // ============ RENDER LAYER (Absolute positioning for pixel-perfect placement) ============
    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;

        // FIX: Simplified baseStyle - only absolute positioning properties + essential visual properties
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: toPercentX(layer.style?.left ?? 0),
            top: toPercentY(layer.style?.top ?? 0),
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scaleY),
            zIndex: layer.style?.zIndex ?? 0,
            borderRadius: (layer.type === 'input' || layer.type === 'copy_button')
                ? undefined
                : safeScale(layer.style?.borderRadius, scale),
            overflow: 'hidden',
            // FIX: Include backgroundColor for button layers (wrapper needs it)
            // backgroundColor: layer.type === 'button'
            //     ? (layer.style?.backgroundColor || layer.content?.themeColor)
            //     : undefined,
        };

        let content = null;
        switch (layer.type) {
            case 'text':
                content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'media':
            case 'image':
                content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'button':
                content = <ButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'input':
                content = <InputRenderer layer={layer} scale={scale} scaleY={scaleY} onInterfaceAction={handleAction} />;
                break;
            case 'copy_button':
                content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'container':
                content = (
                    <ContainerRenderer
                        layer={layer}
                        layers={layers}
                        renderChild={renderLayer}
                    />
                );
                break;
            default:
                content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown: {layer.type}</div>;
        }

        return (
            <DraggableLayerWrapper
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                isInteractive={isInteractive}
                scale={scale}
                onLayerUpdate={onLayerUpdate}
                onLayerSelect={onLayerSelect}
                onLayerAction={(layer) => handleAction(layer.content?.action)}
                style={{
                    ...baseStyle,
                    outline: isSelected ? `2px solid ${colors.primary[500] || '#6366F1'}` : 'none',
                    outlineOffset: '2px',
                }}
            >
                {content}
            </DraggableLayerWrapper>
        );
    };

    // ============ ARROW COMPONENT (SVG-based with position & roundness) ============
    const renderArrow = () => {
        if (config.arrowEnabled === false) return null;

        // FIX: Scale arrowSize for pixel-perfect match with SDK
        const arrowSize = (config.arrowSize || 10) * scale;
        const bgColor = config.backgroundColor || '#1F2937';
        const position = config.position || 'bottom';
        const positionPercent = config.arrowPositionPercent ?? 50; // 0-100, default center
        const roundness = config.arrowRoundness ?? 0; // 0-100, default sharp

        // FIX: Convert percentage to pixels, then scale for consistent Dashboard/SDK rendering
        // This ensures arrow position scales identically to other dimensions
        const rawTooltipWidth = config.width || 280;
        const arrowPositionPx = (positionPercent / 100) * (typeof rawTooltipWidth === 'number' ? rawTooltipWidth : 280);
        const scaledArrowPosition = arrowPositionPx * scale;

        // Calculate curve control point based on roundness (0 = sharp, 100 = very rounded)
        const curveAmount = (roundness / 100) * (arrowSize * 0.8);

        // Generate SVG path based on direction
        const getSvgPath = (direction: 'up' | 'down' | 'left' | 'right') => {
            const w = arrowSize * 2;
            const h = arrowSize;

            // Roundness offset - applies curve at the TIP, not the base
            const tipOffset = (roundness / 100) * (h * 0.6);

            switch (direction) {
                case 'up': // Points upward - curve the TOP tip
                    return tipOffset > 0
                        ? `M 0 ${h} L ${w / 2 - tipOffset} ${tipOffset} Q ${w / 2} ${-tipOffset * 0.5} ${w / 2 + tipOffset} ${tipOffset} L ${w} ${h} Z`
                        : `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`;
                case 'down': // Points downward - curve the BOTTOM tip
                    return tipOffset > 0
                        ? `M 0 0 L ${w / 2 - tipOffset} ${h - tipOffset} Q ${w / 2} ${h + tipOffset * 0.5} ${w / 2 + tipOffset} ${h - tipOffset} L ${w} 0 Z`
                        : `M 0 0 L ${w / 2} ${h} L ${w} 0 Z`;
                case 'left': // Points left - curve the LEFT tip  
                    return tipOffset > 0
                        ? `M ${h} 0 L ${tipOffset} ${w / 2 - tipOffset} Q ${-tipOffset * 0.5} ${w / 2} ${tipOffset} ${w / 2 + tipOffset} L ${h} ${w} Z`
                        : `M ${h} 0 L 0 ${w / 2} L ${h} ${w} Z`;
                case 'right': // Points right - curve the RIGHT tip
                    return tipOffset > 0
                        ? `M 0 0 L ${h - tipOffset} ${w / 2 - tipOffset} Q ${h + tipOffset * 0.5} ${w / 2} ${h - tipOffset} ${w / 2 + tipOffset} L 0 ${w} Z`
                        : `M 0 0 L ${h} ${w / 2} L 0 ${w} Z`;
            }
        };

        // Common SVG style
        const svgStyle: React.CSSProperties = {
            position: 'absolute',
            overflow: 'visible',
        };

        switch (position) {
            case 'bottom': // Tooltip is below target, arrow points UP
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            top: -arrowSize,
                            // FIX: Use pixel-based position instead of percentage
                            left: `${scaledArrowPosition}px`,
                            transform: 'translateX(-50%)',
                            width: arrowSize * 2,
                            height: arrowSize,
                        }}
                    >
                        <path d={getSvgPath('up')} fill={bgColor} />
                    </svg>
                );
            case 'top': // Tooltip is above target, arrow points DOWN
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            bottom: -arrowSize,
                            // FIX: Use pixel-based position instead of percentage
                            left: `${scaledArrowPosition}px`,
                            transform: 'translateX(-50%)',
                            width: arrowSize * 2,
                            height: arrowSize,
                        }}
                    >
                        <path d={getSvgPath('down')} fill={bgColor} />
                    </svg>
                );
            case 'left': // Tooltip is left of target, arrow points RIGHT
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            right: -arrowSize,
                            top: `${positionPercent}%`,
                            transform: 'translateY(-50%)',
                            width: arrowSize,
                            height: arrowSize * 2,
                        }}
                    >
                        <path d={getSvgPath('right')} fill={bgColor} />
                    </svg>
                );
            case 'right': // Tooltip is right of target, arrow points LEFT
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            left: -arrowSize,
                            top: `${positionPercent}%`,
                            transform: 'translateY(-50%)',
                            width: arrowSize,
                            height: arrowSize * 2,
                        }}
                    >
                        <path d={getSvgPath('left')} fill={bgColor} />
                    </svg>
                );
        }
    };

    // ============ CALCULATE TOOLTIP POSITION ============
    const getTooltipPosition = () => {
        if (!targetElement) {
            // Fallback: center of screen with mock target
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const { x, y, width, height } = targetElement.rect;
        // FIX: Removed +4 gap to match SDK - arrow touches target when offsetY=0
        const rawGap = config.arrowSize || 10;
        const gap = rawGap * scale; // Scale the gap
        const offsetX = (config.offsetX || 0) * scale; // Scale offsetX
        const offsetY = (config.offsetY || 0) * scaleY; // Scale offsetY

        const scaledX = x * scale;
        const scaledY = y * scaleY;
        const scaledWidth = width * scale;
        const scaledHeight = height * scaleY;

        switch (config.position) {
            case 'top':
                return {
                    left: `${scaledX + scaledWidth / 2 + offsetX}px`,
                    top: `${scaledY - gap + offsetY}px`,
                    transform: 'translate(-50%, -100%)'
                };
            case 'bottom':
                return {
                    left: `${scaledX + scaledWidth / 2 + offsetX}px`,
                    top: `${scaledY + scaledHeight + gap + offsetY}px`,
                    transform: 'translate(-50%, 0)'
                };
            case 'left':
                return {
                    left: `${scaledX - gap + offsetX}px`,
                    top: `${scaledY + scaledHeight / 2 + offsetY}px`,
                    transform: 'translate(-100%, -50%)'
                };
            case 'right':
                return {
                    left: `${scaledX + scaledWidth + gap + offsetX}px`,
                    top: `${scaledY + scaledHeight / 2 + offsetY}px`,
                    transform: 'translate(0, -50%)'
                };
            default:
                return {
                    left: `${scaledX + scaledWidth / 2}px`,
                    top: `${scaledY + scaledHeight + gap}px`,
                    transform: 'translate(-50%, 0)'
                };
        }
    };

    // ============ RENDER TARGET HIGHLIGHT ============
    const renderTargetHighlight = () => {
        if (!targetElement) return null;

        const { x, y, width, height } = targetElement.rect;
        const padding = 4;
        const scaledX = x * scale;
        const scaledY = y * scaleY;
        const scaledWidth = width * scale;
        const scaledHeight = height * scaleY;

        // FIX: Calculate overlay color with proper opacity
        const opacity = config.overlayOpacity ?? 0.5;
        const baseColor = config.overlayColor || '#000000';
        // Convert hex/named color to rgba with opacity
        const overlayWithOpacity = baseColor.startsWith('rgba')
            ? baseColor
            : baseColor.startsWith('#')
                ? `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`;

        return (
            <div style={{
                position: 'absolute',
                left: `${scaledX - padding}px`,
                top: `${scaledY - padding}px`,
                width: `${scaledWidth + padding * 2}px`,
                height: `${scaledHeight + padding * 2}px`,
                border: `${config.targetBorderWidth || 2}px solid ${config.targetBorderColor || colors.primary[500]}`,
                borderRadius: `${config.targetBorderRadius || 8}px`,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 45,
                boxShadow: `0 0 0 9999px ${overlayWithOpacity}`,
            }} />
        );
    };

    // ============ MAIN RENDER ============
    // FIX #1: Improved tooltip layer detection with multiple strategies

    // Strategy 1: Find by type 'tooltip'
    // Strategy 2: Find by name containing 'tooltip' 
    // Strategy 3: Find first container
    // Strategy 4: Use first layer as fallback
    // Strategy 1: Find by type 'tooltip'
    // Strategy 2: Find by name containing 'tooltip' 
    // Strategy 3: Find first container
    // Strategy 4: Use first layer as fallback
    const tooltipLayer = layers.find(l => (l.type as string) === 'tooltip')
        || layers.find(l => l.name?.toLowerCase().includes('tooltip'))
        || layers.find(l => l.type === 'container')
        || layers[0];

    // Try multiple strategies to find child layers
    // FIX: ALWAYS render ALL non-container, visible layers to match SDK behavior
    // This ensures newly added layers show up in preview even without parent relationship
    const layersToRender = layers.filter(l =>
        l.id !== tooltipLayer?.id &&
        // l.type !== 'container' && // Allow containers to render!
        // (l.type as string) !== 'tooltip' && // Removed as tooltip is not a valid LayerType
        (!l.parent || l.parent === tooltipLayer?.id) && // Only render top-level or direct children of tooltip
        l.visible !== false
    );

    // Debug logging
    console.log('[TooltipRenderer] tooltipLayer:', tooltipLayer?.name, 'children:', layersToRender.length);
    // 🔥 DEBUG: Width and scale comparison with SDK
    const rawWidth = typeof config.width === 'number' ? config.width : 280;
    const scaledWidth = rawWidth * scale;
    console.log(`[TooltipRenderer] 📐 widthMode: ${config.widthMode}, rawWidth: ${rawWidth}, scale: ${scale.toFixed(4)}, scaledWidth: ${scaledWidth.toFixed(2)}`);

    const position = getTooltipPosition();

    // FIX: Scale padding for pixel-perfect match with SDK (default to 0)
    const getPaddingString = () => {
        if (!config.padding) return '0px';
        if (typeof config.padding === 'object') {
            const p = config.padding as { top?: number; right?: number; bottom?: number; left?: number };
            return `${(p.top ?? 0) * scale}px ${(p.right ?? 0) * scale}px ${(p.bottom ?? 0) * scale}px ${(p.left ?? 0) * scale}px`;
        }
        return `${(config.padding ?? 0) * scale}px`;
    };
    const padding = getPaddingString();

    return (
        <>
            {/* Overlay with Spotlight (cutout for target) */}
            {config.overlayEnabled !== false && targetElement && (
                renderTargetHighlight()
            )}

            {/* Overlay without target (full screen) */}
            {config.overlayEnabled !== false && !targetElement && (() => {
                const opacity = config.overlayOpacity ?? 0.5;
                const baseColor = config.overlayColor || '#000000';
                const overlayWithOpacity = baseColor.startsWith('rgba')
                    ? baseColor
                    : baseColor.startsWith('#') && baseColor.length >= 7
                        ? `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${opacity})`
                        : `rgba(0, 0, 0, ${opacity})`;
                return (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: overlayWithOpacity,
                        zIndex: 40,
                        pointerEvents: 'auto'
                    }} onClick={onDismiss} />
                );
            })()}

            {/* Tooltip Container */}
            <div
                ref={containerRef}
                onClick={(e) => {
                    // Handle container-level action in interact mode
                    // Guard: Ignore clicks within 200ms of entering interact mode to prevent auto-trigger
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (isInteractive && (tooltipLayer?.content?.action || (config.timelineMode && onInterfaceAction)) && timeSinceInteractEnabled > 200) {
                        if (tooltipLayer?.content?.action) {
                            handleAction(tooltipLayer.content.action);
                        } else if (config.timelineMode && onInterfaceAction) {
                            // Revised Logic:
                            // If timelineMode is active, we trigger the action if it exists on the container.
                            // If not, we might need a fallback or just do nothing.
                            // For now, let's just reuse the generic handleAction call if action exists.
                            if (tooltipLayer?.content?.action) {
                                handleAction(tooltipLayer.content.action);
                            }
                        }

                        // Wait, user said "set the action interface now if i click on the target elemtn body also action will trigger"
                        // This implies we need to check if the CONTAINER layer has an action.
                        // My previous code: `if (isInteractive && tooltipLayer?.content?.action ...)` 
                        // ALREADY handles this if the container layer (tooltipLayer) has an action!
                        // The user just wants a "Mode" that might imply visual cues or behavior. 
                        // OR, maybe they want to force valid action execution even if it wasn't strictly clicking the container?
                        // Let's ensure we are triggering `handleAction` if `timelineMode` is true OR if there's an action.

                        // Revised Logic based on requirement "just make a button like tooltip timemode on":
                        // If timelineMode is ON, we treat the body click as an action trigger.
                        // Existing logic `if (isInteractive && tooltipLayer?.content?.action ...)` covers it 
                        // IF the user puts the action on the container.
                        // The `timelineMode` flag might be purely for the UI toggle to know this intent exists.
                        // But let's make sure it works seamlessly.

                        if (tooltipLayer?.content?.action) {
                            handleAction(tooltipLayer.content.action);
                        }
                    } else if (!isInteractive && tooltipLayer) {
                        onLayerSelect(tooltipLayer.id);
                    }
                }}
                style={{
                    position: 'absolute',
                    ...position,
                    zIndex: 50,
                    pointerEvents: 'auto',
                }}
            >
                {/* Tooltip Body */}
                <div style={{
                    position: 'relative',
                    // Background with opacity
                    backgroundColor: config.backgroundOpacity !== undefined && config.backgroundOpacity < 1
                        ? `rgba(${parseInt((config.backgroundColor || '#1F2937').slice(1, 3), 16)}, ${parseInt((config.backgroundColor || '#1F2937').slice(3, 5), 16)}, ${parseInt((config.backgroundColor || '#1F2937').slice(5, 7), 16)}, ${config.backgroundOpacity})`
                        : config.backgroundColor || '#1F2937',
                    // Background image
                    backgroundImage: config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                    backgroundSize: config.backgroundSize || 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    // FIX: Scale borderRadius for pixel-perfect match with SDK
                    borderRadius: `${(config.borderRadius || 12) * scale}px`,
                    padding: padding,
                    // Width based on mode
                    width: config.widthMode === 'auto'
                        ? 'auto'
                        : config.widthMode === 'fitContent'
                            ? 'fit-content'
                            : config.widthUnit === '%'
                                ? `${config.width || 280}%`
                                : safeScale(config.width || 280, scale),
                    // Height based on mode
                    height: config.heightMode === 'custom' && config.height
                        ? config.heightUnit === '%'
                            ? `${config.height}%`
                            : safeScale(config.height, scaleY)
                        : config.heightMode === 'fitContent'
                            ? 'fit-content'
                            : 'auto',
                    // FIX: Scale shadowBlur for pixel-perfect match with SDK
                    boxShadow: config.shadowEnabled !== false
                        ? `0 ${10 * scale}px ${(config.shadowBlur ?? 25) * scale}px rgba(0,0,0,${config.shadowOpacity ?? 0.2})`
                        : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    // NOTE: Removed gap - SDK Column has no gap between children
                    // FIX: Match Flutter Container box model where width includes padding
                    boxSizing: 'border-box',
                    animation: 'tooltip-pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {/* Arrow - positioned outside overflow container */}
                    {renderArrow()}

                    {/* Layers - wrapped in overflow container to clip content */}
                    <div style={{
                        overflow: 'hidden',
                        // FIX: Scale borderRadius same as outer container
                        borderRadius: `${(config.borderRadius || 12) * scale}px`,
                        // FIX: Use position:relative to enable absolute positioned children
                        position: 'relative',
                        width: '100%',
                        // FIX: Use tooltip height for absolute positioning, or min-height for auto
                        height: config.heightMode === 'custom' && config.height
                            ? safeScale(config.height, scaleY)
                            : '100px', // Default min-height for auto mode
                        minHeight: config.heightMode === 'auto' ? '50px' : undefined,
                    }}>
                        {layersToRender.map(renderLayer)}
                    </div>
                </div>
            </div>

            {/* Mock Target Element (when no real target) */}
            {!targetElement && (
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '40px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B7280',
                    fontSize: '12px',
                    border: `2px solid ${config.targetBorderColor || colors.primary[500]}`,
                    zIndex: 30
                }}>
                    Target Element
                </div>
            )}

            <style>{`
                @keyframes tooltip-pop {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};
