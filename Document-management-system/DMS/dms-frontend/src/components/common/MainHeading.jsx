import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCog,
  faHome,
  faChartBar,
  faTrash,
  faFileAlt,
  faSignInAlt,
  faUserPlus,
  faExclamationTriangle,
  faSpinner,
  faChartLine,
  faPlus,
  faSearch,
  faClipboard,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  users: faUsers,
  cog: faCog,
  home: faHome,
  chartBar: faChartBar,
  trash: faTrash,
  search: faSearch,
  fileAlt: faFileAlt,
  signInAlt: faSignInAlt,
  userPlus: faUserPlus,
  exclamationTriangle: faExclamationTriangle,
  spinner: faSpinner,
  chartLine: faChartLine,
  plus: faPlus,
  clipboard: faClipboard,
  fileLine: faFileLines
};

export const MainHeading =({ heading , subheading, children, icon}) => {
  const selectedIcon = iconMap[icon] || faUsers;
  return (
    <div className='my-3 container'>
      <div className="row"> 
        <div className="col-md-10 px-0">
         <h2 className='fs-4' style={{ color: 'var(--text-primary)' }}> {heading} </h2>
        <p className='fs-6' style={{ color: 'var(--text-secondary)' }}> {subheading} </p>
        </div>
        <div className="col-md-2 text-end d-flex justify-content-end align-items-center">
           <div className="icon-badge">
             <FontAwesomeIcon icon={selectedIcon} size="1" className="icon-styled" />
           </div>
        </div>
      </div>
       
        
    </div>
  )
}

