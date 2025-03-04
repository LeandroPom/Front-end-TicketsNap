// import React from 'react';

// const SeatPreview = ({ seatingData, selectedZone, onSeatSelect }) => {
//   // Reestructurar los datos para organizarlos en filas
//   const rows = seatingData[selectedZone]?.reduce((acc, seat) => {
//     const rowIndex = seat.row; // Asumiendo que `seat.row` tiene la letra de la fila (por ejemplo, A, B, C)
    
//     if (!acc[rowIndex]) {
//       acc[rowIndex] = []; // Inicializar la fila si no existe
//     }
    
//     acc[rowIndex].push(seat); // Añadir el asiento a la fila correspondiente
//     return acc;
//   }, {});

//   return (
//     <div>
//       {Object.keys(rows).map((rowIndex) => (
//         <div key={rowIndex} className="row">
//           {rows[rowIndex].map((seat) => (
//             <div
//               key={seat.id}
//               className={`seat ${seat.selected ? 'selected' : ''}`}
//               onClick={() => onSeatSelect(seat)}
//             >
//               {seat.id} - ${seat.price}
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SeatPreview;
