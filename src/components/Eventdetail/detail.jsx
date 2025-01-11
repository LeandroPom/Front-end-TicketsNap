import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getShows } from '../Redux/Actions/actions';
import '../Eventdetail/detail.css';
import Seatbuy from '../ManagerSeat/seatbuy';
import axios from 'axios';
import ZoneEditor from "../ManagerSeat/zoneditor"

const Detail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const shows = useSelector((state) => state.shows);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const [zoneData, setZoneData] = useState([]);
  const [isSeatManagerOpen, setIsSeatManagerOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableSeats, setAvailableSeats, handleSeatsSelected] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoneImage, setZoneImage] = useState('/images/zona-floresta.png'); // Mapa general al principio
  const canvasRef = useRef(null);
  const [seatsDrawn, setSeatsDrawn] = useState(false);
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);

  // Buscar el evento en el array de shows
  const event = shows.find((show) => show.id === parseInt(id));

 
  // 
  // Filtrar los asientos disponibles cuando se seleccione una zona
  const fetchSeatsForZone = async (divisionName, showId, zoneId) => {
    try {
      const response = await axios.get("http://localhost:3001/zones");
      if (response.status === 200) {
        const zones = response.data.zones;  // Asegúrate de que "zones" es lo correcto
  
        console.log(response.data.zones, " datos de las divisiones");
  
        // Buscar la zona cuyo showId coincide con el showId seleccionado
        const matchedZone = zones.find((zone) => zone.showId === event.id );
  
        if (matchedZone) {
          const zoneId = matchedZone.id; // Aquí obtienes el id de la zona
          setSelectedZoneId(zoneId);
          console.log(`Zona seleccionada pomelo ID: ${zoneId}, Show ID: ${matchedZone.showId}`);
  
          // Buscar la división dentro de esa zona
          const divisionData = matchedZone.location.find(
            (loc) => loc.division.toLowerCase() === divisionName.toLowerCase()
          );
  
          if (divisionData && divisionData.rows && divisionData.rows.length > 0) {
            // Pasar los asientos de la división seleccionada
            setAvailableSeats(divisionData.rows);
            console.log(`Asientos para la división ${divisionName}:`, divisionData.rows);
          } else {
            console.log(`No se encontraron asientos para la división ${divisionName}`);
            setAvailableSeats([]);  // Si no hay asientos, lista vacía
          }
        } else {
          console.log(`No se encontró la zona con showId ${showId}`);
        }
      }
    } catch (error) {
      console.error("Error al cargar los asientos para la división:", error);
    }
  };

  

  
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
      // Aseguramos que las coordenadas sean correctas según el zoom
      const scaledX = x / zoom;
      const scaledY = y / zoom;
  
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const pixel = ctx.getImageData(scaledX, scaledY, 1, 1).data;
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  
      if (seatsDrawn) {
        const clickedSeat = availableSeats.flatMap((seatRow) =>
          seatRow.seats.filter(
            (seat) => {
              // Ajustar la comparación de las coordenadas para mayor precisión
              const seatPosX = seat.drawingPosition.x;
              const seatPosY = seat.drawingPosition.y;
              const seatRadius = seat.drawingPosition.radius;
  
              // Usamos la distancia euclidiana para una detección más precisa
              const distance = Math.sqrt(
                Math.pow(scaledX - seatPosX, 2) + Math.pow(scaledY - seatPosY, 2)
              );
  
              return distance <= seatRadius && !seat.taken; // Solo seleccionamos asientos no vendidos
            }
          )
        );
  
        if (clickedSeat.length > 0) {
          const seatRow = availableSeats.find((row) =>
            row.seats.some((seat) => seat.id === clickedSeat[0].id)
          );
  
          const rowPrice = seatRow ? seatRow.rowPrice : null;
          const row = seatRow ? seatRow.row : null;
          const division = selectedZone;  // Asumiendo que la zona seleccionada es la división
          const zoneId = selectedZoneId// Usar el zoneId de la zona seleccionada
          const showId = event.id
  
          const seatInfo = {
            ...clickedSeat[0],
            row,
            rowPrice,
            division,
            zoneId,
            showId
          };
  
          setSelectedSeats([seatInfo]);
          setIsSeatManagerOpen(true);
          console.log(seatInfo, "Información del asiento seleccionado");
        
      
    }
      } else {
        // Aquí va la lógica para detectar las zonas
        if (rgb === "rgb(255, 199, 206)" || rgb === "rgb(247, 191, 203)") {
          setSelectedZone("Preferencial");
          
          setZoneImage("/images/zona-roja.jpg");
          fetchSeatsForZone("Preferencial", event.id, selectedZoneId);
        } else if (rgb === "rgb(153, 190, 104)" || rgb === "rgb(198, 239, 206)") {
          setSelectedZone("VIP");
          
          setZoneImage("/images/zona-verde.jpg");
          fetchSeatsForZone("VIP", event.id, selectedZoneId);
        } else {
          setSelectedZone(null);
          setZoneImage("/images/zona-floresta.png");
          console.log("No se detectó una división válida canvas.");
        }
      }
    }
  };

  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));

  useEffect(() => {
    loadImage();
  }, [selectedZone, zoom, availableSeats, seatsDrawn]);

  // Función para dibujar los asientos sobre la imagen de la zona
  const drawSeats = (ctx) => {
    if (availableSeats && availableSeats.length > 0) {
      availableSeats.forEach((seatRow) => {
        seatRow.seats.forEach((seat) => {
          const seatColor = seat.taken ? 'red' : 'green'; // Si el asiento está vendido, lo pintamos de rojo
          const canvas = canvasRef.current;
          const image = new Image();
          image.src = zoneImage;
          image.onload = () => {
            const imageWidth = image.width;
            const imageHeight = image.height;
  
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
  
            const scaleX = canvasWidth / imageWidth;
            const scaleY = canvasHeight / imageHeight;
  
            const scaledX = seat.x * scaleX * zoom;
            const scaledY = seat.y * scaleY * zoom;
  
            // Dibujar el asiento en el canvas
            ctx.beginPath();
            ctx.arc(scaledX, scaledY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = seatColor;
            ctx.fill();
            ctx.stroke();
  
            // Si el asiento está vendido, agregar texto "Asiento Vendido"
            if (seat.taken) {
              ctx.font = "12px Arial";
              ctx.fillStyle = "white";
              ctx.fillText("Vendido", scaledX - 15, scaledY + 5); // Ajusta la posición del texto según sea necesario
            }
  
            // Guardar la información del asiento para la detección de clics
            seat.drawingPosition = { x: scaledX, y: scaledY, radius: 10 };
          };
        });
      });
      setSeatsDrawn(true); // Indicar que los asientos han sido dibujados
    } else {
      console.log("No hay asientos disponibles para la división seleccionada");
    }
  };
  

  const loadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const img = new Image();
      img.src = zoneImage;  // Usamos la imagen de la zona seleccionada
  
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        const scaledWidth = canvas.width;
        const scaledHeight = canvas.height;
  
        // Limpiar el canvas antes de dibujar
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
  
        // Dibujar la imagen del mapa sobre el canvas
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
        // Solo dibujar los asientos si ya se ha seleccionado una zona
        if (selectedZone) {
          drawSeats(ctx);
        }
      };
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!event) {
    return <div>Event not Found</div>;
  }
  
 
  // console.log(event, "DATOS DEL EVENTO")
  // console.log(shows, "DATOS DEL SHOW")

  return (
    <div className="event-detail">
      <h1>{event.name}</h1>
      <p>Genre: {event.genre.join(', ')}</p>
      <p>Location: "Floresta"</p>
      <p>Address: Jujuy 200</p>
      <img className="event-image" src={event.coverImage} alt={event.name} />

      {event.presentation.map((presentation, index) => (
        <div key={index}>
          <p><strong>Date:</strong> {presentation.date}</p>
          <p><strong>Performance:</strong> {presentation.performance}</p>
          <p><strong>Time:</strong> {presentation.time.start} - {presentation.time.end}</p>
          <button onClick={() => setIsZoneEditorOpen(true)}>Add Data</button>
        </div>
      ))}

           {isZoneEditorOpen && <ZoneEditor showId={id} />}
           <button onClick={() => setIsZoneEditorOpen(false)}>Close</button>
           {/* <ZoneEditor showId={event.id} /> */}


      {/* Aquí se muestra el mapa debajo de los detalles del evento */}

      <div className="map-container" style={{ 
        position: 'relative',
        width: '50%',
        height: '50%' ,
        left:"25%"
        
      }}>
      
  
      <canvas
  ref={canvasRef}
  onClick={handleCanvasClick}
  style={{
    cursor: 'pointer',
    width: '100%',  // O el tamaño que desees
    height: '100%'  // O el tamaño que desees
  }}
  width={1400}  // Tamaño en píxeles
  height={1400}  // Tamaño en píxeles
/>
    
    
     {selectedZone && <p>Selected Zone: {selectedZone}</p>}
     </div>
       
      


      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setIsSeatManagerOpen(false)}></div>
          <div className="modal-content">
            <h2> Select Your Seat</h2>
  
  <Seatbuy
seats={selectedSeats[0]}  // Solo el primer asiento seleccionado
// mapaUrl={zoneImage}
onSeatsSelected={handleSeatsSelected}
availableSeats={availableSeats}
isSelectable={true}
selectedSeats={selectedSeats}
eventDetails={event}



/>
            <button onClick={() => setIsSeatManagerOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
