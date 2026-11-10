# BudgetÉtudiant

Simulateur de budget mensuel pour étudiants, 100 % dans le navigateur.

## 1. Objectif de l'application

Aider un étudiant à savoir s'il finira le mois dans le vert, en visualisant ses revenus, ses dépenses et ce qu'il peut encore dépenser chaque jour.

## 2. Utilisateurs et rôles

| Rôle | Description |
|------|-------------|
| Étudiant | Seul rôle. Il ajoute et supprime ses revenus et dépenses, consulte le graphique et l'alerte. Il n'y a pas de compte ni d'administrateur. |

## 3. MVP : 3 fonctionnalités (opérationnelles aujourd'hui)

1. **Saisie des revenus et dépenses par catégorie** : ajouter une ligne (nom, montant, catégorie, type revenu/dépense) et la supprimer. Les données restent après rechargement de la page.
2. **Graphique de répartition** des dépenses par catégorie (Chart.js), mis à jour automatiquement.
3. **Alerte « reste à vivre par jour »** : `(revenus - dépenses) / nombre de jours restants dans le mois`. Elle passe au rouge si le solde est négatif.

Design : une seule page, simple et claire, utilisable sur ordinateur et sur téléphone (responsive).

## 4. Ce que je ne fais pas aujourd'hui (et pourquoi)

| Pas fait aujourd'hui | Pourquoi |
|----------------------|----------|
| Comptes utilisateurs / connexion | Pas de back-end et aucune donnée personnelle collectée |
| Synchronisation entre appareils | Nécessite un serveur ; hors périmètre du MVP |
| Connexion à une banque | Données sensibles, complexité et risques de sécurité |
| Historique sur plusieurs mois | Je me concentre d'abord sur un seul mois, pour avoir une app qui marche |
| Export PDF / Excel | Fonctionnalité en plus, pas nécessaire au MVP |
| Application mobile native | Manque de temps ; le site s'adapte déjà aux téléphones |

## 5. Langage et choix techniques

- **HTML / CSS / JavaScript** : simple, sans serveur, hébergeable sur GitHub Pages.
- **Chart.js** (via CDN) : bibliothèque de graphiques légère et bien documentée.
- **localStorage** : sauvegarde locale dans le navigateur ; rien n'est envoyé sur internet, aucune donnée personnelle n'est collectée.

## Lancer le projet

Ouvrir `index.html` dans un navigateur (aucune installation nécessaire).

## Structure du projet

```
budget-etudiant/
├── index.html
├── css/style.css
├── js/
│   ├── app.js        # logique principale
│   ├── storage.js    # lecture/écriture localStorage
│   └── chart.js      # création du graphique
└── README.md
```
