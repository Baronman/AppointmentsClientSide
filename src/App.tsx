import { HashRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import Services from "./pages/Admin/Services";
import Appointments from "./pages/Admin/Appointments";
// import AdminAppointments from "./pages/Admin/Appointments"; // if you made it

export default function App() {
  return (
    <HashRouter>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/book">Book Appointment</Link>
        <Link to="/admin/services">Admin Services</Link>
        <Link to="/admin/appointments">Admin Appointments</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookAppointment />} />

        <Route path="/admin/services" element={<Services />} />
        <Route path="/admin/appointments" element={<Appointments />} /> 

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </HashRouter>
  );
}
