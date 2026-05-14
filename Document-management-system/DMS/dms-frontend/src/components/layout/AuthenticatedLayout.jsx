import React from 'react';
import { useApp } from '../../context/AppContext';
import NotificationBox from '../common/NotificationBox';

const AuthenticatedLayout = ({ children }) => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="d-flex flex-column min-vh-100">
      <NotificationBox notifications={notifications} onClose={removeNotification} />
      <div className="flex-grow-1">{children}</div>
    </div>
  );
};

export default AuthenticatedLayout;
