// Module central d'annonces — ARIA live regions + TTS optionnel.
// TOUT le texte du jeu passe par ce module.
// Par défaut, le lecteur d'écran (NVDA, VoiceOver…) gère les annonces via ARIA.
// Le TTS du navigateur est un complément optionnel configurable.

const $narration = document.getElementById('narration');
const $alerte    = document.getElementById('alerte');
const $statut    = document.getElementById('statut');

let dernierMessage = '';
let ttsActif  = false;
let vitesseTTS = 1.0;
let volumeTTS  = 1.0;

// ---- Configuration ----

export function configurerTTS({ actif, vitesse, volume } = {}) {
  if (actif   !== undefined) ttsActif   = actif;
  if (vitesse !== undefined) vitesseTTS = vitesse;
  if (volume  !== undefined) volumeTTS  = volume;
}

export function ttsEstActif() {
  return ttsActif;
}

// ---- Fonctions publiques ----

// Ajoute un paragraphe au log narratif (aria-live="polite").
// Le lecteur d'écran le lit dès qu'il est disponible.
export function narrer(texte) {
  if (!texte) return;
  dernierMessage = texte;

  const p = document.createElement('p');
  p.textContent = texte;
  $narration.appendChild(p);
  $narration.scrollTop = $narration.scrollHeight;

  if (ttsActif) _dire(texte);
}

// Efface le log narratif puis pose un nouveau texte.
// Utile pour les transitions d'écran.
export function narrerFrais(texte) {
  if (!texte) return;
  dernierMessage = texte;

  $narration.textContent = '';
  const p = document.createElement('p');
  p.textContent = texte;
  $narration.appendChild(p);

  if (ttsActif) _dire(texte, true);
}

// Annonce immédiate via aria-live="assertive".
// Interrompt le lecteur d'écran. Réservé aux résultats de dés et alertes importantes.
export function alerter(texte) {
  if (!texte) return;
  dernierMessage = texte;

  // Vider avant de remplir force la ré-annonce même si le texte est identique
  $alerte.textContent = '';
  requestAnimationFrame(() => {
    $alerte.textContent = texte;
    if (ttsActif) _dire(texte, true);
  });
}

// Statut bref, non-interruptif (rôle="status").
export function statuer(texte) {
  $statut.textContent = '';
  requestAnimationFrame(() => {
    $statut.textContent = texte;
  });
}

// Relit le dernier message annoncé (touche Espace).
export function relire() {
  if (!dernierMessage) return;

  if (ttsActif) {
    _dire(dernierMessage, true);
  } else {
    // Sans TTS : forcer NVDA/VoiceOver à relire via la région assertive
    $alerte.textContent = '';
    requestAnimationFrame(() => {
      $alerte.textContent = 'Répétition : ' + dernierMessage;
    });
  }
}

// ---- Fonction TTS interne ----

function _dire(texte, interrompre = false) {
  if (!('speechSynthesis' in window)) return;
  if (interrompre) speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(texte);
  u.lang   = 'fr-FR';
  u.rate   = vitesseTTS;
  u.volume = volumeTTS;
  speechSynthesis.speak(u);
}
