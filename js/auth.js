/*
  auth.js : profils locaux (inscription / connexion).
  Pseudo + code à 4 chiffres, gardés dans le navigateur uniquement.
  Ce n'est PAS une vraie sécurité : juste un verrou simple.
*/
const ecranAuth = document.getElementById("ecran-auth");
const formAuth = document.getElementById("form-auth");
const champPseudo = document.getElementById("pseudo");
const champCode = document.getElementById("code");
const messageAuth = document.getElementById("message-auth");
const boutonAuth = document.getElementById("btn-auth");
let modeAuth = "connexion"; // "connexion" ou "inscription"

/**
 * Transforme "pseudo:code" en nombre (le code n'est pas stocké en clair).
 * @param {string} texte - le texte à transformer
 * @returns {string} le résultat
 */
function hacherCode(texte) {
  let h = 0;
  for (let i = 0; i < texte.length; i++) {
    h = (h * 31 + texte.charCodeAt(i)) | 0;
  }
  return String(h);
}

/**
 * Choisit l'onglet Connexion ou Inscription.
 * @param {string} mode - "connexion" ou "inscription"
 */
function choisirModeAuth(mode) {
  modeAuth = mode;
  messageAuth.textContent = "";
  boutonAuth.textContent = mode === "connexion" ? "Se connecter" : "Créer mon profil";
  document.querySelectorAll("[data-mode-auth]").forEach(function (bouton) {
    bouton.classList.toggle("actif", bouton.dataset.modeAuth === mode);
  });
}

/**
 * Connecte le profil et démarre l'appli.
 * @param {string} pseudo - le pseudo du profil
 */
function ouvrirSession(pseudo) {
  profilActif = pseudo;
  localStorage.setItem(CLE_SESSION, pseudo);
  ecranAuth.classList.remove("ouvert");
  document.getElementById("nom-profil").textContent = "👤 " + pseudo;
  demarrer(); // fonction définie dans app.js
}

/**
 * Valide le formulaire : crée un profil ou vérifie le code.
 * @param {Event} evenement - l'envoi du formulaire
 */
function validerAuth(evenement) {
  evenement.preventDefault();
  const pseudo = champPseudo.value.trim().toLowerCase();
  const empreinte = hacherCode(pseudo + ":" + champCode.value);
  const profils = chargerProfils();
  const existant = profils.find(function (p) { return p.pseudo === pseudo; });

  if (modeAuth === "inscription") {
    if (existant) {
      messageAuth.textContent = "Ce pseudo existe déjà.";
      return;
    }
    profils.push({ pseudo: pseudo, empreinte: empreinte });
    sauvegarderProfils(profils);
    ouvrirSession(pseudo);
  } else {
    if (!existant || existant.empreinte !== empreinte) {
      messageAuth.textContent = "Pseudo ou code incorrect.";
      return;
    }
    ouvrirSession(pseudo);
  }
}

/**
 * Déconnecte le profil et revient à l'écran de connexion.
 */
function deconnecter() {
  localStorage.removeItem(CLE_SESSION);
  profilActif = null;
  formAuth.reset();
  ecranAuth.classList.add("ouvert");
}

// ----- Écouteurs d'événements -----
document.querySelectorAll("[data-mode-auth]").forEach(function (bouton) {
  bouton.addEventListener("click", function () {
    choisirModeAuth(bouton.dataset.modeAuth);
  });
});
formAuth.addEventListener("submit", validerAuth);
document.getElementById("btn-deconnexion").addEventListener("click", deconnecter);

// ----- Démarrage : on reconnecte le dernier profil, sinon écran de connexion -----
const pseudoSauvegarde = localStorage.getItem(CLE_SESSION);
if (pseudoSauvegarde && chargerProfils().some(function (p) { return p.pseudo === pseudoSauvegarde; })) {
  ouvrirSession(pseudoSauvegarde);
} else {
  ecranAuth.classList.add("ouvert");
}