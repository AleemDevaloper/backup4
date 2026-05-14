import React from 'react';

const Topbar = ({ children, className = '' }) => {
  return (
    <header className={`d-flex justify-content-between align-items-center p-3 border-bottom ${className}`}>
      {children}
    </header>
  );
};

export default Topbar;