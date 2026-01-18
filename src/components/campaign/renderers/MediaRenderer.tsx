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

    // FIX: Render Grey Box Placeholder if URL is empty (Parity with Flutter)
    if (!layer.content?.imageUrl) {
        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 100,
                    height: hasExplicitHeight ? '100%' : 100,
                    backgroundColor: '#E5E7EB', // grey-200
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: typeof layer.style?.borderRadius === 'object'
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                }}
            >
                {/* Simple broken image representation */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={layer.content?.imageUrl}
            alt={layer.name}
            draggable={false}
            style={{
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'block',
                userSelect: 'none',
                opacity: layer.style?.opacity ?? 1,
                borderRadius: typeof layer.style?.borderRadius === 'object'
                    ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                    : safeScale(layer.style?.borderRadius || 0, scale),
                borderWidth: safeScale(layer.style?.borderWidth || 0, scale),
                borderStyle: layer.style?.borderStyle || (layer.style?.borderWidth ? 'solid' : 'none'),
                borderColor: layer.style?.borderColor || 'transparent',
                objectFit: layer.style?.objectFit || 'contain',
                filter: typeof layer.style?.filter === 'object'
                    ? [
                        layer.style.filter.blur ? `blur(${safeScale(layer.style.filter.blur, scale)})` : '',
                        layer.style.filter.brightness ? `brightness(${layer.style.filter.brightness}%)` : '',
                        layer.style.filter.contrast ? `contrast(${layer.style.filter.contrast}%)` : '',
                        layer.style.filter.grayscale ? `grayscale(${layer.style.filter.grayscale}%)` : ''
                    ].filter(Boolean).join(' ')
                    : layer.style?.filter,
                aspectRatio: layer.style?.aspectRatio,
                boxShadow: layer.style?.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                    : layer.style?.boxShadow,
            }}
        />
    );
};
