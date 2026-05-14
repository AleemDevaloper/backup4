import React from "react";
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
import { faProjectDiagram, faCheckCircle, faTimesCircle, faClock, faChartBar, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const ProjectCharts = ({ projects }) => {
  const { theme } = useApp();

  // Calculate statistics
  const total = projects.length;
  const won = projects.filter(p => p.status === "Win").length;
  const lost = projects.filter(p => p.status === "Lose").length;
  const progress = projects.filter(p => p.status === "In Progress").length;

  // Theme-aware colors
  const isDark = theme === 'dark';
  const colors = {
    total: isDark ? '#6366f1' : '#4f46e5',
    won: isDark ? '#22c55e' : '#10b981',
    lost: isDark ? '#ef4444' : '#ef4444',
    progress: isDark ? '#f59e0b' : '#f59e0b',
    background: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    grid: isDark ? '#334155' : '#e5e7eb'
  };

  // Bar chart data
  const barData = {
    labels: ["Total", "Won", "Lost", "In Progress"],
    datasets: [
      {
        label: "Projects",
        data: [total, won, lost, progress],
        backgroundColor: [
          colors.total,
          colors.won,
          colors.lost,
          colors.progress,
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Pie chart data
  const pieData = {
    labels: ["Won", "Lost", "In Progress"],
    datasets: [
      {
        data: [won, lost, progress],
        backgroundColor: [
          colors.won,
          colors.lost,
          colors.progress,
        ],
        borderWidth: 2,
        borderColor: colors.background,
        hoverOffset: 10,
      },
    ],
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
    <div className="row mb-4">
      {/* Analytics Cards */}
      <div className="row text-center mb-4">
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <FontAwesomeIcon icon={faProjectDiagram} className="icon-button mb-2" size="2x" />
            <h6>Total Projects</h6>
            <h4 style={{ color: colors.total }}>{total}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-2" size="2x" />
            <h6>Won</h6>
            <h4 className="text-success">{won}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <FontAwesomeIcon icon={faTimesCircle} className="text-danger mb-2" size="2x" />
            <h6>Lost</h6>
            <h4 className="text-danger">{lost}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center">
            <FontAwesomeIcon icon={faClock} className="text-warning mb-2" size="2x" />
            <h6>In Progress</h6>
            <h4 className="text-warning">{progress}</h4>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5 className="text-center mb-3">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              Project Status Overview
            </h5>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5 className="text-center mb-3">
              <FontAwesomeIcon icon={faChartPie} className="me-2" />
              Project Status Distribution
            </h5>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCharts;