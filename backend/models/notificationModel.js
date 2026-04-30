const pool = require("../db"); 

const NotificationModel = {
  async create({ user_id, objet_id, message }) {
    const result = await pool.query(
      `INSERT INTO notification (user_id, objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, objet_id, message, []] // read_by vide initialement
    );
    return result.rows[0];
  },

  // NotificationModel.js
  async findAll(userId) {
    const result = await pool.query(
      `
      SELECT 
          n.*, 
          u.nom, 
          u.prenoms,
          CASE
              WHEN d.id IS NOT NULL THEN 'doleance'
              WHEN p.id IS NOT NULL THEN 'publication'
              ELSE 'inconnu'
          END AS type
      FROM notification n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN doleance d ON n.objet_id = d.id
      LEFT JOIN publications p ON n.objet_id = p.id
      WHERE 
          n.created_at >= (
              SELECT created_at 
              FROM users 
              WHERE id = $1
          )
          AND (
              d.user_id = $1
              OR p.id IS NOT NULL
          )
      ORDER BY n.created_at DESC
      `,
      [userId]
    );

    return result.rows;
  },

  async markAsRead(notification_id, user_id) {
    const result = await pool.query(
      `UPDATE notification
       SET read_by = array_append(read_by, $1)
       WHERE id = $2 AND NOT ($1 = ANY(read_by))
       RETURNING *`,
      [user_id, notification_id]
    );
    return result.rows[0];
  },

  // Nouvelle méthode pour compter les notifications non lues
  async countUnreadByUser(user_id) {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM notification n
      LEFT JOIN doleance d ON n.objet_id = d.id
      LEFT JOIN publications p ON n.objet_id = p.id
      WHERE
          n.created_at >= (
              SELECT created_at
              FROM users
              WHERE id = $1
          )
          AND (
              (d.user_id = $1::uuid AND NOT ($1::text = ANY(n.read_by)))
              OR
              (p.id IS NOT NULL AND NOT ($1::text = ANY(n.read_by)))
          )
      `,
      [user_id]
    );

    return parseInt(result.rows[0].count, 10);
  },


  async findObjetIdById(user_id) {
    const result = await pool.query(
      `SELECT id AS objet_id, 'doleance' AS type
        FROM doleance
        WHERE user_id = $1
        UNION ALL
        SELECT id AS objet_id, 'publication' AS type
        FROM publications 
        WHERE user_id = $1`,
      [user_id]
    );
    return result.rows;
  }
};

module.exports = NotificationModel;
