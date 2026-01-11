import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Setup2FA() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      setError("No email found. Please login first.");
      return;
    }

    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_API_URL}/api/auth/setup`, { email }, { withCredentials: true })
      .then((res) => setQr(res.data.qr))
      .catch((err) => {
        console.error(err);
        setError("Failed to load QR. Check backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="auth-container">
      <div className="float-circle c1" />
      <div className="float-circle c2" />

      <div className="auth-card enter" style={{ maxWidth: 480, textAlign: 'center' }}>
        <h2 className="auth-title">Setup Google Authenticator</h2>
        <div className="auth-subtitle">Scan this QR with your Authenticator app</div>

        {loading && <p style={{ color: 'var(--muted)' }}>Loading QR...</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}

        {qr ? (
          <div className="qr-wrap" style={{ marginTop: 12 }}>
            <img src={qr} alt="QR" />
            <div className="small-link" onClick={() => navigate('/verify')}>I have scanned it</div>
          </div>
        ) : (
          !loading && !error && <p style={{ color: 'var(--muted)', marginTop: 16 }}>No QR available.</p>
        )}

      </div>
      <button className="ghost-btn" style={{ margin: '24px auto 0', display: 'block' }} onClick={() => navigate('/')}>
        ← Back to Login
      </button>
    </div>
  );
}
