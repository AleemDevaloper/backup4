import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboard,
  faFileCircleCheck,
  faFolderTree,
  faShareNodes,
  faSignOutAlt,
  faStar,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import { useApp } from '../../context/AppContext';
import NotificationBox from '../common/NotificationBox';
import logo from "../../assets/images/logo1.png";

const documentNavItems = [
  { id: 'my', label: 'My Documents', icon: faFolderTree },
  { id: 'shared', label: 'Shared with Me', icon: faShareNodes },
  { id: 'favorites', label: 'Favorites', icon: faStar },
  { id: 'trash', label: 'Trash', icon: faTrash },
];

const DashboardShell = ({
  heading,
  brandTitle = 'Doclify',
  homePath,
  roleLabel,
  roleTabs,
  renderContent,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { activeTab, setActiveTab, currentCategory, setCurrentCategory, logout, documents, notifications, removeNotification, currentUser } = useApp();

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth <= 790;
      setIsMobile(nextIsMobile);
      if (nextIsMobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const documentCounts = {
    my: documents.filter((doc) => doc.ownerId === currentUser?.id && !doc.isTrash).length,
    shared: documents.filter((doc) => doc.isShared && !doc.isTrash).length,
    favorites: documents.filter((doc) => doc.isFavorite && !doc.isTrash).length,
    trash: documents.filter((doc) => doc.isTrash).length,
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleTabChange = (nextTab, nextCategory = currentCategory) => {
    setActiveTab(nextTab);
    setCurrentCategory(nextCategory);

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const sidebarClasses = [
    'sidebarcol',
    'top-0',
    'vh-100',
    'min-vh-100',
    'ps-3',
    'border-end',
    isMobile ? 'sidebarcol--mobile' : 'col-xl-2 col-md-3',
    isMobile && isSidebarOpen ? 'show' : '',
    !isMobile && !isSidebarOpen ? 'sidebarcol--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    !isMobile && isSidebarOpen ? 'col-xl-10 col-md-9 col-12' : '',
    !isMobile && !isSidebarOpen ? 'sw' : '',
    isMobile ? 'col-12' : '',
    'ps-0',
    'position-relative',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="container-fluid px-0 dashboard-shell">
      <NotificationBox notifications={notifications} onClose={removeNotification} />
      <div className="row min-vh-100">
        <div
          className={sidebarClasses}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <div className="dashboard-sidebar__header d-flex align-items-center position-relative w-100 border-bottom pb-3 pt-2">
            <div className="navbar-brand mb-0 me-0 py-0 h1 text-primary mt-2 brand w-100">
              <Link className="nav-link p-0" to={homePath}>
                <div className="dashboard-brand">
                  <div className="dashboard-brand__mark"><img src={logo}/></div>
                  <div className="dashboard-brand__copy">
                    <strong>{brandTitle}</strong>
                    <span>Document Command Center</span>
                  </div>
                </div>
              </Link>
              <button
                className="btn btn-light border rounded-3 align-items-center px-2 d-md-none"
                title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                onClick={handleToggleSidebar}
              >
                <FontAwesomeIcon icon={faXmark} className="small text-secondary" />
              </button>
            </div>
          </div>

          <div className="dashboard-sidebar__body mb-2 mt-4 overflowyscroll">
            <p className="ms-1 mb-2 dashboard-sidebar__label">Core</p>
            <nav className="dashboard-nav-block">
              <div className="d-flex justify-content-start flex-grow-1">
                <div className="nav flex-column w-100 nav-pills">
                  <button
                    className={`nav-link w-100 text-start fs-5 ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                    title="Overview"
                  >
                    <div className="d-flex justify-content-start align-items-center gx-0 colllapsedcenter">
                      <span className="me-2">
                        <FontAwesomeIcon icon={faClipboard} />
                      </span>
                      <div className="navlable">Overview</div>
                    </div>
                  </button>
                </div>
              </div>
            </nav>

            <p className="ms-1 mb-2 mt-3 dashboard-sidebar__label">Documents</p>
            <nav className="dashboard-nav-block">
              <div className="d-flex justify-content-start flex-grow-1">
                <div className="nav flex-column w-100 nav-pills">
                  {documentNavItems.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-link w-100 text-start fs-5 ${activeTab === 'documents' && currentCategory === item.id ? 'active' : ''}`}
                      onClick={() => handleTabChange('documents', item.id)}
                      title={item.label}
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div className="d-flex justify-content-start align-items-center gx-0 colllapsedcenter">
                          <span className="me-2">
                            <FontAwesomeIcon icon={item.icon} />
                          </span>
                          <div className="navlable">{item.label}</div>
                        </div>
                        <span className="dashboard-sidebar__count">{documentCounts[item.id]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <p className="ms-1 mb-2 mt-3 dashboard-sidebar__label">{roleLabel}</p>
            <nav className="dashboard-nav-block">
              <div className="d-flex justify-content-start flex-grow-1">
                <div className="nav flex-column w-100 nav-pills">
                  {roleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`nav-link w-100 text-start fs-5 ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => handleTabChange(tab.id)}
                      title={tab.label}
                    >
                      <div className="d-flex justify-content-start align-items-center gx-0 colllapsedcenter">
                        <span className="me-2">{tab.icon}</span>
                        <div className="navlable">{tab.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="dashboard-sidebar__promo">
              <div className="dashboard-sidebar__promo-icon">
                <FontAwesomeIcon icon={faFileCircleCheck} />
              </div>
              <strong>Smarter file flow</strong>
              <p>Upload, review, favorite, share, and restore documents from the same workspace.</p>
            </div>

            <p className="ms-1 mt-3 dashboard-sidebar__label">Account</p>
            <button className="btn btn-outline-primary w-100 text-start fs-5" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Log out
            </button>
          </div>
        </div>

        {isMobile && isSidebarOpen ? <div className="dashboard-sidebar__backdrop" onClick={handleToggleSidebar} /> : null}

        <div className={contentClasses} style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
          <TopNavBar heading={heading} isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
          <div className="dashboard-main-content">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
