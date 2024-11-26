import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux'; // Importar Provider desde react-redux
//import store from './components/Redux/Store/storeindex'; // Importar el store que creamos anteriormente
import Home from './components/Home/home';
import Detail from './components/Eventdetail/detail';

function App() {
  return (
    // Proveemos el store a toda la aplicación
    //<Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<Detail />} />
        </Routes>
      </Router>
    //</Provider>
  );
}

export default App;

