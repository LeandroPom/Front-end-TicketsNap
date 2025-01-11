import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux"; // Si usas Redux para el dispatch
import { createPlace } from "../../Redux/Actions/actions"; // Asegúrate de importar correctamente tu acción
import "./estilospaneladm.css";

const Places = () => {
  const dispatch = useDispatch();
  const [places, setPlaces] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get("http://localhost:3001/places");
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
      await axios.delete(`/api/places/${id}`);
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
        title: 'Place Created!',
        text: 'The new place has been successfully created.',
      });
      fetchPlaces(); // Actualiza la lista de lugares
    } catch (err) {
      console.error("Error creating place:", err);
      setError("Error creating the place.");
    }
  };

  return (
    <div className="places-management">
      <h2>Gestión de Lugares</h2>

      {/* Formulario para agregar un nuevo lugar */}
      <div className="add-place-form">
       
      </div>

      {/* Mostrar errores si los campos no están completos */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Formulario de creación de lugar (nuevo componente) */}
      <CreatePlaceForm handleCreatePlace={handleCreatePlace} />

      {/* Lista de lugares */}
      <div className="places-list">
        <h3>Available Places</h3>
        <ul>
          {places.map((place) => (
            <li key={place.id}>
              <span>{place.name} - {place.location}</span>
              <button className="botonedit" onClick={() => handleDeletePlace(place.id)}>Deleted</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Componente para el formulario de creación de lugar
const CreatePlaceForm = ({ handleCreatePlace }) => {
  const [placeData, setPlaceData] = useState({
    name: '',
    address: '',
    capacity: '',
    layout: '',
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
    const { name, address, capacity, layout } = placeData;

    if (!name || !address || !capacity || !layout) {
      setError('Please fill in all fields.');
      return;
    }

    // Convertir capacity a número
    const numericCapacity = Number(capacity);

    if (isNaN(numericCapacity) || numericCapacity < 0) {
      setError('Capacity must be a non-negative number.');
      return;
    }

    const placeDataWithNumericCapacity = { ...placeData, capacity: numericCapacity };

    handleCreatePlace(placeDataWithNumericCapacity); // Llama al método pasado como prop
    setPlaceData({
      name: '',
      address: '',
      capacity: '',
      layout: '',
    });
    setError('');
  };

  return (
    <div className="create-place-form">
      <h2>Create a New Place</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <label>
          Name:
          <input
            type="text"
            name="name"
            value={placeData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={placeData.address}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Capacity:
          <input
            type="number"
            name="capacity"
            value={placeData.capacity}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Layout:
          <select
            name="layout"
            value={placeData.layout}
            onChange={handleChange}
            required
          >
            <option value="">Select Layout</option>
            <option value="theater">Theater</option>
            <option value="arena">Arena</option>
            <option value="field">Field</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>

        <button className="botonedit" type="submit">Create Place</button>
      </form>
    </div>
  );
};

export default Places;
