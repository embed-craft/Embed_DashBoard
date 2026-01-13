import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { Layer, BannerConfig, LayerStyle } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { ContainerRenderer } from './campaign/renderers/ContainerRenderer';
import { CopyButtonRenderer } from './campaign/renderers/CopyButtonRenderer';
import { InputRenderer } from './campaign/renderers/InputRenderer';
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

// --- Swipe Logic Helper ---
const useSwipe = (onSwipe: () => void, direction: 'up' | 'down', enabled: boolean) => {
    const touchStart = useRef<number | null>(null);

    const onPointerDown = (e: React.PointerEvent) => {
        if (!enabled) return;
        touchStart.current = e.clientY;
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!enabled || touchStart.current === null) return;
        const diff = e.clientY - touchStart.current;

        // Threshold: 50px
        if (direction === 'up' && diff < -50) {
            onSwipe();
        } else if (direction === 'down' && diff > 50) {
            onSwipe();
        }

        touchStart.current = null;
    };

    return { onPointerDown, onPointerUp };
};



interface BannerRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config?: BannerConfig;
    onConfigChange?: (config: BannerConfig) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    // Interactive Props
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (screenName: string) => void;
    onInterfaceAction?: (interfaceId: string) => void;
    scale?: number;
    scaleY?: number;
}

export const BannerRenderer: React.FC<BannerRendererProps> = ({
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

    console.log('[BannerRenderer] DEBUG:', {
        configWidth: (config as any)?.width,
        configHeight: (config as any)?.height,
        position: (config as any)?.position || 'top',
        scale,
        scaleY
    });

    // Banner-specific: Position (top/bottom)
    const bannerPosition = (config as any)?.position || 'top';
    const containerRef = useRef<HTMLDivElement>(null);

    // FIX: Look for container layer with 'Banner' in name, fallback to first container
    const rootLayer = layers.find(l => l.type === 'container' && l.name?.includes('Banner'))
        || layers.find(l => l.type === 'container')
        || null;
    const bannerLayer = rootLayer || { id: 'fallback', type: 'container', content: {}, style: {} } as any;

    // FIX: Get children properly
    let childLayers = rootLayer
        ? layers.filter(l => l.parent === rootLayer.id)
        : layers.filter(l => l.parent === null || !l.parent);
    childLayers = childLayers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

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
            case 'interface':
                if (action.interfaceId && onInterfaceAction) {
                    onInterfaceAction(action.interfaceId);
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
            delete scaledStyle.paddingTop;
            delete scaledStyle.paddingBottom;
            delete scaledStyle.paddingLeft;
            delete scaledStyle.paddingRight;
            delete scaledStyle.padding;
            delete scaledStyle.margin;
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
                content = <InputRenderer layer={layer} scale={scale} scaleY={scaleY} onInterfaceAction={handleAction} />;
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
            case 'container':
                content = (
                    <ContainerRenderer
                        layer={layer}
                        layers={layers}
                        renderChild={renderLayer}
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
                    // ...(layer.type === 'button' ? {
                    //    backgroundColor: layer.style?.backgroundColor || layer.content.themeColor || '#6366f1'
                    // } : {})
                }}
            >
                {content}
            </DraggableLayerWrapper>
        );
    };

    return (
        <>
            {/* Backdrop - OPTIONAL for Banners (default: disabled) */}
            {config?.overlay?.enabled && (
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
            )}

            {/* Banner Container - Positioned at top or bottom */}
            <div
                ref={containerRef}
                onClick={(e) => {
                    // Handle container-level action in interact mode
                    // Guard: Ignore clicks within 200ms of entering interact mode to prevent auto-trigger
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (isInteractive && bannerLayer?.content?.action && timeSinceInteractEnabled > 200) {
                        handleAction(bannerLayer.content.action);
                    } else if (!isInteractive) {
                        onLayerSelect(bannerLayer.id);
                    }
                }}
                style={{
                    position: 'absolute',
                    // BANNER POSITIONING: Edge-based (top or bottom)
                    top: bannerPosition === 'top' ? safeScale((config as any)?.margin?.top || 0, scaleY) : undefined,
                    bottom: bannerPosition === 'bottom' ? safeScale((config as any)?.margin?.bottom || 0, scaleY) : undefined,
                    left: safeScale((config as any)?.margin?.left || 0, scale),
                    right: (config as any)?.margin?.right ? safeScale((config as any)?.margin?.right, scale) : undefined,
                    transform: getTransformString(bannerLayer.style?.transform) || undefined,

                    // Banner: Full width by default
                    width: safeScale(
                        resolveDimension(
                            configWidth,
                            bannerLayer.style?.width,
                            '100%' // Banner default: full width
                        ),
                        scale
                    ),
                    maxWidth: '100%',

                    backgroundColor: bannerLayer.style?.backgroundColor || config?.backgroundColor || '#FFFFFF',
                    backgroundImage: (config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined) ||
                        (bannerLayer.style?.backgroundImage && bannerLayer.style?.backgroundImage !== 'none' ? bannerLayer.style?.backgroundImage : undefined),
                    backgroundSize: (config?.backgroundSize === 'fill' ? '100% 100%' : (config?.backgroundSize || 'cover')),
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'no-repeat',

                    // Borders/Radius - 0 radius for banners by default
                    borderRadius: safeScale(config?.borderRadius || bannerLayer.style?.borderRadius || 0, scale),
                    borderWidth: safeScale(bannerLayer.style?.borderWidth || 0, scale),
                    borderColor: bannerLayer.style?.borderColor || 'transparent',
                    borderStyle: bannerLayer.style?.borderStyle || 'solid',

                    // Visuals
                    opacity: bannerLayer.style?.opacity ?? 1,
                    filter: getFilterString(bannerLayer.style?.filter),
                    clipPath: bannerLayer.style?.clipPath,
                    boxShadow: config?.shadow?.enabled
                        ? `${config.shadow.x || 0}px ${config.shadow.y || 4}px ${config.shadow.blur || 12}px ${config.shadow.spread || 0}px ${config.shadow.color || `rgba(0,0,0,${config.shadow.opacity || 0.15})`}`
                        : (config?.elevation ? `0px ${safeScale(config.elevation * 4, scaleY)} ${safeScale(config.elevation * 8, scaleY)} rgba(0,0,0,0.15)` : (bannerLayer.style?.boxShadow || '0 4px 12px rgba(0,0,0,0.1)')),

                    // Dimensions - simplified for banner
                    minHeight: safeScale((config as any)?.minHeight || '50px', scaleY),
                    height: safeScale(
                        resolveDimension(
                            configHeight,
                            bannerLayer.style?.height,
                            'auto'
                        ),
                        scaleY
                    ),
                    maxHeight: safeScale((config as any)?.maxHeight, scaleY),

                    overflow: 'hidden',
                    zIndex: 1,
                    display: 'block',
                    padding: 0,
                    // Banner-specific animation: slide from top or bottom
                    animation: (config?.animation?.enabled !== false)
                        ? `${config?.animation?.type === 'fade' ? 'banner-fade' : `banner-slide-${bannerPosition}`} ${config?.animation?.duration ? config.animation.duration / 1000 : 0.3}s ${config?.animation?.easing || 'ease-out'}`
                        : 'none',

                    // Touch Action mainly for preventing scroll if we want strict swipe, but usually auto is fine
                    touchAction: 'pan-y'
                }}
                // Apply Swipe Gestures
                onPointerDown={(e) => {
                    // Only apply swipe if dismissal is enabled
                    if (config?.overlay?.dismissOnSwipe) {
                        // Capture logic
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        const startY = e.clientY;

                        const handlePointerUp = (ev: PointerEvent) => {
                            const diff = ev.clientY - startY;
                            const threshold = 50;

                            if (bannerPosition === 'top' && diff < -threshold) {
                                onDismiss?.();
                            } else if (bannerPosition === 'bottom' && diff > threshold) {
                                onDismiss?.();
                            }

                            (e.target as HTMLElement).removeEventListener('pointerup', handlePointerUp);
                        };
                        (e.target as HTMLElement).addEventListener('pointerup', handlePointerUp, { once: true });
                    }
                }}
            >
                {/* Content Area - Relative/Scrollable Layers */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    // FIX: Changed to 'auto' to allow scrolling if content exceeds container height
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    width: '100%',
                    height: '100%',
                    display: bannerLayer.style?.display || 'flex',
                    flexDirection: bannerLayer.style?.flexDirection || 'column',
                    alignItems: bannerLayer.style?.alignItems || 'stretch',
                    justifyContent: bannerLayer.style?.justifyContent || 'flex-start',
                    gap: safeScale(bannerLayer.style?.gap || 0, scale),

                    // REMOVED: CSS transform was causing double-scaling with safeScale
                    // Instead, positions should be calculated as percentages of container

                    // SCALING FIX: Apply safeScale to Padding (Content Wrapper)
                    paddingTop: safeScale(bannerLayer.style?.padding?.top || (typeof bannerLayer.style?.padding === 'number' ? bannerLayer.style.padding : 0), scaleY),
                    paddingBottom: safeScale(bannerLayer.style?.padding?.bottom || (typeof bannerLayer.style?.padding === 'number' ? bannerLayer.style.padding : 0), scaleY),
                    paddingLeft: safeScale(bannerLayer.style?.padding?.left || (typeof bannerLayer.style?.padding === 'number' ? bannerLayer.style.padding : 0), scale),
                    paddingRight: safeScale(bannerLayer.style?.padding?.right || (typeof bannerLayer.style?.padding === 'number' ? bannerLayer.style.padding : 0), scale),
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
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDismiss) onDismiss();
                        }}
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
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                    >
                        <X size={20} color="#6B7280" />
                    </div>
                )}
            </div >

            <style>{`
            @keyframes banner-slide-top {
              0% { opacity: 0; transform: translateY(-100%); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes banner-slide-bottom {
              0% { opacity: 0; transform: translateY(100%); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes banner-fade {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}</style>
        </>
    );
};
