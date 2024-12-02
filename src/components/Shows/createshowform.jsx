import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createShow, getShows, createTag, getTags } from '../Redux/Actions/actions';
import Swal from 'sweetalert2';
import '../Shows/createshowform.css';

const CreateShowForm = () => {
  const dispatch = useDispatch();
  const { shows, loading, tags } = useSelector((state) => state);

  const [formData, setFormData] = useState({
    name: '',
    artists: '',
    locationName: '',
    locationAddress: '',
    presentationDate: '',
    performance: '',
    presentation: [],
    description: '',
    genre: [],
    price: '',
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
            dispatch(getTags); // Recargar la página
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

  const handleResetTags = () => {
    setFormData({ ...formData, genre: [] });
    setSelectedTag('');
    setNewTag('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePresentationChange = (e) => {
    const { value } = e.target;

    if (!formData.performance) {
      setErrorMessage('Please select a performance before choosing a date.');
      return;
    }

    if (value) {
      const newPresentation = [...formData.presentation];
      const presentationExists = newPresentation.some((item) => item.date === value);
      if (!presentationExists) {
        newPresentation.push({
          date: value,
          performance: formData.performance,
        });

        setFormData({
          ...formData,
          presentation: newPresentation,
          presentationDate: value,
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.genre || formData.genre.length === 0) {
      setErrorMessage('Please select or create at least one genre.');
      return;
    }

    if (!Array.isArray(formData.presentation) || formData.presentation.length === 0) {
      setErrorMessage('Presentation must be a non-empty array of objects.');
      return;
    }

    formData.presentation.forEach((item) => {
      if (!item.date || !item.performance) {
        setErrorMessage('Each presentation object must have a date and a performance value.');
        return;
      }
    });

    const locationData = `${formData.locationName}, ${formData.locationAddress}`;
    const formattedData = {
      name: formData.name,
      artists: formData.artists.split(',').map((artist) => artist.trim()),
      genre: formData.genre.map((genre) => genre.name),
      location: locationData,
      presentation: formData.presentation || [],
      description: formData.description || null,
      coverImage: formData.coverImage || null,
      price: formData.price || 0,
    };

    console.log('Formatted data being sent:', formattedData);

    dispatch(createShow(formattedData))
      .then(() => {
        setErrorMessage('');
        alert('Show created successfully!');
      })
      .catch((err) => {
        setErrorMessage('Error creating the show.');
        console.error(err);
      });
  };

  return (
    <div className="create-show-form">
      <h2>Create a New Show</h2>
      <form onSubmit={handleSubmit}>
        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

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

          <input
            type="text"
            placeholder="Create a new tag"
            value={newTag}
            onChange={handleTagChange}
          />
          <button type="button" onClick={handleCreateTag}>Add New Tag</button>
          <button type="button" onClick={handleResetTags}>Reset Tags</button>
        </label>

        <div>
          {formData.genre.length > 0 && (
            <p>Selected Genres: {formData.genre.map((genre) => genre.name).join(', ')}</p>
          )}
        </div>

        <label>
          Location Name:
          <input
            type="text"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location Address:
          <input
            type="text"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Performance:
          <input
            type="number"
            name="performance"
            value={formData.performance}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Presentation Date:
          <input
            type="date"
            name="presentationDate"
            value={formData.presentationDate}
            onChange={handlePresentationChange}
            required
            disabled={!formData.performance}
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Price:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Create Show</button>
      </form>
    </div>
  );
};

export default CreateShowForm;
