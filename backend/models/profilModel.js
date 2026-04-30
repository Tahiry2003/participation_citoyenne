const pool = require("../db");

const UserModel = {
  // Récupérer un utilisateur par ID
  async findById(id) {
    const result = await pool.query(
      `SELECT id, role, email, nom, prenoms, tel, matricule, region, district, commune, is_confirmed, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT id, role, email, nom, prenoms, tel, matricule, region, district, commune, is_confirmed, created_at
       FROM users`,
    );
    return result.rows;
  },

  // Mettre à jour un profil utilisateur
  async update(id, { nom, prenoms, tel, adresse, service, fonction }) {
    const result = await pool.query(
      `UPDATE users
       SET nom = $1, prenoms = $2, tel = $3, adresse = $4, service = $5, fonction = $6
       WHERE id = $7
       RETURNING id, role, email, nom, prenoms, tel, adresse, cin, matricule, service, fonction, is_confirmed, created_at`,
      [nom, prenoms, tel, adresse, service, fonction, id]
    );
    return result.rows[0];
  }
};

module.exports = UserModel;
