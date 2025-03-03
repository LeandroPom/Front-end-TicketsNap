import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux"; // Si usas Redux para el dispatch
import { createPlace } from "../../Redux/Actions/actions"; // Asegúrate de importar correctamente tu acción
import "./places.css";

const Places = () => {
  const dispatch = useDispatch();
  const [places, setPlaces] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const placesPerPage = 2;

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get("/places");
      setPlaces(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const handleAddPlace = async () => {
    if (!name || !location) {
      setError("Please fill in all fields.");
      return;
    }
  };

  const handleDeletePlace = async (id) => {
    try {
      await axios.delete(`/places/${id}`);
      fetchPlaces(); // Actualiza la lista después de eliminar un lugar
    } catch (error) {
      console.error("Error deleting place:", error);
    }
  };

  const handleCreatePlace = async (placeData) => {
    try {
      await dispatch(createPlace(placeData)); // Llama la acción de Redux para crear el lugar
      Swal.fire({
        icon: 'success',
        title: 'Lugar creado!',
        text: 'Su nuevo lugar fue creado.',
      });
      fetchPlaces(); // Actualiza la lista de lugares
    } catch (err) {
      console.error("Error creating place:", err);
      setError("Error creating the place.");
    }
  };

  // Calcular los lugares a mostrar según la página actual
  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="places-management">
      {/* Mostrar errores si los campos no están completos */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Formulario de creación de lugar */}
      <CreatePlaceForm handleCreatePlace={handleCreatePlace} />

      {/* Lista de lugares */}
      <div className="places-list">
        <h3>Lugares Disponibles</h3>
        <div className="places-grid">
          {currentPlaces.map((place) => (
            <div key={place.id} className="place-item">
              <span >{place.name} {place.location}</span>
              <button className="botonedit-desactivated" onClick={() => handleDeletePlace(place.id)}>Borrar</button>
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="pagination">
          {currentPage > 1 && (
            <button onClick={() => paginate(currentPage - 1)}>Anterior</button>
          )}
          {currentPage < Math.ceil(places.length / placesPerPage) && (
            <button onClick={() => paginate(currentPage + 1)}>Siguiente</button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para el formulario de creación de lugar
const CreatePlaceForm = ({ handleCreatePlace }) => {
  const [placeData, setPlaceData] = useState({
    name: '',
    address: '',
    capacity: '500',
    layout: 'Arena',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlaceData({
      ...placeData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, address, layout } = placeData;
  
    if (!name || !address || !layout) {
      setError('Please fill in all fields.');
      return;
    }
  
    const placeDataWithNumericCapacity = { ...placeData };
  
    handleCreatePlace(placeDataWithNumericCapacity); // Enviar datos correctos
    setPlaceData({
      name: '',
      address: '',
      capacity: '500',
      layout: 'Arena',
    });
    setError('');
  };

  return (
    <div className="create-place-form">
      <h2>Crear nuevo lugar</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={placeData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Direccion:
          <input
            type="text"
            name="address"
            value={placeData.address}
            onChange={handleChange}
            required
          />
        </label>
         <button className="add-place-form" type="submit">Crear lugar</button>
      </form>
    </div>
  );
};

export default Places;
