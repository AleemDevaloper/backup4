import React, { useEffect } from 'react';

const Toast = ({
  show,
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning',
    info: 'bg-info text-white',
  };

  return (
    <div
      className={`toast show position-fixed top-0 end-0 m-3 ${typeClasses[type]}`}
      style={{ zIndex: 1050 }}
    >
      <div className="toast-body d-flex justify-content-between align-items-center">
        <span>{message}</span>
        <button
          type="button"
          className="btn-close btn-close-white ms-2"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};

export default Toast;