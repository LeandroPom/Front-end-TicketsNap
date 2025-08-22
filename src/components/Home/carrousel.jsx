import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './carrousel.css';

const Carousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get('/banners');
        setBanners(response.data.bannerArray);
      } catch (error) {
        console.error('Error al obtener los banners:', error);
      }
    };

    fetchBanners();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  };

  const renderContent = (url, index) => {
    const isActiveVideo = url?.includes("youtube.com") || url?.includes("youtu.be");
    return isActiveVideo ? (
      <iframe
        className={`w-screen max-w-none h-auto aspect-video ${index === currentIndex ? 'block' : 'hidden'}`}
        src={url?.replace("watch?v=", "embed/")}
        title="Event Video"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    ) : (
      <img
        className={`w-screen max-w-none h-auto object-cover ${index === currentIndex ? 'block' : 'hidden'}`}
        src={url}
        alt="Event"
      />
    );
  };

  useEffect(() => {
    if (!isVideoPlaying && banners.length > 1) {
      const interval = setInterval(() => {
        goToNext();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, isVideoPlaying, banners.length]);

  const isSingleImage = banners.length === 1;

  return (
    <div className="relative top-[110px] left-0 w-screen h-auto overflow-hidden bg-gray-100 m-0 p-0 z-10">
      {/* Botón anterior */}
      <button
        onClick={goToPrevious}
        disabled={isSingleImage}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed z-20"
      >
        &#8249;
      </button>

      {/* Contenido */}
      <div className="w-screen flex justify-center items-center">
        {renderContent(banners[currentIndex]?.url, currentIndex)}
      </div>

      {/* Botón siguiente */}
      <button
        onClick={goToNext}
        disabled={isSingleImage}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed z-20"
      >
        &#8250;
      </button>
    </div>
  );
};

export default Carousel;
