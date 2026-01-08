import React, { useState } from 'react';
import { AlertCircle, BarChart3 } from 'lucide-react';

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
    const [customMode, setCustomMode] = useState(
        !PRIORITY_LEVELS.some(level => level.value === value)
    );

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Campaign Priority
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    When multiple campaigns match the same event, higher priority shows first in rotation
                </p>
            </div>

            <div className="space-y-3">
                {PRIORITY_LEVELS.map((level) => (
                    <label
                        key={level.value}
                        className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <input
                            type="radio"
                            name="priority"
                            value={level.value}
                            checked={value === level.value && !customMode}
                            onChange={() => {
                                setCustomMode(false);
                                onChange(level.value);
                            }}
                            className="text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {level.label}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">({level.value})</span>
                                <span>{level.icon}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {level.description}
                            </p>
                        </div>
                    </label>
                ))}

                {/* Custom Priority Option */}
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center space-x-3">
                        <input
                            type="radio"
                            name="priority"
                            checked={customMode}
                            onChange={() => setCustomMode(true)}
                            className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">Custom</span>
                    </label>
                    {customMode && (
                        <div className="mt-3 flex items-center space-x-3">
                            <input
                                type="number"
                                min="1"
                                max="999"
                                value={value}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value) || 1;
                                    setCustomMode(true);
                                    onChange(newValue);
                                }}
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                placeholder="1-999"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Enter custom priority (1-999)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Round-Robin Display:</strong> Campaigns with the same trigger event
                        will rotate in order of priority (highest → lowest → repeat).
                    </div>
                </div>
            </div>
        </div>
    );
}
