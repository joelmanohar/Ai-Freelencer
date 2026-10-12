import React from 'react';
import { Briefcase, FileText, MessageSquare } from 'lucide-react';

export default function EmptyState({ icon = 'briefcase', title, description, actionText, onAction }) {
  const renderIcon = () => {
    switch (icon) {
      case 'file':
        return <FileText size={32} strokeWidth={1.5} color="var(--slate-400)" />;
      case 'message':
        return <MessageSquare size={32} strokeWidth={1.5} color="var(--slate-400)" />;
      default:
        return <Briefcase size={32} strokeWidth={1.5} color="var(--slate-400)" />;
    }
  };

  return (
    <div style={{
      border: '1px dashed var(--slate-300)',
      borderRadius: 'var(--radius-lg)',
      padding: '60px 24px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--slate-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {renderIcon()}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--slate-500)', maxWidth: '440px', lineHeight: '1.6', marginBottom: actionText ? '20px' : '0' }}>
        {description}
      </p>

      {actionText && (
        <button onClick={onAction} className="btn btn-primary btn-md">
          {actionText}
        </button>
      )}
    </div>
  );
}
