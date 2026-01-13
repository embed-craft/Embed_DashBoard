import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

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

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (content.copyText) {
            navigator.clipboard.writeText(content.copyText)
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
                    ? `${safeScale(0, scale)} ${safeScale(style.shadowOffsetY || 4, scale)} ${safeScale(style.shadowBlur || 0, scale)} ${safeScale(style.shadowSpread || 0, scale)} ${style.shadowColor || '#000000'}`
                    : style.boxShadow,
                color: content.textColor || colors?.text?.primary || '#000000', // Ensure text color
                fontFamily: style.fontFamily,
                fontSize: safeScale(style.fontSize, scale),
                fontWeight: style.fontWeight,
                boxSizing: 'border-box', // Ensure padding doesn't overflow
                // Apply spacing
                // Apply spacing (granular support)
                padding: (() => {
                    const pTop = style.paddingTop ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pRight = style.paddingRight ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 12);
                    const pBottom = style.paddingBottom ?? style.paddingVertical ?? (style.padding !== undefined ? style.padding : 0);
                    const pLeft = style.paddingLeft ?? style.paddingHorizontal ?? (style.padding !== undefined ? style.padding : 12);

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
                {content.copyText || 'Copy Code'}
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
                    const IconProps = { size: safeScale(16, scale), strokeWidth: 2 };

                    switch (iconName) {
                        case 'Clipboard': return <svg {...IconProps} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
                        case 'FileText': return <svg {...IconProps} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
                        case 'Link': return <svg {...IconProps} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
                        case 'Share': return <svg {...IconProps} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
                        case 'Check': return <svg {...IconProps} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
                        case 'Copy':
                        default:
                            return <Copy size={safeScale(16, scale)} />;
                    }
                })()}
            </div>
        </button>
    );
};
