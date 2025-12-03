import React, { useRef, useEffect } from 'react';
import { DraggableResizableLayerWrapper } from './DraggableResizableLayerWrapper';

interface FloaterConfig {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right' | 'center-left';
    mode?: 'default' | 'image-only';
    shape?: 'circle' | 'rectangle';
    width?: number;
    height?: number;
    sizeUnit?: 'px' | '%';
    backgroundColor?: string;
    backgroundImageUrl?: string;
    backgroundSize?: 'cover' | 'contain';
    borderRadius?: number;
    boxShadow?: string;
    opacity?: number;
    glassmorphism?: {
        enabled: boolean;
        blur: number;
        opacity: number;
    };
    gradient?: {
        enabled: boolean;
        startColor: string;
        endColor: string;
        angle: number;
    };
    animation?: {
        type: 'scale' | 'slide' | 'fade' | 'bounce';
        duration: number;
    };
    offsetX?: number;
    offsetY?: number;
}

interface FloaterRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    onLayerUpdate: (id: string, updates: any) => void;
    scale?: number;
    isMobile?: boolean;
    config?: FloaterConfig;
}

export const FloaterRenderer: React.FC<FloaterRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    onLayerUpdate,
    scale = 1,
    isMobile = false,
    config = {}
}) => {
    // Find the container layer
    const containerLayer = layers.find(l => l.type === 'container' && l.name === 'Floater Container');

    // Defaults
    const position = config.position || 'bottom-right';
    const mode = config.mode || 'default';
    const shape = config.shape || 'circle';
    const width = config.width || (mode === 'image-only' || shape === 'circle' ? 60 : 200);
    const height = config.height || (mode === 'image-only' || shape === 'circle' ? 60 : 300);
    const offsetX = config.offsetX || 20;
    const offsetY = config.offsetY || 20;

    // Style Construction
    const getContainerStyle = () => {
        // Use configured width/height if available, otherwise fallback to defaults
        const currentWidth = config.width || width;
        const currentHeight = config.height || height;
        const unit = config.sizeUnit || 'px';

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            width: `${currentWidth}${unit}`,
            height: `${currentHeight}${unit}`,
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        };

        // Positioning (Initial or Override)
        // If layer has explicit position (from drag), use it. Otherwise use config position.
        if (containerLayer?.style?.left !== undefined && containerLayer?.style?.top !== undefined) {
            // Let DraggableResizableLayerWrapper handle it via layer.style
        } else {
            // Initial positioning based on config
            switch (position) {
                case 'bottom-right':
                    baseStyle.bottom = `${offsetY}px`;
                    baseStyle.right = `${offsetX}px`;
                    break;
                case 'bottom-left':
                    baseStyle.bottom = `${offsetY}px`;
                    baseStyle.left = `${offsetX}px`;
                    break;
                case 'top-right':
                    baseStyle.top = `${offsetY}px`;
                    baseStyle.right = `${offsetX}px`;
                    break;
                case 'top-left':
                    baseStyle.top = `${offsetY}px`;
                    baseStyle.left = `${offsetX}px`;
                    break;
                case 'center-right':
                    baseStyle.top = '50%';
                    baseStyle.right = `${offsetX}px`;
                    baseStyle.transform = 'translateY(-50%)';
                    break;
                case 'center-left':
                    baseStyle.top = '50%';
                    baseStyle.left = `${offsetX}px`;
                    baseStyle.transform = 'translateY(-50%)';
                    break;
            }
        }

        // Shape & Border Radius
        if (mode === 'image-only') {
            baseStyle.borderRadius = '0px';
        } else if (shape === 'circle') {
            baseStyle.borderRadius = '50%';
        } else {
            baseStyle.borderRadius = `${config.borderRadius ?? 16}px`;
        }

        // Background
        if (mode === 'image-only') {
            baseStyle.backgroundColor = 'transparent';
            baseStyle.boxShadow = 'none'; // Remove shadow in image-only mode by default

            if (config.backgroundImageUrl) {
                baseStyle.backgroundImage = `url(${config.backgroundImageUrl})`;
                baseStyle.backgroundSize = config.backgroundSize || 'contain'; // Default to contain for image-only
                baseStyle.backgroundPosition = 'center';
                baseStyle.backgroundRepeat = 'no-repeat';
            } else {
                // Placeholder if no image
                baseStyle.border = '2px dashed #ccc';
                baseStyle.display = 'flex';
                baseStyle.alignItems = 'center';
                baseStyle.justifyContent = 'center';
                baseStyle.color = '#ccc';
                baseStyle.fontSize = '10px';
            }
        } else if (config.gradient?.enabled) {
            (baseStyle as any).background = `linear-gradient(${config.gradient.angle}deg, ${config.gradient.startColor}, ${config.gradient.endColor})`;
        } else {
            baseStyle.backgroundColor = config.backgroundColor || '#10B981';
        }

        // Glassmorphism
        if (config.glassmorphism?.enabled) {
            baseStyle.backdropFilter = `blur(${config.glassmorphism.blur}px)`;
            baseStyle.backgroundColor = config.gradient?.enabled
                ? (baseStyle as any).background // Keep gradient if enabled
                : (baseStyle.backgroundColor as string).replace('rgb', 'rgba').replace(')', `, ${config.glassmorphism.opacity})`);
            baseStyle.border = '1px solid rgba(255, 255, 255, 0.2)';
        }

        // Shadow
        if (mode !== 'image-only') {
            baseStyle.boxShadow = config.boxShadow || '0 8px 32px rgba(0, 0, 0, 0.15)';
        }

        // Opacity
        if (config.opacity !== undefined) {
            baseStyle.opacity = config.opacity;
        }

        return baseStyle;
    };

    const renderContent = (layer: any) => {
        switch (layer.type) {
            case 'icon':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: layer.style?.color || '#FFFFFF',
                        fontSize: layer.style?.fontSize ? `${layer.style.fontSize}px` : '24px'
                    }}>
                        <i className={`fas ${layer.content?.icon || 'fa-star'}`} />
                    </div>
                );
            case 'text':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...layer.style
                    }}>
                        {layer.content?.text || 'Text'}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderLayer = (layer: any) => {
        if (!layer) return null;
        const isSelected = selectedLayerId === layer.id;

        return (
            <DraggableResizableLayerWrapper
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onLayerSelect={onLayerSelect}
                onLayerUpdate={onLayerUpdate}
                scale={scale}
                parentId={containerLayer?.id}
                showResizeHandles={isSelected}
                baseStyle={layer.style as React.CSSProperties}
            >
                {renderContent(layer)}
            </DraggableResizableLayerWrapper>
        );
    };

    if (!containerLayer) return null;

    const isContainerSelected = selectedLayerId === containerLayer.id;
    const containerStyle = getContainerStyle();

    return (
        <DraggableResizableLayerWrapper
            key={containerLayer.id}
            layer={containerLayer}
            isSelected={isContainerSelected}
            onLayerSelect={onLayerSelect}
            onLayerUpdate={onLayerUpdate}
            scale={scale}
            showResizeHandles={isContainerSelected}
            baseStyle={containerStyle}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    // Important: Ensure the div takes up the space so background shows
                }}
            >
                {/* Render Children only if NOT image-only mode */}
                {mode !== 'image-only' && containerLayer.children?.map((childId: string) => {
                    const child = layers.find(l => l.id === childId);
                    return child ? renderLayer(child) : null;
                })}
            </div>
        </DraggableResizableLayerWrapper>
    );
};
