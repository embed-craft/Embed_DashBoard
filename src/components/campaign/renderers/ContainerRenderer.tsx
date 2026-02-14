import React from 'react';
import { Layer, LayerStyle } from '@/store/useEditorStore';

// === Helpers Copied from FloaterRenderer to Ensure Parity ===

// Helper to convert transform object to string
const getTransformString = (transform?: LayerStyle['transform']) => {
    if (!transform || typeof transform !== 'object') return undefined;
    const parts = [];
    if (transform.rotate) parts.push(`rotate(${transform.rotate}deg)`);
    if (transform.scale) parts.push(`scale(${transform.scale})`);

    if (transform.translateX !== undefined) {
        const val = transform.translateX;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateX(${valStr})`);
    }

    if (transform.translateY !== undefined) {
        const val = transform.translateY;
        const valStr = typeof val === 'number' ? `${val}px` : val;
        parts.push(`translateY(${valStr})`);
    }

    return parts.join(' ');
};

// Helper to convert filter object to string
const getFilterString = (filter?: LayerStyle['filter']) => {
    if (!filter || typeof filter !== 'object') return undefined;
    const parts = [];
    if (filter.blur) parts.push(`blur(${filter.blur}px)`);
    if (filter.brightness) parts.push(`brightness(${filter.brightness}%)`);
    if (filter.contrast) parts.push(`contrast(${filter.contrast}%)`);
    if (filter.grayscale) parts.push(`grayscale(${filter.grayscale}%)`);
    return parts.join(' ');
};

interface ContainerRendererProps {
    layer: Layer;
    layers: Layer[];
    scale?: number;
    scaleY?: number;
    renderChild: (layer: Layer) => React.ReactNode;
}

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({
    layer,
    layers,
    scale = 1,
    scaleY = 1,
    renderChild
}) => {
    // Helper to match FloaterRenderer's safeScale
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString().trim();
        if (strVal.endsWith('%') || strVal.endsWith('vh') || strVal.endsWith('vw')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const children = layers.filter(l => l.parent === layer.id);

    // Resolve Glassmorphism - Correct Logic (No double px)
    const backdropFilter = (() => {
        const enabled = (layer.style as any)?.backdropFilter?.enabled;
        if (!enabled) return undefined;
        // safescale adds 'px' if it's a number.
        // If config.blur is 10, safeScale returns "10px".
        // blur() expects "10px".
        // So `blur(${safeScale(...)})` is correct.
        const blurValue = (layer.style as any).backdropFilter.blur || 10;
        return `blur(${safeScale(blurValue, scale)})`;
    })();

    const webkitBackdropFilter = backdropFilter;

    // Resolve Shadow
    const boxShadow = (() => {
        const shadow = (layer.style as any)?.shadow;
        if (shadow?.enabled === false) return 'none';
        if (shadow) {
            const x = safeScale(shadow.x || 0, scale);
            const y = safeScale(shadow.y || 2, scale); // Default Y offset 2
            const blur = safeScale(shadow.blur || 10, scale); // Default blur 10
            const spread = safeScale(shadow.spread || 0, scale);
            const color = shadow.color || 'rgba(0,0,0,0.1)';
            return `${x} ${y} ${blur} ${spread} ${color}`;
        }
        return layer.style?.boxShadow;
    })();

    // Construct Styles
    const style: React.CSSProperties = {
        // Layout
        display: layer.style?.display || 'flex',
        flexDirection: layer.style?.flexDirection || 'column',
        alignItems: layer.style?.alignItems || 'stretch',
        justifyContent: layer.style?.justifyContent || 'flex-start',
        gap: safeScale(layer.style?.gap || 0, scale),
        padding: 0,

        // Size & Position (Relative to parent wrapper)
        width: '100%',
        height: '100%',
        position: 'relative',

        // Overflow
        overflowX: 'hidden',
        overflowY: layer.style?.overflow === 'scroll' ? 'auto' : (layer.style?.overflow || 'hidden'),

        // Visuals (Applied directly to inner div)
        backgroundColor: layer.style?.backgroundColor,
        backgroundImage: layer.style?.backgroundImage,
        backgroundSize: layer.style?.backgroundSize || 'cover',
        backgroundPosition: layer.style?.backgroundPosition || 'center',

        // Borders
        borderWidth: safeScale(layer.style?.borderWidth, scale),
        borderStyle: layer.style?.borderStyle,
        borderColor: layer.style?.borderColor,
        borderRadius: typeof layer.style?.borderRadius === 'object'
            ? `${safeScale(layer.style.borderRadius.topLeft || 0, scale)} ${safeScale(layer.style.borderRadius.topRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomRight || 0, scale)} ${safeScale(layer.style.borderRadius.bottomLeft || 0, scale)}`
            : safeScale(layer.style?.borderRadius, scale),

        // Effects
        opacity: layer.style?.opacity,
        boxShadow: boxShadow,
        filter: getFilterString(layer.style?.filter),
        backdropFilter: backdropFilter,
        WebkitBackdropFilter: webkitBackdropFilter,
    };

    return (
        <div style={style}>
            {children.map(child => renderChild(child))}
        </div>
    );
};
