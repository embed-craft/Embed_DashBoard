import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface MediaRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ layer, scale = 1, scaleY = 1 }) => {
    // Determine if layer has explicit dimensions or should auto-fit
    const hasExplicitWidth = layer.style?.width || layer.size?.width;
    const hasExplicitHeight = layer.style?.height || layer.size?.height;

    return (
        <img
            src={layer.content?.imageUrl || 'https://via.placeholder.com/150'}
            alt={layer.name}
            style={{
                // FIX: Use max-width/max-height to allow shrinking on smaller containers
                // If explicit dimensions set, use 100%. Otherwise, use auto with max constraints.
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                borderRadius: typeof layer.style?.borderRadius === 'object'
                    ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
                    : (layer.style?.borderRadius || 0),
                // FIX: Default to 'contain' to prevent cropping, unless user specifies 'cover'
                objectFit: (layer.style?.objectFit as any) || 'contain'
            }}
        />
    );
};
