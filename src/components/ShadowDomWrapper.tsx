import React, { useRef, useEffect } from 'react';

interface ShadowDomWrapperProps {
    html: string;
    style?: React.CSSProperties;
    className?: string;
}

export const ShadowDomWrapper: React.FC<ShadowDomWrapperProps> = ({ html, style, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null);

    useEffect(() => {
        if (containerRef.current && !shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
        }
    }, []);

    useEffect(() => {
        if (shadowRootRef.current && html) {
            // Clear existing
            shadowRootRef.current.innerHTML = '';

            try {
                // Create range to parse HTML (this allows scripts to be marked as executable)
                const range = document.createRange();

                // FIX: Select the HOST element (containerRef.current) which has a parent in the DOM tree.
                // ShadowRoots do not have a parentNode in the traditional sense, causing 'selectNode' to fail with InvalidNodeTypeError.
                if (containerRef.current) {
                    range.selectNode(containerRef.current);
                    const fragment = range.createContextualFragment(html);
                    shadowRootRef.current.appendChild(fragment);
                } else {
                    // Fallback should rarely happen
                    shadowRootRef.current.innerHTML = html;
                }
            } catch (error) {
                console.error('ShadowDomWrapper Error:', error);
                // Graceful fallback to innerHTML (scripts might not run, but better than crash)
                shadowRootRef.current.innerHTML = html;
            }
        } else if (shadowRootRef.current) {
            shadowRootRef.current.innerHTML = '';
        }
    }, [html]);

    return <div ref={containerRef} style={style} className={className} />;
};
