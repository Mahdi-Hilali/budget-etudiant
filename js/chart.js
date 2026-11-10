
/*
  chart.js : gestion des graphiques BudgetÉtudiant.
  - Répartition des dépenses par catégorie.
  - Évolution du solde selon les dates des opérations.
*/

let graphique = null;
let graphiqueCourbe = null;

// Couleurs des catégories
const COULEURS = [
  "#087f5b",
  "#4263eb",
  "#f9a825",
  "#f06565",
  "#7950c9",
  "#20c997"
];

// Formater les montants en euros
function formaterMontantGraphique(montant) {
  return montant.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
}

// Afficher un message si aucune donnée n'existe
function afficherMessageGraphique(id, message, afficher) {
  const canvas = document.getElementById(id);
  const section = canvas.parentElement;

  let texte = section.querySelector(".message-graphique");

  if (!texte) {
    texte = document.createElement("p");
    texte.className = "message-graphique";
    texte.style.textAlign = "center";
    texte.style.color = "#82918a";
    texte.style.padding = "30px 10px";
    section.appendChild(texte);
  }

  texte.textContent = message;
  texte.style.display = afficher ? "block" : "none";
  canvas.style.display = afficher ? "none" : "block";
}

/*
  GRAPHIQUE 1 : RÉPARTITION DES DÉPENSES
*/

// Regrouper les dépenses par catégorie
function totalDepensesParCategorie(operations) {
  const totaux = {};

  operations.forEach(function (op) {
    if (op.type === "depense") {
      if (!totaux[op.categorie]) {
        totaux[op.categorie] = 0;
      }

      totaux[op.categorie] += Number(op.montant);
    }
  });

  return totaux;
}

// Créer ou actualiser le graphique circulaire
function mettreAJourGraphique(operations) {
  const totaux = totalDepensesParCategorie(operations);

  const noms = Object.keys(totaux);
  const valeurs = Object.values(totaux);

  if (graphique !== null) {
    graphique.destroy();
    graphique = null;
  }

  if (noms.length === 0) {
    afficherMessageGraphique(
      "graphique",
      "Aucune dépense à afficher. Ajoute une dépense pour voir sa répartition.",
      true
    );
    return;
  }

  afficherMessageGraphique("graphique", "", false);

  const canvas = document.getElementById("graphique");

  graphique = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels: noms,

      datasets: [{
        data: valeurs,
        backgroundColor: noms.map(function (_, index) {
          return COULEURS[index % COULEURS.length];
        }),
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 12
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 12
            }
          }
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + " : " +
                formaterMontantGraphique(context.raw);
            }
          }
        }
      }
    }
  });
}

/*
  GRAPHIQUE 2 : ÉVOLUTION DU SOLDE
*/

// Calculer le solde cumulé selon les dates
function calculerEvolutionSolde(operations) {
  const totauxParDate = {};

  operations.forEach(function (op) {
    const date = op.date;

    if (!totauxParDate[date]) {
      totauxParDate[date] = 0;
    }

    const montant = Number(op.montant);

    if (op.type === "revenu") {
      totauxParDate[date] += montant;
    } else {
      totauxParDate[date] -= montant;
    }
  });

  const dates = Object.keys(totauxParDate).sort();

  let solde = 0;

  const labels = ["Début"];
  const valeurs = [0];

  dates.forEach(function (date) {
    solde += totauxParDate[date];

    const parties = date.split("-");
    const dateFormatee = new Date(
      Number(parties[0]),
      Number(parties[1]) - 1,
      Number(parties[2])
    );

    labels.push(
      dateFormatee.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short"
      })
    );

    valeurs.push(solde);
  });

  return {
    labels: labels,
    valeurs: valeurs
  };
}

// Créer ou actualiser la courbe
function mettreAJourCourbe(operations) {

  if (graphiqueCourbe !== null) {
    graphiqueCourbe.destroy();
    graphiqueCourbe = null;
  }

  if (operations.length === 0) {
    afficherMessageGraphique(
      "graphique-courbe",
      "Ajoute des opérations pour visualiser l'évolution de ton solde.",
      true
    );
    return;
  }

  afficherMessageGraphique("graphique-courbe", "", false);

  const evolution = calculerEvolutionSolde(operations);

  const canvas = document.getElementById("graphique-courbe");

  graphiqueCourbe = new Chart(canvas, {
    type: "line",

    data: {
      labels: evolution.labels,

      datasets: [{
        label: "Solde",
        data: evolution.valeurs,

        borderColor: "#087f5b",
        backgroundColor: "rgba(32,201,151,0.12)",

        borderWidth: 3,
        fill: true,
        tension: 0.4,

        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#087f5b",
        pointBorderWidth: 3
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: "index"
      },

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          backgroundColor: "#123c30",
          padding: 12,
          cornerRadius: 10,

          callbacks: {
            label: function (context) {
              return "Solde : " +
                formaterMontantGraphique(context.raw);
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#82918a"
          }
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "#edf2ee"
          },

          ticks: {
            color: "#82918a",

            callback: function (valeur) {
              return valeur.toLocaleString("fr-FR") + " €";
            }
          }
        }
      }
    }
  });
}
