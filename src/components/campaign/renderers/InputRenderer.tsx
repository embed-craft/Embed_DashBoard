import React from 'react';
import { Layer } from '@/store/useEditorStore';

interface InputRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    onInterfaceAction?: (action: any) => void;
}

export const InputRenderer: React.FC<InputRendererProps> = ({ layer, scale = 1, scaleY = 1, onInterfaceAction }) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [value, setValue] = React.useState('');
    const [validationError, setValidationError] = React.useState<string | null>(null);

    // DEBUG: Log layer action status
    // console.log(`[InputRenderer:${layer.id}] Action Check:`, { ... });

    // Helper for safe scaling
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        if (typeof val === 'string' && (val.endsWith('%') || val.endsWith('vh') || val.endsWith('vw'))) return val;
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Resolve styles with defaults - SCALED
    const fontSize = safeScale(layer.content?.fontSize || 14, scale);
    const textColor = layer.content?.textColor || '#111827';
    const backgroundColor = layer.style?.backgroundColor || '#FFFFFF';
    const borderRadius = safeScale(layer.style?.borderRadius || 6, scale);
    const borderWidth = safeScale(layer.style?.borderWidth ?? 1, scale);
    const borderStyle = layer.style?.borderStyle || 'solid';

    // ERROR STATE LOGIC:
    const hasError = !!validationError;
    const errorColor = layer.style?.errorColor || '#ef4444';
    const focusColor = layer.style?.focusBorderColor || '#6366f1';

    const borderColor = hasError
        ? errorColor
        : isFocused
            ? focusColor
            : (layer.style?.borderColor || '#D1D5DB');

    // Padding logic: Support shorthand string OR broken down props - SCALED
    const pTop = layer.style?.paddingTop ?? layer.style?.paddingVertical ?? 10;
    const pRight = layer.style?.paddingRight ?? layer.style?.paddingHorizontal ?? 12;
    const pBottom = layer.style?.paddingBottom ?? layer.style?.paddingVertical ?? 10;
    const pLeft = layer.style?.paddingLeft ?? layer.style?.paddingHorizontal ?? 12;

    const padding = `${safeScale(pTop, scaleY)} ${safeScale(pRight, scale)} ${safeScale(pBottom, scaleY)} ${safeScale(pLeft, scale)}`;

    // Text & Font
    const textAlign = (layer.style?.textAlign as any) || 'left';
    const fontWeight = layer.style?.fontWeight || 'normal';
    const fontFamily = layer.content?.fontFamily || 'inherit';

    // Effects
    const opacity = layer.style?.opacity ?? 1;
    const boxShadow = layer.style?.boxShadow || 'none';

    // Keyboard Type Mapping
    const getInputMode = (type?: string) => {
        switch (type) {
            case 'emailAddress': return 'email';
            case 'number': return 'numeric';
            case 'phone': return 'tel';
            case 'url': return 'url';
            default: return 'text';
        }
    };

    const isMultiline = layer.content?.inputType === 'multiline';
    const InputComponent = isMultiline ? 'textarea' : 'input';

    const placeholderColor = layer.style?.placeholderColor || '#9ca3af';

    const validate = (): boolean => {
        const required = layer.content?.required;
        const regexPattern = layer.content?.validationRegex;
        const errorMsg = layer.content?.errorMessage || 'Invalid input';

        // 1. Check Required
        if (required && !value.trim()) {
            setValidationError(errorMsg || 'Field is required');
            return false;
        }

        // 2. Check Regex
        if (regexPattern && value) {
            try {
                const regex = new RegExp(regexPattern);
                if (!regex.test(value)) {
                    setValidationError(errorMsg);
                    return false;
                }
            } catch (e) {
                console.warn('Invalid regex pattern:', regexPattern);
            }
        }

        setValidationError(null);
        return true;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            opacity,
            fontFamily
        }}>
            {/* Dynamic Placeholder Color Style - SCALED */}
            <style>
                {`
                    #input-${layer.id}::placeholder {
                        color: ${placeholderColor} !important;
                        opacity: 1; 
                        font-size: ${fontSize};
                    }
                `}
            </style>

            {/* Label - SCALED */}
            {layer.content?.label && (
                <label style={{
                    fontSize: safeScale(layer.style?.labelFontSize || 12, scale),
                    fontWeight: layer.style?.labelFontWeight || 500,
                    marginBottom: safeScale(4, scaleY),
                    color: layer.style?.labelColor || '#374151',
                    textAlign: 'left',
                    display: 'block',
                    lineHeight: '1.4',
                    fontFamily: 'inherit',
                    flexShrink: 0,
                }}>
                    {layer.content.label}
                    {layer.content?.required && (
                        <span style={{ color: errorColor, marginLeft: safeScale(2, scale) }}>*</span>
                    )}
                </label>
            )}

            {/* Input Element Wrapper for Suffix Button - SCALED */}
            <div style={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                flex: 1,
                backgroundColor,
                borderRadius: borderRadius,
                borderWidth: borderWidth,
                borderStyle,
                borderColor,
                boxShadow: layer.style?.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale((layer.style.shadowOffsetY === 0) ? 4 : (layer.style.shadowOffsetY || 4), scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                    : boxShadow,
                boxSizing: 'border-box',
                transition: 'all 0.2s ease-in-out',
            }}>
                <InputComponent
                    id={`input-${layer.id}`}
                    key={layer.id}
                    type={!isMultiline ? (layer.content?.inputType || 'text') : undefined}
                    placeholder={layer.content?.placeholder || 'Enter text...'}
                    inputMode={getInputMode(layer.content?.keyboardType)}
                    value={value}
                    onChange={(e: any) => {
                        setValue(e.target.value);
                        if (validationError) setValidationError(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        width: '100%',
                        flex: 1,
                        minHeight: isMultiline ? safeScale(60, scaleY) : safeScale(36, scaleY),
                        padding,
                        paddingLeft: layer.style?.paddingLeft || (padding as any)?.left || safeScale(10, scale),
                        paddingRight: layer.content?.showSubmitButton ? safeScale(40, scale) : ((padding as any)?.right || safeScale(12, scale)),

                        borderRadius: borderRadius,
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        boxShadow: 'none',

                        fontSize: fontSize,
                        color: textColor,
                        fontWeight,
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        resize: 'none',

                        transform: `translate(${safeScale(layer.style?.textOffsetX || 0, scale)}, ${safeScale(layer.style?.textOffsetY || 0, scale)})`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Submit Button Suffix - SCALED */}
                {layer.content?.showSubmitButton && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!validate()) return;
                            const rootAction = (layer as any).action;
                            const contentAction = layer.content?.action;
                            const actionToTrigger = rootAction || contentAction;

                            if (onInterfaceAction && actionToTrigger && actionToTrigger.type !== 'none') {
                                onInterfaceAction(actionToTrigger);
                            } else {
                                console.log('Submit Action Clicked (No Handler or None Type):', actionToTrigger);
                            }
                        }}
                        style={{
                            position: 'absolute',
                            right: safeScale(8, scale),
                            top: '50%',
                            transform: `translate(calc(0px + ${safeScale(layer.style?.iconOffsetX || 0, scale)}), calc(-50% + ${safeScale(layer.style?.iconOffsetY || 0, scale)}))`,
                            cursor: 'pointer',
                            padding: safeScale(6, scale),
                            borderRadius: safeScale(4, scale),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isFocused ? focusColor : '#9CA3AF',
                            transition: 'color 0.2s',
                            zIndex: 10
                        }}
                    >
                        {(!layer.content.submitIcon || layer.content.submitIcon === 'Send') && (
                            <svg width={safeScale(18, scale)} height={safeScale(18, scale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        )}
                        {layer.content.submitIcon === 'ArrowRight' && (
                            <svg width={safeScale(18, scale)} height={safeScale(18, scale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        )}
                        {layer.content.submitIcon === 'Check' && (
                            <svg width={safeScale(18, scale)} height={safeScale(18, scale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                        {layer.content.submitIcon === 'Search' && (
                            <svg width={safeScale(18, scale)} height={safeScale(18, scale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        )}
                        {layer.content.submitIcon === 'Plus' && (
                            <svg width={safeScale(18, scale)} height={safeScale(18, scale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        )}
                    </div>
                )}
            </div>

            {/* Helper Text - SCALED */}
            {layer.content?.helperText && !hasError && (
                <span style={{
                    fontSize: safeScale(11, scale),
                    marginTop: safeScale(4, scaleY),
                    color: layer.style?.helperColor || '#6B7280',
                    textAlign: 'left',
                    display: 'block',
                    lineHeight: '1.4',
                    flexShrink: 0,
                }}>
                    {layer.content.helperText}
                </span>
            )}

            {/* Validation Error Preview - SCALED */}
            {hasError && (
                <span style={{
                    fontSize: safeScale(11, scale),
                    color: errorColor,
                    marginTop: safeScale(4, scaleY),
                    textAlign: 'left',
                    display: 'block',
                    lineHeight: '1.4',
                    flexShrink: 0,
                }}>
                    {validationError}
                </span>
            )}
        </div>
    );
};
