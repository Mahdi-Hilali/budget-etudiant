/*
  app.js : logique principale de BudgetÉtudiant.
  - ajoute et supprime des opérations (revenus / dépenses)
  - calcule les totaux et le "reste à vivre par jour"
  - affiche la liste et le résumé
  - demande à chart.js de mettre à jour le graphique

  Dépend de storage.js (chargerOperations, sauvegarderOperations)
  et de chart.js (mettreAJourGraphique).
*/

// ----- Catégories proposées selon le type d'opération -----
const CATEGORIES = {
  revenu: ["Bourse", "Job étudiant", "Aide famille", "Autre revenu"],
  depense: ["Loyer", "Courses", "Transport", "Loisirs", "Santé", "Autre dépense"]
};

// ----- Liste des opérations en mémoire (chargée depuis le localStorage) -----
let operations = chargerOperations();

// ----- Éléments de la page qu'on va manipuler -----
const formulaire = document.getElementById("formulaire");
const champType = document.getElementById("type");
const champNom = document.getElementById("nom");
const champMontant = document.getElementById("montant");
const champCategorie = document.getElementById("categorie");
const listeHtml = document.getElementById("liste");
const messageVide = document.getElementById("vide");

/**
 * Formate un nombre en euros, ex : 1234.5 -> "1 234,50 €".
 * @param {number} valeur - le montant
 * @returns {string} le montant formaté
 */
function formaterEuros(valeur) {
  return valeur.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/**
 * Remplit la liste déroulante des catégories selon le type choisi.
 */
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

/**
 * Calcule le nombre de jours restants dans le mois (aujourd'hui inclus).
 * @returns {number} jours restants (au minimum 1)
 */
function joursRestantsDansLeMois() {
  const aujourdhui = new Date();
  // Le jour 0 du mois suivant = dernier jour du mois en cours
  const dernierJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0).getDate();
  return dernierJour - aujourdhui.getDate() + 1;
}

/**
 * Calcule le reste à vivre par jour.
 * @param {number} solde - revenus - dépenses
 * @param {number} joursRestants - jours restants dans le mois
 * @returns {number} budget disponible par jour
 */
function resteAVivreParJour(solde, joursRestants) {
  return solde / joursRestants;
}

/**
 * Ajoute une nouvelle opération, la sauvegarde et rafraîchit l'affichage.
 * @param {Event} evenement - l'envoi du formulaire
 */
function ajouterOperation(evenement) {
  evenement.preventDefault(); // empêche le rechargement de la page

  const montant = parseFloat(champMontant.value);
  const nom = champNom.value.trim();

  // Vérification simple : on refuse un nom vide ou un montant invalide
  if (nom === "" || isNaN(montant) || montant <= 0) {
    return;
  }

  const operation = {
    id: Date.now(),            // identifiant unique (basé sur l'heure)
    type: champType.value,     // "revenu" ou "depense"
    nom: nom,
    montant: montant,
    categorie: champCategorie.value
  };

  operations.push(operation);
  sauvegarderOperations(operations);

  formulaire.reset();          // vide le formulaire
  remplirCategories();         // remet les catégories du type par défaut
  afficher();
}

/**
 * Supprime une opération grâce à son identifiant.
 * @param {number} id - identifiant de l'opération à supprimer
 */
function supprimerOperation(id) {
  // On garde toutes les opérations SAUF celle qui a cet identifiant
  operations = operations.filter(function (op) {
    return op.id !== id;
  });
  sauvegarderOperations(operations);
  afficher();
}

/**
 * Affiche la liste des opérations dans la page.
 */
function afficherListe() {
  listeHtml.innerHTML = "";

  // Message "aucune opération" visible seulement si la liste est vide
  messageVide.style.display = operations.length === 0 ? "block" : "none";

  operations.forEach(function (op) {
    const ligne = document.createElement("li");

    const texte = document.createElement("span");
    texte.textContent = op.nom + " (" + op.categorie + ")";

    const montant = document.createElement("span");
    const signe = op.type === "revenu" ? "+" : "-";
    montant.textContent = signe + formaterEuros(op.montant);
    montant.className = op.type === "revenu" ? "montant-revenu" : "montant-depense";

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

/**
 * Calcule et affiche les totaux, le solde et l'alerte "reste à vivre par jour".
 */
function afficherResume() {
  let totalRevenus = 0;
  let totalDepenses = 0;

  operations.forEach(function (op) {
    if (op.type === "revenu") {
      totalRevenus += op.montant;
    } else {
      totalDepenses += op.montant;
    }
  });

  const solde = totalRevenus - totalDepenses;

  document.getElementById("total-revenus").textContent = formaterEuros(totalRevenus);
  document.getElementById("total-depenses").textContent = formaterEuros(totalDepenses);
  document.getElementById("solde").textContent = formaterEuros(solde);

  const alerte = document.getElementById("alerte");

  // Aucune donnée : message neutre
  if (operations.length === 0) {
    alerte.textContent = "Ajoute tes revenus et dépenses.";
    alerte.className = "alerte";
    return;
  }

  const jours = joursRestantsDansLeMois();
  const parJour = resteAVivreParJour(solde, jours);

  if (solde < 0) {
    // Solde négatif : alerte rouge
    alerte.textContent = "⚠️ Attention, tu es à découvert de " + formaterEuros(Math.abs(solde)) + " ce mois-ci !";
    alerte.className = "alerte danger";
  } else {
    // Solde positif : alerte verte avec le budget par jour
    alerte.textContent = "✅ Il te reste " + formaterEuros(parJour) + " par jour pendant " + jours + " jour(s).";
    alerte.className = "alerte ok";
  }
}

/**
 * Met à jour toute la page : liste, résumé et graphique.
 */
function afficher() {
  afficherListe();
  afficherResume();
  mettreAJourGraphique(operations); // fonction définie dans chart.js
}

// ----- Démarrage de l'application -----
champType.addEventListener("change", remplirCategories); // change les catégories selon le type
formulaire.addEventListener("submit", ajouterOperation);
remplirCategories();
afficher();