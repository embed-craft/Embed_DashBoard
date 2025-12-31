import {
    LayoutGrid,
    ArrowLeft,
    Square,
    Layout,
    MessageCircle,
    MessageSquare,
    Smartphone,
    Film,
    Target,
    Flame,
    ClipboardList,
    Sparkles
} from 'lucide-react';

export interface ScratchCardConfig {
    width: number | string;
    height: number | string;
    borderRadius: number;

    // Positioning
    position?: 'center' | 'bottom' | 'custom';
    x?: number;
    y?: number;

    // Cover
    coverType: 'color' | 'image';
    coverColor: string;
    coverImage?: string;

    // Mechanics
    scratchType: 'brush' | 'coin';
    scratchSize: number;
    revealThreshold: number; // 0-100

    // Celebration
    autoReveal: boolean;
    completionAnimation?: {
        enabled: boolean;
        type: 'confetti' | 'video' | 'fireworks' | 'money';
        videoUrl?: string;
        loop?: boolean;
    };

    // Container Background
    backgroundColor?: string;
    backgroundImageUrl?: string;
    backgroundSize?: 'cover' | 'contain' | 'fill';

    // Overlay (Backdrop)
    overlay: {
        enabled: boolean;
        opacity: number;
        color: string;
        dismissOnClick: boolean;
        blur?: number;
    };

    // Editor State
    previewRevealed?: boolean;

    // Logic/Area
    scratchArea?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}


export interface DesignType {
    id: string;
    label: string;
    description: string;
    icon: any;
    category: 'all' | 'bottom-sheet' | 'modal' | 'banner' | 'full-page' | 'floater' | 'pip' | 'scratchcard';
    color: string;
    bg?: string;
    iconBg?: string;
    iconColor?: string;
}

export interface Template {
    id: string;
    label: string;
    description: string;
    typeId: string;
    thumbnail?: string; // URL or placeholder
}

export const DESIGN_TYPES: DesignType[] = [
    {
        id: 'fullpage',
        label: 'Full Page',
        description: 'Immersive full-screen experience',
        icon: LayoutGrid,
        category: 'full-page',
        color: '#8B5CF6',
        bg: '#F5F3FF',
        iconBg: '#DDD6FE',
        iconColor: '#7C3AED'
    },
    {
        id: 'bottomsheet',
        label: 'Bottom Sheet',
        description: 'Slide-up panel from bottom',
        icon: ArrowLeft, // We'll rotate this in UI
        category: 'bottom-sheet',
        color: '#6366F1',
        bg: '#EEF2FF',
        iconBg: '#E0E7FF',
        iconColor: '#4F46E5'
    },
    {
        id: 'modal',
        label: 'Modal',
        description: 'Centered popup dialog',
        icon: Square,
        category: 'modal',
        color: '#EC4899',
        bg: '#FDF2F8',
        iconBg: '#FCE7F3',
        iconColor: '#DB2777'
    },
    {
        id: 'banner',
        label: 'Banner',
        description: 'Top or bottom notification bar',
        icon: Layout,
        category: 'banner',
        color: '#F59E0B',
        bg: '#FFFBEB',
        iconBg: '#FEF3C7',
        iconColor: '#D97706'
    },
    {
        id: 'floater',
        label: 'Floater',
        description: 'Floating action button or widget',
        icon: MessageCircle,
        category: 'floater',
        color: '#10B981',
        bg: '#ECFDF5',
        iconBg: '#D1FAE5',
        iconColor: '#059669'
    },
    {
        id: 'pip',
        label: 'PIP Video',
        description: 'Picture-in-Picture video player',
        icon: Film,
        category: 'pip',
        color: '#F43F5E',
        bg: '#FFF1F2',
        iconBg: '#FFE4E6',
        iconColor: '#E11D48'
    },
    {
        id: 'scratchcard',
        label: 'Scratch Card',
        description: 'Scratch to reveal prize',
        icon: Sparkles,
        category: 'scratchcard',
        color: '#EAB308', // Yellow/Gold
        bg: '#FEF9C3',
        iconBg: '#FEF08A',
        iconColor: '#CA8A04'
    },
];

export const DESIGN_CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'bottom-sheet', label: 'Bottom sheet' },
    { id: 'modal', label: 'Modal' },
    { id: 'banner', label: 'Banner' },
    { id: 'full-page', label: 'Full page' },
    { id: 'floater', label: 'Floater' },
    { id: 'pip', label: 'PIP' },
];

export const TEMPLATES: Template[] = [
    { id: 't1', label: 'Welcome Modal', description: 'Standard welcome message', typeId: 'modal' },
    { id: 't2', label: 'Feature Announcement', description: 'Bottom sheet for new features', typeId: 'bottomsheet' },
    { id: 't3', label: 'Discount Banner', description: 'Top banner for sales', typeId: 'banner' },
    { id: 't4', label: 'Feedback Form', description: 'Full page survey', typeId: 'fullpage' },
    { id: 't5', label: 'Support Chat', description: 'Floating chat button', typeId: 'floater' },
    { id: 't6', label: 'Newsletter Signup', description: 'Modal for email collection', typeId: 'modal' },
];
