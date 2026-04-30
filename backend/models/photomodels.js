const pool = require("../db");

const PhotoModel = {
  async getAll() {
    const result = await pool.query(
      "SELECT * FROM photo ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async create({ url, description, type, titre, adresse, latitude, longitude }) {
    const result = await pool.query(
      `INSERT INTO photo (url, description, type, titre, adresse, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [url, description, type, titre, adresse, latitude || null, longitude || null]
    );

    await pool.query(
      "INSERT INTO notification (message) VALUES ($1)",
      [`Nouvelle ${type || "photo"} ajoutée: ${titre || description || url}`]
    );

    return result.rows[0];
  },

  async update(id, { url, description, type, titre, adresse, latitude, longitude }) {
    const result = await pool.query(
      `UPDATE photo 
       SET url=$1, description=$2, type=$3, titre=$4, adresse=$5, latitude=$6, longitude=$7
       WHERE id=$8 RETURNING *`,
      [url, description, type, titre, adresse, latitude || null, longitude || null, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM photo WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  async getNotifications() {
    const result = await pool.query(
      "SELECT * FROM notification ORDER BY created_at DESC"
    );
    return result.rows;
  }
};

module.exports = PhotoModel;
