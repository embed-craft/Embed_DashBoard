import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface MediaRendererProps {
    layer: Layer;
    scale?: number;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ layer, scale = 1 }) => {
    return (
        <img
            src={layer.content?.imageUrl || 'https://via.placeholder.com/150'}
            alt={layer.name}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: typeof layer.style?.borderRadius === 'object'
                    ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
                    : (layer.style?.borderRadius || 0),
                objectFit: (layer.style?.objectFit as any) || 'cover'
            }}
        />
    );
};
