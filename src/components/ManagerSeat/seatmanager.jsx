import React, { useRef, useState, useEffect } from 'react';
import ZoneConfigForm from './ZoneConfigForm';  // Asegúrate de que este componente está importado
import SeatPreview from './SeatPreview';  // Asegúrate de que este componente está importado
import "../ManagerSeat/seatmanager.css";

const SeatManager = ({ mapaUrl, onSeatsSelected, isSelectable }) => {
  const [selectedZone, setSelectedZone] = useState(null); // Zona seleccionada
  const [seatingData, setSeatingData] = useState({}); // Datos de los asientos por zona
  const [showZoneForm, setShowZoneForm] = useState(false); // Mostrar formulario de configuración
  const [zoom, setZoom] = useState(1); // Nivel de zoom inicial
  const canvasRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 400, height: 400 }); // Tamaño del mapa

  // Función para cargar la imagen en el canvas con el zoom aplicado
  const loadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = mapaUrl;

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

  // Cargar la imagen del mapa cuando cambia mapaUrl, selectedZone o zoom
  useEffect(() => {
    loadImage();
  }, [mapaUrl, selectedZone, zoom]);

  // Detectar las zonas al hacer clic
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom; // Ajustar al nivel de zoom
      const y = (e.clientY - rect.top) / zoom; // Ajustar al nivel de zoom

      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data; // Obtener los datos del píxel
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`; // Convertir a formato rgb

      // Detectar la zona según el color del píxel
      switch (rgb) {
        case 'rgb(106, 57, 200)': // Violeta
          setSelectedZone('Zona Violeta');
          setShowZoneForm(true); // Mostrar el formulario de configuración
          break;
        case 'rgb(0, 188, 139)': // Verde
          setSelectedZone('Zona Verde');
          setShowZoneForm(true); // Mostrar el formulario de configuración
          break;
        case 'rgb(218, 125, 131)': // Rojo
          setSelectedZone('Zona Roja');
          setShowZoneForm(true); // Mostrar el formulario de configuración
          break;
        default:
          setSelectedZone(null); // Zona no válida
          case 'rgb(27, 5, 230)': // Violeta
          setSelectedZone('Zona Floresta');
          setShowZoneForm(true); // Mostrar el formulario de configuración
          break;
      }
      // console.log(rgb, "color seleccionado")
    }
  };

  // Cambiar el nivel de zoom
  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2)); // Límite superior
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5)); // Límite inferior

  const handleResetZoom = () => setZoom(1); // Resetear zoom al valor inicial

  // Función para manejar la selección de asientos
  const handleSeatSelect = (seatId) => {
    if (isSelectable) {
      // Solo permitimos seleccionar asientos si isSelectable es true
      setSeatingData((prevData) => {
        const updatedSeats = prevData[selectedZone].map(row =>
          row.map(seat =>
            seat.id === seatId ? { ...seat, selected: !seat.selected } : seat
          )
        );
        return { ...prevData, [selectedZone]: updatedSeats };
      });
    } else {
      // Si no estamos en modo seleccionable, puedes manejar la creación del asiento
      const newSeat = {
        id: Date.now(), // Generar un ID único
        x: seatId.x,  // Usar las coordenadas del clic (o de alguna forma de ingreso)
        y: seatId.y,
        selected: true,
      };
      // Añadir el asiento creado a los asientos existentes
      setSeatingData((prevData) => ({
        ...prevData,
        [selectedZone]: [...(prevData[selectedZone] || []), newSeat]
      }));
      onSeatsSelected(newSeat); // Si es necesario, pasar los asientos seleccionados al padre
    }
  };

  return (
    <div>
      {!selectedZone ? (
        <div>
          <h2>Select Zone</h2>
          <div className="map-controls">
            <button onClick={handleZoomIn}>Zoom +</button>
            <button onClick={handleZoomOut}>Zoom -</button>
            <button onClick={handleResetZoom}>Reset Zoom</button>
          </div>
          <canvas
            ref={canvasRef}
            width={mapSize.width}
            height={mapSize.height}
            onClick={handleCanvasClick}
          />
        </div>
      ) : showZoneForm ? (
        <ZoneConfigForm
          setSeatingData={setSeatingData}
          setShowZoneForm={setShowZoneForm}
          selectedZone={selectedZone}
        />
      ) : (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setSelectedZone(null)}></div>
          <div className="modal-content">
            <h2>Zona Selected: {selectedZone}</h2>
            <div className="seating-grid">
              <SeatPreview seatingData={seatingData} selectedZone={selectedZone} onSeatSelect={handleSeatSelect} />
            </div>
            <button onClick={() => setSelectedZone(null)}>Return Map</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManager;
