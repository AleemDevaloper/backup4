import React from 'react';

const Modal = ({
  show,
  onHide,
  title,
  children,
  size = 'medium',
  footer,
}) => {
  if (!show) return null;

  const sizeClasses = {
    small: 'modal-sm',
    medium: '',
    large: 'modal-lg',
    extraLarge: 'modal-xl',
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className={`modal-dialog ${sizeClasses[size]}`}>
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;