import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { PlatformSelector } from './PlatformSelector';
import { AudienceBuilder } from './AudienceBuilder';
import { TriggerBuilder } from './TriggerBuilder';
import { DisplayRules } from './DisplayRules';
import { Separator } from '@/components/ui/separator';

export const TargetingStep: React.FC = () => {
    const { currentCampaign, fetchMetadata } = useEditorStore();

    React.useEffect(() => {
        fetchMetadata();
    }, []);

    if (!currentCampaign) return null;

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-gray-50/50">
            <div className="max-w-4xl mx-auto w-full p-8 space-y-8">

                {/* Section 1: Platform */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Where should this experience run?</h2>
                        <p className="text-sm text-muted-foreground">Choose platforms on which the campaigns should go live.</p>
                    </div>
                    <PlatformSelector />
                </section>

                {/* Section 2: Audience (Who) */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Who will see this campaign?</h2>
                        <p className="text-sm text-muted-foreground">Decide who will see this campaign.</p>
                    </div>
                    <AudienceBuilder />
                </section>

                {/* Section 3: Trigger (When) */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">When will they see this campaign?</h2>
                        <p className="text-sm text-muted-foreground">Decide what events must the user do to qualify for the campaign.</p>
                    </div>
                    <TriggerBuilder />
                </section>

                {/* Section 4: Display Rules */}
                <section className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Campaign Display Rules</h2>
                        <p className="text-sm text-muted-foreground">Control when and how often users see this campaign.</p>
                    </div>
                    <DisplayRules />
                </section>

            </div>
        </div>
    );
};
