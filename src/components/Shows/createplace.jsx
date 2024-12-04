// components/CreatePlaceForm.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPlace } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';

const CreatePlaceForm = () => {
  const dispatch = useDispatch();
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
  
    // Disparar la acción para crear el lugar
    dispatch(createPlace(placeDataWithNumericCapacity))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Place Created!',
          text: 'The new place has been successfully created.',
        });
        setPlaceData({
          name: '',
          address: '',
          capacity: '',
          layout: '',
        });
        setError('');
      })
      .catch((err) => {
        setError('Error creating the place.');
        console.error(err);
      });
  
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

        <button type="submit">Create Place</button>
      </form>
    </div>
  );
};

export default CreatePlaceForm;
