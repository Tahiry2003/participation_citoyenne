const express = require("express");
const ExportModel = require("../models/exportModel");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const router = express.Router();

// GET /export/years/:userId -> récupère les années disponibles
router.get("/years/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const years = await ExportModel.getAvailableYears(userId);
    
    res.json({
      success: true,
      years
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des années:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// GET /export/excel/:userId -> exporte en Excel
router.get("/excel/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year, statuses } = req.query;
    
    console.log('Export Excel demandé:', { userId, month, year, statuses });
    
    // Vérifier les paramètres requis
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Le mois et l\'année sont requis'
      });
    }
    
    // Convertir les statuts
    const statusArray = statuses ? statuses.split(',') : [];
    
    // Récupérer les données via le modèle
    const doleances = await ExportModel.getDoleancesForExport(userId, {
      month,
      year,
      statuses: statusArray
    });
    
    if (doleances.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune doléance trouvée pour les critères sélectionnés'
      });
    }
    
    // Créer le fichier Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Doléances');
    
    // Définir les colonnes adaptées à votre schéma
    worksheet.columns = [
      { header: 'Numéro', key: 'numero', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Nom Citoyen', key: 'citoyen_nom', width: 20 },
      { header: 'Prénom Citoyen', key: 'citoyen_prenoms', width: 20 },
      { header: 'Email', key: 'citoyen_email', width: 30 },
      { header: 'Téléphone', key: 'citoyen_telephone', width: 15 },
      { header: 'Statut', key: 'statut_lisible', width: 15 },
      { header: 'Catégorie', key: 'categorie', width: 20 },
      { header: 'Sous-catégorie', key: 'sousCategorie', width: 20 },
      { header: 'Région', key: 'region', width: 15 },
      { header: 'District', key: 'district', width: 15 },
      { header: 'Commune', key: 'commune', width: 15 },
      { header: 'Adresse', key: 'adresse', width: 30 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lng', width: 12 },
      { header: 'Date Création', key: 'date_creation_format', width: 20 },
      { header: 'Support', key: 'user_support', width: 20 },
    ];
    
    // Ajouter les données
    doleances.forEach(doleance => {
      worksheet.addRow({
        numero: doleance.numero,
        type: doleance.type,
        citoyen_nom: doleance.citoyen_nom,
        citoyen_prenoms: doleance.citoyen_prenoms,
        citoyen_email: doleance.citoyen_email,
        citoyen_telephone: doleance.citoyen_telephone,
        statut_lisible: doleance.statut_lisible,
        categorie: doleance.categorie,
        sousCategorie: doleance.sousCategorie,
        region: doleance.region,
        district: doleance.district,
        commune: doleance.commune,
        adresse: doleance.adresse,
        lat: doleance.lat,
        lng: doleance.lng,
        date_creation_format: doleance.date_creation_format,
        user_support: doleance.user_support ? doleance.user_support.join(', ') : '',
        user_support_time: doleance.user_support_time ? doleance.user_support_time.join(', ') : ''
      });
    });
    
    // Style de l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Auto-fit des colonnes
    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v ? v.toString().length : 0);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = Math.min(maxLength + 2, 50);
    });
    
    // Configurer les en-têtes de réponse
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthName = monthNames[parseInt(month) - 1];
    const fileName = `doleances_${monthName}_${year}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );
    
    // Écrire le fichier
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du fichier Excel',
      error: error.message
    });
  }
});

// GET /export/pdf/:userId -> exporte en PDF
router.get("/pdf/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, year, statuses } = req.query;
        
        // Vérifier les paramètres requis
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Le mois et l\'année sont requis'
            });
        }
        
        // Convertir les statuts
        const statusArray = statuses ? statuses.split(',') : [];
        
        // Récupérer les données via le modèle
        const doleances = await ExportModel.getDoleancesForExport(userId, {
            month,
            year,
            statuses: statusArray
        });
        
        if (doleances.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune doléance trouvée pour les critères sélectionnés'
            });
        }
        
        // Récupérer les informations de période depuis la première doléance
        const firstDoleance = doleances[0];
        const periodeInfo = {
            region: firstDoleance.region || 'Non spécifié',
            district: firstDoleance.district || 'Non spécifié',
            commune: firstDoleance.commune || 'Non spécifié'
        };
        
        // Créer le PDF avec des marges ajustées
        const doc = new PDFDocument({ 
            margin: 40, 
            size: 'A4',
            bufferPages: true,
            info: {
                Title: 'Rapport des Doléances',
                Author: 'Système de Gestion des Doléances',
                Subject: `Rapport ${month}/${year}`
            }
        });
        
        // Configurer les en-têtes de réponse
        res.setHeader('Content-Type', 'application/pdf');
        
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthName = monthNames[parseInt(month) - 1];
        const fileName = `rapport_doleances_${monthName}_${year}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        doc.pipe(res);
        
        // Couleurs du thème
        const colors = {
            primary: '#2c3e50',
            secondary: '#3498db',
            accent: '#e74c3c',
            lightGray: '#ecf0f1',
            darkGray: '#7f8c8d',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c'
        };
        
        // Fonction pour dessiner un rectangle arrondi
        const roundedRect = (x, y, width, height, radius) => {
            doc.moveTo(x + radius, y)
                .lineTo(x + width - radius, y)
                .quadraticCurveTo(x + width, y, x + width, y + radius)
                .lineTo(x + width, y + height - radius)
                .quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
                .lineTo(x + radius, y + height)
                .quadraticCurveTo(x, y + height, x, y + height - radius)
                .lineTo(x, y + radius)
                .quadraticCurveTo(x, y, x + radius, y)
                .closePath();
        };
        
        // En-tête avec bannière stylée
        doc.rect(0, 0, doc.page.width, 80)
            .fill(colors.primary);
        
        doc.fillColor('#ffffff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('RAPPORT DES DOLÉANCES', 0, 30, { 
                align: 'center',
                width: doc.page.width
            });
        
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Période : ${monthName} ${year}`, 0, 60, {
                align: 'center',
                width: doc.page.width
            });
        
        // Section informations du rapport
        doc.fillColor(colors.darkGray)
            .fontSize(10)
            .text(`Généré le ${new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })} à ${new Date().toLocaleTimeString('fr-FR')}`, 40, 100, { align: 'left' });
        
        // Badge du nombre de doléances
        const badgeWidth = 120;
        const badgeX = doc.page.width - badgeWidth - 40;
        doc.fillColor(colors.secondary)
            .roundedRect(badgeX, 90, badgeWidth, 25, 5)
            .fill();
        
        doc.fillColor('#ffffff')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`${doleances.length} DOLÉANCE${doleances.length > 1 ? 'S' : ''}`, badgeX, 97, {
                align: 'center',
                width: badgeWidth
            });
        
        // Ligne de séparation décorative
        doc.moveTo(40, 130)
            .lineTo(doc.page.width - 40, 130)
            .lineWidth(1)
            .strokeColor(colors.lightGray)
            .stroke();
        
        // Table des doléances
        const startX = 40;
        let currentY = 150;
        const rowHeight = 28;
        
        // Définir les largeurs de colonnes (sans sousCategorie)
        const columnWidths = {
            numero: 50,
            type: 70,
            categorie: 90,
            nomPrenoms: 130,
            status: 80,
            date: 80
        };
        
        // Calculer la position totale
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        
        // Positions X pour chaque colonne (réorganisées)
        const columnPositions = {
            numero: startX,
            type: startX + columnWidths.numero,
            categorie: startX + columnWidths.numero + columnWidths.type,
            nomPrenoms: startX + columnWidths.numero + columnWidths.type + columnWidths.categorie,
            status: startX + columnWidths.numero + columnWidths.type + columnWidths.categorie + columnWidths.nomPrenoms,
            date: startX + columnWidths.numero + columnWidths.type + columnWidths.categorie + columnWidths.nomPrenoms + columnWidths.status
        };
        
        // Fonction pour obtenir la couleur du statut
        const getStatusColor = (status) => {
            const statusLower = (status || '').toLowerCase();
            if (statusLower.includes('traité') || statusLower.includes('résolu')) {
                return colors.success;
            } else if (statusLower.includes('en cours') || statusLower.includes('en traitement')) {
                return colors.warning;
            } else if (statusLower.includes('nouveau') || statusLower.includes('en attente')) {
                return colors.secondary;
            } else if (statusLower.includes('rejeté') || statusLower.includes('fermé')) {
                return colors.danger;
            }
            return colors.darkGray;
        };
        
        // Fonction pour dessiner l'en-tête du tableau (avec 6 colonnes)
        const drawTableHeader = (yPos) => {
            // Fond de l'en-tête
            doc.fillColor(colors.primary)
                .rect(startX, yPos, totalWidth, rowHeight)
                .fill();
            
            // Texte de l'en-tête
            doc.fillColor('#ffffff')
                .fontSize(10)
                .font('Helvetica-Bold');
            
            doc.text('N°', columnPositions.numero + 5, yPos + 9);
            doc.text('TYPE', columnPositions.type + 5, yPos + 9);
            doc.text('CATÉGORIE', columnPositions.categorie + 5, yPos + 9);
            doc.text('NOM & PRÉNOMS', columnPositions.nomPrenoms + 5, yPos + 9);
            doc.text('STATUT', columnPositions.status + 5, yPos + 9);
            doc.text('DATE', columnPositions.date + 5, yPos + 9);
            
            return yPos + rowHeight + 5;
        };
        
        // Dessiner l'en-tête initial
        currentY = drawTableHeader(currentY);
        
        // Variables pour suivre les pages
        let pageNumber = 1;
        const totalPages = [];
        doc.on('pageAdded', () => {
            pageNumber++;
            totalPages.push(doc.page);
        });
        
        // Dessiner les données
        doc.font('Helvetica');
        
        doleances.forEach((doleance, index) => {
            // Vérifier si on a besoin d'une nouvelle page
            if (currentY > 700) {
                // Pied de page pour la page actuelle
                drawFooter(pageNumber - 1, periodeInfo);
                
                // Nouvelle page
                doc.addPage();
                
                // Réinitialiser la position Y
                currentY = 80;
                
                // Redessiner l'en-tête sur la nouvelle page
                currentY = drawTableHeader(currentY);
            }
            
            // Alterner les couleurs de fond des lignes
            const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
            doc.fillColor(rowBgColor)
                .rect(startX, currentY, totalWidth, rowHeight)
                .fill();
            
            // Dessiner une fine bordure
            doc.strokeColor('#e0e0e0')
                .lineWidth(0.5)
                .rect(startX, currentY, totalWidth, rowHeight)
                .stroke();
            
            // Texte des données
            doc.fillColor('#2c3e50')
                .fontSize(9);
            
            // Numéro (plus d'espace maintenant)
            doc.text(doleance.numero?.substring(0, 15) || (index + 1).toString(), 
                columnPositions.numero + 5, currentY + 9);
            
            // Type (plus d'espace maintenant)
            doc.text(doleance.type?.substring(0, 25) || '-', 
                columnPositions.type + 5, currentY + 9);
            
            // Catégorie (plus d'espace maintenant)
            doc.text(doleance.categorie?.substring(0, 30) || '-', 
                columnPositions.categorie + 5, currentY + 9);
            
            // Nom et prénoms (plus d'espace maintenant)
            const nomPrenoms = `${doleance.citoyen_nom || ''} ${doleance.citoyen_prenoms || ''}`.trim();
            doc.text(nomPrenoms.substring(0, 35) || '-', 
                columnPositions.nomPrenoms + 5, currentY + 9);
            
            // Statut avec badge coloré
            const statusText = doleance.statut_lisible || '-';
            const statusColor = getStatusColor(statusText);
            
            // Dessiner un petit cercle coloré pour le statut
            doc.fillColor(statusColor)
                .circle(columnPositions.status + 12, currentY + 14, 3)
                .fill();
            
            doc.fillColor('#2c3e50')
                .text(statusText.substring(0, 20), 
                    columnPositions.status + 20, currentY + 9);
            
            // Date formatée
            const dateText = doleance.date_creation_format || 
                (doleance.date_creation ? new Date(doleance.date_creation).toLocaleDateString('fr-FR') : '-');
            doc.text(dateText, 
                columnPositions.date + 5, currentY + 9);
            
            currentY += rowHeight;
        });
        
        // Fonction pour dessiner le pied de page
        const drawFooter = (pageNum, periodeInfo) => {
            const pageHeight = doc.page.height;
            const pageWidth = doc.page.width;
            
            // Ligne de séparation
            doc.strokeColor(colors.lightGray)
                .lineWidth(1)
                .moveTo(40, pageHeight - 80)
                .lineTo(pageWidth - 40, pageHeight - 80)
                .stroke();
            
            // Informations de période
            doc.fillColor(colors.darkGray)
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('PÉRIODE :', 40, pageHeight - 70, { continued: true });
            
            doc.fillColor(colors.primary)
                .text(` ${periodeInfo.region} / ${periodeInfo.district} / ${periodeInfo.commune}`, 
                    { width: pageWidth - 80 });
            
            // Numéro de page
            doc.fillColor(colors.darkGray)
                .fontSize(9)
                .text(`Page ${pageNum}`, 0, pageHeight - 50, {
                    align: 'center',
                    width: pageWidth
                });
            
            // Copyright
            doc.fillColor('#95a5a6')
                .fontSize(8)
                .text(`© ${new Date().getFullYear()} Système de Gestion des Doléances - Document généré automatiquement`, 
                    0, pageHeight - 35, {
                        align: 'center',
                        width: pageWidth
                    });
        };
        
        // Ajouter le pied de page à la dernière page
        drawFooter(pageNumber, periodeInfo);
        
        // Finaliser le document
        doc.end();
        
    } catch (error) {
        console.error('Erreur export PDF:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur lors de l\'export PDF',
            message: error.message 
        });
    }
});
// GET /export/test/:userId -> teste les filtres
router.get("/test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year, statuses } = req.query;
    
    const statusArray = statuses ? statuses.split(',') : [];
    
    const doleances = await ExportModel.getDoleancesForExport(userId, {
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      statuses: statusArray
    });
    
    res.json({
      success: true,
      count: doleances.length,
      sample: doleances.slice(0, 3),
      filters: { month, year, statuses: statusArray },
      champs_disponibles: doleances.length > 0 ? Object.keys(doleances[0]) : []
    });
    
  } catch (error) {
    console.error('Erreur test export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur test export',
      error: error.message
    });
  }
});

// GET /export/fields/:userId -> affiche les champs disponibles
router.get("/fields/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;
    
    const doleances = await ExportModel.getDoleancesForExport(userId, {
      month: month || 12,
      year: year || 2025
    });
    
    if (doleances.length === 0) {
      return res.json({
        success: true,
        message: 'Aucune donnée pour afficher les champs',
        champs: []
      });
    }
    
    // Prendre le premier élément pour voir les champs
    const premierElement = doleances[0];
    const champs = Object.keys(premierElement).map(champ => ({
      nom: champ,
      type: typeof premierElement[champ],
      exemple: premierElement[champ]
    }));
    
    res.json({
      success: true,
      count: doleances.length,
      champs_disponibles: champs,
      premier_element: premierElement
    });
    
  } catch (error) {
    console.error('Erreur champs export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur récupération champs',
      error: error.message
    });
  }
});

module.exports = router;