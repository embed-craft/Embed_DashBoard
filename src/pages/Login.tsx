import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, Sun, Gift, MessageSquare, Flame, ShoppingBag, User, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';

// Background Floating Icon Component
const FloatingBgIcon = ({ children, top, left, delay }: { children: React.ReactNode, top: string, left: string, delay: number }) => (
  <motion.div
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute',
      top,
      left,
      zIndex: 1,
      color: '#cbd5e1',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.35,
      pointerEvents: 'none'
    }}
  >
    {children}
  </motion.div>
);

// Phone Mockup Component for background decoration
const PhoneMockup = ({ style, className, nudgeType }: { style: React.CSSProperties, className?: string, nudgeType: 'live_story' | 'nudge_sheet' | 'scratch_win' | 'spin_wheel' }) => {
  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        width: '180px',
        height: '360px',
        borderRadius: '24px',
        border: '6px solid #0f172a',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 1,
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {/* Notch / Dynamic Island */}
      <div style={{
        width: '70px',
        height: '12px',
        backgroundColor: '#0f172a',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        margin: '0 auto',
        flexShrink: 0,
        zIndex: 10
      }} />

      {/* Phone Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px 2px 12px', fontSize: '8px', fontWeight: 600, color: '#000000', flexShrink: 0 }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <span>5G</span>
          <div style={{ width: '10px', height: '5px', border: '1px solid #000000', borderRadius: '1px', position: 'relative', padding: '0.5px' }}>
            <div style={{ width: '6px', height: '100%', backgroundColor: '#000000', borderRadius: '0.5px' }} />
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Mock App Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '7px', fontWeight: 'bold' }}>
              E
            </div>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>EMBEDCRAFTAPP</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', color: '#64748b' }}>
            <Search size={8} />
            <Bell size={8} />
          </div>
        </div>

        {/* Stories Row */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
          {/* Story 1 (With Ring) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: nudgeType === 'live_story' ? 'none' : '1px solid #cbd5e1',
              padding: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {nudgeType === 'live_story' && (
                <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#000000"
                    strokeWidth="1.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 10}
                    animate={{ strokeDashoffset: [2 * Math.PI * 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              )}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sparkles size={8} />
              </div>
            </div>
            <span style={{ fontSize: '6px', fontWeight: 600, color: '#000000' }}>Live Offer</span>
          </div>

          {/* Placeholders */}
          {[
            { label: "New In", icon: ShoppingBag },
            { label: "Sale", icon: Gift },
            { label: "Account", icon: User }
          ].map((s, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', opacity: 0.35 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <s.icon size={8} />
              </div>
              <span style={{ fontSize: '6px', color: '#64748b' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Feed Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          opacity: 0.3
        }}>
          <div style={{ height: '36px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
          <div style={{ width: '80%', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          <div style={{ width: '50%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
        </div>

        {/* Dynamic Tooltip Nudge (for Live Story) */}
        {nudgeType === 'live_story' && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '74px',
              left: '8px',
              backgroundColor: '#000000',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-4px',
              left: '12px',
              width: '8px',
              height: '8px',
              backgroundColor: '#000000',
              transform: 'rotate(45deg)'
            }} />
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} className="animate-ping" />
            Live Story Nudge
          </motion.div>
        )}

        {/* Bottom Sheet Nudge (nudge_sheet) */}
        {nudgeType === 'nudge_sheet' && (
          <motion.div
            animate={{ y: [80, 0, 0, 80] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              times: [0, 0.08, 0.92, 1],
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              bottom: '8px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #000000',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
              zIndex: 20
            }}
          >
            <div style={{ width: '20px', height: '3px', backgroundColor: '#e2e8f0', borderRadius: '1.5px', margin: '0 auto 6px auto' }} />
            <div style={{ display: 'flex', gap: '6px', alignItems: 'start' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', shrink: 0 }}>
                <Sparkles size={10} />
              </div>
              <div>
                <h4 style={{ fontSize: '9px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Welcome Reward!</h4>
                <p style={{ fontSize: '7px', color: '#64748b', margin: '1px 0 0 0', lineHeight: '1.2' }}>Get 15% off code <strong>HELLO15</strong> instantly.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '8px', fontWeight: 600, padding: '3px 0', textAlign: 'center', color: '#64748b' }}>Dismiss</div>
              <div style={{ flex: 1, backgroundColor: '#000000', borderRadius: '4px', fontSize: '8px', fontWeight: 700, padding: '3px 0', textAlign: 'center', color: '#ffffff' }}>Apply</div>
            </div>
          </motion.div>
        )}

        {/* Scratch Card Nudge (scratch_win) */}
        {nudgeType === 'scratch_win' && (
          <div style={{
            position: 'absolute',
            inset: '8px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 20
          }}>
            {/* Cutouts */}
            <div style={{ position: 'absolute', left: '-1px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '12px', backgroundColor: '#ffffff', borderRight: '1.5px solid #0f172a', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', zIndex: 10 }} />
            <div style={{ position: 'absolute', right: '-1px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '12px', backgroundColor: '#ffffff', borderLeft: '1.5px solid #0f172a', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', zIndex: 10 }} />

            <div style={{ textAlign: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
              <span style={{ fontSize: '6px', fontWeight: 900, color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '1px 4px', borderRadius: '8px' }}>EXCLUSIVE GIFT</span>
              <h4 style={{ fontSize: '9px', fontWeight: 900, margin: '2px 0 0 0', color: '#0f172a' }}>SCRATCH & WIN</h4>
            </div>

            {/* Scratch Container */}
            <div style={{ height: '70px', border: '1px dashed #cbd5e1', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', margin: '4px 0' }}>
              {/* Revealed Offer */}
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <div style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 700 }}>YOUR MYSTERY REWARD</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', margin: '1px 0' }}>70% DISCOUNT</div>
                <div style={{ fontSize: '7px', fontWeight: 'bold', border: '1px dashed #94a3b8', borderRadius: '2px', padding: '1px 3px', display: 'inline-block', backgroundColor: '#ffffff' }}>CODE: NINJA70</div>
              </div>

              {/* Scratch Cover */}
              <motion.div
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.3, 0.45, 0.85, 0.95], ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5
                }}
              >
                <span style={{ fontSize: '6px', fontWeight: 900, color: '#64748b', letterSpacing: '0.05em' }}>★ SCRATCH ★</span>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100">
                  <motion.path
                    d="M 15,25 C 25,65 30,20 45,75 T 75,25 S 85,80 90,40"
                    fill="transparent"
                    stroke="#94a3b8"
                    strokeWidth="12"
                    strokeLinecap="round"
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={{ duration: 7, repeat: Infinity, times: [0, 0.25, 0.85, 0.95] }}
                  />
                </svg>
              </motion.div>

              {/* Scratching Coin */}
              <motion.div
                animate={{
                  x: [-35, 35, -25, 25, -10, 10, 0],
                  y: [-8, 8, -4, 4, 0, 0, 0],
                  rotate: [0, 360, 720, 1080],
                  opacity: [0, 1, 1, 0, 0]
                }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.05, 0.35, 0.45, 1] }}
                style={{
                  position: 'absolute',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1px solid #0f172a',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '7px',
                  fontWeight: 'bold',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
                  zIndex: 6
                }}
              >
                ¢
              </motion.div>
            </div>

            <button style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '8px', fontWeight: 700, padding: '4px 0', cursor: 'default' }}>
              Claim 70% Discount
            </button>
          </div>
        )}

        {/* Spin the Wheel Nudge (spin_wheel) */}
        {nudgeType === 'spin_wheel' && (
          <div style={{
            position: 'absolute',
            inset: '8px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #0f172a',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 20
          }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '9px', fontWeight: 900, color: '#0f172a', margin: 0 }}>SPIN THE WHEEL</h4>
              <p style={{ fontSize: '7px', color: '#64748b', margin: '1px 0 0 0' }}>Try your luck for a reward!</p>
            </div>

            {/* Wheel SVG */}
            <div style={{ width: '100px', height: '100px', position: 'relative', margin: '4px 0' }}>
              {/* Pointer */}
              <motion.div
                animate={{ rotate: [0, -15, 10, -15, 10, -10, 5, 0, 0, 0] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.45, 1] }}
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '8px solid #0f172a',
                  zIndex: 30,
                  originX: 0.5,
                  originY: 0
                }}
              />

              {/* Rotating Wheel SVG */}
              <motion.div
                animate={{ rotate: [0, 1440 + 135, 1440 + 135, 0] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.4, 0.85, 0.95], ease: [0.15, 0.85, 0.35, 1] }}
                style={{ width: '100%', height: '100%' }}
              >
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(22.5deg)' }}>
                  <path d="M 50 50 L 98 50 A 48 48 0 0 1 83.94 83.94 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
                  <path d="M 50 50 L 83.94 83.94 A 48 48 0 0 1 50 98 Z" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.5" />
                  <path d="M 50 50 L 50 98 A 48 48 0 0 1 16.06 83.94 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
                  <path d="M 50 50 L 16.06 83.94 A 48 48 0 0 1 2 50 Z" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.5" />
                  <path d="M 50 50 L 2 50 A 48 48 0 0 1 16.06 16.06 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
                  <path d="M 50 50 L 16.06 16.06 A 48 48 0 0 1 50 2 Z" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.5" />
                  <path d="M 50 50 L 50 2 A 48 48 0 0 1 83.94 16.06 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="0.5" />
                  <path d="M 50 50 L 83.94 16.06 A 48 48 0 0 1 98 50 Z" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </motion.div>

              {/* Center Rivet */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#0f172a', border: '1.5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
              </div>
            </div>

            {/* Claim/Unlock message */}
            <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                animate={{ scale: [0.3, 1, 1, 0.3], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.45, 0.85, 0.95] }}
              >
                <span style={{ fontSize: '7px', fontWeight: 900, color: '#ffffff', backgroundColor: '#0f172a', padding: '1.5px 6px', borderRadius: '4px' }}>50% OFF UNLOCKED!</span>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      
      {/* Home Indicator */}
      <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '2px', backgroundColor: '#0f172a', borderRadius: '1px', zIndex: 20 }} />
    </div>
  );
};

// Main Login Component
const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('remember_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

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

            if (rememberMe) {
                localStorage.setItem('remember_email', email);
            } else {
                localStorage.removeItem('remember_email');
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
        <div style={{
            height: '100vh',
            width: '100%',
            backgroundColor: '#fafafa',
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Responsive display and spacing styles to prevent overlaps */}
            <style>{`
              .bg-phone {
                display: block;
                transition: all 0.3s ease;
              }

              /* Hide edge phones on medium screens where container margins shrink */
              @media (max-width: 1530px) {
                .bg-phone-left-edge, .bg-phone-right-edge {
                  display: none !important;
                }
              }

              /* Hide center phone on narrower screens to prevent overlap between text and card */
              @media (max-width: 1200px) {
                .bg-phone-center {
                  display: none !important;
                }
              }

              /* Hide bottom phone on short screens to avoid vertical crowding */
              @media (max-height: 850px) {
                .bg-phone-left-bottom {
                  display: none !important;
                }
              }
            `}</style>

            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 48px',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={logo} alt="EmbedCraft" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>EmbedCraft</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <a 
                        href="https://docs.embedcraft.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}
                    >
                        Documentation
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '40px',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px 48px',
                zIndex: 10,
                position: 'relative'
            }}>
                {/* Background phone mockups positioned relative to the main container, fully visible and clear of content */}
                {/* Phone 1: Far Left Margin (Live Story) */}
                <PhoneMockup 
                    nudgeType="live_story" 
                    className="bg-phone bg-phone-left-edge"
                    style={{
                        left: '-160px',
                        top: '5%',
                        transform: 'rotate(-10deg)',
                        opacity: 0.16
                    }} 
                />
                
                {/* Phone 2: Below Welcome Text (Spin the Wheel) */}
                <PhoneMockup 
                    nudgeType="spin_wheel" 
                    className="bg-phone bg-phone-left-bottom"
                    style={{
                        left: '20px',
                        bottom: '-40px',
                        transform: 'rotate(8deg)',
                        opacity: 0.16
                    }} 
                />

                {/* Phone 3: Center Gutter (Bottom Sheet Nudge) */}
                <PhoneMockup 
                    nudgeType="nudge_sheet" 
                    className="bg-phone bg-phone-center"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) rotate(8deg)',
                        opacity: 0.16
                    }} 
                />

                {/* Phone 4: Far Right Margin (Scratch & Win) */}
                <PhoneMockup 
                    nudgeType="scratch_win" 
                    className="bg-phone bg-phone-right-edge"
                    style={{
                        right: '-160px',
                        bottom: '5%',
                        transform: 'rotate(10deg)',
                        opacity: 0.16
                    }} 
                />

                {/* Background floating icons relative to the container */}
                <FloatingBgIcon top="5%" left="38%" delay={0.2}>
                    <Gift size={18} />
                </FloatingBgIcon>
                <FloatingBgIcon bottom="15%" left="35%" delay={0.6}>
                    <MessageSquare size={18} />
                </FloatingBgIcon>
                <FloatingBgIcon bottom="5%" right="38%" delay={1.0}>
                    <Flame size={18} />
                </FloatingBgIcon>
                <FloatingBgIcon top="8%" right="35%" delay={1.4}>
                    <Sparkles size={18} />
                </FloatingBgIcon>
                {/* Left Side: Brand Text */}
                <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 10 }}>
                    <div>
                        <h1 style={{ fontSize: '96px', fontWeight: 800, color: '#0f172a', lineHeight: '0.96', letterSpacing: '-0.04em', margin: 0 }}>
                            Welcome<br />
                            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>back.</span>
                        </h1>
                        <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', maxWidth: '520px', marginTop: '24px', margin: 0 }}>
                            Tailored app experiences in minutes. Sign in to launch nudges, stories and rich in-app widgets — straight into your Flutter app.
                        </p>
                    </div>
                </div>

                {/* Right Side: Sign In Card */}
                <div style={{ gridColumn: 'span 5', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '500px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '16px',
                        padding: '48px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
                        position: 'relative'
                    }}>
                        {/* Technical L-brackets in the corners */}
                        <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '12px', height: '12px', borderTop: '2px solid #94a3b8', borderLeft: '2px solid #94a3b8' }} />
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', borderTop: '2px solid #94a3b8', borderRight: '2px solid #94a3b8' }} />
                        <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '12px', height: '12px', borderBottom: '2px solid #94a3b8', borderLeft: '2px solid #94a3b8' }} />
                        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '12px', height: '12px', borderBottom: '2px solid #94a3b8', borderRight: '2px solid #94a3b8' }} />

                        {/* Card Title Header with Large Logo (No Black Box) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                            <img src={logo} alt="EmbedCraft Logo" style={{ height: '100px', width: '100px', objectFit: 'contain' }} />
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Sign in</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Access your EmbedCraft console</p>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ height: '6px', width: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Email field */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="email" style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                                    <input 
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px 12px 42px',
                                            border: `1.5px solid ${focusedField === 'email' ? '#6366f1' : '#cbd5e1'}`,
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            backgroundColor: '#ffffff',
                                            transition: 'all 0.2s',
                                            boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="password" style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                                    <input 
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 42px 12px 42px',
                                            border: `1.5px solid ${focusedField === 'password' ? '#6366f1' : '#cbd5e1'}`,
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#0f172a',
                                            outline: 'none',
                                            backgroundColor: '#ffffff',
                                            transition: 'all 0.2s',
                                            boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            padding: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        style={{ accentColor: '#000000', borderRadius: '4px', cursor: 'pointer' }} 
                                    />
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    marginTop: '8px',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.opacity = '0.9' }}
                                onMouseOut={(e) => { if(!isLoading) e.currentTarget.style.opacity = '1' }}
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Sign in <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 48px',
                borderTop: '1px solid rgba(226, 232, 240, 0.5)',
                color: '#94a3b8',
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 20
            }}>
                <div>
                    © 2026 EmbedCraft Inc. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: '16px', fontWeight: 500 }}>
                    <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</a>
                    <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</a>
                    <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Support</a>
                </div>
            </footer>
        </div>
    );
};

export default Login;
