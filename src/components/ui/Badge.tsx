import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles = {
    default: 'bg-accent/20 text-accent border border-accent/30',
    outline: 'bg-transparent text-text-muted border border-border',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
