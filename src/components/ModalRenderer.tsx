import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layer, ModalConfig, LayerStyle } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { Check, Circle, Move, ArrowRight, ArrowLeft, Play, Search, Home, X, Download, Upload, User, Settings } from 'lucide-react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
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
    scale = 1,
    scaleY = 1
}) => {

    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal; // Ignore percentages
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };
    const containerRef = useRef<HTMLDivElement>(null);
    const modalLayer = layers.find(l => l.type === 'modal') || layers[0] || { id: 'fallback', type: 'modal', content: {}, style: {} } as any;
    const childLayers = layers.filter(l => l.parent === modalLayer.id);

    // Action Handler
    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;

        console.log('Action triggered:', action);

        switch (action.type) {
            case 'close':
            case 'dismiss': // Handle both temporarily
                if (onDismiss) onDismiss();
                break;
            case 'deeplink':
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

        // Apply Scaling to Style Properties (SDK Logic)
        const scaledStyle: any = {
            ...layer.style,
            top: safeScale(layer.style?.top, scaleY), // Fix 16: Vertical Scale
            bottom: safeScale(layer.style?.bottom, scaleY), // Fix 16: Vertical Scale
            left: safeScale(layer.style?.left, scale),
            right: safeScale(layer.style?.right, scale),
            // SDK Logic: Wrapper Width = style.width || size.width
            width: safeScale(layer.style?.width || layer.size?.width, scale),
            height: safeScale(layer.style?.height || layer.size?.height, scale), // Height follows size (width) scale? Or stretch? Usually size scale to keep aspect.
            // Wait, if we scale TOP by height, but HEIGHT by width, element moves but keeps aspect. This is desired.

            marginTop: safeScale(layer.style?.marginTop, scaleY), // Fix 16: Vertical Scale
            marginBottom: safeScale(layer.style?.marginBottom, scaleY), // Fix 16: Vertical Scale
            marginLeft: safeScale(layer.style?.marginLeft, scale),
            marginRight: safeScale(layer.style?.marginRight, scale),
            paddingTop: safeScale(layer.style?.paddingTop, scale),
            paddingBottom: safeScale(layer.style?.paddingBottom, scale),
            paddingLeft: safeScale(layer.style?.paddingLeft, scale),
            paddingRight: safeScale(layer.style?.paddingRight, scale),
            // Handle borderRadius: if object, serialize to string, if number/string, scale
            borderRadius: typeof layer.style?.borderRadius === 'object'
                ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
                : safeScale(layer.style?.borderRadius, scale),
            fontSize: safeScale(layer.style?.fontSize, scale),
        };

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
        if (!isAbsolute && layer.type !== 'custom_html') {
            // If no explicit marginBottom AND no shorthand margin, apply default
            if (finalMarginBottom === undefined && finalMargin === undefined) {
                finalMarginBottom = safeScale(10, scale);
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
                content = <TextRenderer layer={layer} scale={scale} />;
                break;
            case 'media': // Handle 'media' alias
            case 'image':
                content = <MediaRenderer layer={layer} scale={scale} />;
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
                content = <ButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'custom_html':
                content = (
                    <div
                        dangerouslySetInnerHTML={{ __html: layer.content?.html || '<div style="padding:10px; border:1px dashed #ccc; color:#999">Empty HTML Layer</div>' }}
                        style={{ width: '100%', height: '100%' }}
                    />
                );
                break;
            case 'input':
                content = (
                    <input
                        type="text"
                        placeholder={layer.content?.placeholder || 'Enter text...'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: `${layer.style?.borderRadius || 4}px`,
                            border: `1px solid ${layer.style?.borderColor || '#E5E7EB'}`,
                            fontSize: `${layer.content?.fontSize || 14}px`,
                            color: layer.content?.textColor || '#000000',
                            backgroundColor: layer.style?.backgroundColor || '#FFFFFF',
                        }}
                    />
                );
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
            <div
                key={layer.id}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isInteractive) {
                        handleAction(layer.content?.action);
                    } else {
                        onLayerSelect(layer.id);
                    }
                }}
                style={{
                    ...baseStyle,
                    outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box', // SDK Match
                    // Apply button background to wrapper to match SDK "Container" behavior
                    ...(layer.type === 'button' ? {
                        backgroundColor: layer.style?.backgroundColor || layer.content.themeColor || '#6366f1'
                    } : {})
                }}
            >
                {content}
            </div>
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

            {/* Modal Container */}
            <div
                ref={containerRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) ${getTransformString(modalLayer.style?.transform) || ''}`,
                    width: typeof modalLayer.style?.width === 'number' ? `${modalLayer.style.width}px` :
                        (modalLayer.style?.width ||
                            (typeof config?.width === 'number' ? `${config.width}px` : (config?.width || (config?.mode === 'image-only' ? 'auto' : '90%')))),
                    maxWidth: config?.mode === 'image-only' ? '100%' : '400px',
                    backgroundColor: config?.mode === 'image-only' ? 'transparent' : (modalLayer.style?.backgroundColor || config?.backgroundColor || '#FFFFFF'),
                    backgroundImage: modalLayer.style?.backgroundImage || (config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined),
                    backgroundSize: modalLayer.style?.backgroundSize || config?.backgroundSize || 'cover',
                    backgroundPosition: modalLayer.style?.backgroundPosition || 'center',
                    backgroundRepeat: modalLayer.style?.backgroundRepeat || 'no-repeat',
                    borderRadius: config?.mode === 'image-only' ? '0' : (config?.borderRadius ? `${config.borderRadius}px` : (modalLayer.style?.borderRadius ? `${modalLayer.style.borderRadius}px` : '16px')),
                    borderWidth: modalLayer.style?.borderWidth ? `${modalLayer.style.borderWidth}px` : (config?.borderWidth ? `${config.borderWidth}px` : '0px'),
                    borderColor: modalLayer.style?.borderColor || config?.borderColor || 'transparent',
                    borderStyle: modalLayer.style?.borderStyle || config?.borderStyle || 'solid',

                    // Layout & Spacing
                    display: 'block', // Outer container is pure positioning context
                    // Flex properties moved to inner wrapper
                    padding: 0, // FORCE 0 padding on container so absolute origin (0,0) is true top-left

                    // Visuals
                    opacity: modalLayer.style?.opacity ?? 1,
                    filter: getFilterString(modalLayer.style?.filter),
                    clipPath: modalLayer.style?.clipPath,
                    boxShadow: config?.mode === 'image-only' ? 'none' : (
                        config?.elevation ? `0px ${config.elevation * 4}px ${config.elevation * 8}px rgba(0,0,0,0.15)` : (modalLayer.style?.boxShadow || '0 10px 25px rgba(0,0,0,0.2)')
                    ),

                    // Dimensions
                    minHeight: modalLayer.style?.minHeight || (config as any)?.minHeight || '100px',
                    height: modalLayer.style?.height || modalLayer.size?.height || (config as any)?.height || 'auto',
                    maxHeight: modalLayer.style?.maxHeight || (config as any)?.maxHeight || '85vh',

                    overflow: modalLayer.style?.overflow || 'hidden',
                    zIndex: 1,
                    animation: config?.animation ? `${config.animation.type} ${config.animation.duration}ms ${config.animation.easing}` : 'modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {/* Content Area - Relative/Scrollable Layers */}
                {/* Content Area - Relative/Scrollable Layers */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'visible',
                    width: '100%',
                    height: '100%', // Ensure it fills the block
                    display: modalLayer.style?.display || 'flex',
                    flexDirection: modalLayer.style?.flexDirection || 'column',
                    alignItems: modalLayer.style?.alignItems || 'stretch',
                    justifyContent: modalLayer.style?.justifyContent || 'flex-start',
                    gap: typeof modalLayer.style?.gap === 'number' ? `${modalLayer.style.gap}px` : (modalLayer.style?.gap || '0'),
                    padding: typeof modalLayer.style?.padding === 'object'
                        ? `${modalLayer.style.padding.top}px ${modalLayer.style.padding.right}px ${modalLayer.style.padding.bottom}px ${modalLayer.style.padding.left}px`
                        : (modalLayer.style?.padding ? `${modalLayer.style.padding}px` : '0px')
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

                {/* Close Button (Optional, if configured) */}
                {config?.showCloseButton === true && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            cursor: 'pointer',
                            zIndex: 50,
                            padding: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} color="#6B7280" />
                    </div>
                )}
            </div >

            <style>{`
            @keyframes modal-pop {
              0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
              100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </>
    );
};