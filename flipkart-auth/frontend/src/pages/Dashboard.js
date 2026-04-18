import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const QUICK_LINKS = [
  { icon: "📦", label: "My Orders" },
  { icon: "❤️", label: "Wishlist" },
  { icon: "💳", label: "My Wallet" },
  { icon: "⭐", label: "My Reviews" },
  { icon: "📍", label: "My Addresses" },
  { icon: "🎟️", label: "Coupons" },
  { icon: "🔔", label: "Notifications" },
  { icon: "⚙️", label: "Settings" },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-avatar">{initials}</div>
        <div className="dashboard-welcome-text">
          <h2>Welcome, {user?.name}! 👋</h2>
          <p>{user?.email} · Account verified ✅</p>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                background: "var(--fk-blue-light)",
                color: "var(--fk-blue)",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Flipkart Plus Member
            </span>
            <span
              style={{
                background: "#fff3e0",
                color: "#e65100",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              0 SuperCoins
            </span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1.5px solid #e0e0e0",
              borderRadius: 4,
              padding: "8px 18px",
              color: "var(--fk-gray-700)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--fk-blue) 0%, #1a5dc8 100%)",
          borderRadius: 8,
          padding: "24px 32px",
          marginBottom: 24,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px", fontFamily: "'Rajdhani', sans-serif", fontSize: 20 }}>
            🎉 You're all set!
          </h3>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
            Your authentication system is working. JWT token stored securely.
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 6,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          User ID: #{user?.id}
        </div>
      </div>

      {/* Quick Links Grid */}
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, marginBottom: 16, color: "var(--fk-text)" }}>
        Quick Links
      </h3>
      <div className="dashboard-grid">
        {QUICK_LINKS.map((item) => (
          <div key={item.label} className="dashboard-card">
            <div className="dashboard-card-icon">{item.icon}</div>
            <div className="dashboard-card-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
