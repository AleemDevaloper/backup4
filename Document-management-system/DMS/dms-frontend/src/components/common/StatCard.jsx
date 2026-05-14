import React from "react";

const StatCard = ({ label, value, helper, icon }) => {
  return (
    <div className="card stat-card h-100 border-0 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-start gap-3">
        <div>
          <p className="text-uppercase small fw-semibold text-secondary mb-2">{label}</p>
          <h3 className="mb-1 fw-bold">{value}</h3>
          {helper ? <p className="text-secondary small mb-0">{helper}</p> : null}
        </div>
        {icon ? <div className="stat-card__icon">{icon}</div> : null}
      </div>
    </div>
  );
};

export default StatCard;
