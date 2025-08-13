import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createShow, getShows, createTag, getTags, getPlaces } from '../Redux/Actions/actions'; // Importar getPlaces
import Swal from 'sweetalert2';
import '../Shows/createshowform.css';
import { Navigate, Link, useNavigate } from 'react-router-dom';

const CreateShowForm = () => {
  const dispatch = useDispatch();
  // const { shows, loading, tags, places } = useSelector((state) => state);
  const navigate = useNavigate();
  const shows = useSelector((state) => state.shows); // Arreglo de shows
  const loading = useSelector((state) => state.loading); // Indicador de carga
  const error = useSelector((state) => state.error); // Errores
  const tags = useSelector((state) => state.tags); // tags
  const places = useSelector((state) => state.places); // places
  const [selectedLocation, setSelectedLocation] = useState(null); // Nuevo estado para el lugar
  const [isGeneral, setIsGeneral] = useState(false); // Estado para manejar el valor del switch
  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    artists: '',
    locationId: '',
    address: "",
    presentationDate: '',
    performance: '', // Inicializa con 1 si es una presentación
    presentation: [{ time: { start: '', end: '' } }], // Se usará para almacenar las presentaciones
    description: '',
    genre: [],
    price: '1000',
    coverImage: '', // Nuevo campo
  });

  const [newTag, setNewTag] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar los datos desde el Local Storage al montar el componente
  useEffect(() => {
    const savedFormData = localStorage.getItem('formData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData)); // Restaurar los datos del formulario
    }

    dispatch(getShows());
    dispatch(getTags());
    dispatch(getPlaces()); // Obtener lugares
  }, [dispatch]);

  // Guardar el estado actual del formulario en el Local Storage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  // Monitorear cambios en los tags
  useEffect(() => {
    if (tags && tags.length > 0) {
      setSelectedTag('');
    }
  }, [tags]);

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleCreateTag = () => {
    if (newTag && typeof newTag === 'string' && !tags.some((tag) => tag.name === newTag)) {
      dispatch(createTag(newTag))
        .then(() => {
          setNewTag('');
          setErrorMessage('');

          // Mostrar mensaje con SweetAlert y recargar la página al presionar "OK"
          Swal.fire({
            icon: 'success',
            title: 'Tag Created!',
            text: 'The new tag has been successfully created.',
            confirmButtonText: 'OK',
          }).then(() => {
            dispatch(getTags); // Recargar los tags
          });
        })
        .catch(() => {
          setErrorMessage('Error creating new tag.');
        });
    } else {
      setErrorMessage('Please enter a valid and unique tag name.');
    }
  };

  const handleGenreSelect = (e) => {
    const selected = e.target.value;

    if (selected && !formData.genre.some((genre) => genre.name === selected)) {
      setFormData((prevState) => ({
        ...prevState,
        genre: [...prevState.genre, { name: selected }],
      }));
    }
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
          setFormData((prevState) => ({
            ...prevState,
            coverImage: result.info.secure_url, // Aquí obtienes la URL segura de la imagen
          }));
        }
      }
    );
    widget.open(); // Abre el widget
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
    const handleGeneralChange = () => {
    if (!isGeneral) {
      // Si ya está marcado, mostrar la advertencia
      Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: '¿Deseas marcar este Show como General, una vez seleccionado no se puede modificar?',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          setIsGeneral(true); // Si el usuario confirma, se marca como General
        } else {
          setIsGeneral(false); // Si el usuario cancela, se desmarca
        }
      });
    } else {
      setIsGeneral(true);  // Si no está marcado, simplemente lo marca como General
    }
  };
    const handlePriceChange = (e) => {
    const value = e.target.value;

    // Validate that the input contains only numbers and is not empty
    if (/^\d*\.?\d*$/.test(value)) {  // Regular expression for numeric input
      setFormData({
        ...formData,
        price: value,
      });
    }
  };


  const handlePresentationChange = (index, field, value) => {
    const newPresentation = [...formData.presentation];
  
    // Si no existe la presentación en ese índice, inicializa el objeto
    if (!newPresentation[index]) {
      newPresentation[index] = { date: '', performance: formData.performance || 1, time: { start: '', end: '' } };
    }
  
    // Si estamos modificando la fecha (solo para la primera presentación)
    if (field === 'date') {
      // Aplicar la misma fecha a todas las presentaciones si es la primera vez que se selecciona una fecha
      if (!newPresentation.some((presentation) => presentation.date)) {
        newPresentation.forEach((presentation) => {
          presentation.date = value;
        });
      } else {
        newPresentation[index].date = value;  // Si ya hay una fecha, solo actualiza la del índice específico
      }
    } else if (field === 'performance') {
      // Si estamos modificando el número de presentaciones, ajustamos el arreglo de presentaciones
      newPresentation[index].performance = value || formData.performance || 1;
    } else {
      // Para otros campos (start, end, etc.), solo actualizamos el campo correspondiente en el índice
      newPresentation[index].time = {
        ...newPresentation[index].time,
        [field]: value, // Actualiza el tiempo (start o end)
      };
    }
  
    // Actualiza el estado de formData con las nuevas presentaciones
    setFormData((prevState) => ({
      ...prevState,
      presentation: newPresentation,
    }));
  };
  
const handlePerformanceChange = (e) => {
    const newPerformance = parseInt(e.target.value, 10);

    // Si cambiamos la cantidad de presentaciones, re-inicializamos las fechas y tiempos
    setFormData((prevState) => {
      const newPresentation = Array.from({ length: newPerformance }).map((_, index) => ({
        date: prevState.presentation[index]?.date || '', // Mantener la misma fecha si ya fue seleccionada
        performance: newPerformance, // Asignar el mismo número de presentaciones a todas
        time: { start: '', end: '' }, // Reiniciar los tiempos para todas las presentaciones
      }));

      return {
        ...prevState,
        performance: newPerformance,
        presentation: newPresentation,
      };
    });
  };
 const handleTimeDisplay = (index) => {
    const presentation = formData.presentation[index];


    return (
      <div>
        {presentation.time.start && (
          <p>Start Time: <strong>{presentation.time.start}</strong></p>
        )}
        {presentation.time.end && (
          <p>End Time: <strong>{presentation.time.end}</strong></p>
        )}
      </div>
    );
  };

  const handleLocationSelect = (e) => {
    const selectedId = e.target.value;

    // Buscar el lugar seleccionado
    const location = places.find((place) => String(place.id) === String(selectedId));

    if (location) {
      const fullLocation = `${location.name}, ${location.address}`;
      setSelectedLocation(location);

      setFormData((prevState) => ({
        ...prevState,
        locationId: fullLocation, // Enviar nombre + dirección
      }));
    }
  };

 const handleRemoveGenre = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      genre: prevState.genre.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

const handleDateChange = (date) => {
  setFormData((prevState) => ({
    ...prevState,
    presentationDate: date,  // Actualiza la fecha de presentación correctamente
  }));
};

    // Validar que haya un lugar seleccionado
    if (!selectedLocation || !selectedLocation.name) {
      setErrorMessage('Please select a valid location.');
      return;
    }

    if (!formData.genre || formData.genre.length === 0) {
      setErrorMessage('Please select or create at least one genre.');
      return;
    }

    if (!Array.isArray(formData.presentation) || formData.presentation.length === 0) {
      setErrorMessage('Presentation must be a non-empty array of objects.');
      return;
    }

    // Validar presentaciones antes de enviar
    for (let i = 0; i < formData.presentation.length; i++) {
      const item = formData.presentation[i];

      if (!item.date || !item.performance || !item.time || !item.time.start || !item.time.end) {
        setErrorMessage(`Presentation ${i + 1} is missing required fields (date, performance, start time, end time).`);
        return;
      }
     // Validar que las horas estén en el formato HH:mm
      const timePattern = /^([0-9]{2}):([0-9]{2})$/;
      if (!timePattern.test(item.time.start) || !timePattern.test(item.time.end)) {
        setErrorMessage(`Presentation ${i + 1} has invalid time format. Please use HH:mm.`);
        return;
      }
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      console.error('Precio inválido');
      return; // O muestra un mensaje de error al usuario
    }

    const newFormData = {
      ...formData,
      address: selectedLocation?.address || 'Dirección no disponible', // Asegura que se agregue
    };

    // Formatear los datos para enviar al backend
    const formattedData = {
      name: formData.name,
      artists: formData.artists.split(',').map((artist) => artist.trim()),
      genre: formData.genre.map((genre) => genre.name),
      locationName: formData.locationId, // Aquí se usa formData.locationId
      presentation: formData.presentation.map((item) => ({
        date: item.date,
        performance: item.performance || 1,
        time: {
          start: item.time.start,
          end: item.time.end,
        },
      })),
      description: formData.description || null,
      coverImage: formData.coverImage || 'https://via.placeholder.com/300',
      price: price,  // Asegúrate de que price tenga un valor numérico
      isGeneral: isGeneral ? true : '', // Si el checkbox está marcado, isGeneral será true, sino será un string vacío
    };
    // Llamar a la acción de crear show
    dispatch(createShow(formattedData))
      .then(() => {
        // Si el show se crea correctamente, mostrar un mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Show Creado!',
          text: 'El nuevo Show se creo correctamente.',
        });
        navigate("/")
      })
      .catch((error) => {
        // Si hay un error al crear el show, mostrar un mensaje de error
        setErrorMessage('Error creating the show. Please try again.');
      });
    console.log('Datos enviados al backend:', formattedData);

  }
  return (
  <div
    className="min-h-screen p-4 md:p-6 text-white max-w-3xl mx-auto relative rounded-md"
    style={{
      background: "rgba(86, 86, 190, 0.4)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      top: "180px",
      zIndex: 10,
      // left: "-20px",  // removido para evitar desplazamiento horizontal
      borderRadius: "8px",
    }}
  >
    <h2 className="text-3xl font-bold mb-6">Crear Evento</h2>

    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

     <label className="flex items-center gap-3 cursor-pointer">
       {/* Texto descriptivo fijo */}
  <span className="text-white font-semibold">Activa el Switch, si deseas que el show sea "General"</span>
  <span className="text-white font-semibold">
    {isGeneral ? "Activado" : "Desactivado"}
  </span>
 {/* Switch más pequeño */}
{/* Switch más pequeño y responsive */}
<div
  onClick={() => handleGeneralChange({ target: { checked: !isGeneral } })}
  className={`relative w-10 min-w-[2.5rem] h-5 min-h-[1.25rem] rounded-full transition-colors duration-300 flex-shrink-0 mt-[5px] ${
    isGeneral ? "bg-green-500" : "bg-gray-400"
  }`}
>
  <span
    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
      isGeneral ? "translate-x-[1.25rem]" : "translate-x-0"
    }`}
  />
</div>
</label>

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Nombre:</span>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Artistas (separado por coma si es mas de uno):</span>
        <input
          type="text"
          name="artists"
          value={formData.artists}
          onChange={handleChange}
          required
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Genero:</span>
        <select
          name="genre"
          value={selectedTag}
          onChange={handleGenreSelect}
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Seleccionar genero</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : tags && tags.length >= 0 ? (
            tags.map((tag) => (
              <option
                key={tag.id}
                value={tag.name}
                className="bg-[rgba(50,50,110,0.8)] text-white"
              >
                {tag.name}
              </option>
            ))
          ) : (
            <option disabled>No hay generos</option>
          )}
        </select>

        <div className="flex mt-2 gap-2">
          <input
            type="text"
            placeholder="Create a new tag"
            value={newTag}
            onChange={handleTagChange}
            className="flex-1 p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            type="button"
            onClick={handleCreateTag}
          >
            Agregar nuevo genero
          </button>
        </div>
      </label>

      <div className="selected-genres mt-4">
        {formData.genre.length > 0 && (
          <>
            <p className="mb-2 font-semibold">Genero seleccionado:</p>
            <div className="flex flex-wrap gap-2">
              {formData.genre.map((genre, index) => (
                <div
                  key={index}
                  className="flex items-center bg-[rgba(70,70,140,0.7)] text-white rounded px-3 py-1"
                >
                  {genre.name}
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700 text-sm font-bold"
                    onClick={() => handleRemoveGenre(index)}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Dirección:</span>
        <select
          onChange={handleLocationSelect}
          value={formData.locationId || ""}
          required
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="" disabled>
            Dirección seleccionada
          </option>
          {places.length > 0 ? (
            places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))
          ) : (
            <option disabled>No hay lugares disponibles</option>
          )}
        </select>
      </label>

      {formData.locationId && (
        <p className="mb-4">
          Dirección seleccionada:{" "}
          <strong>{formData.locationId}</strong>
        </p>
      )}

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Presentación:</span>
        <input
          type="number"
          name="performance"
          value={formData.performance}
          onChange={handlePerformanceChange}
          required
          min="1"
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {formData.performance > 0 && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: formData.performance }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              {index === 0 && (
                <label className="flex flex-col">
                  <span className="mb-1 font-semibold">Fecha {index + 1}:</span>
                  <input
                    type="date"
                    value={formData.presentation[0]?.date || ""}
                    onChange={(e) =>
                      handlePresentationChange(index, "date", e.target.value)
                    }
                    required
                    className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </label>
              )}

              <label className="flex flex-col">
                <span className="mb-1 font-semibold">Comienzo {index + 1}:</span>
                <input
                  type="time"
                  value={formData.presentation[index]?.time?.start || ""}
                  onChange={(e) =>
                    handlePresentationChange(index, "start", e.target.value)
                  }
                  required
                  className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>

              <label className="flex flex-col">
                <span className="mb-1 font-semibold">Finalización {index + 1}:</span>
                <input
                  type="time"
                  value={formData.presentation[index]?.time?.end || ""}
                  onChange={(e) =>
                    handlePresentationChange(index, "end", e.target.value)
                  }
                  required
                  className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Descripción:</span>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </label>

      <label className="flex flex-col">
        <span className="mb-1 font-semibold">Imagen del Evento:</span>
        <input
          type="text"
          name="coverImage"
          value={formData.coverImage}
          onChange={handleChange}
          placeholder="Enter cover image URL"
          className="p-2 rounded bg-[rgba(70,70,140,0.7)] border border-white text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>

      <button
        type="button"
        onClick={handleImageUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2 w-max"
      >
        Cargar Imagen
      </button>

      {formData.coverImage && (
        <img
          src={formData.coverImage}
          alt="Cover"
          className="mt-4 rounded shadow-lg object-cover"
          style={{ width: "200px", height: "200px" }}
        />
      )}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded mt-6 self-center"
        type="submit"
      >
        Finalizar
      </button>
    </form>
  </div>
);

};
export default CreateShowForm;
