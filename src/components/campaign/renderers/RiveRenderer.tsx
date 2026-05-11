import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layer } from '@/store/useEditorStore';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useGridElementData } from '@/components/campaign/renderers/GridElementContext';

interface RiveRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
    isActive?: boolean;
}

export const RiveRenderer: React.FC<RiveRendererProps> = ({ layer, scale = 1, scaleY = 1, isActive = false }) => {
    // SDK Parity: Safe Scale Helper (same as LottieRenderer / MediaRenderer)
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const hasExplicitWidth = layer.style?.width || layer.size?.width;
    const hasExplicitHeight = layer.style?.height || layer.size?.height;

    // Grid Data Binding: resolve mapped_key for dynamic rive URL
    const { dataItem } = useGridElementData();
    let riveUrl = layer.content?.riveUrl || '';

    if (dataItem && layer.content?.mapped_key) {
        const paths = layer.content.mapped_key.split('.');
        let value: any = dataItem;
        for (const p of paths) {
            if (value && typeof value === 'object') value = value[p];
            else { value = null; break; }
        }
        if (value != null) riveUrl = String(value);
    }

    const objectFit = layer.style?.objectFit || 'contain';

    // Map objectFit to Rive Fit enum
    let riveFit = Fit.Contain;
    if (objectFit === 'cover') riveFit = Fit.Cover;
    else if (objectFit === 'fill') riveFit = Fit.Fill;
    else if (objectFit === 'none') riveFit = Fit.None;
    else if (objectFit === 'scale-down') riveFit = Fit.ScaleDown;

    // Rive-specific content properties
    const artboardName = layer.content?.artboardName;
    const stateMachineName = layer.content?.stateMachineName;
    const autoPlay = layer.content?.autoPlay ?? true;

    // useRive hook — the core Rive integration
    const { rive, RiveComponent } = useRive(
        riveUrl ? {
            src: riveUrl,
            autoplay: autoPlay && isActive,
            artboard: artboardName,
            stateMachines: stateMachineName ? [stateMachineName] : undefined,
            layout: new Layout({
                fit: riveFit,
                alignment: Alignment.Center,
            }),
        } : null as any,
        { fitCanvasToArtboardHeight: !hasExplicitHeight }
    );

    // Apply state machine inputs when rive loads or inputs change
    useEffect(() => {
        if (!rive || !layer.content?.riveInputs) return;
        const inputs = layer.content.riveInputs;
        Object.entries(inputs).forEach(([name, value]) => {
            try {
                const smName = stateMachineName || rive.stateMachineNames?.[0];
                if (!smName) return;
                const smInputs = rive.stateMachineInputs(smName);
                const input = smInputs?.find((i: any) => i.name === name);
                if (input) {
                    if (typeof value === 'boolean') {
                        input.value = value;
                    } else if (typeof value === 'number') {
                        input.value = value;
                    }
                }
            } catch (e) {
                // Input not found or not yet loaded
            }
        });
    }, [rive, layer.content?.riveInputs, stateMachineName]);

    // Playback controls based on active state (carousel parity with LottieRenderer)
    useEffect(() => {
        if (!rive) return;
        const autoPlay = layer.content?.autoPlay ?? true;
        if (isActive && autoPlay) {
            rive.play();
        } else if (!isActive) {
            rive.pause();
        }
    }, [rive, isActive, layer.content?.autoPlay]);

    // Speed control
    useEffect(() => {
        if (!rive) return;
        // Rive doesn't have a direct setSpeed. We use the playbackSpeed property if available.
        // The rive-react runtime doesn't expose speed directly — but we can track it for Flutter parity.
    }, [rive, layer.content?.speed]);

    if (!riveUrl) {
        return (
            <div
                style={{
                    width: hasExplicitWidth ? '100%' : 100,
                    height: hasExplicitHeight ? '100%' : 100,
                    backgroundColor: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                        ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                        : safeScale(layer.style?.borderRadius || 0, scale),
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21" />
                </svg>
            </div>
        );
    }

    return (
        <div
            draggable={false}
            style={{
                width: hasExplicitWidth ? '100%' : 'auto',
                height: hasExplicitHeight ? '100%' : 'auto',
                display: 'block',
                userSelect: 'none',
                overflow: 'hidden',
                opacity: layer.style?.opacity ?? 1,
                borderRadius: typeof layer.style?.borderRadius === 'object' && layer.style?.borderRadius !== null
                    ? `${safeScale(layer.style.borderRadius.topLeft, scale)} ${safeScale(layer.style.borderRadius.topRight, scale)} ${safeScale(layer.style.borderRadius.bottomRight, scale)} ${safeScale(layer.style.borderRadius.bottomLeft, scale)}`
                    : safeScale(layer.style?.borderRadius || 0, scale),
                aspectRatio: layer.style?.aspectRatio,
                filter: typeof layer.style?.filter === 'object'
                    ? [
                        layer.style.filter.blur ? `blur(${safeScale(layer.style.filter.blur, scale)})` : '',
                        layer.style.filter.brightness ? `brightness(${layer.style.filter.brightness}%)` : '',
                        layer.style.filter.contrast ? `contrast(${layer.style.filter.contrast}%)` : '',
                        layer.style.filter.grayscale ? `grayscale(${layer.style.filter.grayscale}%)` : ''
                    ].filter(Boolean).join(' ')
                    : layer.style?.filter,
                boxShadow: layer.style?.shadowEnabled
                    ? `${safeScale(0, scale)} ${safeScale(layer.style.shadowOffsetY || 4, scale)} ${safeScale(layer.style.shadowBlur || 0, scale)} ${safeScale(layer.style.shadowSpread || 0, scale)} ${layer.style.shadowColor || '#000000'}`
                    : layer.style?.boxShadow,
            }}
        >
            <RiveComponent
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
        </div>
    );
};
