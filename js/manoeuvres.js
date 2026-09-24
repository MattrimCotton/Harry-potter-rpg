// Les 8 manœuvres de base — définition et résolution complète.

import { narrerFrais, narrer, alerter, statuer } from './narration.js';
import { afficherActions } from './actions.js';
import { lancerDes, SUCCES_COMPLET, SUCCES_PARTIEL, ECHEC } from './des.js';
import { traitEffectif, NOMS_TRAITS } from './personnage.js';

// ================================================================
// Catalogue des manœuvres
// ================================================================

export const MANOEUVRES = [
  {
    id: 'faire-face',
    nom: 'Faire Face au Danger',
    trait: 'bravoure',
    description: 'Affronter un danger physique ou autre. Tenir bon face à une menace.',
    options10: [
      'Vous tenez bon et personne n\'est blessé.',
      'Vous repoussez la menace sans vous faire toucher.'
    ],
    options79: [
      'Vous blessez la menace, mais elle vous touche aussi.',
      'Vous ne pouvez pas agir, mais la menace recule.',
      'Vous évitez les Conséquences Graves, mais quelqu\'un d\'autre en subit.',
      'Vous évitez les Conséquences Graves, mais vous laissez une trace ou des preuves.'
    ],
    mode10: 'choisir-un',
    mode79: 'choisir-un'
  },
  {
    id: 'acquerir-connaissance',
    nom: 'Acquérir des Connaissances',
    trait: 'intellect',
    description: 'Apprendre quelque chose sur une personne, un objet, une situation ou un lieu.',
    questions10: [
      'Qu\'est-ce qui ne va pas ici ?',
      'Où est ce que je cherche ?',
      'Quelle est l\'histoire de cet objet ou lieu ?',
      'Comment puis-je utiliser ceci à mon avantage ?',
      'Cette personne dit-elle la vérité ?',
      'Que veut vraiment cette personne ?',
      'Que puis-je me rappeler à ce sujet ?'
    ],
    options10: null,
    options79: null,
    mode10: 'question',
    mode79: 'question-partielle'
  },
  {
    id: 'cacher-faufiler',
    nom: 'Se Cacher et se Faufiler',
    trait: 'ruse',
    description: 'Se déplacer sans être vu, dissimuler quelque chose ou quelqu\'un.',
    options10: null,
    options79: [
      'Quelqu\'un vous cherche activement.',
      'Quelqu\'un sait que vous êtes là, mais pas où exactement.',
      'Vous laissez une trace ou une preuve de votre passage.'
    ],
    mode10: 'succes-total',
    mode79: 'choisir-un'
  },
  {
    id: 'obtenir',
    nom: 'Obtenir ce que l\'on Cherche',
    trait: null,
    traitHonnete: 'bravoure',
    traitRuse: 'ruse',
    description: 'Obtenir un objet ou convaincre quelqu\'un. Par l\'honnêteté : Bravoure. Par la tromperie : Ruse.',
    options10: null,
    options79: [
      'La personne devient méfiante envers vous.',
      'Vous devez donner quelque chose en retour.',
      'La personne change d\'attitude à votre égard.'
    ],
    mode10: 'succes-total',
    mode79: 'choisir-un'
  },
  {
    id: 'aider-entraver',
    nom: 'Aider ou Entraver quelqu\'un',
    trait: 'loyaute',
    description: 'Aider ou gêner un autre personnage. Un Ami ou un Rival donne plus 1 au jet.',
    options10: [
      'Donnez plus 1 ou moins 1 à leur prochain jet.',
      'Empêchez-les de prendre un État.',
      'Offrez-leur 1 point d\'Expérience pour qu\'ils arrêtent ce qu\'ils font.'
    ],
    options79: [
      'Vous aidez ou entravez, mais vous prenez un État.',
      'Vous aidez ou entravez, mais vous les blessez accidentellement.',
      'Vous aidez ou entravez, mais ils vous en veulent.',
      'Vous aidez ou entravez, mais ils se méfient de vos intentions.'
    ],
    mode10: 'choisir-un',
    mode79: 'choisir-un'
  },
  {
    id: 'lancer-sort',
    nom: 'Lancer un Sort ou Dueller',
    trait: 'magie',
    description: 'Utiliser la magie offensive, défensive ou utilitaire. Vous devez connaître le sort.',
    options10: null,
    options79: [
      'Le sort fonctionne, mais vous prenez l\'État Ensorcelé.',
      'Le sort fonctionne, mais quelqu\'un d\'autre est touché accidentellement.',
      'Le sort fonctionne de façon imparfaite — effet réduit ou inattendu.',
      'Le sort fonctionne, mais votre baguette est endommagée ou épuisée.'
    ],
    mode10: 'succes-total',
    mode79: 'choisir-un',
    necessite_sort: true
  },
  {
    id: 'preparer-potion',
    nom: 'Préparer une Potion',
    trait: 'magie',
    description: 'Préparer une potion. Vous devez connaître la recette et avoir les ingrédients.',
    options10: null,
    options79: [
      'La potion est prête mais moins puissante qu\'attendu.',
      'La potion est prête mais elle a un effet secondaire inattendu.',
      'La potion prend plus de temps que prévu.',
      'Vous gaspillez des ingrédients rares dans le processus.'
    ],
    mode10: 'succes-total',
    mode79: 'choisir-un',
    necessite_sort: true
  },
  {
    id: 'objet-magique',
    nom: 'Utiliser un Objet Magique',
    trait: 'magie',
    description: 'Activer ou manier un objet à propriétés magiques.',
    options10: null,
    options79: [
      'L\'objet fonctionne, mais il perd une charge ou se détériore.',
      'L\'objet fonctionne, mais produit un effet secondaire étrange.',
      'L\'objet fonctionne, mais attire l\'attention indésirable.',
      'L\'objet fonctionne partiellement — vous devez réessayer.'
    ],
    mode10: 'succes-total',
    mode79: 'choisir-un'
  }
];

// ================================================================
// Résolution d'une manœuvre
// ================================================================

// onFin({ niveau, personnage }) est appelé une fois les choix faits.
export function resoudreManoeuvre(manoeuvre, personnage, onFin) {
  // Cas spécial : Obtenir — choisir d'abord honnête ou ruse
  if (manoeuvre.id === 'obtenir') {
    _choisirApproche(manoeuvre, personnage, onFin);
    return;
  }

  const nomTrait  = manoeuvre.trait;
  const valTrait  = traitEffectif(personnage, nomTrait);
  const labelTrait = NOMS_TRAITS[nomTrait];

  // Vérifier l'inconscience
  if (valTrait === -99) {
    alerter('Vous êtes Inconscient. Vous ne pouvez pas agir.');
    onFin({ niveau: ECHEC, personnage });
    return;
  }

  narrer(`${manoeuvre.nom}. Jet de ${labelTrait}. Valeur : ${_signeParle(valTrait)}.`);

  // Option : dépenser la Chance avant de lancer
  const actionsDAvant = [
    {
      label: `Lancer ${labelTrait} (${_signeParle(valTrait)})`,
      action: () => _effectuerJet(manoeuvre, personnage, nomTrait, valTrait, onFin)
    }
  ];

  if (personnage.chance > 0) {
    actionsDAvant.push({
      label: `Dépenser 1 point de Chance pour un succès complet automatique (Chance restante : ${personnage.chance})`,
      action: () => {
        personnage.chance--;
        alerter(`Chance dépensée. Reste : ${personnage.chance} sur 3. Succès complet automatique.`);
        _presenterResultat(manoeuvre, { niveau: SUCCES_COMPLET, total: 10 }, personnage, onFin);
      }
    });
  }

  afficherActions(actionsDAvant);
}

// ================================================================
// Interne
// ================================================================

function _choisirApproche(manoeuvre, personnage, onFin) {
  narrer('Obtenir ce que l\'on Cherche. Par quel moyen ?');
  afficherActions([
    {
      label: `Par l'honnêteté ou le charisme (Bravoure : ${_signeParle(traitEffectif(personnage, 'bravoure'))})`,
      action: () => {
        const val = traitEffectif(personnage, 'bravoure');
        _effectuerJet({ ...manoeuvre, trait: 'bravoure' }, personnage, 'bravoure', val, onFin);
      }
    },
    {
      label: `Par la tromperie ou le vol (Ruse : ${_signeParle(traitEffectif(personnage, 'ruse'))})`,
      action: () => {
        const val = traitEffectif(personnage, 'ruse');
        _effectuerJet({ ...manoeuvre, trait: 'ruse' }, personnage, 'ruse', val, onFin);
      }
    }
  ]);
}

function _effectuerJet(manoeuvre, personnage, nomTrait, valTrait, onFin) {
  const resultat = lancerDes(valTrait, NOMS_TRAITS[nomTrait]);
  _presenterResultat(manoeuvre, resultat, personnage, onFin);
}

function _presenterResultat(manoeuvre, resultat, personnage, onFin) {
  const { niveau, total } = resultat;

  if (niveau === SUCCES_COMPLET) {
    _succes10(manoeuvre, personnage, onFin);
  } else if (niveau === SUCCES_PARTIEL) {
    _succes79(manoeuvre, personnage, onFin);
  } else {
    _echec6(manoeuvre, personnage, onFin);
  }
}

function _succes10(manoeuvre, personnage, onFin) {
  switch (manoeuvre.mode10) {
    case 'succes-total':
      narrer('Succès complet. Vous obtenez exactement ce que vous vouliez, sans compromis.');
      _proposeRelancerOuContinuer(onFin, SUCCES_COMPLET, personnage);
      break;

    case 'choisir-un':
      narrer('Succès complet. Choisissez un avantage :');
      afficherActions(manoeuvre.options10.map(opt => ({
        label: opt,
        action: () => {
          alerter(`Vous choisissez : ${opt}`);
          _proposeRelancerOuContinuer(onFin, SUCCES_COMPLET, personnage);
        }
      })));
      break;

    case 'question':
    case 'question-partielle':
      narrer(
        'Succès complet. Vous obtenez l\'information. ' +
        'Choisissez une question à poser. En mode solo, vous y répondez vous-même ' +
        'en vous basant sur le contexte de la scène.'
      );
      afficherActions(manoeuvre.questions10.map(q => ({
        label: q,
        action: () => {
          alerter(`Question posée : "${q}" La réponse doit être vraie et utile.`);
          _proposeRelancerOuContinuer(onFin, SUCCES_COMPLET, personnage);
        }
      })));
      break;
  }
}

function _succes79(manoeuvre, personnage, onFin) {
  switch (manoeuvre.mode79) {
    case 'choisir-un':
      narrer('Succès partiel. Vous y arrivez, mais avec un coût. Choisissez ce qui se passe :');
      afficherActions([
        ...manoeuvre.options79.map(opt => ({
          label: opt,
          action: () => {
            alerter(`Coût choisi : ${opt}`);
            _proposeRelancerOuContinuer(onFin, SUCCES_PARTIEL, personnage);
          }
        })),
        ...(personnage.chance > 0 ? [{
          label: `Dépenser 1 point de Chance pour éviter tout coût (Chance : ${personnage.chance})`,
          action: () => {
            personnage.chance--;
            alerter(`Chance dépensée. Reste : ${personnage.chance}. Succès complet, pas de coût.`);
            _proposeRelancerOuContinuer(onFin, SUCCES_COMPLET, personnage);
          }
        }] : [])
      ]);
      break;

    case 'question-partielle':
      narrer(
        'Succès partiel. Vous obtenez une information partielle. ' +
        'Choisissez une question. En mode solo, la réponse est vraie mais incomplète.'
      );
      afficherActions(manoeuvre.questions10.map(q => ({
        label: q,
        action: () => {
          alerter(`Question posée : "${q}" La réponse est vraie mais le Narrateur n'a pas à tout révéler.`);
          _proposeRelancerOuContinuer(onFin, SUCCES_PARTIEL, personnage);
        }
      })));
      break;
  }
}

function _echec6(manoeuvre, personnage, onFin) {
  personnage.experience++;
  const versProgression = 4 - personnage.experience;

  let msg = `Échec. Vous marquez 1 point d'Expérience. Total : ${personnage.experience} sur 4. `;
  if (personnage.experience >= 4) {
    msg += 'Vous pouvez prendre une Progression !';
  } else {
    msg += `Encore ${versProgression} point${versProgression > 1 ? 's' : ''} pour une Progression.`;
  }
  msg += ' Le Narrateur peut annoncer une Conséquence Grave.';

  alerter(msg);

  const actions = [];

  if (personnage.chance > 0) {
    actions.push({
      label: `Dépenser 1 point de Chance pour transformer l'échec en succès complet (Chance : ${personnage.chance})`,
      action: () => {
        personnage.experience = Math.max(0, personnage.experience - 1); // annuler le XP gagné
        personnage.chance--;
        alerter(`Chance dépensée. Reste : ${personnage.chance}. L'échec devient un succès complet. Expérience annulée.`);
        _presenterResultat(manoeuvre, { niveau: SUCCES_COMPLET, total: 10 }, personnage, onFin);
      }
    });
  }

  actions.push({
    label: 'Continuer — subir la Conséquence Grave et avancer',
    action: () => onFin({ niveau: ECHEC, personnage })
  });

  afficherActions(actions);
}

function _proposeRelancerOuContinuer(onFin, niveau, personnage) {
  onFin({ niveau, personnage });
}

// ---- Helpers ----

function _signeParle(val) {
  if (val === -99) return 'Inconscient';
  if (val === 0)   return 'zéro';
  if (val > 0)     return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}
