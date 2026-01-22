import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layer, ModalConfig, LayerStyle } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { ContainerRenderer } from './campaign/renderers/ContainerRenderer';
import { InputRenderer } from './campaign/renderers/InputRenderer';
import { CopyButtonRenderer } from './campaign/renderers/CopyButtonRenderer';
import { Check, Circle, Move, ArrowRight, ArrowLeft, Play, Pause, Search, Home, X, Download, Upload, User, Settings, ChevronDown, Volume2, VolumeX, Maximize } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { ErrorBoundary } from './ErrorBoundary';
// ShadowDomWrapper removed as per user request
// ShadowDomWrapper removed as per user request

type ColorTheme = {
    border: {
        default: string;
    };
    primary: Record<number, string>;
    gray: Record<number, string>;
} & (
        | {
            background: {
                page: string;
                card: string;
            };
            text: {
                primary: string;
                secondary: string;
            };
        }
        | {
            bg: string;
            text: string;
        }
    );

// Helper functions for type-safe color access
const getBackgroundColor = (colors: ColorTheme): string => {
    if ('background' in colors) return colors.background.card;
    if ('bg' in colors) return colors.bg;
    return '#FFFFFF';
};

const getTextColor = (colors: ColorTheme): string => {
    if ('text' in colors) {
        if (typeof colors.text === 'string') return colors.text;
        return colors.text.primary;
    }
    return '#000000';
};

// Helper to convert transform object to string
const getTransformString = (transform?: LayerStyle['transform']) => {
    if (!transform || typeof transform !== 'object') return undefined;
    const parts = [];
    if (transform.rotate) parts.push(`rotate(${transform.rotate}deg)`);
    if (transform.scale) parts.push(`scale(${transform.scale})`);

    // Handle X Translation
    if (transform.translateX !== undefined) {
        const val = transform.translateX;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateX(${valStr})`);
    }

    // Handle Y Translation
    if (transform.translateY !== undefined) {
        const val = transform.translateY;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateY(${valStr})`);
    }

    return parts.join(' ');
};

// Helper to convert filter object to string
const getFilterString = (filter?: LayerStyle['filter']) => {
    if (!filter || typeof filter !== 'object') return undefined;
    const parts = [];
    if (filter.blur) parts.push(`blur(${filter.blur}px)`);
    if (filter.brightness) parts.push(`brightness(${filter.brightness}%)`);
    if (filter.contrast) parts.push(`contrast(${filter.contrast}%)`);
    if (filter.grayscale) parts.push(`grayscale(${filter.grayscale}%)`);
    return parts.join(' ');
};

// Helper to adjust color brightness
const adjustColorBrightness = (color: string, percent: number) => {
    if (!color) return '#000000';
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
};

// Extracted Component: Countdown Layer
const CountdownLayer: React.FC<{ layer: Layer }> = ({ layer }) => {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, totalSeconds: number }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
    const endTimeMs = useMemo(() =>
        layer.content.endTime ? new Date(layer.content.endTime).getTime() : Date.now() + 3600000,
        [layer.content.endTime]
    );

    useEffect(() => {
        let mounted = true;

        const updateTimer = () => {
            if (!mounted) return;

            const now = Date.now();
            const diff = endTimeMs - now;

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds, totalSeconds: Math.floor(diff / 1000) });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [endTimeMs]);

    const isUrgent = layer.content.urgencyThreshold && timeLeft.totalSeconds < (layer.content.urgencyThreshold || 0);
    const variant = layer.content.timerVariant || 'text';
    const textColor = isUrgent ? '#EF4444' : (layer.content.textColor || '#111827');
    const fontSize = layer.content.fontSize || 24;
    const fontWeight = layer.content.fontWeight || 'bold';
    const fontFamily = layer.style?.fontFamily || 'monospace';

    // Helper to render a single time unit block
    const renderBlock = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
                backgroundColor: variant === 'card' ? (layer.style?.backgroundColor || '#F3F4F6') : 'transparent',
                borderRadius: variant === 'card' ? '8px' : '0',
                padding: variant === 'card' ? '8px 12px' : '0',
                minWidth: variant === 'card' ? '48px' : 'auto',
                textAlign: 'center',
                border: variant === 'card' ? `1px solid ${layer.style?.borderColor || '#E5E7EB'}` : 'none',
                boxShadow: variant === 'card' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>
                <span style={{ fontSize: `${fontSize}px`, fontWeight, color: textColor, fontFamily }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            {variant !== 'text' && (
                <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 500 }}>
                    {label}
                </span>
            )}
        </div>
    );

    // Helper to render flip clock style
    const renderFlip = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
                backgroundColor: layer.style?.backgroundColor || '#1F2937',
                borderRadius: '6px',
                padding: '10px 8px',
                minWidth: '44px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden'
            }}>
                {/* Top half shine/gradient */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    borderBottom: '1px solid rgba(0,0,0,0.3)'
                }} />
                <span style={{
                    fontSize: `${fontSize}px`, fontWeight: 'bold', color: layer.content.textColor || '#FFFFFF',
                    fontFamily: 'Courier New, monospace', position: 'relative', zIndex: 1, display: 'block', lineHeight: 1
                }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                {label}
            </span>
        </div>
    );

    // Helper to render digital/LED style
    const renderDigital = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
                backgroundColor: '#000000',
                borderRadius: '4px',
                padding: '8px 10px',
                minWidth: '50px',
                textAlign: 'center',
                border: `2px solid ${layer.style?.borderColor || '#333'}`,
                boxShadow: `0 0 10px ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
            }}>
                <span style={{
                    fontSize: `${fontSize}px`, fontWeight: 'normal',
                    color: isUrgent ? '#EF4444' : '#10B981', // Red or Green LED
                    fontFamily: "'Courier New', Courier, monospace",
                    textShadow: `0 0 5px ${isUrgent ? '#EF4444' : '#10B981'}`
                }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
            </span>
        </div>
    );

    // Helper to render circular progress
    const renderCircle = (value: number, max: number, label: string) => {
        const size = 60;
        const strokeWidth = 4;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / max) * circumference;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ position: 'relative', width: size, height: size }}>
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
                        <circle
                            cx={size / 2} cy={size / 2} r={radius}
                            stroke={isUrgent ? '#EF4444' : (layer.style?.backgroundColor || '#6366F1')}
                            strokeWidth={strokeWidth} fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        fontSize: `${Math.max(14, fontSize * 0.6)}px`, fontWeight, color: textColor, fontFamily
                    }}>
                        {String(value).padStart(2, '0')}
                    </div>
                </div>
                <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 500 }}>
                    {label}
                </span>
            </div>
        );
    };

    // Helper for Bubble style
    const renderBubble = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
                backgroundColor: layer.style?.backgroundColor || '#EEF2FF',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: `2px solid ${layer.style?.borderColor || 'transparent'}`
            }}>
                <span style={{ fontSize: `${Math.max(16, fontSize * 0.8)}px`, fontWeight: 'bold', color: textColor, fontFamily }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>
                {label}
            </span>
        </div>
    );

    // Helper for Minimal style
    const renderMinimal = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: `${fontSize * 1.2}px`, fontWeight: 300, color: textColor, fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1 }}>
                {String(value).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', color: '#9CA3AF', letterSpacing: '1px', marginTop: '2px' }}>
                {label}
            </span>
        </div>
    );

    // Helper for Neon style
    const renderNeon = (value: number, label: string) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
                padding: '4px 12px',
                border: `2px solid ${isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1')}`,
                borderRadius: '8px',
                boxShadow: `0 0 8px ${isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1')}, inset 0 0 8px ${isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1')}`,
                backgroundColor: 'rgba(0,0,0,0.8)'
            }}>
                <span style={{
                    fontSize: `${fontSize}px`, fontWeight: 'bold', color: '#FFFFFF',
                    textShadow: `0 0 10px ${isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1')}`,
                    fontFamily: 'sans-serif'
                }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span style={{ fontSize: '10px', color: isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1'), fontWeight: 600, textShadow: `0 0 5px ${isUrgent ? '#EF4444' : (layer.style?.borderColor || '#6366F1')}` }}>
                {label}
            </span>
        </div>
    );

    if (variant === 'circular') {
        return (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {renderCircle(timeLeft.hours, 24, 'Hrs')}
                {renderCircle(timeLeft.minutes, 60, 'Mins')}
                {renderCircle(timeLeft.seconds, 60, 'Secs')}
            </div>
        );
    }

    if (variant === 'bubble') {
        return (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {renderBubble(timeLeft.hours, 'Hrs')}
                {renderBubble(timeLeft.minutes, 'Mins')}
                {renderBubble(timeLeft.seconds, 'Secs')}
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                {renderMinimal(timeLeft.hours, 'HOURS')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight: 300, color: '#E5E7EB', marginBottom: '12px' }}>|</span>
                {renderMinimal(timeLeft.minutes, 'MINS')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight: 300, color: '#E5E7EB', marginBottom: '12px' }}>|</span>
                {renderMinimal(timeLeft.seconds, 'SECS')}
            </div>
        );
    }

    if (variant === 'neon') {
        return (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {renderNeon(timeLeft.hours, 'HRS')}
                {renderNeon(timeLeft.minutes, 'MIN')}
                {renderNeon(timeLeft.seconds, 'SEC')}
            </div>
        );
    }

    if (variant === 'flip') {
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
                {renderFlip(timeLeft.hours, 'Hours')}
                {renderFlip(timeLeft.minutes, 'Mins')}
                {renderFlip(timeLeft.seconds, 'Secs')}
            </div>
        );
    }

    if (variant === 'digital') {
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
                {renderDigital(timeLeft.hours, 'Hours')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', color: isUrgent ? '#EF4444' : '#10B981', marginTop: '8px', textShadow: `0 0 5px ${isUrgent ? '#EF4444' : '#10B981'}` }}>:</span>
                {renderDigital(timeLeft.minutes, 'Mins')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', color: isUrgent ? '#EF4444' : '#10B981', marginTop: '8px', textShadow: `0 0 5px ${isUrgent ? '#EF4444' : '#10B981'}` }}>:</span>
                {renderDigital(timeLeft.seconds, 'Secs')}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
                {renderBlock(timeLeft.hours, 'Hours')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight, color: textColor, marginTop: '8px' }}>:</span>
                {renderBlock(timeLeft.minutes, 'Mins')}
                <span style={{ fontSize: `${fontSize}px`, fontWeight, color: textColor, marginTop: '8px' }}>:</span>
                {renderBlock(timeLeft.seconds, 'Secs')}
            </div>
        );
    }

    // Default text variant
    return (
        <div style={{
            fontSize: `${fontSize}px`,
            fontWeight,
            color: textColor,
            textAlign: 'center',
            fontFamily,
            letterSpacing: '2px'
        }}>
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
    );
};

// Extracted Component: Statistic Layer
const StatisticLayer: React.FC<{ layer: Layer }> = ({ layer }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const targetValue = layer.content.value || 0;
    const shouldAnimate = layer.content.animateOnLoad;

    useEffect(() => {
        if (!shouldAnimate) {
            setDisplayValue(targetValue);
            return;
        }

        let mounted = true;
        let start = 0;
        const duration = 1000;
        const increment = targetValue / (duration / 16);

        const timer = setInterval(() => {
            if (!mounted) return;

            start += increment;
            if (start >= targetValue) {
                setDisplayValue(targetValue);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);

        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [targetValue, shouldAnimate]);

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontSize: `${layer.content.fontSize || 36}px`,
                fontWeight: layer.content.fontWeight || 'bold',
                color: layer.content.textColor || '#111827'
            }}>
                {layer.content.prefix || ''}{displayValue}{layer.content.suffix ? ` ${layer.content.suffix}` : ''}
            </div>
        </div>
    );
};

// --- NEW COMPONENTS FOR PARITY ---

// Helper for safe scaling outside main component
const safeScaleVal = (val: any, factor: number) => {
    if (val == null) return undefined;
    const strVal = val.toString().trim();
    if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
    const num = parseFloat(strVal);
    if (isNaN(num)) return val;
    return `${num * factor}px`;
};

const CarouselLayer: React.FC<{ layer: Layer, renderChild: (l: Layer) => React.ReactNode, scale: number }> = ({ layer, renderChild, scale }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: layer.content?.loop ?? true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const slides = (layer.content?.slides || []) as Layer[];
    const height = safeScaleVal(layer.style?.height || 200, scale);
    const showIndicators = layer.content?.showIndicators !== false;
    const indicatorColor = layer.style?.indicatorColor || '#3B82F6';

    const onSelect = useCallback((api: any) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi);
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (slides.length === 0) return null;

    return (
        <div className="embla" style={{ position: 'relative', height, borderRadius: safeScaleVal(layer.style?.borderRadius, scale) }}>
            <div ref={emblaRef} style={{ overflow: 'hidden', height: '100%', borderRadius: 'inherit' }}>
                <div className="embla__container" style={{ display: 'flex', height: '100%' }}>
                    {slides.map((slide, index) => (
                        <div className="embla__slide" key={index} style={{ flex: '0 0 100%', minWidth: 0, position: 'relative' }}>
                            {renderChild({ ...slide, parent: layer.id })}
                        </div>
                    ))}
                </div>
            </div>
            {showIndicators && (
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4px',
                    zIndex: 10
                }}>
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                padding: 0,
                                backgroundColor: index === selectedIndex ? indicatorColor : `${indicatorColor}4D`,
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AccordionLayer: React.FC<{ layer: Layer, scale: number }> = ({ layer, scale }) => {
    return (
        <AccordionPrimitive.Root type="multiple" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: safeScaleVal(layer.style?.gap || 8, scale) }}>
            {(layer.content?.items || []).map((item: any, index: number) => (
                <AccordionPrimitive.Item key={index} value={`item-${index}`} style={{
                    backgroundColor: layer.style?.itemBackgroundColor || 'transparent',
                    borderRadius: safeScaleVal(layer.style?.borderRadius || 4, scale),
                    overflow: 'hidden'
                }}>
                    <AccordionPrimitive.Header style={{ margin: 0 }}>
                        <AccordionPrimitive.Trigger style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: safeScaleVal(layer.style?.titleFontSize || 16, scale),
                            color: layer.style?.titleColor || '#000000',
                            fontWeight: 'bold'
                        }}>
                            {item.title}
                            <ChevronDown size={16} color={layer.style?.iconColor || '#000000'} />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content style={{
                        padding: '0 16px 12px',
                        fontSize: safeScaleVal(layer.style?.contentFontSize || 14, scale),
                        color: layer.style?.contentColor || '#4B5563',
                        textAlign: 'left'
                    }}>
                        {item.content}
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionPrimitive.Root>
    );
};

const StepperLayer: React.FC<{ layer: Layer, scale: number }> = ({ layer, scale }) => {
    const steps = layer.content?.steps || [];
    const currentStep = layer.content?.currentStep || 0;
    const orientation = layer.style?.orientation || 'horizontal';
    const circleSize = 32 * scale;
    const fontSize = (layer.style?.fontSize || 12) * scale;
    const activeColor = '#3B82F6';
    const completedColor = '#22C55E';
    const inactiveColor = '#D1D5DB';

    if (orientation === 'vertical') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {steps.map((step: any, index: number) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={index} style={{ display: 'flex', minHeight: isLast ? 'auto' : '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '12px' }}>
                                <div style={{
                                    width: `${circleSize}px`,
                                    height: `${circleSize}px`,
                                    borderRadius: '50%',
                                    backgroundColor: isCompleted ? completedColor : (isCurrent ? activeColor : inactiveColor),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: `${fontSize}px`
                                }}>
                                    {isCompleted ? <Check size={circleSize * 0.6} /> : (layer.content?.showNumbers !== false ? index + 1 : '')}
                                </div>
                                {!isLast && (
                                    <div style={{ width: '2px', flex: 1, backgroundColor: isCompleted ? completedColor : inactiveColor, margin: '4px 0' }} />
                                )}
                            </div>
                            <div style={{ paddingBottom: '16px' }}>
                                <div style={{ fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? activeColor : '#000000', fontSize: `${fontSize + 2}px` }}>
                                    {step.label}
                                </div>
                                {step.description && (
                                    <div style={{ fontSize: `${fontSize}px`, color: '#6B7280', marginTop: '4px' }}>
                                        {step.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
            {steps.map((step: any, index: number) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Connecting Line */}
                        {index !== 0 && (
                            <div style={{
                                position: 'absolute',
                                top: `${circleSize / 2 - 1}px`,
                                left: '-50%',
                                width: '100%',
                                height: '2px',
                                backgroundColor: index <= currentStep ? (index === currentStep ? activeColor : completedColor) : inactiveColor,
                                zIndex: 0
                            }} />
                        )}

                        <div style={{
                            width: `${circleSize}px`,
                            height: `${circleSize}px`,
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? completedColor : (isCurrent ? activeColor : inactiveColor),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: `${fontSize}px`,
                            zIndex: 1,
                            marginBottom: '8px'
                        }}>
                            {isCompleted ? <Check size={circleSize * 0.6} /> : (layer.content?.showNumbers !== false ? index + 1 : '')}
                        </div>
                        <div style={{
                            textAlign: 'center',
                            fontSize: `${fontSize}px`,
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            color: isCurrent ? activeColor : '#4B5563'
                        }}>
                            {step.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const VideoLayer: React.FC<{ layer: Layer, scale: number }> = ({ layer, scale }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const autoPlay = layer.content?.autoPlay ?? false;
    const loop = layer.content?.loop ?? false;
    const showControls = layer.content?.showControls !== false;

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
            setIsPlaying(true);
        }
    }, [autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: safeScaleVal(layer.style?.borderRadius || 0, scale),
            overflow: 'hidden',
            backgroundColor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {layer.content?.thumbnail && !isPlaying && (
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${layer.content.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 10 }} />
            )}

            <video
                ref={videoRef}
                src={layer.content?.url}
                loop={loop}
                muted={isMuted} /* Always start muted for autoplay policy */
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Custom Controls Overlay */}
            {showControls && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '10px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    zIndex: 20
                }}>
                    <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                        <div style={{ width: '30%', height: '100%', background: 'red', borderRadius: '2px' }} /> {/* Mock progress */}
                    </div>
                    <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            )}

            {/* Big Play Button if paused */}
            {!isPlaying && (
                <div style={{ position: 'absolute', zIndex: 20, cursor: 'pointer' }} onClick={togglePlay}>
                    <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '16px' }}>
                        <Play fill="white" color="white" size={32} />
                    </div>
                </div>
            )}
        </div>
    );
};



interface ModalRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config?: ModalConfig;
    onConfigChange?: (config: ModalConfig) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    // Interactive Props
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (screenName: string) => void;
    onInterfaceAction?: (interfaceId: string) => void;
    scale?: number;
    scaleY?: number;
}

export const ModalRenderer: React.FC<ModalRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config,
    onConfigChange,
    onLayerUpdate,
    // Interactive Mode
    isInteractive = false,
    onDismiss,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {
    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        // FIX: Ignore viewport units (vh, vw) to prevent them being parsed as raw numbers (e.g. 85vh -> 85px)
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Guard: Track when interact mode was enabled to prevent auto-triggering
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

    console.log('[ModalRenderer] DEBUG:', {
        configWidth: (config as any)?.width,
        configHeight: (config as any)?.height,
        sizeUnit: (config as any)?.sizeUnit,
        scale,
        scaleY
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const modalLayer = layers.find(l => l.type === 'modal') || layers[0] || { id: 'fallback', type: 'modal', content: {}, style: {} } as any;
    const childLayers = layers.filter(l => l.parent === modalLayer.id);

    // UNIT FIX: Sidebar sends number (60) + unit (%), but safeScale needs string ("60%")
    const configWidth = (config as any)?.sizeUnit === '%' && typeof config?.width === 'number'
        ? `${config.width}%`
        : config?.width;

    const configHeight = (config as any)?.sizeUnit === '%' && typeof config?.height === 'number'
        ? `${config.height}%`
        : config?.height;

    // Helper to resolve dimension with priority: Config (if !auto) > Layer (if modal) > ConfigDefault > Auto
    const resolveDimension = (configVal: string | number | undefined, layerVal: string | number | undefined, defaultVal: string = 'auto') => {
        if (configVal !== undefined && configVal !== 'auto') return configVal;
        if (layerVal !== undefined && layerVal !== 'auto') return layerVal;
        return configVal || defaultVal;
    };

    // Action Handler
    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;

        console.log('Action triggered:', action);

        switch (action.type) {
            case 'close':
            case 'dismiss': // Handle both temporarily
                if (onDismiss) onDismiss();
                break;
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
                }
                break;
            case 'deeplink':
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
            case 'link':
                if (action.url) {
                    window.open(action.url, '_blank');
                }
                break;
            case 'navigate':
                if (action.screenName && onNavigate) {
                    onNavigate(action.screenName);
                } else {
                    console.log('Navigation action triggered:', action.screenName);
                }
                break;
            case 'custom':
                console.log('Custom action triggered:', action);
                break;
        }
    };

    // Button, Text, Media now use external renderers
    // Inline functions removed for cleaner architecture



    const renderProgressBar = (layer: Layer) => {
        const value = layer.content?.value || 0;
        const max = layer.content?.max || 100;
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const showPercentage = layer.content?.showPercentage !== false;
        const themeColor = layer.content?.themeColor || '#6366F1';
        const variant = layer.content?.progressBarVariant || 'simple';

        const containerStyle: React.CSSProperties = {
            width: '100%',
            height: '10px',
            backgroundColor: '#E5E7EB',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
        };

        const barStyle: React.CSSProperties = {
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: themeColor,
            transition: 'width 0.5s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };

        switch (variant) {
            case 'rounded':
                containerStyle.borderRadius = '9999px';
                barStyle.borderRadius = '9999px';
                break;
            case 'striped':
                barStyle.backgroundImage = `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`;
                barStyle.backgroundSize = '1rem 1rem';
                break;
            case 'animated':
                barStyle.backgroundImage = `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`;
                barStyle.backgroundSize = '1rem 1rem';
                // Animation would be handled via CSS class in a real app
                break;
            case 'gradient':
                barStyle.background = `linear-gradient(90deg, ${themeColor}, ${adjustColorBrightness(themeColor, 40)})`;
                break;
            case 'segmented':
                // Segmented logic would be more complex, simplified here
                containerStyle.backgroundColor = 'transparent';
                containerStyle.display = 'flex';
                containerStyle.gap = '2px';
                return (
                    <div style={containerStyle}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundColor: (i + 1) * 10 <= percentage ? themeColor : '#E5E7EB',
                                    borderRadius: '2px',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        ))}
                    </div>
                );
            case 'glow':
                barStyle.boxShadow = `0 0 10px ${themeColor}`;
                break;
        }

        return (
            <div style={containerStyle}>
                <div style={barStyle}>
                    {showPercentage && (
                        <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            </div>
        );
    };



    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';

        // STRETCH FIX: Convert pixel positions to percentages of design device dimensions
        // This ensures layers match the background's 100% 100% stretch behavior
        // Design device: 393px wide, 852px tall (iPhone 14 Pro)
        const designWidth = 393;
        const designHeight = 852;

        // Convert pixel to percentage (returns percentage string or undefined)
        const toPercentX = (val: any): string | undefined => {
            if (val == null) return undefined;
            const str = val.toString().trim();
            if (str.endsWith('%')) return str; // Already percentage
            const num = parseFloat(str);
            if (isNaN(num)) return undefined;
            return `${(num / designWidth) * 100}%`;
        };

        const toPercentY = (val: any): string | undefined => {
            if (val == null) return undefined;
            const str = val.toString().trim();
            if (str.endsWith('%')) return str; // Already percentage
            const num = parseFloat(str);
            if (isNaN(num)) return undefined;
            return `${(num / designHeight) * 100}%`;
        };

        // Apply Scaling to Style Properties (SDK Logic)
        // STRETCH FIX: Use percentages for positions, and scale for sizes
        const scaledStyle: any = {
            ...layer.style,
            // POSITIONS: Convert to percentages for stretch-matching with background
            top: toPercentY(layer.style?.top),
            bottom: toPercentY(layer.style?.bottom),
            left: toPercentX(layer.style?.left),
            right: toPercentX(layer.style?.right),
            // SIZES: Still use safeScale for width/height (they scale with container)
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
            // Handle borderRadius: if object, serialize to string, if number/string, scale
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
            // Also ensure no padding on wrapper that would constrain the input
            delete scaledStyle.paddingTop;
            delete scaledStyle.paddingBottom;
            delete scaledStyle.paddingLeft;
            delete scaledStyle.paddingRight;
            delete scaledStyle.padding;
        }

        // SDK PARITY: Margin Precedence Logic
        // 1. Explicit marginTop/Bottom > 2. Shorthand margin > 3. Default (for relative only)

        let finalMarginTop = safeScale(layer.style?.marginTop, scaleY);
        let finalMarginBottom = safeScale(layer.style?.marginBottom, scaleY);
        let finalMarginLeft = safeScale(layer.style?.marginLeft, scale);
        let finalMarginRight = safeScale(layer.style?.marginRight, scale);
        let finalMargin = undefined;

        // Handle generic margin shorthand
        if (layer.style?.margin) {
            if (typeof layer.style.margin === 'string' && layer.style.margin.includes(' ')) {
                // Complex string (e.g. "10px 20px") - pass through
                finalMargin = layer.style.margin;
            } else {
                // Simple number/string - scale it
                finalMargin = safeScale(layer.style.margin, scale);
            }
        }

        // Apply defaults if NO margin is set
        // SDK PARITY: Strip margin/padding for absolute elements
        if (isAbsolute) {
            finalMarginTop = undefined;
            finalMarginBottom = undefined;
            finalMarginLeft = undefined;
            finalMarginRight = undefined;
            finalMargin = undefined;
            // Also strip padding from scaledStyle for absolute elements
            scaledStyle.paddingTop = undefined;
            scaledStyle.paddingBottom = undefined;
            scaledStyle.paddingLeft = undefined;
            scaledStyle.paddingRight = undefined;
        } else if (layer.type !== 'custom_html') {
            // If no explicit marginBottom AND no shorthand margin, apply default
            if (finalMarginBottom === undefined && finalMargin === undefined) {
                finalMarginBottom = safeScale(10, scaleY); // FIX: Use scaleY
            }
        }

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            margin: finalMargin, // Shorthand first
            marginTop: finalMarginTop, // Specific overrides second (wins)
            marginBottom: finalMarginBottom,
            marginLeft: finalMarginLeft,
            marginRight: finalMarginRight,
            ...scaledStyle
        };

        let content = null;

        switch (layer.type) {
            case 'text':
                content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'media': // Handle 'media' alias
            case 'image':
                content = <MediaRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'handle':
                content = (
                    <div style={{
                        width: layer.size?.width || 40,
                        height: layer.size?.height || 4,
                        backgroundColor: layer.style?.backgroundColor || '#e5e7eb',
                        borderRadius: typeof layer.style?.borderRadius === 'object'
                            ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
                            : (layer.style?.borderRadius || 2),
                        margin: '0 auto'
                    }} />
                );
                break;
            case 'button':
                content = (
                    <ButtonRenderer
                        layer={layer}
                        scale={scale}
                        scaleY={scaleY}
                    // onClick handled by wrapper
                    />
                );
                break;
            case 'custom_html':
                content = (
                    <div
                        dangerouslySetInnerHTML={{ __html: layer.content?.html || '<div style="padding:10px; border:1px dashed #ccc; color:#999">Empty HTML Layer</div>' }}
                        style={{ width: '100%', height: '100%' }}
                    />
                );
                break;
                break;
            case 'input':
                content = <InputRenderer layer={layer} scale={scale} scaleY={scaleY} onInterfaceAction={handleAction} />;
                break;
            case 'copy_button':
                content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'checkbox':
                content = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                        <span style={{
                            fontSize: `${layer.content?.fontSize || 14}px`,
                            color: layer.content?.textColor || '#000000',
                        }}>
                            {layer.content?.label || 'Checkbox'}
                        </span>
                    </div>
                );
                break;
            case 'list':
                content = (
                    <ul style={{
                        listStyleType: 'disc',
                        paddingLeft: '20px',
                        color: layer.content?.textColor || '#000000',
                        fontSize: `${layer.content?.fontSize || 14}px`,
                    }}>
                        <li>Item 1</li>
                        <li>Item 2</li>
                        <li>Item 3</li>
                    </ul>
                );
                break;
            case 'rating':
                content = (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: '#FBBF24', fontSize: '20px' }}>★</span>
                        ))}
                    </div>
                );
                break;
            case 'badge':
                content = (
                    <div style={{
                        backgroundColor: layer.content?.badgeBackgroundColor || '#EF4444',
                        color: layer.content?.badgeTextColor || '#FFFFFF',
                        padding: typeof layer.content?.badgePadding === 'object'
                            ? `${layer.content.badgePadding.vertical}px ${layer.content.badgePadding.horizontal}px`
                            : `${layer.content?.badgePadding || 4}px 8px`,
                        borderRadius: `${layer.content?.badgeBorderRadius || 4}px`,
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {layer.content?.badgeText || 'Badge'}
                    </div>
                );
                break;
            case 'progress-bar':
                content = renderProgressBar(layer);
                break;
            case 'progress-circle':
                content = <div>Progress Circle Placeholder</div>;
                break;
            case 'statistic':
                content = <StatisticLayer layer={layer} />;
                break;
            case 'countdown':
                content = <CountdownLayer layer={layer} />;
                break;
            case 'carousel':
                content = (
                    <CarouselLayer
                        layer={layer}
                        renderChild={renderLayer}
                        scale={scale}
                    />
                );
                break;
            case 'accordion':
                content = <AccordionLayer layer={layer} scale={scale} />;
                break;
            case 'stepper':
                content = <StepperLayer layer={layer} scale={scale} />;
                break;
            case 'video':
                content = <VideoLayer layer={layer} scale={scale} />;
                break;
            case 'divider':
                content = (
                    <div style={{
                        width: '100%',
                        height: `${layer.style?.thickness || 1}px`,
                        backgroundColor: layer.style?.color || '#E5E7EB',
                        margin: `${safeScaleVal(layer.style?.marginVertical || 8, scale)} 0`
                    }} />
                );
                break;
            case 'spacer':
                content = <div style={{ height: safeScaleVal(layer.style?.height || 16, scale), width: '100%' }} />;
                break;
            case 'gradient-overlay':
                content = (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(${layer.content?.gradientDirection || 'to bottom'}, ${layer.content?.gradientStops?.[0]?.color || 'transparent'}, ${layer.content?.gradientStops?.[1]?.color || 'rgba(0,0,0,0.5)'})`,
                        pointerEvents: 'none'
                    }} />
                );
                break;
            case 'container':
                content = (
                    <ContainerRenderer
                        layer={layer}
                        layers={layers}
                        scale={scale}
                        scaleY={scaleY}
                        renderChild={renderLayer} // Pass the recursive render function
                    />
                );
                break;
            default:
                content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown Layer: {layer.type}</div>;
        }

        // Calculate Clip Path
        let clipPath = layer.style?.clipPath;
        const shape = layer.style?.clipPathShape;

        if (shape === 'circle') {
            clipPath = 'circle(50% at 50% 50%)';
        } else if (shape === 'pill') {
            const r = layer.style?.borderRadius || 9999;
            // Enforce pill via border radius
        }

        if (clipPath) {
            // @ts-ignore
            scaledStyle.clipPath = clipPath;
            // @ts-ignore
            scaledStyle.WebkitClipPath = clipPath;
        } else if (shape === 'pill') {
            // Enforce pill via border radius if not using clip-path
            scaledStyle.borderRadius = 9999;
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
                    outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                    boxSizing: 'border-box',
                }}
            >
                {content}
            </DraggableLayerWrapper>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: `rgba(0,0,0,${config?.overlay?.opacity ?? 0.5})`,
                    zIndex: 0,
                    pointerEvents: 'auto',
                    backdropFilter: config?.overlay?.blur ? `blur(${config.overlay.blur}px)` : 'none',
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Modal Wrapper (Positioning & Layout) */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) ${getTransformString(modalLayer.style?.transform) || ''}`,

                    // Sizing (moved from inner container)
                    width: safeScale(
                        resolveDimension(
                            configWidth, // UNIT-AWARE
                            (modalLayer.type === 'modal' ? modalLayer.style?.width : undefined),
                            (config?.mode === 'image-only' ? 'auto' : '90%')
                        ),
                        scale
                    ),
                    maxWidth: config?.mode === 'image-only' ? '100%' : safeScale('400px', scale),

                    minHeight: safeScale(
                        resolveDimension(
                            ((config as any)?.minHeight && (config as any)?.minHeight !== 'auto' ? (config as any)?.minHeight : undefined),
                            (modalLayer.type === 'modal' ? modalLayer.style?.minHeight : undefined),
                            '100px'
                        ),
                        scaleY
                    ),
                    height: safeScale(
                        resolveDimension(
                            configHeight, // UNIT-AWARE
                            (modalLayer.type === 'modal' ? (modalLayer.style?.height || modalLayer.size?.height) : undefined),
                            'auto'
                        ),
                        scaleY
                    ),
                    maxHeight: safeScale(
                        (config as any)?.maxHeight ||
                        (modalLayer.type === 'modal' ? modalLayer.style?.maxHeight : undefined) ||
                        'none',
                        scaleY
                    ),

                    zIndex: 1,
                    display: 'flex', // Ensure resizing works
                    flexDirection: 'column',
                    animation: config?.animation ? `${config.animation.type} ${config.animation.duration}ms ${config.animation.easing}` : 'modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {/* Visual Container (Background, Border, Overflow) */}
                <div
                    ref={containerRef}
                    onClick={(e) => {
                        const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                        if (isInteractive && modalLayer?.content?.action && timeSinceInteractEnabled > 200) {
                            handleAction(modalLayer.content.action);
                        } else if (!isInteractive) {
                            onLayerSelect(modalLayer.id);
                        }
                    }}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',

                        backgroundColor: config?.mode === 'image-only' ? 'transparent' : (config?.backgroundColor || modalLayer.style?.backgroundColor || '#FFFFFF'),
                        backgroundImage: (config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined) ||
                            (modalLayer.style?.backgroundImage && modalLayer.style?.backgroundImage !== 'none' ? modalLayer.style?.backgroundImage : undefined),
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'top left',
                        backgroundRepeat: 'no-repeat',
                        backgroundClip: 'padding-box', // Fix "Bleeding" Effect on Dashed Borders

                        // Parity with ScratchCardRenderer Border Logic (Fixed String vs Number Comparison)
                        borderRadius: config?.mode === 'image-only' ? '0' : safeScale(config?.borderRadius || modalLayer.style?.borderRadius || 16, scale),
                        borderWidth: safeScale(config?.borderWidth || modalLayer.style?.borderWidth || 0, scale),
                        borderColor: config?.borderColor || modalLayer.style?.borderColor || '#000000',
                        borderStyle: config?.borderStyle || (parseInt(String(safeScale(config?.borderWidth || modalLayer.style?.borderWidth || 0, scale))) > 0 ? 'solid' : 'none'),

                        opacity: modalLayer.style?.opacity ?? 1,
                        filter: getFilterString(modalLayer.style?.filter),
                        clipPath: modalLayer.style?.clipPath,
                        boxShadow: config?.mode === 'image-only' ? 'none' : (
                            config?.boxShadow?.enabled
                                ? `${safeScale(0, scale)} ${safeScale(10, scale)} ${safeScale(config.boxShadow.blur, scale)} ${safeScale(config.boxShadow.spread || 0, scale)} ${config.boxShadow.color}`
                                : (config?.elevation
                                    ? `0px ${safeScale(config.elevation * 4, scaleY)} ${safeScale(config.elevation * 8, scaleY)} rgba(0,0,0,0.15)`
                                    : (modalLayer.style?.boxShadow || '0 10px 25px rgba(0,0,0,0.2)'))
                        ),

                        overflow: modalLayer.style?.overflow || 'hidden', // Clips content but NOT the close button (since it's outside this div)
                        display: 'block',
                        padding: 0,
                    }}
                >
                    {/* Content Area - Relative/Scrollable Layers */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        width: '100%',
                        height: '100%',
                        display: modalLayer.style?.display || 'flex',
                        flexDirection: modalLayer.style?.flexDirection || 'column',
                        alignItems: modalLayer.style?.alignItems || 'stretch',
                        justifyContent: modalLayer.style?.justifyContent || 'flex-start',
                        gap: safeScale(modalLayer.style?.gap || 0, scale),

                        paddingTop: safeScale(modalLayer.style?.padding?.top || (typeof modalLayer.style?.padding === 'number' ? modalLayer.style.padding : 0), scaleY),
                        paddingBottom: safeScale(modalLayer.style?.padding?.bottom || (typeof modalLayer.style?.padding === 'number' ? modalLayer.style.padding : 0), scaleY),
                        paddingLeft: safeScale(modalLayer.style?.padding?.left || (typeof modalLayer.style?.padding === 'number' ? modalLayer.style.padding : 0), scale),
                        paddingRight: safeScale(modalLayer.style?.padding?.right || (typeof modalLayer.style?.padding === 'number' ? modalLayer.style.padding : 0), scale),
                    }}>
                        {childLayers
                            .filter(l => {
                                const isAbs = l.style?.position === 'absolute' || l.style?.position === 'fixed';
                                return !isAbs;
                            })
                            .map(renderLayer)}
                    </div>

                    {/* Overlay Area - Absolute Layers (Fixed to Modal) */}
                    {childLayers
                        .filter(l => {
                            const isAbs = l.style?.position === 'absolute' || l.style?.position === 'fixed';
                            return isAbs;
                        })
                        .map(renderLayer)}
                </div>

                {/* Close Button (Floating Outside supported) */}
                {(config?.showCloseButton || config?.closeButton?.enabled) && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDismiss) onDismiss();
                        }}
                        style={{
                            position: 'absolute',
                            zIndex: 50,
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: config?.closeButton?.backgroundColor || '#FFFFFF',
                            boxShadow: config?.closeButton?.position?.includes('outside') ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                            // Position Logic
                            ...(config?.closeButton?.position === 'top-left' ? { top: '12px', left: '12px', right: 'auto' } :
                                config?.closeButton?.position === 'outside-right' ? { top: '-40px', right: '0', left: 'auto' } :
                                    { top: '12px', right: '12px', left: 'auto' })
                        }}
                    >
                        <X size={20} color={config?.closeButton?.color || '#000000'} />
                    </div>
                )}
            </div>

            <style>{`
            @keyframes modal-pop {
              0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
              100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </>
    );
};