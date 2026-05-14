import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AccountPic from './AccountPic';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserGear, faSliders } from "@fortawesome/free-solid-svg-icons";


const Settings = () => {
  const { currentUser, settings, updateUserProfile, updateSettings, settingtheme } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState(settings);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      setErrors({ profile: 'Name and email are required' });
      return;
    }
    if (!profileData.email.includes('@')) {
      setErrors({ profile: 'Please enter a valid email' });
      return;
    }
    updateUserProfile(profileData);
    setErrors({});
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setErrors({ password: 'All password fields are required' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    // In a real app, you'd verify current password and update it
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setSuccess('Password changed successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePreferencesUpdate = (e) => {
    e.preventDefault();
    updateSettings(preferences);
    setSuccess('Preferences updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FontAwesomeIcon icon={faUser} /> },
    { id: 'account', label: 'Account', icon: <FontAwesomeIcon icon={faUserGear} /> },
    { id: 'preferences', label: 'Preferences', icon: <FontAwesomeIcon icon={faSliders} /> },
  ];

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Settings</h5>
              <div className="nav flex-column nav-pills">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-link text-start ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="me-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              {success && (
                <div className="alert alert-success">{success}</div>
              )}
             
              
              {activeTab === 'profile' && (
                <div>
                  <h4>Profile Settings</h4>
                  <AccountPic />
                  <form onSubmit={handleProfileUpdate}>
                    <Input
                      label="Full Name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      error={errors.profile}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      error={errors.profile}
                      required
                    />
                    <Button type="submit" variant="primary">
                      Update Profile
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h4>Account Settings</h4>
                  <form onSubmit={handlePasswordChange}>
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      error={errors.password}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      error={errors.password}
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      error={errors.password}
                      required
                    />
                    <Button type="submit" variant="primary">
                      Change Password
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h4>Preferences</h4>
                  <form onSubmit={handlePreferencesUpdate}>
                    <div className="mb-3">
                      <label className="form-label">Theme</label>
                      <select
                        className="form-select"
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Language</label>
                      <select
                        className="form-select"
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      >
                        <option value="en">English</option>
                      
                      </select>
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="notifications"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="notifications">
                        Enable Notifications
                      </label>
                    </div>
                    <Button type="submit" variant="primary" onClick={() => settingtheme(preferences.theme)}>
                      Save Preferences
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;