const express = require("express");
const DoleanceModel = require("../models/DoleanceModel");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    files: 20,
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    const { 
      user_id, type, titre, description, adresse, lat, lng, 
      region, district, commune, categorie, sousCategorie 
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    const images = req.files.map((f) => f.path.replace(/\\/g, "/"));

    const getInitial = (str) => {
      if (!str || str.trim() === '') return 'X';
      return str.trim().charAt(0).toUpperCase();
    };

    const generateRandomDigits = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };

    const typePrefix = type.toLowerCase() === 'signalement' ? 'S' : 'D';
    const regionInitial = getInitial(region);
    const districtInitial = getInitial(district);
    const communeInitial = getInitial(commune);
    const randomDigits = generateRandomDigits();
    
    const numero = `${typePrefix}${regionInitial}${districtInitial}${communeInitial}${randomDigits}`;

    const doleance = await DoleanceModel.create({
      user_id, type, titre, description, images, adresse, lat, lng, 
      region, district, commune, categorie, sousCategorie, numero
    });

    res.status(201).json(doleance);
  } catch (err) {
    console.error("Erreur création doléance :", err);
    res.status(500).json({ error: "Erreur lors de la création de la doléance" });
  }
});

router.patch("/:id/valider", async (req, res) => {
  try {
    const { user_id } = req.body; 
    const doleance = await DoleanceModel.validate(req.params.id, user_id);
    if (!doleance) return res.status(404).json({ error: "Doléance non trouvée" });
    res.json({ message: "Doléance validée avec succès", doleance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la validation de la doléance" });
  }
});

router.patch("/:id/rejeter", async (req, res) => {
  try {
    const { user_id } = req.body;
    const doleance = await DoleanceModel.rejeter(req.params.id, user_id);
    if (!doleance) return res.status(404).json({ error: "Doléance non trouvée" });
    res.json({ message: "Doléance rejetée avec succès", doleance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la rejet de la doléance" });
  }
});

router.patch("/:id/traiter", async (req, res) => {
  try {
    const { user_id } = req.body;
    const doleance = await DoleanceModel.traiter(req.params.id, user_id);
    if (!doleance) return res.status(404).json({ error: "Doléance non trouvée" });
    res.json({ message: "Doléance traiter avec succès", doleance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la traitement de la doléance" });
  }
});

router.patch("/:id/resolue", async (req, res) => {
  try {
    const { user_id } = req.body;
    const doleance = await DoleanceModel.resolue(req.params.id, user_id);
    if (!doleance) return res.status(404).json({ error: "Doléance non trouvée" });
    res.json({ message: "Doléance resolue avec succès", doleance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la resolution de la doléance" });
  }
});

router.patch("/:id/soutenir", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID requis" });
    }

    const doleance = await DoleanceModel.toggleSupport(req.params.id, userId);

    if (!doleance) {
      return res.status(404).json({ error: "Doléance non trouvée" });
    }

    res.json({
      message: "Soutien mis à jour avec succès",
      doleance,
      userSupport: doleance.userSupport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du soutien" });
  }
});

router.put("/:id", upload.array("images", 20), async (req, res) => {
  try {
    const { 
      type, 
      titre, 
      description, 
      adresse, 
      lat, 
      lng, 
      region, 
      district, 
      commune,
      categorie,
      sousCategorie,
      existingImages,
      images_to_delete 
    } = req.body;

    console.log("Données reçues pour modification:", req.body);

    // 1. Récupérer la doléance existante
    const oldDoleance = await DoleanceModel.findById(req.params.id);
    if (!oldDoleance) {
      return res.status(404).json({ error: "Doléance non trouvée" });
    }

    // 2. Parser les données JSON
    const keptImages = existingImages ? JSON.parse(existingImages) : [];
    const imagesToDelete = images_to_delete ? JSON.parse(images_to_delete) : [];
    
    // 3. Préparer les nouvelles images
    const newImages = req.files ? req.files.map((f) => f.path.replace(/\\/g, "/")) : [];
    
    // 4. Construire la liste finale des images
    let finalImages = [];
    
    // Ajouter les images conservées (formatées correctement)
    if (keptImages.length > 0) {
      // S'assurer que les chemins sont corrects
      const formattedKeptImages = keptImages.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('uploads/') ? img : `uploads/${img}`;
        } else if (img.path) {
          return img.path.startsWith('uploads/') ? img.path : `uploads/${img.path}`;
        }
        return img;
      });
      finalImages = [...formattedKeptImages];
    }
    
    // Ajouter les nouvelles images
    finalImages = [...finalImages, ...newImages];

    console.log("Liste finale des images:", finalImages);

    // 5. Supprimer physiquement les images marquées pour suppression
    if (imagesToDelete.length > 0) {
      console.log("Images à supprimer:", imagesToDelete);
      
      imagesToDelete.forEach((imagePath) => {
        try {
          // Normaliser le chemin
          const normalizedPath = imagePath.replace(/\\/g, '/');
          const fullPath = path.join(__dirname, "..", normalizedPath);
          
          // Vérifier si le fichier existe avant de le supprimer
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("Image supprimée avec succès:", normalizedPath);
          } else {
            console.warn("Image non trouvée pour suppression:", fullPath);
          }
        } catch (err) {
          console.warn("Erreur lors de la suppression de l'image:", imagePath, err.message);
        }
      });
    }

    // 6. Mettre à jour la doléance dans la base de données en utilisant le modèle
    const updatedDoleance = await DoleanceModel.update(req.params.id, {
      type, 
      titre, 
      description, 
      adresse, 
      lat, 
      lng, 
      images: finalImages, 
      region, 
      district, 
      commune,
      categorie,
      sousCategorie
    });

    // 7. Récupérer la doléance mise à jour avec les informations utilisateur
    // (Si le modèle update ne fait pas de join, on peut appeler une méthode findById avec join)
    // Ici, supposons que update retourne la doléance mise à jour sans join, on peut alors faire un findByIdNotif
    const doleanceWithUser = await DoleanceModel.findByIdNotif(req.params.id);

    res.json({
      message: "Doléance mise à jour avec succès",
      doleance: doleanceWithUser
    });
  } catch (err) {
    console.error("Erreur détaillée lors de la mise à jour :", err);
    res.status(500).json({ 
      error: "Erreur lors de la modification",
      details: err.message 
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const doleances = await DoleanceModel.findAll();
    res.json(doleances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des doléances" });
  }
});

router.get("/agent/:user_id", async (req, res) => {
  try {
    const doleances = await DoleanceModel.findAllAgent(req.params.user_id);
    res.json(doleances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des doléances de la région/district/commune" });
  }
});


// 🔵 Récupérer les doléances d’un utilisateur
router.get("/user/:user_id", async (req, res) => {
  try {
    const doleances = await DoleanceModel.findByUser(req.params.user_id);
    res.json(doleances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des doléances" });
  }
});

// 🔵 Récupérer les doléances d’un utilisateur
router.get("/user2/:user_id", async (req, res) => {
  try {
    const doleances = await DoleanceModel.findByUser2(req.params.user_id);
    res.json(doleances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des doléances" });
  }
});
// 🟠 Supprimer une doléance (interdit si validée) et ses images
router.delete("/:id", async (req, res) => {
  try {
    // 1️⃣ Récupère la doléance pour connaître les images
    const doleance = await DoleanceModel.findById(req.params.id);
    if (!doleance) {
      return res.status(404).json({ error: "Doléance non trouvée" });
    }

    if (doleance.status === "valide") {
      return res.status(400).json({ error: "Impossible de supprimer une doléance déjà validée" });
    }

    // 2️⃣ Supprime la doléance de la base
    const deleted = await DoleanceModel.delete(req.params.id);

    // 3️⃣ Supprime les images du dossier uploads
    if (doleance.images && doleance.images.length > 0) {
      doleance.images.forEach((imgPath) => {
        const fullPath = path.join(__dirname, "..", imgPath);
        fs.unlink(fullPath, (err) => {
          if (err) console.warn("Impossible de supprimer l'image :", fullPath, err.message);
        });
      });
    }

    res.json({ message: "Doléance et images supprimées avec succès", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de la doléance" });
  }
});

// Récupérer une doléance par ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doleance = await DoleanceModel.findByIdNotif(id);
    if (!doleance) return res.status(404).json({ message: "Doléance non trouvée" });
    res.json({ doleance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
