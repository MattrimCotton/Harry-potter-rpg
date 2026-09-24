// État du personnage joueur — structure de données et helpers.

export function creerPersonnageVide() {
  return {
    // Identité
    prenom:  '',
    nom:     '',
    annee:   1,
    maison:  '',
    origine: '', // 'ne-moldu' | 'demi-sang' | 'sang-pur'

    // Apparence (cosmétique, pas d'impact mécanique)
    teint:      '',
    cheveux:    '',
    silhouette: '',

    // Baguette
    baguette: { bois: '', coeur: '', aspect: '' },
    ambition: '',

    // Patronus
    patronus: '',

    // Animal de compagnie
    animal: { type: '', nom: '' },

    // Traits (valeurs : -1, 0, +1, +1, +2 répartis)
    traits: {
      bravoure:  0,
      ruse:      0,
      intellect: 0,
      loyaute:   0,
      magie:     0
    },

    // Matières préférées (max 2 après progression)
    matieresPreferees: [],

    // Sorts connus — [{ nom, description, annee, type }]
    sorts: [],

    // Objets magiques
    objetsMagiques: [],

    // Relations
    amis:   [], // max 2
    rivaux: [], // max 1

    // Ressources
    chance:     3,
    experience: 0,

    // États (Conditions) — tous désactivés par défaut
    etats: [
      { id: 'apeure',      nom: 'Apeuré',      trait: 'bravoure',  malus: -2, actif: false },
      { id: 'furieux',     nom: 'Furieux',      trait: 'ruse',      malus: -2, actif: false },
      { id: 'stresse',     nom: 'Stressé',      trait: 'intellect', malus: -2, actif: false },
      { id: 'jaloux',      nom: 'Jaloux',       trait: 'loyaute',   malus: -2, actif: false },
      { id: 'gene',        nom: 'Gêné',         trait: 'magie',     malus: -2, actif: false },
      { id: 'blesse',      nom: 'Blessé',       trait: 'tous',      malus: -1, actif: false },
      { id: 'ensorcele',   nom: 'Ensorcelé',    trait: 'choix',     malus: -1, actif: false },
      { id: 'inconscient', nom: 'Inconscient',  trait: 'tous',      malus: -99, actif: false }
    ],

    // Cicatrices (séquelles après retour d'inconscience)
    cicatrices: [],

    // Compteurs de progressions limitées
    progressions: {
      traitsAmeliores:     0, // max 2 fois (jamais plus de +3)
      deuxiemeMatiere:     false
    }
  };
}

// Retourne la valeur effective d'un trait, malus d'états inclus.
export function traitEffectif(personnage, nomTrait) {
  const etat = personnage.etats;

  if (etat.find(e => e.id === 'inconscient' && e.actif)) return -99;

  const base = personnage.traits[nomTrait] ?? 0;

  // Malus spécifique au trait
  const etatDuTrait = etat.find(e => e.trait === nomTrait && e.actif);
  const malusTrait  = etatDuTrait ? etatDuTrait.malus : 0;

  // Malus "Blessé" (-1 à tous les traits)
  const malusBlesse = etat.find(e => e.id === 'blesse' && e.actif) ? -1 : 0;

  return base + malusTrait + malusBlesse;
}

// Retourne le trait le plus élevé (pour le jet de survie quand tous les états sont cochés).
export function traitLePlusEleve(personnage) {
  const traits = personnage.traits;
  return Math.max(traits.bravoure, traits.ruse, traits.intellect, traits.loyaute, traits.magie);
}

// Vérifie si les 8 états sont actifs.
export function tousEtatsActifs(personnage) {
  return personnage.etats.every(e => e.actif);
}

// Applique l'expérience d'origine au personnage.
export function appliquerOrigine(personnage) {
  const xpParOrigine = {
    'ne-moldu':  3,
    'demi-sang': 2,
    'sang-pur':  1
  };
  personnage.experience = xpParOrigine[personnage.origine] ?? 0;
}

// Applique le bonus de maison (+1 au trait correspondant).
export function appliquerMaison(personnage) {
  const bonusMaison = {
    'Gryffondor':  'bravoure',
    'Poufsouffle': 'loyaute',
    'Serdaigle':   'intellect',
    'Serpentard':  'ruse'
  };
  const trait = bonusMaison[personnage.maison];
  if (trait) personnage.traits[trait] = Math.min(3, personnage.traits[trait] + 1);
}

// Noms lisibles des traits.
export const NOMS_TRAITS = {
  bravoure:  'Bravoure',
  ruse:      'Ruse',
  intellect: 'Intellect',
  loyaute:   'Loyauté',
  magie:     'Magie'
};
