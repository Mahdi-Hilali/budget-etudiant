/*
  storage.js : sauvegarde dans le navigateur (localStorage).
  Chaque profil a ses propres opérations. Rien n'est envoyé sur internet.
*/
const CLE_PROFILS = "budgetProfils";         // liste des profils
const CLE_SESSION = "budgetProfilActif";     // profil connecté
let profilActif = null;                      // pseudo du profil connecté

/**
 * Lit la liste des profils.
 * @returns {Array} les profils (tableau vide s'il n'y en a pas)
 */
function chargerProfils() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PROFILS)) || [];
  } catch (erreur) {
    return [];
  }
}

/**
 * Sauvegarde la liste des profils.
 * @param {Array} profils - la liste complète
 */
function sauvegarderProfils(profils) {
  localStorage.setItem(CLE_PROFILS, JSON.stringify(profils));
}

/**
 * Lit les opérations du profil connecté.
 * @returns {Array} les opérations (tableau vide s'il n'y en a pas)
 */
function chargerOperations() {
  if (!profilActif) return [];
  try {
    return JSON.parse(localStorage.getItem("budgetOperations_" + profilActif)) || [];
  } catch (erreur) {
    return [];
  }
}

/**
 * Sauvegarde les opérations du profil connecté.
 * @param {Array} operations - la liste complète à sauvegarder
 */
function sauvegarderOperations(operations) {
  if (!profilActif) return;
  localStorage.setItem("budgetOperations_" + profilActif, JSON.stringify(operations));
}