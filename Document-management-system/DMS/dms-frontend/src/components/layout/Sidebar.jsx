import React from 'react';

const Sidebar = ({ children, className = '' }) => {
  return (
    <aside className={`bg-light p-3 ${className}`} >
      {children}
    </aside>
  );
};

export default Sidebar;