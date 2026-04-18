import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Flipkart
        <span>Explore Plus</span>
      </Link>
      <div className="navbar-spacer" />
      {user ? (
        <>
          <span className="navbar-user">👋 {user.name}</span>
          <button className="navbar-btn" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className="navbar-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="navbar-btn"
            onClick={() => navigate("/signup")}
            style={{ background: "var(--fk-yellow)", color: "white" }}
          >
            Sign Up
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
