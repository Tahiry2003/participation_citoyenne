const express = require("express");
const UserModel = require("../models/gestionUtilModel");

const router = express.Router();

// GET /api/agents -> liste tous les agents
router.get("/", async (req, res) => {
  try {
    const agents = await UserModel.findAllAgents();
    res.json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/agents/:id/approve -> approuver un agent
router.put("/util/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAgent = await UserModel.approve(id);
    res.json(updatedAgent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible d'approuver l'agent" });
  }
});

// Récupérer tous les utilisateurs
router.get("/util", async (req, res) => {
  try {
    const users = await UserModel.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

// PUT /api/agents/:id/suspend -> suspendre un utilisateur
router.put("/util/:id/suspend", async (req, res) => {
  const { id } = req.params;
  try {
    const suspendedUser = await UserModel.suspend(id);
    res.json(suspendedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de suspendre l'utilisateur" });
  }
});

// PUT /api/agents/:id/unsuspend -> réactiver un utilisateur
router.put("/util/:id/unsuspend", async (req, res) => {
  const { id } = req.params;
  try {
    const unsuspendedUser = await UserModel.unsuspend(id);
    res.json(unsuspendedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impossible de réactiver l'utilisateur" });
  }
});

module.exports = router;
