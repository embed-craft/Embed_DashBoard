import React, { useRef, useEffect } from 'react';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { Layer, LayerStyle, SpotlightConfig } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
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
interface SpotlightRendererProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config: SpotlightConfig;
    onConfigChange?: (config: SpotlightConfig) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    targetElement?: { rect: { x: number; y: number; width: number; height: number } };
    scale?: number;
    scaleY?: number;
    isInteractive?: boolean;
    onDismiss?: () => void;
    onInterfaceAction?: (interfaceId: string) => void;
}

// ============ MAIN COMPONENT ============
export const SpotlightRenderer: React.FC<SpotlightRendererProps> = ({
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

    // Guard: Track when interact mode was enabled
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    // ============ SCALING HELPERS ============
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
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
                break;
            default:
                console.log('Action triggered:', action);
        }
    };

    // ============ RENDER LAYER ============
    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: toPercentX(layer.style?.left ?? 0),
            top: toPercentY(layer.style?.top ?? 0),
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scaleY),
            zIndex: layer.style?.zIndex ?? 0,
            borderRadius: safeScale(layer.style?.borderRadius, scale),
            overflow: 'hidden',
            // backgroundColor: layer.type === 'button'
            //    ? (layer.style?.backgroundColor || layer.content?.themeColor)
            //    : undefined,
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

    // ============ ARROW COMPONENT ============
    const renderArrow = () => {
        if (config.arrowEnabled === false) return null;

        const arrowSize = (config.arrowSize || 10) * scale;
        const bgColor = config.backgroundColor || '#1F2937';
        const position = config.position || 'bottom';
        const positionPercent = config.arrowPositionPercent ?? 50;
        const roundness = config.arrowRoundness ?? 0;

        const rawTooltipWidth = config.width || 280;
        const arrowPositionPx = (positionPercent / 100) * (typeof rawTooltipWidth === 'number' ? rawTooltipWidth : 280);
        const scaledArrowPosition = arrowPositionPx * scale;

        const getSvgPath = (direction: 'up' | 'down' | 'left' | 'right') => {
            const w = arrowSize * 2;
            const h = arrowSize;
            const tipOffset = (roundness / 100) * (h * 0.6);

            switch (direction) {
                case 'up':
                    return tipOffset > 0
                        ? `M 0 ${h} L ${w / 2 - tipOffset} ${tipOffset} Q ${w / 2} ${-tipOffset * 0.5} ${w / 2 + tipOffset} ${tipOffset} L ${w} ${h} Z`
                        : `M 0 ${h} L ${w / 2} 0 L ${w} ${h} Z`;
                case 'down':
                    return tipOffset > 0
                        ? `M 0 0 L ${w / 2 - tipOffset} ${h - tipOffset} Q ${w / 2} ${h + tipOffset * 0.5} ${w / 2 + tipOffset} ${h - tipOffset} L ${w} 0 Z`
                        : `M 0 0 L ${w / 2} ${h} L ${w} 0 Z`;
                case 'left':
                    return tipOffset > 0
                        ? `M ${h} 0 L ${tipOffset} ${w / 2 - tipOffset} Q ${-tipOffset * 0.5} ${w / 2} ${tipOffset} ${w / 2 + tipOffset} L ${h} ${w} Z`
                        : `M ${h} 0 L 0 ${w / 2} L ${h} ${w} Z`;
                case 'right':
                    return tipOffset > 0
                        ? `M 0 0 L ${h - tipOffset} ${w / 2 - tipOffset} Q ${h + tipOffset * 0.5} ${w / 2} ${h - tipOffset} ${w / 2 + tipOffset} L 0 ${w} Z`
                        : `M 0 0 L ${h} ${w / 2} L 0 ${w} Z`;
            }
        };

        const svgStyle: React.CSSProperties = {
            position: 'absolute',
            overflow: 'visible',
        };

        switch (position) {
            case 'bottom':
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            top: -arrowSize,
                            left: `${scaledArrowPosition}px`,
                            transform: 'translateX(-50%)',
                            width: arrowSize * 2,
                            height: arrowSize,
                        }}
                    >
                        <path d={getSvgPath('up')} fill={bgColor} />
                    </svg>
                );
            case 'top':
                return (
                    <svg
                        style={{
                            ...svgStyle,
                            bottom: -arrowSize,
                            left: `${scaledArrowPosition}px`,
                            transform: 'translateX(-50%)',
                            width: arrowSize * 2,
                            height: arrowSize,
                        }}
                    >
                        <path d={getSvgPath('down')} fill={bgColor} />
                    </svg>
                );
            case 'left':
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
            case 'right':
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
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const { x, y, width, height } = targetElement.rect;
        const rawGap = config.arrowSize || 10;
        const gap = rawGap * scale;
        const offsetX = (config.offsetX || 0) * scale;
        const offsetY = (config.offsetY || 0) * scaleY;

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

    // ============ RENDER SPOTLIGHT CUTOUT (Key difference from Tooltip) ============
    const renderSpotlightOverlay = () => {
        // SPOTLIGHT ALWAYS HAS OVERLAY ENABLED
        const opacity = config.overlayOpacity ?? 0.6;
        const baseColor = config.overlayColor || '#000000';
        const overlayWithOpacity = baseColor.startsWith('rgba')
            ? baseColor
            : baseColor.startsWith('#') && baseColor.length >= 7
                ? `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${opacity})`
                : `rgba(0, 0, 0, ${opacity})`;

        if (!targetElement) {
            // Full screen overlay without cutout
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
        }

        // Overlay with cutout for target element
        const { x, y, width, height } = targetElement.rect;
        const padding = config.targetHighlightPadding ?? 4;
        const scaledX = x * scale;
        const scaledY = y * scaleY;
        const scaledWidth = width * scale;
        const scaledHeight = height * scaleY;

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
    const spotlightLayer = layers.find(l => (l.type as string) === 'tooltip')
        || layers.find(l => l.name?.toLowerCase().includes('spotlight'))
        || layers.find(l => l.type === 'container')
        || layers[0];

    const layersToRender = layers.filter(l =>
        l.id !== spotlightLayer?.id &&
        l.type !== 'container' &&
        (l.type as string) !== 'tooltip' &&
        l.visible !== false
    );

    console.log('[SpotlightRenderer] spotlightLayer:', spotlightLayer?.name, 'children:', layersToRender.length);

    const position = getTooltipPosition();

    const padding = typeof config.padding === 'object' && config.padding !== null
        ? `${(config.padding as any).top * scale}px ${(config.padding as any).right * scale}px ${(config.padding as any).bottom * scale}px ${(config.padding as any).left * scale}px`
        : `${(config.padding ?? 0) * scale}px`;

    return (
        <>
            {/* SPOTLIGHT OVERLAY (ALWAYS ENABLED) */}
            {renderSpotlightOverlay()}

            {/* Tooltip Container */}
            <div
                ref={containerRef}
                onClick={(e) => {
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (isInteractive && spotlightLayer?.content?.action && timeSinceInteractEnabled > 200) {
                        handleAction(spotlightLayer.content.action);
                    } else if (!isInteractive && spotlightLayer) {
                        onLayerSelect(spotlightLayer.id);
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
                    backgroundColor: config.backgroundOpacity !== undefined && config.backgroundOpacity < 1
                        ? `rgba(${parseInt((config.backgroundColor || '#1F2937').slice(1, 3), 16)}, ${parseInt((config.backgroundColor || '#1F2937').slice(3, 5), 16)}, ${parseInt((config.backgroundColor || '#1F2937').slice(5, 7), 16)}, ${config.backgroundOpacity})`
                        : config.backgroundColor || '#1F2937',
                    backgroundImage: config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                    backgroundSize: config.backgroundSize || 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: `${(config.borderRadius || 12) * scale}px`,
                    padding: padding,
                    width: config.widthMode === 'auto'
                        ? 'auto'
                        : config.widthMode === 'fitContent'
                            ? 'fit-content'
                            : config.widthUnit === '%'
                                ? `${config.width || 280}%`
                                : safeScale(config.width || 280, scale),
                    height: config.heightMode === 'custom' && config.height
                        ? config.heightUnit === '%'
                            ? `${config.height}%`
                            : safeScale(config.height, scaleY)
                        : config.heightMode === 'fitContent'
                            ? 'fit-content'
                            : 'auto',
                    boxShadow: config.shadowEnabled !== false
                        ? `0 ${10 * scale}px ${(config.shadowBlur ?? 25) * scale}px rgba(0,0,0,${config.shadowOpacity ?? 0.2})`
                        : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    animation: 'spotlight-pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {renderArrow()}

                    <div style={{
                        overflow: 'hidden',
                        borderRadius: `${(config.borderRadius || 12) * scale}px`,
                        position: 'relative',
                        width: '100%',
                        height: config.heightMode === 'custom' && config.height
                            ? safeScale(config.height, scaleY)
                            : '100px',
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
                @keyframes spotlight-pop {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};
