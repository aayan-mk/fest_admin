import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import AnimatedPerson from "./AnimatedPerson";

export default function VerifyOTP() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email") || "";

  if (!email) return <Navigate to="/" replace />;

  useEffect(() => {
    console.log("VerifyOTP mounted, email=", email);
    if (!email) setStatus("No email found — please login first.");
  }, [email]);

  const verify = async () => {
    if (!email) return setStatus("No email set. Go back and login.");
    if (!token) return setStatus("Please enter the 6-digit code.");

    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify`,
        { email, token },
        { withCredentials: true }
      );

      if (res.data && res.data.success) {
        localStorage.setItem("loggedIn", "true");
        navigate("/home");
      } else {
        setStatus("Invalid OTP — please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Network or server error. Check backend and CORS.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/");

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    let arr = token.split("");
    arr[idx] = val;
    const newToken = arr.join("").padEnd(6, "");
    setToken(newToken);
    // Move focus to next box if input
    if (val && idx < 5) {
      const next = document.getElementById(`otp-box-${idx + 1}`);
      if (next) next.focus();
    }
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !token[idx] && idx > 0) {
      const prev = document.getElementById(`otp-box-${idx - 1}`);
      if (prev) prev.focus();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card enter">
        <AnimatedPerson mode={focus ? "otp" : "idle"} />
        <h2 className="auth-title">Verify One-time Password</h2>
        <div className="auth-subtitle">
          Enter the 6-digit code from your Authenticator app
        </div>

        <div className="otp-box-group" style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '18px 0 8px 0' }}>
          {[0,1,2,3,4,5].map(i => (
            <input
              key={i}
              id={`otp-box-${i}`}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={token[i] || ""}
              onChange={e => handleOtpChange(e, i)}
              onKeyDown={e => handleOtpKeyDown(e, i)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              style={{ width: 38, height: 44, textAlign: 'center', fontSize: 22, borderRadius: 8, border: '1.5px solid #6366f1', background: 'rgba(255,255,255,0.13)', color: '#f3e8ff', fontWeight: 700, outline: 'none', boxShadow: '0 1px 8px #6366f133', transition: 'border 0.2s, box-shadow 0.2s, background 0.2s' }}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {status && <div className="verify-status">{status}</div>}

        <div
          style={{ display: "flex", gap: 10, marginTop: 12 }}
        >
          <button
            className="primary-btn verify-btn"
            onClick={verify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="ghost-btn" onClick={handleBack}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
