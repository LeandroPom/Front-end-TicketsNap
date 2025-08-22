import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { createPlace } from "../../Redux/Actions/actions";


const Places = () => {
  const dispatch = useDispatch();
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const placesPerPage = 2;
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get("/places");
      setPlaces(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const handleDeletePlace = async (id) => {
    try {
      await axios.delete(`/places/${id}`);
      fetchPlaces();
    } catch (error) {
      console.error("Error deleting place:", error);
    }
  };

  const handleCreatePlace = async (placeData) => {
    try {
      await dispatch(createPlace(placeData));
      Swal.fire({
        icon: "success",
        title: "Lugar creado!",
        text: "Su nuevo lugar fue creado.",
      });
      fetchPlaces();
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating place:", err);
      setError("Error creating the place.");
    }
  };

  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className="
      min-h-screen
      py-20
      px-4
      mt-20
      max-w-screen-xl
      mx-auto
      lg:ml-[calc(50%-25vw+10px)]
    "
    >
      {/* Botón Crear Lugar */}
      {!showCreateForm && (
        <div className="mb-10 mt-[100px]">
          <button
            onClick={() => setShowCreateForm(true)}
            className="primary"
            style={{ minWidth: "180px" }}
          >
            Crear lugar
          </button>
        </div>
      )}

      {/* Formulario o Lista */}
      {showCreateForm ? (
        <CreatePlaceForm
          handleCreatePlace={handleCreatePlace}
          onCancel={() => setShowCreateForm(false)}
          error={error}
          setError={setError}
        />
      ) : (
        <div className="container-bg text-white shadow-md w-full max-w-lg">
          <h3 className="text-xl font-bold mb-4">Lugares Disponibles</h3>

          {error && (
            <div className="text-red-500 mb-4 font-semibold">{error}</div>
          )}

          <div className="flex flex-col gap-3 min-h-[150px]">
            {currentPlaces.length === 0 ? (
              <p className="text-gray-300">No hay lugares disponibles.</p>
            ) : (
              currentPlaces.map((place) => (
                <div
                  key={place.id}
                  className="flex justify-between items-center bg-[#608CC4] rounded p-3"
                >
                  <span>
                    {place.name} {place.location}
                  </span>
                  <button
                    className="secondary py-1 px-3"
                    onClick={() => handleDeletePlace(place.id)}
                  >
                    Borrar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex gap-4">
            {currentPage > 1 && (
              <button
                onClick={() => paginate(currentPage - 1)}
                className="secondary py-2 px-4"
              >
                ◀ Anterior
              </button>
            )}
            {currentPage < Math.ceil(places.length / placesPerPage) && (
              <button
                onClick={() => paginate(currentPage + 1)}
                className="secondary py-2 px-4"
              >
                Siguiente ▶
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CreatePlaceForm = ({ handleCreatePlace, onCancel, error, setError }) => {
  const [placeData, setPlaceData] = useState({
    name: "",
    address: "",
    capacity: "500",
    layout: "Arena",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlaceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, address, layout } = placeData;
    if (!name || !address || !layout) {
      setError("Por favor completa todos los campos.");
      return;
    }
    handleCreatePlace(placeData);
    setPlaceData({
      name: "",
      address: "",
      capacity: "500",
      layout: "Arena",
    });
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center overflow-y-auto z-50">
      <div className="mt-[250px] mb-10 px-4 w-full max-w-md">
        <div className="container-bg text-white shadow-md w-full">
          <h2 className="text-2xl font-bold mb-6">Crear nuevo lugar</h2>

          {error && (
            <div className="text-red-500 font-semibold mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col font-semibold text-white">
              Nombre:
              <input
                type="text"
                name="name"
                value={placeData.name}
                onChange={handleChange}
                required
                className="mt-1 p-2 rounded bg-[#608CC4] text-white border border-white focus:outline-none focus:ring-2 focus:ring-[#ADC8E6]"
              />
            </label>

            <label className="flex flex-col font-semibold text-white">
              Dirección:
              <input
                type="text"
                name="address"
                value={placeData.address}
                onChange={handleChange}
                required
                className="mt-1 p-2 rounded bg-[#608CC4] text-white border border-white focus:outline-none focus:ring-2 focus:ring-[#ADC8E6]"
              />
            </label>

            <div className="flex justify-between items-center mt-4">
              {/* Botón primario */}
              <button type="submit" className="primary py-2 px-6">
                Crear lugar
              </button>

              {/* Botón secundario */}
              <button
                type="button"
                onClick={onCancel}
                className="secondary py-2 px-6"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Places;