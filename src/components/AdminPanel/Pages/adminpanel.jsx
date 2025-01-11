import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import Sidebar from '../sidebar';
import Header from '../header';
import Dashboard from './dashboard';
import Events from './events';
// import Seats from './seats';
import Places from './places';
import UsersManagement from './users';
import "./estilospaneladm.css";


const AdminPanel = () => {
  return (
    <div className="admin-panel">
      {/* <Sidebar /> */}
      <div className="main-content">
        <Header />
        <Routes>
        <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/events" element={<Events />} />
          {/* <Route path="/admin/seats" element={<Seats />} /> */}
          <Route path="/admin/places" element={<Places />} />
          <Route path="/admin/users" element={<UsersManagement />} />
        
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
