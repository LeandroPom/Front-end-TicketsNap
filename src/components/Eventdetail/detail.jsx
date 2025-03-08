import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import '../Eventdetail/detail.css';
import Seatbuy from '../ManagerSeat/seatbuy';
import axios from 'axios';
import ZoneEditor from "../ManagerSeat/zoneditor"
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal'; // Si usas React Modal
import { FaMusic, FaMapMarkerAlt, FaCalendarAlt, FaTheaterMasks, FaClock, FaChair } from 'react-icons/fa';


// import Generaltribunes from './generaltribune';
// Agrega esta configuración inicial si aún no lo hiciste
Modal.setAppElement('#root');



const Detail = () => {
  const { id } = useParams();
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
  const [isLoading, setIsLoading] = useState(false);  // Nuevo estado para cargar
  const [seatsDrawn, setSeatsDrawn] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // Para almacenar la fila seleccionada
  const [rows, setRows] = useState([]); // Para almacenar las filas disponibles de una zona
  const [seatsInRow, setSeatsInRow] = useState([]); // Para almacenar los asientos disponibles en la fila seleccionada
  const [isZoneEditorOpen, setIsZoneEditorOpen] = useState(false);
  
  const [selectedSeat, setSelectedSeat] = useState(null);  // El asiento seleccionado desde el select
  
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
  }, [showMap, id]); // Se ejecuta solo cuando el id cambia

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


  const handleRowChange = (e) => {
    const selectedRow = e.target.value;
    setSelectedRow(selectedRow);
  
    // Encontrar los asientos en la fila seleccionada
    const rowData = rows.find((row) => row.row === selectedRow);
    if (rowData) {
      setSeatsInRow(rowData.seats); // Establecer los asientos de la fila seleccionada
    }
  };

  

  useEffect(() => {
    if (selectedZone && availableSeats.length > 0) {
      const selectedZoneData = availableSeats.find((zone) => zone.division === selectedZone);
      if (selectedZoneData) {
        setRows(selectedZoneData.rows); // Extraer las filas de la zona seleccionada
      }
    }
  }, [selectedZone, availableSeats]);


 // Esto lo agregamos en el useEffect donde recuperas los asientos de una zona específica
 useEffect(() => {
  // Lógica que recupera los asientos para la zona seleccionada
  const fetchSeatsForZone = async (zoneId) => {
    try {
      const response = await axios.get(`/zones/${zoneId}/seats`);  // Asegúrate de que esta URL sea correcta
      if (response.status === 200) {
        setAvailableSeats(response.data.seats);  // Aquí asignas los asientos disponibles a la variable availableSeats
        const rows = response.data.seats.map(seat => ({
          row: seat.row,
          id: seat.id,
          occupied: seat.taken  // Si está ocupado o no
        }));
        setRows(rows);  // Guardas las filas
      }
    } catch (error) {
      console.error("Error al cargar los asientos:", error);
    }
  };

  if (selectedZone) {
    fetchSeatsForZone(selectedZone);
  }
}, [selectedZone]);  // Cuando cambia la zona, se ejecuta nuevamente


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

            return distance <= seatRadius; // Filtra por cercanía, no por estado de ocupación
          })
        );

        if (clickedSeat.length > 0) {
          const seat = clickedSeat[0]; // Solo debe haber un asiento en el clic
          if (seat.taken) {
            // Si el asiento está ocupado, muestra la alerta
            Swal.fire({
              icon: 'error',
              title: '¡Asiento Ocupado!',
              text: 'Este asiento ya está ocupado, selecciona otro asiento.',
            });
            return; // Detiene la ejecución y no permite seleccionar otro asiento
          }

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
            title: '¡Presiona sobre un asiento!',
            text: 'Seleccion no permitida',
          });
        }

      } else {
        // Aquí va la lógica para detectar las zonas
        if (rgb === "rgb(255, 199, 206)" || rgb === "rgb(247, 191, 203)") {
          setSelectedZone("Preferencial");
          setZoneImage("/images/zona-roja.png");
          fetchSeatsForZone("Preferencial", event.id, selectedZoneId); // Recupera los asientos para Preferencial
        } else if (rgb === "rgb(153, 190, 104)" || rgb === "rgb(198, 239, 206)") {
          setSelectedZone("Vip");
          setZoneImage("/images/zona-verde.png");
          fetchSeatsForZone("Vip", event.id, selectedZoneId); // Recupera los asientos para VIP
        } else if (rgb === "rgb(255, 235, 156)" || rgb === "rgb(201, 155, 0)") {
          setSelectedZone("Gold");
          setZoneImage("/images/zona-Gold.png");
          fetchSeatsForZone("Gold", event.id, selectedZoneId); // Recupera los asientos para Gold
        } else if (rgb === "rgb(189, 215, 238)" || rgb === "rgb(118, 182, 238)") {
          setSelectedZone("Platea Sur");
          setZoneImage("/images/Platea-Sur.png");
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
              window.location.href = "/"; // Redirigir a la página de inicio
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

  useEffect(() => {
    if (availableSeats.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawSeats(ctx);  // Dibuja los asientos cuando se actualizan
    }
  }, [availableSeats]);  // Este useEffect se ejecuta cuando los asientos están disponibles

  useEffect(() => {
    
    if (zoneImage) {
      loadImage();
      if (availableSeats.length > 0) {
        // Si ya tenemos asientos disponibles, dibujamos inmediatamente
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawSeats(ctx);  // Dibuja los asientos con el canvas
      }
     
    }
  }, [zoneImage, availableSeats]);  // Ejecutar cada vez que se cargue una zona o cambien los asientos disponibles


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


  const canvasWidth = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 2250 : 600; // Tamaño de canvas específico para Platea
  const canvasHeight = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 600 : 800; // Tamaño de canvas específico para Platea


  // Función para dibujar los asientos sobre la imagen de la zona
  const drawSeats = (ctx) => {
    if (availableSeats && availableSeats.length > 0) {
      // Asegurarse de que las imágenes estén cargadas antes de dibujar
      const zoneImageObj = new Image();
      zoneImageObj.src = zoneImage;
  
      zoneImageObj.onload = () => {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
  
        let scaleX, scaleY;
        let pointRadius = 9; // Valor por defecto para los puntos
        let fontSize = 12; // Tamaño por defecto para los números
        let separationFactorX = 1; // Factor para separar los puntos horizontalmente
        let separationFactorY = 1; // Factor para separar los puntos verticalmente
  
        // Ajustes específicos para las diferentes zonas
        if (zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png") {
          const specificWidth = 2780;
          const specificHeight = 1280;
          scaleX = specificWidth / zoneImageObj.width;
          scaleY = specificHeight / zoneImageObj.height;
          pointRadius = 24; // Tamaño de los puntos más grande para Platea-Norte y Platea-Sur
          fontSize = 34; // Tamaño de la fuente más grande para los números en Platea-Norte y Platea-Sur
          separationFactorX = 1.35; // Factor para separar los puntos horizontalmente
          separationFactorY = 0.75;
        } else if (zoneImage === "/images/zona-Gold.png" || zoneImage === "/images/zona-verde.png" || zoneImage === "/images/zona-roja.png") {
          const specificWidth = 600;
          const specificHeight = 800;
          scaleX = specificWidth / zoneImageObj.width;
          scaleY = specificHeight / zoneImageObj.height;
        } else {
          scaleX = canvasWidth / zoneImageObj.width;
          scaleY = canvasHeight / zoneImageObj.height;
        }
  
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(zoneImageObj, 0, 0, zoneImageObj.width, zoneImageObj.height, 0, 0, canvasWidth, canvasHeight);
  
        // Reemplazar la imagen de la silla por círculos
        availableSeats.forEach((seatRow) => {
          seatRow?.seats?.forEach((seat) => {
            // Multiplicar las coordenadas por los factores de separación
            const scaledX = seat.x * scaleX * separationFactorX;  // Separación horizontal
            const scaledY = seat.y * scaleY * separationFactorY;  // Separación vertical
  
            // Determinar el color del punto (verde si está libre, gris si está ocupado)
            const seatColor = seat.taken ? 'grey' : 'green';
  
            // Dibujar el círculo (punto) en lugar de la imagen
            ctx.beginPath();
            ctx.arc(scaledX, scaledY, pointRadius, 0, Math.PI * 2, false); // Usar el radio ajustado
            ctx.fillStyle = seatColor; // Color dependiendo de si está ocupado o libre
            ctx.fill();
            ctx.closePath();
  
            // Configurar el estilo para el texto (ID del asiento)
            ctx.fillStyle = "white"; // Color del texto
            ctx.font = `${fontSize}px Arial`; // Fuente con tamaño ajustado
            ctx.textAlign = "center"; // Centrar el texto
            ctx.textBaseline = "middle"; // Centrar el texto verticalmente
  
            // Dibujar el ID del asiento dentro del círculo
            ctx.fillText(seat.id, scaledX, scaledY); // Dibujar el ID del asiento
  
            seat.drawingPosition = { x: scaledX, y: scaledY, radius: pointRadius };
          });
        });
  
        setSeatsDrawn(true);
      };
    }
  };
  
  
  


useEffect(() => {
  if (canvasRef.current && availableSeats.length > 0) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    loadImage(ctx);
  }
}, [availableSeats, zoneImage, selectedZone]); // Asegúrate de que el efecto se ejecute cuando cambian los asientos, la zona o la imagen




  const loadImage = () => {
    // setIsLoading(true);  
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



        // Aquí se usa el tamaño original de la imagen
        // ya no es necesario el ajuste específico 130x130

        // Dibujar la imagen escalada en el canvas
        ctx.drawImage(img, 0, 0, width, height, 0, 0, scaledWidth, scaledHeight);

        // Solo dibujar los asientos si ya se ha seleccionado una zona
        if (selectedZone) {
          drawSeats(ctx);  // Redibuja los asientos con la nueva escala
          // setIsLoading(false); 
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
    return <div>Evento no encontrado</div>;
  }

  const handleChooseSeats = () => {
    setShowMap(true); // Muestra el mapa cuando se hace clic en "Elegir asientos"
  };

  const handleCloseModal = () => {
    // Cierra el modal
    setIsSeatManagerOpen(false);

    // Redirige al usuario a la página principal
    navigate('/');
  };

  const handleSeatSelection = (e) => {
    const selectedSeatId = e.target.value;
    const selected = availableSeats.find(seat => seat.id === selectedSeatId);
    setSelectedSeat(selected);  // Actualiza el asiento seleccionado
  };


  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="corner-img top-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img top-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-left" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
        <div className="corner-img bottom-right" style={{ backgroundImage: 'url(/images/solticket.png)' }}></div>
  
        <div className="spinner"></div>
        <p>Procesando su compra...</p>
      </div>
    );
  }




  return (
    <div className="event-detail">
    <h1>{event.name}</h1>
  
    {event.presentation.map((presentation, index) => (
  <div className="event-container" key={index}>
    {/* Contenedor para la imagen del evento */}
    <div className="box-contenedor">
      <div className="event-imagen">
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
    </div>

    {/* Contenedor para la información del evento */}
    <div className="box-contenedor-info">
      <div className="event-info">
        <p><FaMusic style={{ color: 'black' }} /> <strong>Género:</strong> {event.genre.join(', ')}</p>
        <p><FaMapMarkerAlt style={{ color: 'red' }} /> <strong>Dirección y Lugar:</strong> {event.location}</p>
        <p><FaCalendarAlt style={{ color: 'green' }} /> <strong>Fecha:</strong> {presentation.date}</p>
        <p><FaTheaterMasks style={{ color: 'blue' }} /> <strong>Presentaciones:</strong> {presentation.performance}</p>
        <p><FaClock style={{ color: 'red' }} /> <strong>Horarios:</strong> {presentation.time.start} - {presentation.time.end}</p>

        {countdownStarted && (
          <div className='time-count'>
            <h2 >
              {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
            </h2> {/* Mostrar el tiempo restante */}
          </div>
        )}
      </div>
    </div>
  </div>
))}

      {/* <ZoneEditor showId={event.id} /> */}

      {isSelectorOpen && (
        <div >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{color:"white",
                marginBottom: "300px",
                right: "500px"}}
               >....Selecciona una fecha y hora :
            </h3>
            <ul>
              {availablePresentations.map((presentation, index) => (
                <li
                  key={index}
                  onClick={() => handleConfirmSelection(presentation)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "1px solid #ccc",
                    marginBottom: "-10px",
                    left: "-150px",
                    color: "black"
                  }}
                >
                  <p>Zona: {Array.isArray(presentation.divisionName) ? presentation.divisionName.join(", ") : presentation.divisionName}</p>
                  <p>Fecha: {presentation.presentation.date}</p>
                  <p>Hora: {presentation.presentation.time.start} - {presentation.presentation.time.end}</p>
                </li>
              ))}
            </ul>
            {/* <button onClick={() => setIsSelectorOpen(false)}>Cerrar</button> */}
          </div>
        </div>
      )}




      {/* Aquí se muestra el mapa debajo de los detalles del evento */}

      <div>
        {/* Botón para mostrar el mapa */}

        {!showMap && (
          <button
            onClick={handleChooseSeats}
            style={{
              backgroundColor: '#FFD166',
              color: 'black',
              padding: '12px 20px',  // Aumenta el tamaño del botón (más alto y ancho)
              borderRadius: '15px',  // Redondea los bordes del botón
              fontWeight: 'bold',  // Puedes agregar para que el texto se vea en negrita (opcional)
              cursor: 'pointer'  // Cambia el cursor al pasar sobre el botón
            }}
          >
            Elegir Asientos
          </button>
        )}


        {user?.isAdmin && (
          <>
            <button className='boton-adddata' onClick={() => setIsZoneEditorOpen(true)}>Cargar datos</button>
            {isZoneEditorOpen && <ZoneEditor showId={id} />}
            <button className='boton-adddata' onClick={() => setIsZoneEditorOpen(false)}>Cerrar</button>
          </>
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


            {selectedZone && <p>Seleccionar Zona: {selectedZone}</p>}
            <Link to="/">
              <button className='Boton-inicio'>Ir a Inicio</button>
             </Link>
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

         {/* Aquí se muestra el select con los asientos */}
         {/* <div>
          <label htmlFor="seat-select">Selecciona un asiento:</label>
          <select 
            id="seat-select" 
            value={selectedSeat?.id || ''} 
            onChange={(e) => handleSeatSelection(e)} 
          >
            <option value="">Selecciona un asiento</option>
            {availableSeats?.map(seat => (
              <option key={seat.id} value={seat.id}>
                Asiento {seat.id} - Fila {seat.row} {seat.taken ? "(Ocupado)" : "(Disponible)"}
              </option>
            ))}
          </select>
        </div> */}

        {/* Mostrar el asiento seleccionado en el estado */}
        {/* {selectedSeat && (
          <div>
            <p>Has seleccionado el asiento {selectedSeat.id} de la fila {selectedSeat.row}</p>
          </div>
        )}
       */}
    
  

      </div>


      <div className="zoom-controls">
        {/* <button onClick={handleZoomOut}>-</button>
        <button onClick={handleZoomIn}>+</button> */}
      </div>
      {isSeatManagerOpen && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setIsSeatManagerOpen(false)}></div>

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

        </div>
      )}
    </div>
  );
};

export default Detail;



























































