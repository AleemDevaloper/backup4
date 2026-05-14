
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
 

  faUsers,
  
  faCalendarAlt,
  
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

import ProjectCharts from '../../components/common/ProjectCharts';

import Rolereport from '../Reports/Rolereport';
import { listProjects } from '../../api/projects';


const Overview = () => {
  
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const {
    
    theme,
  } = useApp();

 

  // Load projects from localStorage on component mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        console.error("Error loading projects from API", err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);





  const recent = [...projects]
    .filter((p) => p.name)
    .sort((a, b) => new Date(b.submissionTime || 0) - new Date(a.submissionTime || 0))
    .slice(0, 5);

  return (
    <div className="container-fluid min-vh-100 px-0">

    <div className="container">
              <p className="text-muted ps-2">Welcome to your dashboard! Here you can get a quick overview of your recent activity, manage your projects, and access important features.</p>

              <div className="ps-2">

                <ProjectCharts projects={projects} />
                <br />
                <Rolereport />
                <br />
                {/* project overview section  */}


                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="border rounded p-3">
                      <h5>Projects Overview</h5>

                      {projects.length > 0 ? projects.map((project, idx) => (
                        <div key={idx} className="border rounded p-3 mb-3 card-beautiful">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fw-bold mb-1">{project.name || `Project ${idx + 1}`}</h6>
                            <span className="badge" style={{
                              background: project.status?.toLowerCase() === 'win' 
                                ? (theme === 'dark' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #065f46 0%, #0d9488 100%)')
                                : project.status?.toLowerCase() === 'lose'
                                ? (theme === 'dark' ? 'linear-gradient(135deg, #f87171 0%, #fca5a5 100%)' : 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)')
                                : (theme === 'dark' ? 'linear-gradient(135deg, #fcd34d 0%, #fef08a 100%)' : 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)'),
                              color: project.status?.toLowerCase() === 'lose' && theme === 'dark' ? '#000' : (theme === 'dark' && project.status?.toLowerCase() === 'in-progress') ? '#000' : 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              fontSize: '12px',
                              border: project.status?.toLowerCase() === 'win'
                                ? (theme === 'dark' ? '2px solid #059669' : '2px solid #065f46')
                                : project.status?.toLowerCase() === 'lose'
                                ? (theme === 'dark' ? '2px solid #dc2626' : '2px solid #7f1d1d')
                                : (theme === 'dark' ? '2px solid #d97706' : '2px solid #7c2d12'),
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                              textShadow: 'none',
                              display: 'inline-block'
                            }}>
                              {project.status || 'In-progress'}
                            </span>
                          </div>
                          <p className="text-muted mb-2">{project.description || 'Project description not available'}</p>
                          <div className="d-flex align-items-center gap-4 mb-2">
                            <div className="d-flex align-items-center text-secondary">
                              <FontAwesomeIcon icon={faUsers} className="me-1" />
                              <small>{project.teamSize != null ? project.teamSize : 4} members</small>
                            </div>
                            <div className="d-flex align-items-center text-secondary">
                              <FontAwesomeIcon icon={faHistory} className="me-1" />
                              <small>{project.submissionTime || 'Completion date not set'}</small>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Status: {project.updatedStatus || 'Updated'}</small>
                            <small className="text-muted">by {project.owner || project.manager || 'Project manager'}</small>
                          </div>
                        </div>
                      )) : (
                        [
                          {
                            name: 'Project Name 1',
                            status: 'In-progress',
                            description: 'Project description',
                            teamSize: 4,
                            submissionTime: '2026-06-30 T10:00',
                            updatedStatus: 'Updated',
                            owner: 'Project manager',
                          },
                          {
                            name: 'Project Name 2',
                            status: 'Win',
                            description: 'Project description',
                            teamSize: 4,
                            submissionTime: '2026-08-15T10:00',
                            updatedStatus: 'Updated',
                            owner: 'Admin',
                          },
                        ].map((project, idx) => (
                          <div key={idx} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="fw-bold mb-1">{project.name}</h6>
                              <span className="badge" style={{
                                background: project.status.toLowerCase() === 'win'
                                  ? (theme === 'dark' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #065f46 0%, #0d9488 100%)')
                                  : project.status.toLowerCase() === 'lose'
                                  ? (theme === 'dark' ? 'linear-gradient(135deg, #f87171 0%, #fca5a5 100%)' : 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)')
                                  : (theme === 'dark' ? 'linear-gradient(135deg, #fcd34d 0%, #fef08a 100%)' : 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)'),
                                color: project.status.toLowerCase() === 'lose' && theme === 'dark' ? '#000' : (theme === 'dark' && project.status.toLowerCase() === 'in-progress') ? '#000' : 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                border: project.status.toLowerCase() === 'win'
                                  ? (theme === 'dark' ? '2px solid #059669' : '2px solid #065f46')
                                  : project.status.toLowerCase() === 'lose'
                                  ? (theme === 'dark' ? '2px solid #dc2626' : '2px solid #7f1d1d')
                                  : (theme === 'dark' ? '2px solid #d97706' : '2px solid #7c2d12'),
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                textShadow: 'none',
                                display: 'inline-block'
                              }}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-muted mb-2">{project.description}</p>
                            <div className="d-flex align-items-center gap-4 mb-2">
                              <div className="d-flex align-items-center text-secondary">
                                <FontAwesomeIcon icon={faUsers} className="me-1" />
                                <small>{project.teamSize} members</small>
                              </div>
                              <div className="d-flex align-items-center text-secondary">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                <small>{project.submissionTime}</small>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">Status: {project.updatedStatus}</small>
                              <small className="text-muted">by {project.owner}</small>
                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  </div>
                  <div className="col-md-4">
                     <div className="card p-3">
                  <h5>Recent Projects</h5>
                  <ul className="list-group list-group-flush">
                    {recent.map((project, i) => (
                      <li key={i} className="list-group-item badge card-beautiful" >
                        {project.name || `Project #${i + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
                  </div>
                </div>
                
              </div>
              </div>
      

    </div>
  );
};

export default Overview;



// import React from 'react'

// function Overview() {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default 
