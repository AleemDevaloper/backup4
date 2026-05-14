import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Input;