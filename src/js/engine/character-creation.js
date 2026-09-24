// Les 12 étapes de création de personnage.
// Chaque étape annonce ce qu'elle fait et propose des choix accessibles.

import { narrerFrais, narrer, alerter } from '../ui/narration.js';
import { afficherActions, demanderTexte } from '../ui/choices.js';
import { d6, deuxD6Independants } from '../rules/dice.js';
import { appliquerMaison, appliquerOrigine, NOMS_TRAITS } from '../rules/character.js';
import { mettreAJourFiche } from '../ui/character-sheet.js';

let _p       = null; // personnage en cours de création
let _tables  = null;
let _sorts   = null;
let _onFin   = null;

// ---- Lancement ----

export async function lancerCreation(personnage, onFin) {
  _p     = personnage;
  _onFin = onFin;

  const [tRes, sRes] = await Promise.all([
    fetch('data/tables.json'),
    fetch('data/spells.json')
  ]);
  _tables = await tRes.json();
  _sorts  = await sRes.json();

  _etape1_Annee();
}

// ================================================================
// Étape 1 — Quelle est votre année ?
// ================================================================
function _etape1_Annee() {
  narrerFrais(
    'Étape 1 sur 12 : Quelle est votre année à Poudlard ? ' +
    'Choisissez entre la 1ère et la 7ème Année, ou Diplômé pour jouer un personnage adulte.'
  );

  const annees = [1, 2, 3, 4, 5, 6, 7];
  const actions = annees.map(an => ({
    label: `${an}${an === 1 ? 'ère' : 'ème'} Année`,
    action: () => {
      _p.annee = an;
      alerter(`Vous êtes en ${an}${an === 1 ? 'ère' : 'ème'} Année.`);
      _etape2_Apparence_Teint();
    }
  }));

  actions.push({
    label: 'Diplômé',
    action: () => {
      _p.annee = 8;
      alerter('Vous êtes un sorcier diplômé. Vous connaissez tous les sorts.');
      _etape2_Apparence_Teint();
    }
  });

  afficherActions(actions);
}

// ================================================================
// Étape 2 — Apparence : Teint, Cheveux, Silhouette
// ================================================================
function _etape2_Apparence_Teint() {
  narrerFrais(
    'Étape 2 sur 12 : Votre apparence. D\'abord votre teint. ' +
    'Vous pouvez lancer le dé pour un résultat aléatoire, ou choisir vous-même.'
  );

  _choisirOuLancer(
    'Choisir un teint',
    _tables.teints,
    (val) => {
      _p.teint = val;
      _etape2b_Cheveux();
    }
  );
}

function _etape2b_Cheveux() {
  narrer('Vos cheveux. Lancer le dé ou choisir.');
  _choisirOuLancer(
    'Choisir une couleur de cheveux',
    _tables.cheveux,
    (val) => {
      _p.cheveux = val;
      _etape2c_Silhouette();
    }
  );
}

function _etape2c_Silhouette() {
  narrer('Votre silhouette. Lancer le dé ou choisir.');
  _choisirOuLancer(
    'Choisir une silhouette',
    _tables.silhouettes,
    (val) => {
      _p.silhouette = val;
      _etape3_Baguette();
    }
  );
}

// ================================================================
// Étape 3 — Baguette et Ambition
// ================================================================
function _etape3_Baguette() {
  narrerFrais(
    'Étape 3 sur 12 : Votre baguette et votre ambition. ' +
    'Votre baguette révèle votre personnalité. Commençons par le bois.'
  );
  _choisirOuLancer(
    'Choisir un bois de baguette',
    _tables.bois_baguette,
    (val) => {
      _p.baguette.bois = val;
      _etape3b_Coeur();
    }
  );
}

function _etape3b_Coeur() {
  narrer('Le cœur de votre baguette. Lancez le dé : 1-2 pour Dragon, 3-4 pour Phénix, 5-6 pour Licorne.');
  afficherActions([
    {
      label: 'Lancer le dé pour le cœur',
      action: () => {
        const roll = d6();
        let coeur;
        if (roll <= 2)      coeur = 'Dragon (corde de cœur)';
        else if (roll <= 4) coeur = 'Phénix (plume)';
        else                coeur = 'Licorne (crin)';
        _p.baguette.coeur = coeur;
        alerter(`Dé : ${roll}. Cœur de baguette : ${coeur}.`);
        _etape3c_Aspect();
      }
    },
    { label: 'Dragon (corde de cœur)',  action: () => { _p.baguette.coeur = 'Dragon (corde de cœur)';  alerter('Cœur : Dragon.'); _etape3c_Aspect(); } },
    { label: 'Phénix (plume)',          action: () => { _p.baguette.coeur = 'Phénix (plume)';          alerter('Cœur : Phénix.'); _etape3c_Aspect(); } },
    { label: 'Licorne (crin)',          action: () => { _p.baguette.coeur = 'Licorne (crin)';          alerter('Cœur : Licorne.'); _etape3c_Aspect(); } }
  ]);
}

function _etape3c_Aspect() {
  narrer('L\'aspect de votre baguette. Lancer le dé ou choisir.');
  _choisirOuLancer(
    'Choisir l\'aspect de la baguette',
    _tables.aspects_baguette,
    (val) => {
      _p.baguette.aspect = val;
      _etape3d_Ambition();
    }
  );
}

function _etape3d_Ambition() {
  narrer(
    'Votre ambition. C\'est ce que vous cherchez à accomplir pendant vos années à Poudlard. ' +
    'Lancer le dé ou choisir.'
  );
  _choisirOuLancer(
    'Choisir une ambition',
    _tables.ambitions,
    (val) => {
      _p.ambition = val;
      alerter(
        `Votre baguette : bois d'${_p.baguette.bois}, cœur de ${_p.baguette.coeur}, aspect ${_p.baguette.aspect}. ` +
        `Ambition : ${val}.`
      );
      _etape4_Origine();
    }
  );
}

// ================================================================
// Étape 4 — Origines
// ================================================================
function _etape4_Origine() {
  narrerFrais(
    'Étape 4 sur 12 : Vos origines. Elles déterminent combien de sorts vous connaissez au départ ' +
    'et combien de points d\'Expérience vous avez. ' +
    'Lancez le dé : 1-2 pour Né-Moldu, 3-4 pour Demi-sang, 5-6 pour Sang-pur. Ou choisissez.'
  );

  afficherActions([
    {
      label: 'Lancer le dé',
      action: () => {
        const roll = d6();
        let id;
        if (roll <= 2)      id = 'ne-moldu';
        else if (roll <= 4) id = 'demi-sang';
        else                id = 'sang-pur';
        _appliquerOrigineEtContinuer(id, roll);
      }
    },
    ..._tables.origines.map(o => ({
      label: `${o.label} — ${o.sorts} sort${o.sorts > 1 ? 's' : ''}, ${o.xp} XP`,
      action: () => _appliquerOrigineEtContinuer(o.id, null)
    }))
  ]);
}

function _appliquerOrigineEtContinuer(id, roll) {
  _p.origine = id;
  appliquerOrigine(_p);
  const o = _tables.origines.find(x => x.id === id);
  const prefixe = roll !== null ? `Dé : ${roll}. ` : '';
  alerter(`${prefixe}Origines : ${o.label}. ${o.description}`);
  _etape5_Matiere();
}

// ================================================================
// Étape 5 — Matière préférée
// ================================================================
function _etape5_Matiere() {
  const estJeune = _p.annee <= 2;
  narrerFrais(
    'Étape 5 sur 12 : Votre matière préférée. ' +
    (estJeune
      ? 'En 1ère ou 2ème Année, vous choisissez parmi les Matières Fondamentales.'
      : 'En 3ème Année ou plus, vous pouvez choisir une matière fondamentale ou optionnelle. ' +
        'Lancez deux dés : le premier indique Fondamentale (1-3) ou Option (4-6), le second la matière.') +
    ' Ou choisissez directement.'
  );

  if (!estJeune) {
    afficherActions([
      {
        label: 'Lancer deux dés',
        action: () => {
          const [d1, d2] = deuxD6Independants();
          const table    = d1 <= 3 ? _tables.matieres_fondamentales : _tables.matieres_options;
          const matiere  = table[String(d2)];
          _p.matieresPreferees = [matiere];
          alerter(`Dé 1 : ${d1} (${d1 <= 3 ? 'Fondamentale' : 'Option'}). Dé 2 : ${d2}. Matière préférée : ${matiere}.`);
          _etape6_Sorts();
        }
      },
      ..._choixMatieres()
    ]);
  } else {
    afficherActions([
      {
        label: 'Lancer le dé',
        action: () => {
          const roll    = d6();
          const matiere = _tables.matieres_fondamentales[String(roll)];
          _p.matieresPreferees = [matiere];
          alerter(`Dé : ${roll}. Matière préférée : ${matiere}.`);
          _etape6_Sorts();
        }
      },
      ..._choixMatieres(true)
    ]);
  }
}

function _choixMatieres(fondamentalesUniquement = false) {
  const listes = fondamentalesUniquement
    ? [_tables.matieres_fondamentales]
    : [_tables.matieres_fondamentales, _tables.matieres_options];

  return listes.flatMap(table =>
    Object.values(table).map(m => ({
      label: m,
      action: () => {
        _p.matieresPreferees = [m];
        alerter(`Matière préférée : ${m}.`);
        _etape6_Sorts();
      }
    }))
  );
}

// ================================================================
// Étape 6 — Sorts de départ
// ================================================================
function _etape6_Sorts() {
  const o        = _tables.origines.find(x => x.id === _p.origine);
  const nbSorts  = o?.sorts ?? 1;
  const annee    = Math.min(_p.annee, 7);
  const disponibles = _sorts.annees[String(annee)] ?? _sorts.annees['1'];

  // Les sorts des années précédentes sont connus automatiquement
  const acquis = [];
  for (let a = 1; a < annee; a++) {
    const sortsAnnee = _sorts.annees[String(a)] ?? [];
    acquis.push(...sortsAnnee);
  }
  _p.sorts = [...acquis];

  narrerFrais(
    `Étape 6 sur 12 : Vos sorts de départ. ` +
    (acquis.length > 0
      ? `En tant que sorcier de ${annee}ème Année, vous connaissez automatiquement tous les sorts des années précédentes, soit ${acquis.length} sort${acquis.length > 1 ? 's' : ''}. `
      : '') +
    `En tant que ${o?.label ?? 'sorcier'}, vous choisissez ${nbSorts} sort${nbSorts > 1 ? 's' : ''} supplémentaire${nbSorts > 1 ? 's' : ''} dans votre Année actuelle.`
  );

  _choisirSorts(disponibles, nbSorts, 0);
}

function _choisirSorts(disponibles, total, déjaChoisis) {
  const restants  = total - déjaChoisis;
  const sortsNoms = _p.sorts.map(s => s.nom);
  const dispo     = disponibles.filter(s => !sortsNoms.includes(s.nom));

  if (restants <= 0 || dispo.length === 0) {
    alerter(`Sorts retenus : ${_p.sorts.filter(s => !s._acquis).map(s => s.nom).join(', ')}.`);
    _etape7_Traits();
    return;
  }

  narrer(`Choisissez un sort (${déjaChoisis + 1} sur ${total}) :`);

  afficherActions(dispo.map(s => ({
    label: `${s.nom} — ${s.description} (${_sorts.types[s.type] ?? s.type})`,
    action: () => {
      _p.sorts.push(s);
      alerter(`Sort choisi : ${s.nom}.`);
      _choisirSorts(disponibles, total, déjaChoisis + 1);
    }
  })));
}

// ================================================================
// Étape 7 — Traits
// ================================================================
function _etape7_Traits() {
  narrerFrais(
    'Étape 7 sur 12 : Vos traits. ' +
    'Vous devez répartir ces 5 valeurs entre vos 5 traits : moins 1, zéro, plus 1, plus 1, plus 2. ' +
    'Le trait le plus élevé définit votre personnage. ' +
    'Vous pouvez lancer aléatoirement ou choisir vous-même.'
  );

  afficherActions([
    {
      label: 'Répartition aléatoire',
      action: () => {
        const valeurs = [-1, 0, 1, 1, 2];
        _melangerTableau(valeurs);
        const noms = ['bravoure', 'ruse', 'intellect', 'loyaute', 'magie'];
        noms.forEach((n, i) => { _p.traits[n] = valeurs[i]; });
        const annonce = Object.entries(NOMS_TRAITS)
          .map(([c, nom]) => `${nom} : ${_signeParle(_p.traits[c])}`)
          .join('. ');
        alerter('Traits assignés aléatoirement. ' + annonce + '.');
        _etape8_Nom();
      }
    },
    {
      label: 'Choisir moi-même',
      action: () => _assignerTraitManuellement(['bravoure', 'ruse', 'intellect', 'loyaute', 'magie'], [-1, 0, 1, 1, 2])
    }
  ]);
}

function _assignerTraitManuellement(traitsDispo, valeursDispo) {
  if (traitsDispo.length === 0) {
    const annonce = Object.entries(NOMS_TRAITS)
      .map(([c, nom]) => `${nom} : ${_signeParle(_p.traits[c])}`)
      .join('. ');
    alerter('Traits finaux. ' + annonce + '.');
    _etape8_Nom();
    return;
  }

  const traitActuel = traitsDispo[0];
  const nomTrait    = NOMS_TRAITS[traitActuel];

  narrer(
    `Assignez une valeur à ${nomTrait}. ` +
    `Valeurs restantes : ${valeursDispo.map(_signeParle).join(', ')}.`
  );

  afficherActions(valeursDispo.map(v => ({
    label: `${nomTrait} : ${_signeParle(v)}`,
    action: () => {
      _p.traits[traitActuel] = v;
      alerter(`${nomTrait} : ${_signeParle(v)}.`);
      const nouvellesValeurs = [...valeursDispo];
      nouvellesValeurs.splice(nouvellesValeurs.indexOf(v), 1);
      _assignerTraitManuellement(traitsDispo.slice(1), nouvellesValeurs);
    }
  })));
}

// ================================================================
// Étape 8 — Nom
// ================================================================
function _etape8_Nom() {
  narrerFrais(
    'Étape 8 sur 12 : Votre nom. Choisissez un prénom et un nom de famille. ' +
    'Vous pouvez tirer un nom aléatoire ou écrire le vôtre.'
  );

  afficherActions([
    {
      label: 'Tirer un prénom et un nom aléatoires',
      action: () => {
        _p.prenom = _tirerAuHasard(_tables.prenoms_moldus.concat(_tables.prenoms_sorciers));
        _p.nom    = _tirerAuHasard(_tables.noms_de_famille);
        alerter(`Votre nom : ${_p.prenom} ${_p.nom}.`);
        _etape9_Animal();
      }
    },
    {
      label: 'Écrire mon prénom',
      action: () => {
        _demanderTexte(
          'Entrez votre prénom',
          'Hermione',
          (prenom) => {
            _p.prenom = prenom;
            narrer(`Prénom : ${prenom}. Maintenant le nom de famille.`);
            _demanderTexte(
              'Entrez votre nom de famille',
              'Granger',
              (nom) => {
                _p.nom = nom;
                alerter(`Votre nom : ${_p.prenom} ${_p.nom}.`);
                _etape9_Animal();
              }
            );
          }
        );
      }
    }
  ]);
}

// ================================================================
// Étape 9 — Animal de compagnie (optionnel)
// ================================================================
function _etape9_Animal() {
  narrerFrais(
    'Étape 9 sur 12 : Avez-vous un animal de compagnie ? ' +
    'C\'est facultatif. Un hibou peut porter du courrier. ' +
    'Un rat ne peut pas. Un chat ne daigne pas.'
  );

  afficherActions([
    {
      label: 'Lancer le dé pour un animal',
      action: () => {
        const roll = d6();
        let type, capacite;
        if (roll <= 2)      { type = 'Hibou';  capacite = 'peut envoyer et recevoir du courrier'; }
        else if (roll <= 4) { type = 'Rat';    capacite = 'ne peut pas envoyer ou recevoir de courrier'; }
        else                { type = 'Chat';   capacite = 'ne daigne pas envoyer ou recevoir de courrier'; }
        alerter(`Dé : ${roll}. Vous avez un ${type.toLowerCase()}, qui ${capacite}.`);
        _p.animal.type = type;
        _nommerAnimal();
      }
    },
    { label: 'Un hibou', action: () => { _p.animal.type = 'Hibou'; alerter('Vous avez un hibou.'); _nommerAnimal(); } },
    { label: 'Un rat',   action: () => { _p.animal.type = 'Rat';   alerter('Vous avez un rat.');   _nommerAnimal(); } },
    { label: 'Un chat',  action: () => { _p.animal.type = 'Chat';  alerter('Vous avez un chat.');  _nommerAnimal(); } },
    { label: 'Pas d\'animal',
      action: () => {
        _p.animal = { type: '', nom: '' };
        narrer('Pas d\'animal de compagnie.');
        _etape10_Maison();
      }
    }
  ]);
}

function _nommerAnimal() {
  _demanderTexte(
    `Comment s'appelle votre ${_p.animal.type.toLowerCase()} ?`,
    'Hedwige',
    (nom) => {
      _p.animal.nom = nom;
      alerter(`Votre ${_p.animal.type.toLowerCase()} s'appelle ${nom}.`);
      _etape10_Maison();
    }
  );
}

// ================================================================
// Étape 10 — Maison
// ================================================================
function _etape10_Maison() {
  narrerFrais(
    'Étape 10 sur 12 : Votre maison. ' +
    'Lancez un dé. Si vous obtenez 5 ou 6, relancez. ' +
    'Vous pouvez aussi choisir la maison associée à votre meilleur trait, ' +
    'ou simplement choisir vous-même.'
  );

  // Trouver le meilleur trait et sa maison
  const bonusMaison = { bravoure: 'Gryffondor', loyaute: 'Poufsouffle', intellect: 'Serdaigle', ruse: 'Serpentard' };
  let meilleurTrait = 'bravoure';
  let meilleurVal   = -99;
  for (const [t, v] of Object.entries(_p.traits)) {
    if (t !== 'magie' && v > meilleurVal) { meilleurTrait = t; meilleurVal = v; }
  }
  const maisonMeilleurTrait = bonusMaison[meilleurTrait];

  afficherActions([
    {
      label: 'Lancer le dé',
      action: () => {
        let roll;
        do { roll = d6(); } while (roll > 4);
        const maison = _tables.maisons[roll - 1];
        _p.maison = maison.label;
        appliquerMaison(_p);
        alerter(`Dé : ${roll}. Maison : ${maison.label}. ${maison.description} Bonus : plus 1 en ${NOMS_TRAITS[maison.trait]}.`);
        _etape11_Amis();
      }
    },
    {
      label: `Rejoindre ${maisonMeilleurTrait} (votre meilleur trait : ${NOMS_TRAITS[meilleurTrait]})`,
      action: () => {
        _p.maison = maisonMeilleurTrait;
        appliquerMaison(_p);
        const maison = _tables.maisons.find(m => m.label === maisonMeilleurTrait);
        alerter(`Maison : ${maisonMeilleurTrait}. ${maison?.description ?? ''} Bonus : plus 1 en ${NOMS_TRAITS[maison?.trait]}.`);
        _etape11_Amis();
      }
    },
    ..._tables.maisons.map(m => ({
      label: `${m.label} — ${m.description}`,
      action: () => {
        _p.maison = m.label;
        appliquerMaison(_p);
        alerter(`Maison choisie : ${m.label}. Bonus : plus 1 en ${NOMS_TRAITS[m.trait]}.`);
        _etape11_Amis();
      }
    }))
  ]);
}

// ================================================================
// Étape 11 — Amis et Rivaux (adapté solo)
// ================================================================
function _etape11_Amis() {
  narrerFrais(
    'Étape 11 sur 12 : Vos amis et rivaux. ' +
    'En solo, vos relations sont avec des personnages non-joueurs. ' +
    'Deux questions de votre maison vont définir un ami et un rival. ' +
    'Choisissez les deux questions qui vous inspirent le plus.'
  );

  const maisonId  = _p.maison.toLowerCase().replace('ô', 'o').replace('é', 'e').replace('è', 'e');
  const questions = _tables.questions_amis_maisons[maisonId]
    ?? _tables.questions_amis_maisons['gryffondor'];

  _choisirQuestion(questions, 'Ami', () => {
    _choisirQuestion(questions, 'Rival', () => {
      alerter(
        `Relations établies. Ami : ${_p.amis.join(', ')}. Rival : ${_p.rivaux.join(', ')}.`
      );
      _etape12_Patronus();
    });
  });
}

function _choisirQuestion(questions, type, onFin) {
  const dispo = questions.filter(q => q.type === type);

  narrer(
    `Choisissez la question qui définit votre ${type.toLowerCase()}. ` +
    `Votre ${type.toLowerCase()} sera un personnage non-joueur nommé aléatoirement.`
  );

  afficherActions(dispo.map(q => ({
    label: q.question,
    action: () => {
      const prenom = _tirerAuHasard(_tables.prenoms_moldus.concat(_tables.prenoms_sorciers));
      const nom    = _tirerAuHasard(_tables.noms_de_famille);
      const nomComplet = `${prenom} ${nom}`;
      if (type === 'Ami')    _p.amis.push(nomComplet);
      if (type === 'Rival')  _p.rivaux.push(nomComplet);
      alerter(`${type} : ${nomComplet}. Relation basée sur : ${q.question}`);
      onFin();
    }
  })));
}

// ================================================================
// Étape 12 — Patronus
// ================================================================
function _etape12_Patronus() {
  narrerFrais(
    'Étape 12 sur 12 : Votre Patronus. ' +
    'Vous pouvez découvrir votre Patronus maintenant, mais vous ne pourrez le lancer ' +
    'qu\'après avoir appris le sort Expecto Patronum, généralement en 5ème Année. ' +
    'Lancez deux dés : le premier donne la catégorie, le second l\'animal.'
  );

  afficherActions([
    {
      label: 'Lancer deux dés pour mon Patronus',
      action: () => {
        const [d1, d2] = deuxD6Independants();
        const categorie = _tables.patronus.categories[String(d1)];
        const animal    = categorie?.animaux[String(d2)] ?? 'inconnu';
        _p.patronus = animal;
        alerter(
          `Dé 1 : ${d1}, catégorie : ${categorie?.label ?? ''}. ` +
          `Dé 2 : ${d2}, animal : ${animal}. ` +
          `Votre Patronus est un ${animal}.`
        );
        _finirCreation();
      }
    },
    {
      label: 'Choisir ma catégorie de Patronus',
      action: () => _choisirCategoriePatronus()
    },
    {
      label: 'Découvrir mon Patronus plus tard',
      action: () => {
        _p.patronus = '';
        narrer('Vous découvrirez votre Patronus plus tard.');
        _finirCreation();
      }
    }
  ]);
}

function _choisirCategoriePatronus() {
  const categories = Object.values(_tables.patronus.categories);
  narrer("Choisissez une catégorie d'animal.");
  afficherActions([
    ...categories.map(cat => ({
      label: cat.label,
      action: () => {
        narrer(`Catégorie : ${cat.label}. Choisissez un animal.`);
        afficherActions([
          ...Object.values(cat.animaux).map(animal => ({
            label: animal,
            action: () => {
              _p.patronus = animal;
              alerter(`Votre Patronus est un ${animal}.`);
              _finirCreation();
            }
          })),
          { label: 'Retour aux catégories', action: _choisirCategoriePatronus }
        ]);
      }
    })),
    { label: 'Retour au choix du Patronus', action: _etape12_Patronus }
  ]);
}

// ================================================================
// Fin de création
// ================================================================
function _finirCreation() {
  mettreAJourFiche(_p);

  const origine = _p.origine === 'ne-moldu' ? 'Né-Moldu' : _p.origine === 'demi-sang' ? 'Demi-sang' : 'Sang-pur';
  const animal  = _p.animal.type ? `${_p.animal.type} ${_p.animal.nom}` : 'aucun animal';

  narrerFrais(
    `Création terminée. Voici votre sorcière ou sorcier. ` +
    `${_p.prenom} ${_p.nom}, ${_p.annee <= 7 ? `${_p.annee}${_p.annee === 1 ? "ère" : "ème"} Année` : 'Diplômé'}, ` +
    `maison ${_p.maison}, origines ${origine}. ` +
    `Traits : Bravoure ${_signeParle(_p.traits.bravoure)}, ` +
    `Ruse ${_signeParle(_p.traits.ruse)}, ` +
    `Intellect ${_signeParle(_p.traits.intellect)}, ` +
    `Loyauté ${_signeParle(_p.traits.loyaute)}, ` +
    `Magie ${_signeParle(_p.traits.magie)}. ` +
    `Sorts connus : ${_p.sorts.length}. ` +
    `Chance : 3. Expérience : ${_p.experience}. ` +
    `Animal : ${animal}. ` +
    (_p.patronus ? `Patronus : ${_p.patronus}.` : 'Patronus à découvrir.')
  );

  afficherActions([
    { label: 'Commencer l\'aventure', action: () => _onFin?.(_p) },
    { label: 'Recommencer la création', action: () => {
      Object.assign(_p, { prenom: '', nom: '', maison: '', origine: '', sorts: [], traits: { bravoure: 0, ruse: 0, intellect: 0, loyaute: 0, magie: 0 }, chance: 3, experience: 0, amis: [], rivaux: [] });
      _etape1_Annee();
    }}
  ]);
}

// ================================================================
// Helpers internes
// ================================================================

// Table d6 → choix : affiche "lancer le dé" + toutes les options
function _choisirOuLancer(titreChoix, table, onChoix) {
  afficherActions([
    {
      label: 'Lancer le dé',
      action: () => {
        const roll = d6();
        const val  = table[String(roll)];
        alerter(`Dé : ${roll}. Résultat : ${val}.`);
        onChoix(val);
      }
    },
    ...Object.values(table).map(val => ({
      label: val,
      action: () => {
        alerter(`Choix : ${val}.`);
        onChoix(val);
      }
    }))
  ]);
}

function _demanderTexte(question, exemple, onValider) {
  demanderTexte({ question, exemple, onValider });
}

function _tirerAuHasard(tableau) {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

function _melangerTableau(tab) {
  for (let i = tab.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tab[i], tab[j]] = [tab[j], tab[i]];
  }
}

function _signeParle(val) {
  if (val === 0)  return 'zéro';
  if (val > 0)    return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}
