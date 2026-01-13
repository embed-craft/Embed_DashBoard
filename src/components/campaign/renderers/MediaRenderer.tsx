import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface MediaRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ layer, scale = 1, scaleY = 1 }) => {
    // SDK Parity: Safe Scale Helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Determine if layer has explicit dimensions or should auto-fit
    const hasExplicitWidth = layer.style?.width || layer.size?.width;
    const hasExplicitHeight = layer.style?.height || layer.size?.height;

    return (
        <img
            src={layer.content?.imageUrl || 'https://via.placeholder.com/150'}
            alt={layer.name}
            draggable={false} // Prevent native browser drag
            style={{
                // FIX: Use max-width/max-height to allow shrinking on smaller containers
                // If explicit dimensions set, use 100%. Otherwise, use auto with max constraints.
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                userSelect: 'none', // Prevent selection during drag
                borderRadius: typeof layer.style?.borderRadius === 'object'
                    ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                    : safeScale(layer.style?.borderRadius || 0, scale),
                // FIX: Default to 'contain' to prevent cropping, unless user specifies 'cover'
                objectFit: layer.style?.objectFit || 'contain',
                filter: typeof layer.style?.filter === 'object'
                    ? [
                        layer.style.filter.blur ? `blur(${safeScale(layer.style.filter.blur, scale)})` : '', // Scale Blur
                        layer.style.filter.brightness ? `brightness(${layer.style.filter.brightness}%)` : '',
                        layer.style.filter.contrast ? `contrast(${layer.style.filter.contrast}%)` : '',
                        layer.style.filter.grayscale ? `grayscale(${layer.style.filter.grayscale}%)` : ''
                    ].filter(Boolean).join(' ')
                    : layer.style?.filter,
                aspectRatio: layer.style?.aspectRatio,
                // Add shadow scaling support
                boxShadow: layer.style?.boxShadow ? (
                    // If it's the simple shadowEnabled prop... wait, MediaRenderer usually uses style.boxShadow string?
                    // If it uses the new shadowEnabled prop, we should handle it. 
                    // But here layer.style.boxShadow is likely the raw string or object.
                    // IMPORTANT: ModalRenderer handles the main wrapper. 
                    // If MediaRenderer is a child, it renders an IMG.
                    // The IMG gets the style.
                    // We should use safeScale if it's a manual string? No, parsing string is hard.
                    // Assuming layer.style.boxShadow is just passed through.
                    // BUT, if we want strict parity, we need to scale the shadow values inside the string?
                    // That's complex regex replacement.
                    // ALTERNATIVE: Use the `shadowEnabled` checks like Button/Input if available.
                    // Checking MediaRenderer again... it just passed `layer.style?.boxShadow`.
                    // If the user uses the Shadow controls in editor, it typically sets `boxShadow` string.
                    // Actually, modern editor sets `shadowEnabled`, `shadowBlur` etc.
                    // Let's support that PREFERENTIALLY.
                    layer.style?.shadowEnabled
                        ? `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                        : layer.style?.boxShadow // Fallback to raw string (might not be scaled if raw string)
                ) : undefined,
            }}
        />
    );
};
