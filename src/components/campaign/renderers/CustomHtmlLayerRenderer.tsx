import React, { useRef } from 'react';
import { Layer } from '@/store/useEditorStore';
import { useGridElementData, interpolateDataBinding } from '@/components/campaign/renderers/GridElementContext';

interface CustomHtmlLayerRendererProps {
    layer: Layer;
    scale?: number;
    scaleY?: number;
}

export const CustomHtmlLayerRenderer: React.FC<CustomHtmlLayerRendererProps> = ({ layer, scale = 1, scaleY = 1 }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const content = layer.content || {};
    const style = layer.style || {};
    const gridData = useGridElementData();

    // Data Binding Resolution
    let htmlContent = content.html || '';
    if (layer.dataBinding) {
        htmlContent = interpolateDataBinding(htmlContent, layer.dataBinding, gridData) as string;
    }

    const cssContent = content.css || '';
    const jsContent = content.javascript || '';
    const renderMode = content.renderMode || 'webview';

    // Safe scale helper
    const safeScale = (val: any, factor: number) => {
        if (val == null) return undefined;
        const strVal = val.toString();
        if (strVal.endsWith('%')) return strVal;
        const num = parseFloat(strVal);
        if (isNaN(num)) return val;
        return `${num * factor}px`;
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        overflow: style.overflow || 'hidden',
        backgroundColor: style.backgroundColor,
        opacity: style.opacity ?? 1,
        borderRadius: safeScale(style.borderRadius, scale),
        border: style.borderWidth ? `${safeScale(style.borderWidth, scale)} solid ${style.borderColor || '#000'}` : undefined,
    };

    // Construct the srcDoc
    const generateSrcDoc = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
                    ${cssContent}
                </style>
                <script>
                    window.ninja = {
                        triggerAction: function(actionName, actionData) {
                            if (window.parent) {
                                window.parent.postMessage({
                                    source: 'ninja-html-layer',
                                    action: actionName,
                                    data: actionData,
                                    layerId: '${layer.id}'
                                }, '*');
                            }
                        },
                        dismiss: function() { this.triggerAction('dismiss', {}); },
                        openUrl: function(url) { this.triggerAction('open_url', { url: url }); }
                    };
                </script>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}</script>
            </body>
            </html>
        `;
    };

    return (
        <div style={containerStyle} className="ninja-custom-html">
            <iframe
                ref={iframeRef}
                srcDoc={generateSrcDoc()}
                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'auto' }}
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                title={layer.name}
            />
        </div>
    );
};
