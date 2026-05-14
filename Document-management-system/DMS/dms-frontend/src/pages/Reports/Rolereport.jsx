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

function Rolereport() {
  const { theme } = useApp();

      const [formData, setFormData] = useState({
        name: "",
        email: "",
        empId: "",
        password: "",
        role: "Simple User",
      });
    
     const [users, setUsers] = useState([]);
      const [editIndex, setEditIndex] = useState(null);
      const [showPassword, setShowPassword] = useState(false);
    
      const roles = ["Admin", "Simple User", "Project Manager", "CEO"];
    
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
    
      // Analytics
  const roleCounts = {
    Admin: users.filter(u => u.role === "Admin").length,
    "Simple User": users.filter(u => u.role === "Simple User").length,
    "Project Manager": users.filter(u => u.role === "Project Manager").length,
    CEO: users.filter(u => u.role === "CEO").length,
  };

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

  const barData = {
    labels: Object.keys(roleCounts),
    datasets: [{
      data: Object.values(roleCounts),
      backgroundColor: [
        colors.admin,
        colors.user,
        colors.manager,
        colors.ceo,
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const pieData = {
    labels: Object.keys(roleCounts),
    datasets: [{
      data: Object.values(roleCounts),
      backgroundColor: [
        colors.admin,
        colors.user,
        colors.manager,
        colors.ceo,
      ],
      borderWidth: 2,
      borderColor: colors.background,
      hoverOffset: 10,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: colors.background,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.grid,
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        ticks: {
          color: colors.text,
        },
        grid: {
          color: colors.grid,
        }
      },
      y: {
        ticks: {
          color: colors.text,
        },
        grid: {
          color: colors.grid,
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: colors.background,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.grid,
        borderWidth: 1,
        cornerRadius: 8,
      }
    }
  };

  return (
    <div className="container pe-4">
          {/* ANALYTICS */}
      <div className="row text-center mb-4">
        {Object.entries(roleCounts).map(([role, count], i) => (
          <div className="col-md-3 mb-2" key={i}>
            <div className="card p-3 shadow-sm ">
              <h6 className="d-flex justify-content-center align-items-center" style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faUserShield} className="icon-button me-2" /> {role}</h6>
              <h3 style={{ color: 'var(--primary)' }}>{count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h6 className="text-center d-flex justify-content-center align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FontAwesomeIcon icon={faChartBar} className="icon-button me-2" /> Role Distribution
            </h6>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h6 className="text-center d-flex justify-content-center align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FontAwesomeIcon icon={faChartPie} className="icon-button me-2" /> Role Share
            </h6>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Rolereport
