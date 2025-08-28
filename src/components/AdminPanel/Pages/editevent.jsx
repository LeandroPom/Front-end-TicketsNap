import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows, getTags, updateShow, updateZone, updateGeneralZone } from '../../Redux/Actions/actions';
import Swal from 'sweetalert2';
import axios from 'axios';
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
  const [zones, setZones] = useState([]);
  const [generalZones, setGeneralZones] = useState([]);


// console.log('SHOWS EN REDUX:', shows);
// console.log('BUSCANDO ID:', parseInt(showId, 10));
  // Cargar los datos al inicio si es necesario
  useEffect(() => {
    if (shows?.length === 0) {
      dispatch(getShows());  // Cargar todos los shows si aún no están cargados
    }
    if (tags?.length === 0) {
      dispatch(getTags());  // Cargar los géneros si no están cargados
    }
  }, [dispatch, shows?.length, tags?.length]);

useEffect(() => {
  const fetchZones = async () => {
    try {
      const response = await axios.get('/zones');
      if (response.data?.zones) setZones(response.data.zones);
    } catch (error) {
      console.error('❌ Error al cargar las zonas:', error);
    }
  };

const fetchGeneralZones = async () => {
  try {
    const response = await axios.get('/zones/general');
    if (response.data?.generalZones) setGeneralZones(response.data.generalZones);
  } catch (error) {
    console.error('❌ Error al cargar las zonas generales:', error);
  }
};

  fetchZones();
  fetchGeneralZones();
}, []);

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
  const selectedShow = shows.find((show) => show.id === parseInt(showId, 10)); // ✅ esta línea arregla el error

  const presentationData = presentations;

  if (!presentationData.length) {
    console.error('No hay datos de presentación para enviar');
    return;
  }

  const { date, time, performance } = presentationData[0];
  if (!date || !time || !performance) {
    console.error('Datos de presentación incompletos (falta date, performance o time)');
    return;
  }

  const updates = {
    name,
    artists: artists.split(',').map((artist) => artist.trim()),
    genre: selectedTags,
    description,
    coverImage,
    presentation: presentationData,
  };

  const dataToSend = {
    id: showId,
    updates,
    user: { isAdmin: user?.isAdmin },
  };

  
const matchingZone = [...zones, ...generalZones].find(
  (zone) => zone.showId === parseInt(showId, 10)
);

const zoneId = matchingZone?.id;

  if (!zoneId) {
    console.error('❌ No se encontró una zona asociada al show con showId:', showId);
    return;
  }

 try {
  // console.log('📤 Enviando datos para actualizar SHOW:', dataToSend);
  await dispatch(updateShow(showId, dataToSend));

  const isGeneral = matchingZone?.isGeneral;

 const zoneUpdatePayload = {
  id: zoneId,
  ...(isGeneral && { showId: parseInt(showId, 10) }), // ✅ Importante: showId debe enviarse si es general
  updates: {
    presentation: {
      date,
      performance,
      time: {
        start: time.start,
        end: time.end,
      },
    },
  },
};

  // console.log('📤 Enviando datos para actualizar ZONA:', zoneUpdatePayload);

  const General = selectedShow?.isGeneral === true || selectedShow?.isGeneral === "true";

if (General) {
  // console.log("✅ Usando updateGeneralZone");
  await dispatch(updateGeneralZone(zoneUpdatePayload));
} else {
  // console.log("✅ Usando updateZone");
  await dispatch(updateZone(zoneUpdatePayload));
}

  await Swal.fire({
    icon: 'success',
    title: 'Evento Modificado',
    text: 'El evento fue modificado correctamente!',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'custom-popup-success',
    },
  });

  navigate('/admin/events');
} catch (error) {
  if (error.response) {
    console.error('Error al actualizar zona, respuesta del servidor:', error.response.data);
  } else {
    console.error('Error al actualizar la zona:', error.message);
  }
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
  <div
    className="min-h-screen p-4 md:p-6 text-white max-w-screen-xl mx-auto relative"
    style={{
      background: "rgba(29, 81, 150, 0.43)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      top: "220px",
      zIndex: 10,
      // left: "160px",  // Lo removí para que no desplace a la izquierda
    }}
  >
    <h1 className="text-3xl font-bold mb-6 text-center">Editar Evento</h1>

    <form
      className="flex flex-col gap-6 max-w-4xl mx-auto"
      onSubmit={handleSubmit}
    >
      {/* Nombre del evento */}
      <div className="form-group flex flex-col">
        <label htmlFor="name" className="mb-1 font-semibold">
          Nombre del evento:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Artistas */}
      <div className="form-group flex flex-col">
        <label htmlFor="artists" className="mb-1 font-semibold">
          Artistas (separación con coma):
        </label>
        <input
          type="text"
          id="artists"
          value={artists}
          onChange={(e) => setArtists(e.target.value)}
          required
          className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Géneros */}
      <div className="form-group flex flex-col">
        <label htmlFor="tags" className="mb-1 font-semibold">
          Generos:
        </label>
        <select
          id="tags"
          multiple
          value={selectedTags}
          onChange={(e) => {
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setSelectedTags((prevTags) => [
              ...new Set([...prevTags, ...selectedOptions]),
            ]);
          }}
          required
          className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 h-32"
        >
          {tags.map((tag) => (
            <option
              key={tag.id}
              value={tag.name}
              className="bg-[#608CC4] text-white"
            >
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar los géneros seleccionados */}
      <div className="selected-genres">
        <h4 className="mb-2 font-semibold text-white">Selección de genero:</h4>
        <ul className="max-h-32 overflow-auto space-y-1">
          {selectedTags.map((tag, index) => (
            <li
              key={index}
              className="text-white flex justify-between items-center bg-[#608CC4] rounded px-3 py-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-red-500 font-bold hover:text-red-700 ml-2"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Descripción */}
      <div className="form-group flex flex-col">
        <label htmlFor="description" className="mb-1 font-semibold">
          Descripción:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      {/* Imagen de portada */}
      <div className="form-group flex flex-col">
        <label htmlFor="coverImage" className="mb-1 font-semibold">
          Imagen del Show:
        </label>
        <input
          type="text"
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleImageUpload}
          className="mt-2 self-start secondary text-white px-4 py-2 rounded"
        >
          Cargar Imagen
        </button>
      </div>

      {/* Preview Video o Imagen */}
      {coverImage.includes("youtube.com") || coverImage.includes("youtu.be") ? (
        <div className="video-preview my-4 rounded overflow-hidden shadow-lg max-w-full aspect-video mx-auto">
          <iframe
            src={coverImage.replace("watch?v=", "embed/")}
            title="Cover Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="imagen-preview my-4 rounded overflow-hidden shadow-lg max-w-xs max-h-60 mx-auto">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Presentaciones */}
      <div className="presentations flex flex-col gap-6">
        {presentations.map((presentation, index) => (
          <div
            key={index}
            className="presentation-form bg-[#608CC4] p-4 rounded flex flex-col md:flex-row gap-4"
          >
            <div className="form-group flex flex-col flex-1">
              <label htmlFor={`date-${index}`} className="mb-1 font-semibold">
                Fecha presentación {index + 1}:
              </label>
              <input
                type="date"
                id={`date-${index}`}
                value={presentation.date || ""}
                onChange={(e) => {
                  const updated = [...presentations];
                  updated[index].date = e.target.value;
                  setPresentations(updated);
                }}
                required
                className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="form-group flex flex-col flex-1">
              <label htmlFor={`start-${index}`} className="mb-1 font-semibold">
                Hora inicio {index + 1}:
              </label>
              <input
                type="time"
                id={`start-${index}`}
                value={presentation.time?.start || ""}
                onChange={(e) => {
                  const updated = [...presentations];
                  if (!updated[index].time) updated[index].time = {};
                  updated[index].time.start = e.target.value;
                  setPresentations(updated);
                }}
                required
                className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="form-group flex flex-col flex-1">
              <label htmlFor={`end-${index}`} className="mb-1 font-semibold">
                Hora fin {index + 1}:
              </label>
              <input
                type="time"
                id={`end-${index}`}
                value={presentation.time?.end || ""}
                onChange={(e) => {
                  const updated = [...presentations];
                  if (!updated[index].time) updated[index].time = {};
                  updated[index].time.end = e.target.value;
                  setPresentations(updated);
                }}
                required
                className="p-2 rounded bg-[#608CC4] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botones Modificar y Cerrar */}
      <div className="form-actions flex gap-4 mt-6 justify-center">
        <button
          className="secondary text-white px-6 py-2 rounded"
          type="submit"
        >
          Modificar
        </button>
        <button
          className="secondary text-white px-6 py-2 rounded"
          type="button"
          onClick={handleClose}
        >
          Salir
        </button>
      </div>
    </form>
  </div>
);

};

export default EditShow;
