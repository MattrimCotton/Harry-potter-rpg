// Sauvegarde et chargement via localStorage.

import { statuer } from './narration.js';

const CLE = 'poudlard_rpg_v1';

export function sauvegarder(etat) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
    statuer('Partie sauvegardée.');
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
