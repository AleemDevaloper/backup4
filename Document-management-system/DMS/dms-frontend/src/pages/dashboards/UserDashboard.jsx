import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCog, faFolder, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import DashboardShell from '../../components/layout/DashboardShell';
import Dashmainheading from '../../components/common/Dashmainheading';
import { MainHeading } from '../../components/common/MainHeading';
import DocumentsWorkspace from '../../components/documents/DocumentsWorkspace';
import Overview from '../Overview/Overview';
import Usettings from '../settings/Usettings';
import Report from '../Reports/Report';
import Rolereport from '../Reports/Rolereport';
import Ceoprojectentry from '../Reports/Ceoprojectreport';
import Ceorolesearch from '../Reports/Ceorolesearch';
import { listProjects } from '../../api/projects';

const roleTabs = [
  { id: 'projects', label: 'Projects Details', icon: <FontAwesomeIcon icon={faFolder} /> },
  { id: 'reports', label: 'Project Reports', icon: <FontAwesomeIcon icon={faChartLine} /> },
  { id: 'role', label: 'Users', icon: <FontAwesomeIcon icon={faUser} /> },
  { id: 'rolereport', label: 'Users Report', icon: <FontAwesomeIcon icon={faUsers} /> },
  { id: 'settings', label: 'Settings', icon: <FontAwesomeIcon icon={faCog} /> },
];

const UserDashboard = () => {
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
      heading="User Dashboard"
      homePath="/user"
      roleLabel="User Dashboard"
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
              <Dashmainheading main="User Dashboard" children="Documents" />
              <DocumentsWorkspace />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <br />
              <Dashmainheading main="User Dashboard" children="Settings" />
              <Usettings />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <br />
              <Dashmainheading main="User Dashboard" children="Project Details" />
              <div className="ps-3">
                <MainHeading heading="Project Details" icon="clipboard" />
              </div>
              <Ceoprojectentry projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <br />
              <Dashmainheading main="User Dashboard" children="Reports" />
              <div className="ps-4">
                <MainHeading heading="Project Reports" icon="chartLine" />
              </div>
              <Report projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'role' && (
            <div>
              <br />
              <Dashmainheading main="User Dashboard" children="Roles & Users Assignment" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Assignment" icon="userPlus" />
              </div>
              <Ceorolesearch />
            </div>
          )}

          {activeTab === 'rolereport' && (
            <div>
              <br />
              <Dashmainheading main="User Dashboard" children="Roles & Users Report" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Report" icon="chartLine" />
              </div>
              <Rolereport />
            </div>
          )}
        </>
      )}
    />
  );
};

export default UserDashboard;
