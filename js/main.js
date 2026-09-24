// Point d'entrée — initialise le jeu et gère les écrans.

import { narrer, narrerFrais, statuer } from './narration.js';
import { afficherActions } from './actions.js';
import { initClavier, initOutils } from './clavier.js';
import { lireFiche, mettreAJourFiche } from './fiche.js';
import { charger, sauvegarder, effacer } from './sauvegarde.js';
import { creerPersonnageVide } from './personnage.js';
import { lancerCreation } from './creation.js';
import { lancerJeu } from './jeu.js';

// État global de la session
const etat = {
  personnage: null
};

// ---- Démarrage ----

document.addEventListener('DOMContentLoaded', () => {
  const raccourcis = {
    lireFiche:    (section) => lireFiche(section, etat.personnage),
    sauvegarder:  _sauvegarder
  };
  initClavier(raccourcis);
  initOutils(raccourcis);

  const sauvegarde = charger();
  if (sauvegarde?.personnage) {
    etat.personnage = sauvegarde.personnage;
    mettreAJourFiche(etat.personnage);
    afficherMenuPrincipal(true);
  } else {
    afficherMenuPrincipal(false);
  }
});

// ---- Écrans ----

function afficherMenuPrincipal(aUneSauvegarde) {
  narrerFrais(
    aUneSauvegarde
      ? `Bienvenue à Poudlard, ${etat.personnage.prenom}. Votre aventure vous attend.`
      : 'Bienvenue à Poudlard. Aucune partie en cours. Créez votre sorcière ou sorcier pour commencer.'
  );

  const actions = [];

  if (aUneSauvegarde) {
    actions.push({ label: 'Reprendre la partie',   action: reprendrePartie });
    actions.push({ label: 'Nouvelle partie',        action: demanderConfirmationNouvelle });
  } else {
    actions.push({ label: 'Créer votre sorcière ou sorcier', action: demarrerCreation });
  }

  afficherActions(actions);
}

function reprendrePartie() {
  narrer(`Vous reprenez l'aventure avec ${etat.personnage.prenom} ${etat.personnage.nom}.`);
  _assureProgressions(etat.personnage);
  lancerJeu(etat.personnage, () => afficherMenuPrincipal(true));
}

function demanderConfirmationNouvelle() {
  narrerFrais('Attention : cela effacera votre partie en cours. Voulez-vous vraiment recommencer ?');
  afficherActions([
    { label: 'Oui, commencer une nouvelle partie', action: demarrerCreation },
    { label: 'Non, retourner au menu', action: () => afficherMenuPrincipal(true), retour: true }
  ]);
}

function demarrerCreation() {
  effacer();
  etat.personnage = creerPersonnageVide();
  lancerCreation(etat.personnage, (personnageFinalise) => {
    etat.personnage = personnageFinalise;
    _assureProgressions(etat.personnage);
    sauvegarder({ personnage: etat.personnage });
    mettreAJourFiche(etat.personnage);
    narrer('Personnage créé et sauvegardé. L\'aventure commence !');
    lancerJeu(etat.personnage, () => afficherMenuPrincipal(true));
  });
}

// ---- Helpers ----

function _sauvegarder() {
  if (!etat.personnage?.prenom) {
    statuer('Aucun personnage à sauvegarder.');
    return;
  }
  sauvegarder({ personnage: etat.personnage }, { annoncer: true });
}

function _assureProgressions(personnage) {
  if (!personnage.progressions) {
    personnage.progressions = { traitsAmeliores: 0, deuxiemeMatiere: false };
  }
}

// Exporté pour les modules enfants (création, jeu, etc.)
export { etat };
