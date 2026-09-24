// Zone d'actions : les choix du moment.
//
// Format d'une action :
// { label: string, action: () => void, desactive?: bool, retour?: bool, bouton?: bool }
//
// Présentation (choix de l'utilisateur) :
// - 3 choix ou plus : une liste déroulante, validée par Entrée ou par le bouton Valider ;
// - 1 ou 2 choix : des boutons ;
// - toujours en bouton : les actions `bouton: true` (déplacements : nord, est…)
//   et l'action de retour.
//
// L'action de retour (Échap ou Retour arrière) est celle marquée `retour: true`,
// ou à défaut celle dont le libellé commence par « Retour » ou « Annuler ».
//
// Les choix sont recréés à chaque tour dans un groupe nommé par le texte du tour,
// et le focus va sur le premier choix. NVDA annonce le nom d'un groupe quand le
// focus y entre, en mode navigation comme en mode formulaire : le joueur entend
// le texte du tour, puis le choix. Le groupe doit être un nouvel élément à chaque
// tour, sinon NVDA ne le réannonce pas.

import { terminerTour, annoncer } from './narration.js';

const RETOUR_PAR_LIBELLE = /^(Retour|Annuler)\b/;
const SEUIL_LISTE_DEROULANTE = 3;

let _actionRetour = null;

export function afficherActions(actions) {
  const $liste = _viderListe();

  if (!actions || actions.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucune action disponible.';
    li.tabIndex = -1;
    $liste.appendChild(li);
    _placerFocus(li);
    return;
  }

  _actionRetour = actions.find(a => a.retour && !a.desactive)
    ?? actions.find(a => RETOUR_PAR_LIBELLE.test(a.label) && !a.desactive)
    ?? null;

  const enBouton  = a => a === _actionRetour || a.bouton;
  const aLister   = actions.filter(a => !enBouton(a));
  const deroulant = aLister.length >= SEUIL_LISTE_DEROULANTE;

  let premier = null;

  if (deroulant) {
    premier = _creerListeDeroulante($liste, aLister);
  }

  for (const a of actions) {
    if (deroulant && !enBouton(a)) continue;
    const btn = _creerBouton($liste, a);
    if (!premier && !btn.disabled) premier = btn;
  }

  _placerFocus(premier);
}

function _creerListeDeroulante($liste, choix) {
  const li = document.createElement('li');
  li.className = 'choix-deroulant';

  const label = document.createElement('label');
  label.htmlFor = 'liste-choix';
  label.textContent = 'Votre choix';

  const select = document.createElement('select');
  select.id = 'liste-choix';
  choix.forEach((a, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = a.label;
    option.disabled = !!a.desactive;
    select.appendChild(option);
  });
  const premierActif = choix.findIndex(a => !a.desactive);
  select.value = String(Math.max(0, premierActif));

  const valider = () => {
    const a = choix[Number(select.value)];
    if (!a || a.desactive) {
      annoncer('Ce choix est indisponible.');
      return;
    }
    a.action();
  };

  select.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); valider(); }
  });

  li.append(label, select);
  $liste.appendChild(li);

  _creerBouton($liste, { label: 'Valider le choix', action: valider });
  return select;
}

function _creerBouton($liste, a) {
  const li  = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';

  if (a === _actionRetour) {
    btn.setAttribute('aria-keyshortcuts', 'Escape Backspace');
    btn.setAttribute('aria-label', `${a.label}, touche Échap ou Retour arrière`);
    const libelle = document.createElement('span');
    libelle.textContent = a.label;
    const touche = document.createElement('span');
    touche.className = 'raccourci';
    touche.textContent = 'Échap';
    btn.append(libelle, touche);
  } else {
    btn.textContent = a.label;
  }

  if (a.desactive) {
    btn.disabled = true;
  } else {
    btn.addEventListener('click', a.action);
  }

  li.appendChild(btn);
  $liste.appendChild(li);
  return btn;
}

// Champ texte accessible : libellé explicite, erreur liée au champ,
// Entrée pour valider, Échap pour annuler si onAnnuler est fourni.
export function demanderTexte({ question, exemple, onValider, onAnnuler }) {
  const $liste = _viderListe();
  const tour   = terminerTour();
  if (tour) _nommerGroupe($liste, tour);

  const li    = document.createElement('li');
  li.className = 'saisie';

  const label = document.createElement('label');
  label.htmlFor = 'champ-saisie';
  const phrase = /[.?!:]$/.test(question) ? question : `${question}.`;
  label.textContent = exemple ? `${phrase} Exemple : ${exemple}.` : phrase;

  const input = document.createElement('input');
  input.type = 'text';
  input.id   = 'champ-saisie';
  input.autocomplete = 'off';
  input.setAttribute('aria-describedby', 'erreur-saisie');

  const erreur = document.createElement('p');
  erreur.id = 'erreur-saisie';
  erreur.className = 'erreur';

  li.append(label, input, erreur);
  $liste.appendChild(li);

  const valider = () => {
    const val = input.value.trim();
    if (!val) {
      input.setAttribute('aria-invalid', 'true');
      erreur.textContent = 'Le champ est vide. Écrivez une réponse, puis appuyez sur Entrée.';
      annoncer(erreur.textContent);
      input.focus();
      return;
    }
    onValider(val);
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); valider(); }
  });

  const boutons = [{ label: 'Valider', action: valider }];
  if (onAnnuler) boutons.push({ label: 'Annuler', action: onAnnuler, retour: true });
  _actionRetour = onAnnuler ? boutons[1] : null;

  boutons.forEach((b) => {
    const liBtn = document.createElement('li');
    const btn   = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.label;
    if (b.retour) btn.setAttribute('aria-keyshortcuts', 'Escape Backspace');
    btn.addEventListener('click', b.action);
    liBtn.appendChild(btn);
    $liste.appendChild(liBtn);
  });

  input.focus();
}

// Appelé par la touche Échap. Renvoie false s'il n'y a pas de retour possible.
export function declencherRetour() {
  if (!_actionRetour) {
    annoncer('Aucun retour possible ici.');
    return false;
  }
  _actionRetour.action();
  return true;
}

// Flèches haut/bas, Début, Fin entre les boutons de la liste (mode formulaire de NVDA).
export function deplacerFocusActions(touche) {
  const boutons = [...document.querySelectorAll('#liste-actions button:not([disabled])')];
  const index   = boutons.indexOf(document.activeElement);
  if (index === -1 || boutons.length === 0) return false;

  let cible;
  switch (touche) {
    case 'ArrowDown': cible = boutons[(index + 1) % boutons.length]; break;
    case 'ArrowUp':   cible = boutons[(index - 1 + boutons.length) % boutons.length]; break;
    case 'Home':      cible = boutons[0]; break;
    case 'End':       cible = boutons[boutons.length - 1]; break;
    default:          return false;
  }
  cible.focus();
  return true;
}

// ---- Interne ----

function _viderListe() {
  const $zone = document.getElementById('zone-actions');
  $zone.querySelector('.groupe-choix')?.remove();

  const $groupe = document.createElement('div');
  $groupe.className = 'groupe-choix';
  $groupe.setAttribute('role', 'group');

  const $liste = document.createElement('ul');
  $liste.id = 'liste-actions';

  $groupe.appendChild($liste);
  $zone.appendChild($groupe);
  _actionRetour = null;
  return $liste;
}

let _compteurTours = 0;

function _nommerGroupe($liste, tour) {
  if (!tour.id) tour.id = `tour-${++_compteurTours}`;
  $liste.parentElement.setAttribute('aria-labelledby', tour.id);
}

// Le texte du tour sert de nom au groupe ; le focus va sur le premier choix.
function _placerFocus(premier) {
  const tour = terminerTour();
  const $liste = document.getElementById('liste-actions');
  if (tour) _nommerGroupe($liste, tour);
  premier?.focus();
}
