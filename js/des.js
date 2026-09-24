// Moteur de dés — jets 2d6 selon les règles PbtA.
// Toujours annoncer le résultat via alerter() pour les non-voyants.

import { alerter } from './narration.js';

// Résultats possibles
export const SUCCES_COMPLET = 'succes';
export const SUCCES_PARTIEL = 'partiel';
export const ECHEC          = 'echec';

// Lance 2d6 + valeur de trait. Annonce le résultat et le retourne.
export function lancerDes(valeurTrait, nomTrait) {
  const d1 = _d6();
  const d2 = _d6();
  const sousTotal = d1 + d2;
  const total     = sousTotal + valeurTrait;

  const signeTrait = _signeParle(valeurTrait);

  let texteOutcome;
  let niveau;

  if (total >= 10) {
    texteOutcome = 'Succès complet.';
    niveau = SUCCES_COMPLET;
  } else if (total >= 7) {
    texteOutcome = 'Succès partiel.';
    niveau = SUCCES_PARTIEL;
  } else {
    texteOutcome = 'Échec. Marquez un point d\'Expérience.';
    niveau = ECHEC;
  }

  const annonce = [
    `Jet de ${nomTrait}.`,
    `Dé 1 : ${d1}. Dé 2 : ${d2}. Sous-total : ${sousTotal}.`,
    `${nomTrait} à ${signeTrait}. Total final : ${total}.`,
    texteOutcome
  ].join(' ');

  alerter(annonce);

  return { d1, d2, sousTotal, total, niveau, texteOutcome };
}

// Lance 1d6 simple (pour tables de création).
export function d6() {
  return _d6();
}

// Lance 2d6 indépendants (pour tables à deux entrées : ex. Patronus).
export function deuxD6Independants() {
  return [_d6(), _d6()];
}

// ---- Interne ----

function _d6() {
  return Math.ceil(Math.random() * 6);
}

function _signeParle(valeur) {
  if (valeur === 0)  return 'zéro';
  if (valeur > 0)    return `plus ${valeur}`;
  return `moins ${Math.abs(valeur)}`;
}
