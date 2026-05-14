import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import logo from "../../assets/images/logo1.png";
import logo2 from "../../assets/images/logo2.png";
import NotificationBox from "../../components/common/NotificationBox";
import login2 from "../../assets/images/login.png";
import { getHomeRouteForRole } from "../../utils/roles";
const Login = () => {
  const { login, notifications, removeNotification } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      else localStorage.removeItem("rememberedEmail");

      const user = await login({ email, password });
      navigate(getHomeRouteForRole(user?.role));
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center py-5">
      <NotificationBox notifications={notifications} onClose={removeNotification} />

      <div className="container">
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-lg-6 d-none d-lg-block">
            <div className="login-brand-panel text-white p-5 rounded-4 shadow-lg">
              <p className="text-uppercase text-center fs-4 fw-semibold small opacity-75 mb-2 text-white" style={{ color: 'var(--text-primary)' }}>Document Management <span style={{ color: '#40a3ff' }}>System </span></p>
              <img src={login2} alt="login image" className="img-fluid mb-4 login-brand-logo w-75 m-auto" />
              <h4 className="fw-bold text-white mb-3 text-center">Manage, Projects, teams, files, and reporting from one clean dashboard.</h4>
              <p className="mb-0 opacity-75">
                Secure access, clearer workflows, and a cleaner operational experience for admins, managers, and users. Sign in to your account and experience the difference!
              </p>
            </div>
          </div>

          <div className="col-md-10 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4 p-lg-5">
                <div className="mb-4 text-center text-lg-start">
                  <div className="d-flex align-items-center justify-content-start mb-3"><img src={logo} alt="Logo" style={{width: "25%"}}/> <img src={logo2} alt="Logo" style={{width: "25%"}} className="ms-3 mt-2"/></div>
                  <p className="text-uppercase small fw-semibold text-secondary mb-2">Welcome back</p>
                  <h2 className="fw-bold mb-2">Sign in to continue</h2>
                  <p className="text-secondary mb-0">Use your account credentials to access the PMS dashboard.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email address</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember email
                      </label>
                    </div>
                  </div>

                  {error ? <div className="alert alert-danger">{error}</div> : null}

                  <button className="btn btn-primary btn-lg w-100" disabled={submitting}>
                    <FontAwesomeIcon icon={faRightToBracket} className="me-2" />
                    {submitting ? "Signing in..." : "Login"}
                  </button>
                </form>

                <p className="text-center text-secondary small mt-4 mb-0">© 2026 Asian Consultant. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
