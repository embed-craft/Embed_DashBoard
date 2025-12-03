import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

export const PlatformSelector: React.FC = () => {
    const { currentCampaign, updateDisplayRules } = useEditorStore();

    if (!currentCampaign) return null;

    const platforms = currentCampaign.displayRules?.platforms || [];

    const togglePlatform = (platform: 'web' | 'ios' | 'android') => {
        const newPlatforms = platforms.includes(platform)
            ? platforms.filter(p => p !== platform)
            : [...platforms, platform];

        updateDisplayRules({ platforms: newPlatforms });
    };

    return (
        <div className="flex gap-6">
            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => togglePlatform('web')}>
                <Checkbox checked={platforms.includes('web')} onCheckedChange={() => togglePlatform('web')} id="platform-web" />
                <Label htmlFor="platform-web" className="cursor-pointer flex items-center gap-2 font-medium">
                    <Monitor className="w-4 h-4 text-gray-500" />
                    Web
                </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => togglePlatform('ios')}>
                <Checkbox checked={platforms.includes('ios')} onCheckedChange={() => togglePlatform('ios')} id="platform-ios" />
                <Label htmlFor="platform-ios" className="cursor-pointer flex items-center gap-2 font-medium">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    iOS
                </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => togglePlatform('android')}>
                <Checkbox checked={platforms.includes('android')} onCheckedChange={() => togglePlatform('android')} id="platform-android" />
                <Label htmlFor="platform-android" className="cursor-pointer flex items-center gap-2 font-medium">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    Android
                </Label>
            </div>
        </div>
    );
};
