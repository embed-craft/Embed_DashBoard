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

    // STW Placeholder replacement
    const resolveText = (text: string): string => {
        if (!text || !text.includes('{{')) return text;
        let resolved = text;

        const result = (window as any).__stwResult;
        
        // Spin counter placeholders
        if (resolved.includes('{{spins_left}}')) {
            const spinsLeft = (window as any).__stwSpinsLeft ?? '5';
            resolved = resolved.replace(/\{\{spins_left\}\}/g, String(spinsLeft));
        }
        if (resolved.includes('{{max_spins}}')) {
            const maxSpins = (window as any).__stwMaxSpins ?? '5';
            resolved = resolved.replace(/\{\{max_spins\}\}/g, String(maxSpins));
        }

        const getPropValue = (obj: any, keyName: string) => {
            if (!obj) return undefined;
            if (obj[keyName] !== undefined) return obj[keyName];
            
            // Special coupon_code checks
            if (keyName === 'coupon_code') {
                return obj.couponCode ?? obj.code ?? obj.couponConfig?.code ?? obj.couponConfig?.bulkCodes?.[0] ?? obj.coupon_code;
            }
            if (keyName === 'icon' || keyName === 'iconUrl' || keyName === 'icon_url' || keyName === 'imageUrl' || keyName === 'image_url') {
                return obj.iconUrl ?? obj.icon ?? obj.imageUrl ?? obj.image_url ?? obj.icon_url ?? obj.couponConfig?.iconUrl;
            }

            // Check under nested configs
            if (obj.couponConfig && obj.couponConfig[keyName] !== undefined) return obj.couponConfig[keyName];
            if (obj.pointsConfig && obj.pointsConfig[keyName] !== undefined) return obj.pointsConfig[keyName];
            if (obj.featureConfig && obj.featureConfig[keyName] !== undefined) return obj.featureConfig[keyName];

            // Support snake_case to camelCase fallback
            const camelKey = keyName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            if (obj[camelKey] !== undefined) return obj[camelKey];
            
            // Check camelCase under nested configs
            if (obj.couponConfig && obj.couponConfig[camelKey] !== undefined) return obj.couponConfig[camelKey];
            if (obj.pointsConfig && obj.pointsConfig[camelKey] !== undefined) return obj.pointsConfig[camelKey];
            if (obj.featureConfig && obj.featureConfig[camelKey] !== undefined) return obj.featureConfig[camelKey];

            // Map generic value
            if (keyName === 'value') {
                return obj.couponConfig?.couponValue ?? obj.pointsConfig?.amount ?? obj.value;
            }

            return undefined;
        };

        // Generic reward placeholders {{name}}, {{value}}, etc.
        resolved = resolved.replace(/\{\{([^}]+)\}\}/g, (match, prop) => {
            const key = prop.trim();
            if (key === 'spins_left' || key === 'max_spins') return match; // Already handled
            
            // Map legacy placeholders
            const actualKey = key === 'reward_name' || key === 'section_name' ? 'name' : key;
            
            if (result) {
                const val = getPropValue(result, actualKey) ?? getPropValue(result.rewardDetails, actualKey);
                return val !== undefined ? String(val) : '';
            }
            
            // Editor preview fallback when not spun yet
            return `[${actualKey}]`;
        });

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

