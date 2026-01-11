import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Setup2FA from "./pages/Setup2FA";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";
import DashboardLayout from "./layouts/DashboardLayout";
import CreateContingent from "./pages/contingents/CreateContingent";
import ManageContingents from "./pages/contingents/ManageContingents";
import CreateEvent from "./pages/events/CreateEvent";
import ManageEvent from "./pages/events/ManageEvent";
import CreateSheet from "./pages/prs/CreateSheet";
import ManageSheet from "./pages/prs/ManageSheet";
import Utsav2026Sheet from "./pages/Utsav2026Sheet";
import Carpediem3_0Sheet from "./pages/Carpediem3_0Sheet";
import ActivityLogPage from "./pages/ActivityLog";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/setup" element={<Setup2FA />} />
        <Route path="/verify" element={<VerifyOTP />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/contingents/create" element={<CreateContingent />} />
          <Route path="/contingents/manage" element={<ManageContingents />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/manage" element={<ManageEvent />} />
          <Route path="/prsheets/create" element={<CreateSheet />} />
          <Route path="/prsheets/manage" element={<ManageSheet />} />
          <Route path="/prsheets/utsav2026" element={<Utsav2026Sheet />} />
          <Route path="/prsheets/carpediem3_0" element={<Carpediem3_0Sheet />} />
          <Route path="/activity-log" element={<ActivityLogPage />} />
        </Route>
        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
