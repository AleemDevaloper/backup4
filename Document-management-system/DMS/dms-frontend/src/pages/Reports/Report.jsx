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
import StatCard from "../../components/common/StatCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faFileCircleCheck,

  faFolderOpen,

  faProjectDiagram,

  faTasks,

} from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Report = ({ projects, setProjects }) => {

  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");




  // ✅ ANALYTICS (SAFE)
  const total = projects.length;
  const won = projects.filter(p => p.status === "Win").length;
  const lost = projects.filter(p => p.status === "Lose").length;
  const progress = projects.filter(p => p.status === "In Progress").length;

  // Charts
  const barData = {
    labels: ["Total", "Won", "Lost", "In Progress"],
    datasets: [
      {
        label: "Projects",
        data: [total, won, lost, progress],
        backgroundColor: [
          "#4F46E5",
          "#198754",
          "#dc3545",
          "#ffc107",
        ],
      },
    ],
  };

  const pieData = {
    labels: ["Won", "Lost", "In Progress"],
    datasets: [
      {
        data: [won, lost, progress],
        backgroundColor: [
          "#198754",
          "#dc3545",
          "#ffc107",
        ],
      },
    ],
  };

  return (
    <div className="container pe-2">

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <StatCard
            label="Total Projects"
            value={summary?.total ?? projects.length}
            helper="All tracked records"
            icon={<FontAwesomeIcon icon={faProjectDiagram} />}
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard
            label="In Progress"
            value={summary?.inProgress ?? projects.filter((item) => item.status === "In Progress").length}
            helper="Active pipeline"
            icon={<FontAwesomeIcon icon={faTasks} />}

          />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard
            label="Winning Bids"
            value={summary?.win ?? projects.filter((item) => item.status === "Win").length}
            helper="Successful submissions"
            icon={<FontAwesomeIcon icon={faFileCircleCheck} />}

          />
        </div>
        <div className="col-md-6 col-xl-3">
          <StatCard
            label="Files Attached"
            value={summary?.withFiles ?? projects.filter((item) => item.hasFile).length}
            helper="Records with documents"
            icon={<FontAwesomeIcon icon={faFolderOpen} />}

          />
        </div>
      </div>



      {/* CHARTS */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <Bar data={barData} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow">
            <Pie data={pieData} className="h-50 w-50 m-auto" />
          </div>
        </div>
      </div>


    </div>
  );
};

export default Report;
