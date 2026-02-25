import React, { useState, useEffect, useCallback, isValidElement } from 'react';
import { Layer, useEditorStore } from '@/store/useEditorStore';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
// import { DraggableLayerWrapper } already wraps this component in FloaterRenderer, 
// so we don't need to wrap the internal parts again with Draggable.

interface CarouselLayerRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    isInteractive?: boolean;
    renderChild?: (layer: Layer) => React.ReactNode;
}

export const CarouselLayerRenderer: React.FC<CarouselLayerRendererProps> = ({
    layer,
    scale = 1,
    scaleY = scale,
    isInteractive = false,
    renderChild
}) => {
    // --- 1. CONFIG & STATE ---

    // We need to retrieve children from the store because props don't pass them
    const allLayers = useEditorStore((state: any) => state.currentCampaign?.layers || []);

    // Filter slides
    const rawSlides = (allLayers as Layer[]).filter(l => l.parent === layer.id);

    const config = (layer.content || {}) as any;
    const count = rawSlides.length;

    // Config
    const showArrows = config.showArrows ?? true;
    const showDots = config.showDots ?? true;
    const autoPlay = config.autoPlay ?? true;
    const pauseOnHover = config.pauseOnHover ?? true;
    const interval = config.interval || 3000;

    const loop = config.loop ?? true;
    const effect = config.effect || 'slide';
    const isSlideEffect = effect === 'slide';
    const isFade = effect === 'fade';
    const is3D = effect === 'coverflow';
    const transitionDuration = 500; // ms

    // --- SEAMLESS LOOP STATE ---
    // If Looping & Slide Effect: We add clones. Index 0 is Clone(Last), Index 1 is Real(0).
    // If Not: Standard 0..N-1.
    const isSeamless = loop && isSlideEffect && count > 1;

    // Determine initial index
    // If seamless, we start at 1. If not, 0.
    // We use a ref to track if we need to snap to avoid re-renders during the snap.
    const [currentIndex, setCurrentIndex] = useState(isSeamless ? 1 : 0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const carouselRef = React.useRef<HTMLDivElement>(null);

    // Derived Slides
    // If seamless, [Last, ...Slides, First]
    const slides = React.useMemo(() => {
        if (!isSeamless) return rawSlides;
        const first = rawSlides[0];
        const last = rawSlides[count - 1];
        // Clone with unique IDs to avoid key conflicts? 
        // We can append suffix to ID.
        const cloneFirst = { ...first, id: `clone-first-${first.id}` };
        const cloneLast = { ...last, id: `clone-last-${last.id}` };
        return [cloneLast, ...rawSlides, cloneFirst];
    }, [rawSlides, isSeamless, count]);

    // Active Index for Dots/Progress (0..N-1)
    const activeDotsIndex = isSeamless
        ? (currentIndex - 1 + count) % count
        : currentIndex;

    // --- 2. LOGIC ---

    const handleNext = useCallback(() => {
        if (!isTransitioning && isSeamless) return; // Prevent spamming during jump? Or allow?

        setCurrentIndex(prev => {
            // Seamless Logic
            if (isSeamless) {
                // If at end (Clone First), we usually shouldn't be here if we snapped, but just in case.
                return prev + 1;
            }
            // Standard Logic
            if (prev >= count - 1) return loop ? 0 : prev;
            return prev + 1;
        });
        setIsTransitioning(true);
    }, [count, loop, isSeamless]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => {
            if (isSeamless) return prev - 1;
            if (prev <= 0) return loop ? count - 1 : prev;
            return prev - 1;
        });
        setIsTransitioning(true);
    }, [count, loop, isSeamless]);

    // Snap Effect
    useEffect(() => {
        if (!isSeamless) return;

        // Visual Layout: [CloneLast, Real0, ... RealN, CloneFirst]
        // Indices:       0          1          N       N+1

        // If we moved to N+1 (CloneFirst), we need to Snap to 1 (Real0).
        if (currentIndex === count + 1) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(1);
            }, transitionDuration);
            return () => clearTimeout(timer);
        }

        // If we moved to 0 (CloneLast), we need to Snap to N (RealLast).
        if (currentIndex === 0) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(count);
            }, transitionDuration);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isSeamless, count]);


    // Smart Video Logic (Capture Phase)
    useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        const handlePlay = () => setIsVideoPlaying(true);
        const handlePause = () => setIsVideoPlaying(false);
        const handleEnded = () => {
            setIsVideoPlaying(false);
            if (config.autoPlay ?? true) handleNext();
        };

        // Use Capture to detect events from children (Video/Audio)
        container.addEventListener('play', handlePlay, true);
        container.addEventListener('pause', handlePause, true);
        container.addEventListener('ended', handleEnded, true);

        return () => {
            container.removeEventListener('play', handlePlay, true);
            container.removeEventListener('pause', handlePause, true);
            container.removeEventListener('ended', handleEnded, true);
        };
    }, [config.autoPlay, handleNext]);


    // Autoplay
    useEffect(() => {
        const autoPlay = config.autoPlay ?? true;
        const intervalTime = config.interval || 3000;

        // Parity Fix: `isInteractive` means LIVE preview. 
        // We want to Autoplay during LIVE (`isInteractive === true`).
        // We want to pause during EDITOR (`isInteractive === false`).
        if (!autoPlay || count <= 1 || !isInteractive) return;
        if ((config.pauseOnHover && isHovered) || isVideoPlaying) return;

        const timer = setInterval(() => {
            handleNext();
        }, intervalTime);

        return () => clearInterval(timer);
    }, [config.autoPlay, config.interval, config.pauseOnHover, count, isInteractive, isHovered, isVideoPlaying, handleNext]);


    // --- 3. RENDER HELPERS ---
    // ... (Keep existing safe render)
    // We will just patch the implementation block 2 and 3 above. 
    // And update the Main Render to use `slides` (which is now memoized extended array) and `currentIndex`.


    // --- 3. SAFE RENDER CHILD ---
    const renderSafe = (slide: Layer) => {
        if (!renderChild) return null;
        try {
            // FIX: Enforce 100% width/height for slides so they fit the track perfectly
            // This prevents user error (e.g. setting 126%) from breaking the layout
            const safeSlide = {
                ...slide,
                style: {
                    ...slide.style,
                    // Use user-defined dimensions if present, else default to 100%
                    width: slide.style?.width ?? '100%',
                    height: slide.style?.height ?? '100%',

                    // Pass through user positioning (e.g. relative with offsets)
                    position: slide.style?.position || 'relative',
                    left: slide.style?.left ?? '0px',
                    top: slide.style?.top ?? '0px',
                    right: slide.style?.right,
                    bottom: slide.style?.bottom,

                    // Allow margin (though usually 0 for slides)
                    margin: slide.style?.margin ?? '0px',

                    padding: '0px', // Keep padding zero as per previous strict request
                    boxSizing: 'border-box'
                }
            };
            const result = renderChild(safeSlide);

            // Critical Safety Check: Ensure we have a valid React Element
            if (result !== null && typeof result === 'object' && !isValidElement(result)) {
                console.error('[Carousel] renderChild returned invalid object (likely raw Layer):', result);
                return <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center border border-red-200 p-1">
                    <span className="text-[8px] text-red-500 font-bold">RENDER ERR</span>
                    <span className="text-[6px] text-red-400">Invalid Child</span>
                </div>;
            }
            return result;
        } catch (e) {
            console.error('[Carousel] Child render crash', e);
            return <div className="w-full h-full bg-gray-100 flex text-[10px] text-gray-400 items-center justify-center">Err: Render</div>;
        }
    };


    // --- 4. RENDER HELPERS ---

    // Icon Mapper
    const getArrowIcon = (shape: string, size: number) => {
        const icons: any = {
            chevron: isLeft => isLeft ? <ChevronLeft size={size} /> : <ChevronRight size={size} />,
            arrow: isLeft => isLeft ? <ArrowLeft size={size} /> : <ArrowRight size={size} />,
            triangle: isLeft => <div style={{
                width: 0, height: 0,
                borderTop: `${size / 2}px solid transparent`,
                borderBottom: `${size / 2}px solid transparent`,
                borderRight: isLeft ? `${size}px solid currentColor` : 'none',
                borderLeft: !isLeft ? `${size}px solid currentColor` : 'none'
            }} />
        };
        return icons[shape] || icons['chevron'];
    };

    const ArrowBtn = ({ dir, onClick }: { dir: 'left' | 'right', onClick: () => void }) => {
        const isLeft = dir === 'left';

        // Config Resolution
        const type = config.arrowType || 'icon';
        const iconShape = config.arrowIcon || 'chevron';
        const iconColor = config.arrowColor || '#FFFFFF';
        const bgColor = config.arrowBgColor === 'transparent' ? 'transparent' : (config.arrowBgColor || 'rgba(0,0,0,0.2)');
        const imageUrl = config.arrowImageUrl;

        // Positioning
        const offsetX = (config.arrowOffsetX ?? -48) * scale;
        const offsetY = (config.arrowOffsetY ?? 0) * scale;

        const rawSize = config.arrowSize || 32;
        const size = rawSize * scale;
        const iconSize = (rawSize * 0.5625) * scale;

        const style: React.CSSProperties = {
            position: 'absolute',
            top: `calc(50% + ${offsetY}px)`,
            zIndex: 20,
            cursor: 'pointer',
            [isLeft ? 'left' : 'right']: 0,
            transform: `translate(calc(${isLeft ? offsetX : -offsetX}px ${isLeft ? '- 50%' : '+ 50%'}), -50%)`,

            // Visibility Logic (Loop)
            // Use activeDotsIndex (Logical Index)
            opacity: (!loop && ((isLeft && activeDotsIndex === 0) || (!isLeft && activeDotsIndex === count - 1))) ? 0 : 1,
            pointerEvents: (!loop && ((isLeft && activeDotsIndex === 0) || (!isLeft && activeDotsIndex === count - 1))) ? 'none' : 'auto',
            transition: 'opacity 0.2s',

            // Layout
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: type === 'image' ? 'auto' : size,
            height: type === 'image' ? 'auto' : size,
            borderRadius: '50%',
            backgroundColor: type === 'icon' ? bgColor : 'transparent',
            backdropFilter: (type === 'icon' && bgColor !== 'transparent') ? `blur(${4 * scale}px)` : 'none',
            color: iconColor,
        };

        return (
            <div
                style={style}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {type === 'image' && imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={dir}
                        style={{
                            height: size,
                            width: 'auto',
                            objectFit: 'contain',
                            transform: isLeft ? 'rotate(180deg)' : 'none'
                        }}
                    />
                ) : (
                    getArrowIcon(iconShape, iconSize)(isLeft)
                )}
            </div>
        );
    };

    if (count === 0) {
        return (
            <div style={{ width: '100%', height: '100%', border: `${2 * scale}px dashed rgba(0,0,0,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 * scale }}>
                <span style={{ fontSize: 10 * scale, color: '#999' }}>Add Slide +</span>
            </div>
        );
    }

    return (
        <div
            ref={carouselRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'visible' // CRITICAL: Allows arrows/dots outside. To clip shadow, wrap content.
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Arrows */}
            {showArrows && <ArrowBtn dir="left" onClick={handlePrev} />}
            {showArrows && <ArrowBtn dir="right" onClick={handleNext} />}

            {/* Viewport (Clipped) */}
            <div style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 'inherit',
                perspective: `${1000 * scale}px` // Enable 3D space
            }}>
                {/* Track */}
                <div style={{
                    display: 'flex',
                    flexDirection: config.direction === 'vertical' ? 'column' : 'row',
                    width: '100%',
                    height: '100%',
                    // Transform Logic
                    transform: (isFade || is3D)
                        ? 'none' // Static track for effects
                        : (config.direction === 'vertical' ? `translateY(-${currentIndex * 100}%)` : `translateX(-${currentIndex * 100}%)`),
                    transition: (isFade || is3D)
                        ? 'none'
                        : (isTransitioning ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'), // Disable transition during snap
                    willChange: 'transform',
                    transformStyle: 'preserve-3d' // Essential for 3D children
                }}>
                    {slides.map((slide, idx) => {
                        let offset = idx - currentIndex;

                        // CYCLIC FIX: Wrap offsets for 3D mode logic
                        if (is3D && count > 1) {
                            if (offset > count / 2) offset -= count;
                            else if (offset < -count / 2) offset += count;
                        }

                        const absOffset = Math.abs(offset);

                        // Default Styles (Slide Mode)
                        let transform = 'translateZ(0)'; // Force GPU
                        let opacity = 1;
                        let zIndex = 1;

                        if (isFade) {
                            // Use currentIndex (which maps 1:1 in non-seamless fade)
                            opacity = currentIndex === idx ? 1 : 0;
                            zIndex = currentIndex === idx ? 10 : 0;
                        } else if (is3D) {
                            zIndex = 100 - absOffset;
                            const rotateY = offset * -35;
                            const xShift = offset * 60;
                            const zShift = -absOffset * (150 * scale);
                            transform = `translateX(${xShift}%) translateZ(${zShift}px) rotateY(${rotateY}deg)`;
                            opacity = 1 - (absOffset * 0.25);
                        }

                        const isNear = Math.abs(offset) <= 2; // Lazy Load Range

                        return (
                            <div
                                key={`${slide.id}-${idx}`} // Use index in key if IDs duplicate (clones)
                                style={{
                                    flex: '0 0 100%',
                                    width: '100%',
                                    height: '100%',
                                    // Padding: Only for standard slide mode to simulate gap
                                    padding: (isFade || is3D) ? 0 : (
                                        config.direction === 'vertical'
                                            ? `${((config.dotGap || 0) * scale) / 2}px 0`
                                            : `0 ${((config.dotGap || 6) * scale) / 2}px`
                                    ),
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',

                                    // Positioning
                                    position: (isFade || is3D) ? 'absolute' : 'relative',
                                    top: 0,
                                    left: 0,

                                    // Visuals
                                    opacity: opacity,
                                    transform: isFade ? 'none' : transform,
                                    zIndex: zIndex,
                                    pointerEvents: (isFade || is3D) && currentIndex !== idx ? 'none' : 'auto',

                                    // Transition
                                    transition: (isFade || is3D) ? 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                                    backfaceVisibility: 'hidden',
                                    willChange: 'transform, opacity'
                                }}
                            >
                                {/* Render Container (Lazy Loaded) */}
                                {isNear ? renderSafe(slide) : <div className="w-full h-full" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dots */}
            {showDots && (
                <div style={{
                    position: 'absolute',
                    bottom: (config.dotOffsetY ?? -24) * scaleY,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: (config.dotGap || 6) * scale,
                    zIndex: 20,
                    pointerEvents: 'auto'
                }}>
                    {/* Render dots based on raw count (Original Slides) */}
                    {Array.from({ length: count }).map((_, idx) => (
                        <div
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTransitioning(true);
                                setCurrentIndex(isSeamless ? idx + 1 : idx);
                            }}
                            style={{
                                width: (activeDotsIndex === idx ? (config.activeDotSize || 8) : (config.dotSize || 6)) * scale,
                                height: (activeDotsIndex === idx ? (config.activeDotSize || 8) : (config.dotSize || 6)) * scale,
                                borderRadius: (config.dotRadius ?? 999) * scale,
                                backgroundColor: activeDotsIndex === idx ? (config.activeDotColor || '#000000') : (config.dotColor || '#cccccc'),
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                    ))}
                </div>
            )}
            {/* Thumbnails */}
            {config.showThumbnails && (
                <div style={{
                    position: 'absolute',
                    bottom: (config.thumbnailOffset ?? (config.dotOffsetY ?? -24)) * scale,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: (config.thumbnailGap || 4) * scale,
                    zIndex: 25,
                    pointerEvents: 'auto',
                    padding: 4 * scale,
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: `blur(${4 * scale}px)`,
                    borderRadius: 8 * scale
                }}>
                    {Array.from({ length: count }).map((_, idx) => {
                        const slide = rawSlides[idx];
                        const bg = slide.style?.backgroundImage;
                        const src = bg ? bg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '') : null;

                        return (
                            <div
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTransitioning(true);
                                    setCurrentIndex(isSeamless ? idx + 1 : idx);
                                }}
                                style={{
                                    width: 'auto',
                                    height: (config.thumbnailHeight || 50) * scale,
                                    aspectRatio: '16/9',
                                    borderRadius: 4 * scale,
                                    border: activeDotsIndex === idx ? `${2 * scale}px solid white` : `${1 * scale}px solid rgba(255,255,255,0.3)`,
                                    backgroundImage: bg || 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: '#333',
                                    cursor: 'pointer',
                                    opacity: activeDotsIndex === idx ? 1 : 0.7,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {!src && <span style={{ fontSize: 8 * scale, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{idx + 1}</span>}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Progress Bar */}
            {config.showProgressBar && (
                <div style={{
                    position: 'absolute',
                    [config.progressPosition || 'bottom']: (config.progressOffset ?? 0) * scale,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${config.progressWidth ?? 100}%`,
                    height: (config.progressHeight || 4) * scale,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    zIndex: 30,
                    pointerEvents: 'none',
                    borderRadius: (config.progressHeight || 4) * scale
                }}>
                    <div
                        key={activeDotsIndex} // Reset animation on logical slide change
                        style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: config.progressColor || '#6366F1',
                            transformOrigin: 'left',
                            willChange: 'transform',
                            animation: `carousel-progress ${interval}ms linear forwards`,
                            // Parity Fix: pauseOnHover should work in Live Mode (`isInteractive === true`)
                            animationPlayState: (pauseOnHover && isHovered && isInteractive) ? 'paused' : 'running'
                        }}
                    />
                    <style>{`
                        @keyframes carousel-progress {
                            from { transform: scaleX(0); }
                            to { transform: scaleX(1); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};
