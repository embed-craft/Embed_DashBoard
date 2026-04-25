import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const PRIORITY_LEVELS = [
    { value: 1, label: 'Low', description: 'General info, surveys', icon: '📊' },
    { value: 10, label: 'Medium', description: 'Tips & guides', icon: '📊📊' },
    { value: 50, label: 'High', description: 'Promotions, features', icon: '📊📊📊' },
    { value: 100, label: 'Critical', description: 'Flash sales, alerts', icon: '📊📊📊📊' },
];

interface PrioritySelectorProps {
    value: number;
    onChange: (value: number) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
    const matchedLevel = PRIORITY_LEVELS.find(level => level.value === value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onChange(0); // Temporary state while clearing input
            return;
        }
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            onChange(parsed);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <div className="space-y-3">
                    <Label htmlFor="priority-input" className="text-sm font-medium text-foreground">
                        Campaign Priority Level
                    </Label>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="relative w-full sm:w-32">
                            <Input
                                id="priority-input"
                                type="number"
                                min={1}
                                max={999}
                                value={value || ''}
                                onChange={handleInputChange}
                                className="w-full h-10 font-medium"
                                placeholder="e.g. 50"
                            />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {PRIORITY_LEVELS.map(level => (
                                <Button
                                    key={level.value}
                                    type="button"
                                    variant={value === level.value ? "default" : "outline"}
                                    size="sm"
                                    className={`h-10 px-4 transition-colors ${value !== level.value ? 'bg-background hover:bg-muted text-muted-foreground' : ''}`}
                                    onClick={() => onChange(level.value)}
                                >
                                    {level.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-[24px]">
                        {matchedLevel ? (
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 animate-in fade-in-50">
                                <span className="text-base leading-none">{matchedLevel.icon}</span>
                                <span>{matchedLevel.description}</span>
                            </p>
                        ) : (
                            value > 0 ? (
                                <p className="text-sm text-muted-foreground animate-in fade-in-50">
                                    Custom priority level set.
                                </p>
                            ) : null
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 text-sm bg-muted/40 rounded-lg border border-border">
                <BarChart3 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-medium">Round-Robin Display:</strong> Campaigns matching the same event rotate by priority (highest → lowest → repeat).
                </div>
            </div>
        </div>
    );
}
