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
import { getShows } from '../Redux/Actions/actions';


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
    if (!showMap) return;  // Si showMap es falso, no hacer nada

    if (!id) {
      console.error("id no está definido, no se puede cargar la imagen del mapa.");
      return;
    }
    // Si el estado `showMap` es verdadero, cargamos el mapa
    const loadMap = () => {

      const img = new Image();
      img.src = `/images/zona-floresta.png?timestamp=${new Date().getTime()}`;

      img.onload = () => {
        setZoneImage(img.src);

      };
      img.onerror = () => {
        console.error("Error al cargar la imagen del mapa");
      };
    };

    loadMap();  // Llamar a la función para cargar el mapa cuando showMap cambie
  }, [showMap, id]);  // Este useEffect se ejecutará cada vez que `showMap` cambie o `id` cambie



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
            // console.log("Zonas encontradas para el show:", matchingZones);

            // Asignar imagen basada en zoneId
            matchingZones.forEach((zone) => {
              switch (zone.id) {
                case 1:
                  setZoneImage("/images/zona-floresta.png");
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

   useEffect(() => {
  if (!shows || shows.length === 0) {
    dispatch(getShows());
  }
}, [dispatch, shows]);

  // Este efecto se ejecuta cuando zonesLoaded cambia, forzando la actualización del estado
  useEffect(() => {
    if (zonesLoaded) {
      setZoneImage("/images/zona-floresta.png"); // Asegura que se establezca correctamente
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


          // console.log('Presentations:', presentations);
          setAvailablePresentations(presentations);
          setIsSelectorOpen(true);
        } else {
          console.log("");
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


  useEffect(() => {
    // Lógica que recupera los asientos para la zona seleccionada
    const fetchSeatsForZone = async (zoneId) => {
      try {
        // Verifica si la zona tiene asientos antes de intentar cargar los datos
        if (zoneId && selectedZone && selectedZone.hasSeats) {
          const response = await axios.get(`/zones/${zoneId}/seats`);
          if (response.status === 200) {
            setAvailableSeats(response.data.seats);  // Aquí asignas los asientos disponibles a la variable availableSeats
            const rows = response.data.seats.map(seat => ({
              row: seat.row,
              id: seat.id,
              occupied: seat.taken  // Si está ocupado o no
            }));
            setRows(rows);  // Guardas las filas
          }
        } else {
          // En caso de que no haya asientos, puedes limpiar las filas o simplemente dejarlo vacío
          setAvailableSeats([]);
          setRows([]);
        }
      } catch (error) {
        console.error("Error al cargar los asientos:", error);
      }
    };

    if (selectedZone) {
      fetchSeatsForZone(selectedZone.zoneId);
    }
  }, [selectedZone]);  // Cuando cambia la zona, se ejecuta nuevamente


  const handleCanvasClick = (e) => {

    const canvas = canvasRef.current;
    if (canvas) {
       const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  const scaledX = x / zoom;
  const scaledY = y / zoom;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (seatsDrawn && selectedZone !== "Tribunas Generales") {
    drawSeats(ctx);
  }

  const pixel = ctx.getImageData(scaledX, scaledY, 1, 1).data;
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

  if (seatsDrawn) {
    const clickedSeat = availableSeats.flatMap((seatRow) =>
      seatRow.seats.filter((seat) => {
        const { x: sx, y: sy, radius } = seat.drawingPosition;
        const distance = Math.sqrt(Math.pow(scaledX - sx, 2) + Math.pow(scaledY - sy, 2));
        return distance <= radius;
      })
    );

    if (clickedSeat.length > 0) {
      const seat = clickedSeat[0];

      if (seat.taken) {
        Swal.fire({
          icon: 'error',
          title: '¡Asiento Ocupado!',
          text: 'Este asiento ya está ocupado, selecciona otro.',
        });
        return;
      }

      const seatRow = availableSeats.find((row) =>
        row.seats.some((s) => s.uniqueId === seat.uniqueId)
      );

      const selectedZoneInfo = availablePresentations.find(p =>
        p.divisionName === selectedZone &&
        p.presentation.date === selectedPresentation.date &&
        p.presentation.time.start === selectedPresentation.time.start
      );

      const selectedZoneId = selectedZoneInfo?.zoneId ?? null;
      const price = selectedZoneInfo?.generalTicket
        ? selectedZoneInfo.generalPrice
        : seatRow?.rowPrice ?? 0;

      const seatInfo = {
        ...seat,
        row: seatRow?.row ?? null,
        price,
        division: selectedZone,
        zoneId: selectedZoneId,
        showId: event.id,
      };

      // Agregar o quitar el asiento de la lista seleccionada
     setSelectedSeats((prev) => {
  const alreadySelected = prev.some((s) => s.uniqueId === seatInfo.uniqueId);
  const updated = alreadySelected
    ? prev.filter((s) => s.uniqueId !== seatInfo.uniqueId)
    : [...prev, seatInfo];

  // Redibujar asientos inmediatamente
  const canvas = canvasRef.current;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    drawSeats(ctx);
  }

  return updated;
});

    } else {
      Swal.fire({
        icon: 'error',
        title: '¡Presiona sobre un asiento!',
        text: 'Selección no válida.',
      });
    }


      } else {
        // Aquí va la lógica para detectar las zonas
        if (rgb === "rgb(232, 58, 61)" || rgb === "rgb(108, 41, 43)") {
          setSelectedZone("Preferencial");
          setZoneImage("/images/zona-roja.png");
          fetchSeatsForZone("Preferencial", event.id, selectedZoneId); // Recupera los asientos para Preferencial
        } else if (rgb === "rgb(0, 168, 89)" || rgb === "rgb(13, 50, 34)") {
          setSelectedZone("Vip");
          setZoneImage("/images/zona-verde.png");
          fetchSeatsForZone("Vip", event.id, selectedZoneId); // Recupera los asientos para VIP
        } else if (rgb === "rgb(245, 133, 52)" || rgb === "rgb(194, 74, 44)" || rgb === "rgb(245, 134, 52)"
          || rgb === "rgb(212, 45, 49) " || rgb === "rgb(155, 33, 35)"
        ) {
          setSelectedZone("Gold");
          setZoneImage("/images/zona-Gold.png");
          fetchSeatsForZone("Gold", event.id, selectedZoneId); // Recupera los asientos para Gold
        } else if (rgb === "rgb(255, 242, 18)" || rgb === "rgb(47, 48, 20)") {
          setSelectedZone("Platea Sur");
          setZoneImage("/images/Platea-Sur.png");
          fetchSeatsForZone("Platea Sur", event.id, selectedZoneId); // Recupera los asientos para Platea Sur
        } else if (rgb === "rgb(0, 175, 239)" || rgb === "rgb(17, 36, 60)") {
          setSelectedZone("Platea Norte");
          setZoneImage("/images/Platea-Norte.png");
          fetchSeatsForZone("Platea Norte", event.id, selectedZoneId); // Recupera los asientos para Platea-Norte
        } else if (rgb === "rgb(236, 38, 143)" || rgb === "rgb(70, 34, 57))") {
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

  useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas && seatsDrawn) {
    const ctx = canvas.getContext("2d");
    drawSeats(ctx);
  }
}, [selectedSeats]); // <-- se ejecuta cada vez que seleccionás o deseleccionás un asiento

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
              zoneId: presentation.zoneId,
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
    }
  };



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


  useEffect(() => {
    loadImage();
  }, [selectedZone, zoom, availableSeats, seatsDrawn]);

  useEffect(() => {
    if (zoneImage) {
      loadImage();
    }
  }, [zoneImage]);


  const canvasWidth = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 1160 : 600; // Tamaño de canvas específico para Platea
  const canvasHeight = zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png" ? 290 : 800; // Tamaño de canvas específico para Platea


  const drawSeats = (ctx) => {
    if (availableSeats && availableSeats.length > 0) {
      const zoneImageObj = new Image();
      zoneImageObj.src = zoneImage;

      zoneImageObj.onload = () => {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;

        let scaleX, scaleY;
        let pointRadius = 9;
        let fontSize = 12;
        let separationFactorX = 2.40;
        let separationFactorY = 2.32;
        let horizontalOffset = 0;
        let verticalOffset = -50; // Valor de referencia general para las demás zonas

        // Condición específica para Platea Norte y Platea Sur
        if (zoneImage === "/images/Platea-Sur.png" || zoneImage === "/images/Platea-Norte.png") {
          const specificWidth = 4800;
          const specificHeight = 1100;
          scaleX = specificWidth / zoneImageObj.width;
          scaleY = specificHeight / zoneImageObj.height;
          pointRadius = 9;
          fontSize = 11;
          separationFactorX = 1.60;
          separationFactorY = 0.60;

          // Ajustes específicos para Platea Norte y Platea Sur
          if (zoneImage === "/images/Platea-Sur.png") {
            horizontalOffset = -40; // Mueve las letras de las filas 20px a la derecha
            verticalOffset = 2; // Mueve las letras de las filas un poco más abajo
          } else if (zoneImage === "/images/Platea-Norte.png") {
            horizontalOffset = -40; // Mueve las letras de las filas 20px a la izquierda
            verticalOffset = 2; // Mueve las letras de las filas un poco más abajo
          }

          const offsetX = -15;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(zoneImageObj, 0, 0, zoneImageObj.width, zoneImageObj.height, offsetX, 0, canvasWidth, canvasHeight);
        } else if (zoneImage === "/images/zona-Gold.png" || zoneImage === "/images/zona-verde.png" || zoneImage === "/images/zona-roja.png") {
          const specificWidth = 250;
          const specificHeight = 350;
          scaleX = specificWidth / zoneImageObj.width;
          scaleY = specificHeight / zoneImageObj.height;
        } else {
          scaleX = canvasWidth / zoneImageObj.width;
          scaleY = canvasHeight / zoneImageObj.height;
        }

        let currentRow = 1; // Usamos esto para contar las filas

        availableSeats.forEach((seatRow) => {
          seatRow?.seats?.forEach((seat) => {
            const scaledX = seat.x * scaleX * separationFactorX;
            const scaledY = seat.y * scaleY * separationFactorY;

           const isSelected = selectedSeats.some(s => s.uniqueId === seat.uniqueId);
let seatColor;

if (seat.taken) {
  seatColor = 'grey'; // Ocupado
} else if (isSelected) {
  seatColor = 'blue'; // Seleccionado
} else {
  seatColor = 'green'; // Disponible
}

            ctx.beginPath();
            ctx.arc(scaledX, scaledY, pointRadius, 0, Math.PI * 2, false);
            ctx.fillStyle = seatColor;
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "white";
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(seat.id, scaledX, scaledY);

            seat.drawingPosition = { x: scaledX, y: scaledY, radius: pointRadius };
          });

          // Ajuste de la posición de las letras de las filas
          const rowLabelY = seatRow.seats[0].y * scaleY * separationFactorY + verticalOffset;  // Ajuste vertical

          // Dibujar las letras de las filas
          ctx.fillStyle = "black";
          ctx.font = "14px Arial";  // Ajusta el tamaño del texto según sea necesario
          ctx.textAlign = "center";
          ctx.fillText(`Fila ${currentRow}`, seatRow.seats[0].x * scaleX * separationFactorX + horizontalOffset, rowLabelY);

          currentRow++; // Incrementa el número de la fila
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

  

  const handleChooseSeats = () => {
  if (user) {
    setShowMap(true);
  } else {
    Swal.fire({
      icon: 'warning',
      title: '¡Atención!',
      text: 'Debes estar logueado para continuar con la compra.',
      confirmButtonText: 'Iniciar sesión',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  }
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

  const handleShareClick = () => {
  const currentUrl = window.location.href;

  Swal.fire({
    title: 'Compartir Evento',
    html: `
      <p>Copiá el enlace para compartir este evento:</p>
      <input id="share-url" type="text" readonly value="${currentUrl}" style="width: 100%; padding: 8px; margin-top: 10px; border-radius: 5px; border: 1px solid #ccc;" />
      <button id="copy-button" style="margin-top: 10px; padding: 8px 16px; background-color: #3085d6; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Copiar
      </button>
    `,
    showConfirmButton: false,
    didOpen: () => {
      const copyBtn = document.getElementById('copy-button');
      const input = document.getElementById('share-url');

      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(input.value).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Enlace copiado',
            text: '¡Ya podés compartirlo!',
            timer: 1500,
            showConfirmButton: false
          });
        }).catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo copiar el enlace.',
          });
        });
      });
    }
  });
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

const scrollContainerRef = useRef(null);

// opcional: que siempre arranque scrolleado a la izquierda
useEffect(() => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollLeft = 0;
  }
}, [showMap, zoneImage, canvasWidth]);

if (!event) return <div>Cargando evento...</div>


  return (
    <div className="event-detail">
      

    <div className="max-w-4xl mx-auto mt-[90px]">
  {/* Imagen o video arriba */}
  <div className="w-full rounded-md overflow-hidden shadow-md">
    <h1 className="flex items-center  font-semibold text-white">{event.name}</h1>
    {event.coverImage.includes("youtube.com") || event.coverImage.includes("youtu.be") ? (
      <div className="relative pt-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-md"
          src={event.coverImage.replace("watch?v=", "embed/")}
          title={event.name}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    ) : (
      <img
        className="w-full h-auto object-cover rounded-md"
        src={event.coverImage}
        alt={event.name}
      />
    )}
  </div>

  {/* Información abajo */}
  <div className="mt-6 space-y-4 text-gray-800 text-sm md:text-base">
     <div>
    <a
     onClick={handleShareClick}
    className="primary text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Compartir 🔗
    </a>
  </div>
    <div className="flex items-center gap-2">
      <FaMusic className="text-black" />
      <p className='font-semibold text-gray-400'><strong>Género:</strong> {event.genre.join(', ')}</p>
    </div>
    <div className="flex items-center gap-2">
      <FaMapMarkerAlt className="text-red-600" />
      <p className='font-semibold text-gray-400'><strong>Dirección y Lugar:</strong> {event.location}</p>
    </div>

    {event.presentation.map((presentation, index) => (
      <div key={index} className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-6">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" />
          <p className='font-semibold text-gray-400'><strong>Fecha:</strong> {presentation.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-red-500" />
          <p className='font-semibold text-gray-400'><strong>Horarios:</strong> {presentation.time.start} - {presentation.time.end}</p>
        </div>
          {/* Lógica para el countdown */}
      {countdownStarted && (
        <div className="flex items-center gap-2 font-semibold text-white ">
          <h2>
            {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
          </h2>
        </div>
      )}

      </div>
    ))}
  </div>
</div>

      {/* Selector de zona y fecha/modal */}
      {isSelectorOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div
      className="bg-purple w-[90%] max-w-md p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-4 text-center text-white">
        Selecciona una fecha y hora:
      </h3>

      <ul className="bg-purple-200 text-purple-700 font-semibold">
        {availablePresentations.map((presentation, index) => (
          <li
            key={index}
            onClick={() => handleConfirmSelection(presentation)}
            className="bg-blue-400 cursor-pointer p-4 border rounded-md hover:bg-blue-500 transition"
          >
            <p className="text-white">
              <strong>Zona:</strong>{" "}
              {Array.isArray(presentation.divisionName)
                ? presentation.divisionName.join(", ")
                : presentation.divisionName}
            </p>
            <p className="text-white"><strong>Fecha:</strong> {presentation.presentation.date}</p>
            <p className="text-white">
              <strong>Hora:</strong> {presentation.presentation.time.start} - {presentation.presentation.time.end}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

      {/* Aquí el resto de la lógica de tu página */}
      <div>
        {!showMap && (
          <button
            onClick={handleChooseSeats}
           className="secondary mt-auto text-gray-400 font-semibold rounded py-2 transition"
            
          >
            Elegir Asientos
          </button>
        )}

        {user?.isAdmin && (
          <>
            <button 
            className="secondary mt-auto text-gray-400 font-semibold rounded py-2 transition"
            
            onClick={() => setIsZoneEditorOpen(true)}>Cargar datos</button>

            {isZoneEditorOpen && (
              <>
                <ZoneEditor showId={id} />
                <button className='boton-adddata' onClick={() => setIsZoneEditorOpen(false)}>Cerrar</button>
              </>
            )}
          </>
        )}

      {showMap && zoneImage && (
  <div className="flex flex-col items-center mt-6 w-full">
    <div
      ref={scrollContainerRef}
      className="w-full overflow-x-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-fit mx-auto">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          width={canvasWidth}
          height={canvasHeight}
          className="border block" // block evita espacios inline
          style={{
            height: "auto" // deja que crezca a lo ancho sin distorsión
          }}
        />
      </div>
    </div>

    {selectedZone && <p className="mt-4 font-semibold">Seleccionar Zona: {selectedZone}</p>}

    {selectedSeats.length > 0 && !isSeatManagerOpen && (
      <button
        className="bg-blue-900 text-gray-400 px-5 py-2 mt-4 rounded-lg text-base font-medium transition"
        onClick={() => setIsSeatManagerOpen(true)}
      >
        Continuar con la compra de {selectedSeats.length} asiento(s)
      </button>
    )}

    <Link to="/">
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition">
        Ir a Inicio
      </button>
    </Link>
  </div>
)}

</div>
      <div className="zoom-controls">
        {/* <button onClick={handleZoomOut}>-</button>
        <button onClick={handleZoomIn}>+</button> */}
      </div>
     {isSeatManagerOpen && (
   <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    style={{ zIndex: 1050 }} // ⬅️ Aca el z-index alto
  >
    <div
      className="bg-white w-[95%] max-w-3xl p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh] relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón de cerrar */}
      <button
        onClick={() => setIsSeatManagerOpen(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
      >
        ×
      </button>

      <Seatbuy
        seats={selectedSeats[0]}
        onSeatsSelected={handleSeatsSelected}
        availableSeats={availableSeats}
        isSelectable={true}
        selectedSeats={selectedSeats}
        eventDetails={event}
        selectedPresentation={selectedPresentation}
        zoneId={selectedSeats[0]?.zoneId}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default Detail;
