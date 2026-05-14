import React from 'react';

const NotificationBox = ({ notifications, onClose }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-success bg-light-success';
      case 'error':
        return 'border-danger bg-light-danger';
      case 'warning':
        return 'border-warning bg-light-warning';
      case 'info':
        return 'border-info bg-light-info';
      default:
        return 'border-secondary';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050, maxWidth: '400px' }}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`card border-2 mb-2 ${getTypeClass(notif.type)}`}
          style={{ animation: 'slideIn 0.3s ease-in-out' }}
        >
          <div className="card-body py-2 px-3">
            <div className="d-flex align-items-start">
              <span className={`${getTextColor(notif.type)} me-2 fw-bold`} style={{ fontSize: '1.2rem', lineHeight: '1rem' }}>
                {getTypeIcon(notif.type)}
              </span>
              <div className="flex-grow-1">
                <p className="mb-0">{notif.message}</p>
              </div>
              <button
                className="btn btn-link p-0 ms-2"
                onClick={() => onClose(notif.id)}
                style={{ textDecoration: 'none', fontSize: '0.875rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .bg-light-success {
          background-color: #f0f9f6;
        }
        .bg-light-danger {
          background-color: #fdf5f5;
        }
        .bg-light-warning {
          background-color: #fffbf0;
        }
        .bg-light-info {
          background-color: #f0f7ff;
        }
      `}</style>
    </div>
  );
};

export default NotificationBox;