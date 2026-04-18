import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setApiError("");
    try {
      const data = await signup(form.name.trim(), form.email.trim(), form.password);
      navigate("/verify-otp", {
        state: { email: form.email.trim(), message: data.message },
      });
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
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
              Looks like you're new here!
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>
              Sign up with your email to get started with millions of products at the best prices.
            </p>
          </div>
          <div className="auth-sidebar-img">🛒</div>
          <div className="auth-sidebar-footer">© 2024 Flipkart Clone</div>
        </div>

        {/* Form Panel */}
        <div className="auth-panel">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> &nbsp;Creating Account…</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <div className="auth-toggle">
            Already have an account?{" "}
            <Link to="/login" className="btn-link">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
