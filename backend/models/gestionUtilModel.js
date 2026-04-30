const pool = require("../db");

const UserModel = {
  // Liste tous les agents
  async findAllAgents() {
    const result = await pool.query(
      `SELECT *
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Approuver un agent
  async approve(id) {
    const result = await pool.query(
      "UPDATE users SET is_confirmed = true WHERE id=$1 AND role='agent' RETURNING id, email, role, is_confirmed",
      [id]
    );
    return result.rows[0];
  },

  // Liste tous les utilisateurs
  async findAllUsers() {
    const result = await pool.query(
      `SELECT *
       FROM users 
       WHERE role != 'admin'
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Suspendre un utilisateur
  async suspend(id) {
    const result = await pool.query(
      "UPDATE users SET is_suspended = true WHERE id=$1 RETURNING id, email, role, is_suspended",
      [id]
    );
    return result.rows[0];
  },

  // Réactiver un utilisateur
  async unsuspend(id) {
    const result = await pool.query(
      "UPDATE users SET is_suspended = false WHERE id=$1 RETURNING id, email, role, is_suspended",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = UserModel;
