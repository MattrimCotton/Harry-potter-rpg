// Module central d'annonces, pensé pour NVDA en mode navigation.
//
// Le texte du jeu est regroupé en « tours » : tout ce qui est narré entre deux
// affichages de choix. Quand les choix s'affichent, le focus se place au début
// du tour : NVDA le lit, puis la flèche bas mène naturellement aux boutons.
// On évite les régions live pour la narration, car un déplacement de focus
// coupe la parole de NVDA et le texte serait perdu.
//
// Les régions live ne servent qu'aux annonces sans changement de focus
// (fiche F1-F5, sauvegarde, erreurs de saisie).

const MAX_TOURS = 50;

const $narration = document.getElementById('narration');
const $alerte    = document.getElementById('alerte');
const $statut    = document.getElementById('statut');

let _tourCourant  = null;
let _dernierTour  = null;
let _verification = null;

// ---- Contenu du tour ----

export function narrer(texte) {
  _ajouterParagraphe(texte);
}

// Début d'un nouvel écran : même tour, mais séparé visuellement.
export function narrerFrais(texte) {
  _ajouterParagraphe(texte, 'nouvel-ecran');
}

// Information importante du tour (résultat de dés, choix confirmé).
export function alerter(texte) {
  _ajouterParagraphe(texte, 'important');
}

// Ferme le tour en cours et le renvoie, pour que actions.js y place le focus.
export function terminerTour() {
  clearTimeout(_verification);
  const tour = _tourCourant;
  _tourCourant = null;
  if (tour) _dernierTour = tour;
  return tour;
}

// Replace le focus au début du dernier tour (touche F9).
export function relire() {
  const cible = _tourCourant ?? _dernierTour;
  if (!cible || !cible.isConnected) {
    annoncer('Rien à relire pour l\'instant.');
    return;
  }
  cible.focus();
}

// ---- Annonces sans déplacement de focus ----

export function annoncer(texte, { urgent = true } = {}) {
  if (!texte) return;
  const $region = urgent ? $alerte : $statut;
  // Vider puis remplir un peu plus tard force la ré-annonce d'un texte identique
  $region.textContent = '';
  setTimeout(() => { $region.textContent = texte; }, 50);
}

export function statuer(texte) {
  annoncer(texte, { urgent: false });
}

// ---- Interne ----

function _ajouterParagraphe(texte, classe) {
  if (!texte) return;

  if (!_tourCourant) {
    _tourCourant = document.createElement('div');
    _tourCourant.className = 'tour';
    _tourCourant.tabIndex = -1;
    $narration.appendChild(_tourCourant);
    _elaguerHistorique();
  }

  const p = document.createElement('p');
  p.textContent = texte;
  if (classe) p.className = classe;
  _tourCourant.appendChild(p);
  _tourCourant.scrollIntoView({ block: 'nearest' });

  // Filet de sécurité : si aucun choix ne s'affiche après ce texte
  // (message d'erreur isolé), l'annoncer pour qu'il ne reste pas muet.
  clearTimeout(_verification);
  _verification = setTimeout(_annoncerTourOrphelin, 0);
}

function _annoncerTourOrphelin() {
  if (!_tourCourant) return;
  annoncer([..._tourCourant.children].map(p => p.textContent).join(' '));
  terminerTour();
}

function _elaguerHistorique() {
  const tours = $narration.querySelectorAll('.tour');
  for (let i = 0; i < tours.length - MAX_TOURS; i++) tours[i].remove();
}
