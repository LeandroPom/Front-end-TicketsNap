import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/home';
import Detail from './components/Eventdetail/detail';
import Navbar from './components/Navbar/navbar';
import Register from './components/Users/register';
import Login from './components/Users/login';

function App() {
  return (
    
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<Detail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    
  );
}

export default App;

