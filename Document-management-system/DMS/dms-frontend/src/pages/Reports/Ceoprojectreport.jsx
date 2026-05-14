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
import { faProjectDiagram, faCheckCircle, faTimesCircle, faClock, faUser, faIdBadge, faBuilding, faFileAlt, faUsers, faCalendarAlt, faTasks, faPlus, faEdit, faTrash, faSearch, faChartBar, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";


ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Ceoprojectentry = ({ projects, setProjects }) => {
  const { theme } = useApp();
  
  const [search, setSearch] = useState("");
  
  // Theme-aware colors
  const isDark = theme === 'dark';
  


  // Search
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.srNo.toLowerCase().includes(search.toLowerCase())
  );

 




  return (
    <div className="container pe-2">
     

      {/* SEARCH */}
      <div className="input-group mb-4">
        <span className="input-group-text">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="text"
          placeholder="Search projects..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <br />
        {/* TABLE */}
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faIdBadge} className="icon-button me-2" /> Sr</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faProjectDiagram} className="icon-button me-2" /> Name</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faBuilding} className="icon-button me-2" /> Client</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faFileAlt} className="icon-button me-2" /> Description</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faUsers} className="icon-button me-2" /> Team Size</div></th>
              <th><div className="d-flex justify-content-start align-items-center"><FontAwesomeIcon icon={faTasks} className="icon-button me-2" /> Status</div></th>
          </tr>
        </thead>

        <tbody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((p, i) => (
              <tr key={i}>
                <td>{p.srNo}</td>
                <td>{p.name}</td>
                <td>{p.client}</td>
                <td>{p.description}</td>
                <td>{p.teamSize}</td>
                <td>{p.status}</td>
                
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No Data</td>
            </tr>
          )}
        </tbody>
      </table>




     

    
    </div>
  );
};

export default Ceoprojectentry;
