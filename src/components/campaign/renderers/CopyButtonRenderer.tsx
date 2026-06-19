import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { Copy, Layout, FileText, Link as LinkIcon, Check } from 'lucide-react';
import { useGridElementData, interpolateDataBinding } from '@/components/campaign/renderers/GridElementContext';

interface CopyButtonRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    colors?: any; // strict typing if available
}

export const CopyButtonRenderer: React.FC<CopyButtonRendererProps> = ({
    layer,
    scale = 1,
    scaleY = 1,
    colors
}) => {
    // Helper for safe scaling
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        if (typeof val === 'string' && (val.endsWith('%') || val.endsWith('vh') || val.endsWith('vw'))) return val;
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const style = layer.style || {};
    const content = layer.content || {};

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

    const { dataItem } = useGridElementData();
    const rawCopyText = dataItem ? interpolateDataBinding(content.copyText, dataItem) : content.copyText;
    const resolvedCopyText = resolveText(rawCopyText);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (resolvedCopyText) {
            navigator.clipboard.writeText(resolvedCopyText)
                .then(() => {
                    if (content.showToast) {
                        toast.success(content.toastMessage || 'Copied to clipboard!');
                    }
                })
                .catch((err) => {
                    console.error('Failed to copy keys:', err);
                    toast.error('Failed to copy');
                });
        }
    };

    const triggerMode = content.copyTrigger || 'anywhere';

    return (
        <button
            onClick={triggerMode === 'anywhere' ? handleClick : undefined}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                // padding/margin handled below dynamically
                outline: 'none',
                cursor: triggerMode === 'anywhere' ? 'pointer' : 'default', // Only show pointer if whole button is clickable
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Text left, icon right
                gap: safeScale(8, scale),
                // Flatten style props that apply to the button itself
                backgroundColor: style.backgroundColor || 'transparent',
                borderRadius: safeScale(style.borderRadius ?? 6, scale),
                borderWidth: safeScale(style.borderWidth ?? 1, scale),
                borderColor: style.borderColor || '#D1D5DB',
                borderStyle: style.borderStyle || 'solid',
                // Apply shadow if any
                boxShadow: style.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(style.shadowOffsetY ?? 4, scale)} ${safeScale(style.shadowBlur || 0, scale)} ${safeScale(style.shadowSpread || 0, scale)} ${style.shadowColor || '#000000'}`
                    : style.boxShadow,
                color: content.textColor || colors?.text?.primary || '#000000', // Ensure text color
                fontFamily: content.fontFamily || style.fontFamily || 'inherit',
                fontSize: safeScale(style.fontSize || 14, scale),
                fontWeight: style.fontWeight,
                boxSizing: 'border-box', // Ensure padding doesn't overflow
                // Apply spacing
                // Apply spacing (granular support)
                padding: (() => {
                    const pTop = style.paddingTop ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pRight = style.paddingRight ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 0);
                    const pBottom = style.paddingBottom ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pLeft = style.paddingLeft ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 0);

                    return `${safeScale(pTop, scaleY)} ${safeScale(pRight, scale)} ${safeScale(pBottom, scaleY)} ${safeScale(pLeft, scale)}`;
                })(),
                margin: 0,
            }}
            title={triggerMode === 'anywhere' ? "Click to copy" : ""}
        >
            <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1, // Take available space
                textAlign: 'left',
                // Apply Text Offsets
                transform: `translate(${safeScale(style.textOffsetX || 0, scale)}, ${safeScale(style.textOffsetY || 0, scale)})`,
                display: 'block', // Ensure transform works
            }}>
                {resolvedCopyText || 'Copy Code'}
            </span>

            {/* Icon Rendering */}
            <div
                onClick={triggerMode === 'icon' ? handleClick : undefined}
                style={{
                    // Apply Icon Offsets
                    transform: `translate(${safeScale(style.iconOffsetX || 0, scale)}, ${safeScale(style.iconOffsetY || 0, scale)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: triggerMode === 'icon' ? 'pointer' : 'inherit', // Explicit pointer if icon is trigger
                    padding: '4px', // Add slight hit area padding if it is the trigger? optional
                    pointerEvents: triggerMode === 'icon' ? 'auto' : 'inherit'
                }}>
                {(() => {
                    const iconName = content.copyIcon || 'Copy';
                    const size = safeScale(16, scale); // Common size
                    const IconProps = { size, strokeWidth: 2 };

                    switch (iconName) {
                        case 'Clipboard': return <Layout {...IconProps} />; // FIX: Use Layout icon to match Editor
                        case 'FileText': return <FileText {...IconProps} />;
                        case 'Link': return <LinkIcon {...IconProps} />;
                        // case 'Share': return <Share {...IconProps} />; // Share not imported, keep generic if needed or add
                        case 'Check': return <Check {...IconProps} />;
                        case 'Copy':
                        default:
                            return <Copy size={size} />;
                    }
                })()}
            </div>
        </button>
    );
};
