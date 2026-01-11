import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";
import axios from "axios";

export default function DashboardLayout() {
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const API = import.meta.env.VITE_API_URL;

  if (!localStorage.getItem("loggedIn")) return <Navigate to="/" />;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const email = localStorage.getItem("email");
      await axios.post(`${API}/api/auth/change-password`, {
        email,
        oldPassword,
        newPassword
      });
      setMessage("Password changed successfully");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setShowModal(false), 1200);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Topbar onChangePassword={() => setShowModal(true)} />
        {showModal && (
          <div className="modal-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.35)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setShowModal(false)}>
            <div className="modal" style={{background:'#222',color:'#fff',padding:'32px 28px',borderRadius:16,minWidth:320,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative'}} onClick={e => e.stopPropagation()}>
              <h3 style={{marginBottom:18,fontWeight:600,fontSize:22,textAlign:'center'}}>Change Password</h3>
              <form onSubmit={handleChangePassword} style={{display:'flex',flexDirection:'column',gap:14}}>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  style={{padding:'10px 12px',borderRadius:8,border:'1px solid #444',background:'#181818',color:'#fff',fontSize:16}}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  style={{padding:'10px 12px',borderRadius:8,border:'1px solid #444',background:'#181818',color:'#fff',fontSize:16}}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{padding:'10px 12px',borderRadius:8,border:'1px solid #444',background:'#181818',color:'#fff',fontSize:16}}
                />
                <button type="submit" disabled={loading} style={{marginTop:8,padding:'10px 0',borderRadius:8,background:'linear-gradient(90deg,#4f8cff,#6a5af9)',color:'#fff',fontWeight:600,fontSize:16,border:'none',boxShadow:'0 2px 8px rgba(80,80,255,0.08)',cursor:'pointer'}}>
                  {loading ? "Changing..." : "Change Password"}
                </button>
                {message && <div className="modal-message" style={{marginTop:8,textAlign:'center',color:message.includes('success')?'#4f8cff':'#ff4f4f',fontWeight:500}}>{message}</div>}
              </form>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',color:'#fff',fontSize:20,cursor:'pointer'}} title="Close">×</button>
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
