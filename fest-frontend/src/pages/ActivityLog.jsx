import { useEffect, useState } from "react";
import axios from "axios";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/activity-log`)
      .then((res) => {
        setLogs(res.data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px #0001", padding: 32, color: '#222', fontFamily: 'Inter, Arial, sans-serif', fontSize: 16 }}>
      <h2 style={{ marginBottom: 20, color: '#1a237e', fontWeight: 800 }}>Activity Log</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse", color: '#222', fontFamily: 'Inter, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", color: '#1a237e', fontWeight: 700 }}>Email</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: '#1a237e', fontWeight: 700 }}>Action</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: '#1a237e', fontWeight: 700 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ padding: "8px 12px" }}>{log.email}</td>
                <td style={{ padding: "8px 12px" }}>{log.action}</td>
                <td style={{ padding: "8px 12px" }}>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}