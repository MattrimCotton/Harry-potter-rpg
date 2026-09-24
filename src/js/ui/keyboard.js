// Raccourcis clavier globaux. Enregistrer une seule fois au démarrage.
//
// Tout doit marcher dans les deux modes de NVDA :
// - mode navigation : NVDA garde les lettres, chiffres, Espace et flèches ;
// - mode formulaire : NVDA garde Échap, qui sert à revenir au mode navigation.
// D'où : touches F pour la fiche et la relecture, et deux touches de retour,
// Échap (mode navigation) et Retour arrière (mode formulaire).
// Les flèches parcourent les boutons en mode formulaire ; dans une liste
// déroulante, elles changent la sélection (comportement natif).

import { relire } from './narration.js';
import { declencherRetour, deplacerFocusActions } from './choices.js';

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

      case 'Backspace':
        if (_dansUnChamp()) return;
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

function _dansUnChamp() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA';
}

// Branche les boutons de la barre d'outils permanente sur les mêmes fonctions.
export function initOutils({ lireFiche, sauvegarder }) {
  document.getElementById('zone-outils').addEventListener('click', (e) => {
    const outil = e.target.closest('button')?.dataset.outil;
    if (!outil) return;
    if (outil === 'relire')      relire();
    else if (outil === 'sauver') sauvegarder();
    else                         lireFiche(outil);
  });
}
