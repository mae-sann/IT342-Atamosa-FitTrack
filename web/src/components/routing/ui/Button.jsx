// src/components/ui/Button.jsx
import React from 'react';
import styles from './Button.module.css';

/**
 * Button
 * Props:
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
 *   size     — 'sm' | 'md' | 'lg'  (default: 'md')
 *   fullWidth — boolean
 *   loading  — boolean (shows spinner, disables interaction)
 *   leftIcon / rightIcon — ReactNode
 *   disabled, onClick, type, children ...
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...props
}) {
  return (
    <button 
      className={`btn ${variant} ${size} ${fullWidth ? 'fullWidth' : ''} ${loading ? 'loading' : ''} ${className}`}
      disabled={disabled || loading} 
      {...props}
    >
      {loading ? (
        <span className="spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="icon">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && <span className="icon">{rightIcon}</span>}
    </button>
  );
}