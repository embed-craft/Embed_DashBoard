import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layer, ScratchCardConfig, LayerStyle } from '@/store/useEditorStore';
import { TextRenderer } from './TextRenderer';
import { ButtonRenderer } from './ButtonRenderer';
import { MediaRenderer } from './MediaRenderer';
import { Confetti } from '@/components/ui/Confetti';

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
    const [showCelebration, setShowCelebration] = useState(false);

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
    const width = typeof config?.width === 'number' ? config.width : 320;
    const height = typeof config?.height === 'number' ? config.height : 480;
    const borderRadius = config?.borderRadius || 16;
    const scratchSize = config?.scratchSize || 20;
    const revealThreshold = config?.revealThreshold || 50;

    // --- Scratch Logic ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size (scaled)
        const w = typeof width === 'number' ? width : parseInt(String(width)) || 320;
        const h = typeof height === 'number' ? height : parseInt(String(height)) || 480;

        // Calculate Scratch Area Dimensions
        const areaX = (config?.scratchArea?.x || 0) * scale;
        // Step 292 passed `scaleFactorScratch` and `scaleYFactorScratch`.
        // So I should use scale for X and scaleY for Y.

        const areaW = (config?.scratchArea?.width ?? w) * scale; // Assuming width is number
        const areaH = (config?.scratchArea?.height ?? h) * scaleY;

        canvas.width = areaW;
        canvas.height = areaH;

        // Reset state on config change
        setIsRevealed(false);
        setScratchedPercent(0);
        setShowCelebration(false);

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
                setShowCelebration(true);

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
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
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
    const handleLayerAction = (layer: Layer) => {
        if (!isInteractive) return;

        const action = layer.content?.action;
        if (!action) return;

        switch (action.type) {
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
                break;
            case 'close':
                if (onDismiss) onDismiss();
                break;
            case 'navigate':
                if (action.screenName && onNavigate) {
                    onNavigate(action.screenName);
                }
                break;
            case 'deeplink':
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
        }
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
            case 'custom_html':
                content = (
                    <div
                        dangerouslySetInnerHTML={{ __html: layer.content?.html || '' }}
                        style={{ width: '100%', height: '100%' }}
                    />
                );
                break;
            // Add other renderers as needed (progress, countdown, etc.) - keeping it simple for now
            default: content = null;
        }

        return (
            <div
                key={layer.id}
                className={`layer-item ${layer.type}-layer`}
                style={baseStyle}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isInteractive) {
                        handleLayerAction(layer);
                    } else {
                        onLayerSelect(layer.id);
                    }
                }}
            >
                {content}
            </div>
        );
    };

    // Find the root container layer (for container-level actions)
    const containerLayer = layers.find(l => l.name === 'Scratch Card Container' && l.type === 'container');

    // --- Main Render ---
    return (
        <div
            style={{
                position: 'absolute', // Always absolute positioning relative to preview container
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
                overflow: 'hidden',
                backgroundColor: config?.backgroundColor || 'white',
                backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                backgroundSize: config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover'),
                backgroundPosition: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => {
                // Handle container-level action in interact mode
                // Guard: Ignore clicks within 200ms of entering interact mode to prevent auto-trigger
                const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                if (containerLayer && isInteractive && timeSinceInteractEnabled > 200) {
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
                // Allow scratch when not revealed, allow button clicks after revealed
                pointerEvents: isRevealed ? 'auto' : 'none'
            }}>
                {layers.map(renderLayer)}
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
                    opacity: config?.previewRevealed ? 0.05 : (isRevealed && config?.autoReveal ? 0 : 1),
                    // Note: 0.05 opacity so it's barely visible as a ghost (user knows it exists), instead of 0.

                    transition: 'opacity 0.5s ease-out',
                    pointerEvents: config?.previewRevealed ? 'none' : (isRevealed ? 'none' : 'auto')
                }}
            />

            {/* Celebration Video Overlay */}
            {showCelebration && config?.completionAnimation?.type === 'video' && config?.completionAnimation?.videoUrl && (
                <div style={{
                    position: 'fixed', // Fixed to cover entire screen/preview area? Or absolute to cover card? 
                    // User requested full screen overlay in previous turns, but let's stick to container for now to avoid z-index hell in preview
                    // Actually, let's make it cover the CARD.
                    inset: 0,
                    zIndex: 20,
                    pointerEvents: 'none', // Let clicks pass through to the now-revealed content?
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <video
                        src={config.completionAnimation.videoUrl}
                        autoPlay
                        loop={config.completionAnimation.loop}
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            )}

            {/* Confetti / Fireworks / Money Celebration */}
            {showCelebration && ['confetti', 'fireworks', 'money'].includes(config?.completionAnimation?.type || '') && (
                <Confetti
                    duration={3000}
                    containerId="phone-preview-content"
                    type={config.completionAnimation?.type as any}
                />
            )}
        </div>
    );
};
