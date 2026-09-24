// Création du personnage, sur une seule page.
//
// Deux chemins (choix de l'utilisateur) :
// - un formulaire unique avec toutes les étapes, groupées en sections ;
// - un bouton « Tout tirer au hasard » qui lance tous les dés d'un coup,
//   selon les tables du jeu, puis montre le résultat.
// Les deux produisent le même objet `choix`, transformé en personnage à la fin.

import { narrerFrais, narrer, statuer } from '../ui/narration.js';
import { afficherActions, afficherContenu } from '../ui/choices.js';
import { d6, deuxD6Independants } from '../rules/dice.js';
import { appliquerMaison, appliquerOrigine, NOMS_TRAITS } from '../rules/character.js';
import { mettreAJourFiche } from '../ui/character-sheet.js';

const DIPLOME = 8;
const VALEURS_TRAITS = [2, 1, 1, 0, -1];
const COEURS = ['Dragon (corde de cœur)', 'Phénix (plume)', 'Licorne (crin)'];

let _p      = null;
let _tables = null;
let _sorts  = null;
let _onFin  = null;

// ================================================================
// Lancement
// ================================================================

export async function lancerCreation(personnage, onFin) {
  _p     = personnage;
  _onFin = onFin;

  const [tRes, sRes] = await Promise.all([
    fetch('data/tables.json'),
    fetch('data/spells.json')
  ]);
  _tables = await tRes.json();
  _sorts  = await sRes.json();

  narrerFrais(
    'Création de votre sorcière ou sorcier. Remplissez le formulaire ci-dessous, section par section, ' +
    'puis validez. Ou tirez tout au hasard : les dés font tous les choix d\'un coup.'
  );
  _afficherFormulaire(_choixVides());
}

// ================================================================
// Formulaire
// ================================================================

function _afficherFormulaire(choix) {
  const $form = document.createElement('form');
  $form.noValidate = true;
  $form.className = 'd-grid gap-4';

  const $hasard = _bouton('Tout tirer au hasard (lancer tous les dés)', 'btn btn-warning btn-lg', _tirerAuHasard);
  $form.appendChild($hasard);

  const $erreurs = document.createElement('div');
  $erreurs.id = 'erreurs-creation';
  $erreurs.className = 'alert alert-danger';
  $erreurs.hidden = true;
  $form.appendChild($erreurs);

  // Identité
  const $identite = _section($form, 'Identité');
  _liste($identite, 'annee', 'Année à Poudlard',
    [1, 2, 3, 4, 5, 6, 7].map(a => [String(a), _libelleAnnee(a)]).concat([[String(DIPLOME), 'Diplômé, personnage adulte']]),
    choix.annee);
  _texte($identite, 'prenom', 'Prénom', choix.prenom);
  _texte($identite, 'nom', 'Nom de famille', choix.nom);

  // Apparence
  const $apparence = _section($form, 'Apparence');
  _liste($apparence, 'teint', 'Teint', _valeurs(_tables.teints), choix.teint);
  _liste($apparence, 'cheveux', 'Cheveux', _valeurs(_tables.cheveux), choix.cheveux);
  _liste($apparence, 'silhouette', 'Silhouette', _valeurs(_tables.silhouettes), choix.silhouette);

  // Baguette
  const $baguette = _section($form, 'Baguette et ambition',
    'Dans le jeu, chaque ambition va avec un bois : Accomplissement et érable, Savoir et noyer, Amusement et épicéa, Amitié et cèdre, Pouvoir et if, Prestige et orme. Vous restez libre de les séparer.');
  _liste($baguette, 'ambition', 'Ambition', _valeurs(_tables.ambitions), choix.ambition);
  _liste($baguette, 'bois', 'Bois de la baguette', _valeurs(_tables.bois_baguette), choix.bois);
  _liste($baguette, 'coeur', 'Cœur de la baguette', COEURS.map(c => [c, c]), choix.coeur);
  _liste($baguette, 'aspect', 'Aspect de la baguette', _valeurs(_tables.aspects_baguette), choix.aspect);

  // Origine
  const $origine = _section($form, 'Origine');
  _liste($origine, 'origine', 'Origine',
    _tables.origines.map(o => [o.id, `${o.label} : ${o.sorts} sort${o.sorts > 1 ? 's' : ''} au départ, ${o.xp} point${o.xp > 1 ? 's' : ''} d'Expérience`]),
    choix.origine);

  // Matière préférée
  const $matiere = _section($form, 'Matière préférée',
    'En 1ère et 2ème Année, seulement les matières fondamentales. Ensuite, aussi les options.');
  _liste($matiere, 'matiere', 'Matière préférée', _optionsMatieres(choix.annee), choix.matiere);

  // Sorts
  const $sorts = _section($form, 'Sorts de départ');
  const $zoneSorts = document.createElement('div');
  $zoneSorts.className = 'd-grid gap-3';
  $sorts.appendChild($zoneSorts);

  // Traits
  const $traits = _section($form, 'Traits',
    'Utilisez chaque valeur une seule fois : plus 2, plus 1, plus 1, zéro et moins 1. Votre maison ajoutera ensuite plus 1 à l\'un d\'eux.');
  Object.entries(NOMS_TRAITS).forEach(([cle, nom]) => {
    _liste($traits, `trait-${cle}`, nom,
      [['2', 'plus 2'], ['1', 'plus 1'], ['0', 'zéro'], ['-1', 'moins 1']],
      choix.traits[cle]);
  });

  // Maison
  const $maison = _section($form, 'Maison',
    'Chaque maison donne plus 1 à un trait : Gryffondor la Bravoure, Poufsouffle la Loyauté, Serdaigle l\'Intellect, Serpentard la Ruse.');
  _liste($maison, 'maison', 'Maison', _tables.maisons.map(m => [m.label, `${m.label} : plus 1 en ${NOMS_TRAITS[m.trait]}`]), choix.maison);

  // Ami et rival
  const $relations = _section($form, 'Ami et rival',
    'Chaque question de votre maison définit un personnage. Laissez un nom vide pour qu\'il soit tiré au hasard.');
  _liste($relations, 'question-ami', 'Question qui définit votre ami', [], choix.questionAmi);
  _texte($relations, 'nom-ami', 'Nom de votre ami (facultatif)', choix.nomAmi);
  _liste($relations, 'question-rival', 'Question qui définit votre rival', [], choix.questionRival);
  _texte($relations, 'nom-rival', 'Nom de votre rival (facultatif)', choix.nomRival);

  // Animal
  const $animal = _section($form, 'Animal de compagnie',
    'Un hibou porte le courrier. Un rat ne le peut pas. Un chat ne daigne pas.');
  _liste($animal, 'animal', 'Animal', [['aucun', 'Pas d\'animal'], ['Hibou', 'Hibou'], ['Rat', 'Rat'], ['Chat', 'Chat']], choix.animal);
  _texte($animal, 'nom-animal', 'Nom de l\'animal', choix.nomAnimal);

  // Patronus
  const $patronus = _section($form, 'Patronus',
    'Vous ne pourrez le lancer qu\'après avoir appris Expecto Patronum, en général en 5ème Année.');
  _liste($patronus, 'categorie-patronus', 'Catégorie du Patronus',
    [['plus-tard', 'À découvrir plus tard']].concat(Object.entries(_tables.patronus.categories).map(([n, c]) => [n, c.label])),
    choix.categoriePatronus);
  _liste($patronus, 'patronus', 'Animal du Patronus', [], choix.patronus);

  $form.appendChild(_bouton('Valider le personnage', 'btn btn-warning btn-lg', null, 'submit'));

  // Listes qui dépendent d'un autre choix
  const champ = (id) => $form.querySelector(`#creation-${id}`);
  const majSorts = (annoncerChangement) => _majSorts($zoneSorts, champ('annee').value, champ('origine').value, choix.sorts, annoncerChangement);
  const majMatieres = () => _remplirListe(champ('matiere'), _optionsMatieres(champ('annee').value));
  const majQuestions = (annoncerChangement) => {
    const questions = _questionsMaison(champ('maison').value);
    _remplirListe(champ('question-ami'), questions.filter(q => q.type === 'Ami').map(q => [q.question, q.question]),
      champ('maison').value ? null : 'Choisissez d\'abord votre maison');
    _remplirListe(champ('question-rival'), questions.filter(q => q.type === 'Rival').map(q => [q.question, q.question]),
      champ('maison').value ? null : 'Choisissez d\'abord votre maison');
    if (annoncerChangement && champ('maison').value) statuer(`Questions d'ami et de rival mises à jour pour ${champ('maison').value}.`);
  };
  const majPatronus = () => {
    const cat = _tables.patronus.categories[champ('categorie-patronus').value];
    _remplirListe(champ('patronus'), cat ? Object.values(cat.animaux).map(a => [a, a]) : [],
      cat ? null : 'Choisissez d\'abord une catégorie');
  };
  const majAnimal = () => { champ('nom-animal').disabled = champ('animal').value === 'aucun' || !champ('animal').value; };

  champ('annee').addEventListener('change', () => { majMatieres(); majSorts(true); });
  champ('origine').addEventListener('change', () => majSorts(true));
  champ('maison').addEventListener('change', () => majQuestions(true));
  champ('categorie-patronus').addEventListener('change', majPatronus);
  champ('animal').addEventListener('change', majAnimal);

  majSorts(false);
  majQuestions(false);
  _selectionner(champ('question-ami'), choix.questionAmi);
  _selectionner(champ('question-rival'), choix.questionRival);
  majPatronus();
  _selectionner(champ('patronus'), choix.patronus);
  majAnimal();

  $form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lu = _lireFormulaire($form);
    const erreurs = _verifier(lu);
    if (erreurs.length) {
      _montrerErreurs($form, $erreurs, erreurs);
      return;
    }
    _construirePersonnage(lu);
    narrerFrais('Personnage validé.');
    _afficherResume(lu, []);
  });

  afficherContenu($form, $hasard);
}

// Liste(s) de sorts : autant de listes que de sorts à choisir.
function _majSorts($zone, annee, origine, sortsVoulus, annoncerChangement) {
  const anciens = [...$zone.querySelectorAll('select')].map(s => s.value).filter(Boolean);
  $zone.innerHTML = '';
  const a = Number(annee);

  if (!a || !origine) {
    _paragraphe($zone, 'Choisissez d\'abord votre année et votre origine.');
    return;
  }
  if (a === DIPLOME) {
    _paragraphe($zone, 'En tant que diplômé, vous connaissez tous les sorts. Rien à choisir.');
    if (annoncerChangement) statuer('Diplômé : vous connaissez tous les sorts.');
    return;
  }

  const nb = _nbSorts(origine);
  const acquis = _sortsAcquis(a).length;
  _paragraphe($zone,
    (acquis ? `Vous connaissez déjà les ${acquis} sorts des années précédentes. ` : '') +
    `Choisissez ${nb} sort${nb > 1 ? 's' : ''} de ${_libelleAnnee(a)}.`);

  const options = _sortsAnnee(a).map(s => [s.nom, `${s.nom} : ${s.description}`]);
  const valeurs = anciens.length ? anciens : sortsVoulus;
  for (let i = 0; i < nb; i++) {
    _liste($zone, `sort-${i + 1}`, `Sort ${i + 1} sur ${nb}`, options, valeurs[i] ?? '');
  }
  if (annoncerChangement) statuer(`Section Sorts : choisissez maintenant ${nb} sort${nb > 1 ? 's' : ''} de ${_libelleAnnee(a)}.`);
}

function _lireFormulaire($form) {
  const v = (id) => $form.querySelector(`#creation-${id}`)?.value ?? '';
  return {
    annee: v('annee'), prenom: v('prenom').trim(), nom: v('nom').trim(),
    teint: v('teint'), cheveux: v('cheveux'), silhouette: v('silhouette'),
    ambition: v('ambition'), bois: v('bois'), coeur: v('coeur'), aspect: v('aspect'),
    origine: v('origine'), matiere: v('matiere'),
    sorts: [...$form.querySelectorAll('[id^="creation-sort-"]')].map(s => s.value),
    traits: Object.fromEntries(Object.keys(NOMS_TRAITS).map(c => [c, v(`trait-${c}`)])),
    maison: v('maison'),
    questionAmi: v('question-ami'), nomAmi: v('nom-ami').trim(),
    questionRival: v('question-rival'), nomRival: v('nom-rival').trim(),
    animal: v('animal'), nomAnimal: v('nom-animal').trim(),
    categoriePatronus: v('categorie-patronus'), patronus: v('patronus')
  };
}

// Renvoie [{ id du champ, message }] dans l'ordre du formulaire.
function _verifier(c) {
  const e = [];
  const manque = (id, nom) => e.push({ id, message: `${nom} : à choisir.` });

  if (!c.annee) manque('annee', 'Année');
  if (!c.prenom) e.push({ id: 'prenom', message: 'Prénom : à écrire.' });
  if (!c.nom) e.push({ id: 'nom', message: 'Nom de famille : à écrire.' });
  if (!c.teint) manque('teint', 'Teint');
  if (!c.cheveux) manque('cheveux', 'Cheveux');
  if (!c.silhouette) manque('silhouette', 'Silhouette');
  if (!c.ambition) manque('ambition', 'Ambition');
  if (!c.bois) manque('bois', 'Bois de la baguette');
  if (!c.coeur) manque('coeur', 'Cœur de la baguette');
  if (!c.aspect) manque('aspect', 'Aspect de la baguette');
  if (!c.origine) manque('origine', 'Origine');
  if (!c.matiere) manque('matiere', 'Matière préférée');

  c.sorts.forEach((s, i) => { if (!s) manque(`sort-${i + 1}`, `Sort ${i + 1}`); });
  const doublon = c.sorts.findIndex((s, i) => s && c.sorts.indexOf(s) !== i);
  if (doublon !== -1) e.push({ id: `sort-${doublon + 1}`, message: `Sort ${doublon + 1} : ce sort est déjà choisi dans une autre liste.` });

  const cles = Object.keys(NOMS_TRAITS);
  cles.forEach(cle => { if (c.traits[cle] === '') manque(`trait-${cle}`, NOMS_TRAITS[cle]); });
  if (cles.every(cle => c.traits[cle] !== '')) {
    const donnees = cles.map(cle => Number(c.traits[cle])).sort((a, b) => b - a).join(',');
    if (donnees !== VALEURS_TRAITS.join(',')) {
      e.push({ id: `trait-${cles[0]}`, message: 'Traits : chaque valeur doit servir une fois exactement, soit plus 2, plus 1, plus 1, zéro et moins 1.' });
    }
  }

  if (!c.maison) manque('maison', 'Maison');
  if (c.maison && !c.questionAmi) manque('question-ami', 'Question de votre ami');
  if (c.maison && !c.questionRival) manque('question-rival', 'Question de votre rival');
  if (!c.animal) manque('animal', 'Animal');
  if (c.animal && c.animal !== 'aucun' && !c.nomAnimal) e.push({ id: 'nom-animal', message: 'Nom de l\'animal : à écrire.' });
  if (!c.categoriePatronus) manque('categorie-patronus', 'Catégorie du Patronus');
  if (c.categoriePatronus && c.categoriePatronus !== 'plus-tard' && !c.patronus) manque('patronus', 'Animal du Patronus');
  return e;
}

// Récapitulatif en tête du formulaire, avec un lien vers chaque champ,
// et marquage de chaque champ en erreur. Comme pour les choix, le récapitulatif
// est un groupe recréé à chaque fois et nommé par son titre ; le focus va sur
// le premier lien : NVDA lit le titre puis le lien, dans les deux modes.
let _compteurErreurs = 0;

function _montrerErreurs($form, $erreurs, erreurs) {
  $form.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
  });
  $form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

  $erreurs.innerHTML = '';
  const groupe = document.createElement('div');
  groupe.setAttribute('role', 'group');
  const titre = document.createElement('h2');
  titre.id = `titre-erreurs-${++_compteurErreurs}`;
  groupe.setAttribute('aria-labelledby', titre.id);
  titre.className = 'h5';
  titre.textContent = erreurs.length === 1
    ? 'Il reste 1 point à corriger avant de valider.'
    : `Il reste ${erreurs.length} points à corriger avant de valider.`;
  const ul = document.createElement('ul');
  ul.className = 'mb-0';

  erreurs.forEach(({ id, message }) => {
    const champ = $form.querySelector(`#creation-${id}`);
    const li = document.createElement('li');
    const lien = document.createElement('a');
    lien.href = `#creation-${id}`;
    lien.className = 'alert-link';
    lien.textContent = message;
    lien.addEventListener('click', (e) => { e.preventDefault(); champ?.focus(); });
    li.appendChild(lien);
    ul.appendChild(li);

    if (champ && !champ.classList.contains('is-invalid')) {
      champ.classList.add('is-invalid');
      champ.setAttribute('aria-invalid', 'true');
      const retour = document.createElement('div');
      retour.id = `erreur-${id}`;
      retour.className = 'invalid-feedback';
      retour.textContent = message;
      champ.insertAdjacentElement('afterend', retour);
      champ.setAttribute('aria-describedby', retour.id);
    }
  });

  groupe.append(titre, ul);
  $erreurs.appendChild(groupe);
  $erreurs.hidden = false;
  ul.querySelector('a').focus();
}

// ================================================================
// Tout au hasard : tous les dés d'un coup, selon les tables du jeu
// ================================================================

function _tirerAuHasard() {
  const journal = [];
  const c = _choixVides();

  c.annee = String(1 + Math.floor(Math.random() * 7));
  journal.push(`Année : ${_libelleAnnee(Number(c.annee))}.`);

  let de = d6(); c.teint = _tables.teints[de];
  journal.push(`Teint, dé ${de} : ${c.teint}.`);
  de = d6(); c.cheveux = _tables.cheveux[de];
  journal.push(`Cheveux, dé ${de} : ${c.cheveux}.`);
  de = d6(); c.silhouette = _tables.silhouettes[de];
  journal.push(`Silhouette, dé ${de} : ${c.silhouette}.`);

  // Même dé pour l'ambition et le bois, comme dans la table du jeu
  de = d6(); c.ambition = _tables.ambitions[de]; c.bois = _tables.bois_baguette[de];
  journal.push(`Ambition et bois, dé ${de} : ${c.ambition}, ${_bois(c.bois)}.`);
  de = d6(); c.coeur = COEURS[Math.floor((de - 1) / 2)];
  journal.push(`Cœur, dé ${de} : ${c.coeur}.`);
  de = d6(); c.aspect = _tables.aspects_baguette[de];
  journal.push(`Aspect, dé ${de} : ${c.aspect}.`);

  de = d6(); c.origine = _tables.origines[Math.floor((de - 1) / 2)].id;
  journal.push(`Origine, dé ${de} : ${_origine(c.origine).label}.`);

  const [d1, d2] = deuxD6Independants();
  if (Number(c.annee) <= 2) {
    c.matiere = _tables.matieres_fondamentales[d2];
    journal.push(`Matière préférée, dé ${d2} : ${c.matiere}.`);
  } else {
    c.matiere = (d1 <= 3 ? _tables.matieres_fondamentales : _tables.matieres_options)[d2];
    journal.push(`Matière préférée, dés ${d1} et ${d2} : ${c.matiere}.`);
  }

  const dispo = _sortsAnnee(Number(c.annee)).slice();
  _melanger(dispo);
  c.sorts = dispo.slice(0, _nbSorts(c.origine)).map(s => s.nom);
  journal.push(`Sorts choisis au hasard : ${c.sorts.join(', ')}.`);

  const valeurs = VALEURS_TRAITS.slice();
  _melanger(valeurs);
  Object.keys(NOMS_TRAITS).forEach((cle, i) => { c.traits[cle] = String(valeurs[i]); });
  journal.push('Traits répartis au hasard.');

  c.prenom = _auHasard(_tables.prenoms_moldus.concat(_tables.prenoms_sorciers));
  c.nom = _auHasard(_tables.noms_de_famille);

  // Maison : un dé, relancé sur 5 ou 6
  let deMaison;
  do { deMaison = d6(); } while (deMaison > 4);
  c.maison = _tables.maisons[deMaison - 1].label;
  journal.push(`Maison, dé ${deMaison} : ${c.maison}.`);

  const questions = _questionsMaison(c.maison);
  c.questionAmi = _auHasard(questions.filter(q => q.type === 'Ami')).question;
  c.questionRival = _auHasard(questions.filter(q => q.type === 'Rival')).question;

  de = d6(); c.animal = ['Hibou', 'Rat', 'Chat'][Math.floor((de - 1) / 2)];
  c.nomAnimal = _auHasard(_tables.prenoms_sorciers);
  journal.push(`Animal, dé ${de} : ${c.animal.toLowerCase()}.`);

  const [p1, p2] = deuxD6Independants();
  c.categoriePatronus = String(p1);
  c.patronus = _tables.patronus.categories[p1].animaux[p2];
  journal.push(`Patronus, dés ${p1} et ${p2} : ${c.patronus}.`);

  _construirePersonnage(c);
  narrerFrais('Tous les dés sont lancés.');
  _afficherResume(c, journal);
}

// ================================================================
// Construction et résumé
// ================================================================

function _construirePersonnage(c) {
  const annee = Number(c.annee);
  Object.assign(_p, {
    annee,
    prenom: c.prenom, nom: c.nom,
    teint: c.teint, cheveux: c.cheveux, silhouette: c.silhouette,
    baguette: { bois: c.bois, coeur: c.coeur, aspect: c.aspect },
    ambition: c.ambition,
    origine: c.origine,
    matieresPreferees: [c.matiere],
    traits: Object.fromEntries(Object.entries(c.traits).map(([k, v]) => [k, Number(v)])),
    maison: c.maison,
    animal: c.animal === 'aucun' ? { type: '', nom: '' } : { type: c.animal, nom: c.nomAnimal },
    patronus: c.categoriePatronus === 'plus-tard' ? '' : c.patronus,
    chance: 3
  });

  if (annee === DIPLOME) {
    _p.sorts = [1, 2, 3, 4, 5, 6, 7].flatMap(a => _sortsAnnee(a));
  } else {
    const choisis = _sortsAnnee(annee).filter(s => c.sorts.includes(s.nom));
    _p.sorts = [..._sortsAcquis(annee), ...choisis];
  }

  _p.amis   = [c.nomAmi || _nomAuHasard()];
  _p.rivaux = [c.nomRival || _nomAuHasard()];
  _p.relations = { ami: c.questionAmi, rival: c.questionRival };

  appliquerOrigine(_p);
  appliquerMaison(_p);
}

function _afficherResume(choix, journal) {
  const p = _p;
  const traits = Object.entries(NOMS_TRAITS).map(([c, nom]) => `${nom} ${_signeParle(p.traits[c])}`).join(', ');
  const animal = p.animal.type ? `${p.animal.type.toLowerCase()} nommé ${p.animal.nom}` : 'aucun';

  if (journal.length) narrer(journal.join(' '));
  narrer(
    `${p.prenom} ${p.nom}, ${p.annee === DIPLOME ? 'diplômé' : _libelleAnnee(p.annee)}, maison ${p.maison}, ` +
    `${_origine(p.origine).label}. ` +
    `Traits, bonus de maison compris : ${traits}. ` +
    `Baguette : ${_bois(p.baguette.bois)}, ${p.baguette.coeur}, ${p.baguette.aspect.toLowerCase()}. Ambition : ${p.ambition}. ` +
    `Matière préférée : ${p.matieresPreferees[0]}. ` +
    `Sorts connus : ${p.sorts.length}. ` +
    `Ami : ${p.amis[0]}. Rival : ${p.rivaux[0]}. ` +
    `Animal : ${animal}. ` +
    `Patronus : ${p.patronus || 'à découvrir'}. ` +
    `Chance : 3. Expérience : ${p.experience}.`
  );

  mettreAJourFiche(p);

  afficherActions([
    { label: 'Commencer l\'aventure', action: () => _onFin?.(p), principal: true },
    ...(journal.length ? [{ label: 'Relancer tous les dés', action: _tirerAuHasard }] : []),
    { label: 'Modifier ce personnage', action: () => {
      narrerFrais('Modification du personnage. Tous vos choix sont déjà remplis.');
      _afficherFormulaire(choix);
    } }
  ]);
}

// ================================================================
// Aides pour construire le formulaire
// ================================================================

function _section($parent, titre, aide) {
  const fs = document.createElement('fieldset');
  fs.className = 'border border-warning-subtle rounded p-3 d-grid gap-3';
  const legend = document.createElement('legend');
  legend.className = 'h5 text-warning float-none w-auto px-2 mb-0';
  legend.textContent = titre;
  fs.appendChild(legend);
  if (aide) _paragraphe(fs, aide, 'form-text mt-0');
  $parent.appendChild(fs);
  return fs;
}

function _liste($parent, id, libelle, options, valeur) {
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = `creation-${id}`;
  label.className = 'form-label';
  label.textContent = libelle;
  const select = document.createElement('select');
  select.id = `creation-${id}`;
  select.className = 'form-select';
  div.append(label, select);
  $parent.appendChild(div);
  _remplirListe(select, options);
  _selectionner(select, valeur);
  return select;
}

function _texte($parent, id, libelle, valeur) {
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = `creation-${id}`;
  label.className = 'form-label';
  label.textContent = libelle;
  const input = document.createElement('input');
  input.type = 'text';
  input.id = `creation-${id}`;
  input.className = 'form-control';
  input.autocomplete = 'off';
  input.value = valeur ?? '';
  div.append(label, input);
  $parent.appendChild(div);
  return input;
}

// Remplit une liste en gardant la sélection si elle existe encore.
// `indisponible` : texte de l'unique option quand la liste dépend d'un autre choix.
function _remplirListe(select, options, indisponible = null) {
  const avant = select.value;
  select.innerHTML = '';
  const vide = document.createElement('option');
  vide.value = '';
  vide.textContent = indisponible ?? 'À choisir';
  select.appendChild(vide);
  for (const [valeur, texte] of options) {
    const o = document.createElement('option');
    o.value = valeur;
    o.textContent = texte;
    select.appendChild(o);
  }
  select.disabled = !!indisponible;
  _selectionner(select, avant);
}

function _selectionner(select, valeur) {
  if (valeur !== undefined && valeur !== null && [...select.options].some(o => o.value === String(valeur))) {
    select.value = String(valeur);
  }
}

function _bouton(texte, classes, action, type = 'button') {
  const b = document.createElement('button');
  b.type = type;
  b.className = classes;
  b.textContent = texte;
  if (action) b.addEventListener('click', action);
  return b;
}

function _paragraphe($parent, texte, classes = 'mb-0') {
  const p = document.createElement('p');
  p.className = classes;
  p.textContent = texte;
  $parent.appendChild(p);
  return p;
}

// ================================================================
// Données
// ================================================================

function _choixVides() {
  return {
    annee: '', prenom: '', nom: '',
    teint: '', cheveux: '', silhouette: '',
    ambition: '', bois: '', coeur: '', aspect: '',
    origine: '', matiere: '', sorts: [],
    traits: Object.fromEntries(Object.keys(NOMS_TRAITS).map(c => [c, ''])),
    maison: '', questionAmi: '', nomAmi: '', questionRival: '', nomRival: '',
    animal: '', nomAnimal: '', categoriePatronus: '', patronus: ''
  };
}

function _valeurs(table) {
  return Object.values(table).map(v => [v, v]);
}

function _optionsMatieres(annee) {
  const a = Number(annee);
  const fondamentales = _valeurs(_tables.matieres_fondamentales);
  if (a && a <= 2) return fondamentales;
  return fondamentales.concat(_valeurs(_tables.matieres_options).map(([v, t]) => [v, `${t} (option)`]));
}

function _questionsMaison(maison) {
  const id = _tables.maisons.find(m => m.label === maison)?.id;
  return id ? _tables.questions_amis_maisons[id] ?? [] : [];
}

function _origine(id) {
  return _tables.origines.find(o => o.id === id) ?? { label: '', sorts: 1 };
}

function _nbSorts(origine) {
  return _origine(origine).sorts ?? 1;
}

function _sortsAnnee(annee) {
  return _sorts.annees[String(Math.min(annee, 7))] ?? [];
}

// Sorts connus d'office : tous ceux des années déjà terminées.
function _sortsAcquis(annee) {
  const liste = [];
  for (let a = 1; a < Math.min(annee, 8); a++) liste.push(..._sortsAnnee(a));
  return liste;
}

function _libelleAnnee(a) {
  return `${a}${a === 1 ? 'ère' : 'ème'} Année`;
}

// « bois d'érable », « bois de noyer » : élision et minuscule au milieu d'une phrase.
function _bois(bois) {
  const mot = bois.toLowerCase();
  return /^[aeiouyéèêh]/.test(mot) ? `bois d'${mot}` : `bois de ${mot}`;
}

function _nomAuHasard() {
  return `${_auHasard(_tables.prenoms_moldus.concat(_tables.prenoms_sorciers))} ${_auHasard(_tables.noms_de_famille)}`;
}

function _auHasard(tableau) {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

function _melanger(tab) {
  for (let i = tab.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tab[i], tab[j]] = [tab[j], tab[i]];
  }
}

function _signeParle(val) {
  if (val === 0) return 'zéro';
  if (val > 0)   return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}
