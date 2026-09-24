// Sauvegarde et chargement via localStorage.

import { statuer } from '../ui/narration.js';

const CLE = 'poudlard_rpg_v1';

// Les sauvegardes automatiques sont silencieuses : une annonce à chaque tour
// se mélangerait à la lecture du texte par NVDA.
export function sauvegarder(etat, { annoncer = false } = {}) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
    if (annoncer) statuer('Partie sauvegardée.');
    return true;
  } catch {
    statuer('Erreur lors de la sauvegarde.');
    return false;
  }
}

export function charger() {
  try {
    const data = localStorage.getItem(CLE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function effacer() {
  localStorage.removeItem(CLE);
}

export function aUneSauvegarde() {
  return localStorage.getItem(CLE) !== null;
}
