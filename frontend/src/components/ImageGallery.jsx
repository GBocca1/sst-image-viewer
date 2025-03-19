import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

export default function ImageGallery() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/images")
            .then((response) => response.json())
            .then((data) => setImages(data))
            .catch((error) => console.error("Errore nel caricamento delle immagini:", error));
    }, []);

    return (
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
                <img
                    key={index}
                    src={`file:///${img}`} // Percorso assoluto
                    alt="Anteprima"
                    className="w-full h-32 object-cover cursor-pointer rounded-lg shadow"
                    onClick={() => setSelectedImage(img)}
                />
            ))}

            {selectedImage && (
                <Dialog open={true} onClose={() => setSelectedImage(null)} className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-2 rounded-lg max-w-4xl">
                        <img src={`file:///${selectedImage}`} alt="Ingrandito" className="max-w-full max-h-[80vh] rounded" />
                        <button onClick={() => setSelectedImage(null)} className="block mx-auto mt-2 p-2 bg-red-500 text-white rounded">Chiudi</button>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
