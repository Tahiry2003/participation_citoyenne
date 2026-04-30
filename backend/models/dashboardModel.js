const pool = require('../db');

const DashboardModel = {
  // 🧮 Récupérer les statistiques de doléances par utilisateur
  async getStats(userId) {
    try {
      // 1️⃣ Nombre total de doléances envoyées
      const totalEnvoyeRes = await pool.query(
        'SELECT COUNT(*) FROM doleance WHERE user_id = $1',
        [userId]
      );
      const totalEnvoye = parseInt(totalEnvoyeRes.rows[0].count);

      const totalTraiterRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND status = 'traiter'",
        [userId]
      );
      const totalTraiter = parseInt(totalTraiterRes.rows[0].count);

      const totalResolueRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND status = 'resolue'",
        [userId]
      );
      const totalResolue = parseInt(totalResolueRes.rows[0].count);
      // 2️⃣ Nombre de doléances validées
      const totalValideRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND status = 'valide'",
        [userId]
      );
      const totalValide = parseInt(totalValideRes.rows[0].count);

      // 3️⃣ Nombre de doléances en attente
      const totalAttenteRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND status = 'en attente'",
        [userId]
      );
      const totalAttente = parseInt(totalAttenteRes.rows[0].count);

      // 3️⃣ Nombre de doléances en attente
      const totalRejeterRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND status = 'rejeter'",
        [userId]
      );
      const totalRejeter = parseInt(totalRejeterRes.rows[0].count);

      const totalDemandeRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND type = 'demande'",
        [userId]
      );
      const totalDemande = parseInt(totalDemandeRes.rows[0].count);

      const totalSignalementRes = await pool.query(
        "SELECT COUNT(*) FROM doleance WHERE user_id = $1 AND type = 'signalement'",
        [userId]
      );
      const totalSignalement = parseInt(totalSignalementRes.rows[0].count);

      // 5️⃣ Nombre de doléances que l'utilisateur a soutenues
      const totalSoutienRes = await pool.query(
        `SELECT COUNT(*) 
         FROM doleance 
         WHERE $1 = ANY("userSupport")`,
        [userId]
      );
      const totalSoutien = parseInt(totalSoutienRes.rows[0].count);

      return { totalEnvoye, totalTraiter, totalResolue, totalValide, totalAttente, totalSoutien, totalRejeter, totalDemande, totalSignalement };
    } catch (error) {
      console.error("Erreur getStats:", error);
      throw error;
    }
  },

  // 🧮 Récupérer les statistiques de doléances par utilisateur
  async getStatsAgent(userId) {
    try {
      const totalCitoyenRes = await pool.query(
        `SELECT 
          COUNT(other_users.id) as count
        FROM users u
        LEFT JOIN users other_users ON (
          (
            (u.region = other_users.region AND u.district IS NULL AND u.commune IS NULL) OR
            (u.region = other_users.region AND u.district = other_users.district AND u.commune IS NULL) OR
            (u.region = other_users.region AND u.district = other_users.district AND u.commune = other_users.commune)
          )
          AND other_users.id != $1
          AND other_users.role = 'citoyen'
        )
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune
        `,
        [userId]
      );
      
      const totalCitoyen = parseInt(totalCitoyenRes.rows[0].count || 0);
      
      // 1️⃣ Nombre total de doléances envoyées
      const totalDoleancesCommune = await pool.query(
        `SELECT 
          COUNT(d.id)
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        )
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalDoleanceCom = parseInt(totalDoleancesCommune.rows[0].count || 0);

      // 2️⃣ Nombre de doléances validées
      const totalTraiterCommune = await pool.query(
        `SELECT 
          COUNT(d.id) as count
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        ) AND d.status = 'traiter'
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalTraiterCom = parseInt(totalTraiterCommune.rows[0]?.count || 0);

      // 2️⃣ Nombre de doléances validées
      const totalResolueCommune = await pool.query(
        `SELECT 
          COUNT(d.id) as count
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        ) AND d.status = 'resolue'
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalResolueCom = parseInt(totalResolueCommune.rows[0]?.count || 0);

      // 2️⃣ Nombre de doléances validées
      const totalValideCommune = await pool.query(
        `SELECT 
          COUNT(d.id) as count
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        ) AND d.status = 'valide'
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalValideCom = parseInt(totalValideCommune.rows[0]?.count || 0);

      // 3️⃣ Nombre de doléances en attente
      const totalAttenteCommune = await pool.query(
        `SELECT 
          COUNT(d.id) as count
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        ) AND d.status = 'en attente'
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalAttenteCom = parseInt(totalAttenteCommune.rows[0].count || 0);

      // 3️⃣ Nombre de doléances en attente
      const totalRejeterCommune = await pool.query(
        `SELECT 
          COUNT(d.id) as count
        FROM users u
        LEFT JOIN doleance d ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        ) AND d.status = 'rejeter'
        WHERE u.id = $1
        GROUP BY u.region, u.district, u.commune`,
        [userId]
      );
      const totalRejeterCom = parseInt(totalRejeterCommune.rows[0].count || 0);

      // 3️⃣ Nombre de signalement
      const totalSignalement = await pool.query(
        `
        SELECT COUNT(d.id) AS count
        FROM users u
        LEFT JOIN doleance d 
          ON (
            (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
            (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
            (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
          )
        WHERE u.id = $1
          AND d.type = 'signalement'
        `,
        [userId]
      );
      
      const totalSignalementCom = parseInt(totalSignalement.rows[0]?.count || 0);

      // 3️⃣ Nombre de signalement
      const totalDemande = await pool.query(
        `
        SELECT COUNT(d.id) AS count
        FROM users u
        LEFT JOIN doleance d 
          ON (
            (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
            (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
            (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
          )
        WHERE u.id = $1
          AND d.type = 'demande'
        `,
        [userId]
      );

      const totalDemandeCom = parseInt(totalDemande.rows[0]?.count || 0);

      return { totalDoleanceCom, totalTraiterCom, totalResolueCom, totalAttenteCom, totalValideCom, totalRejeterCom, totalCitoyen, totalDemandeCom, totalSignalementCom };
    } catch (error) {
      console.error("Erreur getStats:", error);
      throw error;
    }
  },

  // 🔵 Récupérer les utilisateurs ayant soutenu mes doléances
  async getMySupporters(userId) {
    try {
      const query = `
        SELECT 
          d.id AS doleance_id,
          d.*,
          u.*
        FROM doleance d
        JOIN users u ON u.id::text = ANY(d."userSupport")
        WHERE d.user_id = $1
        ORDER BY u.nom, u.prenoms
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async getMySupporters(userId) {
    try {
      const query = `
        SELECT 
          d.id,
          d.numero,
          d.type,
          d.status,
          d.commune,
          d.created_at,
          CASE 
            WHEN d."userSupport" IS NOT NULL THEN array_length(d."userSupport", 1)
            ELSE 0
          END as nombre_soutiens,
          d."userSupport"
        FROM doleance d
        WHERE d.user_id = $1
        ORDER BY d.created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async getStatsAdmin() {
    try {
      const totalCitoyenRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'citoyen'",
      );
      const totalCitoyen = parseInt(totalCitoyenRes.rows[0].count || 0);

      const totalAgentRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'agent'",
      );
      const totalAgent = parseInt(totalAgentRes.rows[0].count || 0);

      const totalDoleancesRes = await pool.query(
        "SELECT COUNT(*) FROM doleance",
      );
      const totalDoleance = parseInt(totalDoleancesRes.rows[0].count || 0);

      const totalPublicationRes = await pool.query(
        "SELECT COUNT(*) FROM publications",
      );
      const totalPublication = parseInt(totalPublicationRes.rows[0].count || 0);

      const totalTraiterAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE status = 'traiter'`,
      );
      const totalTraiterAdm = parseInt(totalTraiterAdmin.rows[0]?.count || 0);

      // 2️⃣ Nombre de doléances validées
      const totalResolueAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE status = 'resolue'`,
      );
      const totalResolueAdm = parseInt(totalResolueAdmin.rows[0]?.count || 0);

      // 2️⃣ Nombre de doléances validées
      const totalValideAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE status = 'valide'`,
      );
      const totalValideAdm = parseInt(totalValideAdmin.rows[0]?.count || 0);

      // 3️⃣ Nombre de doléances en attente
      const totalAttenteAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE status = 'en attente'`,
      );
      const totalAttenteAdm = parseInt(totalAttenteAdmin.rows[0].count || 0);

      // 3️⃣ Nombre de doléances en attente
      const totalRejeterAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE status = 'rejeter'`,
      );
      const totalRejeterAdm = parseInt(totalRejeterAdmin.rows[0].count || 0);

      // 3️⃣ Nombre de signalement
      const totalSignalementAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE type = 'signalement'`,
      );
      
      const totalSignalementAdm = parseInt(totalSignalementAdmin.rows[0]?.count || 0);

      // 3️⃣ Nombre de signalement
      const totalDemandeAdmin = await pool.query(
        `SELECT COUNT(id) as count FROM doleance WHERE type = 'demande'`,
      );

      const totalDemandeAdm = parseInt(totalDemandeAdmin.rows[0]?.count || 0);
      

      return { totalCitoyen, totalAgent, totalDoleance, totalPublication, totalSignalementAdm, totalDemandeAdm, totalAttenteAdm, totalRejeterAdm, totalValideAdm, totalTraiterAdm, totalResolueAdm};
    } catch (error) {
      console.error("Erreur getStats:", error);
      throw error;
    }
  },

  async getMyDoleanceRecent(userId) {
    try {
      const query = `
      SELECT d.*, u.nom, u.prenoms
      FROM doleance d
      JOIN users u ON d.user_id = u.id
      JOIN users agent ON agent.id = $1
      WHERE d.region = agent.region
        AND d.district = agent.district
        AND d.commune = agent.commune
      ORDER BY d.created_at DESC LIMIT 5
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  /*async getAllAgent() {
    try {
      const query = "SELECT * FROM users WHERE role = 'agent' ";
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },*/

  async getAllAgent() {
    try {
      const query = `
        SELECT 
          u.*,
          (
            SELECT COUNT(*) 
            FROM doleance d
            WHERE 
              (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
              (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
              (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
          ) as doleance_count
        FROM users u
        WHERE u.role = 'agent'
        ORDER BY doleance_count DESC, u.id`;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async getWeeklyDoleances(userId) {
    try {
      const query = `
        SELECT 
          DATE(d.created_at) as date,
          COUNT(*) as count
        FROM doleance d
        JOIN users u ON (
          (u.region = d.region AND u.district IS NULL AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune IS NULL) OR
          (u.region = d.region AND u.district = d.district AND u.commune = d.commune)
        )
        WHERE u.id = $1 
          AND u.role = 'agent'
          AND d.created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(d.created_at)
        ORDER BY date DESC
        LIMIT 7
      `;
      const result = await pool.query(query, [userId]);
      
      // Formater les dates en français
      const formattedData = result.rows.map(row => ({
        date: new Date(row.date).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        count: parseInt(row.count)
      })).reverse(); // Inverser pour avoir du plus ancien au plus récent
      
      return formattedData;
    } catch (error) {
      console.error("Erreur getWeeklyDoleances:", error);
      throw error;
    }
  }
};

module.exports = DashboardModel;
