import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

export default function Sidebar() {
  const [open, setOpen] = useState({ contingents: false, events: false, prs: false });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/activity-log`).then(res => setLogs(res.data.logs)).catch(() => setLogs([]));
    const interval = setInterval(() => {
      axios.get(`${import.meta.env.VITE_API_URL}/api/activity-log`).then(res => setLogs(res.data.logs)).catch(() => setLogs([]));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <aside className="sidebar-aesthetic">
      <div className="brand">
        <div className="mark">FA</div>
        <div className="title">Fest Admin</div>
      </div>

      <nav className="nav">
        <NavLink to="/home" className={linkClass}>
          <span className="icon">🏠</span>
          <span className="label">Home</span>
          <span className="badge" />
        </NavLink>

        <div className={`nav-group ${open.contingents ? 'open' : ''}`}>
          <button className="nav-toggle" onClick={() => toggle('contingents')}>
            <span className="icon">👥</span>
            <span className="label">Contingents</span>
            <span className={`chev ${open.contingents ? 'rot' : ''}`}>▾</span>
          </button>

          <div className="submenu">
            <NavLink to="/contingents/create" className={linkClass}>Create Contingents</NavLink>
            <NavLink to="/contingents/manage" className={linkClass}>Manage Contingents</NavLink>
          </div>
        </div>

        <div className={`nav-group ${open.events ? 'open' : ''}`}>
          <button className="nav-toggle" onClick={() => toggle('events')}>
            <span className="icon">🎟️</span>
            <span className="label">Events</span>
            <span className={`chev ${open.events ? 'rot' : ''}`}>▾</span>
          </button>

          <div className="submenu">
            <NavLink to="/events/create" className={linkClass}>Create Event</NavLink>
            <NavLink to="/events/manage" className={linkClass}>Manage Event</NavLink>
          </div>
        </div>

        <div className={`nav-group ${open.prs ? 'open' : ''}`}>
          <button className="nav-toggle" onClick={() => toggle('prs')}>
            <span className="icon">📄</span>
            <span className="label">PR Sheets</span>
            <span className={`chev ${open.prs ? 'rot' : ''}`}>▾</span>
          </button>

          <div className="submenu">
            <NavLink to="/prsheets/create" className={linkClass}>Create Sheet</NavLink>
            <NavLink to="/prsheets/manage" className={linkClass}>Manage Sheet</NavLink>
            <NavLink to="/prsheets/utsav2026" className={linkClass}>Utsav 2026 Sheet</NavLink>
            <NavLink to="/prsheets/carpediem3_0" className={linkClass}>Carpediem 3.0 Sheet</NavLink>
          </div>
        </div>

        <NavLink to="/activity-log" className={linkClass} style={{marginTop:12, fontWeight:500, color:'#1a237e'}}>
          <span className="icon">📝</span>
          <span className="label">Activity Log</span>
        </NavLink>
      </nav>

      <div className="sidebar-foot">v2.0</div>
    </aside>
  );
}
