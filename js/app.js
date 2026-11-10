
/*
  app.js : logique principale de BudgetÉtudiant.
*/

const CATEGORIES = {
  revenu: ["Bourse", "Job étudiant", "Aide famille", "Autre revenu"],
  depense: ["Loyer", "Courses", "Transport", "Loisirs", "Santé", "Autre dépense"]
};

let operations = [];

const formulaire = document.getElementById("formulaire");
const champType = document.getElementById("type");
const champNom = document.getElementById("nom");
const champMontant = document.getElementById("montant");
const champCategorie = document.getElementById("categorie");
const champDate = document.getElementById("date");
const listeHtml = document.getElementById("liste");
const messageVide = document.getElementById("vide");

function formaterEuros(valeur) {
  return valeur.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
}

function aujourdhui() {
  const d = new Date();

  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function remplirCategories() {
  const type = champType.value;

  champCategorie.innerHTML = "";

  CATEGORIES[type].forEach(function (categorie) {
    const option = document.createElement("option");
    option.value = categorie;
    option.textContent = categorie;
    champCategorie.appendChild(option);
  });
}

function joursRestantsDansLeMois() {
  const maintenant = new Date();

  const dernierJour = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() + 1,
    0
  ).getDate();

  return dernierJour - maintenant.getDate() + 1;
}

function ajouterOperation(evenement) {
  evenement.preventDefault();

  const montant = parseFloat(champMontant.value);
  const nom = champNom.value.trim();

  if (
    nom === "" ||
    isNaN(montant) ||
    montant <= 0 ||
    champDate.value === ""
  ) {
    return;
  }

  const operation = {
    id: Date.now(),
    type: champType.value,
    nom: nom,
    montant: montant,
    categorie: champCategorie.value,
    date: champDate.value
  };

  operations.push(operation);

  sauvegarderOperations(operations);

  formulaire.reset();

  remplirCategories();

  champDate.value = aujourdhui();

  afficher();
}

function supprimerOperation(id) {
  operations = operations.filter(function (op) {
    return op.id !== id;
  });

  sauvegarderOperations(operations);

  afficher();
}

function afficherListe() {
  listeHtml.innerHTML = "";

  messageVide.style.display =
    operations.length === 0 ? "block" : "none";

  const triees = operations.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date) || b.id - a.id;
  });

  triees.forEach(function (op) {
    const ligne = document.createElement("li");

    const texte = document.createElement("span");

    texte.textContent =
      op.date + " · " + op.nom + " (" + op.categorie + ")";

    const montant = document.createElement("span");

    const signe = op.type === "revenu" ? "+" : "-";

    montant.textContent = signe + formaterEuros(op.montant);

    montant.className =
      op.type === "revenu" ? "montant-revenu" : "montant-depense";

    const bouton = document.createElement("button");

    bouton.textContent = "Supprimer";
    bouton.className = "btn-supprimer";

    bouton.addEventListener("click", function () {
      supprimerOperation(op.id);
    });

    ligne.appendChild(texte);
    ligne.appendChild(montant);
    ligne.appendChild(bouton);

    listeHtml.appendChild(ligne);
  });
}

/*
  CALCUL DU RÉSUMÉ ET DE L'ÉCONOMIE
*/

function afficherResume() {

  let totalRevenus = 0;
  let totalDepenses = 0;

  operations.forEach(function (op) {
    if (op.type === "revenu") {
      totalRevenus += Number(op.montant);
    } else {
      totalDepenses += Number(op.montant);
    }
  });

  const solde = totalRevenus - totalDepenses;

  document.getElementById("total-revenus").textContent =
    formaterEuros(totalRevenus);

  document.getElementById("total-depenses").textContent =
    formaterEuros(totalDepenses);

  document.getElementById("solde").textContent =
    formaterEuros(solde);

  // ÉVALUATION DES DÉPENSES

  const economie = document.getElementById("economie");
  const economieDetail = document.getElementById("economie-detail");
  const carteEconomie = economie.parentElement;

  carteEconomie.classList.remove(
    "eco-bon",
    "eco-moyen",
    "eco-eleve",
    "eco-danger"
  );

  if (totalRevenus === 0) {

    if (totalDepenses === 0) {
      economie.textContent = "--";
      economieDetail.textContent = "En attente de données";
      carteEconomie.classList.add("eco-moyen");
    } else {
      economie.textContent = "Attention";
      economieDetail.textContent = "Aucun revenu enregistré";
      carteEconomie.classList.add("eco-danger");
    }

  } else {

    const pourcentage = (totalDepenses / totalRevenus) * 100;

    economieDetail.textContent =
      pourcentage.toFixed(1).replace(".", ",") +
      " % de tes revenus dépensés";

    if (pourcentage < 50) {

      economie.textContent = "Économique";
      carteEconomie.classList.add("eco-bon");

    } else if (pourcentage < 80) {

      economie.textContent = "Modéré";
      carteEconomie.classList.add("eco-moyen");

    } else if (pourcentage <= 100) {

      economie.textContent = "Élevé";
      carteEconomie.classList.add("eco-eleve");

    } else {

      economie.textContent = "Dépassement";
      carteEconomie.classList.add("eco-danger");
    }
  }

  // ALERTE RESTE À VIVRE

  const alerte = document.getElementById("alerte");

  if (operations.length === 0) {
    alerte.textContent = "Ajoute tes revenus et dépenses.";
    alerte.className = "alerte";
    return;
  }

  const jours = joursRestantsDansLeMois();
  const parJour = solde / jours;

  if (solde < 0) {

    alerte.textContent =
      "⚠️ Attention, tu es à découvert de " +
      formaterEuros(Math.abs(solde)) + " ce mois-ci !";

    alerte.className = "alerte danger";

  } else {

    alerte.textContent =
      "✅ Il te reste " + formaterEuros(parJour) +
      " par jour pendant " + jours + " jour(s).";

    alerte.className = "alerte ok";
  }
}

function afficher() {
  afficherListe();
  afficherResume();

  mettreAJourGraphique(operations);
  mettreAJourCourbe(operations);
}

function demarrer() {
  operations = chargerOperations();

  operations.forEach(function (op) {
    if (!op.date) {
      op.date = aujourdhui();
    }
  });

  sauvegarderOperations(operations);

  remplirCategories();

  champDate.value = aujourdhui();

  afficher();
}

// ÉCOUTEURS

champType.addEventListener("change", remplirCategories);

formulaire.addEventListener("submit", ajouterOperation);
