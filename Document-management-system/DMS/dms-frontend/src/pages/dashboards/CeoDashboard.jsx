import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCog, faSearch, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import DashboardShell from '../../components/layout/DashboardShell';
import Dashmainheading from '../../components/common/Dashmainheading';
import { MainHeading } from '../../components/common/MainHeading';
import DocumentsWorkspace from '../../components/documents/DocumentsWorkspace';
import Overview from '../Overview/Overview';
import Settings from '../settings/Settings';
import Report from '../Reports/Report';
import Rolereport from '../Reports/Rolereport';
import Ceoprojectentry from '../Reports/Ceoprojectreport';
import Ceorolesearch from '../Reports/Ceorolesearch';
import { listProjects } from '../../api/projects';

const roleTabs = [
  { id: 'projects', label: 'Projects Searching', icon: <FontAwesomeIcon icon={faSearch} /> },
  { id: 'reports', label: 'Project Reports', icon: <FontAwesomeIcon icon={faChartLine} /> },
  { id: 'role', label: 'Users', icon: <FontAwesomeIcon icon={faUser} /> },
  { id: 'rolereport', label: 'Users Report', icon: <FontAwesomeIcon icon={faUsers} /> },
  { id: 'settings', label: 'Settings', icon: <FontAwesomeIcon icon={faCog} /> },
];

const CeoDashboard = () => {
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
      heading="CEO Dashboard"
      homePath="/ceo"
      roleLabel="CEO Dashboard"
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
              <Dashmainheading main="CEO Dashboard" children="Documents" />
              <DocumentsWorkspace />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <br />
              <Dashmainheading main="CEO Dashboard" children="Settings" />
              <Settings />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <br />
              <Dashmainheading main="CEO Dashboard" children="Projects" />
              <div className="ps-3">
                <MainHeading heading="Project Searching" icon="search" />
              </div>
              <Ceoprojectentry projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <br />
              <Dashmainheading main="CEO Dashboard" children="Reports" />
              <div className="ps-4">
                <MainHeading heading="Project Reports" icon="chartLine" />
              </div>
              <Report projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'role' && (
            <div>
              <br />
              <Dashmainheading main="CEO Dashboard" children="Roles & Users Assignment" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Assignment" icon="userPlus" />
              </div>
              <Ceorolesearch />
            </div>
          )}

          {activeTab === 'rolereport' && (
            <div>
              <br />
              <Dashmainheading main="CEO Dashboard" children="Roles & Users Report" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Report" />
              </div>
              <Rolereport />
            </div>
          )}
        </>
      )}
    />
  );
};

export default CeoDashboard;
