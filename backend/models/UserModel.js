const pool = require("../db");

const UserModel = {
  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  },

  async create({
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
  }) {
    const result = await pool.query(
      `INSERT INTO users
        (role, nom, prenoms, email, tel, password, matricule, region, district, commune)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, role, nom, prenoms, is_confirmed`,
      [
        role,
        nom,
        prenoms,
        email,
        tel || null,
        password,
        matricule || null,
        region || null,
        district || null,
        commune || null
      ]
    );

    return result.rows[0];
  }
};

module.exports = UserModel;