import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom'; // Mantén solo los componentes necesarios
import Home from './components/Home/home';
import Detail from './components/Eventdetail/detail';
import Navbar from './components/Navbar/navbar';
import Register from './components/Users/register';
import Login from './components/Users/login';
import CreateShowForm from './components/Shows/createshowform';
import AdminPanel from './components/AdminPanel/Pages/adminpanel';
import Profile from './components/Users/profile';
import EditShow from './components/AdminPanel/Pages/editevent';
import TicketDetail from './components/Eventdetail/TicketDetail';
import Modal from 'react-modal';
import Generaltribunes from './components/Eventdetail/generaltribune';
import MisCompras from './components/Users/miscompras';
import SuccessPage from './components/Eventdetail/succesbuy';
import Ticketscan from './components/TiketsEscan/tiketscaned';
import GeneralShow from "./components/GeneralShows/generaldetail";
import GeneralZoneForm from './components/GeneralShows/generalzoneform';
import axios from "axios";
import TicketGeneral from './components/GeneralShows/ticketgeneral';
import { PaymentFailed } from './components/Eventdetail/Pagofallido';

axios.defaults.baseURL = "http://localhost:3001"; 

function App() {
  Modal.setAppElement('#root');

  // Usar el hook useLocation para obtener la ruta actual
  const location = useLocation();

  // Cambiar el overflow en el body según la ruta
  useEffect(() => {
    if (location.pathname === '/') {
      document.body.style.overflow = 'hidden'; // Ocultar overflow en la ruta principal "/"
    } else {
      document.body.style.overflow = 'visible'; // Permitir overflow en las demás rutas
    }
  }, [location.pathname]); // Ejecutar cada vez que cambia la ruta

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<Detail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-show" element={<CreateShowForm />} />
        <Route path="/event/general/:id" element={<GeneralShow />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/events/edit/:showId" element={<EditShow />} />
        <Route path="/create/general/zone/:id" element={<GeneralZoneForm />} />
        <Route path="/ticket-detail" element={<TicketDetail />} />
        <Route path="/generaltribune" element={<Generaltribunes />} />
        <Route path="/profile/miscompras" element={<MisCompras />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/success/:id" element={<SuccessPage />} />
        <Route path="/general/ticket/success" element={<TicketGeneral />} />
        <Route path="/general/ticket/success/:id" element={<TicketGeneral />} />
        <Route path="/tickets/useQR/:ticketId" element={<Ticketscan />} />
        <Route path="/failure" element={<PaymentFailed />} />
        <Route path="/tickets/test" element={<h1>🚀 RUTA DETECTADA</h1>} />
        <Route path="*" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

export default App;
