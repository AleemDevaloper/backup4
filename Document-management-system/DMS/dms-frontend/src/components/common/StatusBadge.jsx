import React from "react";

const statusClassMap = {
  Win: "success",
  Lose: "danger",
  "In Progress": "warning",
};

const StatusBadge = ({ status = "In Progress" }) => {
  const variant = statusClassMap[status] || "secondary";

  return (
    <span className={`badge rounded-pill text-bg-${variant} px-3 py-2 fw-semibold`}>
      {status}
    </span>
  );
};

export default StatusBadge;
