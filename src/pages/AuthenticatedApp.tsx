import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import BookingManagementPage from './BookingManagementPage';
import ServicesPage from './ServicesPage';
import StaffPage from './StaffPage';
import StaffAttendancePage from './StaffAttendancePage';
import ClientsPage from './ClientsPage';
import InvoicesPage from './InvoicesPage';
import SettingsPage from './SettingsPage';
import PublicBookingPage from './PublicBookingPage';
import StaffDashboardPage from "./StaffDashboardPage";

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings" element={<BookingManagementPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/attendance" element={<StaffAttendancePage />} />
      <Route path="/staff-dashboard" element={<StaffDashboardPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/public-booking/:businessId" element={<PublicBookingPage />} />
    </Routes>
  );
};

export default AuthenticatedApp;
