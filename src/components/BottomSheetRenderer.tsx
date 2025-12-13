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

        const baseStyle: React.CSSProperties = {
            position: 'relative',
            marginBottom: '10px',
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
                content = (
                    <img
                        src={layer.content.imageUrl}
                        style={{ width: '100%', height: 'auto', borderRadius: layer.style?.borderRadius || 0 }}
                    />
                );
                break;
            case 'button':
                content = (
                    <button style={{
                        padding: '10px 20px',
                        backgroundColor: layer.content.themeColor || '#6366f1',
                        color: layer.content.textColor || 'white',
                        borderRadius: layer.style?.borderRadius || 8,
                        border: 'none',
                        width: '100%'
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
                    cursor: 'pointer'
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
                    padding: '20px',
                    zIndex: 100,
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Handle bar (cosmetic) */}
                <div style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    margin: '0 auto 16px auto'
                }} />

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children.map(renderLayer)}
                </div>

            </div>
        </>
    );
};
