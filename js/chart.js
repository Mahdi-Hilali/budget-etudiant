/*
  chart.js : graphique de répartition des dépenses par catégorie.
  Utilise la bibliothèque Chart.js (chargée depuis un CDN dans index.html).
  Fournit la fonction mettreAJourGraphique(), appelée par app.js.
*/

// Le graphique en cours d'affichage (null tant qu'il n'est pas créé)
let graphique = null;

/**
 * Regroupe les dépenses par catégorie.
 * @param {Array} operations - la liste de toutes les opérations
 * @returns {Object} un objet du type { "Courses": 120, "Loyer": 400 }
 */
function totalDepensesParCategorie(operations) {
  const totaux = {};

  operations.forEach(function (op) {
    // On ne garde que les dépenses (pas les revenus)
    if (op.type === "depense") {
      if (totaux[op.categorie] === undefined) {
        totaux[op.categorie] = 0;
      }
      totaux[op.categorie] += op.montant;
    }
  });

  return totaux;
}

/**
 * Crée ou met à jour le graphique en anneau des dépenses.
 * @param {Array} operations - la liste de toutes les opérations
 */
function mettreAJourGraphique(operations) {
  const totaux = totalDepensesParCategorie(operations);
  const noms = Object.keys(totaux);      // les catégories
  const valeurs = Object.values(totaux); // les montants

  // Si le graphique existe déjà, on le supprime avant d'en refaire un nouveau
  if (graphique !== null) {
    graphique.destroy();
    graphique = null;
  }

  // S'il n'y a aucune dépense, on n'affiche pas de graphique
  if (noms.length === 0) {
    return;
  }

  const canvas = document.getElementById("graphique");

  graphique = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: noms,
      datasets: [{
        data: valeurs,
        backgroundColor: [
          "#2e7d32", "#1976d2", "#f9a825",
          "#c62828", "#6a1b9a", "#00838f"
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" } // légende sous le graphique
      }
    }
  });
}