// Écran de jeu principal — boucle narrative et sélection des manœuvres.

import { narrerFrais, narrer, alerter } from '../ui/narration.js';
import { afficherActions, demanderTexte } from '../ui/choices.js';
import { MANOEUVRES, resoudreManoeuvre } from '../rules/moves.js';
import { mettreAJourFiche } from '../ui/character-sheet.js';
import { sauvegarder } from './save.js';
import { tousEtatsActifs, traitEffectif, NOMS_TRAITS } from '../rules/character.js';
import { lancerDes, SUCCES_COMPLET, SUCCES_PARTIEL, ECHEC } from '../rules/dice.js';
import { lancerScenario } from './scenario.js';

let _personnage = null;
let _onRetourMenu = null;

// ================================================================
// Lancer l'écran de jeu
// ================================================================

export function lancerJeu(personnage, onRetourMenu) {
  _personnage = personnage;
  _onRetourMenu = onRetourMenu;
  _afficherEcranJeu();
}

// ================================================================
// Écran principal
// ================================================================

function _afficherEcranJeu() {
  const nom = `${_personnage.prenom} ${_personnage.nom}`;
  const etats = _personnage.etats.filter(e => e.actif).map(e => e.nom);

  narrerFrais(
    `Jeu en cours. Personnage : ${nom}, ${_personnage.maison}, ` +
    `${_personnage.annee <= 7 ? `${_personnage.annee}${_personnage.annee === 1 ? "ère" : "ème"} Année` : 'Diplômé'}. ` +
    (etats.length > 0
      ? `États actifs : ${etats.join(', ')}.`
      : 'Aucun état actif.') +
    ` Chance : ${_personnage.chance} sur 3. Expérience : ${_personnage.experience} sur 4. ` +
    'Que voulez-vous faire ?'
  );

  // Vérifier si tous les états sont cochés
  if (tousEtatsActifs(_personnage)) {
    _jetDeSurvie();
    return;
  }

  _afficherMenuJeu();
}

function _afficherMenuJeu() {
  afficherActions([
    { label: 'Jouer un scénario', action: _afficherScenarios },
    { label: 'Faire une manœuvre libre', action: _afficherManoeuvres },
    { label: 'Gérer les États', action: _gererEtats },
    { label: 'Voir les Amis et Rivaux', action: _gererRelations },
    {
      label: _personnage.experience >= 4
        ? 'Prendre une Progression'
        : `Prendre une Progression : indisponible, ${_personnage.experience} Expérience sur 4`,
      action: _prendreProgression,
      desactive: _personnage.experience < 4
    },
    { label: 'Fin de session', action: _finSession },
    { label: 'Menu principal', action: () => _onRetourMenu?.() }
  ]);
}

function _afficherManoeuvres() {
  narrer('Quelle manœuvre ? Le trait utilisé et sa valeur sont indiqués.');
  afficherActions([
    ...MANOEUVRES.map(m => ({
      label: m.traits.length === 1
        ? `${m.nom}, ${NOMS_TRAITS[m.traits[0]]} ${_signeParle(traitEffectif(_personnage, m.traits[0]))}`
        : `${m.nom}, ${m.traits.length === 2 ? m.traits.map(t => NOMS_TRAITS[t]).join(' ou ') : 'trait au choix'}`,
      action: () => _lancerManoeuvre(m)
    })),
    { label: 'Retour au jeu', action: _afficherMenuJeu }
  ]);
}

// ================================================================
// Manœuvres
// ================================================================

function _lancerManoeuvre(manoeuvre) {
  narrerFrais(`${manoeuvre.nom}. ${manoeuvre.description}`);

  resoudreManoeuvre(manoeuvre, _personnage, ({ niveau, personnage, sansJet }) => {
    _personnage = personnage;
    mettreAJourFiche(_personnage);
    sauvegarder({ personnage: _personnage });

    if (tousEtatsActifs(_personnage)) {
      _jetDeSurvie();
      return;
    }

    if (!sansJet) {
      if (niveau === ECHEC) {
        narrer("Imaginez les conséquences de cet échec dans l'histoire, puis choisissez la suite.");
      } else if (niveau === SUCCES_PARTIEL) {
        narrer("Imaginez le prix de ce succès dans l'histoire, puis choisissez la suite.");
      } else {
        narrer("Que se passe-t-il ensuite dans l'histoire ?");
      }
    }

    _afficherMenuJeu();
  }, _afficherManoeuvres);
}

// ================================================================
// Jet de survie (tous les états cochés)
// ================================================================

function _jetDeSurvie() {
  const meilleur = Math.max(...Object.values(_personnage.traits));
  const nomMeilleur = Object.entries(NOMS_TRAITS).find(([c]) => _personnage.traits[c] === meilleur)?.[1] ?? 'trait';

  alerter(
    'Tous vos états sont cochés ! Vous devez faire un jet de survie. ' +
    `Lancez votre meilleur trait : ${nomMeilleur} à ${_signeParle(meilleur)}. ` +
    '10 ou plus : vous revenez, tous les états effacés. ' +
    '7 à 9 : vous revenez avec seulement Inconscient effacé. ' +
    '6 ou moins : votre personnage quitte l\'histoire.'
  );

  afficherActions([{
    label: `Lancer le jet de survie (${nomMeilleur} : ${_signeParle(meilleur)})`,
    action: () => {
      const resultat = lancerDes(meilleur, nomMeilleur);

      if (resultat.niveau === SUCCES_COMPLET) {
        _personnage.etats.forEach(e => { e.actif = false; });
        alerter('10 ou plus. Vous revenez sain et sauf. Tous les états sont effacés.');
        if (resultat.total >= 10) {
          narrer('Décrivez comment votre personnage reprend conscience ou revient dans la scène.');
        }
        _refusCicatrice();

      } else if (resultat.niveau === SUCCES_PARTIEL) {
        _personnage.etats.forEach(e => { if (e.id !== 'inconscient') e.actif = false; });
        alerter('7 à 9. Vous revenez, mais seulement l\'état Inconscient est effacé. Les autres états persistent.');
        _refusCicatrice();

      } else {
        alerter(
          '6 ou moins. Votre personnage quitte l\'histoire. ' +
          'Vous devrez créer un nouveau sorcier ou sorcière. ' +
          'Décrivez comment ce personnage disparaît de l\'histoire.'
        );
        afficherActions([
          { label: 'Retour au menu principal', action: () => _onRetourMenu?.() }
        ]);
      }
    }
  }]);
}

function _refusCicatrice() {
  narrer('Avez-vous une cicatrice physique ou mentale suite à cet épisode ?');
  afficherActions([
    {
      label: 'Oui — noter une cicatrice',
      action: () => _noterCicatrice()
    },
    {
      label: 'Non — reprendre l\'aventure',
      action: () => {
        mettreAJourFiche(_personnage);
        sauvegarder({ personnage: _personnage });
        _afficherEcranJeu();
      }
    }
  ]);
}

function _noterCicatrice() {
  demanderTexte({
    question: 'Décrivez votre cicatrice, physique ou mentale.',
    exemple: 'une brûlure sur la main gauche',
    onValider: (val) => {
      _personnage.cicatrices.push(val);
      alerter(`Cicatrice notée : ${val}.`);
      mettreAJourFiche(_personnage);
      sauvegarder({ personnage: _personnage });
      _afficherEcranJeu();
    }
  });
}

// ================================================================
// Sélection de scénario
// ================================================================

async function _afficherScenarios() {
  let index;
  try {
    const rep = await fetch('data/scenarios/index.json');
    index = await rep.json();
  } catch {
    alerter('Impossible de charger la liste des scénarios.');
    _afficherMenuJeu();
    return;
  }

  const disponibles = index.filter(s =>
    _personnage.annee >= (s.annee_min ?? 1) &&
    _personnage.annee <= (s.annee_max ?? 7)
  );

  if (disponibles.length === 0) {
    alerter('Aucun scénario disponible pour votre Année. Revenez l\'an prochain.');
    _afficherMenuJeu();
    return;
  }

  narrerFrais(
    'Scénarios disponibles. Chaque scénario est une histoire complète avec ses propres ' +
    'enjeux et ses propres personnages. Vos choix et vos jets de dés en déterminent l\'issue.'
  );

  afficherActions([
    ...disponibles.map(s => ({
      label: `${s.titre} — ${s.accroche} Durée estimée : ${s.duree_estimee}.`,
      action: () => lancerScenario(s.id, _personnage, (personnageMisAJour) => {
        _personnage = personnageMisAJour;
        _afficherEcranJeu();
      })
    })),
    { label: 'Retour au menu de jeu', action: _afficherMenuJeu }
  ]);
}

// ================================================================
// Gestion des États
// ================================================================

function _gererEtats() {
  const actifs   = _personnage.etats.filter(e => e.actif);
  const inactifs = _personnage.etats.filter(e => !e.actif);

  narrerFrais(
    actifs.length === 0
      ? 'Aucun état actif. Vous êtes en pleine forme.'
      : `États actifs : ${actifs.map(e => e.nom).join(', ')}. Vous pouvez en effacer un si la condition est remplie.`
  );

  const actions = [];

  if (actifs.length > 0) {
    actions.push({
      label: 'Effacer un état (condition remplie)',
      action: () => _effacerEtat(actifs)
    });
  }

  if (inactifs.length > 0) {
    actions.push({
      label: 'Cocher un état (vous venez d\'en subir un)',
      action: () => _cocherEtat(inactifs)
    });
  }

  actions.push({ label: 'Retour au jeu', action: _afficherMenuJeu });
  afficherActions(actions);
}

function _effacerEtat(actifs) {
  narrer('Quel état voulez-vous effacer ?');
  afficherActions([
    ...actifs.map(e => ({
      label: `${e.nom} — ${e.malus < 0 ? `malus ${e.malus}` : ''}`,
      action: () => {
        e.actif = false;
        alerter(`État ${e.nom} effacé.`);
        mettreAJourFiche(_personnage);
        sauvegarder({ personnage: _personnage });
        _gererEtats();
      }
    })),
    { label: 'Annuler', action: _gererEtats }
  ]);
}

function _cocherEtat(inactifs) {
  narrer('Quel état venez-vous de subir ?');
  afficherActions([
    ...inactifs.map(e => ({
      label: e.nom,
      action: () => {
        e.actif = true;
        alerter(`État ${e.nom} coché. ${e.malus !== -99 ? `Malus de ${e.malus} en ${e.trait === 'tous' ? 'tous les traits' : NOMS_TRAITS[e.trait] ?? e.trait}.` : 'Vous êtes hors jeu.'}`);
        mettreAJourFiche(_personnage);
        sauvegarder({ personnage: _personnage });
        if (tousEtatsActifs(_personnage)) {
          _jetDeSurvie();
        } else {
          _gererEtats();
        }
      }
    })),
    { label: 'Annuler', action: _gererEtats }
  ]);
}

// ================================================================
// Gestion des Relations
// ================================================================

function _gererRelations() {
  const amis   = _personnage.amis;
  const rivaux = _personnage.rivaux;

  narrerFrais(
    `Relations actuelles. ` +
    (amis.length > 0 ? `Amis : ${amis.join(', ')}.` : 'Aucun ami.') + ' ' +
    (rivaux.length > 0 ? `Rivaux : ${rivaux.join(', ')}.` : 'Aucun rival.') + ' ' +
    'Maximum : 2 amis et 1 rival. Les relations ne changent qu\'en fin de session.'
  );

  afficherActions([
    { label: 'Retour au jeu', action: _afficherMenuJeu }
  ]);
}

// ================================================================
// Progression
// ================================================================

function _prendreProgression() {
  if (_personnage.experience < 4) {
    alerter('Vous n\'avez pas encore 4 points d\'Expérience.');
    _afficherMenuJeu();
    return;
  }

  narrerFrais('Vous prenez une Progression. Choisissez :');

  const peuAmeliorerTrait = _personnage.progressions.traitsAmeliores < 2;
  const peutPrendreDeuxiemeMatiere = !_personnage.progressions.deuxiemeMatiere;

  afficherActions([
    ...(peuAmeliorerTrait ? [{
      label: 'Améliorer un trait de plus 1 (maximum plus 3, au plus 2 fois au total)',
      action: _choisirTraitAAmeliorer
    }] : []),
    ...(peutPrendreDeuxiemeMatiere ? [{
      label: 'Obtenir une deuxième Matière Préférée (une seule fois)',
      action: _choisirDeuxiemeMatiere
    }] : []),
    {
      label: 'Apprendre un nouveau sort de votre Année',
      action: _apprendreSortProgression
    },
    {
      label: 'Acquérir un objet magique',
      action: () => {
        narrer('Vous acquérez un objet magique.');
        demanderTexte({
          question: 'Quel est le nom de votre objet magique ?',
          exemple: "une Cape d'invisibilité",
          onAnnuler: _prendreProgression,
          onValider: (val) => {
            _personnage.objetsMagiques.push(val);
            _personnage.experience = 0;
            alerter(`Objet acquis : ${val}. Expérience remise à zéro.`);
            mettreAJourFiche(_personnage);
            sauvegarder({ personnage: _personnage });
            _afficherMenuJeu();
          }
        });
      }
    },
    {
      label: `Récupérer 1 point de Chance (actuellement : ${_personnage.chance} sur 3)`,
      action: () => {
        _personnage.experience = 0;
        _personnage.chance = Math.min(3, _personnage.chance + 1);
        alerter(`Chance récupérée. Chance : ${_personnage.chance} sur 3. Expérience remise à zéro.`);
        mettreAJourFiche(_personnage);
        sauvegarder({ personnage: _personnage });
        _afficherMenuJeu();
      }
    }
  ]);
}

function _choisirTraitAAmeliorer() {
  narrer('Quel trait voulez-vous améliorer ? (Maximum plus 3)');
  const traitsMeliorables = Object.entries(NOMS_TRAITS)
    .filter(([cle]) => _personnage.traits[cle] < 3);

  afficherActions([
    ...traitsMeliorables.map(([cle, nom]) => ({
      label: `${nom} : ${_signeParle(_personnage.traits[cle])} → ${_signeParle(_personnage.traits[cle] + 1)}`,
      action: () => {
        _personnage.traits[cle]++;
        _personnage.progressions.traitsAmeliores++;
        _personnage.experience = 0;
        alerter(`${nom} amélioré à ${_signeParle(_personnage.traits[cle])}. Expérience remise à zéro.`);
        mettreAJourFiche(_personnage);
        sauvegarder({ personnage: _personnage });
        _afficherMenuJeu();
      }
    })),
    { label: 'Annuler', action: _prendreProgression }
  ]);
}

function _choisirDeuxiemeMatiere() {
  narrer('Choisissez votre deuxième Matière Préférée parmi celles que vous n\'avez pas déjà.');
  // Import dynamique pour éviter la circularité avec tables.json
  fetch('data/tables.json')
    .then(r => r.json())
    .then(tables => {
      const toutesLesMatières = [
        ...Object.values(tables.matieres_fondamentales),
        ...Object.values(tables.matieres_options)
      ].filter(m => !_personnage.matieresPreferees.includes(m));

      afficherActions([
        ...toutesLesMatières.map(m => ({
          label: m,
          action: () => {
            _personnage.matieresPreferees.push(m);
            _personnage.progressions.deuxiemeMatiere = true;
            _personnage.experience = 0;
            alerter(`Deuxième Matière Préférée : ${m}. Expérience remise à zéro.`);
            mettreAJourFiche(_personnage);
            sauvegarder({ personnage: _personnage });
            _afficherMenuJeu();
          }
        })),
        { label: 'Annuler', action: _prendreProgression }
      ]);
    });
}

function _apprendreSortProgression() {
  const annee = Math.min(_personnage.annee, 7);
  fetch('data/spells.json')
    .then(r => r.json())
    .then(sorts => {
      const connusNoms = _personnage.sorts.map(s => s.nom);
      const disponibles = (sorts.annees[String(annee)] ?? [])
        .filter(s => !connusNoms.includes(s.nom));

      if (disponibles.length === 0) {
        alerter('Vous connaissez déjà tous les sorts de votre Année.');
        _prendreProgression();
        return;
      }

      narrer('Choisissez un sort à apprendre :');
      afficherActions([
        ...disponibles.map(s => ({
          label: `${s.nom} — ${s.description}`,
          action: () => {
            _personnage.sorts.push(s);
            _personnage.experience = 0;
            alerter(`Sort appris : ${s.nom}. Expérience remise à zéro.`);
            mettreAJourFiche(_personnage);
            sauvegarder({ personnage: _personnage });
            _afficherMenuJeu();
          }
        })),
        { label: 'Annuler', action: _prendreProgression }
      ]);
    });
}

// ================================================================
// Fin de session
// ================================================================

function _finSession() {
  narrerFrais(
    'Fin de session. ' +
    'C\'est le moment de mettre à jour vos Amis et Rivaux : vous pouvez en ajouter ou en retirer un. ' +
    'Si vous avez 4 points d\'Expérience, vous pouvez prendre une Progression. ' +
    'Avez-vous complété une année scolaire ? Si oui, vous gagnez automatiquement une Progression.'
  );

  afficherActions([
    {
      label: 'Mettre à jour un Ami',
      action: () => _mettreAJourRelation('ami')
    },
    {
      label: 'Mettre à jour un Rival',
      action: () => _mettreAJourRelation('rival')
    },
    ..._personnage.experience >= 4 ? [{
      label: 'Prendre une Progression (4 XP disponibles)',
      action: _prendreProgression
    }] : [],
    {
      label: 'Sauvegarder et continuer plus tard',
      action: () => {
        sauvegarder({ personnage: _personnage });
        alerter('Partie sauvegardée. À bientôt à Poudlard.');
        _onRetourMenu?.();
      }
    },
    { label: 'Retour au jeu', action: _afficherMenuJeu }
  ]);
}

function _mettreAJourRelation(type) {
  const liste = type === 'ami' ? _personnage.amis : _personnage.rivaux;
  const max   = type === 'ami' ? 2 : 1;

  narrer(
    `${type === 'ami' ? 'Amis' : 'Rival'} actuel${liste.length > 1 ? 's' : ''} : ` +
    (liste.length > 0 ? liste.join(', ') : 'aucun') + `. Maximum : ${max}.`
  );

  const actions = [];

  if (liste.length < max) {
    actions.push({
      label: `Ajouter un ${type}`,
      action: () => {
        demanderTexte({
          question: `Nom du nouvel ${type === 'ami' ? 'ami' : 'rival'} ?`,
          onAnnuler: () => _mettreAJourRelation(type),
          onValider: (val) => {
            liste.push(val);
            alerter(`${type === 'ami' ? 'Ami' : 'Rival'} ajouté : ${val}.`);
            mettreAJourFiche(_personnage);
            sauvegarder({ personnage: _personnage });
            _finSession();
          }
        });
      }
    });
  }

  if (liste.length > 0) {
    actions.push({
      label: `Retirer un ${type}`,
      action: () => {
        narrer(`Quel ${type} voulez-vous retirer ?`);
        afficherActions([
          ...liste.map((nom, i) => ({
            label: nom,
            action: () => {
              liste.splice(i, 1);
              alerter(`${nom} retiré de vos ${type === 'ami' ? 'amis' : 'rivaux'}.`);
              sauvegarder({ personnage: _personnage });
              _finSession();
            }
          })),
          { label: 'Annuler', action: () => _mettreAJourRelation(type) }
        ]);
      }
    });
  }

  actions.push({ label: 'Retour à la fin de session', action: _finSession });
  afficherActions(actions);
}

// ---- Helper ----

function _signeParle(val) {
  if (val === -99) return 'Inconscient';
  if (val === 0)   return 'zéro';
  if (val > 0)     return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}
