import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { useGridElementData, interpolateDataBinding } from '@/components/campaign/renderers/GridElementContext';

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

    // STW Placeholder replacement: {{reward_name}}, {{section_name}}, {{spins_left}}, {{max_spins}}
    const resolveText = (text: string): string => {
        if (!text) return text;
        let resolved = text;

        // Reward placeholders
        if (resolved.includes('{{reward_name}}') || resolved.includes('{{section_name}}')) {
            const result = (window as any).__stwResult;
            const rewardName = result?.name || '{{reward_name}}';
            resolved = resolved
                .replace(/\{\{reward_name\}\}/g, rewardName)
                .replace(/\{\{section_name\}\}/g, rewardName);
        }

        // Spin counter placeholders
        if (resolved.includes('{{spins_left}}')) {
            const spinsLeft = (window as any).__stwSpinsLeft ?? '{{spins_left}}';
            resolved = resolved.replace(/\{\{spins_left\}\}/g, String(spinsLeft));
        }
        if (resolved.includes('{{max_spins}}')) {
            const maxSpins = (window as any).__stwMaxSpins ?? '{{max_spins}}';
            resolved = resolved.replace(/\{\{max_spins\}\}/g, String(maxSpins));
        }

        return resolved;
    };

    // Grid Data Binding: resolve mapped_key from GridElementContext
    const { dataItem } = useGridElementData();
    let rawText = layer.content?.text || 'Text';
    
    if (dataItem && layer.content?.mapped_key) {
        const paths = layer.content.mapped_key.split('.');
        let value: any = dataItem;
        for (const p of paths) {
            if (value && typeof value === 'object') value = value[p];
            else { value = null; break; }
        }
        if (value != null) rawText = String(value);
    }

    // Attempt {{handlebars}} string interpolations if dataItem exists (Fallback/Enhanced Mode)
    if (dataItem && typeof rawText === 'string') {
        rawText = interpolateDataBinding(rawText, dataItem);
    }
    
    const displayText = resolveText(rawText);

    return (
        <div style={{
            // Typography (from Content)
            fontSize: `${scaledFontSize}px`,
            color: layer.content?.textColor || 'black',
            fontWeight: layer.content?.fontWeight || 400,
            textAlign: layer.content?.textAlign || 'left',
            fontFamily: layer.content?.fontFamily ? `'${layer.content.fontFamily}', sans-serif` : 'inherit',
            lineHeight: layer.content?.lineHeight || 1.4,
            letterSpacing: layer.content?.letterSpacing ? safeScale(layer.content.letterSpacing, scale) : 'normal',
            textDecoration: layer.content?.textDecoration || 'none',
            textTransform: layer.content?.textTransform || 'none',
            WebkitTextStroke: (layer.content?.textStrokeWidth && layer.content?.textStrokeWidth > 0)
                ? `${safeScale(layer.content.textStrokeWidth, scale)} ${layer.content.textStrokeColor || '#000000'}`
                : undefined,
            textShadow: textShadow,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',

            // SDK Overflow Parity
            overflow: 'hidden',
            textOverflow: layer.content?.maxLines ? 'ellipsis' : undefined,
            display: layer.content?.maxLines ? '-webkit-box' : 'flex',
            WebkitBoxOrient: layer.content?.maxLines ? 'vertical' : undefined,
            WebkitLineClamp: layer.content?.maxLines || undefined,

            // Box Model (from Style)
            backgroundColor: layer.style?.backgroundColor || 'transparent',
            borderWidth: layer.style?.borderWidth ? `${safeScale(layer.style.borderWidth, scale)}` : 0,
            borderColor: layer.style?.borderColor || 'transparent',
            borderStyle: layer.style?.borderStyle || 'solid',
            borderRadius: layer.style?.borderRadius ? `${safeScale(layer.style.borderRadius, scale)}` : 0,
            opacity: layer.style?.opacity !== undefined ? layer.style.opacity : 1,

            // Layout
            width: '100%',
            height: '100%',
            margin: 0,
            padding: layer.style?.padding ? `${safeScale(layer.style.padding, scale)}` : 0, // Enable padding if set
            boxSizing: 'border-box' as const,
            flexDirection: layer.content?.maxLines ? undefined : 'column',
            outline: 'none',
        }}>
            {/* Inject Custom Font CSS if URL provided */}
            {layer.content?.fontUrl && (
                <style>
                    {`@import url('${layer.content.fontUrl}');`}
                </style>
            )}

            {/* Text Offset Wrapper */}
            {(layer.content?.textOffsetX || layer.content?.textOffsetY) ? (
                <div style={{
                    transform: `translate(${safeScale(layer.content.textOffsetX || 0, scale)}, ${safeScale(layer.content.textOffsetY || 0, scale)})`,
                    width: '100%' // Ensure alignment still works
                }}>
                    {displayText}
                </div>
            ) : (
                displayText
            )}
        </div>
    );
};

