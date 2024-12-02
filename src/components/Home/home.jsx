import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShows } from '../Redux/Actions/actions';
import '../Home/home.css';

const ShowsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { shows, loading, error } = useSelector((state) => state);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredShows, setFilteredShows] = useState([]);

  useEffect(() => {
    dispatch(getShows());
  }, [dispatch]);

  useEffect(() => {
    const filtered = shows.filter((show) => {
      const matchesSearch = show.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? show.genre.includes(selectedGenre) : true;
      return matchesSearch && matchesGenre;
    });
    setFilteredShows(filtered);
  }, [searchQuery, selectedGenre, shows]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleViewDetails = (showId) => {
    navigate(`/event/${showId}`);
  };

  const genres = [...new Set(shows.flatMap((show) => show.genre))];

  return (
    <div className="home">
      <h2>Shows</h2>

      {/* Barra de búsqueda y filtro */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Verificamos si hay shows filtrados y los mapeamos */}
      <ul>
        {filteredShows && filteredShows.length > 0 ? (
          filteredShows.map((show) => (
            <li key={show.id}>
              <h3>{show.name}</h3>
              <p>{show.description}</p>
              <p>Location: {show.location}</p>
              <p>Genres: {show.genre.join(', ')}</p>
              <p>Artists: {show.artists.join(', ')}</p>
              <img className="event-image" src={show.coverImage} alt={show.name} />
              <button onClick={() => handleViewDetails(show.id)}>View Details</button>
            </li>
          ))
        ) : (
          <div>No shows found</div>
        )}
      </ul>
    </div>
  );
};

export default ShowsList;
