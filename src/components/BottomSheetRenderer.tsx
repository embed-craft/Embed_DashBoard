import React, { useRef } from 'react';
import { Layer, BottomSheetConfig, LayerStyle } from '@/store/useEditorStore';
import { Settings2, X, Code } from 'lucide-react';

interface BottomSheetRendererProps {
    layers: Layer[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    onLayerUpdate?: (id: string, updates: Partial<Layer>) => void;
    colors: any;
    config?: BottomSheetConfig;
    onDismiss?: () => void;
}

export const BottomSheetRenderer: React.FC<BottomSheetRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    colors,
    config,
    onDismiss
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the generic 'container' layer if it exists, otherwise use config
    // In "Minimal Solid", we might just rely on config for the container style 
    // and treat 'layers' as children of that container.
    // However, the legacy structure often had a "Container" layer. 
    // We will iterate all layers. If a layer is a child of another, we skip it (handled by recursion if we did that, but ModalRenderer does flat map).
    // ModalRenderer defines 'childLayers' as layers where parent === modalLayer.id.

    // Let's assume a simplified Model:
    // The BottomSheet ITSELF is the container.
    // All top-level layers (parent === null) are children of the sheet?
    // Or if there is a 'container' layer, we use that?
    // Let's try to find a root container layer.
    const rootLayer = layers.find(l => l.type === 'container' && l.name === 'Bottom Sheet')
        || layers.find(l => l.type === 'container')
        || null;

    // If we have a root layer, we render its children.
    // If no root layer, we render all layers (fallback).
    const children = rootLayer
        ? layers.filter(l => l.parent === rootLayer.id)
        : layers;

    const renderLayer = (layer: Layer) => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        const isAbsolute = layer.style?.position === 'absolute' || layer.style?.position === 'fixed';

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            // SDK Logic Match: Absolute layers should not have margin-bottom.
            // Relative layers default to 10px spacing.
            marginBottom: isAbsolute ? 0 : '10px',
            ...layer.style as any
        };

        let content = null;

        switch (layer.type) {
            case 'text':
                content = (
                    <div style={{
                        fontSize: layer.content.fontSize || 16,
                        color: layer.content.textColor || 'black',
                        fontWeight: layer.content.fontWeight || 'normal',
                        textAlign: layer.content.textAlign || 'left'
                    }}>
                        {layer.content.text || 'Text'}
                    </div>
                );
                break;
            case 'image':
            case 'media': // Handle 'media' as alias for 'image'
                content = (
                    <img
                        src={layer.content.imageUrl || layer.content.url || 'https://via.placeholder.com/150'} // Fallback
                        alt={layer.name}
                        style={{
                            width: layer.size?.width ? `${layer.size.width}px` : '100%',
                            height: layer.size?.height ? `${layer.size.height}px` : 'auto',
                            borderRadius: layer.style?.borderRadius || 0,
                            objectFit: 'cover'
                        }}
                    />
                );
                break;
            case 'handle':
                content = (
                    <div style={{
                        width: layer.size?.width || 40,
                        height: layer.size?.height || 4,
                        backgroundColor: layer.style?.backgroundColor || '#e5e7eb',
                        borderRadius: layer.style?.borderRadius || 2,
                        margin: '0 auto'
                    }} />
                );
                break;
            case 'button':
                content = (
                    <button style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent', // Wrapper handles background
                        color: layer.content.textColor || 'white',
                        // borderRadius handled by wrapper (layer.style)
                        border: 'none',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: layer.content.fontSize // ensure font size is passed if needed
                    }}>
                        {layer.content.label || 'Button'}
                    </button>
                );
                break;
            case 'custom_html':
                content = (
                    <div
                        dangerouslySetInnerHTML={{ __html: layer.content?.html || '<div style="padding:10px; border:1px dashed #ccc; color:#999">Empty HTML Layer</div>' }}
                    />
                );
                break;
            default:
                content = <div style={{ padding: 4, border: '1px dashed #ccc' }}>Unknown Layer: {layer.type}</div>;
        }

        return (
            <div
                key={layer.id}
                onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                style={{
                    ...baseStyle,
                    outline: isSelected ? `2px solid ${colors.primary[500]}` : 'none',
                    cursor: 'pointer',
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

    const overlayOpacity = config?.overlay?.enabled ? (config.overlay.opacity ?? 0.5) : 0;
    const overlayColor = config?.overlay?.color || '#000000';

    return (
        <>
            {/* Overlay */}
            {config?.overlay?.enabled && (
                <div
                    onClick={() => { if (config.overlay.dismissOnClick && onDismiss) onDismiss(); }}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: overlayColor,
                        opacity: overlayOpacity,
                        zIndex: 99
                    }}
                />
            )}

            {/* Sheet */}
            <div
                ref={containerRef}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: config?.height || 'auto',
                    minHeight: '100px',
                    backgroundColor: config?.backgroundColor === 'transparent' ? 'transparent' : (config?.backgroundColor || 'white'),
                    backgroundImage: config?.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                    backgroundSize: config?.backgroundSize || 'cover',
                    backgroundPosition: 'center',
                    borderTopLeftRadius: config?.borderRadius?.topLeft || 16,
                    borderTopRightRadius: config?.borderRadius?.topRight || 16,
                    padding: config?.padding ? `${config.padding.top || 0}px ${config.padding.right || 0}px ${config.padding.bottom || 0}px ${config.padding.left || 0}px` : '0px',
                    zIndex: 100,
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Handle bar (cosmetic) - Controlled by config */}
                {config?.dragHandle && (
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        margin: '0 auto 16px auto',
                        flexShrink: 0
                    }} />
                )}

                {/* Close Button - Controlled by config */}
                {config?.showCloseButton && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDismiss) onDismiss();
                        }}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    >
                        <X size={16} color={colors.text.secondary} />
                    </button>
                )}

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children.map(renderLayer)}
                </div>

            </div>
        </>
    );
};
