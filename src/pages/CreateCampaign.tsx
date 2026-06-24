import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, X } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { theme } from '@/styles/design-tokens';

// ─── Custom SVG Illustrations ───

const NudgeIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="30" y="20" width="100" height="80" rx="16" fill="#7C3AED" />
        <path d="M50 100 L40 118 L68 100" fill="#7C3AED" />
        <rect x="50" y="42" width="60" height="6" rx="3" fill="rgba(255,255,255,0.7)" />
        <rect x="50" y="56" width="50" height="6" rx="3" fill="rgba(255,255,255,0.7)" />
        <rect x="50" y="70" width="40" height="6" rx="3" fill="rgba(255,255,255,0.7)" />
    </svg>
);

const MessagesIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="52" y="10" width="56" height="110" rx="10" stroke="#7C3AED" strokeWidth="2.5" fill="white" />
        <rect x="58" y="24" width="44" height="76" rx="4" fill="#EDE9FE" />
        <rect x="64" y="34" width="32" height="52" rx="4" fill="#7C3AED" />
        <rect x="70" y="108" width="20" height="3" rx="1.5" fill="#D4D4D8" />
    </svg>
);

const StoriesIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="40" cy="60" r="28" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2.5" />
        <circle cx="80" cy="60" r="28" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2.5" />
        <circle cx="120" cy="60" r="28" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2.5" />
        <circle cx="40" cy="60" r="18" fill="#C4B5FD" />
        <circle cx="80" cy="60" r="18" fill="#C4B5FD" />
        <circle cx="120" cy="60" r="18" fill="#C4B5FD" />
    </svg>
);

const ChallengesIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M120 16 L136 32 L120 48 L104 32 Z" fill="#7C3AED" />
        <path d="M120 26 L128 32 L120 38 L112 32 Z" fill="white" />
        <rect x="24" y="30" width="100" height="90" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="42" cy="52" r="5" fill="#7C3AED" opacity="0.15" />
        <rect x="54" y="49" width="56" height="6" rx="3" fill="#7C3AED" />
        <circle cx="42" cy="72" r="5" fill="#7C3AED" opacity="0.15" />
        <rect x="54" y="69" width="56" height="6" rx="3" fill="#7C3AED" />
        <circle cx="42" cy="92" r="5" fill="#7C3AED" opacity="0.15" />
        <rect x="54" y="89" width="40" height="6" rx="3" fill="#E5E7EB" />
    </svg>
);

const StreaksIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="30" cy="70" r="18" fill="#7C3AED" />
        <text x="30" y="76" textAnchor="middle" fill="white" fontWeight="700" fontSize="16" fontFamily="Inter, sans-serif">1</text>
        <circle cx="68" cy="70" r="18" fill="#7C3AED" />
        <text x="68" y="76" textAnchor="middle" fill="white" fontWeight="700" fontSize="16" fontFamily="Inter, sans-serif">2</text>
        <circle cx="106" cy="70" r="18" fill="#7C3AED" />
        <text x="106" y="76" textAnchor="middle" fill="white" fontWeight="700" fontSize="16" fontFamily="Inter, sans-serif">3</text>
        <circle cx="138" cy="70" r="12" fill="#C4B5FD" />
        <circle cx="156" cy="70" r="8" fill="#EDE9FE" />
    </svg>
);

const SpinWheelIllustration = () => (
    <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="35" y="120" width="90" height="20" rx="6" fill="#FDE68A" />
        <circle cx="80" cy="70" r="48" fill="#FEE2E2" />
        <path d="M80 22 L80 70 L120 38 Z" fill="#F87171" />
        <path d="M120 38 L80 70 L128 70 Z" fill="#FDE68A" />
        <path d="M128 70 L80 70 L120 102 Z" fill="#7C3AED" />
        <path d="M120 102 L80 70 L80 118 Z" fill="#FB923C" />
        <path d="M80 118 L80 70 L40 102 Z" fill="#34D399" />
        <path d="M40 102 L80 70 L32 70 Z" fill="#F87171" />
        <path d="M32 70 L80 70 L40 38 Z" fill="#FDE68A" />
        <path d="M40 38 L80 70 L80 22 Z" fill="#60A5FA" />
        <circle cx="80" cy="70" r="10" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        <path d="M80 18 L76 8 L84 8 Z" fill="#7C3AED" />
        <circle cx="108" cy="46" r="8" fill="white" stroke="#9CA3AF" strokeWidth="1.5" />
        <path d="M105 42 L108 38 L111 42" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const SurveyIllustration = () => (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect x="28" y="20" width="104" height="22" rx="11" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="42" cy="31" r="5" fill="#E5E7EB" />
        <text x="54" y="36" fill="#9CA3AF" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">A</text>
        <rect x="66" y="28" width="52" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="28" y="50" width="104" height="22" rx="11" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="42" cy="61" r="5" fill="#E5E7EB" />
        <text x="54" y="66" fill="#9CA3AF" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">B</text>
        <rect x="66" y="58" width="42" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="28" y="80" width="104" height="22" rx="11" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="42" cy="91" r="5" fill="#E5E7EB" />
        <text x="54" y="96" fill="#9CA3AF" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">C</text>
        <rect x="66" y="88" width="48" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="28" y="110" width="104" height="22" rx="11" fill="white" stroke="#7C3AED" strokeWidth="2" />
        <circle cx="42" cy="121" r="5" fill="#7C3AED" />
        <text x="54" y="126" fill="#7C3AED" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">D</text>
        <rect x="66" y="118" width="56" height="5" rx="2.5" fill="#7C3AED" />
    </svg>
);

// ─── Experience Type Config ───

const EXPERIENCE_TYPES = [
    {
        id: 'nudges',
        type: 'nudge',
        title: 'In-app nudges',
        info: 'Guide users intuitively inside your application with highly targeted tooltips, dynamic banners, bottom sheets, modals, and subtle floaters. Perfect for onboarding, feature discovery, and contextual help.',
        Illustration: NudgeIllustration,
    },
    {
        id: 'messages',
        type: 'nudge',
        title: 'In-app messages',
        info: 'Re-engage users beyond the app using personalized push notifications, automated email sequences, SMS campaigns, and webhooks. Drive retention with smart, trigger-based outreach.',
        Illustration: MessagesIllustration,
    },
    {
        id: 'stories',
        type: 'nudge',
        title: 'Stories',
        info: 'Create immersive, full-screen story experiences with slides, timelines, and rich media. Instagram-style content delivery to captivate your users with interactive, swipeable narratives.',
        Illustration: StoriesIllustration,
    },
    {
        id: 'challenge',
        type: 'challenge',
        title: 'Challenges',
        info: 'Architect complex, multi-step player journeys with logic gating, event-driven task evaluation, repeatable quests, and an integrated reward economy. Unlock badges, points, and coupons.',
        Illustration: ChallengesIllustration,
    },
    {
        id: 'streaks',
        type: 'challenge',
        title: 'Streaks',
        info: 'Build habit-forming daily streak mechanics with consecutive-day tracking, milestone rewards, and streak-freeze safety nets. Keep users coming back with visible progress indicators.',
        Illustration: StreaksIllustration,
        comingSoon: true,
    },
    {
        id: 'spinthewheel',
        type: 'gamification',
        title: 'SPIN THE WHEEL',
        info: 'Engage users with a server-authoritative gamified reward wheel. Supports weighted probability, inventory vaults, per-section limits, and zero-trust anti-cheat — increasing conversions and retention.',
        Illustration: SpinWheelIllustration,
    },
    {
        id: 'scratchcard',
        type: 'gamification',
        title: 'Scratch Card',
        info: 'Deliver exciting scratch-to-win experiences natively. Link fixed rewards directly to scratch interactions for an engaging unboxing feel.',
        Illustration: () => (
            <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <rect x="30" y="30" width="100" height="80" rx="10" fill="#E5E7EB" />
                <rect x="40" y="40" width="80" height="60" rx="6" fill="#7C3AED" />
                <path d="M50 50 L70 70 M60 50 L80 70 M70 50 L90 70" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" />
                <circle cx="100" cy="80" r="12" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M100 86 L96 74 L104 74 Z" fill="#7C3AED" />
            </svg>
        ),
    },
    {
        id: 'survey',
        type: 'survey',
        title: 'Survey',
        info: 'Collect actionable user feedback with natively embedded NPS, CSAT, and custom surveys. Contextual, in-app data collection without interrupting the user journey.',
        Illustration: SurveyIllustration,
        comingSoon: true,
    },
];

// ─── Main Component ───

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [infoId, setInfoId] = useState<string | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);

    const handleSelect = (exp: typeof EXPERIENCE_TYPES[0]) => {
        if (infoId) return;
        if ((exp as any).comingSoon) {
            setShowComingSoon(true);
            setTimeout(() => setShowComingSoon(false), 2500);
            return;
        }
        if (exp.type === 'challenge') {
            navigate(`/campaign-builder?type=challenge&new=true`);
        } else if (exp.type === 'gamification') {
            navigate(`/campaign-builder?type=${exp.id}&new=true`);
        } else if (exp.id === 'stories') {
            navigate(`/campaign-builder?experience=stories`);
        } else {
            navigate(`/campaign-builder?experience=${exp.id}`);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
            <PageContainer>
                <div style={{
                    maxWidth: '1080px',
                    margin: '0 auto',
                    padding: '40px 32px 80px',
                }}>
                    {/* Back Button + Header */}
                    <div style={{ marginBottom: '36px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px 10px 6px 4px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: theme.colors.text.secondary,
                                marginBottom: '20px',
                                marginLeft: '-4px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                e.currentTarget.style.color = theme.colors.text.primary;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = theme.colors.text.secondary;
                            }}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: theme.colors.text.primary,
                            marginBottom: '6px',
                            letterSpacing: '-0.4px',
                        }}>
                            Choose an Experience
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: theme.colors.text.secondary,
                            lineHeight: 1.5,
                        }}>
                            Pick an experience that you want to start with.
                        </p>
                    </div>

                    {/* Card Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '18px',
                    }}>
                        {EXPERIENCE_TYPES.map((exp, index) => {
                            const Illustration = exp.Illustration;
                            const isHovered = hoveredId === exp.id;
                            const isInfoOpen = infoId === exp.id;
                            const isComingSoon = !!(exp as any).comingSoon;

                            return (
                                <div
                                    key={exp.id}
                                    id={`create-${exp.id}`}
                                    onClick={() => handleSelect(exp)}
                                    onMouseEnter={() => setHoveredId(exp.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        position: 'relative',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '14px',
                                        border: `1.5px solid ${isHovered || isInfoOpen ? '#A78BFA' : '#E5E7EB'}`,
                                        cursor: isComingSoon ? 'default' : (isInfoOpen ? 'default' : 'pointer'),
                                        opacity: isComingSoon ? 0.7 : 1,
                                        transition: 'all 0.25s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        boxShadow: isHovered
                                            ? '0 4px 20px rgba(124, 58, 237, 0.12)'
                                            : '0 1px 3px rgba(0,0,0,0.04)',
                                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                                    }}
                                >
                                    {/* Coming Soon Badge */}
                                    {isComingSoon && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            zIndex: 10,
                                            padding: '3px 10px',
                                            borderRadius: '100px',
                                            background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                        }}>
                                            Coming Soon
                                        </div>
                                    )}

                                    {/* Info Button (Top Right) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInfoId(isInfoOpen ? null : exp.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            zIndex: 10,
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: isInfoOpen ? '#7C3AED' : (isHovered ? 'rgba(124, 58, 237, 0.08)' : 'rgba(0,0,0,0.04)'),
                                            color: isInfoOpen ? '#fff' : (isHovered ? '#7C3AED' : '#9CA3AF'),
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s ease',
                                            opacity: isHovered || isInfoOpen ? 1 : 0,
                                        }}
                                        title={isInfoOpen ? 'Close info' : 'Learn more'}
                                    >
                                        {isInfoOpen ? <X size={14} /> : <Info size={14} />}
                                    </button>

                                    {/* Info Overlay */}
                                    {isInfoOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 5,
                                            backgroundColor: 'rgba(255, 255, 255, 0.97)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: '13px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            padding: '28px 24px',
                                            animation: 'fadeIn 0.2s ease',
                                        }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 700,
                                                color: '#7C3AED',
                                                marginBottom: '10px',
                                                letterSpacing: '-0.2px',
                                            }}>
                                                {exp.title}
                                            </div>
                                            <p style={{
                                                fontSize: '13px',
                                                lineHeight: 1.65,
                                                color: theme.colors.text.secondary,
                                                margin: 0,
                                            }}>
                                                {exp.info}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setInfoId(null);
                                                    handleSelect(exp);
                                                }}
                                                style={{
                                                    marginTop: '16px',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: '#7C3AED',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    alignSelf: 'flex-start',
                                                    transition: 'background 0.2s ease',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#6D28D9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#7C3AED'}
                                            >
                                                Start building →
                                            </button>
                                        </div>
                                    )}

                                    {/* Illustration Area */}
                                    <div style={{
                                        height: '190px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0',
                                        backgroundColor: isHovered ? '#FAFAFF' : '#FAFAFA',
                                        transition: 'background-color 0.25s ease',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Illustration />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div style={{
                                        padding: '14px 18px 16px',
                                        borderTop: '1px solid #F3F4F6',
                                    }}>
                                        <span style={{
                                            fontSize: '13.5px',
                                            fontWeight: 600,
                                            color: theme.colors.text.primary,
                                            letterSpacing: exp.id === 'spinthewheel' ? '0.04em' : '-0.1px',
                                        }}>
                                            {exp.title}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </PageContainer>

            {/* Coming Soon Toast */}
            {showComingSoon && (
                <div style={{
                    position: 'fixed',
                    bottom: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    padding: '12px 28px',
                    borderRadius: '12px',
                    background: '#1F2937',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'toastIn 0.35s ease',
                }}>
                    <span style={{ fontSize: '18px' }}>🚀</span>
                    Streaks is coming soon — stay tuned!
                </div>
            )}

            {/* Inline keyframe for info overlay fade-in */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CreateCampaign;
