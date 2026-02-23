import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';

const EXPERIENCE_TYPES = [
    {
        id: 'nudges',
        title: 'In-app nudges',
        description: 'Guide users intuitively inside your application with highly targeted tooltips, dynamic banners, and subtle floaters.',
        icon: MessageSquare,
        color: theme.colors.primary[600],
        bgColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[200],
    },
    {
        id: 'messages',
        title: 'Out-of-app Messages',
        description: 'Re-engage users beyond the app using personalized push notifications and automated email sequences.',
        icon: Smartphone,
        color: theme.colors.purple[600],
        bgColor: theme.colors.purple[50],
        borderColor: theme.colors.purple[200],
    },
];

const CreateCampaign = () => {
    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        navigate(`/campaign-builder?experience=${id}`);
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
                                    onClick={() => handleSelect(exp.id)}
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
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = exp.borderColor}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
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
