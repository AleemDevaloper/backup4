import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartArea, faChartLine, faCog, faFileAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import DashboardShell from '../../components/layout/DashboardShell';
import Dashmainheading from '../../components/common/Dashmainheading';
import { MainHeading } from '../../components/common/MainHeading';
import DocumentsWorkspace from '../../components/documents/DocumentsWorkspace';
import Overview from '../Overview/Overview';
import AdminSettings from '../settings/AdminSettings';
import Projectentry from '../Projectentry/Projectentry';
import Report from '../Reports/Report';
import Role from '../role/Role';
import Rolereport from '../Reports/Rolereport';
import { listProjects } from '../../api/projects';

const roleTabs = [
   { id: 'settings', label: 'Settings', icon: <FontAwesomeIcon icon={faCog} /> },
];

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const { activeTab } = useApp();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        console.error('Error loading projects from API', err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell
      heading="Admin Dashboard"
      homePath="/admin-dashboard"
      roleLabel="Admin Dashboard"
      roleTabs={roleTabs}
      renderContent={() => (
        <>
          {activeTab === 'overview' && (
            <div className="fade-in">
              <br />
              <Dashmainheading main="Dashboard" children="Overview" />
              <Overview />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="fade-in">
              <br />
              <Dashmainheading main="Admin Dashboard" children="Documents" />
              <DocumentsWorkspace />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <br />
              <Dashmainheading main="Admin Dashboard" children="Settings" />
              <AdminSettings />
            </div>
          )}

         
         
        </>
      )}
    />
  );
};

export default AdminDashboard;
