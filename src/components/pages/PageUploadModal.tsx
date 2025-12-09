import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Need to ensure this is installed or use fallback
import { apiClient } from '@/lib/api';
import { theme } from '@/styles/design-tokens';
import { toast } from 'sonner';

interface PageUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const PageUploadModal: React.FC<PageUploadModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [step, setStep] = useState<'loading' | 'qr' | 'success'>('loading');
    const [deepLink, setDeepLink] = useState('');
    // const [sessionToken, setSessionToken] = useState(''); // If we need it for polling manually
    const [pollToken, setPollToken] = useState('');

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (open) {
            startSession();
        } else {
            // Reset state on close
            setStep('loading');
            setDeepLink('');
            setPollToken('');
        }

        return () => clearInterval(pollInterval);
    }, [open]);

    // Polling Effect
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (step === 'qr' && pollToken) {
            intervalId = setInterval(async () => {
                try {
                    const res = await apiClient.pollPageStatus(pollToken);
                    if (res.status === 'completed') {
                        setStep('success');
                        toast.success('Page uploaded successfully!');
                        onSuccess();
                        clearInterval(intervalId);
                        // Close after delay
                        setTimeout(() => onOpenChange(false), 1500);
                    }
                } catch (error) {
                    console.error('Polling error', error);
                }
            }, 3000); // Poll every 3 seconds
        }

        return () => clearInterval(intervalId);
    }, [step, pollToken]);

    const startSession = async () => {
        try {
            setStep('loading');
            const res = await apiClient.createPageSession();
            const { token, deepLink } = res;
            setDeepLink(deepLink);
            setPollToken(token);
            setStep('qr');
        } catch (error) {
            console.error('Failed to create session', error);
            toast.error('Failed to generate QR Code');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Capture Page</DialogTitle>
                    <DialogDescription>
                        Scan this QR code with your app to capture a screenshot.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
                    {step === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Generating secure session...</p>
                        </div>
                    )}

                    {step === 'qr' && (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                {/* Use img tag with api for QR if lib not available, OR use a library. 
                                    Assuming qrcode.react might need install. 
                                    Safest fallback is an external API for now to avoid install errors in this turn.
                                    Actually I'll use a placeholder or assume library is standard. 
                                    Let's use a simple public QR API for stability in this generated code 
                                    or <QRCodeSVG /> assuming I'll install it.
                                    Let's try to include qrcode.react in `package.json` logic later.
                                    For now, I'll use a reliable QR API to avoid 'module not found' if I forget to install.
                                */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deepLink)}`}
                                    alt="Scan QR"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-900">
                                    <Smartphone size={16} />
                                    <span>Open App & Scan</span>
                                </div>
                                <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                                    Ensure you are logged in to the same organization on the app.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                <Loader2 size={12} className="animate-spin" />
                                Listening for upload...
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Capture Complete!</h3>
                            <p className="text-sm text-gray-500">Your page has been uploaded.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PageUploadModal;
