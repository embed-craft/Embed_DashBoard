import React, { useState, useEffect, useRef, useMemo, useCallback, isValidElement } from 'react';
import { DraggableLayerWrapper } from './campaign/renderers/DraggableLayerWrapper';
import { Layer, LayerStyle } from '@/store/useEditorStore';
import { ButtonRenderer } from './campaign/renderers/ButtonRenderer';
import { TextRenderer } from './campaign/renderers/TextRenderer';
import { MediaRenderer } from './campaign/renderers/MediaRenderer';
import { ContainerRenderer } from './campaign/renderers/ContainerRenderer';
import { InputRenderer } from './campaign/renderers/InputRenderer';
import { CopyButtonRenderer } from './campaign/renderers/CopyButtonRenderer';
import { ScratchFoilLayerRenderer } from './campaign/renderers/ScratchFoilLayerRenderer';
import { CarouselLayerRenderer } from './campaign/renderers/CarouselLayerRenderer';
import { CountdownRenderer } from './campaign/renderers/CountdownRenderer';
import { Check, Circle, Move, ArrowRight, ArrowLeft, Play, Search, Home, X, Download, Upload, User, Settings, Expand, Minimize, Volume2, VolumeX } from 'lucide-react';
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



interface FloaterRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config?: any; // FloaterConfig
    onConfigChange?: (config: any) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    // Interactive Props
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (screenName: string) => void;
    onInterfaceAction?: (interfaceId: string) => void;
    scale?: number;
    scaleY?: number;
}

export const FloaterRenderer: React.FC<FloaterRendererProps> = ({
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

    console.log('[FloaterRenderer] DEBUG:', {
        configWidth: (config as any)?.width,
        configHeight: (config as any)?.height,
        position: (config as any)?.position,
        scale,
        scaleY
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Video State
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(config?.media?.muted ?? true); // Correct: Default to config.media.muted
    const [isPlaying, setIsPlaying] = useState(config?.media?.autoPlay ?? true);
    const [videoProgress, setVideoProgress] = useState(0);

    // Sync state with config changes
    useEffect(() => {
        if (config?.media?.autoPlay !== undefined) setIsPlaying(config.media.autoPlay);
        if (config?.media?.muted !== undefined) setIsMuted(config.media.muted);
    }, [config?.media]);

    // Find floater container layer (not 'modal' type, but 'container' with name 'Floater Container')
    const floaterLayer = layers.find(l => l.type === 'container' && l.name === 'Floater Container') || layers[0] || { id: 'fallback', type: 'container', content: {}, style: {} } as any;
    const childLayers = layers.filter(l => l.parent === floaterLayer.id);

    // Guard: Track when interact mode was enabled to prevent auto-triggering
    const interactModeEntryTimeRef = useRef<number>(0);
    useEffect(() => {
        if (isInteractive) {
            interactModeEntryTimeRef.current = Date.now();
        }
    }, [isInteractive]);

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

    // Auto Dismiss Logic (Timing)
    useEffect(() => {
        if (!isInteractive) return;

        // Support both nested timing object and legacy flat property
        const timing = (config as any)?.timing;
        const duration = timing?.duration ?? (config as any)?.duration; // Seconds

        if (duration && typeof duration === 'number' && duration > 0) {
            console.log(`[FloaterRenderer] Auto-dismiss timer set for ${duration}s`);
            const timer = setTimeout(() => {
                console.log('[FloaterRenderer] Auto-dismiss triggering');
                if (onDismiss) onDismiss();
            }, duration * 1000);
            return () => clearTimeout(timer);
        }
    }, [isInteractive, (config as any)?.timing?.duration, (config as any)?.duration, onDismiss]);

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

            // BACKGROUND DEFAULTS: Fix Image Initial Render
            backgroundSize: layer.style?.backgroundImage && !layer.style?.backgroundSize ? 'cover' : (layer.style?.backgroundSize),
            backgroundPosition: layer.style?.backgroundImage && !layer.style?.backgroundPosition ? 'center' : (layer.style?.backgroundPosition),

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
            // FIX: Parity with ModalRenderer - Serialize transform and filter objects
            transform: getTransformString(layer.style?.transform),
            filter: getFilterString(layer.style?.filter),
        };

        // FIX: For Input, Copy Button, Button, and Countdown layers, strip visual styles from wrapper (applied to inner element instead)
        if (layer.type === 'input' || layer.type === 'copy_button' || layer.type === 'button' || layer.type === 'text') {
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
            ...scaledStyle,
            // Glassmorphism Support (Layer-level)
            // CRITICAL FIX: Skip Floater Container layer - config.backdropFilter is source of truth
            backdropFilter: (() => {
                const isFloaterContainer = layer.type === 'container' && layer.name === 'Floater Container';
                const enabled = !isFloaterContainer && (layer.style as any)?.backdropFilter?.enabled;
                const blur = enabled ? `blur(${safeScale((layer.style as any).backdropFilter.blur || 10, scale)})` : undefined;
                if (layer.type === 'container') {
                    console.log('[FloaterRenderer] Layer backdropFilter:', {
                        name: layer.name,
                        isFloaterContainer,
                        styleEnabled: (layer.style as any)?.backdropFilter?.enabled,
                        result: blur
                    });
                }
                return blur;
            })(),
            WebkitBackdropFilter: (layer.type !== 'container' || layer.name !== 'Floater Container') && (layer.style as any)?.backdropFilter?.enabled
                ? `blur(${safeScale((layer.style as any).backdropFilter.blur || 10, scale)})`
                : undefined,
        };

        let content = null;

        switch (layer.type) {
            case 'text':
                content = <TextRenderer layer={layer} scale={scale} scaleY={scaleY} />;
                break;
            case 'copy_button':
                content = <CopyButtonRenderer layer={layer} scale={scale} scaleY={scaleY} />;
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
            case 'scratch_foil':
                content = (
                    <ScratchFoilLayerRenderer
                        layer={layer}
                        scale={scale}
                        isInteractive={isInteractive}
                    />
                );
                break;
            case 'carousel':
                content = (
                    <CarouselLayerRenderer
                        layer={layer}
                        scale={scale}
                        scaleY={scaleY}
                        isInteractive={isInteractive}
                        renderChild={(childLayer) => renderLayer(childLayer)}
                    />
                );
                break;
            case 'countdown':
                content = (
                    <CountdownRenderer
                        layer={layer}
                        scale={scale}
                    />
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
        const shape = (layer.style as any)?.clipPathShape;

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
                    outline: isSelected ? `5px solid ${colors.primary[500] || '#6366F1'}` : 'none',
                    outlineOffset: '2px',
                }}
            >
                {/* Safety Sanitize Content */}
                {isValidElement(content) || content === null ? content : (
                    <div className="bg-red-50 text-red-500 text-[10px] p-1 border border-red-200">
                        Invalid Content
                    </div>
                )}
            </DraggableLayerWrapper>
        );
    };

    // Helper to calculate base style based on position config
    const getPositionStyle = useCallback(() => {
        const style: React.CSSProperties = {
            position: 'absolute',
            zIndex: 50,
        };

        const pos = config?.position || 'bottom-right';

        // Fix: Default offset should be 0 for centered axes, 20 for edge axes
        let defaultX = 20;
        let defaultY = 20;

        if (pos === 'center' || pos === 'middle-center') {
            defaultX = 0; defaultY = 0;
        } else if (pos.includes('top-center') || pos.includes('bottom-center')) {
            defaultX = 0; defaultY = 20;
        } else if (pos.includes('center-left') || pos.includes('center-right')) {
            defaultX = 20; defaultY = 0;
        }

        const offsetX = (config?.offsetX ?? defaultX) * scale;
        const offsetY = (config?.offsetY ?? defaultY) * scaleY;

        switch (pos) {
            case 'top-left':
                style.top = offsetY;
                style.left = offsetX;
                break;
            case 'top-right':
                style.top = offsetY;
                style.right = offsetX;
                break;
            case 'bottom-left':
                style.bottom = offsetY;
                style.left = offsetX;
                break;
            case 'center-left':
                style.top = '50%';
                style.left = offsetX;
                style.transform = `translateY(calc(-50% + ${offsetY}px))`;
                break;
            case 'center-right':
                style.top = '50%';
                style.right = offsetX;
                style.transform = `translateY(calc(-50% + ${offsetY}px))`;
                break;
            case 'top-center':
                style.top = offsetY;
                style.left = '50%';
                style.transform = `translateX(calc(-50% + ${offsetX}px))`;
                break;
            case 'bottom-center':
                style.bottom = offsetY;
                style.left = '50%';
                style.transform = `translateX(calc(-50% + ${offsetX}px))`;
                break;
            case 'center':
            case 'middle-center':
                style.top = '50%';
                style.left = '50%';
                style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
                break;
            case 'bottom-right':
            default:
                style.bottom = offsetY;
                style.right = offsetX;
                break;
        }

        return style;
    }, [config?.position, config?.offsetX, config?.offsetY, scale, scaleY]);


    // Drag Implementation
    // Transform-based dragging to avoid layout jumps and coordinate issues
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ startX: number, startY: number, initialOffsetX: number, initialOffsetY: number } | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Check interactive mode AND draggable config (support root or nested)
        // Default to true if neither is explicitly false
        const rawRoot = (config as any)?.draggable;
        const rawBehavior = config?.behavior?.draggable;

        console.log('[FloaterRenderer] Drag Check:', { rawRoot, rawBehavior, isInteractive });

        // Fix: Robust boolean parsing to catch ANY falsy representation
        const parseBool = (val: any, fallback: boolean) => {
            if (val === undefined || val === null) return fallback;
            const s = String(val).toLowerCase();
            if (s === 'false' || s === '0' || s === 'off' || s === 'no' || s === '') return false;
            return true;
        };

        // Fix: Check behavior FIRST (Specific) then Root (Legacy/Default)
        // This resolves issues where root 'draggable' might be defaulted to true by the editor, hiding the user's 'behavior' choice.
        const isDraggable = rawBehavior !== undefined && rawBehavior !== null
            ? parseBool(rawBehavior, true)
            : (rawRoot !== undefined && rawRoot !== null ? parseBool(rawRoot, true) : true);

        // CASE 1: Edit Mode - We don't handle drag here, we let it bubble to the Editor Wrapper (for selection/move)
        if (!isInteractive) return;

        // CASE 2: Interact Mode (Preview) - If Drag is Disabled, we MUST Stop Propagation
        // Otherwise, background Editor wrappers might pick it up and move the floater anyway.
        if (isDraggable === false) {
            console.log('[FloaterRenderer] Drag Blocked & Propagation Stopped');
            e.stopPropagation();
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialOffsetX: dragOffset.x,
            initialOffsetY: dragOffset.y
        };
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragStartRef.current) return;
        e.preventDefault();

        const deltaX = (e.clientX - dragStartRef.current.startX) / scale;
        const deltaY = (e.clientY - dragStartRef.current.startY) / scale;

        let newX = dragStartRef.current.initialOffsetX + deltaX;
        let newY = dragStartRef.current.initialOffsetY + deltaY;

        // BOUNDS CHECKING: Prevent dragging outside container
        const floaterEl = containerRef.current;
        const parentElement = floaterEl?.parentElement;

        if (floaterEl && parentElement) {
            const containerRect = parentElement.getBoundingClientRect();
            const floaterRect = floaterEl.getBoundingClientRect();

            // Calculate max allowed offsets in both directions based on CURRENT position logic
            // NOTE: This logic assumes 'bottom-right' base positioning.
            // If base positioning differs, the signs/logic might need adjustment.
            // However, since dragOffset is RELATIVE to base position, we just need to ensuring 
            // the resulting ABSOLUTE position stays within bounds.

            // Get current visual boundaries relative to viewport
            // We want: containerRect.left <= (floaterRect.left + delta) <= containerRect.right - floaterRect.width

            // Since we are operating on `dragOffset` which translates the element,
            // we can clamp the resulting visual position.

            // Current visual Base (without drag)
            const baseLeft = floaterRect.left - (dragOffset.x * scale);
            const baseTop = floaterRect.top - (dragOffset.y * scale);

            // Allowed range for dragOffset.x:
            // Min Left: containerRect.left
            // Max Left: containerRect.right - floaterRect.width

            const minX = (containerRect.left - baseLeft) / scale;
            const maxX = (containerRect.right - floaterRect.width - baseLeft) / scale;

            const minY = (containerRect.top - baseTop) / scale;
            const maxY = (containerRect.bottom - floaterRect.height - baseTop) / scale;

            // Apply clamp
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));
        }

        setDragOffset({
            x: newX,
            y: newY
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging) {
            setIsDragging(false);
            dragStartRef.current = null;
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);

            // SNAP TO CORNER LOGIC
            // Support root or nested config
            const isSnapEnabled = config?.behavior?.snapToCorner ?? (config as any)?.snapToCorner ?? true;

            console.log('[FloaterRenderer] PointerUp - Checking Snap', {
                enabled: isSnapEnabled,
                isDragging,
                offset: dragOffset
            });

            if (isSnapEnabled) {
                console.log('[FloaterRenderer] Snap Enabled - Calculating Physics');

                // DIAGNOSTIC LOGGING
                const floaterEl = e.currentTarget as HTMLElement;
                const offsetParentEl = floaterEl.offsetParent as HTMLElement;

                const parentElement = floaterEl.parentElement as HTMLElement;

                // CRITICAL FIX: Use parentElement (Device Frame) for bounds
                // offsetParent is likely Body/Window, which causes "Behind Screen" snap
                const rect = parentElement?.getBoundingClientRect();
                const floaterRect = floaterEl.getBoundingClientRect();

                console.log('[FloaterRenderer] Physics Data:', {
                    offsetParentTag: offsetParentEl?.tagName,
                    containerRect: rect ? { w: rect.width, h: rect.height, l: rect.left, t: rect.top } : null,
                    floaterRect: { w: floaterRect.width, h: floaterRect.height, l: floaterRect.left, t: floaterRect.top },
                    scale
                });

                if (rect) {
                    const floaterRect = containerRef.current?.getBoundingClientRect();

                    if (floaterRect) {
                        // Calculate center points
                        const containerCenter = { x: rect.width / 2, y: rect.height / 2 };
                        const floaterCenter = {
                            x: (floaterRect.left - rect.left) + floaterRect.width / 2,
                            y: (floaterRect.top - rect.top) + floaterRect.height / 2
                        };

                        // Determine quadrant
                        const isLeft = floaterCenter.x < containerCenter.x;
                        const isTop = floaterCenter.y < containerCenter.y;

                        const currentLeft = floaterRect.left - rect.left;
                        const currentTop = floaterRect.top - rect.top;

                        // UNIT NORMALIZATION: Explicit Scaling (Layout * Scale)
                        // Matches 'safeScale' logic used in ModalRenderer

                        // Helper to safely parse and scale config values
                        const safeScaleNum = (val: any, factor: number) => {
                            if (val == null) return 20 * factor; // Default 20px scaled
                            const strVal = val.toString().trim();
                            const num = parseFloat(strVal);
                            return (isNaN(num) ? 20 : num) * factor;
                        };

                        const configOffsetX = safeScaleNum(config?.offsetX, scale);
                        const configOffsetY = safeScaleNum(config?.offsetY, scaleY);

                        // 1. Get Visual Padding
                        const MIN_SAFE_PADDING = 12;

                        // configOffsets are already scaled by safeScaleNum, so we just clamp them
                        const paddingX = Math.max(configOffsetX, MIN_SAFE_PADDING);
                        const paddingY = Math.max(configOffsetY, MIN_SAFE_PADDING);

                        // UNIT NORMALIZATION: Everything must be in SCALED VISUAL PIXELS
                        // 1. Get Computed Border Widths (Layout Pixels) and Scale them
                        // 2. Get Visual Container Bounds using Layout Props * Scale
                        const visualBorderL = parentElement.clientLeft || 0;
                        const visualBorderT = parentElement.clientTop || 0;
                        const visualContentW = parentElement.clientWidth;
                        const visualContentH = parentElement.clientHeight;

                        // 2. Use rect (Visual Dimensions) for container bounds
                        // Target = BorderOffset + Padding
                        const snapLeft = visualBorderL + paddingX;
                        const snapTop = visualBorderT + paddingY;

                        // Right/Bottom target: ContainerVisualWidth - VisualBorder - FloaterVisualWidth - VisualPadding
                        const snapRight = visualBorderL + visualContentW - floaterRect.width - paddingX;
                        const snapBottom = visualBorderT + visualContentH - floaterRect.height - paddingY;

                        const targetLeft = isLeft ? snapLeft : snapRight;
                        const targetTop = isTop ? snapTop : snapBottom;

                        const deltaX = targetLeft - currentLeft;
                        const deltaY = targetTop - currentTop;

                        setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
                    }
                }
            }
        }
    };

    const finalStyle = useMemo(() => {
        const baseStyle = getPositionStyle();

        if (dragOffset.x === 0 && dragOffset.y === 0) return baseStyle;

        const translateString = `translate(${dragOffset.x}px, ${dragOffset.y}px)`;
        return {
            ...baseStyle,
            // Append our drag transform to any existing transform (like centering)
            transform: baseStyle.transform ? `${baseStyle.transform} ${translateString}` : translateString,
            zIndex: isDragging ? 1000 : (baseStyle.zIndex ?? 50),
            // Smoothly animate snap-back when not dragging
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        };
    }, [dragOffset, isDragging, getPositionStyle]);

    const isVideo = useMemo(() => {
        return config?.media?.type === 'video' || config?.media?.type === 'youtube';
    }, [config?.media?.type]);

    // Helper to render scaled control buttons
    const renderControlBtn = (
        btnConfig: any,
        icon: React.ReactNode,
        onClick: (e: React.MouseEvent) => void,
        defaultSize: number = 14
    ) => {
        if (!btnConfig) return null;

        // Scale values
        const size = safeScale(btnConfig.size || defaultSize, scale);
        // Ensure offsets are strings with units
        const offsetX = safeScale(btnConfig.offsetX || 0, scale) || '0px';
        const offsetY = safeScale(btnConfig.offsetY || 0, scaleY) || '0px';
        const padding = safeScale(6, scale); // Scale padding 6px default

        return (
            <div
                onClick={(e) => { e.stopPropagation(); onClick(e); }}
                style={{
                    transform: `translate(${offsetX}, ${offsetY})`,
                    cursor: 'pointer',
                    padding: padding,
                    borderRadius: '50%',
                    backgroundColor: btnConfig.backgroundColor || 'rgba(0,0,0,0.4)',
                    color: btnConfig.color || 'white',
                    display: 'flex',
                    transition: 'background-color 0.2s',
                    backdropFilter: 'blur(4px)'
                }}
            >
                {React.cloneElement(icon as React.ReactElement, { size: size })}
            </div>
        );
    };

    return (
        <>
            {/* Overlay (Backdrop) */}
            {(config?.overlay?.enabled || config?.backdrop?.show) && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: config?.overlay?.color || config?.backdrop?.color || '#000000',
                        opacity: config?.overlay?.opacity ?? config?.backdrop?.opacity ?? 0.5,
                        zIndex: 49, // Just below floater (50)
                        pointerEvents: 'auto', // Catch clicks
                        // Support Blur if present
                        backdropFilter: (config?.overlay?.blur || config?.backdrop?.blur) ? `blur(${config?.overlay?.blur || config?.backdrop?.blur}px)` : 'none'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle dismiss if enabled
                        const dismissOnClick = config?.overlay?.dismissOnClick ?? config?.backdrop?.dismissOnTap ?? false;
                        if (dismissOnClick) {
                            if (onDismiss) onDismiss();
                        }
                    }}
                />
            )}

            {/* Floater Container */}
            {/* Floater Container (Outer Shell - Logic/Position) */}
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={(e) => {
                    // Handle container-level action in interact mode
                    const timeSinceInteractEnabled = Date.now() - interactModeEntryTimeRef.current;
                    if (isInteractive && floaterLayer?.content?.action && timeSinceInteractEnabled > 200) {
                        handleAction(floaterLayer.content.action);
                    } else if (isInteractive && (config?.behavior?.tapToDismiss ?? false)) {
                        // New: Tap to Dismiss (if no action)
                        e.stopPropagation();
                        if (onDismiss) onDismiss();
                    } else if (!isInteractive) {
                        onLayerSelect(floaterLayer.id);
                    }
                }}
                onDoubleClick={(e) => {
                    // Double-tap to dismiss feature
                    const doubleTapEnabled = config?.behavior?.doubleTapToDismiss ?? config?.doubleTapToDismiss ?? false;
                    if (isInteractive && doubleTapEnabled && onDismiss) {
                        e.stopPropagation();
                        onDismiss();
                    }
                }}
                style={{
                    ...finalStyle, // Position, Transform(Drag), ZIndex, Transition

                    display: 'flex', // Hold inner box

                    // EXPANDED MODE OVERRIDES (Layout)
                    ...(isExpanded ? {
                        position: 'absolute' as any,
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100%', height: '100%',
                        maxWidth: 'none', maxHeight: 'none',
                        transform: 'none', // Override drag transform
                        margin: 0,
                        zIndex: 100
                    } : {
                        // FLOATER DIMENSIONS: MATCH MODAL PARITY
                        width: safeScale(resolveDimension(configWidth, floaterLayer?.style?.width, '280'), scale),
                        maxWidth: '100%',
                        height: safeScale(resolveDimension(configHeight, floaterLayer?.style?.height, '180'), scaleY),
                    })
                }}
            >
                {/* Inner Box (Visuals/Animation) */}
                <div style={{
                    position: 'relative', // FIX: Ensure this acts as containing block for absolute children (Video)
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // Ensure content is clipped (User Request)

                    // Background - ✅ FIX: config?.backgroundColor takes precedence over layer style
                    backgroundColor: config?.backgroundColor === 'transparent'
                        ? 'transparent'
                        : (config?.backgroundColor || floaterLayer.style?.backgroundColor || '#000000'),

                    backgroundImage: (config?.media?.url ? `url(${config.media.url})` : undefined) ||
                        (config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined) ||
                        (floaterLayer.style?.backgroundImage && floaterLayer.style?.backgroundImage !== 'none' ? floaterLayer.style?.backgroundImage : undefined),
                    backgroundSize: isExpanded ? 'contain' : (config?.media?.fit === 'contain' ? 'contain' : (config?.media?.fit === 'cover' ? 'cover' : '100% 100%')),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',

                    // Box Model Fixes
                    boxSizing: 'border-box',
                    backgroundClip: 'padding-box', // Prevents bg from bleeding through dashed borders

                    // Borders
                    borderRadius: isExpanded ? 0 : (config?.shape === 'circle' ? '50%' : safeScale(config?.borderRadius ?? 0, scale)),
                    borderWidth: safeScale((config as any)?.borderWidth ?? floaterLayer.style?.borderWidth ?? 0, scale),
                    borderColor: (config as any)?.borderColor || floaterLayer.style?.borderColor || 'transparent',
                    borderStyle: (config as any)?.borderStyle || floaterLayer.style?.borderStyle || 'solid',

                    // Visuals
                    opacity: floaterLayer.style?.opacity ?? 1,
                    filter: getFilterString(floaterLayer.style?.filter),
                    backdropFilter: (() => {
                        const enabled = config?.backdropFilter?.enabled && !isExpanded;
                        const blur = enabled ? `blur(${safeScale(config.backdropFilter.blur || 10, scale)})` : undefined;
                        console.log('[FloaterRenderer] Config backdropFilter:', { enabled: config?.backdropFilter?.enabled, isExpanded, result: blur });
                        return blur;
                    })(),
                    WebkitBackdropFilter: (config?.backdropFilter?.enabled && !isExpanded)
                        ? `blur(${safeScale(config.backdropFilter.blur || 10, scale)})`
                        : undefined,
                    boxShadow: isExpanded ? 'none' : (
                        config?.shadow?.enabled === false
                            ? 'none'
                            : (config?.shadow?.blur !== undefined || config?.shadow?.spread !== undefined || config?.shadow?.x !== undefined || config?.shadow?.y !== undefined)
                                ? `${safeScale(config?.shadow?.x || 0, scale)} ${safeScale(config?.shadow?.y || 8, scale)} ${safeScale(config?.shadow?.blur || 24, scale)} ${safeScale(config?.shadow?.spread || 4, scale)} ${config?.shadow?.color || 'rgba(0, 0, 0, 0.25)'}`
                                : (config?.boxShadow || `0 ${safeScale(8, scale)} ${safeScale(32, scale)} rgba(0, 0, 0, 0.15)`)
                    ),

                    // Animation entrance effect (Applied to Inner Box to avoid breaking Outer Box transform)
                    animation: config?.animation?.type
                        ? `floater-${config.animation.type} ${config.animation?.duration || 300}ms ${config.animation?.easing || 'ease-out'}`
                        : 'floater-fade 300ms ease-out',
                }}>
                    {/* VIDEO PLAYER */}
                    {isVideo && config?.media?.url && (
                        (() => {
                            // Helper to detect YouTube and get Embed URL
                            const getYouTubeId = (url: string) => {
                                // Updated regex to support /shorts/
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
                                const match = url.match(regExp);
                                return (match && match[2].length === 11) ? match[2] : null;
                            };

                            // Debugging extracted ID
                            const youtubeId = getYouTubeId(config.media.url);
                            console.log('[FloaterRenderer] Parsing YouTube URL:', config.media.url, 'Extracted ID:', youtubeId);

                            if (youtubeId || config.media.type === 'youtube') {
                                // Render YouTube Iframe
                                const finalId = youtubeId || '';
                                const muteParam = isMuted ? '1' : '0';
                                const loopParam = config.media.loop ? '1' : '0';

                                // Using youtube-nocookie.com, enablejsapi, and origin to minimize blocking.
                                // Enabling controls=1 and interaction to allow manual playback if autoplay fails.
                                const embedUrl = `https://www.youtube-nocookie.com/embed/${finalId}?autoplay=${(config.media.autoPlay ?? true) ? 1 : 0}&mute=${muteParam}&controls=1&loop=${loopParam}&playlist=${finalId}&playsinline=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

                                return (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
                                        pointerEvents: 'auto',
                                        borderRadius: 'inherit', // FIX: Inherit border radius from parent
                                        overflow: 'hidden'       // FIX: Clip iframe corners
                                    }}>
                                        <iframe
                                            width="100%" height="100%" src={embedUrl} title="YouTube video player" frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {/* Blocking overlay removed to allow interaction */}
                                    </div>
                                );
                            } else {
                                // Render Direct Video File
                                return (
                                    <video
                                        ref={videoRef}
                                        src={config.media.url}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: config?.media?.fit || 'cover', zIndex: -1 }}
                                        autoPlay={config.media.autoPlay ?? true}
                                        muted={isMuted}
                                        loop={config.media.loop ?? false}
                                        playsInline
                                        onTimeUpdate={(e) => setVideoProgress((e.currentTarget.currentTime / e.currentTarget.duration) * 100)}
                                    />
                                );
                            }
                        })()
                    )}

                    {/* Content Area - Relative/Scrollable Layers */}
                    {/* PARITY FIX: Only show layers if Expanded OR if it's NOT a video (Image mode shows layers always) */}
                    {(isExpanded || !isVideo) && (
                        <>
                            <div style={{
                                flex: 1,
                                position: 'relative',
                                overflowY: config?.overflow === 'scroll' ? 'auto' : 'hidden',
                                overflowX: 'hidden',
                                width: '100%',
                                height: '100%',
                                display: floaterLayer.style?.display || 'flex',
                                flexDirection: floaterLayer.style?.flexDirection || 'column',
                                alignItems: floaterLayer.style?.alignItems || 'stretch',
                                justifyContent: floaterLayer.style?.justifyContent || 'flex-start',
                                gap: safeScale(floaterLayer.style?.gap || 0, scale),
                                paddingTop: safeScale(floaterLayer.style?.padding?.top || (typeof floaterLayer.style?.padding === 'number' ? floaterLayer.style.padding : 0), scaleY),
                                paddingBottom: safeScale(floaterLayer.style?.padding?.bottom || (typeof floaterLayer.style?.padding === 'number' ? floaterLayer.style.padding : 0), scaleY),
                                paddingLeft: safeScale(floaterLayer.style?.padding?.left || (typeof floaterLayer.style?.padding === 'number' ? floaterLayer.style.padding : 0), scale),
                                paddingRight: safeScale(floaterLayer.style?.padding?.right || (typeof floaterLayer.style?.padding === 'number' ? floaterLayer.style.padding : 0), scale),
                            }}>
                                {childLayers.filter(l => !(l.style?.position === 'absolute' || l.style?.position === 'fixed')).map(renderLayer)}
                            </div>

                            {/* Overlay Area - Absolute Layers */}
                            {childLayers.filter(l => (l.style?.position === 'absolute' || l.style?.position === 'fixed')).map(renderLayer)}
                        </>
                    )}

                    {/* === VIDEO CONTROLS OVERLAY === */}
                    {/* === VIDEO CONTROLS OVERLAY === */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 60
                    }}>
                        {/* Top Group */}
                        <div style={{
                            position: 'absolute', top: 8, left: 8, right: 8,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                        }}>
                            {/* Top Left */}
                            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
                                {config?.controls?.expandButton?.show && (config?.controls?.expandButton?.position === 'top-left' || !config?.controls?.expandButton?.position) &&
                                    renderControlBtn(
                                        config.controls.expandButton,
                                        isExpanded ? <Minimize /> : <Expand />,
                                        () => setIsExpanded(!isExpanded)
                                    )
                                }
                                {config?.controls?.muteButton?.show && isVideo && config?.controls?.muteButton?.position === 'top-left' &&
                                    renderControlBtn(
                                        config.controls.muteButton,
                                        isMuted ? <VolumeX /> : <Volume2 />,
                                        () => setIsMuted(!isMuted)
                                    )
                                }
                                {(config?.showCloseButton === true || config?.controls?.closeButton?.show === true) && config?.controls?.closeButton?.position === 'top-left' &&
                                    renderControlBtn(
                                        config.controls.closeButton || { size: 14, offsetX: 0, offsetY: 0 }, // Fallback for bare showCloseButton=true
                                        <X />,
                                        () => { if (isInteractive && onDismiss) onDismiss(); }
                                    )
                                }
                            </div>

                            {/* Top Right */}
                            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
                                {config?.controls?.expandButton?.show && config?.controls?.expandButton?.position === 'top-right' &&
                                    renderControlBtn(
                                        config.controls.expandButton,
                                        isExpanded ? <Minimize /> : <Expand />,
                                        () => setIsExpanded(!isExpanded)
                                    )
                                }
                                {config?.controls?.muteButton?.show && isVideo && (config?.controls?.muteButton?.position === 'top-right' || !config?.controls?.muteButton?.position) &&
                                    renderControlBtn(
                                        config.controls.muteButton,
                                        isMuted ? <VolumeX /> : <Volume2 />,
                                        () => setIsMuted(!isMuted)
                                    )
                                }
                                {(config?.showCloseButton === true || config?.controls?.closeButton?.show === true) && (config?.controls?.closeButton?.position === 'top-right' || !config?.controls?.closeButton?.position) &&
                                    renderControlBtn(
                                        config.controls.closeButton || { size: 14, offsetX: 0, offsetY: 0 },
                                        <X />,
                                        () => { if (isInteractive && onDismiss) onDismiss(); }
                                    )
                                }
                            </div>
                        </div>

                        {/* Bottom Group */}
                        <div style={{
                            position: 'absolute', bottom: 8, left: 8, right: 8,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                        }}>
                            {/* Bottom Left */}
                            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
                                {config?.controls?.expandButton?.show && config?.controls?.expandButton?.position === 'bottom-left' &&
                                    renderControlBtn(
                                        config.controls.expandButton,
                                        isExpanded ? <Minimize /> : <Expand />,
                                        () => setIsExpanded(!isExpanded)
                                    )
                                }
                                {config?.controls?.muteButton?.show && isVideo && config?.controls?.muteButton?.position === 'bottom-left' &&
                                    renderControlBtn(
                                        config.controls.muteButton,
                                        isMuted ? <VolumeX /> : <Volume2 />,
                                        () => setIsMuted(!isMuted)
                                    )
                                }
                                {(config?.showCloseButton === true || config?.controls?.closeButton?.show === true) && config?.controls?.closeButton?.position === 'bottom-left' &&
                                    renderControlBtn(
                                        config.controls.closeButton || { size: 14, offsetX: 0, offsetY: 0 },
                                        <X />,
                                        () => { if (isInteractive && onDismiss) onDismiss(); }
                                    )
                                }
                            </div>

                            {/* Bottom Right */}
                            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
                                {config?.controls?.expandButton?.show && config?.controls?.expandButton?.position === 'bottom-right' &&
                                    renderControlBtn(
                                        config.controls.expandButton,
                                        isExpanded ? <Minimize /> : <Expand />,
                                        () => setIsExpanded(!isExpanded)
                                    )
                                }
                                {config?.controls?.muteButton?.show && isVideo && config?.controls?.muteButton?.position === 'bottom-right' &&
                                    renderControlBtn(
                                        config.controls.muteButton,
                                        isMuted ? <VolumeX /> : <Volume2 />,
                                        () => setIsMuted(!isMuted)
                                    )
                                }
                                {(config?.showCloseButton === true || config?.controls?.closeButton?.show === true) && config?.controls?.closeButton?.position === 'bottom-right' &&
                                    renderControlBtn(
                                        config.controls.closeButton || { size: 14, offsetX: 0, offsetY: 0 },
                                        <X />,
                                        () => { if (isInteractive && onDismiss) onDismiss(); }
                                    )
                                }
                            </div>
                        </div>

                    </div>

                    {/* Progress Bar - respects position config (top or bottom) */}
                    {config?.controls?.progressBar?.show && isVideo && (
                        <div style={{
                            position: 'absolute',
                            [config?.controls?.progressBar?.position === 'top' ? 'top' : 'bottom']: 0,
                            left: 0, right: 0, height: '3px',
                            backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 60, pointerEvents: 'none'
                        }}>
                            <div style={{ width: `${videoProgress}%`, height: '100%', backgroundColor: config?.colors?.primary || '#ffffff', transition: 'width 0.1s linear', boxShadow: '0 0 4px rgba(0,0,0,0.3)' }} />
                        </div>
                    )}
                </div>
            </div >

            <style>{`
            @keyframes floater-fade {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes floater-scale {
              0% { opacity: 0; transform: scale(0.8); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes floater-slide {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes floater-bounce {
              0% { opacity: 0; transform: scale(0.6); }
              50% { transform: scale(1.1); }
              70% { transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>
    );
};