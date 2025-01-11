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
        title: 'Edit Event',
        text: 'Do you want to load the event data for editing?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, load it!',
      }).then((result) => {
        if (result.isConfirmed) {
          setIsReadyToEdit(true); // Esto debería activar la carga de datos
          dispatch(getShows());
          dispatch(getTags());
        }
      });
    }
  }, [isReadyToEdit, dispatch, shows?.length, tags?.length]);

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
      price: parseFloat(price),
      coverImage,
      location: { name: place, address },
      presentation: presentations,
    };
  
    const dataToSend = {
      id: showId, // El ID del show a actualizar
      updates: updates, // Los datos a actualizar

    };
    
  
    try {
      // Realiza la solicitud PUT enviando el ID en la URL y el objeto de actualizaciones en el cuerpo
      await dispatch(updateShow(showId, dataToSend)); // Aquí pasamos los datos correctos al backend


         // Mostrar SweetAlert antes de redirigir
    await Swal.fire({
      icon: 'success',
      title: 'Event Updated Successfully',
      text: 'The event has been updated successfully!',
      confirmButtonText: 'OK',
    });

      navigate('/admin/events'); // Redirigir después de la actualización exitosa
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
      
    }
  };

  const handlePresentationChange = (index, field, value) => {
    const updatedPresentations = [...presentations];
    updatedPresentations[index][field] = value;
    setPresentations(updatedPresentations);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!showId || shows.length === 0) {
    return <div>No events found.</div>;
  }

  return (
    <div className="edit-show">
      <h1>Edit Event</h1>
      <form onSubmit={handleSubmit}>
        {/* Nombre del evento */}
        <div className="form-group">
          <label htmlFor="name">Event Name:</label>
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
          <label htmlFor="artists">Artists (comma separated):</label>
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
          <label htmlFor="tags">Genres:</label>
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
  <h4>Selected Genres:</h4>
  <ul>
    {selectedTags.map((tag, index) => (
      <li key={index}>
        {tag}
        <button className="botonremove" type="button" onClick={() => handleRemoveTag(tag)}>
          &times;
         </button>
         </li>
            ))}
         </ul>
         </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Precio */}
        <div className="form-group">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Imagen de portada */}
        <div className="form-group">
          <label htmlFor="coverImage">Cover Image URL:</label>
          <input
            type="text"
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>

        {/* Lugar */}
        <div className="form-group">
          <label htmlFor="place">Place:</label>
          <input
            type="text"
            id="place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            required
          />
        </div>

        {/* Dirección */}
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Presentaciones */}
        <div className="presentations">
          <h3>Presentations</h3>
          {presentations.map((presentation, index) => (
            <div key={index} className="presentation-form">
              <div className="form-group">
                <label htmlFor={`date-${index}`}>Date:</label>
                <input
                  type="date"
                  id={`date-${index}`}
                  value={presentation.date}
                  onChange={(e) =>
                    handlePresentationChange(index, 'date', e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor={`start-${index}`}>Start Time:</label>
                <input
                  type="time"
                  id={`start-${index}`}
                  value={presentation.time?.start || ''}
                  onChange={(e) =>
                    handlePresentationChange(index, 'time', {
                      ...presentation.time,
                      start: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor={`end-${index}`}>End Time:</label>
                <input
                  type="time"
                  id={`end-${index}`}
                  value={presentation.time?.end || ''}
                  onChange={(e) =>
                    handlePresentationChange(index, 'time', {
                      ...presentation.time,
                      end: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón para enviar el formulario */}
        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default EditShow;
