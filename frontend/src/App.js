import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AdminLogin from './AdminLogin';
import AttendanceRecords from './AttendanceRecords';
import MainPage from './MainPage';
import AdminRegistration from './AdminRegistration';
import EmployeeLogin from './EmployeeLogin';
import AdminDashboard from './AdminDashboard';
import VerifyOTP from './VerifyOTP';
import Verify from './Verify';
import UserDashboard from './UserDashboard';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/attendance" element={<AttendanceRecords />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin-registration" element={<AdminRegistration />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/home" element={<Home />} /> {/* Home page after login */}
      </Routes>
    </Router>
  );
}

export default App;