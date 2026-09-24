// Raccourcis clavier globaux.
// Enregistrer une seule fois au démarrage.

import { relire } from './narration.js';

// cbLireFiche(section) : 'traits' | 'etats' | 'sorts' | 'amis' | 'chance'
// cbSauvegarder()
// cbRelancerDes()
export function initClavier({ lireFiche, sauvegarder, relancerDes }) {
  document.addEventListener('keydown', (e) => {
    // Ne pas capturer les touches dans un champ de texte
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (e.key) {
      case ' ':
        // Espace sur un bouton = clic navigateur — ne capturer que hors bouton
        if (document.activeElement?.tagName === 'BUTTON') return;
        e.preventDefault();
        relire();
        break;

      case 'F1':
        e.preventDefault();
        lireFiche('traits');
        break;

      case 'F2':
        e.preventDefault();
        lireFiche('etats');
        break;

      case 'F3':
        e.preventDefault();
        lireFiche('sorts');
        break;

      case 'F4':
        e.preventDefault();
        lireFiche('amis');
        break;

      case 'F5':
        e.preventDefault();
        lireFiche('chance');
        break;

      case 'r':
      case 'R':
        if (relancerDes) relancerDes();
        break;

      case 's':
      case 'S':
        if (sauvegarder) sauvegarder();
        break;
    }
  });
}
