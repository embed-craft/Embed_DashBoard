import React from 'react';
import { DevicePreset } from '@/lib/devicePresets';

interface PhonePreviewProps {
    device: DevicePreset;
    zoom: number;
    showGrid: boolean;
    children: React.ReactNode;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
    device,
    zoom,
    showGrid,
    children,
}) => {
    const scaledWidth = device.width * zoom;
    const scaledHeight = device.height * zoom;

    // Render notch/cutout based on device type
    const renderNotch = () => {
        if (device.notchType === 'dynamic-island') {
            return (
                <div
                    style={{
                        position: 'absolute',
                        top: `${14 * zoom}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: `${126 * zoom}px`,
                        height: `${37 * zoom}px`,
                        backgroundColor: '#000000',
                        borderRadius: `${18 * zoom}px`,
                        zIndex: 1000,
                    }}
                />
            );
        }

        if (device.notchType === 'notch') {
            return (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: `${210 * zoom}px`,
                        height: `${30 * zoom}px`,
                        backgroundColor: '#000000',
                        borderRadius: `0 0 ${18 * zoom}px ${18 * zoom}px`,
                        zIndex: 1000,
                    }}
                />
            );
        }

        if (device.notchType === 'punch-hole') {
            return (
                <div
                    style={{
                        position: 'absolute',
                        top: `${12 * zoom}px`,
                        left: `${(device.width / 2 - 5) * zoom}px`,
                        width: `${10 * zoom}px`,
                        height: `${10 * zoom}px`,
                        backgroundColor: '#000000',
                        borderRadius: '50%',
                        zIndex: 1000,
                    }}
                />
            );
        }

        return null;
    };

    // Render status bar
    const renderStatusBar = () => {
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
        });

        return (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${device.statusBarHeight * zoom}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `0 ${20 * zoom}px`,
                    fontSize: `${12 * zoom}px`,
                    fontWeight: 600,
                    color: '#000000',
                    zIndex: 999,
                }}
            >
                <span>{currentTime}</span>
                <div style={{ display: 'flex', gap: `${4 * zoom}px`, alignItems: 'center' }}>
                    {/* Signal icon */}
                    <div style={{ display: 'flex', gap: `${1 * zoom}px`, alignItems: 'flex-end' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: `${2 * zoom}px`,
                                    height: `${(i * 2) * zoom}px`,
                                    backgroundColor: '#000000',
                                    borderRadius: `${0.5 * zoom}px`,
                                }}
                            />
                        ))}
                    </div>
                    {/* WiFi icon */}
                    <span style={{ fontSize: `${10 * zoom}px` }}>📶</span>
                    {/* Battery icon */}
                    <div
                        style={{
                            width: `${22 * zoom}px`,
                            height: `${11 * zoom}px`,
                            border: `${2 * zoom}px solid #000000`,
                            borderRadius: `${3 * zoom}px`,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                width: '80%',
                                height: '60%',
                                backgroundColor: '#000000',
                                margin: 'auto',
                                borderRadius: `${1 * zoom}px`,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                right: `${-4 * zoom}px`,
                                width: `${2 * zoom}px`,
                                height: `${6 * zoom}px`,
                                backgroundColor: '#000000',
                                borderRadius: `0 ${2 * zoom}px ${2 * zoom}px 0`,
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                backgroundColor: '#F3F4F6',
                position: 'relative',
            }}
        >
            {/* Phone frame */}
            <div
                style={{
                    width: `${scaledWidth + device.bezelSize * 2 * zoom}px`,
                    height: `${scaledHeight + device.bezelSize * 2 * zoom}px`,
                    backgroundColor: device.frameColor,
                    borderRadius: `${device.borderRadius * zoom}px`,
                    padding: `${device.bezelSize * zoom}px`,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
            >
                {/* Screen */}
                <div
                    style={{
                        width: `${scaledWidth}px`,
                        height: `${scaledHeight}px`,
                        backgroundColor: '#FFFFFF',
                        borderRadius: `${Math.max(0, device.borderRadius - device.bezelSize) * zoom}px`,
                        overflow: 'hidden', // Keep hidden to maintain rounded corners
                        position: 'relative',
                    }}
                >
                    {/* Notch/Cutout */}
                    {renderNotch()}

                    {/* Status Bar */}
                    {renderStatusBar()}

                    {/* Grid Overlay */}
                    {showGrid && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                `,
                                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                                pointerEvents: 'none',
                                zIndex: 1001,
                            }}
                        />
                    )}
                    {/* Content */}
                    <div
                        style={{
                            position: 'absolute',
                            top: `${device.statusBarHeight * zoom}px`,
                            left: 0,
                            width: `${device.width}px`, // Unscaled width
                            height: `${device.height - device.statusBarHeight}px`, // Unscaled height
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            overflow: 'hidden', // Clip content that overflows the screen
                            backgroundColor: 'transparent',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
