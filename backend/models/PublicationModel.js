const pool = require("../db");

const PublicationModel = {
  async create({ user_id, titre, description, images }) {
    const result = await pool.query(
      `INSERT INTO publications (user_id, titre,  description, images, "userLike", "userFavoris")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, titre, description, images, [], []] // Initialiser les arrays vides
    );
    const publication = result.rows[0];

    await pool.query(
      `INSERT INTO notification (user_id ,objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id ,publication.id, 'A publié une nouvelle publication', []]
    );

    return publication;
  },

  // models/PublicationModel.js
  async update(id, { titre, description, newImages, existingImages }) {
    const result = await pool.query(
      `UPDATE publications 
      SET titre = $1, description = $2, images = $3 
      WHERE id = $4
      RETURNING *`,
      [titre, description, [...existingImages, ...newImages], id]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT p.*, u.nom, u.prenoms, u.role
       FROM publications p 
       JOIN users u ON p.user_id = u.id
       ORDER BY created_at DESC`
    );
    return result.rows; // result.rows doit contenir userLike et userFavoris
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, u.nom, u.prenoms, u.role
       FROM publications p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT p.*, u.nom, u.prenoms, u.role
       FROM publications p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },
  

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
  
      // Supprimer les notifications liées
      await client.query(
        `DELETE FROM notification WHERE objet_id = $1`,
        [id]
      );
  
      // Supprimer la doléance / publication
      const result = await client.query(
        `DELETE FROM publications WHERE id = $1 RETURNING *`,
        [id]
      );
  
      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
  
  // Ajouter / retirer un like
  async toggleLike(publication_id, user_id) {
    const pub = await pool.query(`SELECT "userLike" FROM publications WHERE id = $1`, [publication_id]);
    const likes = pub.rows[0].userLike || [];
    let updatedLikes;

    if (likes.includes(user_id)) {
      updatedLikes = likes.filter(u => u !== user_id);
    } else {
      updatedLikes = [...likes, user_id];
    }

    const result = await pool.query(
      `UPDATE publications SET "userLike" = $1 WHERE id = $2 RETURNING *`,
      [updatedLikes, publication_id]
    );
    return result.rows[0];
  },

  // Ajouter / retirer un favoris
  async toggleFavorite(publication_id, user_id) {
    const pub = await pool.query(`SELECT "userFavoris" FROM publications WHERE id = $1`, [publication_id]);
    const favs = pub.rows[0].userFavoris || [];
    let updatedFavs;

    if (favs.includes(user_id)) {
      updatedFavs = favs.filter(u => u !== user_id);
    } else {
      updatedFavs = [...favs, user_id];
    }

    const result = await pool.query(
      `UPDATE publications SET "userFavoris" = $1 WHERE id = $2 RETURNING *`,
      [updatedFavs, publication_id]
    );
    return result.rows[0];
  }
};

module.exports = PublicationModel;
