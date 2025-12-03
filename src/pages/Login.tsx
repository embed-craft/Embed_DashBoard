import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
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

    return (
        <div className="min-h-screen w-full flex bg-white">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 opacity-90" />

                {/* Abstract Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500 mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-pink-500 mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000" />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">EmbedCraft</span>
                    </div>

                    <div className="max-w-lg">
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Empower your app with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">intelligent nudges</span>
                        </h1>
                        <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                            Create, manage, and optimize in-app experiences that drive engagement and retention. No coding required.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Drag & drop campaign builder',
                                'Real-time analytics & insights',
                                'Seamless SDK integration'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-indigo-100">
                                    <CheckCircle2 className="h-5 w-5 text-pink-400" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm text-indigo-200">
                        © 2025 EmbedCraft Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Zap className="h-7 w-7 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Please enter your details to sign in
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>


                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
