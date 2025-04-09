import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Si usas axios para la petición al servidor
import './carrousel.css';

const Carousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Obtención de banners desde el servidor
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get('/banners');  // Asegúrate de usar la URL correcta para los banners
        setBanners(response.data.bannerArray);  // Asumiendo que bannerArray contiene las URLs
      } catch (error) {
        console.error('Error al obtener los banners:', error);
      }
    };

    fetchBanners();
  }, []);

  // Funciones para ir a la imagen anterior o siguiente
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // Controlar si es un video o una imagen (dependiendo de la URL)
  const renderContent = (url, index) => {
    const isActiveVideo = url?.includes("youtube.com") || url?.includes("youtu.be");
    return isActiveVideo ? (
      <iframe
        className={`event-videos ${index === currentIndex ? 'actives' : ''}`}
        src={url?.replace("watch?v=", "embed/")}
        title="Event Video"
        frameBorder="0"
        allowFullScreen
        onPlay={() => setIsVideoPlaying(true)} // Cuando se empieza a reproducir, se cambia el estado
        onPause={() => setIsVideoPlaying(false)} // Cuando se pausa, se cambia el estado
      ></iframe>
    ) : (
      <img className={`event-imagen ${index === currentIndex ? 'active' : ''}`} src={url} alt="Event" />
    );
  };

  // Cambio automático de imágenes (solo si no hay video reproduciéndose)
  useEffect(() => {
    if (!isVideoPlaying && banners.length > 1) { // Solo cambia si hay más de una imagen
      const interval = setInterval(() => {
        goToNext();
      }, 15000); // Cambia la imagen cada 15 segundos

      return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }
  }, [currentIndex, isVideoPlaying, banners.length]);

  // Determina si solo hay una imagen para desactivar los botones
  const isSingleImage = banners.length === 1;

  return (
    <div className="carousel-home">
      <button
        className="carousel-button prev"
        onClick={goToPrevious}
        disabled={isSingleImage}
      >
        &#8249;
      </button>

      <div className="carousel-images">
        {renderContent(banners[currentIndex]?.url, currentIndex)}
      </div>

      <button
        className="carousel-button next"
        onClick={goToNext}
        disabled={isSingleImage}
      >
        &#8250;
      </button>

      <div className="carousel-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'actives' : ''}`}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
