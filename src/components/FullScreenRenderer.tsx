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

    // Create modified config for FullScreen
    const fullScreenConfig = React.useMemo(() => {
        const modifiedConfig = { ...config };

        // Force FullScreen-specific values
        modifiedConfig.position = 'center'; // Conceptually centered, but filling space
        modifiedConfig.offsetX = 0;
        modifiedConfig.offsetY = 0;
        modifiedConfig.draggable = false;
        modifiedConfig.expanded = false;

        // Force Dimensions
        modifiedConfig.width = '100%';
        modifiedConfig.height = '100%';

        // FIX: FloaterRenderer's safeScale logic might interfere if we pass raw numbers.
        // We pass '100%' explicitly.

        // Disable standard Floater visuals handled by wrapper or not needed for fullscreen
        modifiedConfig.borderRadius = 0; // Usually fullscreen has no radius, but maybe user wants inner radius? 
        // Let's assume standard fullscreen consumes the whole screen.

        modifiedConfig.shadow = { enabled: false }; // No shadow for fullscreen

        // Ensure behavior exists with disabled Floater features but respecting new interaction flags
        modifiedConfig.behavior = {
            ...(modifiedConfig.behavior || {}),
            draggable: false,
            snapToCorner: false,
            doubleTapToDismiss: config.behavior?.doubleTapToDismiss ?? false,
            tapToDismiss: config.behavior?.tapToDismiss ?? false, // New Prop for Floater?
        };

        // Ensure controls exists (Close button usually needed)
        modifiedConfig.controls = {
            ...(config.controls || {}), // Merge existing controls first
            closeButton: {
                show: true, // Default to true if undefined
                position: 'top-right',
                size: 24,
                ...(config.controls?.closeButton || {}), // Override with config
                darkBackground: true // Ensure visibility on potentially dark content
            },
            expandButton: { show: false },
            muteButton: { show: false },
            progressBar: config.controls?.progressBar || { show: false }
        };

        // Override background to avoid double rendering if wrapper handles it, 
        // OR let Floater handle it since it fills 100%.
        // For BottomSheet we stripped it. For FullScreen, Floater IS the container.
        // So we can let Floater render the background.
        // BUT `FloaterRenderer` wrapper is `DraggableLayerWrapper` or inner div?
        // `FloaterRenderer` renders a `DraggableLayerWrapper` (or assumes one around it?). 
        // Wait, `FloaterRenderer` renders `div` with `containerRef`?
        // Let's trust FloaterRenderer to handle background if we pass it.

        // Pass overflow setting
        modifiedConfig.overflow = config?.overflow || 'hidden';

        // Disable overlay in FloaterRenderer (we handle scrim/backdrop here if needed, or fullscreen IS the backdrop)
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
        backgroundColor: config?.overlay?.color || 'rgba(0,0,0,0.5)', // Use overlay color as backdrop? 
        // Fullscreen usually implies content covers screen.
        // If content is transparent, we see backdrop.
    };

    return (
        <div style={outerWrapperStyle}>
            {/* Content Area - Fills screen */}
            <div style={{
                pointerEvents: 'auto',
                width: '100%',
                height: '100%',
                position: 'relative',
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
