import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Banner = () => {
  // Estados para manejar el modal, nombre, la imagen, y la paginación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerName, setBannerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');  // Estado para la URL de la imagen
  const [imageUrlInput, setImageUrlInput] = useState(''); // Estado para la URL proporcionada por el usuario
  const [banners, setBanners] = useState([]);  // Estado para almacenar los banners cargados
  const [currentPage, setCurrentPage] = useState(1);  // Página actual de la paginación
  const [totalPages, setTotalPages] = useState(1);  // Total de páginas disponibles

  const itemsperpage =3;  // Limitar a 3 banners por página

  // Abre el modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Cierra el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setBannerName('');  // Limpiar el nombre al cerrar el modal
    setImageUrl('');  // Limpiar la URL de la imagen
    setImageUrlInput(''); // Limpiar el input de URL directa
  };

  // Código para la carga de la imagen en Cloudinary
  const handleImageUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dyrag1fir', // Tu Cloud Name
        uploadPreset: 'Solticket', // Tu Preset
        sources: ['local', 'url', 'camera'], // Fuentes de carga (local, url, cámara)
        showAdvancedOptions: true, // Mostrar opciones avanzadas si es necesario
        cropping: true, // Habilitar el recorte de la imagen
        multiple: false, // Solo permitir una imagen a la vez
        folder: 'shows', // Carpeta en Cloudinary
      },
      (error, result) => {
        if (result && result.event === 'success') {
          // Cuando la carga sea exitosa, actualizar el campo imageUrl con la URL de la imagen
          setImageUrl(result.info.secure_url); // Aquí se actualiza imageUrl
        }
      }
    );
    widget.open(); // Abre el widget
  };

  // Enviar los datos (nombre del banner y URL de la imagen) al servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bannerName || (!imageUrl && !imageUrlInput)) {
      alert('Por favor, ingresa un nombre y una imagen.');
      return;
    }

    // Usar la URL proporcionada por el usuario si está disponible, de lo contrario usar la imagen cargada
    const finalImageUrl = imageUrl || imageUrlInput;

    try {
      const response = await axios.post('/banners/', {
        name: bannerName,
        url: finalImageUrl, // Usar la URL final aquí
      });
      
      fetchBanners(); // Refrescar los banners después de agregar uno
      closeModal(); // Cierra el modal al enviar
    } catch (error) {
      console.error('Error al crear el banner:', error);
    }
  };

  // Obtener todos los banners desde el servidor
  const fetchBanners = async () => {
    try {
      const response = await axios.get('/banners/');
      setBanners(response.data.bannerArray); // Guardamos todos los banners

      // Calcular el total de páginas basándonos en el total de banners y los items por página
      setTotalPages(Math.ceil(response.data.bannerArray.length / itemsperpage)); 
    } catch (error) {
      console.error('Error al obtener los banners:', error);
    }
  };

  // Cambiar de página
  const changePage = (page) => {
    setCurrentPage(page);
  };

  // Eliminar un banner
  const handleDelete = async (name) => {
    try {
      await axios.delete(`/banners/${name}`); // Enviar una solicitud DELETE al servidor con el nombre del banner
      fetchBanners(); // Refrescar los banners después de eliminar uno
    } catch (error) {
      console.error('Error al eliminar el banner:', error);
    }
  };

  // Cargar los banners al montar el componente o cuando la página cambia
  useEffect(() => {
    fetchBanners();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Obtener los banners para la página actual (paginación del lado del cliente)
  const getCurrentPageBanners = () => {
    const startIndex = (currentPage - 1) * itemsperpage;
    const endIndex = startIndex + itemsperpage;
    return banners.slice(startIndex, endIndex);
  };

  return (
  <div
    className="
      min-h-screen
      flex flex-col
      items-center
      pt-[200px] px-4 md:px-6
      bg-[rgba(86,86,190,0.4)]
      max-w-screen-xl
      mx-auto
      z-10
    "
    style={{
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}
  >
    <button
      onClick={openModal}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
    >
      Cargar imagen de banner
    </button>

    {/* Modal */}
    {isModalOpen && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={closeModal} // para cerrar modal clickeando fuera del contenido
      >
        <div
          className="bg-[rgba(90,90,170,0.8)] p-6 rounded shadow-lg w-full max-w-md"
          onClick={(e) => e.stopPropagation()} // evitar cerrar modal al click dentro
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white font-semibold">
            <div className="flex flex-col">
              <label className="mb-1">Nombre del Banner:</label>
              <input
                type="text"
                value={bannerName}
                onChange={(e) => setBannerName(e.target.value)}
                required
                className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              {/* <button
                type="button"
                onClick={handleImageUpload}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Cargar Imagen
              </button> */}
              {imageUrl && (
                <p className="mt-2 text-green-400 font-semibold">
                  Imagen cargada ¡¡¡EXITOSAMENTE!!!  
                </p>
              )}
            </div>

            <div className="flex flex-col font-semibold">
              <label className="mb-1">Ingresa una URL de Imagen:</label>
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Contenedor que envuelve banners + paginado para alinear */}
    <div>
      {/* Lista de banners */}
     <div className="flex flex-wrap justify-center gap-6 mb-6">
  {getCurrentPageBanners().map((banner, index) => (
    <div
      key={index}
      className="bg-[rgba(90,90,170,0.7)] rounded shadow p-3 flex flex-col items-center text-white w-60"
    >
      <img
        src={banner.url}
        alt={banner.name}
        className="w-full h-32 object-cover rounded mb-2"
      />
      <span className="font-semibold mb-2 text-center">{banner.name}</span>
      <button
        onClick={() => handleDelete(banner.name)}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Eliminar
      </button>
    </div>
  ))}
</div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-4 text-white">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full ${
            currentPage === 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[rgba(90,90,170,0.7)] hover:bg-[rgba(110,110,190,0.9)]"
          }`}
        >
          Anterior
        </button>

        {totalPages > 0 ? (
          <span>
            Página {currentPage} de {totalPages}
          </span>
        ) : (
          <span>Cargando...</span>
        )}

        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-full ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[rgba(90,90,170,0.7)] hover:bg-[rgba(110,110,190,0.9)]"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
);

};

export default Banner;
