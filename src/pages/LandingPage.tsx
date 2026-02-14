import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-black to-purple-950/20 pointer-events-none" />

            <div className="z-10 flex flex-col items-center max-w-4xl w-full text-center">

                {/* Logo Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1], // Custom calm cubic bezier
                        delay: 0.2
                    }}
                    className="mb-8 relative"
                >
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full scale-150 animate-pulse" />

                    <img
                        src="/logo.png"
                        alt="Embed Craft Logo"
                        className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10"
                    />
                </motion.div>

                {/* Title Animation */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
                >
                    Embed Craft
                </motion.h1>

                {/* Subtitle/Story Animation */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
                >
                    Empowering your digital presence with seamless embedded experiences.
                    Craft stunning nudges, stories, and interactive layers that captivate your audience without writing a single line of complex code.
                </motion.p>

                {/* CTA Button Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                >
                    <Button
                        onClick={() => navigate('/')} // Navigate to dashboard
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-6 rounded-full group"
                    >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            </div>

            {/* Ambient Particles (Simple CSS or Framer Motion variants could go here for extra polish) */}
            <div className="absolute bottom-10 left-0 right-0 text-center text-gray-600 text-sm">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    © {new Date().getFullYear()} Embed Craft
                </motion.span>
            </div>
        </div>
    );
};

export default LandingPage;
