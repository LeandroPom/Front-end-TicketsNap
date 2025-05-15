import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Pages/banner.css';  // Importa el archivo CSS aislado

const Banner = () => {
  // Estados para manejar el modal, nombre, la imagen, y la paginación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerName, setBannerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');  // Estado para la URL de la imagen
  const [imageUrlInput, setImageUrlInput] = useState(''); // Estado para la URL proporcionada por el usuario
  const [banners, setBanners] = useState([]);  // Estado para almacenar los banners cargados
  const [currentPage, setCurrentPage] = useState(1);  // Página actual de la paginación
  const [totalPages, setTotalPages] = useState(1);  // Total de páginas disponibles

  const itemsperpage =10;  // Limitar a 3 banners por página

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
      console.log('Banner creado exitosamente:', response.data);
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

  // Renderizar el componente
  return (
    <div className="banner-container">
      
      <button className='boton-cargar' onClick={openModal}>Cargar imagen de banner</button>

      {/* Modal */}
      {isModalOpen && (
        <div className="banner-modal">
          <div className="banner-modal-content">
            
            <form onSubmit={handleSubmit}>
              <div>
                <label>Nombre del Banner:</label>
                <input 
                  type="text" 
                  value={bannerName} 
                  onChange={(e) => setBannerName(e.target.value)} 
                  required
                />
              </div>
              <div>
  <button type="button" onClick={handleImageUpload}>Cargar Imagen</button>
  {imageUrl && (  // Aquí verificamos imageUrl
    <div>
      <p style={{color:"green"}}>Imagen cargada ¡¡¡EXITOSAMENTE!!!</p>
    </div>
  )}
</div>

              {/* Agregar campo para cargar URL directamente */}
              <div>
                <label>O ingresa una URL de la imagen:</label>
                <input 
                  type="text" 
                  value={imageUrlInput} 
                  onChange={(e) => setImageUrlInput(e.target.value)} 
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              

              <div>
                <button type="submit">Enviar</button>
                <button type="button" onClick={closeModal}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renderizar los banners */}
      <div className="banner-list">
        {getCurrentPageBanners().map((banner, index) => (
          <div key={index} className="banner-item">
            <img src={banner.url} alt={banner.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            <span>{banner.name}</span>
            <button onClick={() => handleDelete(banner.name)} className="delete-button">Eliminar</button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={() => changePage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        {/* Mostrar la página actual solo si totalPages es mayor a 0 */}
        {totalPages > 0 ? (
          <span>Página {currentPage} de {totalPages}</span>
        ) : (
          <span>Cargando...</span>  // Muestra "Cargando..." solo si no hay banners
        )}

        <button 
          onClick={() => changePage(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0}  // Deshabilitar el botón si estamos en la última página
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Banner;
