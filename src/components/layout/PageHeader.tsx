import React from 'react';
import { theme } from '../../styles/design-tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * PageHeader - Reusable page header component
 * Shows title, optional subtitle, and action buttons
 * Matches screenshot header layout
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header
      style={{
        minHeight: '72px',
        padding: '0 32px',
        backgroundColor: theme.colors.background.card,
        borderBottom: `1px solid ${theme.colors.border.light}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing[6],
      }}
    >
      {/* Title Section */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.sans.join(', '),
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '13px',
              fontWeight: 400,
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.sans.join(', '),
              letterSpacing: '-0.01em',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions Section */}
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[3],
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
