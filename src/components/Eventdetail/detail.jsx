import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions'; // Tu acción para obtener los shows
import SeatManager from '../ManagerSeat/seatbuy';
import '../Eventdetail/detail.css';

const Detail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { shows, loading, error } = useSelector((state) => state); // Accedemos al estado global

  const [isSeatManagerOpen, setIsSeatManagerOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [canvasRef, setCanvasRef] = useState(null);

  // Buscar el evento en el array de shows
  const event = shows.find((show) => show.id === parseInt(id));

  // Usar useEffect para cargar los datos si no están disponibles
  useEffect(() => {
    if (!event) {
      dispatch(getShows()); // Llamamos a la acción para obtener los shows
    }
  }, [dispatch, event]);

  // Filtrar los asientos disponibles cuando se seleccione una zona
  useEffect(() => {
    if (event && selectedZone) {
      const filteredSeats = event.seats.filter(
        (seat) => seat.zone === selectedZone && !seat.occupied
      );
      setAvailableSeats(filteredSeats);
    }
  }, [event, selectedZone]);

  const handleSeatsSelected = (seats) => {
    console.log('Asientos seleccionados:', seats);
    setSelectedSeats(seats);
    setIsSeatManagerOpen(false);
  };

  const handleOpenSeatManager = () => {
    setIsSeatManagerOpen(true);
  };

  const handleCloseSeatManager = () => {
    setIsSeatManagerOpen(false);
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom; // Escalar la posición X
      const y = (e.clientY - rect.top) / zoom;  // Escalar la posición Y
  
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  
      // Lógica para detectar la zona seleccionada a partir del color del píxel
      switch (rgb) {
        case 'rgb(255, 0, 0)': 
          handleZoneSelect('Zona Roja');
          break;
        case 'rgb(0, 188, 139)': 
          handleZoneSelect('Zona Verde');
          break;
        default:
          handleZoneSelect(null);
          break;
      }
    }
  };

  useEffect(() => {
    loadImage();
  }, [zoom]);

  const loadImage = () => {
    const canvas = canvasRef;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = '/map.jpg'; // Ruta de la imagen en la carpeta public
  
      img.onload = () => {
        const scaledWidth = 400 * zoom; // Escala el ancho con el zoom
        const scaledHeight = 400 * zoom; // Escala la altura con el zoom
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
  
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      };
    }
  };

  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!event) {
    return <div>Event not Found</div>;
  }

  return (
    <div className="event-detail">
      <h1>{event.name}</h1>

      <p>Genre: {event.genre.join(', ')}</p>
      <p>City: {event.location.name}</p>
      <p>Address: {event.location.address}</p>

      {/* Mostrar las presentaciones */}
      {event.presentation.map((presentation, index) => (
        <div key={index}>
          <p><strong>Date:</strong> {presentation.date}</p>
          <p><strong>Performance:</strong> {presentation.performance}</p>
          <p><strong>Time:</strong> {presentation.time.start} - {presentation.time.end}</p>
        </div>
      ))}

      {/* Mostrar el mapa */}
      <div className="map-container">
        <div className="map-controls">
          <button onClick={handleZoomIn}>Zoom +</button>
          <button onClick={handleZoomOut}>Zoom -</button>
        </div>
        <canvas
          ref={(ref) => setCanvasRef(ref)}
          onClick={handleCanvasClick}
          style={{ cursor: 'pointer' }}
        />
        {selectedZone && <p>Selected Zone: {selectedZone}</p>}
      </div>

      {/* Botón para abrir el selector de asientos */}
      <button className="select-seats-btn" onClick={handleOpenSeatManager}>
        Select Seats
      </button>

      {/* Modal para el selector de asientos */}
      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleCloseSeatManager}></div>
          <div className="modal-content">
            <h2> Select Your Seat</h2>
            <SeatManager
  mapaUrl='/mapa.jpg'
  onSeatsSelected={handleSeatsSelected}
  availableSeats={availableSeats}
  isSelectable={true} // Permite la selección
  selectedSeats={selectedSeats} // Pasa selectedSeats como prop
  onZoneSelect={handleZoneSelect}
/>

            <button className="close-modal-btn" onClick={handleCloseSeatManager}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
