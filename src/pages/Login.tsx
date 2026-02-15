import React, { useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // Assuming useAuth is the correct hook, not useAuthStore as in the instruction snippet
    const navigate = useNavigate();

    // Mouse position for spotlight effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

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

    // Generate random particles - increased density
    const particles = Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1, // Slightly larger range
        duration: Math.random() * 10 + 5, // Faster fall (5-15s)
        delay: Math.random() * 5
    }));

    return (
        <div
            className="min-h-screen w-full flex bg-black text-white selection:bg-white selection:text-black font-sans overflow-hidden relative group"
            onMouseMove={handleMouseMove}
        >
            {/* Snowfall Particles */}
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
                            x: [`${particle.x}vw`, `${particle.x + (Math.random() * 10 - 5)}vw`]
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "linear"
                        }}
                        className="absolute rounded-full bg-white/30 backdrop-blur-sm"
                        style={{
                            width: particle.size,
                            height: particle.size,
                        }}
                    />
                ))}
            </div>
            {/* Left Side - Abstract Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />

                {/* Animated Abstract Shapes */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-3xl" />
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
                            <h1 className="text-5xl font-bold tracking-tighter mb-4">EmbedCraft</h1>
                            <p className="text-xl text-zinc-400 font-light mb-8 max-w-sm mx-auto leading-relaxed">
                                Intelligent nudges for modern apps. Create beautiful, engaging in-app experiences without writing code.
                            </p>


                        </motion.div>
                    </div>


                </motion.div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Global Footer - Contact Info */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center text-center pointer-events-auto">
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Need Assistance?</p>
                <p className="text-zinc-400 font-mono text-sm hover:text-white transition-colors cursor-pointer bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/50">
                    +91 7624945805
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative">
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

                <div className="absolute bottom-8 text-xs text-zinc-600">
                    © 2026 EmbedCraft Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
