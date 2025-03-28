// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import "./createzone.css"; // Estilos del componente

// const CreateZone = () => {
//   const dispatch = useDispatch();

//   const [zoneName, setZoneName] = useState("");  // Nombre de la zona (ej. Popular3)
//   const [divisionName, setDivisionName] = useState("");  // Nombre de la división (ej. Zona Roja)
//   const [mapImage, setMapImage] = useState(null);  // Imagen del mapa
//   const [seats, setSeats] = useState([]);  // Asientos en la zona
//   const [row, setRow] = useState(1);  // Fila
//   const [showSeatsForm, setShowSeatsForm] = useState(false);  // Mostrar formulario de asientos
//   const [selectedSeats, setSelectedSeats] = useState({});  // Asiento seleccionado
//   const [seatsId, setSeatsId] = useState("");  // ID del asiento
//   const [price, setPrice] = useState(1);  // Precio por asiento
//   const [generalPrice, setGeneralPrice] = useState(1);  // Precio general de la zona
//   const [zoomLevel, setZoomLevel] = useState(1);  // Zoom para el mapa
//   const [presentation, setPresentation] = useState([]);  // Presentaciones en el evento
//   const [presentationDate, setPresentationDate] = useState("");  // Fecha de la presentación
//   const [startTime, setStartTime] = useState("");  // Hora de inicio
//   const [endTime, setEndTime] = useState("");  // Hora de fin
//   const [secondStartPoint, setSecondStartPoint] = useState(false); // Estado para saber si ya generamos asientos hacia abajo

//   // Manejar la carga de la imagen del mapa
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setMapImage(imageUrl);
//     }
//   };

//   // Agregar una presentación
//   const handleAddPresentation = () => {
//     if (!presentationDate || !startTime || !endTime) {
//       alert("Please fill in all presentation fields.");
//       return;
//     }

//     const newPresentation = {
//       date: presentationDate,
//       performance: presentation.length + 1,
//       time: {
//         start: startTime,
//         end: endTime,
//       },
//     };

//     setPresentation([...presentation, newPresentation]);
//     setPresentationDate("");
//     setStartTime("");
//     setEndTime("");
//   };

  // USAR ESTE COMENTADO PARA UBICAR ASIENTOS EN FORMA VERTICAL INTERCALADOS ////

 // Agregar un asiento a la zona
//  const handleAddSeat = () => {
//   if (!row || !price || !selectedSeats.x || !selectedSeats.y || !seatsId) {
//     alert("Please provide valid seat data.");
//     return;
//   }

//   const numSeatsInRow = 20; // Generamos 20 asientos (10 hacia abajo, 10 hacia arriba)
//   const newSeats = [];
//   let baseIdDown = parseInt(seatsId); // Base ID para los asientos hacia abajo
//   let baseIdUp = parseInt(seatsId) + 1; // Base ID para los asientos hacia arriba

//   // Aseguramos que el estado de asientos anteriores no se pierda
//   let currentSeats = [...seats];

//   if (!secondStartPoint) {
//     // Generar 10 asientos hacia abajo con IDs impares
//     for (let i = 0; i < numSeatsInRow; i++) {
//       newSeats.push({
//         id: baseIdDown + (i * 2), // Incremento alternado: 1, 3, 5...
//         row, // Fila
//         x: selectedSeats.x, // Coordenada X
//         y: selectedSeats.y + (i * 14), // Incremento en Y hacia abajo
//         price,
//         taken: false,
//       });
//     }

//     // Añadimos los nuevos asientos hacia abajo
//     currentSeats = [...currentSeats, ...newSeats];
//     setSeats(currentSeats); // Actualizamos el estado de los asientos
//     setShowSeatsForm(false); // Ocultamos el formulario
//     setSeatsId(""); // Reseteamos el ID
//     setPrice(1); // Reseteamos el precio
//     setSecondStartPoint(true); // Marcamos que ahora se generarán los asientos hacia arriba
//   } else {
//     // Generar 10 asientos hacia arriba con IDs pares
//     for (let i = 0; i < numSeatsInRow; i++) {
//       newSeats.push({
//         id: baseIdUp + (i * 2), // Incremento alternado: 2, 4, 6...
//         row, // Fila
//         x: selectedSeats.x, // Coordenada X
//         y: selectedSeats.y - ((i + 1) * 14), // Decremento en Y hacia arriba
//         price,
//         taken: false,
//       });
//     }

//     // Añadimos los nuevos asientos hacia arriba sin borrar los anteriores
//     currentSeats = [...currentSeats, ...newSeats];
//     setSeats(currentSeats); // Actualizamos el estado de los asientos
//     setShowSeatsForm(false); // Ocultamos el formulario
//     setSeatsId(""); // Reseteamos el ID
//     setPrice(1); // Reseteamos el precio
//     setSecondStartPoint(false); // Reseteamos el punto de partida
//   }
// };
  


  /// USAR ESTE PARA GENERAR ASIENTOS DE FORMA SECUENCIAL HORIZONTAL /////
  
//   const handleAddSeat = () => {
//     if (!row || !price || !selectedSeats.x || !selectedSeats.y || !seatsId) {
//       alert("Please provide valid seat data.");
//       return;
//     }
  
//     const numSeatsInRow = 8; // Generamos 8 asientos por fila
//     const totalSeats = 56; // Total de asientos a generar por fila
//     const newSeats = [];
//     const baseId = parseInt(seatsId); // Convertimos el ID inicial a número agregar +1
//     const seatsSpacing = 11.5; // Distancia entre asientos
//     const emptySpacing = 13.1 +1; // Espacio vacío igual a la distancia entre los asientos
    
//     let xPos = selectedSeats.x; // Comenzamos con la coordenada X del primer asiento
//     let yPos = selectedSeats.y; // Comenzamos con la coordenada Y inicial
  
//     let seatsCount = 0; // Contador de asientos generados en la fila
  
//     // Generamos los asientos de forma horizontal, 8 por cada bloque
//     while (seatsCount < totalSeats) {
//       for (let i = 0; i < numSeatsInRow; i++) {
//         // Agregamos un asiento con su coordenada X, Y y ID
//         newSeats.push({
//           id: baseId + seatsCount + i, // Incremento consecutivo: 1, 2, 3... poner +1 si falta el primer asiento
//           row, // Fila
//           x: xPos, // Coordenada X
//           y: yPos, // Coordenada Y
//           price,
//           taken: false,
//         });
  
//         // Actualizamos la coordenada X para el siguiente asiento
//         xPos += seatsSpacing;
//       }
  
//       // Aumentamos el contador de asientos
//       seatsCount += numSeatsInRow;
  
//       // Si ya hemos colocado 8 asientos, agregamos un espacio vacío antes de la siguiente fila de asientos
//       if (seatsCount % numSeatsInRow === 0 && seatsCount < totalSeats) {
//         xPos += emptySpacing; // Espacio vacío después de los 8 asientos
//       }
//     }
  
//     // Añadimos los nuevos asientos
//     setSeats([...seats, ...newSeats]);
//     setShowSeatsForm(false); // Ocultamos el formulario
//     setSeatsId(""); // Reseteamos el ID
//     setPrice(1); // Reseteamos el precio
//     setSecondStartPoint(true); // Marcamos que ahora se generarán los asientos para la siguiente fila
//   };
  
  
  
  
  
  
  
  
  
  
  
  
 

//   // Enviar los datos al backend
//   // Enviar los datos al backend
//   const handleSubmit = async () => {
//     // Validaciones básicas
//     if (!divisionName || !mapImage || seats.length === 0 || presentation.length === 0) {
//       alert("Please complete all fields, upload an image, configure seats, and add presentations.");
//       return;
//     }
  
//     if (isNaN(generalPrice) || generalPrice <= 0) {
//       alert("Please provide a valid general price.");
//       return;
//     }
  
//     if (!zoneName.trim()) {
//       alert("Please provide a valid zone name.");
//       return;
//     }
  
//     // Verificar que las presentaciones tengan los campos necesarios
//     for (let pres of presentation) {
//       if (!pres.date || !pres.time.start || !pres.time.end || !pres.performance) {
//         alert("Each presentation must have a valid date, start time, end time, and performance.");
//         return;
//       }
//     }
  
//     // Convertir la primera presentación en un objeto independiente
//     const presentationData = presentation[0];
  
//     // Agrupar los asientos en filas por "row"
//     const rowsData = [];
//     const groupedRows = {};
  
//     seats.forEach(seats => {
//       const rowKey = seats.row;
//       if (!groupedRows[rowKey]) {
//         groupedRows[rowKey] = [];
//       }
//       groupedRows[rowKey].push({
//         x: seats.x,
//         y: seats.y,
//         id: seats.id,
//         taken: seats.taken || false,
//       });
//     });
  
//     // Formatear las filas para `location`
//     for (const [row, seatsInRow] of Object.entries(groupedRows)) {
//       rowsData.push({
//         row: parseInt(row), // Convertir el número de fila a entero
//         seats: seatsInRow,   // Array de asientos en esta fila
//         rowPrice: generalPrice // Asignar el precio de la fila
//       });
//     }
  
//     // Crear el objeto `location` con la estructura esperada
//     const location = [
//       {
//         division: divisionName,
//         "general Price": generalPrice, // El backend espera "general Price" con un espacio
//         rows: rowsData
//       }
//     ];
  
//     // Crear el objeto final que se enviará al backend
//     const zoneData = {
//       zoneName,
//       generalTicket: true,
//       presentation: presentationData, // La presentación como objeto único
//       location,
//       seats: [] // Los asientos ya están incluidos en `location`
//     };
  
//     // Verificar la estructura antes de enviar
//     // Verificar la estructura antes de enviar
//     console.log("Final zoneData:", JSON.stringify(zoneData, null, 2));
  
//     // Enviar los datos al backend
//     try {
//       dispatch({ type: "CREATE_ZONE_REQUEST" });
//       const response = await axios.post("/zones", zoneData);
//       if (response.status === 201) {
        
//         dispatch({ type: "CREATE_ZONE_SUCCESS", payload: response.data });
//         // Limpiar el formulario después del envío
//         setZoneName("");
//         setDivisionName("");
//         setMapImage(null);
//         setSeats([]);
//         setPresentation([]);
//       }
//     } catch (error) {
//       console.error("Error creating the zone:", error.response?.data || error.message);
//       dispatch({ type: "CREATE_ZONE_FAILURE", error: error.message });
//       alert(`Error creating the zone: ${error.response?.data?.message || error.message}`);
//     }
//   };
  
//   // Manejar el clic en el mapa para colocar los asientos
//   // Manejar el clic en el mapa para colocar los asientos
//   const handleMapClick = (event) => {
//     const imageElement = event.target;
  
//     // Dimensiones de la imagen mostrada (escaladas)
//     const containerWidth = imageElement.offsetWidth;
//     const containerHeight = imageElement.offsetHeight;
  
//     // Dimensiones naturales de la imagen
//     const naturalWidth = imageElement.naturalWidth;
//     const naturalHeight = imageElement.naturalHeight;
  
//     const { offsetX, offsetY } = event.nativeEvent;
  
//     // Ajuste de coordenadas al tamaño natural, considerando el nivel de zoom
//     const adjustedX = ((offsetX / containerWidth) * naturalWidth) / zoomLevel;
//     const adjustedY = ((offsetY / containerHeight) * naturalHeight) / zoomLevel;
  
//     // console.log("Coordenadas ajustadas con zoom:", { adjustedX, adjustedY });
  
//     setSelectedSeats({ x: adjustedX, y: adjustedY });
//   };
  


//   // Manejar el cambio de zoom
//   const handleZoomChange = (e) => {
//     const newZoomLevel = e.target.value;
//     setZoomLevel(newZoomLevel);  // Actualiza el estado del zoom
//   };
  
//   return (
//     <div className="create-zone-container">
//       <h2>Create New Zone</h2>

//       <div className="zone-form">
//         <label>Zone Name:</label>
//         <input
//           type="text"
//           placeholder="Enter zone name (e.g., Popular3)"
//           value={zoneName}
//           onChange={(e) => setZoneName(e.target.value)}
//         />

//         <label>Division Name (e.g., Zona Roja):</label>
//         <input
//           type="text"
//           placeholder="Enter division name (e.g., Zona Roja)"
//           value={divisionName}
//           onChange={(e) => setDivisionName(e.target.value)}
//         />

//         <label>Upload Zone Image:</label>
//         <input type="file" accept="image/*" onChange={handleImageUpload} />

//         {mapImage && (
//           <div className="image-preview" onClick={handleMapClick}>
//           <img
//            src={mapImage}
//            alt="Zone Preview"
//            style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }} // Aplica el zoom
//             />
//           {/* Marcadores de asientos existentes */}
//           {seats.map((seat, index) => (
//   <div
//     key={index}
//     className="seat-marker"
//     style={{
//       position: "absolute",
//       left: `${seat.x * zoomLevel}px`, // Coordenada X ajustada al zoom
//       top: `${seat.y * zoomLevel}px`,  // Coordenada Y ajustada al zoom
//       width: `${8 }px`, // Ajuste del tamaño del marcador
//       height: `${8 }px`,
//       backgroundColor: "green",
//       borderRadius: "50%",
//       transform: `translate(-50%, -50%)`, // Centrar el marcador
//     }}
//   />
// ))}

// {/* Marcador temporal para el asiento seleccionado */}
// {selectedSeats.x && selectedSeats.y && (
//   <div
//     className="seat-marker-temp"
//     style={{
//       position: "absolute",
//       left: `${selectedSeats.x * zoomLevel}px`,
//       top: `${selectedSeats.y * zoomLevel}px`,
//       backgroundColor: "blue",
//       borderRadius: "50%",
//       width: `${8}px`,
//       height: `${8 }px`,
//       transform: `translate(-50%, -50%)`,
//     }}
//   />
// )}
//         </div>
//         )}

//         <label>Row (Fila):</label>
//         <input
//           type="number"
//           value={row}
//           onChange={(e) => setRow(Number(e.target.value))}
//           min="1"
//         />

//         <label>General Price:</label>
//         <input
//           type="number"
//           value={generalPrice}
//           onChange={(e) => setGeneralPrice(Number(e.target.value))}
//           min="1"
//         />

//         <label>Zoom Level:</label>
//         <input
//           type="range"
//           min="1"
//           max="3"
//           step="0.1"
//           value={zoomLevel}
//           onChange={handleZoomChange}
//         />
//         <span>{zoomLevel}x</span>

//         <label>Presentation Date:</label>
//         <input
//           type="date"
//           value={presentationDate}
//           onChange={(e) => setPresentationDate(e.target.value)}
//         />

//         <label>Start Time:</label>
//         <input
//           type="time"
//           value={startTime}
//           onChange={(e) => setStartTime(e.target.value)}
//         />

//         <label>End Time:</label>
//         <input
//           type="time"
//           value={endTime}
//           onChange={(e) => setEndTime(e.target.value)}
//         />

//         <button onClick={handleAddPresentation}>Add Presentation</button>

//         <div>
//           <h4>Presentation</h4>
//           <ul>
//             {presentation.map((presentation, index) => (
//               <li key={index}>
//                 {presentation.date} - {presentation.time.start} to {presentation.time.end}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="seats-list">
//           <h3>Seats:</h3>
//           {seats.map((seats, index) => (
//             <div key={index}>
//               <p>
//                 Seats ID: {seats.id}, Row: {seats.row}, Price: ${seats.price}, Coordinates: ({seats.x}, {seats.y})
//               </p>
//             </div>
//           ))}
//         </div>

//         <button onClick={() => setShowSeatsForm(true)}>Add Seat</button>

//         {showSeatsForm && (
//           <div className="seat-form">
//             <label>Seats ID:</label>
//             <input
//               type="text"
//               value={seatsId}
//               onChange={(e) => setSeatsId(e.target.value)}
//             />
//             <label>Price:</label>
//             <input
//               type="number"
//               value={price}
//               onChange={(e) => setPrice(Number(e.target.value))}
//               min="1"
//             />
//             <button onClick={handleAddSeat}>Add Seats</button>
//           </div>
//         )}
//       </div>

//       <button className="submit-btn" onClick={handleSubmit}>Guardar datos</button>
//     </div>
//   );
// };

// export default CreateZone;
