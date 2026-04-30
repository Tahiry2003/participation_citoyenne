const express = require("express");
const router = express.Router();
const NotificationModel = require("../models/notificationModel");

// Récupérer toutes les notifications
// notificationRouter.js
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId; // récupéré depuis le front
    const notifs = await NotificationModel.findAll(userId);
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération notifications" });
  }
});


// Marquer comme lue
router.post("/read/:notification_id/:user_id", async (req, res) => {
  try {
    const notif = await NotificationModel.markAsRead(
      req.params.notification_id,
      req.params.user_id
    );
    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur marquage notification" });
  }
});

// 📌 Nouvelle route pour le nombre de notifications non lues
router.get("/unread-count/:user_id", async (req, res) => {
  try {
    const count = await NotificationModel.countUnreadByUser(req.params.user_id);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération notifications non lues" });
  }
});

// 🟣 Nouvelle route : récupérer tous les objets (doléances + publications) liés à un user_id
router.get("/objets/:user_id", async (req, res) => {
  try {
    const objets = await NotificationModel.findObjetIdById(req.params.user_id);
    res.json(objets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération objets liés à l'utilisateur" });
  }
});

module.exports = router;
