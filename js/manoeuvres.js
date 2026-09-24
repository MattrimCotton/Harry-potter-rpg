// Les manœuvres de base et magiques — définition et résolution complète.
// Textes alignés sur Hogwarts: An RPG v1.2 (voir memory/game-rules.md).
//
// Une option peut être une chaîne, ou { texte, etat: true } quand elle
// fait prendre un État : le joueur choisit alors lequel cocher.

import { narrer, alerter } from './narration.js';
import { afficherActions } from './actions.js';
import { lancerDes, SUCCES_COMPLET, SUCCES_PARTIEL, ECHEC } from './des.js';
import { traitEffectif, NOMS_TRAITS } from './personnage.js';

const TOUS_LES_TRAITS = Object.keys(NOMS_TRAITS);

// ================================================================
// Catalogue des manœuvres
// ================================================================

export const MANOEUVRES = [
  {
    id: 'faire-face',
    nom: 'Faire Face au Danger',
    traits: ['bravoure'],
    description: 'Affronter un danger, physique ou non.',
    options10: [
      'Vous tenez bon et personne n\'est blessé.',
      'Vous n\'êtes pas blessé, et vous blessez la menace en retour.'
    ],
    options79: [
      { texte: 'Vous blessez la menace, mais elle vous blesse aussi.', etat: true },
      'Vous ne pouvez pas agir, mais la menace recule.',
      'Vous fuyez, sans subir de Conséquence Grave.',
      'Vous évitez la Conséquence Grave, mais quelqu\'un d\'autre la subit.'
    ],
    texte6: 'Vous n\'arrivez pas à faire face au danger.'
  },
  {
    id: 'acquerir-connaissance',
    nom: 'Acquérir des Connaissances',
    traits: ['intellect'],
    description: 'Apprendre quelque chose sur une personne, un objet, une situation ou un lieu, par une conversation, un document ou votre mémoire.',
    questions: [
      'Qu\'est-ce qui n\'est pas ce qu\'il paraît ici ?',
      'Où est ce que je cherche ?',
      'Quelle est l\'histoire de ceci ?',
      'Comment puis-je m\'en servir ?',
      'Cette personne dit-elle la vérité ?',
      'Que veut vraiment cette personne ?',
      'De quoi est-ce que je me souviens à ce sujet ?'
    ],
    texte10: 'Vous obtenez l\'information voulue. Posez une question : la réponse sera vraie et complète.',
    texte79: 'Vous obtenez une partie de l\'information. Posez une question : la réponse sera vraie, mais peut-être incomplète.',
    texte6:  'Vous n\'êtes pas sûr de ce que vous avez appris. Vous pouvez poser une question, mais la réponse peut être incomplète, ou fausse.'
  },
  {
    id: 'cacher-faufiler',
    nom: 'Se Cacher et se Faufiler',
    traits: ['ruse'],
    description: 'Vous cacher, cacher quelque chose, ou vous déplacer sans être remarqué.',
    texte10: 'Personne ne vous remarque, ni vous ni ce que vous cachez.',
    options79: [
      'Quelqu\'un ou quelque chose vous cherche, ou cherche ce que vous avez caché.',
      'Quelqu\'un sait que vous êtes là, ou que vous avez caché quelque chose, mais pas où.',
      'Vous laissez une trace ou une preuve derrière vous.'
    ],
    texte6: 'Vous êtes découvert, ou ce que vous cachiez est trouvé.'
  },
  {
    id: 'obtenir',
    nom: 'Obtenir ce que l\'on Cherche',
    traits: ['bravoure', 'ruse'],
    libellesTraits: {
      bravoure: 'Par l\'honnêteté, la négociation, le charisme ou l\'humilité',
      ruse:     'Par la ruse, la tricherie ou le vol'
    },
    description: 'Obtenir un objet, ou convaincre quelqu\'un de faire ou de penser quelque chose.',
    texte10: 'Vous obtenez ce que vous vouliez, sans problème.',
    options79: [
      'Vous l\'obtenez, mais la personne devient méfiante.',
      'Vous l\'obtenez, mais vous devez donner ou promettre quelque chose en retour.',
      'Vous l\'obtenez, mais l\'attitude de la personne envers vous change.'
    ],
    texte6: 'Vous n\'obtenez pas ce que vous vouliez.'
  },
  {
    id: 'aider-entraver',
    nom: 'Aider ou Entraver quelqu\'un',
    traits: ['loyaute'],
    bonusRelation: true,
    description: 'Aider, défendre ou soutenir quelqu\'un, ou au contraire le gêner. Plus 1 si c\'est un Ami ou un Rival.',
    texte10: 'Vous aidez ou entravez la personne comme vous le vouliez.',
    options79: [
      { texte: 'Vous y arrivez, mais vous prenez un État dans l\'effort.', etat: true },
      'Vous y arrivez, mais la personne est blessée par accident.',
      'Vous y arrivez, mais la personne vous en veut.',
      'Vous y arrivez, mais la personne se méfie de vos intentions.'
    ],
    texte6: 'Vous n\'arrivez ni à l\'aider ni à l\'entraver.'
  },
  {
    id: 'approcher-creature',
    nom: 'Approcher une Créature Magique',
    traits: ['loyaute'],
    description: 'Apprivoiser, aider ou obtenir l\'aide d\'une créature magique.',
    texte10: 'La créature agit comme vous le voulez.',
    options79: [
      { texte: 'La créature obéit, mais vous prenez un État dans l\'effort.', etat: true },
      'La créature obéit, mais cela attire une attention indésirable.',
      'La créature n\'obéit pas, mais elle fait autre chose d\'utile.'
    ],
    texte6: 'La créature s\'emballe.'
  },
  {
    id: 'lancer-sort',
    nom: 'Lancer un Sort',
    traits: ['magie'],
    prealable: 'sort',
    description: 'Dire la formule et agiter la baguette. Un sort inconnu coûte 1 point de Chance.',
    texte10: 'Le sort fonctionne exactement comme vous le vouliez.',
    options79: [
      'Le sort fonctionne, mais son effet est moins puissant que prévu.',
      'Le sort fonctionne, mais son effet dure moins longtemps que prévu.',
      'Le sort fonctionne, mais vous attirez une attention indésirable.'
    ],
    texte6: 'Le sort échoue.'
  },
  {
    id: 'dueller',
    nom: 'Dueller',
    traits: ['magie'],
    prealable: 'sort',
    consequenceObligatoire: true,
    description: 'Échanger des sorts avec un autre sorcier. Si votre sort est défensif ou de soin, « toucher » veut dire bloquer ou réussir.',
    texte10: 'Votre sort touche votre adversaire, et le sien vous rate !',
    options79: [
      'Vos deux sorts se percutent en plein vol !',
      'Votre sort rate, mais le sien aussi.',
      'Les deux sorts touchent !'
    ],
    texte6: 'Votre sort rate, et le sien vous touche !'
  },
  {
    id: 'preparer-potion',
    nom: 'Préparer une Potion',
    traits: ['magie'],
    prealable: 'potion',
    description: 'Il faut les ingrédients, de quoi les assembler et une baguette. Une potion inconnue coûte 1 point de Chance.',
    texte10: 'Vous préparez correctement la potion voulue.',
    options79: [
      'La potion est prête, mais elle a un effet secondaire imprévu.',
      { texte: 'La préparation tourne mal et vous prenez un État.', etat: true },
      'Vous préparez par erreur une autre potion. Le Narrateur dit laquelle.'
    ],
    texte6: 'La potion est ratée.'
  },
  {
    id: 'objet-magique',
    nom: 'Utiliser un Objet Magique',
    traits: ['magie'],
    description: 'Activer ou manier un objet aux propriétés magiques.',
    texte10: 'L\'objet fonctionne exactement comme prévu, et vous en tirez le meilleur parti.',
    options79: [
      'L\'objet fait quelque chose d\'inattendu, mais d\'utile.',
      'L\'effet de l\'objet est moins puissant que prévu.',
      { texte: 'L\'objet fonctionne, mais vous prenez un État en l\'utilisant.', etat: true },
      'L\'objet fonctionne, mais il se casse.'
    ],
    texte6: 'L\'objet ne fonctionne pas correctement.'
  },
  {
    id: 'jet',
    nom: 'Jet libre',
    traits: TOUS_LES_TRAITS,
    description: 'Quand aucune autre manœuvre ne convient. Choisissez le trait qui correspond le mieux à ce que vous faites.',
    texte10: 'Vous y arrivez sans problème. Génial !',
    texte79: 'Vous y arrivez, mais cela a un coût. Décidez lequel en fonction de la scène.',
    texte6:  'Vous n\'y arrivez pas, et la situation empire.'
  }
];

// ================================================================
// Résolution d'une manœuvre
// ================================================================

// onFin({ niveau, personnage }) est appelé une fois les choix faits.
// onAnnuler() est appelé si le joueur revient en arrière avant le jet.
export function resoudreManoeuvre(manoeuvre, personnage, onFin, onAnnuler) {
  if (personnage.etats.some(e => e.id === 'inconscient' && e.actif)) {
    alerter('Vous êtes Inconscient. Vous ne pouvez pas agir avant d\'être ranimé.');
    onFin({ niveau: ECHEC, personnage, sansJet: true });
    return;
  }

  const ctx = { manoeuvre, personnage, onFin, onAnnuler };

  if (manoeuvre.traits.length > 1) {
    _choisirTrait(ctx);
  } else {
    ctx.trait = manoeuvre.traits[0];
    _etapePrealable(ctx);
  }
}

// ================================================================
// Avant le jet
// ================================================================

function _choisirTrait(ctx) {
  const { manoeuvre, personnage } = ctx;
  narrer(manoeuvre.id === 'obtenir' ? 'Par quel moyen ?' : 'Quel trait utilisez-vous ?');

  afficherActions([
    ...manoeuvre.traits.map(t => {
      const base = manoeuvre.libellesTraits?.[t];
      const val  = `${NOMS_TRAITS[t]} ${_signeParle(traitEffectif(personnage, t))}`;
      return {
        label: base ? `${base}. ${val}.` : `${val}.`,
        action: () => { ctx.trait = t; _etapePrealable(ctx); }
      };
    }),
    _actionAnnuler(ctx)
  ]);
}

// Sort ou potion : il faut le connaître, sinon dépenser 1 point de Chance.
function _etapePrealable(ctx) {
  const { manoeuvre, personnage } = ctx;
  if (!manoeuvre.prealable) { _menuDuJet(ctx); return; }

  const estPotion = manoeuvre.prealable === 'potion';
  const connus = personnage.sorts.filter(s => (s.type === 'potion') === estPotion);
  const mot    = estPotion ? 'potion' : 'sort';

  narrer(
    estPotion
      ? 'Quelle potion préparez-vous ?'
      : `Quel sort lancez-vous ? Vous en connaissez ${connus.length}.`
  );

  const actions = connus.map(s => ({
    label: `${s.nom}, ${s.description}.`,
    action: () => { alerter(`${estPotion ? 'Potion' : 'Sort'} : ${s.nom}.`); _menuDuJet(ctx); }
  }));

  actions.push({
    label: personnage.chance > 0
      ? `Un${estPotion ? 'e' : ''} ${mot} que vous ne connaissez pas. Coûte 1 point de Chance, il vous en reste ${personnage.chance}.`
      : `Un${estPotion ? 'e' : ''} ${mot} inconnu${estPotion ? 'e' : ''} : impossible, vous n'avez plus de Chance.`,
    desactive: personnage.chance <= 0,
    action: () => {
      personnage.chance--;
      alerter(`1 point de Chance dépensé. Il vous en reste ${personnage.chance} sur 3.`);
      _menuDuJet(ctx);
    }
  });

  actions.push(_actionAnnuler(ctx));
  afficherActions(actions);
}

// Dernier écran avant le jet : trait seul, ou avec un bonus de plus 1.
function _menuDuJet(ctx) {
  const { manoeuvre, personnage, trait } = ctx;
  const val = traitEffectif(personnage, trait);
  const nom = NOMS_TRAITS[trait];

  narrer(`Jet ${_de(nom)}${nom}, à ${_signeParle(val)}.`);

  const actions = [{
    label: `Lancer les dés, ${nom} ${_signeParle(val)}.`,
    action: () => _lancer(ctx, val, 0, null)
  }];

  for (const matiere of personnage.matieresPreferees ?? []) {
    actions.push({
      label: `Lancer avec plus 1, si ce jet concerne votre matière préférée, ${matiere}. Total ${_signeParle(val + 1)}.`,
      action: () => _lancer(ctx, val, 1, `bonus de matière préférée, ${matiere}`)
    });
  }

  if (manoeuvre.bonusRelation) {
    for (const nomAmi of personnage.amis ?? []) {
      actions.push({
        label: `Lancer avec plus 1, s'il s'agit de votre ami ${nomAmi}. Total ${_signeParle(val + 1)}.`,
        action: () => _lancer(ctx, val, 1, `bonus d'ami, ${nomAmi}`)
      });
    }
    for (const nomRival of personnage.rivaux ?? []) {
      actions.push({
        label: `Lancer avec plus 1, s'il s'agit de votre rival ${nomRival}. Total ${_signeParle(val + 1)}.`,
        action: () => _lancer(ctx, val, 1, `bonus de rival, ${nomRival}`)
      });
    }
  }

  actions.push(_actionAnnuler(ctx));
  afficherActions(actions);
}

function _lancer(ctx, valTrait, bonus, raisonBonus) {
  const resultat = lancerDes(valTrait, NOMS_TRAITS[ctx.trait], bonus, raisonBonus);
  if (resultat.niveau === SUCCES_COMPLET)      _succes10(ctx);
  else if (resultat.niveau === SUCCES_PARTIEL) _succes79(ctx);
  else                                         _echec6(ctx);
}

// ================================================================
// Résultats
// ================================================================

function _succes10(ctx) {
  const { manoeuvre } = ctx;

  if (manoeuvre.questions) {
    narrer(manoeuvre.texte10 + ' En solo, répondez-y vous-même d\'après la scène.');
    _choisirQuestion(ctx, SUCCES_COMPLET);
  } else if (manoeuvre.options10) {
    narrer('Choisissez ce qui se passe.');
    _choisirOption(ctx, manoeuvre.options10, SUCCES_COMPLET, []);
  } else {
    narrer(manoeuvre.texte10);
    _finir(ctx, SUCCES_COMPLET);
  }
}

function _succes79(ctx) {
  const { manoeuvre } = ctx;
  const chance = _actionChance(ctx, 'Dépenser 1 point de Chance pour obtenir un succès complet');

  if (manoeuvre.questions) {
    narrer(manoeuvre.texte79);
    _choisirQuestion(ctx, SUCCES_PARTIEL, chance);
  } else if (manoeuvre.options79) {
    narrer('Vous y arrivez, mais avec un coût. Choisissez ce qui se passe.');
    _choisirOption(ctx, manoeuvre.options79, SUCCES_PARTIEL, chance);
  } else {
    narrer(manoeuvre.texte79);
    afficherActions([
      { label: 'Accepter le coût et continuer.', action: () => _finir(ctx, SUCCES_PARTIEL) },
      ...chance
    ]);
  }
}

function _echec6(ctx) {
  const { manoeuvre, personnage } = ctx;
  personnage.experience++;

  const reste = 4 - personnage.experience;
  narrer(
    `${manoeuvre.texte6} Vous marquez 1 point d'Expérience, ${personnage.experience} sur 4. ` +
    (reste <= 0
      ? 'Vous pouvez prendre une Progression.'
      : `Encore ${reste} pour une Progression.`)
  );
  narrer(
    manoeuvre.consequenceObligatoire
      ? 'Le Narrateur vous inflige une Conséquence Grave.'
      : 'Le Narrateur peut vous infliger une Conséquence Grave.'
  );

  const chance = _actionChance(ctx, 'Dépenser 1 point de Chance pour transformer l\'échec en succès complet', () => {
    personnage.experience = Math.max(0, personnage.experience - 1);
  });

  if (manoeuvre.questions) {
    _choisirQuestion(ctx, ECHEC, chance);
    return;
  }

  afficherActions([
    { label: 'Accepter l\'échec et continuer.', action: () => _finir(ctx, ECHEC) },
    ...chance
  ]);
}

// ================================================================
// Choix après le jet
// ================================================================

function _choisirOption(ctx, options, niveau, extra) {
  afficherActions([
    ...options.map(opt => {
      const texte = typeof opt === 'string' ? opt : opt.texte;
      return {
        label: texte,
        action: () => {
          alerter(`Vous choisissez : ${texte}`);
          if (opt.etat) _prendreEtat(ctx, niveau);
          else          _finir(ctx, niveau);
        }
      };
    }),
    ...extra
  ]);
}

function _choisirQuestion(ctx, niveau, extra = []) {
  const avertissement = {
    [SUCCES_COMPLET]: 'La réponse doit être vraie et complète.',
    [SUCCES_PARTIEL]: 'La réponse est vraie, mais peut rester incomplète.',
    [ECHEC]:          'La réponse peut être incomplète, ou fausse.'
  }[niveau];

  afficherActions([
    ...ctx.manoeuvre.questions.map(q => ({
      label: q,
      action: () => {
        alerter(`Question posée : ${q} ${avertissement}`);
        _finir(ctx, niveau);
      }
    })),
    ...extra
  ]);
}

function _prendreEtat(ctx, niveau) {
  const libres = ctx.personnage.etats.filter(e => !e.actif && e.id !== 'inconscient');
  if (libres.length === 0) { _finir(ctx, niveau); return; }

  narrer('Quel État prenez-vous ?');
  afficherActions(libres.map(e => ({
    label: `${e.nom}, ${_effetEtat(e)}.`,
    action: () => {
      e.actif = true;
      alerter(`État ${e.nom} coché : ${_effetEtat(e)}.`);
      _finir(ctx, niveau);
    }
  })));
}

// Dépenser la Chance transforme le jet en 10 ou plus (règle de la Chance).
function _actionChance(ctx, label, avant) {
  const { personnage } = ctx;
  if (personnage.chance <= 0) return [];
  return [{
    label: `${label}. Il vous reste ${personnage.chance} point${personnage.chance > 1 ? 's' : ''} de Chance.`,
    action: () => {
      avant?.();
      personnage.chance--;
      alerter(`1 point de Chance dépensé, il vous en reste ${personnage.chance} sur 3. Le jet devient un succès complet.`);
      _succes10(ctx);
    }
  }];
}

function _actionAnnuler(ctx) {
  return {
    label: 'Annuler la manœuvre',
    retour: true,
    action: () => (ctx.onAnnuler ?? (() => ctx.onFin({ niveau: null, personnage: ctx.personnage, sansJet: true })))()
  };
}

function _finir(ctx, niveau) {
  ctx.onFin({ niveau, personnage: ctx.personnage });
}

// ---- Helpers ----

function _effetEtat(e) {
  if (e.id === 'ensorcele') return 'moins 1 à un trait choisi par le Narrateur';
  if (e.trait === 'tous')   return 'moins 1 à tous les traits';
  return `moins 2 en ${NOMS_TRAITS[e.trait]}`;
}

// « de » ou « d' » devant un nom de trait : Jet de Magie, Jet d'Intellect.
function _de(mot) {
  return /^[AEIOUYÉÈÊaeiouyéèê]/.test(mot) ? "d'" : 'de ';
}

function _signeParle(val) {
  if (val === 0) return 'zéro';
  if (val > 0)   return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}
