import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createShow, getShows, createTag, getTags, getPlaces } from '../Redux/Actions/actions'; // Importar getPlaces
import Swal from 'sweetalert2';
import '../Shows/createshowform.css';
import { Navigate,Link, useNavigate } from 'react-router-dom';

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
    address:"",
    presentationDate: '',
    performance: '', // Inicializa con 1 si es una presentación
    presentation: [{ time: { start: '', end: '' } }], // Se usará para almacenar las presentaciones
    description: '',
    genre: [],
    price: '',
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

    // if (price) {
    //   // Si el campo es precio, aseguramos que el valor no sea negativo
    //   if (parseFloat(value) <= 0) {
    //     return; // No actualizamos el estado si el valor es negativo
    //   }
    // }
  
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
      }
    } else if (field === 'performance') {
      newPresentation[index].performance = value || formData.performance || 1;  // Asignar el valor de performance
    } else {
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
  
    
    // Aquí podrías enviar los datos al backend
    
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
    <div className="create-show-form">
      <h2>Create a New Show</h2>
      <form onSubmit={handleSubmit}>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        <label>
        Es un Show General? ¡¡Marca la casilla!!
        <input
       type="checkbox"
       checked={isGeneral}  // El estado del checkbox refleja el valor de isGeneral
       onChange={handleGeneralChange}  // Cambiar a nuestra función personalizada
        />
       </label>

        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Artists (comma-separated):
          <input
            type="text"
            name="artists"
            value={formData.artists}
            onChange={handleChange}
            required
          />
        </label>

        <label>
        
  Tags:
  <select
    name="genre"
    value={selectedTag}
    onChange={handleGenreSelect}
  >
    <option value="">Select Tag</option>
    {loading ? (
      <option disabled>Loading...</option>
    ) : (
      tags && tags.length >= 0 ? (
        tags.map((tag) => (
          <option key={tag.id} value={tag.name}>
            {tag.name}
          </option>
        ))
      ) : (
        <option disabled>No tags available</option>
      )
    )}
  </select>

  <div className="input-with-button">
    <input
      type="text"
      placeholder="Create a new tag"
      value={newTag}
      onChange={handleTagChange}
    />
    <button
      className="add-link"
      type="button"
      onClick={handleCreateTag}
    >
      Add new Tag
    </button>
  </div>
</label>

<div className="selected-genres">
  {formData.genre.length > 0 && (
    <div>
      <p>Selected Genres:</p>
      <div className="genres-container">
        {formData.genre.map((genre, index) => (
          <div key={index} className="genre-tag">
            {genre.name}
            <button
             type="button"
             className="remove-genre-button"
             style={{ fontSize: '10px', marginLeft: '3px', padding: '0', lineHeight: '1' }}
             onClick={() => handleRemoveGenre(index)}
             >
             ❌
             </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>


        <label>
  Adress:
  <select onChange={handleLocationSelect} value={formData.locationId || ''} required>
    <option value="" disabled>Select Adress</option>
    {places.length > 0 ? (
      places.map((place) => (
        <option key={place.id} value={place.id}>
          {place.name}
        </option>
      ))
    ) : (
      <option disabled>No locations available</option>
    )}
  </select>
</label>

<div>
{formData.locationId && (
    <p>
      Selected Address: <strong>{formData.locationId}</strong>
    </p>
  )}
</div>

<div>
  {selectedLocation && (
    <p>
      
    </p>
  )}
</div>

<label>
  Performance:
  <input
    type="number"
    name="performance"
    value={formData.performance}
    onChange={handlePerformanceChange}
    required
    min="1"
  />
</label>
{formData.performance > 0 && (
  <div>
    {Array.from({ length: formData.performance }).map((_, index) => (
      <div key={index}>
        {index === 0 && (  // Solo mostrar el campo de fecha para la primera presentación
          <label>
            Date {index + 1}:
            <input
              type="date"
              value={formData.presentation[0]?.date || ''}  // Asegurarse de que siempre se use el valor de la primera presentación
              onChange={(e) => handlePresentationChange(index, 'date', e.target.value)}
              required
            />
          </label>
        )}

        {/* Mostrar la fecha seleccionada debajo */}
        {formData.presentation[0]?.date && (
          <p>
            {/* Selected Date: <strong>{formData.presentation[0].date}</strong> */}
          </p>
        )}

        <label>
          Start Time {index + 1}:
          <input
            type="time"
            value={formData.presentation[index]?.time?.start || ''}
            onChange={(e) => handlePresentationChange(index, 'start', e.target.value)}
            required
          />
        </label>

        {/* Mostrar el tiempo de inicio seleccionado debajo */}
        {formData.presentation[index]?.time?.start && (
          <p>
            {/* Selected Start Time {index + 1}: <strong>{formData.presentation[index].time.start}</strong> */}
          </p>
        )}

        <label>
          End Time {index + 1}:
          <input
            type="time"
            value={formData.presentation[index]?.time?.end || ''}
            onChange={(e) => handlePresentationChange(index, 'end', e.target.value)}
            required
          />
        </label>

        {/* Mostrar el tiempo de fin seleccionado debajo */}
        {formData.presentation[index]?.time?.end && (
          <p>
            {/* Selected End Time {index + 1}: <strong>{formData.presentation[index].time.end}</strong> */}
          </p>
        )}
      </div>
    ))}
  </div>
)}

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>
        <label>
  Cover Image URL:
  <input
    type="text"
    name="coverImage"
    value={formData.coverImage}
    onChange={handleChange}
    placeholder="Enter cover image URL"
  />
</label>

        <label>
          Price:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handlePriceChange}  // Use handlePriceChange here
            required
            min="1" // Agregar el atributo min
          />
        </label>

        <button className='create-show-boton' type="submits">Create Show</button>
      </form>
    </div>
  );
};

export default CreateShowForm;
