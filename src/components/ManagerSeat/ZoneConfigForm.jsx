// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "../ManagerSeat/zoneconfig.css"

// const ZoneConfigForm = () => {
//   const [selectedZone, setSelectedZone] = useState(""); // Zona seleccionada
//   const [zoneData, setZoneData] = useState([]); // Zonas disponibles
//   const [seatData, setSeatData] = useState([]); // Asientos de la zona seleccionada
//   const [coordinates, setCoordinates] = useState([]); // Coordenadas de los asientos
//   const [showPriceForm, setShowPriceForm] = useState(false); // Para mostrar el formulario de precio
//   const [selectedSeat, setSelectedSeat] = useState({}); // Asiento seleccionado
//   const [seatId, setSeatId] = useState(""); // ID del asiento
//   const [price, setPrice] = useState(1); // Precio del asiento
//   const [eventId, setEventId] = useState(""); // Esto podría venir de algún lugar
//   const imageRef = useRef(null);

//   // EDITAR EL COMPONENTE PARA HACERLO UN COMPONENTE EDIT ///////////////
//   useEffect(() => {
//     const fetchZones = async () => {
//       try {
//         const response = await axios.get("http://localhost:3001/zones");
//         if (response.status === 200) {
//           console.log("Zonas recuperadas:", response.data.zones);
//           setZoneData(response.data.zones); // Guardar las zonas disponibles
//           if (response.data.zones.length > 0) {
//             setSelectedZone(response.data.zones[0].zoneName); // Establecer la primera zona por defecto
//           }
//         }
//       } catch (error) {
//         console.error("Error al cargar las zonas:", error);
//       }
//     };

//     fetchZones();
//   }, []);

//   // Cargar los asientos de la zona seleccionada
//   useEffect(() => {
//     const fetchSeats = async () => {
//       if (!selectedZone) return;

//       try {
//         const response = await axios.get("http://localhost:3001/zones");

//         if (response.status === 200) {
//           // Buscar la zona seleccionada
//           const zone = response.data.zones.find(
//             (zone) => zone.zoneName === selectedZone
//           );

//           if (zone) {
//             console.log(`Asientos de la zona ${selectedZone}:`, zone.seats);
//             const validSeats = zone.seats.filter(
//               (seat) => seat.x !== undefined && seat.y !== undefined
//             );
//             setSeatData(validSeats); // Establecer los asientos
//             setCoordinates(validSeats); // Establecer las coordenadas
//           } else {
//             console.error("Zona no encontrada:", selectedZone);
//           }
//         }
//       } catch (error) {
//         console.error("Error al cargar los asientos:", error);
//       }
//     };

//     fetchSeats();
//   }, [selectedZone]); // Dependencia para cargar los asientos cuando se seleccione una zona

//   // Manejo del clic en la imagen para seleccionar las coordenadas de un asiento
//   const handleCanvasClick = (event) => {
//     const rect = imageRef.current.getBoundingClientRect();
//     const x = event.clientX - rect.left; // Coordenada X en la imagen
//     const y = event.clientY - rect.top; // Coordenada Y en la imagen
  
//     // Actualizar el estado con la nueva coordenada
//     setCoordinates((prevCoordinates) => [
//       ...prevCoordinates,
//       { x, y },
//     ]);
//     setSelectedSeat({ x, y });
//     setShowPriceForm(true); // Mostrar el formulario para configurar el asiento
//   };
  

//   // Agregar un nuevo asiento a la zona
//   const handleAddSeat = () => {
//     const newSeat = {
//       id: seatId,
//       x: selectedSeat.x,
//       y: selectedSeat.y,
//       price: price,
//       reserved: false, // Asegurarse de agregar esta propiedad
//     };
//     setSeatData([...seatData, newSeat]); // Agregar el nuevo asiento a la lista
//     setShowPriceForm(false); // Cerrar el formulario de precios
//   };

//   // Enviar los asientos al backend para guardarlos
//   // Enviar los asientos al backend para guardarlos
//   const handleSubmit = async () => {
//     try {
//       const selectedZoneData = zoneData.find(zone => zone.zoneName === selectedZone);
//       if (!selectedZoneData) {
//         console.error("Selected Zone not found");
//         return;
//       }
  
//       // Combinar los asientos existentes con los nuevos asientos modificados
//       const updatedSeats = seatData.map(seat => {
//         // Buscar si el asiento ya existe en la base de datos (por id)
//         const existingSeat = selectedZoneData.seats.find(existingSeat => existingSeat.id === seat.id);
        
//         // Si existe, combinar la información actualizada
//         if (existingSeat) {
//           return { ...existingSeat, ...seat }; // Esto mantendrá los asientos existentes y actualizará los valores modificados
//         } else {
//           // Si el asiento no existe (nuevo), añadirlo como un asiento nuevo
//           return seat;
//         }
//       });
  
      
  
//       // Formato correcto para el backend
//       const response = await axios.put("http://localhost:3001/zones/edit", {
//         id: selectedZoneData.id,
//         updates: {
//           zoneName: selectedZone,
//           seats: updatedSeats, // Aquí se envían todos los asientos actualizados
//         },
//       });
  
//       if (response.status === 200) {
       
//         setSeatData(updatedSeats); // Actualizar estado de asientos
//       } else {
//         console.error("Error al guardar los asientos");
//       }
//     } catch (error) {
//       console.error("Error al guardar los asientos:", error);
//     }
//   };
  

//   // Obtener la ruta de la imagen según la zona seleccionada
//   const getZoneImagePath = () => {
//     return `/images/${selectedZone.toLowerCase().replace(" ", "-")}.jpg`;
//   };

//   return (
//     <div className="zone-config-form">
//       <h3>Configurate Zone</h3>

//       {/* Selección de la zona */}
//       <label>Select Zone:</label>
//       <select
//         value={selectedZone}
//         onChange={(e) => setSelectedZone(e.target.value)}
//       >
//         {zoneData.map((zone, index) => (
//           <option key={index} value={zone.zoneName}>
//             {zone.zoneName}
//           </option>
//         ))}
//       </select>

//       {/* Mostrar la imagen según la zona seleccionada */}
//       {selectedZone && (
//         <div
//           className="zone-image"
//           style={{ position: "relative", display: "inline-block" }}
//         >
//           <img
//             ref={imageRef}
//             src={getZoneImagePath()}
//             alt={`Zona ${selectedZone}`}
//             onClick={handleCanvasClick}
//             style={{
//               width: "100%", // Hace que la imagen ocupe el 100% del contenedor, pero también puedes usar "auto"
//               height: "auto", // La altura se ajusta de manera proporcional
//               objectFit: "contain", // Asegura que la imagen se ajuste sin deformarse
//             }}
//           />

//           {/* Mostrar los asientos solo si tienen coordenadas válidas */}
//           {coordinates.map((seat, index) => (
//             <div
//               key={index}
//               style={{
//                 position: "absolute",
//                 left: `${seat.x}px`,
//                 top: `${seat.y}px`,
//                 width: "6px",
//                 height: "6px",
//                 borderRadius: "50%",
//                 // className:"selected-seat",
//                 backgroundColor: "green",
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {showPriceForm && (
//         <div className="price-form">
//           <h4>Configurate Seat</h4>
//           <p>
//             Coordinates Selected: ({selectedSeat.x}, {selectedSeat.y})
//           </p>
//           <label>
//             ID Seat (e.g., A1, B2):
//             <input
//               type="text"
//               value={seatId}
//               onChange={(e) => setSeatId(e.target.value.toUpperCase())} // Convertir a mayúsculas automáticamente
//             />
//           </label>
//           <label>
//             Price:
//             <input
//               type="number"
//               value={price}
//               onChange={(e) => setPrice(Number(e.target.value))}
//               min="1"
//             />
//           </label>
//           <button onClick={handleAddSeat}>Acept</button>
//         </div>
//       )}

//       <div className="selected-seats">
//         <h4>Seat Selected</h4>
//         <ul>
//           {seatData.map((seat, index) => (
//             <li key={index}>
//               ID: {seat.id} - Coordinates: ({seat.x}, {seat.y}) - Price: ${seat.price}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <button onClick={handleSubmit}>Saved Seats</button>
//     </div>
//   );
// };

// export default ZoneConfigForm;
