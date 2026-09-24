// Moteur de scénario — charge, affiche et orchestre les scènes JSON.

import { narrerFrais, narrer, alerter } from './narration.js';
import { afficherActions } from './actions.js';
import { resoudreManoeuvre, MANOEUVRES } from './manoeuvres.js';
import { mettreAJourFiche } from './fiche.js';
import { sauvegarder } from './sauvegarde.js';
import { SUCCES_COMPLET, SUCCES_PARTIEL, ECHEC } from './des.js';

let _personnage = null;
let _onFin      = null;
let _scenario   = null;
let _etat       = null; // état interne du scénario en cours

// ================================================================
// API publique
// ================================================================

export async function lancerScenario(idScenario, personnage, onFin) {
  _personnage = personnage;
  _onFin      = onFin;
  _etat       = { flags: {}, objets: [], sceneActuelle: null };

  try {
    const rep = await fetch(`contenu/scenarios/${idScenario}.json`);
    if (!rep.ok) throw new Error(`Scénario introuvable : ${idScenario}`);
    _scenario = await rep.json();
  } catch (err) {
    alerter(`Impossible de charger le scénario. Erreur : ${err.message}`);
    onFin(personnage);
    return;
  }

  narrerFrais(
    `Scénario : ${_scenario.titre}. ` +
    `${_scenario.description} ` +
    `Durée estimée : ${_scenario.duree_estimee}.`
  );

  afficherActions([
    {
      label: 'Commencer le scénario',
      action: () => _allerScene('debut')
    },
    {
      label: 'Retour au menu de jeu',
      action: () => _onFin(_personnage)
    }
  ]);
}

// ================================================================
// Navigation
// ================================================================

function _allerScene(idScene) {
  const scene = _scenario.scenes[idScene];
  if (!scene) {
    alerter(`Erreur : scène "${idScene}" introuvable.`);
    return;
  }
  _etat.sceneActuelle = idScene;

  // Appliquer les effets automatiques de la scène
  if (scene.effet_entree) _appliquerEffet(scene.effet_entree);

  // Construire et afficher la narration
  const paragraphes = Array.isArray(scene.narration)
    ? scene.narration
    : [scene.narration];
  const texte = paragraphes.map(_remplacerVariables).join(' ');
  narrerFrais(texte);

  // Scène terminale ?
  if (scene.fin) {
    _terminerScenario(scene.fin);
    return;
  }

  // Filtrer les actions disponibles selon les conditions
  const actionsDispos = (scene.actions ?? []).filter(a => _verifierCondition(a.condition));

  if (actionsDispos.length === 0) {
    narrer('Il n\'y a rien de plus à faire ici. Le scénario se termine.');
    _terminerScenario('normal');
    return;
  }

  afficherActions(actionsDispos.map(a => ({
    label: a.label,
    action: () => _executerAction(a)
  })));
}

// ================================================================
// Actions
// ================================================================

function _executerAction(action) {
  // Appliquer un effet immédiat si défini
  if (action.effet) _appliquerEffet(action.effet);

  if (action.manoeuvre) {
    const manoeuvre = MANOEUVRES.find(m => m.id === action.manoeuvre);
    if (!manoeuvre) {
      alerter(`Manœuvre inconnue : ${action.manoeuvre}`);
      return;
    }
    resoudreManoeuvre(manoeuvre, _personnage, ({ niveau }) => {
      mettreAJourFiche(_personnage);
      sauvegarder({ personnage: _personnage });
      const suite = action.suite ?? {};
      let prochaine;
      if      (niveau === SUCCES_COMPLET) prochaine = suite.succes;
      else if (niveau === SUCCES_PARTIEL) prochaine = suite.partiel;
      else                                prochaine = suite.echec;

      if (!prochaine) prochaine = suite.defaut ?? _etat.sceneActuelle;
      if (action.effet_apres) _appliquerEffet(action.effet_apres[niveau] ?? action.effet_apres.defaut);

      _allerScene(prochaine);
    }, () => _allerScene(_etat.sceneActuelle));

  } else if (action.lien) {
    _allerScene(action.lien);

  } else if (action.fin !== undefined) {
    _terminerScenario(action.fin);
  }
}

// ================================================================
// Fin de scénario
// ================================================================

function _terminerScenario(typeFin) {
  const fins = _scenario.fins ?? {};
  const config = fins[typeFin] ?? fins['normal'] ?? {};

  const texte = config.narration
    ? config.narration.map(_remplacerVariables).join(' ')
    : 'Le scénario est terminé.';

  // Append à la scène actuelle (ne pas effacer la narration du dernier événement)
  narrer(texte);

  // Récompenses
  if (config.ami    && !_personnage.amis.includes(config.ami))    _personnage.amis.push(config.ami);
  if (config.rival  && !_personnage.rivaux.includes(config.rival)) _personnage.rivaux.push(config.rival);
  if (config.objet  && !_personnage.objetsMagiques.includes(config.objet)) _personnage.objetsMagiques.push(config.objet);

  mettreAJourFiche(_personnage);
  sauvegarder({ personnage: _personnage });

  afficherActions([
    { label: 'Retour au menu de jeu', action: () => _onFin(_personnage) }
  ]);
}

// ================================================================
// Effets
// ================================================================

function _appliquerEffet(effet) {
  if (!effet) return;
  if (effet.flag)  _etat.flags[effet.flag] = true;
  if (effet.objet) { if (!_etat.objets.includes(effet.objet)) _etat.objets.push(effet.objet); }
  // Effets permanents sur le personnage (ami/rival ajoutés en fin de scénario, pas ici)
}

// ================================================================
// Conditions
// ================================================================

function _verifierCondition(condition) {
  if (!condition) return true;
  if (condition === 'toujours') return true;

  // Support des conditions composées avec && et ||
  if (condition.includes('&&')) {
    return condition.split('&&').map(c => c.trim()).every(_evalCondition);
  }
  if (condition.includes('||')) {
    return condition.split('||').map(c => c.trim()).some(_evalCondition);
  }
  return _evalCondition(condition);
}

function _evalCondition(condition) {
  const c = condition.trim();
  if (c.startsWith('!')) return !_evalCondition(c.slice(1));
  if (c.startsWith('flag:'))  return !!_etat.flags[c.slice(5)];
  if (c.startsWith('objet:')) return _etat.objets.includes(c.slice(6));
  if (c.startsWith('sort:')) {
    const nom = c.slice(5).toLowerCase();
    return _personnage.sorts.some(s => s.nom.toLowerCase().includes(nom));
  }
  if (c.startsWith('trait:')) {
    // ex: trait:intellect>=1
    const m = c.slice(6).match(/^(\w+)(>=|<=|>|<|=)(-?\d+)$/);
    if (!m) return false;
    const [, nomTrait, op, valStr] = m;
    const val  = _personnage.traits[nomTrait] ?? 0;
    const cible = parseInt(valStr, 10);
    switch (op) {
      case '>=': return val >= cible;
      case '<=': return val <= cible;
      case '>':  return val > cible;
      case '<':  return val < cible;
      case '=':  return val === cible;
      default:   return false;
    }
  }
  if (c.startsWith('annee:')) {
    const m = c.slice(6).match(/^(>=|<=|>|<|=)?(\d+)$/);
    if (!m) return false;
    const [, op, valStr] = m;
    const annee = _personnage.annee;
    const cible  = parseInt(valStr, 10);
    switch (op || '=') {
      case '>=': return annee >= cible;
      case '<=': return annee <= cible;
      case '>':  return annee > cible;
      case '<':  return annee < cible;
      case '=':  return annee === cible;
      default:   return false;
    }
  }
  return true;
}

// ================================================================
// Remplacement des variables dans le texte
// ================================================================

function _remplacerVariables(texte) {
  if (!texte) return '';
  return texte
    .replace(/\{\{prenom\}\}/g, _personnage.prenom ?? '')
    .replace(/\{\{nom\}\}/g, _personnage.nom ?? '')
    .replace(/\{\{maison\}\}/g, _personnage.maison ?? '')
    .replace(/\{\{annee\}\}/g, String(_personnage.annee ?? 1))
    .replace(/\{\{patronus\}\}/g, _personnage.patronus ?? 'inconnu');
}
