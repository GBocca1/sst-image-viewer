import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Importa il CSS

function App() {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Indice dell'immagine selezionata
  const [folderName, setFolderName] = useState(""); // Stato per il nome della cartella
  const [searchId, setSearchId] = useState(""); // Stato per la ricerca della cartella paziente tramite ID
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Stato per gestire la finestra modale
  const [scrollPosition, setScrollPosition] = useState(0); // Stato per gestire la posizione della scrollbar
  const [loading, setLoading] = useState(false); // Stato per il caricamento

  // Funzione per gestire la selezione dell'immagine
  const handleImageClick = (index) => {
    setScrollPosition(window.scrollY); // Salva la posizione corrente della scrollbar
    setSelectedImageIndex(index); // Imposta l'immagine selezionata
    setIsImageModalOpen(true); // Apre la finestra modale
  };

  // Funzione per chiudere la finestra modale
  const handleCloseModal = () => {
    setIsImageModalOpen(false); // Chiude la finestra modale
  };

  // Funzione per scorrere le immagini con le frecce della tastiera
  const handleKeyPress = (e) => {
    if (isImageModalOpen) {
      if (e.key === "ArrowRight" && selectedImageIndex < images.length - 1) {
        // Vai all'immagine successiva
        setSelectedImageIndex((prevIndex) => prevIndex + 1);
      } else if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        // Vai all'immagine precedente
        setSelectedImageIndex((prevIndex) => prevIndex - 1);
      }
    }
  };

  // Funzione per gestire la ricerca quando si preme "Invio"
  const handleSearch = async (event) => {
    if (event.key === "Enter" && searchId.trim() !== "") {
      setLoading(true); // ⬅️ Attiva il caricamento

      try {
        const response = await axios.get(`http://localhost:8000/search/${searchId}`);
        setImages(response.data.images);
        setFolderName(response.data.folder_name);
      } catch (error) {
        console.error("Errore nella ricerca:", error);
        alert("Paziente non trovato.");
      } finally {
        setLoading(false); // ⬅️ Disattiva il caricamento quando tutto è finito
      }
    }
  };

  useEffect(() => {

    // Aggiungi il listener per la pressione dei tasti
    window.addEventListener("keydown", handleKeyPress);

    // Pulisci l'event listener quando il componente viene smontato
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedImageIndex]); // Aggiungi selectedImageIndex come dipendenza

  // Funzione per ripristinare la posizione della scrollbar quando la modale si chiude
  useEffect(() => {
    if (!isImageModalOpen) {
      window.scrollTo(0, scrollPosition); // Ripristina la posizione della scrollbar
    }
  }, [isImageModalOpen, scrollPosition]);

  return (
    <div className="App">
      {/* Campo di ricerca */}
      {!isImageModalOpen && (
        <div className="search-container">
          <h1 className="title">Visualizzatore Immagini:</h1>
          <input
            type="text"
            placeholder="Inserisci ID paziente"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleSearch}
            className="search-input"
          />
        </div>
      )}

      {/* Vista principale */}
      {loading ? ( // Se loading è true, mostra il loader
        <div className="spinner"></div>
      ) : (
        <div className="main-content">
          {!isImageModalOpen && (
            <>
              <h1>{folderName}</h1>

              {/* Lista delle immagini */}
              <div className="image-list">
                {images.map((image, index) => {
                  const imageName = image.split("/").pop(); // Estrai solo il nome file
                  return (
                    <div
                      key={index}
                      className="image-item"
                      style={{
                        display: "inline-block",
                        margin: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={`http://localhost:8000/images/${image}`}
                        alt={imageName}
                      />
                      <p className="image-name">{imageName}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal per l'immagine ingrandita */}
      {isImageModalOpen && selectedImageIndex !== null && (
        <div className="image-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseModal}>
              &times; {/* Icona di chiusura */}
            </span>
            <img
              src={`http://localhost:8000/images/${images[selectedImageIndex]}`}
              alt={`selected-${selectedImageIndex}`}
              className="enlarged-image"
            />
            {/* Visualizza il nome dell'immagine */}
            <p className="image-name">
              {images[selectedImageIndex].split("/").pop()} {/* Estrai il nome dell'immagine */}
            </p>

            {/* Navigazione per le immagini */}
            <div className="image-navigation">
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    (prevIndex) => (prevIndex - 1 + images.length) % images.length
                  )
                }
              >
                {"<"} {/* Freccia sinistra */}
              </button>
              <button
                onClick={() =>
                  setSelectedImageIndex(
                    (prevIndex) => (prevIndex + 1) % images.length
                  )
                }
              >
                {">"} {/* Freccia destra */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
