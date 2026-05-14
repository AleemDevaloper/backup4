
import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  const sizeClasses = {
    small: 'btn-sm',
    medium: '',
    large: 'btn-lg',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;