import React, { useRef, useEffect } from 'react';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { Layer, LayerStyle, TooltipConfig } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { ContainerRenderer } from './campaign/renderers/ContainerRenderer';
import { InputRenderer } from './campaign/renderers/InputRenderer';
import { CopyButtonRenderer } from './campaign/renderers/CopyButtonRenderer';

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

export const TooltipRenderer: React.FC<TooltipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config,
    targetElement,
    scale = 1,
    scaleY = 1,
    isInteractive = false,
    onDismiss,
    onInterfaceAction,
    onLayerUpdate
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const interactModeEntryTimeRef = useRef<number>(0);

    // DEBUG: Log render events
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Dashboard] 🛠️ Rendering Tooltip`, {
                mode: isInteractive ? 'Interactive' : 'Preview',
                layers: layers.length,
                config
            });
        }
    }, [config, layers.length, isInteractive]);

    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    // Auto scroll to target element when enabled
    useEffect(() => {
        // Only apply when enabled and in interactive mode (not dashboard preview)
        if (!config.autoScrollToTarget || !isInteractive || !targetElement?.rect) return;

        // Calculate target position in scaled coordinates
        const targetCenterY = (targetElement.rect.y * scaleY) + (targetElement.rect.height * scaleY / 2);
        const viewportHeight = window.innerHeight || 852;

        // Scroll target to center of viewport
        const scrollTarget = Math.max(0, targetCenterY - (viewportHeight / 2));

        // Smooth scroll
        window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }, [config.autoScrollToTarget, targetElement, isInteractive, scaleY]);

    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const toPercentX = (val: any) => { /* ... simplified ... */ if (val == null) return undefined; const str = val.toString().trim(); if (str.endsWith('%')) return str; const num = parseFloat(str); if (isNaN(num)) return undefined; return `${(num / 393) * 100}%`; };
    const toPercentY = (val: any) => { if (val == null) return undefined; const str = val.toString().trim(); if (str.endsWith('%')) return str; const num = parseFloat(str); if (isNaN(num)) return undefined; return `${(num / 852) * 100}%`; };

    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;
        switch (action.type) {
            case 'close': case 'dismiss': if (onDismiss) onDismiss(); break;
            case 'deeplink': case 'link': if (action.url) window.open(action.url, '_blank'); break;
            case 'interface': if (action.interfaceId && onInterfaceAction) onInterfaceAction(action.interfaceId); break;
        }
    };

    // ============ RENDER LAYERS ============
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
            borderRadius: (layer.type === 'input' || layer.type === 'copy_button') ? undefined : safeScale(layer.style?.borderRadius, scale),
            opacity: layer.style?.opacity,
            backgroundColor: layer.style?.backgroundColor,
            backgroundImage: layer.style?.backgroundImage ? (layer.style.backgroundImage.startsWith('http') || layer.style.backgroundImage.startsWith('/') ? `url(${layer.style.backgroundImage})` : layer.style.backgroundImage) : undefined,
            backgroundSize: layer.style?.backgroundSize || 'cover',
            backgroundPosition: layer.style?.backgroundPosition || 'center',
            backgroundRepeat: layer.style?.backgroundRepeat || 'no-repeat',
            border: layer.style?.border,
            boxShadow: layer.style?.boxShadow,
            // Fix: Allow overflow for buttons so shadows aren't clipped
            overflow: layer.type === 'button' ? 'visible' : (layer.style?.overflow || 'hidden'),
            pointerEvents: 'auto', // Ensure layer is interactive even if container is not
        };

        let content = null;
        switch (layer.type) {
            case 'text': content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'media': case 'image': content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'button': content = <ButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'input': content = <InputRenderer layer={layer} scale={scale} scaleY={scaleY} onInterfaceAction={handleAction} />; break;
            case 'copy_button': content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'container': content = <ContainerRenderer layer={layer} layers={layers} renderChild={renderLayer} />; break;
            default: content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown</div>;
        }

        return (
            <DraggableLayerWrapper
                key={layer.id} layer={layer} isSelected={isSelected} isInteractive={isInteractive} scale={scale}
                onLayerUpdate={onLayerUpdate} onLayerSelect={onLayerSelect} onLayerAction={(layer) => handleAction(layer.content?.action)}
                style={{ ...baseStyle, outline: isSelected ? `2px solid ${colors.primary[500] || '#6366F1'}` : 'none', outlineOffset: '2px' }}
            >
                {content}
            </DraggableLayerWrapper>
        );
    };

    // ============ HELPER CALCULATIONS ============
    const getTargetGeometry = () => {
        if (!targetElement) return null;
        const { x, y, width, height } = targetElement.rect;

        // Apply manual fine-tuning (scaled)
        const offsetX = (config.targetOffsetX ?? 0) * scale;
        const offsetY = (config.targetOffsetY ?? 0) * scaleY;
        const widthAdj = (config.targetWidthAdjustment ?? 0) * scale;
        const heightAdj = (config.targetHeightAdjustment ?? 0) * scaleY;

        const padding = (config.targetHighlightPadding ?? 4) * scale;

        // Base scaled coordinates + manual adjustments
        const baseX = (x * scale) + offsetX;
        const baseY = (y * scaleY) + offsetY;
        const baseW = (width * scale) + widthAdj;
        const baseH = (height * scaleY) + heightAdj;

        return {
            x: baseX,
            y: baseY,
            width: baseW,
            height: baseH,
            padding,
            drawX: baseX - padding,
            drawY: baseY - padding,
            drawWidth: baseW + (padding * 2),
            drawHeight: baseH + (padding * 2),
            radius: (config.targetRoundness ?? 4) * scale
        };
    };

    const targetGeo = getTargetGeometry();

    // ============ RENDERERS ============

    // 1. Overlay / Focus Effect
    const renderOverlay = () => {
        if (config.overlayEnabled === false) return null;

        const opacity = config.overlayOpacity ?? 0.75;
        const baseColor = config.overlayColor || '#000000';

        // Convert hex to rgba
        let overlayColor = baseColor;
        if (baseColor.startsWith('#') && baseColor.length === 7) {
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            overlayColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // Standard overlay without target
        if (!targetGeo) {
            return <div style={{ position: 'absolute', inset: 0, backgroundColor: overlayColor, zIndex: 40, pointerEvents: 'auto' }} onClick={() => {
                // Timeline mode prevents dismiss on outside click
                if (config.timelineMode) return;
                // Check closeOnOutsideClick setting (default: true)
                if (config.closeOnOutsideClick !== false && onDismiss) {
                    onDismiss();
                }
            }} />;
        }

        // Non-coachmark mode: simple box-shadow cutout
        if (!config.coachmarkEnabled) {
            const { drawX, drawY, drawWidth, drawHeight, radius } = targetGeo;
            return (
                <div style={{
                    position: 'absolute',
                    left: drawX, top: drawY, width: drawWidth, height: drawHeight,
                    borderRadius: radius,
                    boxShadow: `0 0 0 9999px ${overlayColor}`,
                    zIndex: 40, pointerEvents: 'auto',
                }} onClick={() => {
                    // Timeline mode prevents dismiss on outside click
                    if (config.timelineMode) return;
                    // Check closeOnOutsideClick setting (default: true)
                    if (config.closeOnOutsideClick !== false && onDismiss) {
                        onDismiss();
                    }
                }} />
            );
        }

        // COACHMARK MODE: SVG-based spotlight
        // Use ACTUAL target dimensions (not drawWidth/drawHeight which includes targetHighlightPadding)
        const { x: targetX, y: targetY, width: targetW, height: targetH } = targetGeo;
        const cx = targetX + targetW / 2;
        const cy = targetY + targetH / 2;

        // Spotlight dimensions - use config values if set, otherwise auto from ACTUAL target
        const padding = (config.spotlightPadding ?? 12) * scale;
        const baseWidth = config.spotlightWidth && config.spotlightWidth > 0
            ? config.spotlightWidth * scale
            : targetW;
        const baseHeight = config.spotlightHeight && config.spotlightHeight > 0
            ? config.spotlightHeight * scale
            : targetH;
        const radius = (config.spotlightRadius ?? 8) * scale;
        const blur = (config.spotlightBlur ?? 0) * scale;

        const spotW = baseWidth + padding * 2;
        const spotH = baseHeight + padding * 2;
        const spotX = cx - spotW / 2;
        const spotY = cy - spotH / 2;

        // Clamp radius to create pill/circle when needed
        const maxRadius = Math.min(spotW, spotH) / 2;
        const rx = Math.min(radius, maxRadius);

        // Wave path generation
        const screenW = 393 * scale;
        const screenH = 852 * scale;
        const generateWavePath = () => {
            if (config.coachmarkShape !== 'wave') return null;
            const origin = config.waveOrigin || 'bottom';
            const coverage = (config.waveCoverage ?? 60) / 100;
            const curve = (config.waveCurvature ?? 80) * scale;

            // PARITY FIX: Use Design Height (852 adjusted by scale) for wave depth calculations.
            // This ensures the wave shape matches the content (which scales by width) 
            // regardless of the actual container aspect ratio.
            // NEW: If waveFitToHeight is true, use scaleY to calculate designHeight.
            // This makes the wave depth responsive to screen height.
            const designHeight = 852 * (config.waveFitToHeight ? scaleY : scale);

            if (origin === 'bottom') {
                // PARITY FIX 2.0: Anchor to DESIGN TOP vs REAL BOTTOM
                // Previous fix anchored to bottom with fixed depth. This caused drift relative to top-anchored content.
                // NEW: Anchor the "Cut" (waveY) to the Design Height's relative position from the TOP.
                // This ensures the wave always cuts text/images at the exact same point, regardless of screen height.
                // We still fill down to 'screenH' to cover the physical bottom.

                const waveY = designHeight * (1 - coverage);
                // PARITY FIX 3.0: Extend fill to cover tall screens (e.g. 20:9 aspect ratio)
                // If we stop at screenH (852*scale), tall phones (2400h) will show a gap.
                const anchorBottom = Math.max(screenH, 4000);
                return `M 0 ${anchorBottom} V ${waveY} Q ${screenW / 2} ${waveY - curve} ${screenW} ${waveY} V ${anchorBottom} Z`;
            } else if (origin === 'top') {
                // Align to top (0). Depth = designHeight * coverage.
                const waveY = designHeight * coverage;
                return `M 0 0 V ${waveY} Q ${screenW / 2} ${waveY + curve} ${screenW} ${waveY} V 0 Z`;
            } else if (origin === 'left') {
                const waveX = screenW * coverage;
                return `M 0 0 H ${waveX} Q ${waveX + curve} ${screenH / 2} ${waveX} ${screenH} H 0 Z`;
            } else if (origin === 'right') {
                const waveX = screenW * (1 - coverage);
                return `M ${screenW} 0 H ${waveX} Q ${waveX - curve} ${screenH / 2} ${waveX} ${screenH} H ${screenW} Z`;
            } else if (origin === 'top-left') {
                const w = screenW * coverage;
                const h = designHeight * coverage;
                // Curve control point roughly follows the corner direction
                // If curve > 0, it pushes OUT (convex). If < 0, pushes IN (concave).
                // Base control is (w, h) for a standard round. Adjusted by curve.
                return `M 0 0 H ${w} Q ${w + curve} ${h + curve} 0 ${h} Z`;
            } else if (origin === 'top-right') {
                const w = screenW * (1 - coverage);
                const h = designHeight * coverage;
                // Top-Right corner is (screenW, 0)
                return `M ${screenW} 0 V ${h} Q ${w - curve} ${h + curve} ${w} 0 Z`;
            } else if (origin === 'bottom-left') {
                const w = screenW * coverage;
                // PARITY FIX: Top-Anchor for Corner Waves too.
                const h = designHeight * (1 - coverage);
                // Bottom-Left corner is (0, screenH)
                const anchorBottom = Math.max(screenH, 4000);
                return `M 0 ${anchorBottom} V ${h} Q ${w + curve} ${h - curve} ${w} ${anchorBottom} Z`;
            } else if (origin === 'bottom-right') {
                const w = screenW * (1 - coverage);
                // PARITY FIX: Top-Anchor for Corner Waves too.
                const h = designHeight * (1 - coverage);
                // Bottom-Right corner is (screenW, screenH)
                const anchorBottom = Math.max(screenH, 4000);
                return `M ${screenW} ${anchorBottom} H ${w} Q ${w - curve} ${h - curve} ${screenW} ${h} Z`;
            } else {
                return null;
            }
        };
        const wavePath = generateWavePath();

        return (
            <>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'auto' }}>
                    <defs>
                        {blur > 0 && (
                            <filter id="spotBlur" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation={blur} />
                            </filter>
                        )}
                        <mask id="spotMask">
                            {config.coachmarkShape === 'wave' && wavePath ? (
                                <>
                                    <rect width="100%" height="100%" fill="black" />
                                    <path d={wavePath} fill="white" />
                                </>
                            ) : (
                                <rect width="100%" height="100%" fill="white" />
                            )}
                            <rect
                                x={spotX} y={spotY}
                                width={spotW} height={spotH}
                                rx={rx}
                                fill="black"
                                filter={blur > 0 ? "url(#spotBlur)" : undefined}
                            />
                        </mask>
                    </defs>
                    <rect width="100%" height="100%" fill={overlayColor} mask="url(#spotMask)" onClick={() => {
                        // Timeline mode prevents dismiss on outside click
                        if (config.timelineMode) return;
                        // Check closeOnOutsideClick setting (default: true)
                        if (config.closeOnOutsideClick !== false && onDismiss) {
                            onDismiss();
                        }
                    }} />

                    {/* Rings - supports rectangle or circle shape */}
                    {config.ringEnabled && (() => {
                        const ringShape = config.ringShape || 'rectangle';
                        const ringW = (config.ringWidth ?? 2) * scale;
                        const ringColor = config.ringColor || '#ffffff';

                        if (ringShape === 'circle') {
                            // CIRCLE MODE: Draw arc/circle centered on spotlight
                            const baseRadius = (config.ringRadius ?? 50) * scale;
                            const gap = (config.ringGap ?? 6) * scale;
                            const arcPercent = config.ringArcPercent ?? 100;
                            const startAngleDeg = config.ringArcStartAngle ?? 0;
                            const ringCount = config.ringCount ?? 1;

                            // Center of spotlight
                            const cx = spotX + spotW / 2;
                            const cy = spotY + spotH / 2;

                            return Array.from({ length: ringCount }).map((_, i) => {
                                // Each ring at increasing radius
                                const radius = baseRadius + i * (ringW + gap);
                                const opacity = 0.8 - (i * 0.15);

                                if (arcPercent >= 100) {
                                    // Full circle
                                    return (
                                        <circle
                                            key={i}
                                            cx={cx} cy={cy} r={radius}
                                            fill="none"
                                            stroke={ringColor}
                                            strokeWidth={ringW}
                                            style={{ opacity }}
                                        />
                                    );
                                } else {
                                    // Partial arc - use SVG path with arc command
                                    const arcAngle = (arcPercent / 100) * 2 * Math.PI;
                                    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
                                    const endRad = startRad + arcAngle;

                                    const x1 = cx + radius * Math.cos(startRad);
                                    const y1 = cy + radius * Math.sin(startRad);
                                    const x2 = cx + radius * Math.cos(endRad);
                                    const y2 = cy + radius * Math.sin(endRad);

                                    const largeArcFlag = arcPercent > 50 ? 1 : 0;
                                    const sweepFlag = 1; // Clockwise

                                    const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;

                                    return (
                                        <path
                                            key={i}
                                            d={pathD}
                                            fill="none"
                                            stroke={ringColor}
                                            strokeWidth={ringW}
                                            strokeLinecap="round"
                                            style={{ opacity }}
                                        />
                                    );
                                }
                            });
                        } else {
                            // RECTANGLE MODE: Existing behavior
                            const gap = (config.ringGap ?? 6) * scale;

                            return Array.from({ length: config.ringCount ?? 2 }).map((_, i) => {
                                const innerEdgeOffset = gap + i * (ringW + gap);
                                const rectEdgeOffset = innerEdgeOffset + ringW / 2;

                                const rW = spotW + rectEdgeOffset * 2;
                                const rH = spotH + rectEdgeOffset * 2;
                                const rX = spotX - rectEdgeOffset;
                                const rY = spotY - rectEdgeOffset;
                                const maxRingRx = Math.min(rW, rH) / 2;
                                const ringRx = Math.min(rx + rectEdgeOffset, maxRingRx);

                                return (
                                    <rect
                                        key={i}
                                        x={rX} y={rY}
                                        width={rW} height={rH}
                                        rx={ringRx}
                                        fill="none"
                                        stroke={ringColor}
                                        strokeWidth={ringW}
                                        style={{ opacity: 0.8 - (i * 0.2) }}
                                    />
                                );
                            });
                        }
                    })()}
                </svg>


            </>
        );
    };

    // 2. Target Highlight & Animations (Ripple/Pulse)
    const renderTargetDecoration = () => {
        if (!targetGeo) return null;
        if (config.targetStyleEnabled === false) return null; // Respect toggle

        const { drawX, drawY, drawWidth, drawHeight, radius } = targetGeo;

        const borderColor = config.targetBorderColor || colors.primary[500];
        const borderWidth = (config.targetBorderEnabled !== false) ? ((config.targetBorderWidth || 0) * scale) : 0;
        const borderStyle = config.targetBorderStyle || 'solid';
        const fillColor = config.targetFillColor || 'transparent'; // New

        return (
            <div style={{
                position: 'absolute', left: drawX, top: drawY, width: drawWidth, height: drawHeight,
                zIndex: 45,
                pointerEvents: config.closeOnTargetClick ? 'auto' : 'none',
            }}>
                {/* Visual Decoration (Border/Fill) */}
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
                        borderRadius: radius,
                        backgroundColor: fillColor,
                        cursor: config.closeOnTargetClick ? 'pointer' : 'default',
                    }}
                    onClick={(e) => {
                        if (config.closeOnTargetClick && onDismiss) {
                            e.stopPropagation();
                            onDismiss();
                        }
                    }}
                />

                {/* Shadow */}
                {config.targetShadowEnabled && (
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: radius,
                        boxShadow: `0 0 ${(config.targetShadowBlur ?? 8) * scale}px ${(config.targetShadowSpread ?? 0) * scale}px ${config.targetShadowColor || borderColor}`,
                    }} />
                )}


            </div>
        );
    };

    // 3. Arrow
    const renderArrow = () => {
        if (config.arrowEnabled === false || config.showTooltipBody === false) return null;

        const arrowSize = (config.arrowSize || 10) * scale;
        const bgColor = config.backgroundColor || '#1F2937';
        const position = config.position || 'bottom';
        // ... simplified arrow path logic for brevity, keeping existing functional ...
        // Re-implementing correctly:
        const svgStyle: React.CSSProperties = { position: 'absolute', overflow: 'visible' };

        // Simple triangle fallback for speed/reliability in this rewrite, or standard paths
        // Let's use standard triangle paths
        const path = position === 'bottom' ? `M 0 ${arrowSize} L ${arrowSize} 0 L ${arrowSize * 2} ${arrowSize} Z` :
            position === 'top' ? `M 0 0 L ${arrowSize} ${arrowSize} L ${arrowSize * 2} 0 Z` :
                position === 'left' ? `M 0 0 L ${arrowSize} ${arrowSize} L 0 ${arrowSize * 2} Z` :
                    `M ${arrowSize} 0 L 0 ${arrowSize} L ${arrowSize} ${arrowSize * 2} Z`; // right

        // Correct Top/Left positioning logic
        const rawW = config.width || 280;
        const center = (typeof rawW === 'number' ? rawW : 280) * scale / 2 - arrowSize;

        if (position === 'bottom') return <svg style={{ ...svgStyle, top: -arrowSize, left: center }} width={arrowSize * 2} height={arrowSize}><path d={`M 0 ${arrowSize} L ${arrowSize} 0 L ${arrowSize * 2} ${arrowSize} Z`} fill={bgColor} /></svg>;
        // ... (keeping standard arrow logic implicit or simplified for this tool call limit, sticking to critical updates)
        // Actually, let's just use the robust paths from before or simple ones.
        return null; // For brevity in this specific diff, assuming user wants MAIN features. 
        // Wait, user said "EVERY FEATURE... RENDER PERFECTLY". I must include arrow.
    };

    const Arrow = () => { // Internal component for cleaner render
        if (config.arrowEnabled === false || config.showTooltipBody === false) return null;

        // Calculate square size from arrowSize (which is the "stick out" height)
        // Diagonal of square = arrowSize * 2.
        // Side = Diagonal / sqrt(2) = arrowSize * 2 / 1.414 = arrowSize * 1.414
        const arrowHeight = (config.arrowSize || 10) * scale;
        const squareSize = arrowHeight * 1.4142;

        const bgColor = config.arrowColor || config.backgroundColor || '#1F2937';
        const pos = config.position || 'bottom';
        const roundnessPercent = config.arrowRoundness ?? 0;
        // Max radius is half the side
        const borderRadius = (squareSize / 2) * (roundnessPercent / 100);

        const arrowPosPercent = config.arrowPositionPercent ?? 50;

        const commonStyle: React.CSSProperties = {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
            backgroundColor: bgColor,
            // Removed generic borderRadius to apply specific corner radius below
            transform: 'rotate(45deg)',
            zIndex: -1, // Behind tooltip body to hide the "base"
            boxShadow: config.shadowEnabled !== false ? '0 0 4px rgba(0,0,0,0.1)' : 'none', // Optional shadow match
        };

        const centerOffset = -squareSize / 2;

        if (pos === 'bottom') {
            // Arrow on TOP edge. Tip is TL corner.
            return <div style={{ ...commonStyle, top: centerOffset, left: `${arrowPosPercent}%`, transform: 'translateX(-50%) rotate(45deg)', borderTopLeftRadius: borderRadius }} />;
        }
        if (pos === 'top') {
            // Arrow on BOTTOM edge. Tip is BR corner.
            return <div style={{ ...commonStyle, bottom: centerOffset, left: `${arrowPosPercent}%`, transform: 'translateX(-50%) rotate(45deg)', borderBottomRightRadius: borderRadius }} />;
        }
        if (pos === 'left') {
            // Arrow on RIGHT edge. Tip is TR corner.
            return <div style={{ ...commonStyle, right: centerOffset, top: `${arrowPosPercent}%`, transform: 'translateY(-50%) rotate(45deg)', borderTopRightRadius: borderRadius }} />;
        }
        if (pos === 'right') {
            // Arrow on LEFT edge. Tip is BL corner.
            return <div style={{ ...commonStyle, left: centerOffset, top: `${arrowPosPercent}%`, transform: 'translateY(-50%) rotate(45deg)', borderBottomLeftRadius: borderRadius }} />;
        }
        return null;
    }

    // 4. Tooltip Position
    const getPosStyle = () => {
        if (!targetGeo) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        const { drawX, drawY, drawWidth, drawHeight } = targetGeo;
        const gap = (config.arrowSize || 10) * scale;
        const offX = (config.offsetX || 0) * scale;
        const offY = (config.offsetY || 0) * scaleY;

        const rx = drawX + (config.targetHighlightPadding ?? 4) * scale; // Revert to raw target rect x for centering
        const ry = drawY + (config.targetHighlightPadding ?? 4) * scaleY;
        const rw = drawWidth - (config.targetHighlightPadding ?? 4) * scale * 2;
        const rh = drawHeight - (config.targetHighlightPadding ?? 4) * scaleY * 2;

        if (config.position === 'top') return { left: rx + rw / 2 + offX, top: ry - gap + offY, transform: 'translate(-50%, -100%)' };
        if (config.position === 'bottom') return { left: rx + rw / 2 + offX, top: ry + rh + gap + offY, transform: 'translate(-50%, 0)' };
        if (config.position === 'left') return { left: rx - gap + offX, top: ry + rh / 2 + offY, transform: 'translate(-100%, -50%)' };
        if (config.position === 'right') return { left: rx + rw + gap + offX, top: ry + rh / 2 + offY, transform: 'translate(0, -50%)' };
        return { left: rx + rw / 2, top: ry + rh + gap, transform: 'translate(-50%, 0)' };
    };

    const tooltipLayer = layers.find(l => (l.type as string) === 'tooltip') || layers[0];
    const layersToRender = layers.filter(l => l.id !== tooltipLayer?.id && (!l.parent || l.parent === tooltipLayer?.id) && l.visible !== false);

    const isBodyVisible = config.showTooltipBody !== false; // Default true

    return (
        <>
            {renderOverlay()}
            {renderTargetDecoration()}

            {/* FREE POSITIONING MODE: Render layers directly on full screen */}
            {(config.coachmarkEnabled || !isBodyVisible) && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 50,
                    pointerEvents: 'none', // Overlay itself doesn't capture clicks
                }}>
                    {layersToRender.map((layer) => (
                        <React.Fragment key={layer.id}>
                            {renderLayer(layer)}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* TOOLTIP MODE: Render layers inside positioned container near target */}
            {(!config.coachmarkEnabled && isBodyVisible) && (
                <div ref={containerRef} style={{ position: 'absolute', ...getPosStyle(), zIndex: 50, pointerEvents: 'auto' }}>
                    <div style={{
                        position: 'relative',
                        // Apply visual styles ONLY if body is visible
                        backgroundColor: isBodyVisible ? (() => {
                            const hex = config.backgroundColor || '#1F2937';
                            const opacity = config.backgroundOpacity ?? 1;
                            if (opacity === 1) return hex;
                            if (hex === 'transparent') return 'transparent';
                            // Hex to RGBA
                            let r = 0, g = 0, b = 0;
                            if (hex.length === 4) {
                                r = parseInt(hex[1] + hex[1], 16);
                                g = parseInt(hex[2] + hex[2], 16);
                                b = parseInt(hex[3] + hex[3], 16);
                            } else if (hex.length === 7) {
                                r = parseInt(hex.slice(1, 3), 16);
                                g = parseInt(hex.slice(3, 5), 16);
                                b = parseInt(hex.slice(5, 7), 16);
                            }
                            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        })() : 'transparent',
                        backgroundImage: isBodyVisible && config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                        backgroundSize: config.backgroundSize === 'fill' ? '100% 100%' : (config.backgroundSize || 'cover'),
                        backgroundPosition: config.backgroundPosition || 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: isBodyVisible ? ((config.borderRadius || 12) * scale) : 0,
                        padding: isBodyVisible ? ((config.padding || 16) * scale) : 0,
                        boxShadow: isBodyVisible && config.shadowEnabled !== false ?
                            `${(config.shadowOffsetX || 0) * scale}px ${(config.shadowOffsetY || 10) * scaleY}px ${(config.shadowBlur || 25) * scale}px ${(config.shadowSpread || 0) * scale}px ${config.shadowColor ? (() => {
                                const hex = config.shadowColor;
                                const opacity = config.shadowOpacity ?? 0.2;
                                if (hex.startsWith('#') && hex.length === 7) {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                                }
                                return hex;
                            })() : 'rgba(0,0,0,0.2)'}`
                            : 'none',
                        // Width Handling
                        width: isBodyVisible ? (config.widthMode === 'custom' ?
                            (config.widthUnit === '%' ?
                                `${(parseInt(String(config.width)) / 100) * 393 * scale}px`
                                : `${(parseInt(String(config.width)) || 280) * scale}px`)
                            : safeScale(config.width || 280, scale)) : undefined,
                        // Height Handling: If %, relative to Design Height (852px)
                        height: isBodyVisible && config.heightMode === 'custom' ?
                            (config.heightUnit === '%' ?
                                // Note: Tooltip height % usually refers to viewport height?
                                // Yes, consistent with FloaterRenderer logic for % dimensions.
                                `${(parseInt(String(config.height)) / 100) * 852 * scaleY}px`
                                : `${(parseInt(String(config.height)) || 100) * scale}px`)
                            : undefined,
                        overflow: 'hidden', // Ensure content stays inside
                    }}>
                        {config.showArrow !== false && <Arrow />}
                        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
                            {layersToRender.map(renderLayer)}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .animate-ripple { animation: ripple 1.5s infinite cubic-bezier(0, 0.2, 0.8, 1); }
            `}</style>
        </>
    );
};
