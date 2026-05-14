import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCalendarAlt,
  faEdit,
  faFileArrowDown,
  faFileCircleCheck,
  faFileCircleXmark,
  faFileUpload,
  faFolderOpen,
  faPlus,
  faProjectDiagram,
  faSearch,
  faTasks,
  faTrash,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import {
  createProject,
  deleteProject,
  downloadFile,
  getProjectSummary,
  listProjects,
  updateProject,
} from "../../api/projects";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";

const EMPTY_FORM = {
  name: "",
  srNo: "",
  client: "",
  description: "",
  submissionTime: "",
  status: "In Progress",
  teamSize: "",
  file: null,
  removeFile: false,
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const Projectentry = ({ projects, setProjects }) => {
  const { addNotification } = useApp();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadSummary() {
      try {
        const data = await getProjectSummary();
        if (!ignore) setSummary(data);
      } catch {
        if (!ignore) setSummary(null);
      }
    }

    loadSummary();

    return () => {
      ignore = true;
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return (projects || []).filter((project) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        [project.name, project.srNo, project.client, project.description]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditId(null);
  };

  const refreshProjects = async () => {
    const fresh = await listProjects();
    setProjects(fresh);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file: nextFile, removeFile: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.srNo || !formData.client) {
      addNotification("Project name, serial number, and client are required.", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        srNo: formData.srNo.trim(),
        client: formData.client.trim(),
        description: formData.description?.trim() || null,
        submissionTime: formData.submissionTime || null,
        status: formData.status || "In Progress",
        teamSize: formData.teamSize === "" ? null : Number(formData.teamSize),
        file: formData.file,
        removeFile: formData.removeFile,
      };

      if (editId) {
        await updateProject(editId, payload);
        addNotification("Project updated successfully.", "success");
      } else {
        await createProject(payload);
        addNotification("Project created successfully.", "success");
      }

      await refreshProjects();
      resetForm();
    } catch (err) {
      addNotification(err?.message || "Failed to save project.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!project?.id) return;

    const confirmed = window.confirm(`Delete project "${project.name}"?`);
    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      await refreshProjects();
      addNotification("Project removed successfully.", "success");
    } catch (err) {
      addNotification(err?.message || "Failed to delete project.", "error");
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project?.name || "",
      srNo: project?.srNo || "",
      client: project?.client || "",
      description: project?.description || "",
      submissionTime: project?.submissionTime ? project.submissionTime.slice(0, 16) : "",
      status: project?.status || "In Progress",
      teamSize: project?.teamSize ?? "",
      file: null,
      removeFile: false,
    });
    setEditId(project?.id || null);
  };

  const handleDownload = async (project) => {
    try {
      await downloadFile(project.id, project.fileName || `${project.name}.file`);
    } catch (err) {
      addNotification(err?.message || "Unable to download the file.", "error");
    }
  };

  return (
    <div className="container ">
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

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="mb-1 fw-bold">{editId ? "Update project" : "Add new project"}</h4>
              <p className="text-secondary mb-0">Manage projects with document uploads, deadlines, and status tracking.</p>
            </div>
            {editId ? (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                <FontAwesomeIcon icon={faXmark} className="me-2" />
                Cancel edit
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6 col-xl-4">
                <label className="form-label fw-semibold">Project name</label>
                <div className="input-group">
                  <span className="input-group-text"><FontAwesomeIcon icon={faProjectDiagram} /></span>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} placeholder="Enter project title" />
                </div>
              </div>

              <div className="col-md-6 col-xl-4">
                <label className="form-label fw-semibold">Serial number</label>
                <input type="text" name="srNo" className="form-control" value={formData.srNo} onChange={handleChange} placeholder="SR-001" />
              </div>

              <div className="col-md-6 col-xl-4">
                <label className="form-label fw-semibold">Client</label>
                <div className="input-group">
                  <span className="input-group-text"><FontAwesomeIcon icon={faBuilding} /></span>
                  <input type="text" name="client" className="form-control" value={formData.client} onChange={handleChange} placeholder="Client name" />
                </div>
              </div>

              <div className="col-xl-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} placeholder="Write a concise project overview" />
              </div>

              <div className="col-md-6 col-xl-3">
                <label className="form-label fw-semibold">Team size</label>
                <div className="input-group">
                  <span className="input-group-text"><FontAwesomeIcon icon={faUsers} /></span>
                  <input type="number" min="0" name="teamSize" className="form-control" value={formData.teamSize} onChange={handleChange} placeholder="0" />
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <label className="form-label fw-semibold">Submission time</label>
                <div className="input-group">
                  <span className="input-group-text"><FontAwesomeIcon icon={faCalendarAlt} /></span>
                  <input type="datetime-local" name="submissionTime" className="form-control" value={formData.submissionTime} onChange={handleChange} />
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <label className="form-label fw-semibold">Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                  <option value="In Progress">In Progress</option>
                  <option value="Win">Win</option>
                  <option value="Lose">Lose</option>
                </select>
              </div>

              <div className="col-md-6 col-xl-3">
                <label className="form-label fw-semibold">Attach file</label>
                <div className="input-group">
                  <span className="input-group-text"><FontAwesomeIcon icon={faFileUpload} /></span>
                  <input type="file" className="form-control" onChange={handleFileChange} />
                </div>
                {formData.file ? <div className="form-text">Selected: {formData.file.name}</div> : null}
                {editId ? (
                  <div className="form-check mt-2">
                    <input
                      id="removeFile"
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.removeFile}
                      onChange={(e) => setFormData((prev) => ({ ...prev, removeFile: e.target.checked, file: null }))}
                    />
                    <label htmlFor="removeFile" className="form-check-label">Remove existing file on save</label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Reset
              </button>
              <button className="btn btn-primary" disabled={saving}>
                <FontAwesomeIcon icon={editId ? faEdit : faPlus} className="me-2" />
                {saving ? "Saving..." : editId ? "Update project" : "Create project"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="mb-1 fw-bold">Project register</h4>
              <p className="text-secondary mb-0">Search, filter, review, and manage uploaded records from one workspace.</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <div className="input-group project-filter-control">
                <span className="input-group-text"><FontAwesomeIcon icon={faSearch} /></span>
                <input
                  type="text"
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, client, sr no"
                />
              </div>
              <select className="form-select project-filter-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Win">Win</option>
                <option value="Lose">Lose</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle project-table mb-0">
              <thead>
                <tr>
                  <th>SR No</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Team</th>
                  <th>Submission</th>
                  <th>File</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="fw-semibold">{project.srNo}</td>
                      <td>
                        <div className="fw-semibold">{project.name}</div>
                        <div className="text-secondary small">{project.description || "No description added"}</div>
                      </td>
                      <td>{project.client}</td>
                      <td><StatusBadge status={project.status} /></td>
                      <td>{project.teamSize ?? "—"}</td>
                      <td>{formatDateTime(project.submissionTime)}</td>
                      <td>
                        {project.hasFile ? (
                          <span className="text-success small fw-semibold">{project.fileName || "Attached"}</span>
                        ) : (
                          <span className="text-secondary small">No file</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(project)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(project)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleDownload(project)}
                            disabled={!project.hasFile}
                            title={project.hasFile ? "Download file" : "No file attached"}
                          >
                            <FontAwesomeIcon icon={project.hasFile ? faFileArrowDown : faFileCircleXmark} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-secondary">
                      No matching projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projectentry;
