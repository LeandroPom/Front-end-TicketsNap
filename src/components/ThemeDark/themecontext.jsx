import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Inicializamos isDarkMode a false por defecto (modo claro)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Recuperamos el tema guardado en localStorage al cargar la página
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true); // Si el tema guardado es oscuro, lo establecemos
    }
  }, []);

  // Cambiar la clase del body cada vez que cambia el tema
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark'); // Guardamos el tema en localStorage
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Guardamos el tema en localStorage
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode); // Cambiar entre los modos

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
