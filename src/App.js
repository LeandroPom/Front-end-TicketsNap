import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/home';
import Detail from './components/Eventdetail/detail';
import Navbar from './components/Navbar/navbar';
import Register from './components/Users/register';
import Login from './components/Users/login';
import CreateShowForm from './components/Shows/createshowform';
import CreatePlaceForm from './components/Shows/createplace';
import AdminPanel from './components/AdminPanel/Pages/adminpanel';
import Profile from './components/Users/profile';
import EditShow from './components/AdminPanel/Pages/editevent';
import TicketDetail from './components/Eventdetail/TicketDetail';
import CreateZone from './components/ManagerSeat/createzone';



function App() {
  
  return (
    
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<Detail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-show" element={<CreateShowForm />} />
          <Route path="/createplace" element={<CreatePlaceForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/events/edit/:showId" element={<EditShow />} />
          <Route path="/createzone" element={<CreateZone />} />
          <Route path="/ticket-detail" element={<TicketDetail />} />
          <Route path="*" element={<AdminPanel />} />
        </Routes>
      </Router>
      
  );
}

export default App;
