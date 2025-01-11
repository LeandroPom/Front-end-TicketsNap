import React, { useState, useEffect } from 'react';
import './carrousel.css';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // Cambio automático de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Cambia la imagen cada 5 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, [currentIndex]);

  return (
    <div className="carousel">
      <button className="carousel-button prev" onClick={goToPrevious}>
        &#8249;
      </button>

      <div className="carousel-images">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`carousel-image ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <button className="carousel-button next" onClick={goToNext}>
        &#8250;
      </button>

      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;


// Ejemplo de uso
// import Carousel from './Carousel';
// const images = [
//   'https://via.placeholder.com/800x400?text=Slide+1',
//   'https://via.placeholder.com/800x400?text=Slide+2',
//   'https://via.placeholder.com/800x400?text=Slide+3'
// ];
// <Carousel images={images} />;