// Raccourcis clavier globaux. Enregistrer une seule fois au démarrage.
//
// En mode navigation, NVDA garde pour lui les lettres, les chiffres, Espace et
// les flèches : ces touches n'arrivent jamais à la page. Les raccourcis du jeu
// utilisent donc des touches que NVDA laisse passer : F1 à F5, F8, F9 et Échap.
// Les flèches ne servent que dans la liste d'actions, en mode formulaire.

import { relire } from './narration.js';
import { declencherRetour, deplacerFocusActions } from './actions.js';

const SECTIONS_FICHE = { F1: 'traits', F2: 'etats', F3: 'sorts', F4: 'amis', F5: 'chance' };

export function initClavier({ lireFiche, sauvegarder }) {
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    // Les touches F sont traitées même dans un champ texte :
    // sinon F5 rechargerait la page et F1 ouvrirait l'aide du navigateur.
    if (SECTIONS_FICHE[e.key]) {
      e.preventDefault();
      lireFiche(SECTIONS_FICHE[e.key]);
      return;
    }

    switch (e.key) {
      case 'F8':
        e.preventDefault();
        sauvegarder();
        return;

      case 'F9':
        e.preventDefault();
        relire();
        return;

      case 'Escape':
        e.preventDefault();
        declencherRetour();
        return;

      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        if (deplacerFocusActions(e.key)) e.preventDefault();
        return;
    }
  });
}

// Branche les boutons de la barre d'outils permanente sur les mêmes fonctions.
export function initOutils({ lireFiche, sauvegarder, afficherAide }) {
  document.getElementById('zone-outils').addEventListener('click', (e) => {
    const outil = e.target.closest('button')?.dataset.outil;
    if (!outil) return;
    if (outil === 'relire')      relire();
    else if (outil === 'sauver') sauvegarder();
    else if (outil === 'aide')   afficherAide();
    else                         lireFiche(outil);
  });
}
