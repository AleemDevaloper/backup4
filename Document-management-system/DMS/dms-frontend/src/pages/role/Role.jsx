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
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import { createUser, deleteUser, listUsers, updateUser } from "../../api/users";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Role = () => {
  const { theme } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    empId: "",
    password: "",
    role: "Simple User",
  });

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.empId || !formData.password) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      empId: formData.empId,
      password: formData.password,
      role: formData.role,
    };

    try {
      if (editId) await updateUser(editId, payload);
      else await createUser(payload);
      setUsers(await listUsers());
      setEditId(null);
    } catch (err) {
      alert(err?.message || "Failed to save user");
    }

    setFormData({
      name: "",
      email: "",
      empId: "",
      password: "",
      role: "Simple User",
    });
  };

  const handleDelete = async (user) => {
    if (!user?.id) return;
    try {
      await deleteUser(user.id);
      setUsers(await listUsers());
    } catch (err) {
      alert(err?.message || "Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      empId: user?.empId || "",
      password: "",
      role: user?.role || "Simple User",
    });
    setEditId(user?.id || null);
  };

  

 

 
  
 
  return (
    <div className="container pe-2">


      {/* FORM */}
      <form onSubmit={handleSubmit} className="card p-4 shadow mb-4">
        <h4 className="mb-5 d-flex justify-content-start align-items-center mb-2" style={{ color: 'var(--text-primary)' }}>
          <FontAwesomeIcon icon={faPlus} className="me-3 mb-1 icon-button" />
          {editId ? "Edit User" : "Add New User"}
        </h4>
        <div className="row">

          <div className="col-md-4 mb-3">
            <label className="d-flex justify-content-start align-items-center mb-2"  style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faUser} className="icon-button me-2" />Name</label>
            <input className="form-control" name="name"
              value={formData.name} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="d-flex justify-content-start align-items-center mb-2"  style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faEnvelope} className="icon-button me-2" />Email</label>
            <input className="form-control" name="email"
              value={formData.email} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="d-flex justify-content-start align-items-center mb-2"  style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faIdBadge} className="icon-button me-2" />Employee ID</label>
            <input className="form-control" name="empId"
              value={formData.empId} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="d-flex justify-content-start align-items-center mb-2"  style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faLock} className="icon-button me-2" />Password</label>
             <div className="row">
              <div className="col-md-8">
              <input type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange} />
              
              </div>
              <div className="col-md-4">
                  <button type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}>
              {/* <FontAwesomeIcon icon={faEye} className="me-2" /> */}
              {showPassword ? <FontAwesomeIcon icon={faEyeSlash} className="icon-button" /> : <FontAwesomeIcon icon={faEye} className="icon-button" />}
            </button>
              </div>
             </div>
            
            

          </div>


          <div className="col-md-4 mb-3">
            <label className="d-flex justify-content-start align-items-center mb-2"  style={{ color: 'var(--text-primary)' }}><FontAwesomeIcon icon={faUserShield} className="icon-button me-2" />Role</label>
            <select className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}>
              {roles.map((r, i) => <option key={i}>{r}</option>)}
            </select>
          </div>

          

        </div>

        <button className="btn btn-primary w-100">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {editId ? "Update User" : "Add User"}
        </button>
      </form>

    

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? users.map((u, i) => (
              <tr key={u.id ?? i}>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>{i + 1}</td>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>{u.name}</td>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>{u.email}</td>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>{u.empId}</td>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>{u.role}</td>
                <td style={{ color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                  <button className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(u)}>
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(u)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
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

export default Role





























