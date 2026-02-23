import React from 'react';
import { FloaterRenderer } from './FloaterRenderer';

/**
 * FullScreen Renderer - Thin wrapper around FloaterRenderer
 * 
 * Uses FloaterRenderer as the core renderer with these overrides:
 * - Position: Fixed Fullscreen (inset 0)
 * - Draggable: Disabled
 * - Expanded: Disabled (Always technically expanded/full)
 * - Dimensions: Width 100%, Height 100%
 */

interface FullScreenRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string | null) => void;
    onLayerUpdate?: (id: string, updates: any) => void;
    colors: any;
    config?: any;
    onDismiss?: () => void;
    isInteractive?: boolean;
    onNavigate?: (screenName: string) => void;
    scale?: number;
    scaleY?: number;
    onInterfaceAction?: (interfaceId: string) => void;
}

export const FullScreenRenderer: React.FC<FullScreenRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    config,
    onDismiss,
    isInteractive = false,
    onNavigate,
    onInterfaceAction,
    scale = 1,
    scaleY = 1
}) => {

    // Determine position (Always center for fullscreen conceptually, but fills)
    const position = 'center';

    // Helper to safely scale numeric values (mostly for blur/shadows if any)
    const safeScale = (val: string | number | undefined, scaleFactor: number): string | undefined => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === 'number') return `${val * scaleFactor}px`;
        if (typeof val === 'string') {
            if (val.endsWith('%')) return val; // Do not scale percentages physically
            if (val.endsWith('px')) {
                const num = parseFloat(val);
                if (!isNaN(num)) return `${num * scaleFactor}px`;
            }
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) return `${parsed * scaleFactor}px`;
        }
        return val;
    };

    // Create modified config for FullScreen
    // Override Floater-specific properties and add standard FullScreen behaviors
    const fullScreenConfig = React.useMemo(() => {
        const modifiedConfig = { ...config };

        // Force FullScreen-specific values
        modifiedConfig.position = 'center'; // Conceptually centered, but filling space
        modifiedConfig.offsetX = 0;
        modifiedConfig.offsetY = 0;
        modifiedConfig.draggable = false;
        modifiedConfig.expanded = false;

        // Force Dimensions explicitly
        modifiedConfig.width = '100%';
        modifiedConfig.height = '100%';

        // Veto dimensions that corrupt fullscreen (radius, shadow, backdrop)
        modifiedConfig.borderRadius = 0;
        modifiedConfig.borderWidth = 0;
        modifiedConfig.shadow = { enabled: false };

        // Ensure behavior exists with disabled Floater features but respecting new interaction flags
        modifiedConfig.behavior = {
            ...(modifiedConfig.behavior || {}),
            draggable: false,
            snapToCorner: false,
            doubleTapToDismiss: config?.behavior?.doubleTapToDismiss ?? false,
            tapToDismiss: config?.behavior?.tapToDismiss ?? false,
        };

        // Ensure controls exists (Close button usually needed)
        modifiedConfig.controls = {
            ...(config?.controls || {}),
            closeButton: {
                show: config?.showCloseButton ?? config?.controls?.closeButton?.show ?? true, // Default to true if undefined
                position: 'top-right',
                size: 24,
                ...(config?.controls?.closeButton || {}),
                darkBackground: true // Ensure visibility on potentially dark content
            },
            expandButton: { show: false },
            muteButton: { show: false },
            progressBar: config?.controls?.progressBar || { show: false }
        };

        // Pass overflow setting
        modifiedConfig.overflow = config?.overflow || 'hidden';

        // FIX: Disable internal overlay in FloaterRenderer as we render it eternally in FullScreenRenderer
        // preventing "Double Background" transparency overlapping bugs
        modifiedConfig.overlay = { enabled: false };

        return modifiedConfig;
    }, [config]);

    // FullScreen wrapper style
    const outerWrapperStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none', // Let children capture events
        backgroundColor: config?.backgroundColor || 'transparent', // The Base Canvas Color from the Editor
    };

    return (
        <div style={outerWrapperStyle}>
            {/* Base FullScreen Media Canvas (Rendered behind Scrim & Content) */}
            {config?.media?.type === 'image' && config.media.url && (
                <img
                    src={config.media.url}
                    alt="Background"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: config.media.fit || 'cover',
                        zIndex: -1
                    }}
                />
            )}

            {config?.media?.type === 'video' && config.media.url && (
                <video
                    src={config.media.url}
                    autoPlay={config.media.autoPlay ?? true}
                    muted={config.media.muted ?? false}
                    loop={config.media.loop ?? true}
                    playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Videos generally cover in full screen
                        zIndex: -1
                    }}
                />
            )}

            {config?.media?.type === 'youtube' && config.media.url && (
                <iframe
                    src={`https://www.youtube.com/embed/${config.media.url.split('v=')[1]?.split('&')[0] || config.media.url.split('/').pop()}?autoplay=${config.media.autoPlay ? 1 : 0}&mute=${config.media.muted ? 1 : 0}&loop=${config.media.loop ? 1 : 0}&controls=0`}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        zIndex: -1,
                        pointerEvents: 'none' // Prevent intercepting clicks
                    }}
                    allow="autoplay; encrypted-media"
                />
            )}

            {/* External Overlay (Scrim) - Rendered behind the Floater */}
            {config?.overlay?.enabled && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: config.overlay.color || '#000000',
                        opacity: config.overlay.opacity ?? 0.5,
                        backdropFilter: config.overlay.blur ? `blur(${config.overlay.blur * scale}px)` : undefined,
                        pointerEvents: 'auto', // Allow clicking scrim to dismiss
                        zIndex: 0
                    }}
                    onClick={() => {
                        if (config.overlay.dismissOnClick && onDismiss) onDismiss();
                    }}
                />
            )}

            {/* Content Area - Fills screen */}
            <div style={{
                pointerEvents: 'auto',
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 1, // Above scrim
            }}>
                <FloaterRenderer
                    layers={layers}
                    selectedLayerId={selectedLayerId}
                    onLayerSelect={onLayerSelect}
                    onLayerUpdate={onLayerUpdate}
                    colors={colors}
                    config={fullScreenConfig}
                    isInteractive={isInteractive}
                    onDismiss={onDismiss}
                    onNavigate={onNavigate}
                    onInterfaceAction={onInterfaceAction}
                    scale={scale}
                    scaleY={scaleY}
                />
            </div>
        </div>
    );
};
