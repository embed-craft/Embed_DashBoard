import React, { useMemo, isValidElement, useState, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getYouTubeId } from '@/lib/utils';
import { ButtonRenderer } from './ButtonRenderer';
import { TextRenderer } from './TextRenderer';
import { MediaRenderer } from './MediaRenderer';
import { ContainerRenderer } from './ContainerRenderer';
import { useEffect } from 'react';
import { InputRenderer } from './InputRenderer';
import { CopyButtonRenderer } from './CopyButtonRenderer';
import { ScratchFoilLayerRenderer } from './ScratchFoilLayerRenderer';
import { CarouselLayerRenderer } from './CarouselLayerRenderer';
import { CountdownRenderer } from './CountdownRenderer';
import { DraggableLayerWrapper } from './DraggableLayerWrapper';
import { Layer, LayerStyle } from '@/store/useEditorStore';

interface SlideContainerRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    onLayerUpdate: (id: string, updates: any) => void;
    colors: any;
    scale: number;
    scaleY: number;
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (url: string) => void;
    onInterfaceAction?: (action: any) => void;
    config?: any;
}

// === Helpers Copied from FloaterRenderer for Parity ===
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

// SVG icon helpers
const IconX = ({ size, color }: { size: number; color: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IconArrowLeft = ({ size, color }: { size: number; color: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IconVolumeX = ({ size, color }: { size: number; color: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);
const IconPause = ({ size, color }: { size: number; color: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
        <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
);

const resolvePositionValue = (pos: string, offsetX: number, offsetY: number, scale: number): React.CSSProperties => {
    const off = (v: number) => `${v * scale}px`;
    switch (pos) {
        case 'top-left':    return { top: off(16 + offsetY), left: off(16 + offsetX) };
        case 'bottom-right':return { bottom: off(16 + offsetY), right: off(16 + offsetX) };
        case 'bottom-left': return { bottom: off(16 + offsetY), left: off(16 + offsetX) };
        default:            return { top: off(16 + offsetY), right: off(16 + offsetX) };
    }
};

const ControlButton: React.FC<{
    cfg: any;
    scale: number;
    scaleY: number;
    children: React.ReactNode;
}> = ({ cfg, scale, children }) => {
    if (!cfg?.show) return null;
    const size = (cfg.size || 20) * scale;
    const pad = 6 * scale;
    const bg = cfg.backgroundColor === '#00000000' ? 'transparent' : (cfg.backgroundColor || 'rgba(0,0,0,0.5)');
    const posStyle = resolvePositionValue(cfg.position || 'top-right', cfg.offsetX || 0, cfg.offsetY || 0, scale);

    return (
        <div style={{
            position: 'absolute', ...posStyle, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: size + pad * 2, height: size + pad * 2, borderRadius: '50%',
            backgroundColor: bg, cursor: 'pointer', backdropFilter: 'blur(4px)',
        }}>
            {children}
        </div>
    );
};

export const SlideContainerRenderer: React.FC<SlideContainerRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    scale,
    scaleY,
    isInteractive = false,
    onNavigate,
    onInterfaceAction,
}) => {
    const { goToNextStory, goToPrevStory, selectLayer, setActiveStory, currentCampaign } = useEditorStore();
    
    // Swipe detection state (Touch & Mouse)
    const touchStart = useRef<number | null>(null);
    const mouseStart = useRef<number | null>(null);
    const lastSwipeTime = useRef<number>(0);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStart.current === null) return;
        const distance = touchStart.current - touchEnd;
        
        if (isInteractive && Math.abs(distance) > minSwipeDistance) {
            lastSwipeTime.current = Date.now();
            if (distance > minSwipeDistance) goToNextStory();
            else goToPrevStory();
        }
        touchStart.current = null;
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (!isInteractive) return;
        mouseStart.current = e.clientX;
    };

    const onMouseUp = (e: React.MouseEvent) => {
        if (mouseStart.current === null) return;
        const distance = mouseStart.current - e.clientX;
        
        if (isInteractive && Math.abs(distance) > minSwipeDistance) {
            lastSwipeTime.current = Date.now();
            if (distance > minSwipeDistance) goToNextStory();
            else goToPrevStory();
        }
        mouseStart.current = null;
    };

    // Tap to advance logic
    const handleTap = (e: React.MouseEvent) => {
        if (Date.now() - lastSwipeTime.current < 50) return; // Ignore if just swiped
        if (!isInteractive) {
            // If in editor mode, just select the slide
            if (activeSlide) onLayerSelect(activeSlide.id);
            return;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isRightHalf = x > rect.width / 2;

        if (isRightHalf) {
            // Next Slide ONLY
            if (activeSlideIndex < slides.length - 1) {
                selectLayer(slides[activeSlideIndex + 1].id);
            }
        } else {
            // Prev Slide ONLY
            if (activeSlideIndex > 0) {
                selectLayer(slides[activeSlideIndex - 1].id);
            }
        }
    };

    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const rootContainer = layers.find(l => l.type === 'container' && !l.parent);
    const slides = useMemo(() => {
        if (!rootContainer) return [];
        return layers.filter(l => l.parent === rootContainer.id && l.type === 'container');
    }, [layers, rootContainer?.id]);

    const cfg = (rootContainer?.content || {}) as any;

    const activeSlide = useMemo(() => {
        if (!rootContainer || slides.length === 0) return null;
        const directSlide = slides.find(s => s.id === selectedLayerId);
        if (directSlide) return directSlide;
        const parentSlide = slides.find(s =>
            layers.some(l => l.id === selectedLayerId && l.parent === s.id)
        );
        if (parentSlide) return parentSlide;
        const childInSlide = layers.find(l => l.id === selectedLayerId);
        if (childInSlide) {
             let curr: any = childInSlide;
             while (curr && curr.parent) {
                 const p = layers.find(l => l.id === curr.parent);
                 if (p && p.parent === rootContainer.id) return p;
                 curr = p;
             }
        }
        return slides[0];
    }, [selectedLayerId, slides, layers, rootContainer?.id]);

    const activeSlideIndex = slides.findIndex(s => s.id === activeSlide?.id);

    const bgColor = activeSlide?.style?.backgroundColor || '#FFFFFF';
    const bgUrl = activeSlide?.content?.url || '';
    const objectFit = activeSlide?.content?.objectFit || 'cover';

    // --- AUTO ADVANCE ---
    useEffect(() => {
        if (!isInteractive || !activeSlide) return;
        
        const mode = activeSlide.content?.autoAdvanceMode || 'fixed';
        const duration = activeSlide.content?.duration || 5;

        if (mode === 'manual') return;

        // For 'fixed' mode or 'video_completion' without a direct video
        if (mode === 'fixed' || (mode === 'video_completion' && !bgUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/))) {
            const timer = setTimeout(() => {
                if (activeSlideIndex < slides.length - 1) {
                    selectLayer(slides[activeSlideIndex + 1].id);
                }
                // Story navigation is SWIPE only - no auto-advance jump to next story
            }, duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [isInteractive, activeSlide?.id, activeSlideIndex, slides.length, activeSlide?.content?.duration, activeSlide?.content?.autoAdvanceMode, bgUrl, selectLayer, goToNextStory]);

    // Handle Video Completion
    const handleVideoEnded = () => {
        const mode = activeSlide?.content?.autoAdvanceMode || 'fixed';
        if (mode !== 'video_completion') return;

        if (activeSlideIndex < slides.length - 1) {
            selectLayer(slides[activeSlideIndex + 1].id);
        }
        // Manual swipe required for story transition
    };

    const renderLayer = (layer: Layer): React.ReactNode => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';
        const designWidth = 393;
        const designHeight = 852;

        const toPercentX = (val: any) => {
            if (val == null) return undefined;
            const str = val.toString().trim();
            if (str.endsWith('%')) return str;
            const num = parseFloat(str);
            if (isNaN(num)) return undefined;
            return `${(num / designWidth) * 100}%`;
        };
        const toPercentY = (val: any) => {
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
            borderRadius: typeof layer.style?.borderRadius === 'object'
                ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
                : safeScale(layer.style?.borderRadius, scale),
            fontSize: safeScale(layer.style?.fontSize, scale),
            transform: getTransformString(layer.style?.transform),
            filter: getFilterString(layer.style?.filter),
        };

        if (['input', 'copy_button', 'button', 'text'].includes(layer.type)) {
            ['backgroundColor', 'border', 'borderWidth', 'borderColor', 'borderStyle', 'borderRadius', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'padding', 'margin'].forEach(k => delete scaledStyle[k]);
        }

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            ...scaledStyle,
            backdropFilter: (layer.style as any)?.backdropFilter?.enabled 
                ? `blur(${safeScale((layer.style as any).backdropFilter.blur || 10, scale)})` 
                : undefined,
        };

        let content = null;
        switch (layer.type) {
            case 'text': content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'copy_button': content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'media':
            case 'image': content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'button': content = <ButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />; break;
            case 'input': content = <InputRenderer layer={layer} scale={scale} scaleY={scaleY} onInterfaceAction={onInterfaceAction} />; break;
            case 'scratch_foil': content = <ScratchFoilLayerRenderer layer={layer} scale={scale} isInteractive={isInteractive} />; break;
            case 'carousel': content = <CarouselLayerRenderer layer={layer} scale={scale} scaleY={scaleY} isInteractive={isInteractive} renderChild={renderLayer} />; break;
            case 'countdown': content = <CountdownRenderer layer={layer} scale={scale} />; break;
            case 'container': content = <ContainerRenderer layer={layer} layers={layers} scale={scale} scaleY={scaleY} renderChild={renderLayer} />; break;
            default: content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown: {layer.type}</div>;
        }

        return (
            <DraggableLayerWrapper
                key={layer.id} layer={layer} isSelected={selectedLayerId === layer.id} 
                isInteractive={isInteractive} scale={scale} 
                onLayerUpdate={onLayerUpdate} onLayerSelect={onLayerSelect}
                onLayerAction={(l) => isInteractive && onInterfaceAction?.(l.content?.action)}
                style={{ ...baseStyle, outline: selectedLayerId === layer.id ? `2px solid ${colors.primary[500]}` : 'none', outlineOffset: '2px' }}
            >
                {isValidElement(content) ? content : null}
            </DraggableLayerWrapper>
        );
    };

    if (!rootContainer || slides.length === 0) {
        return <div style={{ width: 393 * scale, height: 852 * scaleY, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#f3f4f6' }}>No slides yet</div>;
    }

    const controls = cfg.controls || {};
    const progressBar = controls.progressBar || { show: true, height: 3, gap: 3, activeColor: 'rgba(255,255,255,0.95)', inactiveColor: 'rgba(255,255,255,0.35)', topOffset: 8 };
    const closeBtn = controls.closeButton || { show: true, position: 'top-right', size: 20 };
    const backBtn = controls.backButton || { show: false, position: 'top-left', size: 20 };
    const muteBtn = controls.muteButton || { show: true, position: 'top-right', size: 18 };
    const pauseBtn = controls.pauseButton || { show: false, position: 'top-right', size: 18 };


    const transitionEffect = cfg.transition || 'slide';

    return (
        <div 
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: 393 * scale, 
                height: 852 * scaleY, 
                backgroundColor: '#000', // Base for transitions
                overflow: 'hidden',
                perspective: '1200px', 
            }} 
            onClick={handleTap}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            <style>
                {`
                    :root {
                        --slide-width: ${393 * scale}px;
                        --slide-half-width: ${(393 * scale) / 2}px;
                    }

                    .slide-wrapper {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                        backface-visibility: hidden;
                        transform-style: preserve-3d;
                        will-change: transform, opacity;
                    }

                    /* --- SLIDE EFFECT --- */
                    .transition-slide .slide-wrapper {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    .transition-slide .slide-wrapper.active {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    .transition-slide .slide-wrapper.past {
                        opacity: 1;
                        transform: translateX(-100%);
                    }

                    /* --- FADE EFFECT --- */
                    .transition-fade .slide-wrapper {
                        opacity: 0;
                    }
                    .transition-fade .slide-wrapper.active {
                        opacity: 1;
                    }

                    /* --- CUBE EFFECT --- */
                    .transition-cube .slide-wrapper {
                        opacity: 0;
                        transform: rotateY(90deg) translateZ(var(--slide-half-width)) translateX(var(--slide-half-width));
                        transform-origin: center right;
                    }
                    .transition-cube .slide-wrapper.active {
                        opacity: 1;
                        transform: rotateY(0deg) translateZ(0px);
                        transform-origin: center center;
                    }
                    .transition-cube .slide-wrapper.past {
                        opacity: 0;
                        transform: rotateY(-90deg) translateZ(var(--slide-half-width)) translateX(calc(-1 * var(--slide-half-width)));
                        transform-origin: center left;
                    }

                    /* Progress Bar Animation */
                    @keyframes fillProgressBar {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                `}
            </style>
            
            <div className={`transition-${transitionEffect}`} style={{ width: '100%', height: '100%', position: 'relative' }}>
                {slides.map((slide, index) => {
                    const isActive = index === activeSlideIndex;
                    const isPast = index < activeSlideIndex;
                    const slideBgUrl = slide.content?.url || '';
                    const slideBgColor = slide.style?.backgroundColor || '#FFFFFF';
                    const slideObjectFit = slide.content?.objectFit || 'cover';
                    const ytid = getYouTubeId(slideBgUrl);
                    const isDirectVideo = slideBgUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/);

                    return (
                        <div 
                            key={slide.id}
                            className={`slide-wrapper ${isActive ? 'active' : isPast ? 'past' : 'future'}`}
                            style={{ 
                                backgroundColor: slideBgColor,
                                zIndex: isActive ? 2 : 1,
                                visibility: (isActive || (transitionEffect === 'cube' && (index === activeSlideIndex - 1 || index === activeSlideIndex + 1))) ? 'visible' : 'hidden'
                            }}
                        >
                            {/* Background */}
                            {slideBgUrl && (() => {
                                if (ytid) {
                                    return (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${ytid}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${ytid}&controls=0&modestbranding=1&rel=0`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                style={{ width: '100%', height: '100%', objectFit: slideObjectFit as any }}
                                            />
                                        </div>
                                    );
                                }
                                if (isDirectVideo) {
                                    return (
                                        <video
                                            key={slideBgUrl}
                                            src={slideBgUrl}
                                            autoPlay={isActive}
                                            muted
                                            loop={slide.content?.autoAdvanceMode !== 'video_completion'}
                                            playsInline
                                            onEnded={handleVideoEnded}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: slideObjectFit as any, pointerEvents: 'none', zIndex: 0 }}
                                        />
                                    );
                                }
                                return (
                                    <img 
                                        src={slideBgUrl} 
                                        alt="" 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: slideObjectFit as any, pointerEvents: 'none', zIndex: 0 }} 
                                    />
                                );
                            })()}

                            {/* Content */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                                {layers.filter(l => l.parent === slide.id).map(l => (
                                    <div key={l.id} style={{ pointerEvents: 'auto' }}>{renderLayer(l)}</div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {progressBar.show && (
                <div style={{ position: 'absolute', top: (progressBar.topOffset ?? 8) * scaleY, left: 8 * scale, right: 8 * scale, display: 'flex', gap: (progressBar.gap || 3) * scale, zIndex: 998 }}>
                    {slides.map((s, i) => {
                        const isPast = i < activeSlideIndex;
                        const isActive = i === activeSlideIndex;
                        const duration = activeSlide?.content?.duration || 5;

                        return (
                            <div 
                                key={s.id} 
                                style={{ 
                                    flex: 1, 
                                    height: (progressBar.height || 3) * scaleY, 
                                    borderRadius: ((progressBar.height || 3) / 2) * scale, 
                                    backgroundColor: progressBar.inactiveColor || 'rgba(255,255,255,0.3)', 
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }} 
                                onClick={(e) => { e.stopPropagation(); onLayerSelect(s.id); }}
                            >
                                <div 
                                    key={isActive ? `active-${activeSlideIndex}` : 'inactive'}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        backgroundColor: progressBar.activeColor || '#fff',
                                        width: isPast ? '100%' : isActive ? '0%' : '0%',
                                        animation: (isActive && isInteractive && duration > 0) 
                                            ? `fillProgressBar ${duration}s linear forwards` 
                                            : 'none',
                                        willChange: 'width',
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <ControlButton cfg={backBtn} scale={scale} scaleY={scaleY}><IconArrowLeft size={(backBtn.size || 20) * scale} color={backBtn.color || '#fff'} /></ControlButton>
            <ControlButton cfg={muteBtn} scale={scale} scaleY={scaleY}><IconVolumeX size={(muteBtn.size || 18) * scale} color={muteBtn.color || '#fff'} /></ControlButton>
            <ControlButton cfg={closeBtn} scale={scale} scaleY={scaleY}><IconX size={(closeBtn.size || 20) * scale} color={closeBtn.color || '#fff'} /></ControlButton>
            <ControlButton cfg={pauseBtn} scale={scale} scaleY={scaleY}><IconPause size={(pauseBtn.size || 18) * scale} color={'#fff'} /></ControlButton>

        </div>
    );
};

export default SlideContainerRenderer;
