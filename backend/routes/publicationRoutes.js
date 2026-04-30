const express = require("express");
const PublicationModel = require("../models/PublicationModel");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Vérifie que le dossier uploads existe
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Garde ton chemin relatif
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

// ✅ Autorise plus d’images et augmente la taille max
const upload = multer({
  storage,
  limits: {
    files: 20, // jusqu’à 20 images
    fileSize: 10 * 1024 * 1024, // 10 Mo max par image
  },
});

// 🟢 Créer une publication
router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    const { user_id, description, titre } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    // Sauvegarde les chemins d'images
    const images = req.files.map((f) => f.path.replace(/\\/g, "/"));

    const publication = await PublicationModel.create({
      user_id,
      titre,
      description,
      images,
    });

    res.status(201).json(publication);
  } catch (err) {
    console.error("Erreur création publication :", err);
    res.status(500).json({ error: "Erreur lors de la création de la publication" });
  }
});

// 🟡 Mettre à jour une publication
router.put("/:id", upload.array("images", 20), async (req, res) => {
  try {
    const { titre, description, existingImages } = req.body;

    const keptImages = existingImages ? JSON.parse(existingImages) : [];
    const newImages = req.files.map((f) => f.path.replace(/\\/g, "/"));

    const updatedPublication = await PublicationModel.update(req.params.id, {
      titre,
      description,
      newImages,
      existingImages: keptImages,
    });

    res.json(updatedPublication);
  } catch (err) {
    console.error("Erreur mise à jour publication :", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la publication" });
  }
});

// 🟣 Récupérer toutes les publications
router.get("/", async (req, res) => {
  try {
    const publications = await PublicationModel.findAll();
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des publications" });
  }
});

// 🔵 Récupérer les publications d’un utilisateur
router.get("/user/:user_id", async (req, res) => {
  try {
    const publications = await PublicationModel.findByUser(req.params.user_id);
    res.json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des publications" });
  }
});

// 🟠 Détail d'une publication
router.get("/publicationDetail/:id", async (req, res) => {
  try {
    const publication = await PublicationModel.findById(req.params.id);
    if (!publication) return res.status(404).json({ error: "Publication non trouvée" });
    res.json({ publication });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération de la publication" });
  }
});

// 🔴 Supprimer une publication avec suppression des images
router.delete("/:id", async (req, res) => {
  try {
    // 1️⃣ Récupère la publication pour connaître les images
    const publication = await PublicationModel.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ error: "Publication non trouvée" });
    }

    // 2️⃣ Supprime la publication dans la base
    await PublicationModel.delete(req.params.id);

    // 3️⃣ Supprime les images du dossier uploads
    if (publication.images && publication.images.length > 0) {
      publication.images.forEach((imgPath) => {
        const fullPath = path.join(__dirname, "..", imgPath);
        fs.unlink(fullPath, (err) => {
          if (err) console.warn("Impossible de supprimer l'image :", fullPath, err.message);
        });
      });
    }

    res.json({ message: "Publication et images supprimées avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de la publication" });
  }
});


// 💖 Like / Unlike une publication
router.post("/:id/like", async (req, res) => {
  try {
    const publication = await PublicationModel.toggleLike(req.params.id, req.body.userId);
    res.json(publication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du like" });
  }
});

// ⭐ Ajouter / retirer des favoris
router.post("/:id/favorite", async (req, res) => {
  try {
    const publication = await PublicationModel.toggleFavorite(req.params.id, req.body.userId);
    res.json(publication);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout aux favoris" });
  }
});

module.exports = router;
