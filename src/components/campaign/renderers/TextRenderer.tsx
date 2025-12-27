import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface TextRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ layer, scale = 1, scaleY = 1 }) => {
    // Design device dimensions for percentage conversion
    const designWidth = 393;

    // Convert pixel fontSize to scaled pixels (matches container stretch)
    // FIX: Default fontSize changed to 14 to match SDK
    const baseFontSize = layer.content?.fontSize || 14;

    // FIX: Removed textScaleCorrection for true SDK parity
    // Both Dashboard and SDK now use fontSize * scale without correction
    const scaledFontSize = typeof baseFontSize === 'number'
        ? baseFontSize * scale
        : baseFontSize;

    // SDK Parity: Safe Scale Helper for shadows
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const textShadow = (layer.content?.textShadowX || layer.content?.textShadowY || layer.content?.textShadowBlur)
        ? `${safeScale(layer.content.textShadowX || 0, scale)} ${safeScale(layer.content.textShadowY || 0, scale)} ${safeScale(layer.content.textShadowBlur || 0, scale)} ${layer.content.textShadowColor || '#000000'}`
        : undefined;

    return (
        <div style={{
            fontSize: `${scaledFontSize}px`,
            color: layer.content?.textColor || 'black',
            fontWeight: layer.content?.fontWeight || 400,
            textAlign: layer.content?.textAlign || 'left',
            fontFamily: layer.content?.fontFamily ? `'${layer.content.fontFamily}', sans-serif` : 'inherit',
            // FIX: lineHeight changed to 1.4 to match SDK (was 1.2)
            lineHeight: 1.4,
            textShadow: textShadow,
            whiteSpace: 'pre-wrap', // Better multi-line support
            width: '100%',
            height: '100%',
            // FIX: Reset browser defaults to match Flutter (no default margin/padding)
            margin: 0,
            padding: 0,
            boxSizing: 'border-box' as const,
        }}>
            {/* Inject Custom Font CSS if URL provided */}
            {layer.content?.fontUrl && (
                <style>
                    {`@import url('${layer.content.fontUrl}');`}
                </style>
            )}
            {layer.content?.text || 'Text'}
        </div>
    );
};

