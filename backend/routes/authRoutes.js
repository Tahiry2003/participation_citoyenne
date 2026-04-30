const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
      role,
      nom,
      prenoms,
      email,
      tel,
      password,
      matricule,
      region,
      district,
      commune
    } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pour les agents, is_confirmed est false par défaut
    // Pour les citoyens, on peut le mettre à true directement ou false selon votre logique
    const newUser = await UserModel.create({
      role,
      nom,
      prenoms,
      email,
      tel,
      password: hashedPassword,
      matricule,
      region,
      district,
      commune
    });

    res.status(201).json({ 
      message: "User created successfully", 
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        nom: newUser.nom,
        prenoms: newUser.prenoms,
        is_confirmed: newUser.is_confirmed
      }
    });
  } catch (err) {
    console.error("Erreur SIGNUP:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // ✅ Vérifier si le compte est suspendu
    if (user.is_suspended) {
      return res.status(403).json({ 
        error: "Votre compte a été suspendu ⚠️. Veuillez contacter l'administrateur." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // ✅ Vérification spécifique pour les agents
    if (user.role === "agent" && !user.is_confirmed) {
      return res.status(403).json({ 
        error: "Votre compte n'est pas encore confirmé ❌. Veuillez attendre l'approbation de l'administrateur." 
      });
    }

    // 🔑 Générer un token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenoms: user.prenoms,
        tel: user.tel,
        matricule: user.matricule,
        region: user.region,
        district: user.district,
        commune: user.commune,
        is_confirmed: user.is_confirmed,
        is_suspended: user.is_suspended
      }
    });
  } catch (err) {
    console.error("Erreur LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;