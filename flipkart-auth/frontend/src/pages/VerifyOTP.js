import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VerifyOTP = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleDigitChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setApiError("");
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      refs[idx - 1].current?.focus();
    if (e.key === "ArrowLeft" && idx > 0) refs[idx - 1].current?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs[idx + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setDigits(paste.split(""));
      refs[5].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) return setApiError("Please enter all 6 digits");

    setLoading(true);
    setApiError("");
    try {
      await verifyOTP(email, otp);
      navigate("/login", {
        state: { message: "✅ Email verified! You can now login." },
      });
    } catch (err) {
      setApiError(err.response?.data?.message || "Verification failed. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setApiError("");
    try {
      const data = await resendOTP(email);
      setApiSuccess(data.message);
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      refs[0].current?.focus();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    navigate("/signup");
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-sidebar">
          <div>
            <div className="auth-sidebar-logo">
              Flipkart<span>Explore Plus</span>
            </div>
            <p className="auth-sidebar-text">
              Verify your email to continue
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>
              A 6-digit OTP has been sent to your email address. Please enter it to complete verification.
            </p>
          </div>
          <div className="auth-sidebar-img">📧</div>
          <div className="auth-sidebar-footer">OTP valid for 5 minutes</div>
        </div>

        <div className="auth-panel">
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">
            Enter the OTP sent to{" "}
            <strong style={{ color: "var(--fk-blue)" }}>{email}</strong>
          </p>

          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span> {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="alert alert-success">
              <span>✅</span> {apiSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">One-Time Password</label>
              <div className="otp-inputs" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-digit"
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                  />
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--fk-gray-400)", marginTop: 8 }}>
                Tip: You can paste the 6-digit code directly
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> &nbsp;Verifying…</>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--fk-gray-400)" }}>
            Didn't receive the OTP?{" "}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                className="btn-link"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending…" : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
