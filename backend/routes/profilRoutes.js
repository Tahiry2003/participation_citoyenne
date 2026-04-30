const express = require("express");
const ProfilModel = require("../models/profilModel");

const router = express.Router();

// Récupérer un profil utilisateur
router.get("/:id", async (req, res) => {
  try {
    const user = await ProfilModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await ProfilModel.findAll();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Modifier un profil utilisateur
router.put("/:id", async (req, res) => {
  try {
    const { nom, prenoms, tel, adresse, service, fonction } = req.body;
    const updatedUser = await ProfilModel.update(req.params.id, {
      nom,
      prenoms,
      tel,
      adresse,
      service,
      fonction
    });
    if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
