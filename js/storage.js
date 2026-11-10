/*
  storage.js : sauvegarde des opérations dans le navigateur.
  On utilise localStorage : les données restent sur l'ordinateur de l'utilisateur,
  rien n'est envoyé sur internet.
*/

// Nom de la "case" dans le localStorage où on range nos données
const CLE_STOCKAGE = "budgetEtudiant";

/**
 * Lit la liste des opérations sauvegardées.
 * @returns {Array} la liste des opérations (tableau vide s'il n'y en a pas)
 */
function chargerOperations() {
  const texte = localStorage.getItem(CLE_STOCKAGE);

  // Si rien n'est sauvegardé, on renvoie une liste vide
  if (texte === null) {
    return [];
  }

  // Le localStorage ne stocke que du texte : on le retransforme en tableau
  try {
    return JSON.parse(texte);
  } catch (erreur) {
    // Si les données sont abîmées, on repart de zéro plutôt que de planter
    return [];
  }
}

/**
 * Sauvegarde la liste des opérations.
 * @param {Array} operations - la liste complète à sauvegarder
 */
function sauvegarderOperations(operations) {
  // On transforme le tableau en texte (JSON) pour pouvoir le stocker
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(operations));
}
