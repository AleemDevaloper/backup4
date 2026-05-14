import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';


const AccountPic = () => {
  const { currentUser, updateUserProfile } = useApp();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  

  return (
    <div className="container">
       <div className="card-body">
              {success && (
                <div className="alert alert-success">{success}</div>
              )}

              <div className="text-center">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
               </div>

            </div>
    </div>
  );
};

export default AccountPic;