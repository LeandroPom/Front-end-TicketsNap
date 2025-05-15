import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './components/Redux/Store/storeindex'; // Importar el store que creamos anteriormente
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/ThemeDark/themecontext'; // Importar el ThemeProvider
import { BrowserRouter as Router } from 'react-router-dom'; // Asegúrate de importar Router aquí


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
  <React.StrictMode>
  <ThemeProvider>
  <Router>
    <App />
  </Router>
  </ThemeProvider>
  </React.StrictMode>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
