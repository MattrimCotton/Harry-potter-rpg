// Zone d'actions : les choix du moment, sous forme de vrais boutons dans une liste.
//
// Format d'une action :
// { label: string, action: () => void, desactive?: bool, retour?: bool }
//
// L'action de retour (touche Échap) est celle marquée `retour: true`,
// ou à défaut celle dont le libellé commence par « Retour » ou « Annuler ».

import { terminerTour, annoncer } from './narration.js';

const RETOUR_PAR_LIBELLE = /^(Retour|Annuler)\b/;

let _actionRetour = null;

export function afficherActions(actions) {
  const $liste = _viderListe();

  if (!actions || actions.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucune action disponible.';
    $liste.appendChild(li);
    _placerFocus(null);
    return;
  }

  _actionRetour = actions.find(a => a.retour && !a.desactive)
    ?? actions.find(a => RETOUR_PAR_LIBELLE.test(a.label) && !a.desactive)
    ?? null;

  actions.forEach((a) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';

    if (a === _actionRetour) {
      btn.setAttribute('aria-keyshortcuts', 'Escape');
      btn.setAttribute('aria-label', `${a.label}, touche Échap`);
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
  });

  _placerFocus($liste.querySelector('button:not([disabled])'));
}

// Champ texte accessible : libellé explicite, erreur liée au champ,
// Entrée pour valider, Échap pour annuler si onAnnuler est fourni.
export function demanderTexte({ question, exemple, onValider, onAnnuler }) {
  const $liste = _viderListe();
  const tour   = terminerTour();

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
    if (b.retour) btn.setAttribute('aria-keyshortcuts', 'Escape');
    btn.addEventListener('click', b.action);
    liBtn.appendChild(btn);
    $liste.appendChild(liBtn);
  });

  // Le texte du tour (résultat de dé, contexte) est lu comme description du champ,
  // car le focus va directement dans le champ.
  if (tour) {
    tour.id = tour.id || `tour-${Date.now()}`;
    input.setAttribute('aria-describedby', `${tour.id} erreur-saisie`);
  }
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
  const $liste = document.getElementById('liste-actions');
  $liste.innerHTML = '';
  _actionRetour = null;
  return $liste;
}

// Le focus va au début du nouveau texte s'il y en a, sinon au premier bouton.
function _placerFocus(premierBouton) {
  const tour = terminerTour();
  if (tour) {
    tour.focus();
  } else if (premierBouton) {
    premierBouton.focus();
  }
}
