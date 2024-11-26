import React from 'react';
import { Link } from 'react-router-dom';
import '../Home/home.css'; // Importar el CSS de Home

const events = [
  { 
    id: 1, 
    name: 'Concert Rock', 
    date: '2024-12-15', 
    price: 50, 
    image: 'https://via.placeholder.com/500x300/FF5733/FFFFFF?text=Concierto+de+Rock' // URL de imagen ejemplo
  },
  { 
    id: 2, 
    name: 'Musical', 
    date: '2024-12-20', 
    price: 40, 
    image: 'https://via.placeholder.com/500x300/33B5FF/FFFFFF?text=Teatro+Musical' // URL de imagen ejemplo
  },
  { 
    id: 3, 
    name: 'Fotball', 
    date: '2024-12-10', 
    price: 30, 
    image: 'https://via.placeholder.com/500x300/FF5733/FFFFFF?text=Futbol' // URL de imagen ejemplo
  },
  { 
    id: 4, 
    name: 'Festival, Jazz', 
    date: '2024-12-25', 
    price: 60, 
    image: 'https://via.placeholder.com/500x300/FFBB33/FFFFFF?text=Festival+de+Jazz' // URL de imagen ejemplo
  },
  { 
    id: 5, 
    name: 'Stand-up Comedy', 
    date: '2024-12-05', 
    price: 35, 
    image: 'https://via.placeholder.com/500x300/33FF57/FFFFFF?text=Stand-up+Comedy' // URL de imagen ejemplo
  },
  { 
    id: 6, 
    name: 'Expositión, Art', 
    date: '2024-12-18', 
    price: 25, 
    image: 'https://via.placeholder.com/500x300/8E44AD/FFFFFF?text=Exposicion+de+Arte' // URL de imagen ejemplo
  }
];

const Home = () => {
  return (
    <div className="home">
      
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/event/${event.id}`}>
              <img src={event.image} alt={event.name} className="event-image" /> {/* Imagen del evento */}
              <h2>{event.name}</h2>
              <p>{event.date}</p>
              <p>Price ${event.price}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
