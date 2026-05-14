import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartArea, faChartLine, faCog, faFileAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../../context/AppContext';
import DashboardShell from '../../components/layout/DashboardShell';
import Dashmainheading from '../../components/common/Dashmainheading';
import { MainHeading } from '../../components/common/MainHeading';
import DocumentsWorkspace from '../../components/documents/DocumentsWorkspace';
import Overview from '../Overview/Overview';
import Settings from '../settings/Settings';
import Projectentry from '../Projectentry/Projectentry';
import Report from '../Reports/Report';
import Rolereport from '../Reports/Rolereport';
import ProjectManagerRole from '../role/ProjectManagerRole';
import { listProjects } from '../../api/projects';

const roleTabs = [
  { id: 'projects', label: 'Projects Entry', icon: <FontAwesomeIcon icon={faFileAlt} /> },
  { id: 'reports', label: 'Project Reports', icon: <FontAwesomeIcon icon={faChartLine} /> },
  { id: 'role', label: 'Users', icon: <FontAwesomeIcon icon={faUsers} /> },
  { id: 'rolereport', label: 'Users Report', icon: <FontAwesomeIcon icon={faChartArea} /> },
  { id: 'settings', label: 'Settings', icon: <FontAwesomeIcon icon={faCog} /> },
];

const ProjectMDashboard = () => {
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
      heading="Project Manager Dashboard"
      homePath="/project-manager-dashboard"
      roleLabel="Project Manager Dashboard"
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
              <Dashmainheading main="Project Manager Dashboard" children="Documents" />
              <DocumentsWorkspace />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <br />
              <Dashmainheading main="Project Manager Dashboard" children="Settings" />
              <Settings />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <br />
              <Dashmainheading main="Project Manager Dashboard" children="Projects" />
              <div className="ps-3">
                <MainHeading heading="Project Entry" icon="plus" />
              </div>
              <Projectentry projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <br />
              <Dashmainheading main="Project Manager Dashboard" children="Reports" />
              <div className="ps-4">
                <MainHeading heading="Project Reports" icon="chartLine" />
              </div>
              <Report projects={projects} setProjects={setProjects} />
            </div>
          )}

          {activeTab === 'role' && (
            <div>
              <br />
              <Dashmainheading main="Project Manager Dashboard" children="Roles & Users Assignment" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Assignment" icon="userPlus" />
              </div>
              <ProjectManagerRole />
            </div>
          )}

          {activeTab === 'rolereport' && (
            <div>
              <br />
              <Dashmainheading main="Project Manager Dashboard" children="Roles & Users Report" />
              <div className="ps-4">
                <MainHeading heading="Roles & Users Report" icon="fileLine" />
              </div>
              <Rolereport />
            </div>
          )}
        </>
      )}
    />
  );
};

export default ProjectMDashboard;
