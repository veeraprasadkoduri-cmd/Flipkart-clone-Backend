import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMsg = location.state?.message || "";
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (apiError) setApiError("");
    setNeedsVerification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setApiError("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        setNeedsVerification(data.email);
        setApiError(data.message);
      } else {
        setApiError(data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        {/* Sidebar */}
        <div className="auth-sidebar">
          <div>
            <div className="auth-sidebar-logo">
              Flipkart<span>Explore Plus</span>
            </div>
            <p className="auth-sidebar-text">
              Welcome Back!
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>
              Login to access your orders, wishlist, and exclusive deals tailored just for you.
            </p>
          </div>
          <div className="auth-sidebar-img">🛍️</div>
          <div className="auth-sidebar-footer">Secure login with JWT</div>
        </div>

        {/* Form Panel */}
        <div className="auth-panel">
          <h2 className="auth-title">Login</h2>
          <p className="auth-subtitle">Enter your credentials to continue</p>

          {successMsg && (
            <div className="alert alert-success">
              <span>✅</span> {successMsg}
            </div>
          )}

          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span> {apiError}
              {needsVerification && (
                <button
                  className="btn-link"
                  style={{ marginLeft: 8, fontSize: 12 }}
                  onClick={() =>
                    navigate("/verify-otp", { state: { email: needsVerification } })
                  }
                >
                  Verify now →
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> &nbsp;Logging in…</>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--fk-gray-400)" }}>
            By continuing, you agree to Flipkart's Terms of Use and Privacy Policy
          </div>

          <div className="divider">New to Flipkart?</div>

          <Link to="/signup" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary"
              style={{ background: "white", color: "var(--fk-blue)", border: "1.5px solid var(--fk-blue)", marginTop: 0 }}
            >
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
