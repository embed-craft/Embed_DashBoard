import React, { useEffect, useState, useMemo } from 'react';
import { Layer } from '@/store/useEditorStore';

interface CountdownRendererProps {
    layer: Layer;
    scale?: number;
}

export const CountdownRenderer: React.FC<CountdownRendererProps> = ({ layer, scale = 1 }) => {
    const { content = {}, style = {} } = layer;

    // SDK Parity: Safe Scale Helper (from ButtonRenderer)
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    // Config
    const targetDate = content.targetDate ? new Date(content.targetDate).getTime() : 0;
    const preset = content.preset || 'digital';

    // Visibility
    const showDays = content.showDays ?? true;
    const showHours = content.showHours ?? true;
    const showMinutes = content.showMinutes ?? true;
    const showSeconds = content.showSeconds ?? true;

    // Labels
    const showLabels = content.showLabels ?? true;
    const labels = content.labels || { days: 'Days', hours: 'Hrs', minutes: 'Mins', seconds: 'Secs' };

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);

    // Initial calculation to avoid flicker
    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(0);
            return;
        }
        const now = new Date().getTime();
        const distance = targetDate - now;
        setTimeLeft(Math.max(0, distance));
    }, [targetDate]);

    // Timer Loop
    useEffect(() => {
        if (!targetDate) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft(0);
                // Handle Expiry
                if (content.onExpiry === 'hide') {
                    // Logic handled by parent or CSS? usually parent. 
                    // For renderer, we just show 0 or handle redirect.
                }
            } else {
                setTimeLeft(distance);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate, content.onExpiry]);

    // Format Parts with Rollover Logic
    const timeParts = useMemo(() => {
        let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        if (!showDays) {
            hours += days * 24;
            days = 0;
        }
        if (!showHours) {
            minutes += hours * 60;
            hours = 0;
        }
        if (!showMinutes) {
            seconds += minutes * 60;
            minutes = 0;
        }

        return { days, hours, minutes, seconds };
    }, [timeLeft, showDays, showHours, showMinutes]);

    const formatNum = (num: number) => num < 10 ? `0${num}` : num;

    // Container Styles
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center', // Default center vertical
        justifyContent: style.justifyContent || 'center', // Flexible horizontal
        gap: safeScale(style.gap ?? 4, scale),

        ...((typeof style.padding === 'object' && style.padding !== null) ? {
            paddingTop: safeScale((style.padding as any).top || 0, scale),
            paddingRight: safeScale((style.padding as any).right || 0, scale),
            paddingBottom: safeScale((style.padding as any).bottom || 0, scale),
            paddingLeft: safeScale((style.padding as any).left || 0, scale)
        } : {
            padding: safeScale(style.padding || 0, scale)
        }),
        borderRadius: safeScale(style.borderRadius || 0, scale),
        borderWidth: safeScale(style.borderWidth || 0, scale),
        borderColor: style.borderColor,
        borderStyle: (style.borderWidth && typeof style.borderWidth === 'number' && style.borderWidth > 0) ? 'solid' : 'none',

        backgroundColor: style.backgroundColor,
        opacity: style.opacity,

        // Font styles (Container level)
        fontFamily: content.fontFamily || 'Inter',
        fontWeight: content.fontWeight || '700',
        fontSize: safeScale(style.fontSize || 32, scale),
        color: style.color || '#000', // Container text color (labels, separators)

        // Shadow - Match SDK (Style props, No X, Manual Construction if enabled)
        boxShadow: style.shadowEnabled
            ? `${safeScale(style.shadowOffsetX || 0, scale)} ${safeScale(style.shadowOffsetY || 4, scale)} ${safeScale(style.shadowBlur || 0, scale)} ${safeScale(style.shadowSpread || 0, scale)} rgba(${parseInt((style.shadowColor || '#000000').slice(1, 3), 16)}, ${parseInt((style.shadowColor || '#000000').slice(3, 5), 16)}, ${parseInt((style.shadowColor || '#000000').slice(5, 7), 16)}, ${style.shadowOpacity ?? 0.25})`
            : (style.boxShadow || 'none'),
    };



    // Unit Renderer
    const renderUnit = (value: number, unitKey: string) => {
        const labelText = labels[unitKey] || unitKey;
        const isRing = preset === 'ring';
        const isBox = preset === 'box'; // Only box preset gets boxes - simple/digital/flip/tiles don't

        let unitBg = content.unitBackgroundColor || content.tileColor;
        if (!unitBg) {
            unitBg = isBox ? '#ffffff' : 'transparent';
        }

        const unitBorderW = safeScale(content.unitBorderWidth ?? (isBox ? 1 : 0), scale);
        const unitRadius = safeScale(content.unitBorderRadius ?? (isBox ? 8 : 0), scale);
        const unitDisplayBorderColor = content.unitBorderColor || '#e5e7eb';

        const labelStyleColor = content.labelColor || (content.digitColor ? content.digitColor : (style.color || '#111827'));

        // --- RING PRESET ---
        if (isRing) {
            const size = (style.fontSize || 32) * 2 * scale; // Ring is 2x font size
            const strokeWidth = 4 * scale;
            const ringColor = content.ringColor || '#6366f1';
            const radius = (size - strokeWidth) / 2;
            const circumference = radius * 2 * Math.PI;

            // Calc Progress
            let max = 60;
            if (unitKey === 'days') max = 30; // Cap days at 30 visually
            if (unitKey === 'hours') max = 24;

            const safeValue = Math.min(value, max);
            const progress = safeValue / max;
            const dashoffset = circumference - (progress * circumference);

            return (
                <div key={unitKey} className="flex flex-col items-center" style={{ gap: safeScale(4, scale) }}>
                    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
                            {/* Background Track */}
                            <circle
                                stroke="#e5e7eb"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                r={radius}
                                cx={size / 2}
                                cy={size / 2}
                            />
                            {/* Progress */}
                            <circle
                                stroke={ringColor}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                r={radius}
                                cx={size / 2}
                                cy={size / 2}
                                strokeDasharray={circumference}
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div className="flex flex-col items-center justify-center" style={{ zIndex: 1, lineHeight: 1, position: 'relative' }}>
                            <span style={{
                                color: content.digitColor || style.color,
                                fontSize: '1em'
                            }}>
                                {formatNum(value)}
                            </span>
                        </div>
                    </div>
                    {showLabels && (
                        <span style={{
                            fontSize: content.labelFontSize ? safeScale(content.labelFontSize, scale) : '0.35em',
                            color: labelStyleColor,
                            opacity: content.labelColor ? 1 : 0.6,
                            marginTop: safeScale(2, scale),
                            textTransform: 'uppercase'
                        }}>
                            {labelText}
                        </span>
                    )}
                </div>
            );
        }

        // --- BOX PRESETS (Digital, Flip, Tiles) ---
        const boxStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',

            // Sizing
            minWidth: isBox ? safeScale((style.fontSize || 32) * 1.5, scale) : 'auto',
            padding: isBox ? `${safeScale(4, scale)} ${safeScale(8, scale)}` : 0,

            // Styling (New Unit Properties)
            backgroundColor: unitBg,
            borderRadius: unitRadius,
            boxShadow: (isBox && content.unitShadowEnabled)
                ? `${safeScale(content.unitShadowX || 0, scale)} ${safeScale(content.unitShadowY || 0, scale)} ${safeScale(content.unitShadowBlur || 0, scale)} ${safeScale(content.unitShadowSpread || 0, scale)} rgba(${parseInt((content.unitShadowColor || '#000000').slice(1, 3), 16)}, ${parseInt((content.unitShadowColor || '#000000').slice(3, 5), 16)}, ${parseInt((content.unitShadowColor || '#000000').slice(5, 7), 16)}, ${content.unitShadowOpacity ?? 0.25})`
                : 'none',
            border: (unitBorderW && parseInt(unitBorderW.toString()) > 0) ? `${unitBorderW} solid ${unitDisplayBorderColor}` : 'none',
        };

        return (
            <div key={unitKey} className="flex flex-col items-center" style={{ gap: safeScale(2, scale) }}>
                <div style={boxStyle} className="countdown-unit">
                    <span style={{
                        lineHeight: 1,
                        color: content.digitColor || style.color,
                        zIndex: 1,
                        position: 'relative'
                    }}>
                        {formatNum(value)}
                    </span>

                    {/* Flip Divider Line */}
                    {preset === 'flip' && (
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '1px',
                            background: 'rgba(0,0,0,0.1)',
                            top: '50%',
                            left: 0,
                            zIndex: 2
                        }} />
                    )}
                </div>

                {/* Labels */}
                {showLabels && (
                    <span style={{
                        fontSize: content.labelFontSize ? safeScale(content.labelFontSize, scale) : '0.4em',
                        textTransform: 'uppercase',
                        color: labelStyleColor,
                        opacity: content.labelColor ? 1 : 0.6,
                        marginTop: isBox ? safeScale(4, scale) : safeScale(2, scale), // Bigger gap for box preset
                    }}>
                        {labelText}
                    </span>
                )}
            </div>
        );
    };

    const Separator = () => (
        <span style={{
            color: content.separatorColor || style.color || '#111827',
            opacity: 0.5,
            transform: `translateY(${safeScale(content.separatorOffsetY || 0, scale)})`,
            display: 'inline-block',
            lineHeight: 1,
            fontSize: content.separatorFontSize ? safeScale(content.separatorFontSize, scale) : 'inherit'
        }}>:</span>
    );

    return (
        <div style={containerStyle}>
            {showDays && (
                <>
                    {renderUnit(timeParts.days, 'days')}
                    {(showHours || showMinutes || showSeconds) && (content.showSeparator !== false) && <Separator />}
                </>
            )}
            {showHours && (
                <>
                    {renderUnit(timeParts.hours, 'hours')}
                    {(showMinutes || showSeconds) && (content.showSeparator !== false) && <Separator />}
                </>
            )}
            {showMinutes && (
                <>
                    {renderUnit(timeParts.minutes, 'minutes')}
                    {showSeconds && (content.showSeparator !== false) && <Separator />}
                </>
            )}
            {showSeconds && (
                renderUnit(timeParts.seconds, 'seconds')
            )}
        </div>
    );
};
