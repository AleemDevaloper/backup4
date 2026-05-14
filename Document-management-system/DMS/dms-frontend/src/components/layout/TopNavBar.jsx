import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faChevronDown, faMoon, faSignOutAlt, faSun, faUser } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import { listNotifications } from "../../api/notifications";

const TopNavBar = ({ heading, isSidebarOpen = true, onToggleSidebar }) => {
  const { currentUser, logout, setActiveTab, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [serverNotifications, setServerNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [hover2, setHover2] = useState(false);
  const userRole = currentUser?.role;

  useEffect(() => {
    let cancelled = false;

    if (!userRole) {
      setServerNotifications([]);
      return undefined;
    }

    const fetchNotifications = async () => {
      try {
        const data = await listNotifications(userRole);
        if (!cancelled) {
          setServerNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setServerNotifications([]);
        }
        console.error("Notification error:", err);
      }
    };

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = useMemo(
    () =>
      currentTime.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime]
  );

  const handleAccountClick = () => {
    setActiveTab("settings");
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
      setShowDropdown(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-body project-topbar px-4 px-md-4 ps-lg-4 px-lg-4 py-2" style={{ zIndex: 99 }}>
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between gap-1">
        <div className="row gx-0 d-flex align-items-center">
          <button
            className="btn btn-light border rounded-3 align-items-center px-2"
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <FontAwesomeIcon icon={faBars} className="small text-secondary" />
          </button>
        </div>
        <div className="col-lg-4 col-md-4 col-4">
          <p className="small fw-semibold text-secondary mb-1 ">Workspace</p>
          <h5 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>{heading}</h5>
        </div>

        <div className="d-flex align-items-center gap-2 gap-lg-3 col-lg-7 col-md-7 col-6 justify-content-end">
          <div className="d-none d-md-block text-end">
            <div className="small text-secondary">Current time</div>
            <div className="fw-semibold" style={{ color: "var(--text-primary)" }}>{formatted}</div>
          </div>

          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={toggleTheme}
            title="Switch theme"
            aria-label="Switch theme"
          >
            <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
          </button>

          <div className="position-relative" ref={notificationRef}>
            <button
              className="btn btn-outline-secondary rounded-3 position-relative"
              onClick={() => setShowNotifications((prev) => !prev)}
              title="Notifications"
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              {serverNotifications.length > 0 ? (
                <span className="badgenotfication">{serverNotifications.length}</span>
              ) : null}
            </button>

            {showNotifications ? (
              <div className="dropdown-menu not-drop dropdown-menu-end show shadow border-0 notification-dropdown p-0 overflow-hidden overflow-y-scroll">
                <div className="px-3 py-2 border-bottom fw-semibold">Notifications</div>
                {serverNotifications.length === 0 ? (
                  <div className="p-3 text-secondary small">No notifications right now.</div>
                ) : (
                  serverNotifications.map((notification) => (
                    <div key={notification.id} className="px-3 py-2 border-bottom small">
                      <div className="fw-semibold mb-1">{notification.title}</div>
                      <div>{notification.message}</div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>

          {currentUser ? (
            <div className="position-relative" ref={dropdownRef}>
              <button className="btn btn-light border rounded-3 d-flex align-items-center gap-2 px-2 px-lg-3" onClick={() => setShowDropdown((prev) => !prev)}>
                <div className="project-avatar">{currentUser.name?.charAt(0)?.toUpperCase() || "U"}</div>
                <div className="d-none d-lg-block text-start">
                  <div className="fw-semibold small text-truncate">{currentUser.name}</div>
                  <div className="text-secondary small text-truncate">{currentUser.role}</div>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="small text-secondary" />
              </button>

              {showDropdown ? (
                <div className="dropdown-menu accdrop dropdown-menu-end show shadow border-0 mt-2">
                  <button
                    className="dropdown-item drp py-2"
                    style={{ color: hover ? "var(--primary)" : "var(--text-primary)" }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={handleAccountClick}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Account settings
                  </button>
                  <button
                    className="dropdown-item drp py-2"
                    style={{ color: hover2 ? "var(--primary)" : "var(--text-primary)" }}
                    onMouseEnter={() => setHover2(true)}
                    onMouseLeave={() => setHover2(false)}
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
