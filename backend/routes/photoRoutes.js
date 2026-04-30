const express = require("express");
const router = express.Router();
const PhotoModel = require("../models/photomodels");
const multer = require("multer");
const path = require("path");

// config stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // dossier où stocker les images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // description unique
  },
});

const upload = multer({ storage });

// 📌 Ajouter plusieurs photos (upload fichiers + description + type + titre + adresse)
router.post("/", upload.array("photos"), async (req, res) => {
  try {
    const { description, type, titre, adresse, latitude, longitude } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Aucune photo envoyée" });
    }

    const savedPhotos = [];

    for (let f of files) {
      const filePath = `/uploads/${f.filename}`;
      const photo = await PhotoModel.create({
        url: filePath,
        description,
        type,
        titre,
        adresse,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      });
      savedPhotos.push(photo);
    }

    res.json({ message: "Publication créée avec succès", photos: savedPhotos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Récupérer toutes les photos regroupées par description
router.get("/", async (req, res) => {
  try {
    const photos = await PhotoModel.getAll();

    // Regrouper par description
    const grouped = {};
    photos.forEach((p) => {
      if (!grouped[p.description]) {
        grouped[p.description] = {
          id: p.id,
          description: p.description,
          type: p.type,
          titre: p.titre,
          adresse: p.adresse,
          urls: [],
        };
      }
      grouped[p.description].urls.push(p.url);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// 📌 Récupérer les notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await PhotoModel.getNotifications();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Modifier une photo
router.put("/:id", async (req, res) => {
  try {
    const { url, description, type, titre, adresse } = req.body;
    const photo = await PhotoModel.update(req.params.id, {
      url,
      description,
      type,
      titre,
      adresse,
    });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Supprimer une photo
router.delete("/:id", async (req, res) => {
  try {
    const photo = await PhotoModel.delete(req.params.id);
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
