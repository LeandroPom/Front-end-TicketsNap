// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { getShows } from '../Redux/Actions/actions';
// import '../Eventdetail/detail.css';
// import Seatbuy from '../ManagerSeat/seatbuy';
// import axios from 'axios';
// import ZoneEditor from "../ManagerSeat/zoneditor"
// import Swal from 'sweetalert2';

// const Detail = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const shows = useSelector((state) => state.shows);
//   const loading = useSelector((state) => state.loading);
//   const error = useSelector((state) => state.error);
//   const [zoneData, setZoneData] = useState([]);
//   const [isSeatManagerOpen, setIsSeatManagerOpen] = useState(false);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [availableSeats, setAvailableSeats, handleSeatsSelected] = useState([]);
//   const [selectedZone, setSelectedZone] = useState(null);
//   const [selectedZoneId, setSelectedZoneId] = useState(null);
//   const [zoom, setZoom] = useState(1);
//   const [zoneImage, setZoneImage] = useState('/images/zona-floresta.png'); // Mapa general al principio
//   const canvasRef = useRef(null);
//   const [seatsDrawn, setSeatsDrawn] = useState(false);
//   const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
//   const [presentation, setPresentations] = useState([]); // Fechas y horarios obtenidos de la acción
//   const [selectedPresentation, setSelectedPresentation] = useState({
//     date: '',
//     time: ''
//   });
//   const [isSelectorOpen, setIsSelectorOpen] = useState(false);
//   const [availablePresentations, setAvailablePresentations] = useState([]);
 

 
//   // Buscar el evento en el array de shows
//   const event = shows.find((show) => show.id === parseInt(id));
  
  
//   // 
//   // Filtrar los asientos disponibles cuando se seleccione una zona
//   const fetchSeatsForZone = async (divisionName, showId) => {
//     try {
//       const response = await axios.get("http://localhost:3001/zones");
//       if (response.status === 200) {
//         const zones = response.data.zones;
  
//         // Filtrar las zonas por showId, divisionName y presentación
//         const matchedZones = zones.filter(
//           (zone) =>
//             zone.showId === showId &&
//             zone.location.some((loc) => loc.division === divisionName)
//         );
  
//         if (matchedZones.length > 0) {
//           console.log(matchedZones, "Zonas matcheadas");
  
//           // Guardar el zoneId de la primera zona coincidente
//           setSelectedZoneId(matchedZones[0].id);
  
//           // Actualizamos presentaciones disponibles
//           const presentations = matchedZones.map((zone) => ({
//             zoneId: zone.id, // ZoneId dinámico
//             divisionName: divisionName, // División específica
//             presentation: zone.presentation,
//             location: zone.location, // Contiene los datos de las filas y los asientos
//           }));
  
//           console.log(presentations, "Presentaciones disponibles");
  
//           // Establecer presentaciones y asientos
//           setAvailablePresentations(presentations);
//           setIsSelectorOpen(true);
//         } else {
//           console.log("No se encontraron zonas para esta presentación.");
//         }
//       }
//     } catch (error) {
//       console.error("Error al cargar las divisiones:", error);
//     }
//   };

//   const canvasWidth = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 2600 : 1400; // Tamaño de canvas específico para Platea
//   const canvasHeight = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 300 : 1400; // Tamaño de canvas específico para Platea

//   const handleCanvasClick = (e) => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const rect = canvas.getBoundingClientRect();
//       const x = (e.clientX - rect.left) * (canvas.width / rect.width);
//       const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
//       // Ajuste para tomar en cuenta el zoom
//       const scaledX = x / zoom;
//       const scaledY = y / zoom;
  
//       const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
//       if (seatsDrawn) {
//         drawSeats(ctx);
//       }
  
//       const pixel = ctx.getImageData(scaledX, scaledY, 1, 1).data;
//       const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  
//       if (seatsDrawn) {
//         const clickedSeat = availableSeats.flatMap((seatRow) =>
//           seatRow.seats.filter((seat) => {
//             const seatPosX = seat.drawingPosition.x;
//             const seatPosY = seat.drawingPosition.y;
//             const seatRadius = seat.drawingPosition.radius;
  
//             const distance = Math.sqrt(
//               Math.pow(scaledX - seatPosX, 2) + Math.pow(scaledY - seatPosY, 2)
//             );
  
//             return distance <= seatRadius && !seat.taken;
//           })
//         );
                                
//       // Procesar el asiento clickeado con `uniqueId`
//       if (clickedSeat.length > 0) {
//           const seatRow = availableSeats.find((row) =>
//               row.seats.some((seat) => seat.uniqueId === clickedSeat[0].uniqueId) // Buscar por `uniqueId`
//           );
      
//           const rowPrice = seatRow ? seatRow.rowPrice : null;
//           const row = seatRow ? seatRow.row : null;
//           const division = selectedZone;
//           const zoneId = selectedZoneId;
//           const showId = event.id;
      
//           const seatInfo = {
//               ...clickedSeat[0],
//               row,
//               rowPrice,
//               division,
//               zoneId,
//               showId,
//           };
      
//           setSelectedSeats([seatInfo]);
//         setIsSeatManagerOpen(true);
//         console.log(seatInfo, "Información del asiento seleccionado");
//       } else {
//         // Mostrar alerta si el asiento está ocupado
//         Swal.fire({
//           icon: 'error',
//           title: '¡Asiento Ocupado!',
//           text: 'Este asiento ya está ocupado, selecciona otro asiento.',
//         });
//       }
//     } else {
//         // Aquí va la lógica para detectar las zonas
//         if (rgb === "rgb(255, 199, 206)" || rgb === "rgb(247, 191, 203)") {
//           setSelectedZone("Preferencial");
//           setZoneImage("/images/zona-roja.jpg");
//           fetchSeatsForZone("Preferencial", event.id, selectedZoneId); // Recupera los asientos para Preferencial
//         } else if (rgb === "rgb(153, 190, 104)" || rgb === "rgb(198, 239, 206)") {
//           setSelectedZone("Vip");
//           setZoneImage("/images/zona-verde.jpg");
//           fetchSeatsForZone("Vip", event.id , selectedZoneId) ; // Recupera los asientos para VIP
//         } else if (rgb === "rgb(255, 235, 156)" || rgb === "rgb(201, 155, 0)") {
//           setSelectedZone("Gold");
//           setZoneImage("/images/zona-Gold.png");
//           fetchSeatsForZone("Gold", event.id , selectedZoneId) ; // Recupera los asientos para Gold
//         } else if (rgb === "rgb(189, 215, 238)" || rgb === "rgb(118, 182, 238)") {
//           setSelectedZone("Platea Sur");
//           setZoneImage("/images/Platea-Sur.png");
//           fetchSeatsForZone("Platea Sur", event.id , selectedZoneId) ; // Recupera los asientos para Platea Sur
//         } else if (rgb === "rgb(162, 202, 238)" || rgb === "rgb(126, 185, 238)") {
//           setSelectedZone("Platea Norte");
//           setZoneImage("/images/Platea-Norte.png");
//           fetchSeatsForZone("Platea Norte", event.id , selectedZoneId) ; // Recupera los asientos para Platea-Norte
//         } else if (rgb === "rgb(255, 255, 204)" || rgb === "rgb(255, 255, 204))") {
//           setSelectedZone("Tribunas Generales");
//           setZoneImage("/images/Popular-Alta.png");
//           fetchSeatsForZone("Tribunas Generales", event.id , selectedZoneId) ; // Recupera los asientos para Tribunas Generales
//         } else {
//           setSelectedZone(null);
//           setZoneImage("/images/zona-floresta.png");
//           console.log(rgb, "COLORES DEL CLICK")
//           console.log("No se detectó una división válida canvas.");
//         }
//       }
//     }
//   };
//   const handleConfirmSelection = (presentation) => {
//     if (presentation) {
//         // Establece la presentación seleccionada
//         setSelectedPresentation({
//             date: presentation.presentation.date,
//             time: presentation.presentation.time,
//         });

//         // Filtrar asientos de la división seleccionada
//         const selectedZone = availablePresentations.find(p => p.zoneId === presentation.zoneId);
//         const filteredDivision = selectedZone.location.find(loc => loc.division === selectedZone.divisionName);


        
        
//         if (filteredDivision) {
//           const updatedRows = filteredDivision.rows.map((row) => ({
//               ...row,
//               seats: row.seats.map((seat) => ({
//                   ...seat,
//                   uniqueId: `${row.row}-${seat.id}`, // Crear identificador único
//               })),
//           }));
//           setAvailableSeats(updatedRows); // Solo filas de la división seleccionada
//           setSeatsDrawn(true);
//       } else {
//           console.error("No se encontraron asientos para la división seleccionada.");
//       }
//         setIsSelectorOpen(false); // Cierra el selector
//         console.log("Presentación seleccionada:", presentation);
//     }
// };

// useEffect(() => {
//   if (zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png") {
//     setZoom(1); // Restablecer zoom para Platea
//   } else {
//     setZoom(1); // Restablecer zoom para otras imágenes si es necesario
//   }
// }, [zoneImage]);

// console.log(availableSeats, 'Asientos disponibles');


// const handleZoomIn = () => {
//   setZoom((prevZoom) => {
//     if (zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png") {
//       return Math.min(prevZoom + 0.05, 1.5); // Límite máximo de zoom para Platea
//     }
//     return Math.min(prevZoom + 0.1, 2); // Límite general de zoom
//   });
// };

// const handleZoomOut = () => {
//   setZoom((prevZoom) => {
//     if (zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png") {
//       return Math.max(prevZoom - 0.05, 0.5); // Límite mínimo de zoom para Platea
//     }
//     return Math.max(prevZoom - 0.1, 0.5); // Límite general de zoom
//   });
// };

// useEffect(() => {
//   loadImage();
// }, [selectedZone, zoom, availableSeats, seatsDrawn]);





// // Función para dibujar los asientos sobre la imagen de la zona
// const drawSeats = (ctx) => {
//   if (availableSeats && availableSeats.length > 0) {
//     const image = new Image();
//     image.src = zoneImage;

//     image.onload = () => {
//       const imageWidth = zoneImage === "/images/Platea-Sur.png" ? 800 : zoneImage === "/images/Platea-Norte.png" ? 800 : image.width;
//       const imageHeight = zoneImage === "/images/Platea-Sur.png" ? 48 : zoneImage === "/images/Platea-Norte.png" ? 48 : image.height;

//       const canvasWidth = canvasRef.current.width;
//       const canvasHeight = canvasRef.current.height;

//       const scaleX = canvasWidth / imageWidth;
//       const scaleY = canvasHeight / imageHeight;

//       availableSeats.forEach((seatRow) => {
//         seatRow.seats.forEach((seat) => {
//           const seatColor = seat.taken ? 'red' : 'green';

//           // Ajustar las posiciones de los asientos según la escala y el zoom
//           const scaledX = seat.x * scaleX * zoom;
//           const scaledY = seat.y * scaleY * zoom;

//           // Dibujar el asiento en el canvas
//           ctx.beginPath();
//           ctx.arc(scaledX, scaledY, 12 * zoom, 0, 2 * Math.PI); // Ajustar el radio del asiento
//           ctx.fillStyle = seatColor;
//           ctx.fill();
//           ctx.stroke();

//           if (seat.taken) {
//             ctx.font = `${14 * zoom}px Arial`;
//             ctx.fillStyle = "white";
//             const textWidth = ctx.measureText("").width;
//             ctx.fillText("", scaledX - textWidth / 2, scaledY + 5 * zoom); // Centrar el texto
//           }

//           seat.drawingPosition = { x: scaledX, y: scaledY, radius: 12 * zoom }; // Actualizar posición de dibujo
//         });
//       });

//       setSeatsDrawn(true);
//     };
//   } else {
//     console.log("No hay asientos disponibles para la división seleccionada");
//   }
// };

// const loadImage = () => {
//   const canvas = canvasRef.current;
//   if (canvas) {
//     const img = new Image();
//     img.src = zoneImage;

//     img.onload = () => {
//       const ctx = canvas.getContext('2d');
//       const scaledWidth = canvas.width * zoom;
//       const scaledHeight = canvas.height * zoom;

//       // Limpiar el canvas antes de dibujar
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       let width = img.width;
//       let height = img.height;

//       if (zoneImage === "/images/Platea-Sur.png") {
//         width = 1400; // Ajuste específico para Platea Sur
//         height = 1200;
//       } else if (zoneImage === "/images/Platea-Norte.png") {
//         width = 1400; // Ajuste específico para Platea Norte
//         height = 1200;
//       }

//       // Dibujar la imagen escalada en el canvas
//       ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, scaledWidth, scaledHeight);

//       // Solo dibujar los asientos si ya se ha seleccionado una zona
//       if (selectedZone) {
//         drawSeats(ctx);  // Redibuja los asientos con la nueva escala
//       }
//     };
//   }
// };


//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }
  
//   if (!event) {
//     return <div>Event not Found</div>;
//   }
  
 
//   // console.log(event, "DATOS DEL EVENTO")
//   // console.log(shows, "DATOS DEL SHOW")

//   console.log(selectedPresentation, " DATOS DE LA PRESENTACION")

//   return (
//     <div className="event-detail">
//       <h1>{event.name}</h1>
//       <p>Genre: {event.genre.join(', ')}</p>
//       <p>Location: "Floresta"</p>
//       <p>Address: Jujuy 200</p>
//       <img className="event-image" src={event.coverImage} alt={event.name} />

//       {event.presentation.map((presentation, index) => (
//         <div key={index}>
//           <p><strong>Date:</strong> {presentation.date}</p>
//           <p><strong>Performance:</strong> {presentation.performance}</p>
//           <p><strong>Time:</strong> {presentation.time.start} - {presentation.time.end}</p>
//           <button onClick={() => setIsZoneEditorOpen(true)}>Add Data</button>
//         </div>
//       ))}

//            {isZoneEditorOpen && <ZoneEditor showId={id} />}
//            <button onClick={() => setIsZoneEditorOpen(false)}>Close</button>
//            {/* <ZoneEditor showId={event.id} /> */}

//            {isSelectorOpen && (
//   <div className="modal" onClick={(e) => e.stopPropagation()}>
//     <h3>Selecciona una fecha y hora:</h3>
//     <ul>
//       {availablePresentations.map((presentation, index) => (
//         <li
//           key={index}
//           onClick={() => handleConfirmSelection(presentation)}
//           style={{
//             cursor: "pointer",
//             padding: "10px",
//             border: "1px solid #ccc",
//             marginBottom: "5px",
//           }}
//         >
//          <p>Zona: {Array.isArray(presentation.divisionName) ? presentation.divisionName.join(", ") : presentation.divisionName}</p>

//           <p>Fecha: {presentation.presentation.date}</p>
//           <p>
//             Hora: {presentation.presentation.time.start} -{" "}
//             {presentation.presentation.time.end}
//           </p>
//         </li>
//       ))}
//     </ul>
//     <button onClick={() => setIsSelectorOpen(false)}>Cerrar</button>
//   </div>

// )}


//       {/* Aquí se muestra el mapa debajo de los detalles del evento */}

//       <div className="map-container" style={{ 
//         position: 'relative',
//         width: '50%',
//         height: '50%' ,
//         left:"25%"
        
//       }}>
      
  
//       <canvas
//     ref={canvasRef}
//     onClick={handleCanvasClick}
//     style={{
//       cursor: 'pointer',
//       width: '100%',
//       height: '100%',
//     }}
//     width={canvasWidth} // Ajuste dinámico de las dimensiones del canvas
//     height={canvasHeight} // Ajuste dinámico de las dimensiones del canvas
//   />

    
    
//      {selectedZone && <p>Selected Zone: {selectedZone}</p>}
//      </div>

     
//      <div 
//   className="image-preview"
//   style={{
//     transform: `scale(${zoom})`,
//     transformOrigin: "center",
//   }}
// >
//   {/* <img src={zoneImage} alt="Zona seleccionada" /> */}
// </div>

// <div className="zoom-controls">
//   <button onClick={handleZoomOut}>-</button>
//   <button onClick={handleZoomIn}>+</button>
// </div>
      


//       {isSeatManagerOpen && (
//         <div className="modal">
//           <div className="modal-overlay" onClick={() => setIsSeatManagerOpen(false)}></div>
//           <div className="modal-content">
//             <h2> Select Your Seat</h2>


            
  
//   <Seatbuy
// seats={selectedSeats[0]}  // Solo el primer asiento seleccionado
// // mapaUrl={zoneImage}
// onSeatsSelected={handleSeatsSelected}
// availableSeats={availableSeats}
// isSelectable={true}
// selectedSeats={selectedSeats}
// eventDetails={event}
// selectedPresentation={selectedPresentation}



// />

// {/* <SoldTickets
// seats={selectedSeats[0]}  // Solo el primer asiento seleccionado
// // mapaUrl={zoneImage}
// onSeatsSelected={handleSeatsSelected}
// availableSeats={availableSeats}
// isSelectable={true}
// selectedSeats={selectedSeats}
// eventDetails={event}
// selectedPresentation={selectedPresentation}



// /> */}
//             <button onClick={() => setIsSeatManagerOpen(false)}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Detail;
