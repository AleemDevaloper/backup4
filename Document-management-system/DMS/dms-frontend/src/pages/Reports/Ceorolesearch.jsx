import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUser,
  faEnvelope,
  faIdBadge,
  faLock,
  faEyeSlash,
  faEye,
  faUserShield,
  faPlus,
  faPen,
  faTrash,
  faChartBar,
  faChartPie,
  faTable,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import { listUsers } from "../../api/users";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Ceorolesearch = () => {
  const { theme } = useApp();
  const [users, setUsers] = useState([]);
  const roles = ["Admin", "Simple User", "Project Manager", "CEO"];

  // Theme-aware colors
  const isDark = theme === 'dark';
  const colors = {
    admin: isDark ? '#ef4444' : '#dc3545',
    user: isDark ? '#6c757d' : '#6c757d',
    manager: isDark ? '#0dcaf0' : '#0d6efd',
    ceo: isDark ? '#212529' : '#212529',
    background: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    grid: isDark ? '#334155' : '#e5e7eb'
  };

  // Load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error("Error loading users from API", err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);



  

 
  return (
    <div className="container pe-2">





      {/* TABLE */}
      <div className="card p-3 shadow">
        <h5 className="d-flex justify-content-start align-items-center"  style={{ color: 'var(--text-primary)' }}>
          <FontAwesomeIcon icon={faUsers} className="me-2 icon-button" />
          Users List
        </h5>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <th>#</th>
              <th ><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faUser} className="icon-button me-2" /> Name</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faEnvelope} className="icon-button me-2" /> Email</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faIdBadge} className="icon-button me-2" /> ID</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faUserShield} className="icon-button me-2" /> Role</div></th>
             
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? users.map((u, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.empId}</td>
                <td>{u.role}</td>
             
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center">
                  <FontAwesomeIcon icon={faCircleExclamation} /> No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Ceorolesearch





























