const express = require("express");
const DashboardModel = require("../models/dashboardModel");

const router = express.Router();

// 🟢 Récupérer les statistiques
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await DashboardModel.getStats(userId);
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🟢 Récupérer les statistiques
router.get("/statsagent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const statsAgent = await DashboardModel.getStatsAgent(userId);
    res.json(statsAgent);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🟢 Récupérer les statistiques
router.get("/statsadmin", async (req, res) => {
  try {
    const statsAdmin = await DashboardModel.getStatsAdmin();
    res.json(statsAdmin);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/listeAgent", async (req, res) => {
  try {
    const agent = await DashboardModel.getAllAgent();
    res.json(agent);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔵 Récupérer les utilisateurs qui ont soutenu mes doléances
router.get("/my-supporters/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const supporters = await DashboardModel.getMySupporters(userId);
    res.json(supporters);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// 🔵 Récupérer les utilisateurs qui ont soutenu mes doléances
router.get("/my-doleance-recent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const doleanceRecent = await DashboardModel.getMyDoleanceRecent(userId);
    res.json(doleanceRecent);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour récupérer les doléances de la semaine
router.get("/weekly-doleances/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const weeklyData = await DashboardModel.getWeeklyDoleances(userId);
    res.json(weeklyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
