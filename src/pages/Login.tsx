import React, { useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, Loader2, PlayCircle, Target, Sparkles, LayoutPanelLeft, Code2, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const TypewriterText = ({ text, className, delay = 0, speed = 0.05 }: { text: string, className?: string, delay?: number, speed?: number }) => {
    return (
        <motion.p
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: speed,
                        delayChildren: delay
                    }
                }
            }}
        >
            {text.split("").map((char, index) => (
                <motion.span
                    key={`${char}-${index}`}
                    variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1 }
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.p>
    );
};

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // Assuming useAuth is the correct hook, not useAuthStore as in the instruction snippet
    const navigate = useNavigate();

    // Mouse position for spotlight effect (start at center of screen)
    const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
    const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // The original code had a direct fetch call. The instruction snippet implies the login function
            // from useAuthStore (or useAuth) now handles the API call and token/user storage.
            // I'm adapting the original logic to fit the new structure implied by the instruction's handleSubmit.
            // If the `login` function from `useAuth` already handles navigation and error, this can be simplified.
            // For now, I'll keep the original `login` call and adapt the error/loading handling.

            const apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);

            if (data.user.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate random particles - increased density and intensity
    const particles = Array.from({ length: 200 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.2, // Larger range for more noticeable snow
        duration: Math.random() * 10 + 5, // Slower fall (10-25s)
        delay: Math.random() * 5
    }));

    return (
        <div
            className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden overflow-y-auto relative group scrollbar-hide"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            onMouseMove={handleMouseMove}
        >
            <style>{`
                ::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                * {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
            `}</style>
            {/* Interactive Spotlight Background - Global Fixed */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: useMotionTemplate`radial-gradient(1200px circle at ${mouseX}px ${mouseY}px, rgba(39, 39, 42, 0.4), transparent 80%)`
                }}
            />
            {/* Grid Pattern Overlay - Global Fixed */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

            {/* Snowfall Particles - Global Fixed */}
            <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            x: `${particle.x}vw`,
                            y: -20,
                            opacity: 0
                        }}
                        animate={{
                            y: '100vh',
                            opacity: [0, 1, 1, 0],
                            x: [`${particle.x}vw`, `${particle.x + (Math.random() * 12 - 6)}vw`]
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "linear"
                        }}
                        className="absolute rounded-full bg-white/60"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.4)`
                        }}
                    />
                ))}
            </div>

            {/* Hero Section Container */}
            <div className="min-h-screen w-full flex flex-col lg:flex-row relative z-10">
                {/* Left Side - Abstract Visuals */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-transparent items-center justify-center z-10 pointer-events-none">
                    {/* Animated Abstract Shapes */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-lg"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-[400px] h-[400px] border border-zinc-800 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                        <motion.div
                            animate={{
                                rotate: [360, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-[300px] h-[300px] border border-zinc-700/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                        <div className="relative z-20 flex flex-col items-center text-center p-12">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mb-8"
                            >
                                <motion.div
                                    className="h-32 w-32 rounded-3xl flex items-center justify-center mb-8 mx-auto overflow-hidden"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                >
                                    <img
                                        src={logo}
                                        alt="EmbedCraft Logo"
                                        className="w-full h-full object-contain scale-125 mix-blend-screen filter invert grayscale contrast-200"
                                    />
                                </motion.div>
                                <motion.h1
                                    className="text-5xl font-bold tracking-tighter mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    EmbedCraft
                                </motion.h1>
                                <TypewriterText
                                    text="Intelligent nudges for modern apps. Create beautiful, engaging in-app experiences without writing code."
                                    className="text-xl text-zinc-400 font-light mb-8 max-w-sm mx-auto leading-relaxed"
                                    delay={1.2}
                                />


                            </motion.div>
                        </div>


                    </motion.div>
                </div>

                {/* Global Footer - Contact Info */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center text-center pointer-events-auto">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Need Assistance?</p>
                    <p className="text-zinc-400 font-mono text-sm hover:text-white transition-colors cursor-pointer bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/50">
                        +91 7624945805
                    </p>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-transparent relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-md space-y-8 bg-zinc-950/50 p-10 rounded-3xl border border-zinc-900 backdrop-blur-xl"
                    >
                        <div className="text-center">
                            <div className="flex items-center gap-4 justify-center mb-8 group cursor-default">
                                <motion.div
                                    className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 overflow-hidden"
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                >
                                    <img
                                        src={logo}
                                        alt="EmbedCraft Logo"
                                        className="w-full h-full object-contain scale-150 mix-blend-screen filter invert grayscale contrast-200"
                                    />
                                </motion.div>
                                <span className="text-3xl font-bold tracking-tight text-white group-hover:text-zinc-300 transition-colors duration-300">EmbedCraft</span>
                            </div>    <p className="mt-2 text-sm text-zinc-500">
                                Enter your credentials to access the dashboard
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                            >
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <motion.div
                                    className="group relative"
                                    whileHover="hover"
                                    initial="initial"
                                >
                                    <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Mail className="h-5 w-5 text-zinc-600 group-focus-within:text-white group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <motion.input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            variants={{
                                                initial: { scale: 1 },
                                                hover: { scale: 1.02 }
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-white/50 transition-all duration-300 sm:text-sm relative z-0 group-hover:border-zinc-600 group-hover:bg-zinc-900/80"
                                            placeholder="name@company.com"
                                        />
                                        {/* Animated bottom border glow */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-full"
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            variants={{
                                                hover: { scaleX: 1, opacity: 1 }
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="group relative"
                                    whileHover="hover"
                                    initial="initial"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="block text-xs font-medium text-zinc-500 uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                                            Password
                                        </label>
                                        <div className="text-sm"></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Lock className="h-5 w-5 text-zinc-600 group-focus-within:text-white group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <motion.input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            variants={{
                                                initial: { scale: 1 },
                                                hover: { scale: 1.02 }
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-white/50 transition-all duration-300 sm:text-sm relative z-0 group-hover:border-zinc-600 group-hover:bg-zinc-900/80"
                                            placeholder="••••••••"
                                        />
                                        {/* Animated bottom border glow */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent w-full"
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            variants={{
                                                hover: { scaleX: 1, opacity: 1 }
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-white hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-300/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] content-['']" />
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2 relative z-10">
                                        Sign in
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatDelay: 1 }}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </motion.div>
                                    </span>
                                )}
                            </motion.button>


                        </form>
                    </motion.div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-zinc-600 hidden lg:block">
                        © 2026 EmbedCraft Inc. All rights reserved.
                    </div>
                </div> {/* End Right Side */}
            </div> {/* End Hero Section Container */}

            {/* Premium Z-Pattern Features Section */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto py-32 px-4 sm:px-8 lg:px-16 pb-48 space-y-40">
                {/* Structural Architectural Side Lines */}
                <div className="absolute inset-y-0 left-8 lg:left-16 w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent pointer-events-none hidden md:block" />
                <div className="absolute inset-y-0 right-8 lg:right-16 w-px bg-gradient-to-b from-transparent via-zinc-800/50 to-transparent pointer-events-none hidden md:block" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-zinc-900/40 to-transparent pointer-events-none hidden lg:block" />

                {/* Ambient Side Glows */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white"
                    >
                        Precision control. <br /> Maximum impact.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-zinc-400 font-light"
                    >
                        Launch growth loops that feel natively integrated, land perfectly on target, and drive user engagement—unblocking you from engineering dependencies.
                    </motion.p>
                </div>

                {/* Feature 1 - Native UI (Text Left, Image Right) */}
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 relative">
                    {/* Background Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/4 text-[16rem] md:text-[24rem] font-bold text-white/[0.02] pointer-events-none select-none z-0 hidden md:block leading-none tracking-tighter">
                        01
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full md:w-1/2 space-y-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <LayoutPanelLeft className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tight text-white">Multiple Native UI Patterns</h3>
                        <TypewriterText
                            speed={0.005}
                            text="Deploy Tooltips, Floater menus, Bottom Sheets, and full-screen modals. Design beautiful in-app experiences that seamlessly blend with your application's native architecture, maintaining complete brand consistency."
                            className="text-zinc-400 font-light text-lg leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative min-h-[400px] flex items-center justify-center bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden"
                    >
                        {/* Animated Empty Space Grid */}
                        <motion.div
                            className="absolute inset-0 z-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                            animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-zinc-950/80 z-0 pointer-events-none" />

                        {/* Abstract Mock UI */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } },
                                hidden: {}
                            }}
                            className="absolute inset-x-8 inset-y-8 border border-zinc-800 rounded-2xl bg-zinc-900/40 p-6 flex flex-col gap-4 shadow-2xl backdrop-blur-sm"
                        >
                            <motion.div
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                className="w-1/3 h-4 bg-zinc-800 rounded"
                            />
                            <motion.div
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                className="w-2/3 h-4 bg-zinc-800/60 rounded"
                            />
                            <div className="w-full flex-1 flex items-center justify-center">
                                {/* Tooltip mock */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, scale: 0.8, y: 20 }, visible: { opacity: 1, scale: 1, y: 0 } }}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="bg-zinc-800 border border-zinc-700/50 p-4 rounded-xl shadow-2xl relative"
                                >
                                    <div className="w-32 h-3 bg-white/20 rounded mb-2" />
                                    <div className="w-24 h-3 bg-white/10 rounded" />
                                    {/* Arrow */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-800 border-b border-r border-zinc-700/50 rotate-45" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Feature 2 - Targeting (Image Left, Text Right) */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24 relative">
                    {/* Background Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/4 text-[16rem] md:text-[24rem] font-bold text-white/[0.02] pointer-events-none select-none z-0 hidden md:block leading-none tracking-tighter">
                        02
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full md:w-1/2 space-y-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tight text-white">Targeted Delivery</h3>
                        <TypewriterText
                            speed={0.005}
                            text="Define granular cohorts and trigger logic based on real-time user events and precise behavioral attributes. Ensure every single user receives the most relevant and contextual nudge at the exact right moment they need it."
                            className="text-zinc-400 font-light text-lg leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative min-h-[400px] flex items-center justify-center bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden"
                    >
                        {/* Animated Empty Space Grid */}
                        <motion.div
                            className="absolute inset-0 z-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                            animate={{ backgroundPosition: ['0px 0px', '-32px 32px'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-zinc-950/80 z-0 pointer-events-none" />

                        {/* Abstract Analytics/Targeting Mock */}
                        <div className="relative w-64 h-64 border border-zinc-800/50 rounded-full flex items-center justify-center group">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white/5 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute w-48 h-48 border border-zinc-700/30 rounded-full border-dashed"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute w-56 h-56 border border-zinc-800/40 rounded-full border-dotted"
                            />
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                                className="absolute w-32 h-32 border border-zinc-700/50 rounded-full flex items-center justify-center bg-zinc-900/80 backdrop-blur-md transition-shadow duration-500 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                            >
                                <Target className="w-8 h-8 text-white/80 transition-transform duration-500 group-hover:scale-125" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Feature 3 - Gamification (Text Left, Image Right) */}
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 relative">
                    {/* Background Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/4 text-[16rem] md:text-[24rem] font-bold text-white/[0.02] pointer-events-none select-none z-0 hidden md:block leading-none tracking-tighter">
                        03
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full md:w-1/2 space-y-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <PlayCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tight text-white">Gamification & Rewards</h3>
                        <TypewriterText
                            speed={0.005}
                            text="Capture absolute attention to drastically improve repeat conversions. Instantly deploy precision scratch cards, immersive full-page experiences, and addictive streak mechanics directly into your critical funnels."
                            className="text-zinc-400 font-light text-lg leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative min-h-[400px] flex items-center justify-center bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden"
                    >
                        {/* Animated Empty Space Grid */}
                        <motion.div
                            className="absolute inset-0 z-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                            animate={{ backgroundPosition: ['0px 0px', '32px -32px'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-zinc-950/80 z-0 pointer-events-none" />

                        {/* Mock Gamification UI */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } },
                                hidden: {}
                            }}
                            className="w-64 h-80 bg-zinc-900 border border-zinc-800 rounded-2xl relative shadow-2xl overflow-hidden flex flex-col pt-8 items-center"
                        >
                            <motion.div
                                variants={{ hidden: { opacity: 0, scale: 0.5, rotate: -20 }, visible: { opacity: 1, scale: 1, rotate: 0 } }}
                                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                                className="w-24 h-24 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-xl border border-zinc-600 mb-6 flex items-center justify-center transform hover:scale-110 cursor-pointer shadow-xl transition-transform"
                            >
                                <Sparkles className="w-8 h-8 text-white/50" />
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="w-3/4 h-3 bg-zinc-800 rounded mb-3" />
                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="w-1/2 h-3 bg-zinc-800 rounded" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Feature 4 - Analytics / A/B Testing (Image Left, Text Right) */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24 relative">
                    {/* Background Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/4 text-[16rem] md:text-[24rem] font-bold text-white/[0.02] pointer-events-none select-none z-0 hidden md:block leading-none tracking-tighter">
                        04
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full md:w-1/2 space-y-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <BarChart className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tight text-white">Experiment & Analyze</h3>
                        <TypewriterText
                            speed={0.005}
                            text="Stop guessing. Rapidly A/B test different copy, designs, and triggers to determine statistically significant winners. Monitor impressions, clicks, dismissals, and ultimate conversion goals in real-time dashboards."
                            className="text-zinc-400 font-light text-lg leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative min-h-[400px] flex items-end justify-center bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden px-12 pt-16"
                    >
                        {/* Animated Empty Space Grid */}
                        <motion.div
                            className="absolute inset-0 z-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                            animate={{ backgroundPosition: ['0px 0px', '-32px -32px'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-zinc-950/80 z-0 pointer-events-none" />

                        {/* Mock Chart UI */}
                        <div className="w-full flex items-end justify-between gap-4 h-48 border-b border-zinc-800/50 pb-0 group">
                            {[40, 65, 30, 85, 55, 100].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${height}%` }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 1, delay: i * 0.1, type: "spring", stiffness: 50 }}
                                    whileHover={{ opacity: 1, filter: "brightness(1.5)" }}
                                    className="w-full bg-zinc-700 rounded-t-sm relative cursor-pointer"
                                    style={{ opacity: 0.5 + (height / 200) }}
                                >
                                    {/* Hover tooltip for chart */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium whitespace-nowrap z-10">
                                        {height}% Lift
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Feature 5 - No Code (Text Left, Image Right) */}
                <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 relative">
                    {/* Background Number */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/4 text-[16rem] md:text-[24rem] font-bold text-white/[0.02] pointer-events-none select-none z-0 hidden md:block leading-none tracking-tighter">
                        05
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full md:w-1/2 space-y-6"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                            <Code2 className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tight text-white">Zero Engineering Required</h3>
                        <TypewriterText
                            speed={0.005}
                            text="Integrate the ultra-lightweight SDK once, and never wait on a release cycle again. Product, Marketing, and Growth teams can autonomously craft and deploy experiences instantly over-the-air."
                            className="text-zinc-400 font-light text-lg leading-relaxed"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative min-h-[400px] flex items-center justify-center bg-zinc-950/40 rounded-3xl border border-zinc-900 overflow-hidden"
                    >
                        {/* Animated Empty Space Grid */}
                        <motion.div
                            className="absolute inset-0 z-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                            animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-zinc-950/80 z-0 pointer-events-none" />

                        {/* Terminal/Code Mock */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="w-64 md:w-80 border border-zinc-800 rounded-xl bg-[#0d0d0d] p-5 font-mono text-xs text-zinc-500 shadow-2xl relative overflow-hidden"
                        >
                            {/* Terminal Header */}
                            <div className="flex gap-2 mb-4 border-b border-zinc-800/50 pb-4">
                                <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-red-500/50 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-yellow-500/50 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-green-500/50 transition-colors cursor-pointer" />
                            </div>

                            {/* Staggered Code Lines */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1 } },
                                    hidden: {}
                                }}
                                className="space-y-2"
                            >
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}><span className="text-zinc-600">{"//"} Initialize SDK once</span></motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}><span className="text-blue-400">EmbedCraft</span>.<span className="text-purple-400">init</span>({"{"}</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-4">apiKey: <span className="text-green-400">"ec_live_..."</span>,</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-4">userId: <span className="text-white">user.id</span></motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>{"});"}</motion.p>
                                <br />
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}><span className="text-zinc-600">{"//"} Done. Never touch code again.</span></motion.p>
                                {/* Cursor blink */}
                                <motion.div
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="w-2 h-4 bg-white/50 mt-4"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default Login;
