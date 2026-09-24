// Zone d'actions : les choix du moment.
//
// Format d'une action :
// { label: string, action: () => void, desactive?: bool, retour?: bool, bouton?: bool, principal?: bool }
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
// Quand des choix s'affichent après du texte nouveau, le curseur se place au
// début de ce texte (demande de l'utilisateur) ; les choix suivent dans la page.
// Sans texte nouveau (retour en arrière, par exemple), il va sur le premier choix.

import { terminerTour, allerAuTour, annoncer } from './narration.js';

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

  const label = document.createElement('label');
  label.htmlFor = 'liste-choix';
  label.className = 'form-label';
  label.textContent = 'Votre choix';

  const select = document.createElement('select');
  select.id = 'liste-choix';
  select.className = 'form-select form-select-lg';
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

  // Nécessaire en mode navigation : NVDA n'y transmet pas Entrée à la liste.
  _creerBouton($liste, { label: 'Valider le choix', action: valider, principal: true });
  return select;
}

function _creerBouton($liste, a) {
  const li  = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = a.label;

  if (a === _actionRetour) {
    // La touche est déclarée une seule fois (aria-keyshortcuts) ; l'indication
    // visible est masquée à NVDA pour éviter qu'il la dise deux fois.
    btn.className = 'btn btn-outline-secondary w-100 text-start';
    btn.setAttribute('aria-keyshortcuts', 'Escape Backspace');
    const touche = document.createElement('kbd');
    touche.className = 'ms-2';
    touche.setAttribute('aria-hidden', 'true');
    touche.textContent = 'Échap';
    btn.appendChild(touche);
  } else {
    btn.className = a.principal
      ? 'btn btn-warning w-100 text-start'
      : 'btn btn-outline-light w-100 text-start';
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

  const li    = document.createElement('li');

  const label = document.createElement('label');
  label.htmlFor = 'champ-saisie';
  label.className = 'form-label';
  const phrase = /[.?!:]$/.test(question) ? question : `${question}.`;
  label.textContent = exemple ? `${phrase} Exemple : ${exemple}.` : phrase;

  const input = document.createElement('input');
  input.type = 'text';
  input.id   = 'champ-saisie';
  input.className = 'form-control form-control-lg';
  input.autocomplete = 'off';
  input.setAttribute('aria-describedby', 'erreur-saisie');

  const erreur = document.createElement('p');
  erreur.id = 'erreur-saisie';
  erreur.className = 'invalid-feedback d-block';

  li.append(label, input, erreur);
  $liste.appendChild(li);

  const valider = () => {
    const val = input.value.trim();
    if (!val) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('is-invalid');
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

  _creerBouton($liste, { label: 'Valider', action: valider, principal: true });
  if (onAnnuler) {
    _actionRetour = { label: 'Annuler', action: onAnnuler, retour: true };
    _creerBouton($liste, _actionRetour);
  }

  if (!allerAuTour(tour)) input.focus();
}

// Affiche un contenu libre (un formulaire complet, par exemple) à la place des
// choix. Le curseur va au début du texte nouveau, sinon sur `cibleFocus`.
// `retour` (facultatif) : action déclenchée par Échap ou Retour arrière.
export function afficherContenu($contenu, cibleFocus, retour = null) {
  const $liste = _viderListe();
  const li = document.createElement('li');
  li.appendChild($contenu);
  $liste.appendChild(li);
  _actionRetour = retour;
  _placerFocus(cibleFocus);
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

  const $liste = document.createElement('ul');
  $liste.id = 'liste-actions';
  $liste.className = 'list-unstyled d-grid gap-2 mb-0';

  $groupe.appendChild($liste);
  $zone.appendChild($groupe);
  _actionRetour = null;
  return $liste;
}

// Curseur au début du texte nouveau s'il y en a, sinon sur le premier choix.
function _placerFocus(premier) {
  if (!allerAuTour(terminerTour())) premier?.focus();
}
