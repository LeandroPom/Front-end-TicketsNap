import React, { useState, useEffect } from 'react';
import './carrousel.css';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Estado para saber si el video está reproduciéndose

  // Funciones para ir a la imagen anterior o siguiente
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true); // Video empieza a reproducirse
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false); // Video se detiene
  };

  // Verifica si la URL es de YouTube para renderizar un iframe en lugar de una imagen
  const renderContent = (url, index) => {
    const isActiveVideo = url?.includes("youtube.com") || url?.includes("youtu.be");
    return isActiveVideo ? (
      <iframe
        className={`event-videos ${index === currentIndex ? 'actives' : ''}`}
        src={url?.replace("watch?v=", "embed/")}
        title="Event Video"
        frameBorder="0"
        allowFullScreen
        onPlay={handleVideoPlay} // Cuando se empieza a reproducir, se cambia el estado
        onPause={handleVideoPause} // Cuando se pausa, se cambia el estado
      ></iframe>
    ) : (
      <img className={`event-imagen ${index === currentIndex ? 'active' : ''}`} src={url} alt="Event" />
    );
  };

  // Cambio automático de imágenes (solo si no hay video reproduciéndose)
  useEffect(() => {
    if (!isVideoPlaying && images.length > 1) { // Solo cambia si hay más de una imagen
      const interval = setInterval(() => {
        goToNext();
      }, 15000); // Cambia la imagen cada 15 segundos

      return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
    }
  }, [currentIndex, isVideoPlaying, images.length]); // Recalcula el intervalo solo cuando no haya video en reproducción

  // Determina si solo hay una imagen para desactivar los botones
  const isSingleImage = images.length === 1;

  return (
    <div className="carousel">
      <button
        className="carousel-button prev"
        onClick={goToPrevious}
        disabled={isSingleImage} // Desactiva el botón si solo hay una imagen
      >
        &#8249;
      </button>

      <div className="carousel-images">
        {renderContent(images[currentIndex], currentIndex)}
      </div>

      <button
        className="carousel-button next"
        onClick={goToNext}
        disabled={isSingleImage} // Desactiva el botón si solo hay una imagen
      >
        &#8250;
      </button>

      <div className="carousel-indicators">
        {images.map((_, index) => (
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
