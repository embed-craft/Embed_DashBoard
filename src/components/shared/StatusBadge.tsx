import React from 'react';
import { theme } from '../../styles/design-tokens';

export type StatusType = 'active' | 'paused' | 'draft' | 'archived' | 'scheduled' | 'completed';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

/**
 * StatusBadge - Visual indicator for item status
 * Matches screenshot badge styling
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalizedStatus = status.toLowerCase() as StatusType;

  const getStatusStyles = (type: StatusType) => {
    switch (type) {
      case 'active':
        return {
          bg: '#ECFDF5', // emerald-50
          text: '#059669', // emerald-600
          dot: '#10B981', // emerald-500
        };
      case 'paused':
        return {
          bg: '#FFFBEB', // amber-50
          text: '#D97706', // amber-600
          dot: '#F59E0B', // amber-500
        };
      case 'draft':
        return {
          bg: '#F3F4F6', // gray-100
          text: '#4B5563', // gray-600
          dot: '#9CA3AF', // gray-400
        };
      case 'scheduled':
        return {
          bg: '#EFF6FF', // blue-50
          text: '#2563EB', // blue-600
          dot: '#3B82F6', // blue-500
        };
      case 'completed':
        return {
          bg: '#F5F3FF', // violet-50
          text: '#7C3AED', // violet-600
          dot: '#8B5CF6', // violet-500
        };
      case 'archived':
        return {
          bg: '#FEF2F2', // red-50
          text: '#DC2626', // red-600
          dot: '#EF4444', // red-500
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
          dot: '#9CA3AF',
        };
    }
  };

  const styles = getStatusStyles(normalizedStatus);
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        backgroundColor: styles.bg,
        color: styles.text,
        fontSize: isSmall ? '12px' : '13px',
        fontWeight: 500,
        textTransform: 'capitalize',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '8px',
          height: isSmall ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: styles.dot,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
