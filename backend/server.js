const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const gestionUtilRoutes = require("./routes/gestionUtilRoutes");
const profilRoutes = require("./routes/profilRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const doleanceRoutes = require("./routes/doleanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashRoutes = require("./routes/dashboardRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/photos", doleanceRoutes);
app.use("/auth", authRoutes);
app.use("/gestionUtil", gestionUtilRoutes);
app.use("/profil", profilRoutes);
app.use("/publications", publicationRoutes);
app.use("/doleances", doleanceRoutes);
app.use("/notification", notificationRoutes);
app.use("/dash", dashRoutes);
app.use("/export", exportRoutes);

app.listen(5000, () => {
  console.log("Serveur démarré sur http://localhost:5000");
  console.log("Routes disponibles:");
  console.log("  - /auth : Authentification");
  console.log("  - /gestionUtil : Gestion des utilisateurs");
  console.log("  - /profil : Profils");
  console.log("  - /publications : Publications");
  console.log("  - /doleances : Doléances");
  console.log("  - /notification : Notifications");
  console.log("  - /dash : Dashboard");
  console.log("  - /export : Export des doléances");
});