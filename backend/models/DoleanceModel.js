const pool = require("../db");

const DoleanceModel = {
  async create({ 
    user_id, type, titre, description, images, adresse, lat, lng, region, 
    district, commune, categorie, sousCategorie, numero 
  }) {
    const latitude = lat ? parseFloat(lat) : null;
    const longitude = lng ? parseFloat(lng) : null;
  
    const result = await pool.query(
      `INSERT INTO doleance 
        (user_id, type, titre, description, images, adresse, lat, lng, region, 
        district, commune, categorie, "sousCategorie", status, numero)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'en attente', $14)
       RETURNING *`,
      [user_id, type, titre, description, images, adresse, latitude, longitude, 
      region, district, commune, categorie, sousCategorie, numero]
    );
  
    return result.rows[0];
  },
  
  async findAll() {
    const result = await pool.query(
      `SELECT d.*, u.nom, u.prenoms, u.role 
      FROM doleance d 
      JOIN users u ON d.user_id = u.id
      WHERE d.status NOT IN ('rejeter', 'en attente')
      ORDER BY d.created_at DESC      
      `
    );
    return result.rows;
  },

  async findAllAgent(user_id) {
    const result = await pool.query(
        `SELECT d.*, u.nom, u.prenoms, u.role
        FROM doleance d
        JOIN users u ON d.user_id = u.id
        JOIN users agent ON agent.id = $1
        WHERE d.region = agent.region
          AND d.district = agent.district
          AND d.commune = agent.commune
        ORDER BY d.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT d.*, u.nom, u.prenoms, u.role 
       FROM doleance d 
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = $1 
       ORDER BY d.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  async findByUser2(user_id) {
    const result = await pool.query(
      `SELECT d.*, u.nom, u.prenoms, u.role 
       FROM doleance d 
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = $1 AND d.status NOT IN ('rejeter', 'en attente')
       ORDER BY d.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM doleance WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },
  
  async delete(id) {
    const result = await pool.query(
      `DELETE FROM doleance WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, { 
    type, 
    titre, 
    description, 
    adresse, 
    lat, 
    lng, 
    images, 
    region, 
    district, 
    commune,
    categorie,
    sousCategorie 
  }) {
    const latitude = lat ? parseFloat(lat) : null;
    const longitude = lng ? parseFloat(lng) : null;
    
    const result = await pool.query(
      `UPDATE doleance
       SET type=$1, titre=$2, description=$3, adresse=$4, lat=$5, lng=$6, 
           images=$7, region=$8, district=$9, commune=$10, categorie=$11, "sousCategorie"=$12
       WHERE id=$13 RETURNING *`,
      [
        type, 
        titre, 
        description, 
        adresse, 
        latitude, 
        longitude, 
        images, 
        region, 
        district, 
        commune,
        categorie,
        sousCategorie,
        id
      ]
    );
    return result.rows[0];
  },
    
  async validate(id, user_id) {
    const result = await pool.query(
      `UPDATE doleance 
       SET status = 'valide'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    const doleance = result.rows[0];
  
    await pool.query(
      `INSERT INTO notification (user_id, objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id, id, 'A validé votre doléance', []]
    );
  
    return doleance;
  },

  async rejeter(id, user_id) {
    const result = await pool.query(
      `UPDATE doleance 
       SET status = 'rejeter'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    const doleance = result.rows[0];
  
    await pool.query(
      `INSERT INTO notification (user_id, objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id, id, 'A rejeté votre doléance', []]
    );
  
    return doleance;
  },

  async traiter(id, user_id) {
    const result = await pool.query(
      `UPDATE doleance 
       SET status = 'traiter'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    const doleance = result.rows[0];
  
    await pool.query(
      `INSERT INTO notification (user_id, objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id, id, 'A mis votre doléance en cours de traitement', []]
    );
  
    return doleance;
  },

  async resolue(id, user_id) {
    const result = await pool.query(
      `UPDATE doleance 
       SET status = 'resolue'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    const doleance = result.rows[0];
  
    await pool.query(
      `INSERT INTO notification (user_id, objet_id, message, read_by)
       VALUES ($1, $2, $3, $4)`,
      [user_id, id, 'A resolue votre doléance', []]
    );
  
    return doleance;
  },

  async toggleSupport(doleanceId, userId) {
    const doleanceResult = await pool.query(
      `SELECT "userSupport", user_id FROM doleance WHERE id = $1`,
      [doleanceId]
    );
  
    if (doleanceResult.rows.length === 0) {
      return null;
    }
  
    const currentUserSupport = doleanceResult.rows[0].userSupport || [];
    const doleanceAuthorId = doleanceResult.rows[0].user_id;
  
    if (doleanceAuthorId === userId) {
      throw new Error("L'auteur ne peut pas soutenir sa propre doléance");
    }
  
    let newUserSupport;
    let isSupportAdded = false;
  
    if (currentUserSupport.includes(userId)) {
      newUserSupport = currentUserSupport.filter(id => id !== userId);
    } else {
      newUserSupport = [...currentUserSupport, userId];
      isSupportAdded = true;
    }
  
    const updateResult = await pool.query(
      `UPDATE doleance 
       SET "userSupport" = $1 
       WHERE id = $2 
       RETURNING *`,
      [newUserSupport, doleanceId]
    );
  
    // 🔔 Ajouter une notification uniquement si soutien ajouté
    if (isSupportAdded) {
      await pool.query(
        `INSERT INTO notification (user_id, objet_id, message, read_by)
         VALUES ($1, $2, $3, $4)`,
        [
          userId,          // destinataire = auteur de la doléance
          doleanceId,
          'A soutenu votre doléance',
          []
        ]
      );
    }
  
    return updateResult.rows[0];
  },
  
  async findByIdNotif(id) {
    const result = await pool.query(
      `SELECT d.*, u.nom, u.prenoms, u.role
       FROM doleance d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0];
  },
  
};


module.exports = DoleanceModel;
