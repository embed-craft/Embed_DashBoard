// Bundled Fonts - These fonts are pre-cached in the SDK for instant loading
// Adding new fonts here requires updating the SDK's ninja_layer_utils.dart supportedFonts list

export interface SupportedFont {
    value: string;      // Font family name (used in config)
    label: string;      // Display name in dropdown
    category: 'sans-serif' | 'serif' | 'monospace' | 'decorative';
    googleFontsUrl: string;  // For Dashboard preview
}

export const SUPPORTED_FONTS: SupportedFont[] = [
    // Sans-Serif
    { value: 'Roboto', label: 'Roboto', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto' },
    { value: 'Inter', label: 'Inter', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter' },
    { value: 'Poppins', label: 'Poppins', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins' },
    { value: 'Open Sans', label: 'Open Sans', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans' },
    { value: 'Lato', label: 'Lato', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lato' },
    { value: 'Montserrat', label: 'Montserrat', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat' },
    { value: 'Nunito', label: 'Nunito', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito' },
    { value: 'Raleway', label: 'Raleway', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Raleway' },
    { value: 'Ubuntu', label: 'Ubuntu', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Ubuntu' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'sans-serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro' },

    // Serif
    { value: 'Playfair Display', label: 'Playfair Display', category: 'serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display' },
    { value: 'Merriweather', label: 'Merriweather', category: 'serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Merriweather' },
    { value: 'Lora', label: 'Lora', category: 'serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora' },
    { value: 'PT Serif', label: 'PT Serif', category: 'serif', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=PT+Serif' },

    // Monospace
    { value: 'Fira Code', label: 'Fira Code', category: 'monospace', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code' },
    { value: 'Source Code Pro', label: 'Source Code Pro', category: 'monospace', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'monospace', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono' },

    // Decorative
    { value: 'Pacifico', label: 'Pacifico', category: 'decorative', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Pacifico' },
    { value: 'Dancing Script', label: 'Dancing Script', category: 'decorative', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Dancing+Script' },
    { value: 'Lobster', label: 'Lobster', category: 'decorative', googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lobster' },
];

// Helper to get fonts by category
export const getFontsByCategory = (category: SupportedFont['category']) =>
    SUPPORTED_FONTS.filter(f => f.category === category);

// Default font
export const DEFAULT_FONT = SUPPORTED_FONTS[0]; // Roboto
