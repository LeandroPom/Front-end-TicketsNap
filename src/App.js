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
// import CreateZone from './components/ManagerSeat/createzone';
import Modal from 'react-modal';
import Generaltribunes from './components/Eventdetail/generaltribune';
import MisCompras from './components/Users/miscompras';
import SuccessPage from './components/Eventdetail/succesbuy';
import Ticketscan from './components/TiketsEscan/tiketscaned';
import GeneralShow from "./components/GeneralShows/generaldetail"
import GeneralZoneForm from './components/GeneralShows/generalzoneform';
import axios from "axios";
import TicketGeneral from './components/GeneralShows/ticketgeneral';
axios.defaults.baseURL = "http://localhost:3001";







function App() {

  Modal.setAppElement('#root');


  return (

    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<Detail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-show" element={<CreateShowForm />} />
        <Route path="/event/general/:id" element={<GeneralShow />} />
        <Route path="/createplace" element={<CreatePlaceForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/events/edit/:showId" element={<EditShow />} />
        <Route path="/create/general/zone/:id" element={<GeneralZoneForm />} />
        {/* <Route path="/createzone" element={<CreateZone />} /> */}
        <Route path="/ticket-detail" element={<TicketDetail />} />
        <Route path="/generaltribune" element={<Generaltribunes />} />
        <Route path="/profile/miscompras" element={<MisCompras />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/general/ticket/success" element={<TicketGeneral />} />
        <Route path="/tickets/useQR/:ticketId" element={<Ticketscan />} />
        <Route path="/tickets/test" element={<h1>🚀 RUTA DETECTADA</h1>} />
        <Route path="*" element={<AdminPanel />} />
      </Routes>
    </Router>

  );
}

export default App;