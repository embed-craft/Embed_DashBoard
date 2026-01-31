import React, { useRef, useEffect, useState } from 'react';
import { Layer } from '@/store/useEditorStore';

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
    const [isRevealed, setIsRevealed] = useState(false);
    const content = layer.content || {};

    // Config defaults
    const scratchSize = content.scratchSize || 40;
    const revealThreshold = content.revealThreshold || 50;
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
        };

        const draw = (e: PointerEvent) => {
            if (!isDrawing) return;
            e.preventDefault();
            e.stopPropagation();

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

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            pointerEvents: isInteractive ? 'auto' : 'none',
            touchAction: 'none',
            borderRadius: content.borderRadius ? `${content.borderRadius * scale}px` : undefined
        }}>
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
                    cursor: isInteractive && !isRevealed
                        ? (content.cursorImage ? `url(${content.cursorImage}) 16 16, auto` : 'url(/cursor-scratch.png) 10 10, crosshair')
                        : 'default',
                    touchAction: 'none'
                }}
            />
        </div>
    );
};
