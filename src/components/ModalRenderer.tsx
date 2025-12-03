import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layer, ModalConfig, LayerStyle } from '@/store/useEditorStore';
import { Check, Circle, Move, ArrowRight, ArrowLeft, Play, Search, Home, X, Download, Upload, User, Settings } from 'lucide-react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { ErrorBoundary } from './ErrorBoundary';
import { toast } from 'sonner';

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

const ResizableLayerWrapper: React.FC<{
    layer: Layer;
    isSelected: boolean;
    onLayerSelect: (id: string) => void;
    onLayerUpdate?: (id: string, style: Partial<LayerStyle>) => void;
    baseStyle: React.CSSProperties;
    colors: any;
    children: React.ReactNode;
}> = ({ layer, isSelected, onLayerSelect, onLayerUpdate, baseStyle, colors, children }) => {
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    // Measure on selection or when style changes (if not numeric)
    React.useLayoutEffect(() => {
        if (isSelected && nodeRef.current) {
            const { offsetWidth, offsetHeight } = nodeRef.current;
            setDimensions({ width: offsetWidth, height: offsetHeight });
        }
    }, [isSelected, layer.style?.width, layer.style?.height]);

    const handleResizeStop = (e: any, data: ResizeCallbackData) => {
        if (onLayerUpdate) {
            onLayerUpdate(layer.id, { width: data.size.width, height: data.size.height });
            setDimensions({ width: data.size.width, height: data.size.height });
        }
    };

    const width = typeof layer.style?.width === 'number' ? layer.style.width : dimensions?.width;
    const height = typeof layer.style?.height === 'number' ? layer.style.height : dimensions?.height;

    const showResizable = isSelected && onLayerUpdate && width !== undefined && height !== undefined;

    if (showResizable) {
        return (
            <ResizableBox
                width={width!}
                height={height!}
                axis="both"
                onResizeStop={handleResizeStop}
                handle={
                    <span
                        className="react-resizable-handle react-resizable-handle-se"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '10px',
                            height: '10px',
                            cursor: 'se-resize',
                            zIndex: 100
                        }}
                    />
                }
            >
                <div
                    ref={nodeRef}
                    style={{
                        ...baseStyle,
                        width: '100%',
                        height: '100%',
                        outline: `2px solid ${colors.primary[500]}`,
                        outlineOffset: '2px',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onLayerSelect(layer.id);
                    }}
                >
                    {children}
                </div>
            </ResizableBox>
        );
    }

    return (
        <div
            ref={nodeRef}
            style={{
                ...baseStyle,
                outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                outlineOffset: '2px',
            }}
            onClick={(e) => {
                e.stopPropagation();
                onLayerSelect(layer.id);
            }}
        >
            {children}
        </div>
    );
};

interface ModalRendererProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
    colors: ColorTheme;
    config?: ModalConfig;
    onConfigChange?: (config: ModalConfig) => void;
    device?: 'mobile' | 'desktop';
    onDismiss?: () => void;
}

export const ModalRenderer: React.FC<ModalRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    config,
    onConfigChange,
    device = 'mobile',
    onDismiss
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const modalLayer = layers.find(l => l.type === 'modal') || layers[0] || {} as any;

    // ... (existing code) ...

    const handleAction = (layer: Layer) => {
        const action = layer.content?.action || 'dismiss';

        switch (action) {
            case 'dismiss':
                if (onDismiss) onDismiss();
                break;
            case 'link':
                if (layer.content?.url) {
                    window.open(layer.content.url, '_blank');
                }
                break;
            case 'navigate':
                const screenName = layer.content?.screenName || 'Unknown Screen';
                toast.success(`Navigating to screen: ${screenName}`);
                if (onDismiss) onDismiss();
                break;
            case 'submit':
                console.log('Submit action triggered');
                toast.success('Form submitted successfully!');
                if (onDismiss) onDismiss();
                break;
            case 'custom':
                console.log('Custom action triggered:', layer.content?.actionName);
                toast.info(`Custom event triggered: ${layer.content?.actionName || 'Unnamed Event'}`);
                break;
            case 'none':
            default:
                // No action
                break;
        }
    };

    // ... (existing helper functions) ...

    const renderButton = (layer: Layer) => {
        const label = layer.content?.label || 'Button';
        const variant = layer.content?.buttonVariant || 'primary';
        const themeColor = layer.content?.themeColor || '#6366F1';
        const textColor = layer.content?.textColor || '#FFFFFF';
        const fontSize = layer.content?.fontSize || 14;
        const fontWeight = layer.content?.fontWeight || 'medium';
        const borderRadius = layer.style?.borderRadius || 8;
        const iconName = layer.content?.buttonIcon;
        const iconPosition = layer.content?.buttonIconPosition || 'right';

        // Icon mapping
        const icons: Record<string, React.ReactNode> = {
            ArrowRight: <ArrowRight size={16} />,
            ArrowLeft: <ArrowLeft size={16} />,
            Play: <Play size={16} fill="currentColor" />,
            Search: <Search size={16} />,
            Home: <Home size={16} />,
            Check: <Check size={16} />,
            X: <X size={16} />,
            Download: <Download size={16} />,
            Upload: <Upload size={16} />,
            User: <User size={16} />,
            Settings: <Settings size={16} />,
        };

        const icon = iconName ? icons[iconName] : null;

        const baseStyle: React.CSSProperties = {
            padding: '10px 20px',
            borderRadius: `${borderRadius}px`,
            fontSize: `${fontSize}px`,
            fontWeight,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
            border: 'none',
            outline: 'none',
            width: '100%',
            height: '100%',
            fontFamily: layer.style?.fontFamily || 'inherit',
        };

        let variantStyle: React.CSSProperties = {};
        let content = (
            <>
                <span>{label}</span>
                {icon && <span>{icon}</span>}
            </>
        );

        switch (variant) {
            case 'primary':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    boxShadow: `0 4px 6px -1px ${themeColor}40, 0 2px 4px -1px ${themeColor}20`
                };
                break;
            case 'secondary':
                variantStyle = {
                    backgroundColor: `${themeColor}20`, // 20% opacity
                    color: themeColor,
                };
                break;
            case 'outline':
                variantStyle = {
                    backgroundColor: 'transparent',
                    border: `2px solid ${themeColor}`,
                    color: themeColor,
                };
                break;
            case 'ghost':
                variantStyle = {
                    backgroundColor: 'transparent',
                    color: themeColor,
                };
                break;
            case 'soft':
                variantStyle = {
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                };
                break;
            case 'glass':
                variantStyle = {
                    backgroundColor: `${themeColor}40`,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: textColor,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                };
                break;
            case 'gradient':
                variantStyle = {
                    background: `linear-gradient(135deg, ${themeColor}, ${adjustColorBrightness(themeColor, -20)})`,
                    color: textColor,
                    boxShadow: `0 4px 15px ${themeColor}60`,
                };
                break;
            case 'shine':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    position: 'relative',
                    overflow: 'hidden',
                };
                // Note: Shine animation would need CSS keyframes, simplified here
                break;
            case '3d':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    boxShadow: `0 5px 0 ${adjustColorBrightness(themeColor, -30)}`,
                    transform: 'translateY(-2px)',
                    marginBottom: '5px' // Compensate for shadow
                };
                break;
            case 'elevated':
                variantStyle = {
                    backgroundColor: 'white',
                    color: themeColor,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.05)',
                };
                break;
            case 'neumorphic':
                variantStyle = {
                    backgroundColor: '#EEF2FF', // Assuming light bg
                    color: themeColor,
                    boxShadow: '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
                };
                break;
            case 'pill':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    borderRadius: '9999px',
                };
                break;
            case 'underline':
                variantStyle = {
                    backgroundColor: 'transparent',
                    color: themeColor,
                    borderBottom: `2px solid ${themeColor}`,
                    borderRadius: '0',
                    padding: '4px 0',
                };
                break;
            case 'glow':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    boxShadow: `0 0 15px ${themeColor}, 0 0 30px ${themeColor}80`,
                };
                break;
            case 'cyberpunk':
                variantStyle = {
                    backgroundColor: '#F3E600', // Cyberpunk yellow default or theme
                    color: '#000000',
                    clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                };
                break;
            case 'two-tone':
                variantStyle = {
                    backgroundColor: 'white',
                    color: themeColor,
                    border: `1px solid ${themeColor}20`,
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'space-between',
                };
                content = (
                    <>
                        <span style={{ padding: '10px 20px', flex: 1, textAlign: 'center' }}>{label}</span>
                        {icon && (
                            <span style={{
                                backgroundColor: themeColor,
                                color: 'white',
                                padding: '10px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {icon}
                            </span>
                        )}
                    </>
                );
                break;
            case 'comic':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0px black',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                };
                break;
            case 'skeuomorphic':
                variantStyle = {
                    background: `linear-gradient(to bottom, ${adjustColorBrightness(themeColor, 20)}, ${themeColor})`,
                    color: textColor,
                    border: `1px solid ${adjustColorBrightness(themeColor, -20)}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.2)',
                    textShadow: '0 -1px 0 rgba(0,0,0,0.2)',
                };
                break;
            case 'liquid':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', // Organic shape
                    boxShadow: `0 10px 20px ${themeColor}60`,
                };
                break;
            case 'block':
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                };
                break;
            default:
                variantStyle = {
                    backgroundColor: themeColor,
                    color: textColor,
                };
        }

        // Merge styles: Variant styles first, then Base styles (user overrides)
        // This ensures user-defined colors, borders, etc. take precedence over variant defaults.
        const finalStyle: React.CSSProperties = {
            ...variantStyle,
            ...baseStyle,
            // Explicitly ensure font properties from content/style override variant
            fontSize: layer.style?.fontSize || `${layer.content.fontSize || 14}px`,
            fontWeight: layer.style?.fontWeight || layer.content.fontWeight || '500',
            fontFamily: layer.style?.fontFamily || 'inherit',
        };

        return (
            <button
                style={finalStyle}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent layer selection when clicking the button action
                    handleAction(layer);
                }}
            >
                {content}
            </button>
        );
    };

    const renderProgressBar = (layer: Layer) => {
        const value = layer.content.value || 0;
        const max = layer.content.max || 100;
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const variant = layer.content.progressBarVariant || 'simple';
        const themeColor = layer.content.themeColor || layer.style?.backgroundColor || '#22C55E';
        const showPercentage = layer.content.showPercentage;

        const containerStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            backgroundColor: '#E5E7EB',
            borderRadius: typeof layer.style?.borderRadius === 'number' ? layer.style.borderRadius : 8,
            overflow: 'hidden',
            position: 'relative',
        };

        let barStyle: React.CSSProperties = {
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: themeColor,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: showPercentage ? '8px' : '0',
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
        if (layer.visible === false) return null;
        const isSelected = selectedLayerId === layer.id;

        // Base style for all layers
        const baseStyle: React.CSSProperties = {
            position: 'relative',
            width: layer.style?.width || '100%',
            height: layer.style?.height || 'auto',
            marginBottom: '12px',
            ...layer.style,
        };

        let content = null;

        switch (layer.type) {
            case 'text':
                content = (
                    <div style={{
                        fontSize: layer.style?.fontSize ? (typeof layer.style.fontSize === 'number' ? `${layer.style.fontSize}px` : layer.style.fontSize) : `${layer.content.fontSize || 16}px`,
                        fontWeight: layer.style?.fontWeight || layer.content.fontWeight || 'normal',
                        color: layer.style?.color || layer.content.textColor || '#000000',
                        textAlign: (layer.style?.textAlign as any) || layer.content.textAlign || 'left',
                        fontFamily: layer.style?.fontFamily || 'inherit',
                        lineHeight: layer.style?.lineHeight || '1.5',
                        letterSpacing: layer.style?.letterSpacing || 'normal',
                        textTransform: (layer.style?.textTransform as any) || 'none',
                    }}>
                        {layer.content.text || 'Text Layer'}
                    </div>
                );
                break;
            case 'image':
                content = (
                    <img
                        src={layer.content.imageUrl || 'https://via.placeholder.com/150'}
                        alt={layer.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: (layer.style?.objectFit as any) || 'cover',
                            borderRadius: `${layer.style?.borderRadius || 0}px`,
                        }}
                    />
                );
                break;
            case 'button':
                content = renderButton(layer);
                break;
            case 'input':
                content = renderInput(layer);
                break;
            case 'checkbox':
                content = renderCheckbox(layer);
                break;
            case 'list':
                content = renderList(layer);
                break;
            case 'rating':
                content = renderRating(layer);
                break;
            case 'badge':
                content = renderBadge(layer);
                break;
            case 'progress-bar':
                content = renderProgressBar(layer);
                break;
            case 'progress-circle':
                content = renderProgressCircle(layer);
                break;
            case 'statistic':
                content = <StatisticLayer layer={layer} />;
                break;
            case 'countdown':
                content = <CountdownLayer layer={layer} />;
                break;
            case 'gradient-overlay':
                content = renderGradientOverlay(layer);
                break;
            default:
                content = null;
        }

        return (
            <ResizableLayerWrapper
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onLayerSelect={onLayerSelect}
                onLayerUpdate={onLayerUpdate}
                baseStyle={baseStyle}
                colors={colors}
            >
                {content}
            </ResizableLayerWrapper>
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
                    backgroundColor: config?.mode === 'image-only' ? 'transparent' : (modalLayer.style?.backgroundColor || '#FFFFFF'),
                    backgroundImage: modalLayer.style?.backgroundImage || (config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined),
                    backgroundSize: modalLayer.style?.backgroundSize || config?.backgroundSize || 'cover',
                    backgroundPosition: modalLayer.style?.backgroundPosition || 'center',
                    backgroundRepeat: modalLayer.style?.backgroundRepeat || 'no-repeat',
                    borderRadius: config?.mode === 'image-only' ? '0' : (modalLayer.style?.borderRadius ? `${modalLayer.style.borderRadius}px` : '16px'),

                    // Layout & Spacing
                    display: modalLayer.style?.display || 'flex',
                    flexDirection: modalLayer.style?.flexDirection || 'column',
                    alignItems: modalLayer.style?.alignItems || 'stretch',
                    justifyContent: modalLayer.style?.justifyContent || 'flex-start',
                    gap: typeof modalLayer.style?.gap === 'number' ? `${modalLayer.style.gap}px` : (modalLayer.style?.gap || '0'),
                    padding: typeof modalLayer.style?.padding === 'object'
                        ? `${modalLayer.style.padding.top}px ${modalLayer.style.padding.right}px ${modalLayer.style.padding.bottom}px ${modalLayer.style.padding.left}px`
                        : (modalLayer.style?.padding ? `${modalLayer.style.padding}px` : (config?.mode === 'image-only' ? '0' : '20px')),

                    // Visuals
                    opacity: modalLayer.style?.opacity ?? 1,
                    filter: getFilterString(modalLayer.style?.filter),
                    clipPath: modalLayer.style?.clipPath,
                    boxShadow: config?.mode === 'image-only' ? 'none' : (modalLayer.style?.boxShadow || '0 10px 25px rgba(0,0,0,0.2)'),

                    // Dimensions
                    minHeight: modalLayer.style?.minHeight || config?.minHeight || '100px',
                    height: modalLayer.style?.height || modalLayer.size?.height || config?.height || 'auto',
                    maxHeight: modalLayer.style?.maxHeight || config?.maxHeight || '85vh',

                    overflow: modalLayer.style?.overflow || 'hidden',
                    zIndex: 1,
                    animation: 'modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {/* Content Area */}
                <div style={{ flex: 1, position: 'relative', overflowY: modalLayer.style?.overflow === 'hidden' ? 'hidden' : 'auto', padding: config?.mode === 'image-only' ? '0' : '20px' }}>
                    {childLayers.map(layer => (
                        <div key={layer.id} style={{ position: layer.style?.position === 'absolute' ? 'absolute' : 'relative', zIndex: layer.zIndex }}>
                            {renderLayer(layer)}
                        </div>
                    ))}
                </div>

                {/* Close Button (Optional, if configured) */}
                {config?.showCloseButton !== false && (
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