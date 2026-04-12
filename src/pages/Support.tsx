import React, { useState } from 'react';
import { toast } from 'sonner';
import { theme } from '@/styles/design-tokens';

const Support = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!message.trim()) newErrors.message = 'This field is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const baseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
            const res = await fetch(`${baseUrl}/api/support/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    message: message.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to send message');
            }

            toast.success('Your message has been sent! We\'ll get back to you soon.');
            setName('');
            setEmail('');
            setMessage('');
            setErrors({});
        } catch (error: any) {
            console.error('Support form error:', error);
            toast.error(error.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: theme.colors.gray[50],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
            }}
        >
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px' }}>
                <p
                    style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: theme.colors.primary[600],
                        letterSpacing: '0.05em',
                        marginBottom: '12px',
                    }}
                >
                    Contact us
                </p>
                <h1
                    style={{
                        fontSize: '48px',
                        fontWeight: 700,
                        color: theme.colors.text.primary,
                        lineHeight: 1.1,
                        marginBottom: '16px',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                >
                    Get in touch
                </h1>
                <p style={{ fontSize: '15px', color: theme.colors.text.secondary, lineHeight: 1.6 }}>
                    We'd love to hear from you. Please fill out this form.
                    <br />
                    Or you can directly reach out to us at{' '}
                    <a
                        href="mailto:contactembedcraft@gmail.com"
                        style={{ color: theme.colors.text.primary, textDecoration: 'none', fontWeight: 500 }}
                    >
                        contactembedcraft@gmail.com
                    </a>
                </p>
            </div>

            {/* Form Card */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: `1px solid ${theme.colors.border.default}`,
                    padding: '40px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="support-name"
                            style={{
                                display: 'block',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}
                        >
                            Name
                        </label>
                        <input
                            id="support-name"
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                            placeholder="Matt"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                backgroundColor: '#f3f4f6',
                                border: errors.name ? '1.5px solid #ef4444' : '1.5px solid transparent',
                                borderRadius: '8px',
                                outline: 'none',
                                color: theme.colors.text.primary,
                                transition: 'border-color 0.15s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = errors.name ? '#ef4444' : theme.colors.primary[500]; }}
                            onBlur={(e) => { e.target.style.borderColor = errors.name ? '#ef4444' : 'transparent'; }}
                        />
                        {errors.name && (
                            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="support-email"
                            style={{
                                display: 'block',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}
                        >
                            Email
                        </label>
                        <input
                            id="support-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                            placeholder="matt@company.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                backgroundColor: '#f3f4f6',
                                border: errors.email ? '1.5px solid #ef4444' : '1.5px solid transparent',
                                borderRadius: '8px',
                                outline: 'none',
                                color: theme.colors.text.primary,
                                transition: 'border-color 0.15s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : theme.colors.primary[500]; }}
                            onBlur={(e) => { e.target.style.borderColor = errors.email ? '#ef4444' : 'transparent'; }}
                        />
                        {errors.email && (
                            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.email}</p>
                        )}
                    </div>

                    {/* Message Field */}
                    <div style={{ marginBottom: '28px' }}>
                        <label
                            htmlFor="support-message"
                            style={{
                                display: 'block',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: theme.colors.text.primary,
                                marginBottom: '8px',
                            }}
                        >
                            What're you looking to solve?
                        </label>
                        <textarea
                            id="support-message"
                            value={message}
                            onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(prev => ({ ...prev, message: undefined })); }}
                            placeholder="Rapid experimentation, retention rates, personalization"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '14px',
                                backgroundColor: '#f3f4f6',
                                border: errors.message ? '1.5px solid #ef4444' : '1.5px solid transparent',
                                borderRadius: '8px',
                                outline: 'none',
                                color: theme.colors.text.primary,
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.15s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = errors.message ? '#ef4444' : theme.colors.primary[500]; }}
                            onBlur={(e) => { e.target.style.borderColor = errors.message ? '#ef4444' : 'transparent'; }}
                        />
                        {errors.message && (
                            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'white',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #818cf8 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'opacity 0.2s, transform 0.1s',
                            fontFamily: 'inherit',
                        }}
                        onMouseDown={(e) => { if (!submitting) (e.target as HTMLElement).style.transform = 'scale(0.98)'; }}
                        onMouseUp={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                    >
                        {submitting ? 'Sending...' : 'Book a demo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Support;
