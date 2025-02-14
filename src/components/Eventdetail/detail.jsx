import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import '../Eventdetail/detail.css';
import Seatbuy from '../ManagerSeat/seatbuy';
import axios from 'axios';
import ZoneEditor from "../ManagerSeat/zoneditor"
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal'; // Si usas React Modal
import { FaMusic, FaMapMarkerAlt, FaCalendarAlt, FaTheaterMasks, FaClock } from 'react-icons/fa';

// import Generaltribunes from './generaltribune';
// Agrega esta configuración inicial si aún no lo hiciste
Modal.setAppElement('#root');



const Detail = () => {
  const { id} = useParams();
  const showId = Number(id); // Convertir a número si es necesario
  const navigate = useNavigate();
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
  const [zoneImage, setZoneImage] = useState(null); // Mapa general al principio
  const [zonesLoaded, setZonesLoaded] = useState(false);
  const canvasRef = useRef(null);
  const [seatsDrawn, setSeatsDrawn] = useState(false);
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  const [presentation, setPresentations] = useState([]); // Fechas y horarios obtenidos de la acción
  const [selectedPresentation, setSelectedPresentation] = useState({
    date: '',
    time: ''
  });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [availablePresentations, setAvailablePresentations] = useState([]);
  const [timer, setTimer] = useState(10 * 60);  // 20 minutos en segundos
  const [countdownStarted, setCountdownStarted] = useState(false); // Para evitar que inicie más de una vez
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // Aquí almacenarás la información de la división
  const user = useSelector((state) => state.user);
  const [showMap, setShowMap] = useState(false); // El mapa está oculto por defecto


  const openModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  useEffect(() => {

    if (!showMap) return; // Si showMap es false, no hacemos nada

    if (!id) {
      console.error("id no está definido, no se puede cargar la imagen del mapa.");
      return;
    }
  
    const fetchZones = async () => {
      try {
        const response = await axios.get("/zones"); // Ruta correcta de la API
        if (response.status === 200) {
          const zones = response.data.zones;
          
          // Filtrar zonas por showId
          const matchingZones = zones.filter((zone) => zone.showId === Number(id));
  
          if (matchingZones.length > 0) {
            console.log("Zonas encontradas para el show:", matchingZones);
  
            // Asignar imagen basada en zoneId
            matchingZones.forEach((zone) => {
              switch (zone.id) {
                case 1:
                  setZoneImage("/images/zona-floresta.jpg");
                  break;
                case 2:
                  setZoneImage("/images/movistar-arena.jpg");
                  break;
                default:
                  setZoneImage(null);
              }
            });
          } else {
            console.warn(`No se encontraron zonas para el showId: ${id}`);
            setZoneImage(null);
          }
        }
      } catch (error) {
        console.error("Error al cargar las zonas:", error);
      }
    };
  
    fetchZones();
  }, [showMap,id]); // Se ejecuta solo cuando el id cambia
  
  // Este efecto se ejecuta cuando zonesLoaded cambia, forzando la actualización del estado
  useEffect(() => {
    if (zonesLoaded) {
      setZoneImage("/images/zona-floresta.jpg"); // Asegura que se establezca correctamente
    }
  }, [zonesLoaded]);

  // Buscar el evento en el array de shows
  const event = shows.find((show) => show.id === parseInt(id));


  // 
  // Filtrar los asientos disponibles cuando se seleccione una zona
  const fetchSeatsForZone = async (divisionName, showId) => {
    try {
        const response = await axios.get("/zones");
        if (response.status === 200) {
            const zones = response.data.zones;

            // Filtrar las zonas por showId y divisionName
            const matchedZones = zones.filter(
                (zone) =>
                    zone.showId === showId &&
                    zone.location.some((loc) => loc.division === divisionName)
            );

            if (matchedZones.length > 0) {
                // Crear el array de presentaciones con lógica adaptada
                const presentations = matchedZones.map((zone) => {
                    const presentation = zone.presentation;
                    const generalTicket = zone.generalTicket ?? false; // Asegurar que no sea undefined
                    const generalPrice = zone.location.find(
                        (loc) => loc.division === divisionName
                    )?.generalPrice || 0;

                    // Asignar generalTicket según la fecha y hora de la presentación
                    const isCorrectTime = presentation.time.start && presentation.time.end;
                    
                    return {
                        zoneId: zone.id,
                        divisionName: divisionName,
                        presentation: presentation,
                        location: zone.location,
                        space: zone.space || zone.location.find(loc => loc.division === divisionName)?.space || 0,
                        generalPrice: generalPrice,
                        generalTicket: isCorrectTime ? generalTicket : false, // Aquí asignamos el valor dinámicamente
                      };
                    });
      

                console.log('Presentations:', presentations);
                setAvailablePresentations(presentations);
                setIsSelectorOpen(true);
            } else {
                console.log("No se encontraron zonas para esta presentación.");
            }
        }
    } catch (error) {
        console.error("Error al cargar las divisiones:", error);
    }
};
  
  
 
  const canvasWidth = zoneImage === "/images/Platea-Sur.jpg" || zoneImage === "/images/Platea-Norte.png" ? 2600 : 1400; // Tamaño de canvas específico para Platea
  const canvasHeight = zoneImage === "/images/Platea-Sur.jpg" || zoneImage === "/images/Platea-Norte.png" ? 300 : 1400; // Tamaño de canvas específico para Platea


  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Ajuste para tener en cuenta el zoom
      const scaledX = x / zoom;
      const scaledY = y / zoom;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Redibuja los asientos si es necesario, excepto para Tribunas Generales
      if (seatsDrawn && selectedZone !== "Tribunas Generales") {
        drawSeats(ctx); // Asegúrate de que los asientos se dibujen con la escala correcta
      }

     


      const pixel = ctx.getImageData(scaledX, scaledY, 1, 1).data;
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

      // Aquí se debe ajustar el código para detectar correctamente las zonas
      if (seatsDrawn) {
        const clickedSeat = availableSeats.flatMap((seatRow) =>
          seatRow.seats.filter((seat) => {
            const seatPosX = seat.drawingPosition.x;
            const seatPosY = seat.drawingPosition.y;
            const seatRadius = seat.drawingPosition.radius;

            const distance = Math.sqrt(
              Math.pow(scaledX - seatPosX, 2) + Math.pow(scaledY - seatPosY, 2)
            );

            return distance <= seatRadius && !seat.taken;
          })
        );

        if (clickedSeat.length > 0) {
          const seatRow = availableSeats.find((row) =>
            row.seats.some((seat) => seat.uniqueId === clickedSeat[0].uniqueId)
          );

            
          const selectedZoneInfo = availablePresentations.find(p => 
            p.divisionName === selectedZone &&
            p.presentation.date === selectedPresentation.date &&
            p.presentation.time.start === selectedPresentation.time.start
          );
          
          // Verifica que selectedZoneId esté correctamente asignado
          const selectedZoneId = selectedZoneInfo ? selectedZoneInfo.zoneId : null;
          
          // Asegúrate de obtener el precio adecuado
          const price = selectedZoneInfo?.generalTicket
            ? selectedZoneInfo.generalPrice  // Si es true, usar generalPrice para todos los asientos
            : seatRow?.rowPrice;  // Si es false, usar rowPrice de la fila
          
          // Crear el objeto seatInfo con zoneId corregido
          const seatInfo = {
            ...clickedSeat[0],
            row: seatRow ? seatRow.row : null,
            price: price ?? 0,
            division: selectedZone,
            zoneId: selectedZoneId, // Aquí asegúrate que zoneId no sea null
            showId: event.id,
          };
          
          console.log("ENVIAR A SEATS", seatInfo);
          setSelectedSeats([seatInfo]);
          setSelectedSeats([seatInfo]);
          setIsSeatManagerOpen(true);
        } else {
          Swal.fire({
            icon: 'error',
            title: '¡Asiento Ocupado!',
            text: 'Este asiento ya está ocupado, selecciona otro asiento.',
          });
        }
      } else {
        // Aquí va la lógica para detectar las zonas
        if (rgb === "rgb(255, 199, 206)" || rgb === "rgb(247, 191, 203)") {
          setSelectedZone("Preferencial");
          setZoneImage("/images/zona-roja.jpg");
          fetchSeatsForZone("Preferencial", event.id, selectedZoneId); // Recupera los asientos para Preferencial
        } else if (rgb === "rgb(153, 190, 104)" || rgb === "rgb(198, 239, 206)") {
          setSelectedZone("Vip");
          setZoneImage("/images/zona-verde.jpg");
          fetchSeatsForZone("Vip", event.id, selectedZoneId); // Recupera los asientos para VIP
        } else if (rgb === "rgb(255, 235, 156)" || rgb === "rgb(201, 155, 0)") {
          setSelectedZone("Gold");
          setZoneImage("/images/zona-Gold.png");
          fetchSeatsForZone("Gold", event.id, selectedZoneId); // Recupera los asientos para Gold
        } else if (rgb === "rgb(189, 215, 238)" || rgb === "rgb(118, 182, 238)") {
          setSelectedZone("Platea Sur");
          setZoneImage("/images/Platea-Sur.jpg");
          fetchSeatsForZone("Platea Sur", event.id, selectedZoneId); // Recupera los asientos para Platea Sur
        } else if (rgb === "rgb(162, 202, 238)" || rgb === "rgb(126, 185, 238)") {
          setSelectedZone("Platea Norte");
          setZoneImage("/images/Platea-Norte.png");
          fetchSeatsForZone("Platea Norte", event.id, selectedZoneId); // Recupera los asientos para Platea-Norte
        } else if (rgb === "rgb(255, 255, 204)" || rgb === "rgb(255, 255, 204))") {
          setSelectedZone("Tribunas Generales");
          setZoneImage("/images/Popular-Alta.png");
          setAvailableSeats([]); // No dibujar asientos para Tribunas Generales
          setSeatsDrawn(false); // Asegura que no se dibujen asientos
          fetchSeatsForZone("Tribunas Generales", event.id, selectedZoneId); // Recupera los asientos para Tribunas Generales

        } else {
          setSelectedZone(null);
          setZoneImage("/images/zona-floresta.png");
          // console.log(rgb, "COLORES DEL CLICK")
          // console.log("No se detectó una división válida canvas.");
        }
      }
    }
  };
  const handleConfirmSelection = (presentation) => {
    if (presentation) {
      // Establecer la presentación seleccionada
      setSelectedPresentation({
        date: presentation.presentation.date,
        time: presentation.presentation.time,
      });

      let generalDivision = null;

      // Buscar "Tribunas Generales" y verificar que `location` es un array
      if (Array.isArray(presentation.location)) {
        generalDivision = presentation.location.find(
          (loc) => loc.division === "Tribunas Generales"
        );
        // console.log("General Division encontrado:", generalDivision);
      } else {
        console.error(
          "La propiedad 'location' no es un array válido:",
          presentation.location
        );
      }

      if (presentation.divisionName === "Tribunas Generales") {
        if (generalDivision && generalDivision.space !== undefined) {
          setModalData({
            space: generalDivision?.space || "No disponible",
            date: presentation.presentation.date,
            time: presentation.presentation.time,
          });
          navigate(`/generaltribune`, {
            state: {
              space: generalDivision?.space,
              presentations:
                presentation?.divisionName,
              date: presentation.presentation.date,
              time: presentation.presentation.time,
              zoneId: selectedZoneId,
              showId: event.id,
              users: user?.id,
              cashier: user?.cashier,
              price: generalDivision?.generalPrice,
              occupied: generalDivision?.occupied,
              eventdetail: event

            }
          })
        } else {
          console.error("No se encontró la división 'Tribunas Generales' en location.");
        }

        // Evitar dibujar asientos para Tribunas Generales
        setAvailableSeats([]);
        setSeatsDrawn(false);

      } else {
        // Continuar con el flujo para otras divisiones
        const selectedZone = availablePresentations.find(
          (p) => p.zoneId === presentation.zoneId
        );

        const filteredDivision = selectedZone?.location.find(
          (loc) => loc.division === selectedZone.divisionName
        );

        if (filteredDivision) {
          const updatedRows = filteredDivision.rows.map((row) => ({
            ...row,
            seats: row?.seats?.map((seat) => ({
              ...seat,
              uniqueId: `${row.row}-${seat.id}`, // Crear identificador único
            })),
          }));
          setAvailableSeats(updatedRows); // Actualizar solo con la división seleccionada
          setSeatsDrawn(true);
        } else {
          console.error(
            "No se encontraron asientos para la división seleccionada."
          );
        }
      }

      // Mostrar el alert para todas las presentaciones
      Swal.fire({
        title: "Tienes 10 minutos para elegir un asiento y realizar la compra",
        text: "¡Presiona OK para comenzar!",
        icon: "info",
        confirmButtonText: "OK",
      }).then(() => {
        setCountdownStarted(true);
        // Iniciar el contador
        const intervalId = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 0) {
              clearInterval(intervalId); // Detener el contador
              window.location.href = "/home"; // Redirigir a la página de inicio
            }
            return prevTimer - 1;
          });
        }, 1000); // Actualizar cada segundo
      });

      setIsSelectorOpen(false); // Cierra el selector
      // console.log("Presentación seleccionada:", presentation);
      // console.log("modalData:", modalData);
    }
  };


  useEffect(() => {
    if (zoneImage === "/images/Platea-Sur.jpg" || zoneImage === "/images/Platea-Norte.png") {
      setZoom(1); // Restablecer zoom para Platea
    } else {
      setZoom(1); // Restablecer zoom para otras imágenes si es necesario
    }
  }, [zoneImage]);

  useEffect(() => {
    if (modalData) {

    }
  }, [modalData]);





  const handleZoomIn = () => {
    setZoom((prevZoom) => {
      if (zoneImage === "/images/Platea-Sur.jpg" || zoneImage === "/images/Platea-Norte.png") {
        return Math.min(prevZoom + 0.05, 1.5); // Límite máximo de zoom para Platea
      }
      return Math.min(prevZoom + 0.1, 2); // Límite general de zoom
    });
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => {
      if (zoneImage === "/images/Platea-Sur.jpg" || zoneImage === "/images/Platea-Norte.png") {
        return Math.max(prevZoom - 0.05, 0.5); // Límite mínimo de zoom para Platea
      }
      return Math.max(prevZoom - 0.1, 0.5); // Límite general de zoom
    });
  };

  useEffect(() => {
    loadImage();
  }, [selectedZone, zoom, availableSeats, seatsDrawn]);

  useEffect(() => {
    if (zoneImage) {
      loadImage();
    }
  }, [zoneImage]);




  // Función para dibujar los asientos sobre la imagen de la zona
  const drawSeats = (ctx) => {
    if (availableSeats && availableSeats.length > 0) {
      const image = new Image();
      image.src = zoneImage;

      image.onload = () => {
        const imageWidth = zoneImage === "/images/Platea-Sur.jpg" ? 800 : zoneImage === "/images/Platea-Norte.png" ? 800 : image.width;
        const imageHeight = zoneImage === "/images/Platea-Sur.jpg" ? 48 : zoneImage === "/images/Platea-Norte.png" ? 48 : image.height;

        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;

        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;

        availableSeats.forEach((seatRow) => {
          seatRow?.seats?.forEach((seat) => {
            const seatColor = seat.taken ? 'red' : 'green';

            // Ajustar las posiciones de los asientos según la escala y el zoom
            const scaledX = seat.x * scaleX * zoom;
            const scaledY = seat.y * scaleY * zoom;

            // Dibujar el asiento en el canvas
            ctx.beginPath();
            ctx.arc(scaledX, scaledY, 14 * zoom, 0, 2 * Math.PI); // Ajustar el radio del asiento
            ctx.fillStyle = seatColor;
            ctx.fill();
            ctx.stroke();

            if (seat.taken) {
              ctx.font = `${14 * zoom}px Arial`;
              ctx.fillStyle = "white";
              const textWidth = ctx.measureText("").width;
              ctx.fillText("", scaledX - textWidth / 2, scaledY + 5 * zoom); // Centrar el texto
            }

            seat.drawingPosition = { x: scaledX, y: scaledY, radius: 12 * zoom }; // Actualizar posición de dibujo
          });
        });

        setSeatsDrawn(true);
      };
    } else {
      console.log("No hay asientos disponibles para la división seleccionada");
    }
  };

  const loadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const img = new Image();
      img.src = zoneImage;

      img.onload = () => {
        const ctx = canvas.getContext('2d');
        const scaledWidth = canvas.width * zoom;
        const scaledHeight = canvas.height * zoom;

        // Limpiar el canvas antes de dibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let width = img.width;
        let height = img.height;

        if (zoneImage === "/images/Platea-Sur.jpg") {
          width = 1400; // Ajuste específico para Platea Sur
          height = 1200;
        } else if (zoneImage === "/images/Platea-Norte.png") {
          width = 1400; // Ajuste específico para Platea Norte
          height = 1200;
        }

        // Dibujar la imagen escalada en el canvas
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, scaledWidth, scaledHeight);

        // Solo dibujar los asientos si ya se ha seleccionado una zona
        if (selectedZone) {
          drawSeats(ctx);  // Redibuja los asientos con la nueva escala
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

  const handleChooseSeats = () => {
    setShowMap(true); // Muestra el mapa cuando se hace clic en "Elegir asientos"
  };


  return (
    <div className="event-detail">
      <h1>{event.name}</h1>

      

     
      {countdownStarted && (
        <div className="countdown" style={{ position: 'absolute', top: '610px', left: '60%', transform: 'translateX(-50%)' }}>
          <h2>{Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</h2> {/* Mostrar el tiempo restante */}
        </div>
      )}

      {event.presentation.map((presentation, index) => (
        <div class="box-contenedor">
          <div className="event-imagen" key={index}>
          
          {/* Verifica si la URL es de YouTube para renderizar un iframe en lugar de una imagen */}
      {event.coverImage.includes("youtube.com") || event.coverImage.includes("youtu.be") ? (
        <iframe
          className="event-video"
          src={event.coverImage.replace("watch?v=", "embed/")}
          title={event.name}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      ) : (
        <img className="event-image" src={event.coverImage} alt={event.name} />
      )}
      </div>
      <div className="event-info" key={index}>
       <p><FaMusic style={{ color: 'black' }} /> <strong>Genero:</strong> {event.genre.join(', ')}</p>
       <p><FaMapMarkerAlt style={{ color: 'red' }} /> <strong>Direccion y Lugar:</strong> {event.location}</p>
       <p><FaCalendarAlt style={{ color: 'green' }} /> <strong>Fecha:</strong> {presentation.date}</p>
       <p><FaTheaterMasks style={{ color: 'blue' }} /> <strong>Presentaciones:</strong> {presentation.performance}</p>
       <p><FaClock style={{ color: 'red' }} /> <strong>Horarios:</strong> {presentation.time.start} - {presentation.time.end}</p>
       </div>
          </div>
      ))}
          

          {user?.isAdmin && (
  <>
    <button onClick={() => setIsZoneEditorOpen(true)}>Add Data</button>
    {isZoneEditorOpen && <ZoneEditor showId={id} />}
    <button onClick={() => setIsZoneEditorOpen(false)}>Close</button>
  </>
)}
      {/* <ZoneEditor showId={event.id} /> */}

      {isSelectorOpen && (
        <div className="modal-background">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Selecciona una fecha y hora:</h3>
            <ul>
              {availablePresentations.map((presentation, index) => (
                <li
                  key={index}
                  onClick={() => handleConfirmSelection(presentation)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "1px solid #ccc",
                    marginBottom: "5px",
                  }}
                >
                  <p>Zona: {Array.isArray(presentation.divisionName) ? presentation.divisionName.join(", ") : presentation.divisionName}</p>
                  <p>Fecha: {presentation.presentation.date}</p>
                  <p>Hora: {presentation.presentation.time.start} - {presentation.presentation.time.end}</p>
                </li>
              ))}
            </ul>
            <button onClick={() => setIsSelectorOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}


      {/* Aquí se muestra el mapa debajo de los detalles del evento */}

      <div>
      {/* Botón para mostrar el mapa */}
      
      {!showMap && (
  <button 
    onClick={handleChooseSeats} 
    style={{ backgroundColor: 'green', color: 'white' }}
  >
    Elegir Asientos
  </button>
)}
      

      {/* Aquí se muestra el mapa debajo de los detalles del evento */}
      {showMap && zoneImage && (
        <div className="map-container" style={{
          position: 'relative',
          width: '50%',
          height: '50%',
          left: "25%"
        }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: '100%',
            }}
            width={canvasWidth}
            height={canvasHeight}
          />

          {selectedZone && <p>Selected Zone: {selectedZone}</p>}
        </div>
      )}

      <div
        className="image-preview"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
      >
      </div>
    </div>
  

      <div className="zoom-controls">
        {/* <button onClick={handleZoomOut}>-</button>
        <button onClick={handleZoomIn}>+</button> */}
      </div>
      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setIsSeatManagerOpen(false)}></div>
          <div className="modal-content">
            <h2> Select Your Seat</h2>

            <Seatbuy
  seats={selectedSeats[0]}  // Solo el primer asiento seleccionado
  onSeatsSelected={handleSeatsSelected}
  availableSeats={availableSeats}
  isSelectable={true}
  selectedSeats={selectedSeats}
  eventDetails={event}
  selectedPresentation={selectedPresentation}
  zoneId={selectedSeats[0]?.zoneId}  // Asegúrate de pasar zoneId aquí
/>

            <button onClick={() => setIsSeatManagerOpen(false)}>Close</button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;















































