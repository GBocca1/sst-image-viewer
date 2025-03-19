from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from pathlib import Path
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permetti richieste da qualsiasi origine (modifica se necessario)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Percorso della cartella con tutte le sottocartelle
BASE_DIR = Path(r"\\192.168.1.193\Immagini\Immagini_Master")

@app.get("/search/{patient_id}")
async def search_patient(patient_id: str):
    patient_folder = None

    # Usa os.scandir() per cercare la cartella più velocemente
    with os.scandir(BASE_DIR) as entries:
        for entry in entries:
            if entry.is_dir() and entry.name.split("_")[-1] == patient_id:
                patient_folder = Path(entry.path)
                break  # Interrompi il ciclo appena trovi la cartella giusta

    if not patient_folder:
        raise HTTPException(status_code=404, detail="Paziente non trovato.")

    folder_name = patient_folder.name.replace("_", " ")  # Sostituisci "_" con uno spazio

    # Trova tutte le immagini nella cartella selezionata
    images = [
        str(f.relative_to(BASE_DIR)).replace("\\", "/")  # Percorsi compatibili con il frontend
        for f in patient_folder.rglob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tif', '.tiff']
    ]

    return {"folder_name": folder_name, "images": images}

@app.get("/images/{file_path:path}")
async def get_image(file_path: str):
    image_path = BASE_DIR / file_path

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Immagine non trovata.")

    # Se il file è .tif, lo convertiamo al volo
    if image_path.suffix.lower() in [".tif", ".tiff"]:
        img = Image.open(image_path)
        img = img.convert("RGB")  # Converti in RGB per compatibilità

        # Salva l'immagine in memoria
        img_io = io.BytesIO()
        img.save(img_io, format="JPEG")
        img_io.seek(0)

        return Response(content=img_io.getvalue(), media_type="image/jpeg")

    # Per tutti gli altri formati, restituisci il file normalmente
    return Response(content=image_path.read_bytes(), media_type=f"image/{image_path.suffix.lower()[1:]}")


