import React from 'react';
import { ClipboardList } from 'lucide-react';

export const SurveyQuestionsStep: React.FC = () => {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-center bg-gray-50 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-lg w-full">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ClipboardList size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Questions Builder</h2>
                <p className="text-gray-500 mb-8">
                    Design your questions, define logic branching, and preview how your survey looks. The working logic is yet to be implemented.
                </p>
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 font-medium">
                    Question editor will be injected here.
                </div>
            </div>
        </div>
    );
};
