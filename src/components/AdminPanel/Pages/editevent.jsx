import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows, getTags, updateShow } from '../../Redux/Actions/actions';
import Swal from 'sweetalert2';
import './editevent.css';

const EditShow = () => {
  const { showId } = useParams();  // Cambié id por showId
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isReadyToEdit, setIsReadyToEdit] = useState(false);
  const user = useSelector((state) => state.user);
  const shows = useSelector((state) => state.shows); // Arreglo de shows
  const loading = useSelector((state) => state.loading); // Indicador de carga
  const error = useSelector((state) => state.error); // Errores
  const tags = useSelector((state) => state.tags); // tags
  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  const [name, setName] = useState('');
  const [artists, setArtists] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); // Cambio a selectedTags
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [place, setPlace] = useState('');
  const [address, setAddress] = useState('');
  const [presentations, setPresentations] = useState([]);



  // Cargar los datos al inicio si es necesario
  useEffect(() => {
    if (shows?.length === 0) {
      dispatch(getShows());  // Cargar todos los shows si aún no están cargados
    }
    if (tags?.length === 0) {
      dispatch(getTags());  // Cargar los géneros si no están cargados
    }
  }, [dispatch, shows?.length, tags?.length]);



  // SweetAlert después de cargar los datos iniciales
  useEffect(() => {
    if (shows?.length > 0 && tags?.length > 0 && !isReadyToEdit) {
      Swal.fire({
        title: 'Editar evento',
        text: 'Datos cargados',
        icon: 'success',
        confirmButtonText: 'Ok',
        allowOutsideClick: false, // Permitir hacer clic fuera para cerrar el modal
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setIsReadyToEdit(true); // Esto debería activar la carga de datos
          dispatch(getShows());
          dispatch(getTags());
        }
      });
    }
  }, [isReadyToEdit, dispatch, shows?.length, tags?.length, navigate]);



  // Cuando los shows estén disponibles, se encuentra el show a editar
  useEffect(() => {
    if (isReadyToEdit && showId && shows?.length > 0) {
      const event = shows?.find((show) => show?.id === parseInt(showId, 10));  // Encontrar el evento con el showId
      if (event) {
        // Si se encuentra el evento, cargamos los datos en el formulario
        setName(event?.name);
        setArtists(event?.artists?.join(', ') || '');
        setSelectedTags(event?.genre || []);  // Asignamos directamente los géneros del show
        setDescription(event?.description || '');
        setPrice(event?.price || '');
        setCoverImage(event?.coverImage || '');
        setPlace(event?.location?.name || '');
        setAddress(event?.location?.address || '');
        setPresentations(event?.presentation || []);
      } else {
        console.error('No se encontró un evento con el ID:', showId);
      }
    }
  }, [isReadyToEdit, shows, showId]);




  const handleSubmit = async (e) => {
    e.preventDefault();

    const updates = {
      name,
      artists: artists.split(',').map((artist) => artist.trim()), // Asegúrate de dividir correctamente los artistas
      genre: selectedTags,
      description,
      coverImage,
    };



    const dataToSend = {
      id: showId, // El ID del show a actualizar
      updates: updates, // Los datos a actualizar
      user: {
        "isAdmin": user?.isAdmin
      },

    };


    try {
      // Realiza la solicitud PUT enviando el ID en la URL y el objeto de actualizaciones en el cuerpo
      await dispatch(updateShow(showId, dataToSend)); // Aquí pasamos los datos correctos al backend


      // Mostrar SweetAlert antes de redirigir
      await Swal.fire({
        icon: 'success',
        title: 'Evento Modificado',
        text: 'El evento fue modificado correctamente!',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-popup-success',  // Clase personalizada para el popup de éxito
        }
      });

      navigate('/admin/events'); // Redirigir después de la actualización exitosa
    } catch (error) {
      console.error('Error al actualizar el evento:', error);

    }
  };



  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!showId || shows.length === 0) {
    return <div>No se encontraron eventos.</div>;
  }

  const handleClose = () => {
    navigate('/admin/events'); // Redirigir al dashboard de eventos
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
          // Cuando la carga sea exitosa, actualizar el campo coverImage con la URL de la imagen
          setCoverImage(result.info.secure_url); // Actualizar directamente coverImage
        }
      }
    );
    widget.open(); // Abre el widget
  };

  return (

    <div className="edit-show">
      <h1>Edit Event</h1>
      <form className='form-stile' onSubmit={handleSubmit}>
        {/* Nombre del evento */}
        <div className="form-group">
          <label htmlFor="name">Nombre del evento:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Artistas */}
        <div className="form-group">
          <label htmlFor="artists">Artistas (separación con coma):</label>
          <input
            type="text"
            id="artists"
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
            required
          />
        </div>

        {/* Géneros */}
        <div className="form-group">
          <label htmlFor="tags">Generos:</label>
          <select
            id="tags"
            multiple
            value={selectedTags}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedTags((prevTags) => [...new Set([...prevTags, ...selectedOptions])]); // Agregar sin duplicados
            }}
            required
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mostrar los géneros seleccionados */}
        <div className="selected-genres">
          <h4>Selección de genero:</h4>
          <ul>
            {selectedTags.map((tag, index) => (
              <li key={index}>
                {tag}
                <button className="botonremove" type="buttons" onClick={() => handleRemoveTag(tag)}>
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>



        {/* Imagen de portada */}
        <div className="form-group">
          <label htmlFor="coverImage-edit">Imagen del Show:</label>
          <input
           type="text"
           id="coverImage"
           value={coverImage}
           onChange={(e) => setCoverImage(e.target.value)}
           />
           </div>
           <button type="button" onClick={handleImageUpload}>Cargar Imagen</button>

          {/* Mostrar un iframe si es un video de YouTube */}
           {coverImage.includes('youtube.com') || coverImage.includes('youtu.be') ? (
            <div className="video-preview">
           <iframe
            src={coverImage.replace("watch?v=", "embed/")}
            title="Cover Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
           />
            </div>
          ) : (
           <div className="imagen-preview">
           <img src={coverImage} alt="Cover" />
          </div>
        )}



        {/* Presentaciones */}
        <div className="presentations">

          {presentations.map((presentation, index) => (
            <div key={index} className="presentation-form">
              <div className="form-group">

              </div>


              {/* Botón para enviar el formulario */}
              <button className='boton-enviar'>Modificar</button>
              <button className="close-btn" onClick={handleClose}>Close</button> {/* Botón de cerrar */}


            </div>
          ))}
        </div>

      </form>
    </div>
  );
};

export default EditShow;
