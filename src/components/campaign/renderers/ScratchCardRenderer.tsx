import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DraggableLayerWrapper } from './DraggableLayerWrapper';
import { Layer, ScratchCardConfig, LayerStyle } from '@/store/useEditorStore';
import { TextRenderer } from './TextRenderer';
import { ButtonRenderer } from './ButtonRenderer';
import { MediaRenderer } from './MediaRenderer';
import { ContainerRenderer } from './ContainerRenderer';
import { InputRenderer } from './InputRenderer';
import { CopyButtonRenderer } from './CopyButtonRenderer';


interface ScratchCardRendererProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config?: ScratchCardConfig;
    onConfigChange?: (config: ScratchCardConfig) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (screenName: string) => void;
    onInterfaceAction?: (interfaceId: string) => void;
    scale?: number;
    scaleY?: number;
}

// Helper to adjust color brightness (copied from ModalRenderer)
const adjustColorBrightness = (color: string, percent: number) => {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
};

export const ScratchCardRenderer: React.FC<ScratchCardRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config,
    onConfigChange,
    onLayerUpdate,
    isInteractive = false,
    onDismiss,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [scratchedPercent, setScratchedPercent] = useState(0);

    // NEW: Delay interaction for 1s after reveal
    const [isPrizeInteractable, setIsPrizeInteractable] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            const timer = setTimeout(() => {
                setIsPrizeInteractable(true);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setIsPrizeInteractable(false);
        }
    }, [isRevealed]);

    // Guard: Track when interact mode was enabled to prevent auto-triggering
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Configuration Defaults
    // Configuration Defaults
    const width = config?.width ?? 320;
    const height = config?.height ?? 480;
    const borderRadius = config?.borderRadius || 16;
    const scratchSize = config?.scratchSize || 20;
    const revealThreshold = config?.revealThreshold || 50;

    // --- Scratch Logic ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution to match rendered size (fix for % vs px and blurriness)
        const rect = canvas.getBoundingClientRect();
        // Adjust for scale being part of the transform?
        // The rect.width/height is the actual screen pixels. This gives us 1:1 pixel mapping (crisp).
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Reset state on config change
        setIsRevealed(false);
        setScratchedPercent(0);


        // Draw Cover
        ctx.globalCompositeOperation = 'source-over';

        if (config?.coverType === 'image' && config.coverImage) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = config.coverImage;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.onerror = () => {
                // Fallback
                ctx.fillStyle = config.coverColor || '#CCCCCC';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            };
        } else {
            ctx.fillStyle = config.coverColor || '#CCCCCC';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

    }, [config?.coverType, config?.coverImage, config?.coverColor, config?.scratchArea, width, height, scale, scaleY]); // Re-run when sizing/cover changes

    // Interaction Handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isInteractive || isRevealed) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        const checkReveal = () => {
            if (isRevealed) return;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            // Sample every 4th pixel for performance
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) {
                    transparentPixels++;
                }
            }

            const totalPixels = pixels.length / 16; // Adjusted for sampling
            const percent = (transparentPixels / totalPixels) * 100;

            setScratchedPercent(percent);

            if (percent > revealThreshold) {
                setIsRevealed(true);


                // Auto-clear
                if (config?.autoReveal) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        };

        const getPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        };

        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing) return;
            e.preventDefault();

            const pos = getPos(e);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineJoin = config?.brushStyle === 'round' ? 'round' : 'bevel';
            ctx.lineCap = config?.brushStyle === 'round' ? 'round' : 'butt';

            // Spray Logic sim
            if (config?.brushStyle === 'spray') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'black';
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.lineWidth = scratchSize * scale; // Scale brush size

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            lastX = pos.x;
            lastY = pos.y;
        };

        const stopDrawing = () => {
            if (isDrawing) {
                isDrawing = false;
                checkReveal();
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isInteractive, isRevealed, scratchSize, scale, revealThreshold, config]);


    // --- Action Handling ---
    const handleActionObject = (action: any) => {
        if (!isInteractive || !action) return;

        switch (action.type) {
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
                break;
            case 'close':
                if (onDismiss) onDismiss();
                break;
            case 'link':
                // New distinct type for External URLs
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
            case 'navigate':
                // FIX: ActionsEditor saves External URL as 'navigate' type but puts value in 'url'
                // Deeplink saves value in 'url'
                // Screen navigation saves value in 'screenName' (not yet in ActionsEditor?)
                // So for 'navigate', check both.
                if (action.screenName && onNavigate) {
                    onNavigate(action.screenName);
                } else if (action.url) {
                    // Legacy fallback: Treat as external URL if url is present
                    window.open(action.url, '_blank');
                }
                break;
            case 'deeplink':
                if (action.url) {
                    // Deep links also often open via window.open, or custom logic
                    window.open(action.url, '_blank');
                }
                break;
        }
    };

    const handleLayerAction = (layer: Layer) => {
        if (!isInteractive) return;
        // Prioritize root action (Global Tab)
        const action = (layer as any).action || layer.content?.action;
        handleActionObject(action);
    };

    // --- Layer Rendering Logic (Copied from ModalRenderer) ---
    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        // Skip rendering the container itself if it's the root container handled by wrapper
        if (layer.name === 'Scratch Card Container') return null;

        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';

        // STRETCH FIX logic
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

        const scaledStyle: any = {
            ...layer.style,
            top: toPercentY(layer.style?.top),
            bottom: toPercentY(layer.style?.bottom),
            left: toPercentX(layer.style?.left),
            right: toPercentX(layer.style?.right),
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scaleY),

            marginTop: safeScale(layer.style?.marginTop, scaleY),
            marginBottom: safeScale(layer.style?.marginBottom, scaleY),
            marginLeft: safeScale(layer.style?.marginLeft, scale),
            marginRight: safeScale(layer.style?.marginRight, scale),
            paddingTop: safeScale(layer.style?.paddingTop, scaleY),
            paddingBottom: safeScale(layer.style?.paddingBottom, scaleY),
            paddingLeft: safeScale(layer.style?.paddingLeft, scale),
            paddingRight: safeScale(layer.style?.paddingRight, scale),
            borderRadius: typeof layer.style?.borderRadius === 'object'
                ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
                : safeScale(layer.style?.borderRadius, scale),
            fontSize: safeScale(layer.style?.fontSize, scale),
        };

        // FIX: For Input, Copy Button, Button, and Countdown layers, strip visual styles from wrapper (applied to inner element instead)
        if (layer.type === 'input' || layer.type === 'copy_button' || layer.type === 'button' || layer.type === 'countdown' || layer.type === 'text') {
            delete scaledStyle.backgroundColor;
            delete scaledStyle.border;
            delete scaledStyle.borderWidth;
            delete scaledStyle.borderColor;
            delete scaledStyle.borderStyle;
            delete scaledStyle.borderRadius;
            delete scaledStyle.paddingTop;
            delete scaledStyle.paddingBottom;
            delete scaledStyle.paddingLeft;
            delete scaledStyle.paddingRight;
            delete scaledStyle.padding;
        }

        let finalMarginTop = safeScale(layer.style?.marginTop, scaleY);
        let finalMarginBottom = safeScale(layer.style?.marginBottom, scaleY);
        let finalMarginLeft = safeScale(layer.style?.marginLeft, scale);
        let finalMarginRight = safeScale(layer.style?.marginRight, scale);
        let finalMargin = undefined;

        if (layer.style?.margin) {
            if (typeof layer.style.margin === 'string' && layer.style.margin.includes(' ')) {
                finalMargin = layer.style.margin;
            } else {
                finalMargin = safeScale(layer.style.margin, scale);
            }
        }

        if (isAbsolute) {
            finalMarginTop = undefined;
            finalMarginBottom = undefined;
            finalMarginLeft = undefined;
            finalMarginRight = undefined;
            finalMargin = undefined;
            scaledStyle.paddingTop = undefined;
            scaledStyle.paddingBottom = undefined;
            scaledStyle.paddingLeft = undefined;
            scaledStyle.paddingRight = undefined;
        } else if (layer.type !== 'custom_html') {
            if (finalMarginBottom === undefined && finalMargin === undefined) {
                finalMarginBottom = safeScale(10, scaleY);
            }
        }

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            margin: finalMargin,
            marginTop: finalMarginTop,
            marginBottom: finalMarginBottom,
            marginLeft: finalMarginLeft,
            marginRight: finalMarginRight,
            ...scaledStyle,
            // Highlight selected layer
            outline: isSelected ? '2px solid #6366F1' : 'none',
            outlineOffset: '2px',
        };

        let content = null;
        switch (layer.type) {
            case 'text': content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'copy_button': content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'media': content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'button':
                content = (
                    <ButtonRenderer
                        layer={layer}
                        scale={scale}
                        scaleY={scaleY}
                    // onClick removed to let wrapper handle it
                    />
                );
                break;
            case 'input':
                content = (
                    <InputRenderer
                        layer={layer}
                        scale={scale}
                        scaleY={scaleY}
                        onInterfaceAction={(actionIdOrObj) => {
                            // Handle full action object or string ID
                            if (typeof actionIdOrObj === 'string') {
                                if (onInterfaceAction) onInterfaceAction(actionIdOrObj);
                            } else {
                                // Calls handleActionObject which handles logic safely
                                handleActionObject(actionIdOrObj);
                            }
                        }}
                    />
                );
                break;
            case 'custom_html':
                content = (
                    <div
                        dangerouslySetInnerHTML={{ __html: layer.content?.html || '' }}
                        style={{ width: '100%', height: '100%' }}
                    />
                );
                break;
            case 'container':
                content = (
                    <ContainerRenderer
                        layer={layer}
                        layers={layers}
                        renderChild={renderLayer} // renderLayer now handles onInterfaceAction via InputRenderer call
                    />
                );
                break;
            // Add other renderers as needed (progress, countdown, etc.) - keeping it simple for now
            default: content = null;
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
                onLayerAction={handleLayerAction}
                className={`layer-item ${layer.type}-layer`}
                style={{
                    ...baseStyle,
                    outline: isSelected ? '2px solid #6366F1' : 'none',
                    outlineOffset: '2px',
                }}
            >
                {content}
            </DraggableLayerWrapper>
        );
    };

    // --- Confetti Logic ---
    const triggerConfetti = () => {
        // Default to true if not explicitly disabled
        const enabled = config?.completionAnimation?.enabled ?? true;
        if (!enabled) return;

        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
        const particleCount = 50;

        // Use the container or document body if container not found
        const container = canvasRef.current?.parentElement || document.body;

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '6px';
            p.style.height = '6px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.borderRadius = '50%';
            // Start from center of card
            p.style.left = '50%';
            p.style.top = '50%';
            p.style.zIndex = '100';
            p.style.pointerEvents = 'none';

            container.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
            const tx = Math.cos(angle) * (velocity * 20); // Distance
            const ty = Math.sin(angle) * (velocity * 20);

            p.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0, .9, .57, 1)',
                fill: 'forwards'
            }).onfinish = () => p.remove();
        }
    };

    // Watch for reveal to trigger confetti
    useEffect(() => {
        if (isRevealed) {
            triggerConfetti();
        }
    }, [isRevealed]);

    // Find the root container layer (for container-level actions)
    // FIX: Don't rely on strict name 'Scratch Card Container', find any root container
    const containerLayer = layers.find(l => l.type === 'container' && !l.parent) || layers.find(l => l.type === 'container');

    // --- Main Render ---
    // WRAPPER for Backdrop + Card
    return (
        <>
            {/* Backdrop Overlay */}
            {(config?.overlay?.enabled ?? true) && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: config?.overlay?.color || 'black',
                        opacity: config?.overlay?.opacity ?? 0.5,
                        zIndex: 0, // Behind card
                        pointerEvents: isInteractive ? 'auto' : 'none', // Block clicks if interactive
                        transition: 'opacity 0.3s ease'
                    }}
                    onClick={() => {
                        if (isInteractive && config?.overlay?.dismissOnClick !== false && onDismiss) {
                            onDismiss();
                        }
                    }}
                />
            )}

            {/* Main Card Container */}
            <div
                style={{
                    position: 'absolute', // Always absolute positioning relative to preview container
                    zIndex: 10, // Above backdrop
                    ...((config?.position === 'custom') ? {
                        top: safeScale(config.y || 0, scaleY),
                        left: safeScale(config.x || 0, scale),
                    } : (config?.position === 'bottom') ? {
                        bottom: safeScale(config.y || 0, scaleY),
                        left: '50%',
                        transform: 'translateX(-50%)',
                    } : {
                        // Default: Center
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }),

                    width: safeScale(width, scale),
                    height: safeScale(height, scaleY),
                    borderRadius: safeScale(borderRadius, scale),
                    borderWidth: safeScale(config?.borderWidth || 0, scale),
                    borderColor: config?.borderColor || 'transparent',
                    borderStyle: config?.borderStyle || ((config?.borderWidth && config.borderWidth > 0) ? 'solid' : 'none'),
                    overflow: 'hidden',
                    backgroundColor: config?.backgroundColor || 'white',
                    backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                    backgroundSize: config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover'),
                    backgroundPosition: 'center',
                    boxShadow: config?.boxShadow?.enabled
                        ? `${safeScale(0, scale)} ${safeScale(10, scale)} ${safeScale(config.boxShadow.blur, scale)} ${safeScale(0, scale)} ${config.boxShadow.color}`
                        : `0 ${safeScale(20, scale)} ${safeScale(25, scale)} ${safeScale(-5, scale)} rgba(0, 0, 0, 0.1), 0 ${safeScale(10, scale)} ${safeScale(10, scale)} ${safeScale(-5, scale)} rgba(0, 0, 0, 0.04)`,
                }}
                onClick={(e) => {
                    // Handle container-level action in interact mode
                    // Guard: Ignore clicks within 200ms of entering interact mode to prevent auto-trigger
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (containerLayer && isInteractive && timeSinceInteractEnabled > 200) {
                        console.log('Container Clicked, Action:', containerLayer.content?.action, 'Layer:', containerLayer);
                        handleLayerAction(containerLayer);
                    } else if (!isInteractive && containerLayer) {
                        // In editor mode, select the container
                        onLayerSelect(containerLayer.id);
                    }
                }}
            >

                {/* The "Prize" Content (Rendered Layers) */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    padding: safeScale(20, scale),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    // Allow scratch when not revealed, allow button clicks after revealed AND delay (1s)
                    // FIX: Also allow interaction if previewRevealed is true (Editor Mode)
                    pointerEvents: (isPrizeInteractable || config?.previewRevealed) ? 'auto' : 'none'
                }}>
                    {layers
                        .filter(l => !l.parent || (containerLayer && l.id !== containerLayer.id && l.parent === containerLayer.id))
                        .map(renderLayer)}
                </div>

                {/* The Scratch Foil (Canvas) */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: config?.scratchArea?.y ? config.scratchArea.y : 0,
                        left: config?.scratchArea?.x ? config.scratchArea.x : 0,
                        width: config?.scratchArea?.width ? config.scratchArea.width : '100%',
                        height: config?.scratchArea?.height ? config.scratchArea.height : '100%',
                        zIndex: 10,
                        cursor: config?.previewRevealed ? 'default' : (isInteractive && !isRevealed ? 'grab' : 'default'),
                        // Hide if revealing for preview, OR if naturally revealed and autoReveal is on
                        opacity: config?.previewRevealed ? 0 : (isRevealed && config?.autoReveal ? 0 : 1),
                        // Note: 0.05 opacity so it's barely visible as a ghost (user knows it exists), instead of 0.

                        transition: 'opacity 0.5s ease-out',
                        pointerEvents: config?.previewRevealed ? 'none' : (isRevealed ? 'none' : 'auto')
                    }}
                />


                {/* Overlay Hint */}
                {(config?.overlayHint?.enabled && !isRevealed && !config?.previewRevealed) && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(0,0,0,0.6)', padding: `${safeScale(8, scale)} ${safeScale(16, scale)}`,
                            borderRadius: safeScale(20, scale), color: 'white', fontSize: safeScale(14, scale), fontWeight: 600,
                            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: safeScale(8, scale)
                        }}>
                            <span>👆</span> {config.overlayHint.text || 'Scratch Here!'}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {(config?.progressBar?.enabled && !isRevealed && !config?.previewRevealed) && (
                    <div style={{
                        position: 'absolute', bottom: safeScale(20, scaleY), left: '50%', transform: 'translateX(-50%)',
                        width: '80%', height: safeScale(6, scaleY), backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: safeScale(10, scale), overflow: 'hidden', zIndex: 20, pointerEvents: 'none',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            width: `${scratchedPercent}%`, height: '100%',
                            backgroundColor: config.progressBar.color || '#6366F1',
                            transition: 'width 0.1s linear'
                        }} />
                    </div>
                )}

                {/* Close Button */}
                {(config?.closeButton?.enabled ?? true) && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isInteractive && onDismiss) onDismiss();
                        }}
                        style={{
                            position: 'absolute',
                            zIndex: 30, // Above everything
                            cursor: 'pointer',
                            padding: safeScale(6, scale),
                            borderRadius: '50%',
                            backgroundColor: config.closeButton?.backgroundColor || 'white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',

                            // Positioning
                            ...(config.closeButton?.position === 'outside-right' ? {
                                top: safeScale(-12, scaleY),
                                right: safeScale(-12, scale),
                            } : config.closeButton?.position === 'top-left' ? {
                                top: safeScale(12, scaleY),
                                left: safeScale(12, scale),
                            } : {
                                // Default: Top Right Inside
                                top: safeScale(12, scaleY),
                                right: safeScale(12, scale),
                            })
                        }}
                    >
                        <svg width={safeScale(16, scale)} height={safeScale(16, scale)} viewBox="0 0 24 24" fill="none" stroke={config.closeButton?.color || 'black'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                )}

            </div>
        </>
    );
};
