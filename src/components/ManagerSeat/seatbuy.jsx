import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../ManagerSeat/seatmanager.css";

const SeatManager = ({ mapaUrl, onSeatsSelected, isSelectable, selectedSeats, setSelectedSeats }) => {
  const [selectedZone, setSelectedZone] = useState(""); // Zona seleccionada
  const [zoneData, setZoneData] = useState([]); // Zonas disponibles
  const [seatData, setSeatData] = useState([]); // Asientos de la zona seleccionada
  const [coordinates, setCoordinates] = useState([]); // Coordenadas de los asientos
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1); // Nivel de zoom inicial
  const [mapSize, setMapSize] = useState({ width: 400, height: 400 }); // Tamaño del mapa
  
  // Cargar todas las zonas disponibles
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get("http://localhost:3001/zones");
        if (response.status === 200) {
          setZoneData(response.data.zones); // Guardar las zonas disponibles
          if (response.data.zones.length > 0) {
            setSelectedZone(response.data.zones[0].zoneName); // Establecer la primera zona por defecto
          }
        }
      } catch (error) {
        console.error("Error al cargar las zonas:", error);
      }
    };
    fetchZones();
  }, []);

  // Cargar los asientos de la zona seleccionada
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedZone) return;

      try {
        const response = await axios.get("http://localhost:3001/zones");

        if (response.status === 200) {
          // Buscar la zona seleccionada
          const zone = response.data.zones.find(
            (zone) => zone.zoneName === selectedZone
          );

          if (zone) {
            const validSeats = zone.seats.filter(
              (seat) => seat.x !== undefined && seat.y !== undefined
            );
            setSeatData(validSeats); // Establecer los asientos
            setCoordinates(validSeats); // Establecer las coordenadas
          } else {
            console.error("Zona no encontrada:", selectedZone);
          }
        }
      } catch (error) {
        console.error("Error al cargar los asientos:", error);
      }
    };

    fetchSeats();
  }, [selectedZone]);

  // Función para cargar la imagen en el canvas con el zoom aplicado
  const loadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = `/images/${selectedZone.toLowerCase().replace(" ", "-")}.jpg`;

      img.onload = () => {
        const scaledWidth = mapSize.width * zoom;
        const scaledHeight = mapSize.height * zoom;
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight); // Limpiar el canvas antes de dibujar
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight); // Dibujar la imagen ajustada al zoom
      };
    }
  };

  // Cargar la imagen cuando cambia el zoom o la zona
  useEffect(() => {
    loadImage();
  }, [selectedZone, zoom]);

  // Manejo del clic en el canvas para seleccionar las coordenadas de un asiento
  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left; // Coordenada X en la imagen
    const y = event.clientY - rect.top; // Coordenada Y en la imagen
  
    // Verificar si las coordenadas están dentro de los asientos definidos
    const seatClicked = coordinates.find(
      (seat) => Math.abs(seat.x - x) < 10 && Math.abs(seat.y - y) < 10
    );
  
    if (seatClicked) {
      // Mostrar el modal de confirmación
      const confirmSelection = window.confirm(
        `¿Deseas seleccionar el asiento ${seatClicked.id}?`
      );
      if (confirmSelection) {
        // Si se confirma la selección, agregarlo a los asientos seleccionados
        handleSeatSelect(seatClicked.id);
      }
    } else {
      alert("Seleccione un lugar válido.");
    }
  };

   // Lógica para manejar la selección de asientos y almacenarlos en selectedSeats
  //  const handleSeatSelect = (seatId) => {
  //   if (isSelectable) {
  //     // Actualiza la selección de asientos
  //     const newSelectedSeats = [...selectedSeats, seatId];
  //     onSeatsSelected(newSelectedSeats);  // Actualiza el estado en el componente padre (Detail)
  //   }
  // };

  // Función para manejar la selección de asientos (sin permitir crear nuevos)
  const handleSeatSelect = (seatId) => {
    if (isSelectable) {
      setSeatData((prevData) => {
        const updatedSeats = prevData.map(seat =>
          seat.id === seatId ? { ...seat, selected: !seat.selected } : seat
        );
        return updatedSeats;
      });
      
      const seat = seatData.find(seat => seat.id === seatId);
      if (seat) {
        // Si el asiento ya está seleccionado, quitarlo
        setSelectedSeats((prevSeats) =>
          prevSeats.includes(seat) ? prevSeats.filter(s => s.id !== seatId) : [...prevSeats, seat]
        );
      }
    }
  };
  
  const handleAcceptSelection = () => {
    if (selectedSeats.length > 0) {
      // Aquí puedes enviar los asientos seleccionados al carrito o backend
      console.log("Asientos seleccionados para el carrito:", selectedSeats);
      alert("Seleccionaste los asientos: " + selectedSeats.map(seat => seat.id).join(", "));
    } else {
      alert("No has seleccionado asientos.");
    }
  };

  // Función para manejar el submit y guardar los asientos
  const handleSubmit = async () => {
    try {
      const response = await axios.put("http://localhost:3001/zones", {
        zoneName: selectedZone,
        seats: seatData,
      });

      if (response.status === 200) {
        console.log("Asientos guardados correctamente");
      } else {
        console.error("Error al guardar los asientos");
      }
    } catch (error) {
      console.error("Error al guardar los asientos:", error);
    }
  };

  return (
    <div>
      <h3>Configurated Seat</h3>

      {/* Selección de la zona */}
      <label>Select Zone:</label>
      <select
        value={selectedZone}
        onChange={(e) => setSelectedZone(e.target.value)}
      >
        {zoneData.map((zone, index) => (
          <option key={index} value={zone.zoneName}>
            {zone.zoneName}
          </option>
        ))}
      </select>

      {/* Mostrar la imagen según la zona seleccionada */}
      {selectedZone && (
        <div
          className="zone-image"
          style={{ position: "relative", display: "inline-block" }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />

          {/* Mostrar los asientos solo si tienen coordenadas válidas */}
          {coordinates.map((seat, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${seat.x}px`,
                top: `${seat.y}px`,
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "green",
              }}
            />
          ))}
        </div>
      )}

<div className="selected-seats">
  <h4>Seats selected</h4>
  <ul>
    {selectedSeats.map((seat, index) => (
      <li key={index}>
        ID: {seat.id} - Coordinates: ({seat.x}, {seat.y})
      </li>
    ))}
  </ul>
</div>

      <button onClick={handleSubmit}>Saved Seats</button>
    </div>
  );
};

export default SeatManager;
