import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Smartphone, Film, Target, ArrowRight, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';

const EXPERIENCE_TYPES = [
    {
        id: 'nudges',
        type: 'nudge',
        title: 'In-app nudges',
        description: 'Guide users intuitively inside your application with highly targeted tooltips, dynamic banners, and subtle floaters.',
        icon: MessageSquare,
        color: theme.colors.primary[600],
        bgColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[200],
    },
    {
        id: 'messages',
        type: 'nudge',
        title: 'Out-of-app Messages',
        description: 'Re-engage users beyond the app using personalized push notifications and automated email sequences.',
        icon: Smartphone,
        color: theme.colors.purple[600],
        bgColor: theme.colors.purple[50],
        borderColor: theme.colors.purple[200],
    },
    {
        id: 'stories',
        type: 'nudge',
        title: 'Stories',
        description: 'Create immersive, full-screen story experiences with slides, timelines, and rich media to captivate your users.',
        icon: Film,
        color: '#DB2777',
        bgColor: '#FDF2F8',
        borderColor: '#FBCFE8',
    },
    {
        id: 'challenge',
        type: 'challenge',
        title: 'Gamified Challenge',
        description: 'Architect complex, multi-step player journeys with logic gating, event tracking, and an integrated reward economy.',
        icon: Target,
        color: '#059669', // Emerald 600
        bgColor: '#ecfdf5', // Emerald 50
        borderColor: '#6ee7b7', // Emerald 300
    },
    {
        id: 'spinthewheel',
        type: 'gamification', // or whatever type
        title: 'Spin The Wheel',
        description: 'Engage users with a gamified reward wheel to increase conversions and retention.',
        icon: Sparkles, // importing Sparkles or use another one
        color: '#9333ea', // Purple 600
        bgColor: '#faf5ff', // Purple 50
        borderColor: '#d8b4fe', // Purple 300
    },
];

const CreateCampaign = () => {
    const navigate = useNavigate();

    const handleSelect = (exp: typeof EXPERIENCE_TYPES[0]) => {
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
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50], display: 'flex', flexDirection: 'column' }}>
            <PageContainer>
                {/* Main Content Wrapper - Centered Vertically & Horizontally */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 120px)', // Account for general UI padding
                    padding: '40px 20px',
                }}>

                    {/* Hero Text Section */}
                    <div style={{ textAlign: 'center', marginBottom: '64px', maxWidth: '600px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.colors.primary[50],
                            padding: '8px 16px',
                            borderRadius: theme.borderRadius.full,
                            color: theme.colors.primary[700],
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '24px',
                            gap: '8px'
                        }}>
                            <Sparkles size={16} /> New Campaign
                        </div>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: 800,
                            color: theme.colors.text.primary,
                            marginBottom: '20px',
                            letterSpacing: '-1.5px',
                            lineHeight: 1.1
                        }}>
                            What are you building today?
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: theme.colors.text.secondary,
                            lineHeight: 1.6
                        }}>
                            Choose the core experience to begin crafting your engagement strategy. You can always build and link both together later.
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                        gap: '32px',
                        maxWidth: '900px',
                        width: '100%',
                    }}>
                        {EXPERIENCE_TYPES.map((exp) => {
                            const Icon = exp.icon;
                            return (
                                <div
                                    key={exp.id}
                                    onClick={() => handleSelect(exp)}
                                    style={{
                                        backgroundColor: theme.colors.white,
                                        borderRadius: '24px',
                                        border: `2px solid transparent`,
                                        padding: '40px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        boxShadow: theme.shadows.md,
                                    }}
                                    className={`hover:shadow-2xl hover:scale-[1.02] group`}
                                    onMouseOver={(e) => (e.currentTarget as HTMLElement).style.borderColor = exp.borderColor}
                                    onMouseOut={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
                                >
                                    <div style={{
                                        backgroundColor: exp.bgColor,
                                        color: exp.color,
                                        padding: '24px',
                                        borderRadius: '20px',
                                        marginBottom: '32px',
                                        display: 'inline-flex',
                                        transition: 'transform 0.3s ease',
                                    }} className="group-hover:-translate-y-2">
                                        <Icon size={48} strokeWidth={1.5} />
                                    </div>

                                    <h3 style={{
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        color: theme.colors.text.primary,
                                        marginBottom: '16px',
                                    }}>
                                        {exp.title}
                                    </h3>

                                    <p style={{
                                        fontSize: '16px',
                                        lineHeight: 1.6,
                                        color: theme.colors.text.secondary,
                                        marginBottom: '40px',
                                        flex: 1,
                                    }}>
                                        {exp.description}
                                    </p>

                                    <Button
                                        variant="outline"
                                        className="w-full text-base font-semibold group-hover:bg-gray-50 transition-colors"
                                        style={{ height: '56px', borderRadius: '12px' }}
                                    >
                                        Create {exp.title}
                                        <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </PageContainer>
        </div>
    );
};

export default CreateCampaign;
