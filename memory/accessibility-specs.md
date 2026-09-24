# Spécifications accessibilité

Public : personnes entièrement aveugles. Lecteur d'écran prioritaire : **NVDA + Firefox/Chrome**, puis VoiceOver + Safari, Orca + Firefox, JAWS + Chrome. Référence : WCAG 2.2 niveau AA au minimum.

## Structure de la page (`index.html`)

- `<html lang="fr">`, un seul `<h1>`, lien d'évitement « Aller aux actions » → `#zone-actions`.
- `<main id="contenu-principal" tabindex="-1">`.
- `#narration` : `role="log"`, `aria-live="polite"`, `aria-relevant="additions"`, `aria-atomic="false"`, `tabindex="-1"`. Histoire cumulative.
- `#alerte` : `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"`, visuellement masqué. Résultats de dés et alertes.
- `#statut` : `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, masqué. Messages brefs (sauvegarde, XP…).
- `<nav id="zone-actions" aria-label="Actions disponibles">` contenant `<ul id="liste-actions">` de `<button>`.
- `<aside id="fiche-personnage" hidden>` : sections Traits, États, Sorts, Amis, Chance. Lue via F1-F5.

## Règles d'annonce (`narration.js`)

Tout le texte passe par ce module, jamais d'écriture directe dans le DOM ailleurs.
- `narrer(texte)` : ajoute un `<p>` au log (polite).
- `narrerFrais(texte)` : vide le log puis écrit (changement d'écran).
- `alerter(texte)` : région assertive, vidée puis remplie au frame suivant pour forcer la ré-annonce d'un texte identique. **Réservé aux dés et aux événements importants** — trop d'assertif coupe la narration.
- `statuer(texte)` : région status, même technique de vidage.
- `relire()` : Espace ; rejoue le dernier message (TTS ou région assertive préfixée « Répétition : »).
- Mémorise `dernierMessage` pour la relecture.

## Annonce des dés (`des.js`)

Format oral complet, sans symbole : « Jet de Bravoure. Dé 1 : 4. Dé 2 : 5. Sous-total : 9. Bravoure à plus 1. Total final : 10. Succès complet. » Les signes sont dits en toutes lettres (« plus 1 », « moins 1 », « zéro ») car « +1 »/« -1 » sont mal lus par certaines synthèses.

## Boutons (`actions.js`)

- Chaque action est un vrai `<button>` dans un `<li>`.
- Avec raccourci : `aria-label="<label>, raccourci <touche>"`, les `<span>` visuels sont en `aria-hidden`.
- Après chaque rendu, **focus sur le premier bouton actif**. Le rendu remplace toute la liste.

## Clavier (`clavier.js`)

Ignoré quand le focus est dans `INPUT`, `TEXTAREA`, `SELECT`.

| Touche | Action | État |
|---|---|---|
| Tab / Maj+Tab | naviguer | natif |
| Entrée / Espace sur bouton | activer | natif |
| Espace hors bouton | relire | fait |
| F1-F5 | fiche : traits, états, sorts, amis, chance | fait |
| R | relancer (`etat.derniereAction`) | fait |
| S | sauvegarder | fait |
| Échap | retour / annuler | **annoncé dans l'aide, non implémenté** |
| Flèches | naviguer dans les listes | **annoncé dans l'aide, non implémenté** |

## Synthèse vocale (Web Speech API)

`lang='fr-FR'`, vitesse et volume réglables via `configurerTTS({ actif, vitesse, volume })`. Désactivée par défaut : le lecteur d'écran fait déjà le travail, et parler en double est gênant. Le TTS sert aux joueurs sans lecteur d'écran (malvoyants, dyslexiques).

## Style (`style.css`)

Classe `.sr-seul` pour le texte réservé aux lecteurs d'écran, focus visible, lien d'évitement visible au focus.

## Dette d'accessibilité (à traiter en priorité)

1. **Échap et flèches** promis dans l'aide mais non gérés. Flèches : mettre en place un *roving tabindex* sur `#liste-actions` (Haut/Bas, Début/Fin). Échap : pile de retour par écran.
2. **Réglages TTS sans interface** : `configurerTTS` n'est jamais appelé. Ajouter un écran Options (activer, vitesse, volume, voix) et le sauvegarder.
3. **Raccourcis à une lettre (R, S)** : en mode navigation, NVDA/JAWS interceptent déjà R (région) et S (séparateur) ; et WCAG 2.1.4 demande qu'on puisse les désactiver ou les remapper. Proposer des alternatives avec modificateur (Alt+R, Alt+S) et une option pour couper les raccourcis simples.
4. **F1 et F5** : F1 ouvre l'aide du navigateur dans certains contextes, F5 recharge la page si `preventDefault` échoue (par exemple focus dans un champ, où `clavier.js` sort tôt). Risque de perte de partie : sauvegarder avant `beforeunload` et envisager des alternatives (Alt+1 à Alt+5).
5. **Mode application** : vérifier qu'NVDA passe bien en mode formulaire sur les boutons. Ne pas mettre `role="application"` sur toute la page.
6. **Log qui grossit** : `#narration` n'est jamais tronqué en jeu. Prévoir un historique consultable (titres par scène `<h3>`) pour que le joueur puisse relire avec les flèches du lecteur d'écran.
7. **Focus après `narrerFrais`** : quand il n'y a pas de bouton (écran vide), le focus peut se perdre sur `body`. Replacer le focus sur `#narration` ou `#contenu-principal`.
8. **Champs texte de la création** : vérifier `<label>` explicite, message d'erreur lié via `aria-describedby`, et soumission à Entrée.

## Checklist avant chaque fonctionnalité d'interface

- Tout est annoncé en texte, rien n'est seulement visuel ni seulement sonore.
- Focus explicite après chaque action, jamais perdu sur `body`.
- Aucun délai ni temporisation.
- Phrases courtes, pas d'abréviations, nombres et signes écrits pour l'oral.
- Tester avec NVDA + Firefox, en mode navigation et en mode formulaire.
- Outils automatiques disponibles dans l'environnement : serveurs MCP `a11y-accessibility` (axe) et `web-a11y`. Ils ne remplacent pas un test au lecteur d'écran.
