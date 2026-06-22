import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Props {
    value: string;
    onChange: (value: string) => void;
    handleContentUpdate: (key: string, value: any) => void;
    className?: string;
}

export const TypographyFontFamilySelect: React.FC<Props> = ({ value, onChange, handleContentUpdate, className = "" }) => {
    const [brandFonts, setBrandFonts] = useState<any[]>([]);

    useEffect(() => {
        apiClient.getOrganizationSettings().then(res => {
            const fonts = res.settings?.brandGuidelines?.typography?.fontFamilies;
            if (fonts) {
                setBrandFonts(fonts);
                // Preload fonts into the document via CSS Font Loading API to avoid FOUT
                fonts.forEach((font: any) => {
                    const woff2Url = font.variants?.[0]?.urls?.woff2;
                    if (woff2Url) {
                        if (woff2Url.includes('fonts.googleapis.com/css2')) {
                            const linkId = `gfont-${font.name.replace(/\s+/g, '-')}`;
                            if (!document.getElementById(linkId)) {
                                const link = document.createElement('link');
                                link.id = linkId;
                                link.rel = 'stylesheet';
                                link.href = woff2Url;
                                document.head.appendChild(link);
                            }
                        } else {
                            const fontFace = new FontFace(font.name, `url('${woff2Url}') format('woff2')`);
                            fontFace.load().then((loadedFace) => {
                                document.fonts.add(loadedFace);
                            }).catch(e => console.error("Failed to load custom font", e));
                        }
                    }
                });
            }
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFont = e.target.value;
        onChange(selectedFont);
        
        const brandFont = brandFonts.find(f => f.name === selectedFont);
        if (brandFont) {
            // Enterprise Custom Font
            const fontUrl = brandFont.variants?.[0]?.urls?.woff2 || brandFont.variants?.[0]?.urls?.ttf || '';
            handleContentUpdate('fontUrl', fontUrl);
        } else {
            // Fallback Google Font
            const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, '+')}&display=swap`;
            handleContentUpdate('fontUrl', fontUrl);
        }
    };

    return (
        <div className="relative">
            <select
                value={value}
                onChange={handleChange}
                className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
            >
                {brandFonts.length > 0 && (
                    <optgroup label="Brand Guidelines (Custom)">
                        {brandFonts.map(f => (
                            <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                    </optgroup>
                )}
                <optgroup label="Google Fonts">
                    <option value="Roboto">Roboto</option>
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                </optgroup>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};
