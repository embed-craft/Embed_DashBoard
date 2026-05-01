import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Layer } from '@/store/useEditorStore';
import { useGridElementData } from '@/components/campaign/renderers/GridElementContext';

interface ScratchFoilLayerRendererProps {
    layer: Layer;
    scale?: number;
    isInteractive?: boolean;
}

export const ScratchFoilLayerRenderer: React.FC<ScratchFoilLayerRendererProps> = ({
    layer,
    scale = 1,
    isInteractive = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const content = layer.content || {};

    // Custom Cursor State — JS overlay approach because CSS cursor:url() silently
    // fails for images > 128×128px and cross-origin images without proper headers.
    const cursorImageUrl = content.cursorImage || '';
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [isCursorLoaded, setIsCursorLoaded] = useState(false);
    
    // Config defaults
    const scratchSize = content.scratchSize || 40;
    const revealThreshold = content.revealThreshold || 50;
    const coverColor = content.coverColor || '#CCCCCC';
    const coverImage = content.coverImage;

    const cursorSize = 80 * scale; // Independent, big custom cursor

    // Preload cursor image to verify it's valid
    useEffect(() => {
        if (!cursorImageUrl) {
            setIsCursorLoaded(false);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = cursorImageUrl;
        img.onload = () => setIsCursorLoaded(true);
        img.onerror = () => setIsCursorLoaded(false);
    }, [cursorImageUrl]);

    // Grid Data Binding: check if this reward is already claimed
    const { dataItem } = useGridElementData();
    const statusKey = content.statusBindingKey || 'status'; // fallback to standard 'status'
    let isClaimed = false;
    
    if (dataItem && dataItem[statusKey] !== undefined) {
        const val = dataItem[statusKey];
        if (typeof val === 'string') {
            // "locked", "unlocked", "redeemed", "claimed"
            isClaimed = ['unlocked', 'redeemed', 'claimed'].includes(val.toLowerCase());
        } else {
            isClaimed = !!val; // boolean fallback
        }
    }
    const coverColor = content.coverColor || '#CCCCCC';
    const coverImage = content.coverImage;

    // Image Caching to prevent blinking on resize
    const cachedImageRef = useRef<HTMLImageElement | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Preload image when URL changes
    useEffect(() => {
        if (!coverImage) {
            cachedImageRef.current = null;
            setIsImageLoaded(false);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = coverImage;
        img.onload = () => {
            cachedImageRef.current = img;
            setIsImageLoaded(true);
        };
    }, [coverImage]);

    // Initialize Canvas & Resize Observer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const initCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            // 1. Handle Resizing (Only clear if necessary)
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }

            // 2. Format Context for Drawing (Always redraw content on init/update)
            if (!isRevealed) {
                if (coverImage && cachedImageRef.current && isImageLoaded) {
                    // Synchronous draw if image is ready
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(cachedImageRef.current, 0, 0, canvas.width, canvas.height);
                } else if (coverImage && !isImageLoaded) {
                    // Use solid color while loading to avoid transparent flash
                    ctx.fillStyle = coverColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = coverColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            // Only reset if we are NOT in interactive mode (or if just initializing)
            // This allows the "Revealed" state to persist while interact mode is ON.
            if (!isInteractive) {
                setIsRevealed(false);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            initCanvas();
        });

        resizeObserver.observe(canvas);

        // Initial draw
        initCanvas();

        return () => {
            resizeObserver.disconnect();
        };
    }, [coverColor, coverImage, scratchSize, scale, isInteractive, isImageLoaded]);

    // Interaction Logic (Pointer Events)
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
            // Sample pixels to check transparency
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparent = 0;
            // Sample every 16th pixel (4x4 block) for performance
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) transparent++;
            }
            const sampledCount = pixels.length / 16;
            const percent = (transparent / sampledCount) * 100;

            if (percent > revealThreshold) {
                setIsRevealed(true);
                // Clear to reveal all
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        const getPos = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (canvas.width / rect.width),
                y: (e.clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const start = (e: PointerEvent) => {
            // STOP FLOATER DRAG - Critical Fix
            e.stopPropagation();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);

            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x; lastY = pos.y;
            
            // Manually update cursor position because stopPropagation blocks React events
            const rect = canvas.getBoundingClientRect();
            setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        };

        const draw = (e: PointerEvent) => {
            // Even if not drawing, we should update the cursor position when moving over the canvas
            // if we have captured the pointer. But wait, if not drawing, the mouse might just be hovering.
            // But if hovering, stopPropagation is NOT called (since we return early).
            if (!isDrawing) return;
            
            e.preventDefault();
            e.stopPropagation();

            // Manually update cursor position because stopPropagation blocks React events
            const rect = canvas.getBoundingClientRect();
            setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

            const pos = getPos(e);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = scratchSize * scale;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            lastX = pos.x; lastY = pos.y;
        };

        const stop = (e: PointerEvent) => {
            if (isDrawing) {
                isDrawing = false;
                try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (e) { }
                checkReveal();
            }
        };

        // Use Pointer Events for unified touch/mouse handling
        canvas.addEventListener('pointerdown', start as any);
        canvas.addEventListener('pointermove', draw as any);
        canvas.addEventListener('pointerup', stop as any);
        canvas.addEventListener('pointercancel', stop as any);
        canvas.addEventListener('pointerleave', stop as any);

        return () => {
            canvas.removeEventListener('pointerdown', start as any);
            canvas.removeEventListener('pointermove', draw as any);
            canvas.removeEventListener('pointerup', stop as any);
            canvas.removeEventListener('pointercancel', stop as any);
            canvas.removeEventListener('pointerleave', stop as any);
        };
    }, [isInteractive, isRevealed, scratchSize, scale, revealThreshold]);

    // Custom cursor position tracking — uses the container div so the overlay
    // image follows the pointer without interfering with canvas scratch events.
    const handlePointerMoveForCursor = useCallback((e: React.PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const handlePointerLeaveForCursor = useCallback(() => {
        setCursorPos(null);
    }, []);

    // Should we show the JS cursor overlay?
    const showCursorOverlay = isInteractive && !isRevealed && isCursorLoaded && cursorImageUrl;

    // If reward is already claimed via grid data binding, hide the foil
    if (isClaimed) {
        return <div style={{ width: '100%', height: '100%' }} />;
    }

    return (
        <div
            ref={containerRef}
            onPointerMove={showCursorOverlay ? handlePointerMoveForCursor : undefined}
            onPointerLeave={showCursorOverlay ? handlePointerLeaveForCursor : undefined}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: isInteractive ? 'auto' : 'none',
                touchAction: 'none',
                borderRadius: content.borderRadius ? `${content.borderRadius * scale}px` : undefined
            }}
        >
            <canvas
                ref={canvasRef}
                className="nodrag"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    opacity: isRevealed ? 0 : 1, // Only hide if revealed
                    transition: 'opacity 0.5s ease',
                    // Interactive only when isInteractive prop is true
                    pointerEvents: isInteractive && !isRevealed ? 'auto' : 'none',
                    // Use 'none' when JS overlay is active, otherwise crosshair fallback
                    cursor: isInteractive && !isRevealed
                        ? (showCursorOverlay ? 'none' : 'crosshair')
                        : 'default',
                    touchAction: 'none'
                }}
            />
            {/* JS-based custom cursor overlay — renders the cursor image at pointer
                position. This avoids CSS cursor:url() which silently fails for images
                larger than 128×128px or cross-origin images without CORS headers. */}
            {showCursorOverlay && cursorPos && (
                <img
                    src={cursorImageUrl}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: cursorPos.x - cursorSize / 2,
                        top: cursorPos.y - cursorSize / 2,
                        width: cursorSize,
                        height: cursorSize,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        objectFit: 'contain',
                        zIndex: 10,
                        // Subtle drop shadow for visibility on any background
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                    }}
                />
            )}
        </div>
    );
};
