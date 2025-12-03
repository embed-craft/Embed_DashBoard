export interface DevicePreset {
    id: string;
    name: string;
    category: 'ios' | 'android';
    width: number;
    height: number;
    notchType: 'none' | 'notch' | 'dynamic-island' | 'punch-hole';
    borderRadius: number;
    bezelSize: number;
    frameColor: string;
    statusBarHeight: number;
}

export const DEVICE_PRESETS: DevicePreset[] = [
    {
        id: 'iphone14pro',
        name: 'iPhone 14 Pro',
        category: 'ios',
        width: 393,
        height: 852,
        notchType: 'dynamic-island',
        borderRadius: 47,
        bezelSize: 3,
        frameColor: '#1d1d1f',
        statusBarHeight: 54,
    },
    {
        id: 'iphone se',
        name: 'iPhone SE',
        category: 'ios',
        width: 375,
        height: 667,
        notchType: 'none',
        borderRadius: 0,
        bezelSize: 0,
        frameColor: '#1d1d1f',
        statusBarHeight: 20,
    },
    {
        id: 'pixel7',
        name: 'Pixel 7',
        category: 'android',
        width: 412,
        height: 915,
        notchType: 'punch-hole',
        borderRadius: 32,
        bezelSize: 2,
        frameColor: '#2d2d2d',
        statusBarHeight: 24,
    },
    {
        id: 'galaxy-s23',
        name: 'Galaxy S23',
        category: 'android',
        width: 360,
        height: 780,
        notchType: 'punch-hole',
        borderRadius: 28,
        bezelSize: 2,
        frameColor: '#000000',
        statusBarHeight: 24,
    },
];

export const DEFAULT_DEVICE_ID = 'iphone14pro';
