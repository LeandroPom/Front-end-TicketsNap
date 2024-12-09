import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShows,  } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import './estilospaneladm.css';

const Events = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shows, loading, error } = useSelector((state) => state);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  const handleEdit = (eventId) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleDelete = (eventId) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      dispatch(deleteShow(eventId));
    }
  };

  return (
    <div className="events-page">
      <h1>Events Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => navigate('/admin/events/create')}>Create Event</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Genre</th>
            <th>Place</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shows.map((show) => (
            <tr key={show.id}>
              <td>{show.name}</td>
              <td>{show.genre.join(', ')}</td>
              <td>{show.location.name}</td>
              <td>
                <button onClick={() => handleEdit(show.id)}>Edit</button>
                <button onClick={() => handleDelete(show.id)}>Deleted</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Events;
