import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { X, Maximize2, Minimize2, Volume2, VolumeX, ExternalLink } from 'lucide-react';

interface PipRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    isInteractive?: boolean;
    onDismiss?: () => void;
    onNavigate?: (screenName: string) => void;
    onInterfaceAction?: (interfaceId: string) => void;
    scale?: number;
    scaleY?: number;
}

export const PipRenderer: React.FC<PipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange,
    onLayerUpdate,
    isInteractive = false,
    onDismiss,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {
    // Action Handler
    const handleAction = (action: any) => {
        if (!isInteractive || !action) return;

        console.log('Action triggered:', action);

        switch (action.type) {
            case 'close':
            case 'dismiss':
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
    // State
    const [isMaximized, setIsMaximized] = useState(false);
    const nodeRef = useRef(null);
    const [isMuted, setIsMuted] = useState(config.defaultMuted ?? true);

    // Sync state with config changes
    useEffect(() => {
        if (config.defaultMuted !== undefined) {
            setIsMuted(config.defaultMuted);
        }
    }, [config.defaultMuted]);

    // Find the root container layer for the PIP (Robust check)
    const pipContainerLayer = layers.find(l => l.type === 'container' && (l.name === 'PIP Container' || l.name?.toLowerCase().includes('container'))) || layers.find(l => l.type === 'container');
    const videoLayer = layers.find(l => l.type === 'video');

    const containerStyle = pipContainerLayer?.style || {};

    // Config defaults
    const position = config.position || 'bottom-right';
    const width = config.width || 160;
    const height = config.height || 220;
    const backgroundColor = config.backgroundColor || 'black';
    const showCloseButton = config.showCloseButton !== false;
    const cornerRadius = config.cornerRadius || 12;

    // Helper to get embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const cleanUrl = url.trim();

        // Handle YouTube
        // Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/v/ID, youtube.com/shorts/ID
        // Also captures if there are other query params
        const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^#&?]+)/);

        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}`;
        }

        // Fallback for direct video files or already embedded URLs?
        // If it's just a raw ID (11 chars), assume YouTube?
        if (cleanUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
            return `https://www.youtube.com/embed/${cleanUrl}?autoplay=1&controls=0&modestbranding=1&rel=0&mute=${isMuted ? 1 : 0}&loop=1&playlist=${cleanUrl}`;
        }

        return cleanUrl;
    };

    // Helper for safe scaling
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        // Ignore viewport units
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return val;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return num * factor; // Return number for calculations
    };

    // Calculate position styles
    const getPositionStyles = () => {
        if (isMaximized) {
            return {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                borderRadius: 0,
                zIndex: 100
            };
        }

        const margin = config.margin !== undefined ? config.margin : 16; // Fallback

        // Use offsets if available, otherwise fallback to margin
        const offX = config.offsetX !== undefined ? config.offsetX : margin;
        const offY = config.offsetY !== undefined ? config.offsetY : margin;

        const scaledOffX = safeScale(offX, scale);
        const scaledOffY = safeScale(offY, scale);

        // Custom Positioning
        if (position === 'custom') {
            const x = config.x || 0;
            const y = config.y || 0;
            return {
                left: safeScale(x, scale),
                top: safeScale(y, scale),
                right: 'auto',
                bottom: 'auto'
            };
        }

        switch (position) {
            case 'top-left': return { top: scaledOffY, left: scaledOffX };
            case 'top-center': return { top: scaledOffY, left: '50%', transform: 'translateX(-50%)' };
            case 'top-right': return { top: scaledOffY, right: scaledOffX };

            case 'center-left': return { top: '50%', left: scaledOffX, transform: 'translateY(-50%)' };
            case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            case 'center-right': return { top: '50%', right: scaledOffX, transform: 'translateY(-50%)' };

            case 'bottom-left': return { bottom: scaledOffY, left: scaledOffX };
            case 'bottom-center': return { bottom: scaledOffY, left: '50%', transform: 'translateX(-50%)' };
            case 'bottom-right': return { bottom: scaledOffY, right: scaledOffX };

            default: return { bottom: scaledOffY, right: scaledOffX };
        }
    };

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

        // Handle transform object -> string conversion
        let transformString = style.transform;
        if (typeof style.transform === 'object' && style.transform !== null) {
            transformString = Object.entries(style.transform)
                .map(([key, value]) => `${key}(${value})`)
                .join(' ');
        }

        const finalStyle = {
            ...style,
            transform: transformString
        };

        // Common selection style (disable in maximized mode to avoid visual clutter)
        const selectionStyle = isSelected && !isMaximized ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: 10
        } : {};

        switch (layer.type) {
            case 'video':
                const videoUrl = layer.content?.videoUrl || layer.content?.url;
                const embedUrl = getEmbedUrl(videoUrl);

                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...finalStyle,
                            ...selectionStyle,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#000',
                            color: '#fff',
                            height: '100%',
                            width: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    pointerEvents: isMaximized ? 'auto' : 'none' // Allow interaction only when maximized
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px' }}>▶️</div>
                                <div style={{ fontSize: '10px', marginTop: 4 }}>No Video URL</div>
                            </div>
                        )}
                    </div>
                );

            case 'button':
                const label = layer.content?.label || layer.content?.text || 'Button';
                const variant = layer.content?.buttonVariant || 'primary';
                const themeColor = layer.content?.themeColor || '#6366F1';
                const textColor = layer.content?.textColor || '#FFFFFF';
                const fontSize = layer.content?.fontSize || 14;
                const fontWeight = layer.content?.fontWeight || 'medium';
                const borderRadius = layer.style?.borderRadius || 8;
                const iconName = layer.content?.buttonIcon;
                const iconPosition = layer.content?.buttonIconPosition || 'right';

                // Helper to adjust color brightness
                const adjustColorBrightness = (hex: string, percent: number) => {
                    if (!hex || !hex.startsWith('#')) return hex;
                    const num = parseInt(hex.replace('#', ''), 16);
                    const amt = Math.round(2.55 * percent);
                    const R = (num >> 16) + amt;
                    const G = (num >> 8 & 0x00FF) + amt;
                    const B = (num & 0x0000FF) + amt;
                    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
                };

                // Icon mapping (simplified)
                const icons: Record<string, React.ReactNode> = {
                    ExternalLink: <ExternalLink size={16} />,
                    // Add more if needed, currently PipRenderer only imports ExternalLink
                };

                const icon = iconName ? icons[iconName] : (layer.content?.action?.url ? <ExternalLink size={16} /> : null);

                let variantStyle: React.CSSProperties = {
                    padding: '10px 20px',
                    borderRadius: `${borderRadius}px`,
                    fontSize: `${fontSize}px`,
                    fontWeight,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: isMaximized ? 'inline-flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
                    border: 'none',
                    outline: 'none',
                    pointerEvents: isMaximized ? 'auto' : 'none',
                    fontFamily: layer.style?.fontFamily || 'inherit',
                    ...finalStyle,
                    ...selectionStyle,
                };

                switch (variant) {
                    case 'primary':
                        variantStyle = { ...variantStyle, backgroundColor: themeColor, color: textColor, boxShadow: `0 4px 6px -1px ${themeColor}40` };
                        break;
                    case 'secondary':
                        variantStyle = { ...variantStyle, backgroundColor: `${themeColor}20`, color: themeColor };
                        break;
                    case 'outline':
                        variantStyle = { ...variantStyle, backgroundColor: 'transparent', border: `2px solid ${themeColor}`, color: themeColor };
                        break;
                    case 'ghost':
                        variantStyle = { ...variantStyle, backgroundColor: 'transparent', color: themeColor };
                        break;
                    case 'soft':
                        variantStyle = { ...variantStyle, backgroundColor: `${themeColor}15`, color: themeColor };
                        break;
                    case 'glass':
                        variantStyle = { ...variantStyle, backgroundColor: `${themeColor}40`, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: textColor };
                        break;
                    case 'gradient':
                        variantStyle = { ...variantStyle, background: `linear-gradient(135deg, ${themeColor}, ${adjustColorBrightness(themeColor, -20)})`, color: textColor };
                        break;
                    case '3d':
                        variantStyle = { ...variantStyle, backgroundColor: themeColor, color: textColor, boxShadow: `0 5px 0 ${adjustColorBrightness(themeColor, -30)}`, transform: 'translateY(-2px)', marginBottom: '5px' };
                        break;
                    case 'elevated':
                        variantStyle = { ...variantStyle, backgroundColor: 'white', color: themeColor, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
                        break;
                    case 'neumorphic':
                        variantStyle = { ...variantStyle, backgroundColor: '#EEF2FF', color: themeColor, boxShadow: '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff' };
                        break;
                    case 'pill':
                        variantStyle = { ...variantStyle, backgroundColor: themeColor, color: textColor, borderRadius: '9999px' };
                        break;
                    case 'underline':
                        variantStyle = { ...variantStyle, backgroundColor: 'transparent', borderBottom: `2px solid ${themeColor}`, borderRadius: 0, padding: '4px 0', color: themeColor };
                        break;
                    case 'cyberpunk':
                        variantStyle = { ...variantStyle, backgroundColor: '#F3E600', color: 'black', borderRadius: 0, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' };
                        break;
                    default: // primary
                        variantStyle = { ...variantStyle, backgroundColor: themeColor, color: textColor };
                }

                return (
                    <button
                        key={layer.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isInteractive) {
                                handleAction(layer.content?.action);
                            } else {
                                onLayerSelect(layer.id);
                                if (isMaximized && layer.content?.action?.url) {
                                    window.open(layer.content.action.url, '_blank');
                                }
                            }
                        }}
                        style={variantStyle}
                    >
                        <span>{label}</span>
                        {icon && <span>{icon}</span>}
                    </button>
                );

            case 'media':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...finalStyle,
                            ...selectionStyle,
                            cursor: 'pointer',
                            display: isMaximized ? 'block' : 'none', // Only show when maximized
                            pointerEvents: isMaximized ? 'auto' : 'none',
                            overflow: 'hidden'
                        }}
                    >
                        {layer.content?.url ? (
                            <img
                                src={layer.content.url}
                                alt="Media"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af',
                                fontSize: '12px'
                            }}>
                                No Image
                            </div>
                        )}
                    </div>
                );

            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...finalStyle,
                            ...selectionStyle,
                            cursor: 'pointer',
                            display: isMaximized ? 'block' : 'none', // Only show when maximized
                            pointerEvents: isMaximized ? 'auto' : 'none',
                            fontSize: style.fontSize || '14px',
                            color: style.color || '#000',
                            fontWeight: style.fontWeight || 'normal',
                            textAlign: style.textAlign || 'left',
                            padding: style.padding || '8px',
                        }}
                    >
                        {layer.content?.text || 'Text Layer'}
                    </div>
                );

            case 'custom_html':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...finalStyle,
                            ...selectionStyle,
                            cursor: 'pointer',
                            display: isMaximized ? 'block' : 'none', // Only show when maximized
                            pointerEvents: isMaximized ? 'auto' : 'none',
                            width: style.width || '100%',
                            height: style.height || '100%',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            dangerouslySetInnerHTML={{ __html: layer.content?.html || '<div style="padding:10px; border:1px dashed #ccc; color:#999">Empty HTML</div>' }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Draggable nodeRef={nodeRef} disabled={!isInteractive || isMaximized} bounds="parent">
            <div ref={nodeRef} style={{
                position: 'absolute',
                ...getPositionStyles(),
                width: isMaximized ? '100%' : safeScale(containerStyle.width ?? width, scale),
                height: isMaximized ? '100%' : safeScale(containerStyle.height ?? height, scale),
                backgroundColor: containerStyle.backgroundColor || backgroundColor,
                borderRadius: isMaximized ? 0 : safeScale(containerStyle.borderRadius ?? cornerRadius, scale),
                overflow: 'hidden',
                boxShadow: containerStyle.boxShadow || '0 8px 24px rgba(0,0,0,0.2)',
                zIndex: isMaximized ? 100 : 50,
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                ...containerStyle,
                // Removed bgImageStyle per user request
                ...(isMaximized ? {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 0,
                    transform: 'none',
                    margin: 0
                } : {})
            }}
                onClick={(e) => {
                    if (pipContainerLayer) {
                        e.stopPropagation();
                        if (isInteractive) handleAction(pipContainerLayer);
                        else onLayerSelect(pipContainerLayer.id);
                    }
                }}
            >
                {/* 1. Force RENDER Video from Config (Background Layer) */}
                {(() => {
                    // Determine active video URL (Config takes priority, then fallback to layer)
                    const activeVideoUrl = config.videoUrl || videoLayer?.content?.url || videoLayer?.content?.videoUrl;
                    if (!activeVideoUrl) return null;

                    const embedUrl = getEmbedUrl(activeVideoUrl);
                    if (!embedUrl) return null;

                    return (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 0, // Behind other content
                                overflow: 'hidden',
                                pointerEvents: 'none', // Allow clicks to pass through
                            }}
                        >
                            <iframe
                                src={embedUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    pointerEvents: isMaximized ? 'auto' : 'none'
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    );
                })()}

                {/* 2. Render other children (Buttons etc), EXCLUDING the video layer to avoid dupe */}
                {pipContainerLayer?.children?.map((childId: string) => {
                    const child = layers.find(l => l.id === childId);
                    // Skip if it's a video layer, as we handled it above
                    if (child?.type === 'video') return null;
                    return child ? renderLayer(child) : null;
                })}

                {/* Controls Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none' // Let clicks pass through to container
                }}>
                    {/* Mute Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            pointerEvents: 'auto'
                        }}
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Maximize/Minimize Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMaximized(!isMaximized);
                            }}
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                pointerEvents: 'auto'
                            }}
                        >
                            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>

                        {/* Close Button */}
                        {showCloseButton && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle close logic
                                    if (isInteractive && onDismiss) {
                                        onDismiss();
                                    }
                                    console.log('Close PIP');
                                }}
                                style={{
                                    background: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: 'pointer',
                                    pointerEvents: 'auto'
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Draggable>
    );
};
