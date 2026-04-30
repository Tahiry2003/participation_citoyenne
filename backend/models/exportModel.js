const pool = require("../db");

const ExportModel = {
  // Récupérer les années disponibles
  async getAvailableYears(userId) {
    const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM d.created_at) AS year
      FROM users u
      LEFT JOIN doleance d ON (
        (u.region = d.region AND u.district IS NULL AND u.commune IS NULL)
        OR (u.region = d.region AND u.district = d.district AND u.commune IS NULL)
        OR (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
      )
      WHERE u.id_users = $1
        AND d.created_at IS NOT NULL
      ORDER BY year DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => parseInt(row.year));
  },

  // Récupérer les doléances avec filtres (version corrigée et sécurisée)
  async getDoleancesForExport(userId, filters = {}) {
    const { month, year, statuses = [] } = filters;

    const conditions = [];
    const params = [];
    let index = 1;

    // utilisateur connecté
    conditions.push(`u.id = $${index}`);
    params.push(userId);
    index++;

    // filtre mois
    if (month) {
      conditions.push(`EXTRACT(MONTH FROM d.created_at) = $${index}`);
      params.push(month);
      index++;
    }

    // filtre année
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM d.created_at) = $${index}`);
      params.push(year);
      index++;
    }

    // exclure certains statuts
    conditions.push(`d.status NOT IN ('rejeter', 'en attente')`);

    // filtre statuts sélectionnés
    if (statuses.length > 0) {
      const placeholders = statuses.map(() => `$${index++}`).join(', ');
      conditions.push(`d.status IN (${placeholders})`);
      params.push(...statuses);
    }

    const query = `
    SELECT 
      d.*,
      auteur.nom       AS citoyen_nom,
      auteur.prenoms   AS citoyen_prenoms,
      auteur.email     AS citoyen_email,
      auteur.tel       AS citoyen_telephone,
      auteur.role      AS citoyen_role,
      TO_CHAR(d.created_at, 'DD/MM/YYYY HH24:MI') AS date_creation_format,
      CASE d.status
        WHEN 'valide' THEN 'Validée'
        WHEN 'en attente' THEN 'En attente'
        WHEN 'rejeter' THEN 'Rejetée'
        WHEN 'traiter' THEN 'En traitement'
        WHEN 'resolue' THEN 'Résolue'
        ELSE d.status
      END AS statut_lisible
  
    FROM users u
  
    JOIN doleance d ON (
        d.user_id = u.id
     OR (
            (u.region = d.region AND u.district IS NULL AND u.commune IS NULL)
         OR (u.region = d.region AND u.district = d.district AND u.commune IS NULL)
         OR (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        )
    )
  
    JOIN users auteur ON auteur.id = d.user_id
  
    WHERE ${conditions.join(' AND ')}
  
    ORDER BY d.created_at DESC
  `;
  
    console.log('Requête export:', query);
    console.log('Paramètres:', params);

    const result = await pool.query(query, params);
    return result.rows;
  },


  // Version simple pour voir tous les champs
  async getAllDoleancesForExport(userId, filters = {}) {
    const { month, year, statuses = [] } = filters;
    
    // D'abord, utilisons * pour voir tous les champs
    let query = `
      SELECT 
        d.*,
        u.nom AS citoyen_nom,
        u.prenoms AS citoyen_prenoms,
        u.email AS citoyen_email,
        u.tel AS citoyen_telephone,
        TO_CHAR(d.created_at, 'DD/MM/YYYY HH24:MI') AS date_creation_format,
        CASE d.status
          WHEN 'valide' THEN 'Validée'
          WHEN 'en attente' THEN 'En attente'
          WHEN 'rejeter' THEN 'Rejetée'
          WHEN 'traiter' THEN 'En traitement'
          WHEN 'resolue' THEN 'Résolue'
          ELSE d.status
        END AS statut_lisible
      FROM users u
      LEFT JOIN doleance d ON (
        (u.region = d.region AND u.district IS NULL AND u.commune IS NULL)
        OR (u.region = d.region AND u.district = d.district AND u.commune IS NULL)
        OR (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
      )
      WHERE u.id_users = $1
        AND d.id_doleance IS NOT NULL
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM d.created_at) = $${paramIndex++}`;
      query += ` AND EXTRACT(YEAR FROM d.created_at) = $${paramIndex++}`;
      params.push(month, year);
    }
    
    if (statuses.length > 0) {
      const placeholders = statuses.map((_, i) => `$${paramIndex + i}`).join(',');
      query += ` AND d.status IN (${placeholders})`;
      params.push(...statuses);
    }
    
    query += ` ORDER BY d.created_at DESC LIMIT 10`; // Limite pour test
    
    console.log('Requête test avec *:', query);
    
    const result = await pool.query(query, params);
    return result.rows;
  }
};

module.exports = ExportModel;