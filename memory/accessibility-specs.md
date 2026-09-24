# Spécifications accessibilité

Public : personnes entièrement aveugles. **Référence absolue : NVDA en mode navigation**, avec Firefox ou Chrome. Puis VoiceOver + Safari, Orca + Firefox, JAWS + Chrome. WCAG 2.2 niveau AA au minimum.

**Pas de synthèse vocale intégrée** (retirée le 2026-09-24, décision de l'utilisateur) : le jeu se joue avec NVDA, qui lit tout.

## Contrainte de base : le mode navigation de NVDA

En mode navigation, NVDA garde pour lui les lettres (navigation rapide), les chiffres, Espace, Entrée et les flèches. Ces touches **n'arrivent jamais à la page**. Conséquences :
- Pas de raccourci à une lettre (et WCAG 2.1.4 les déconseille de toute façon).
- Raccourcis uniquement sur les touches F et Échap, que NVDA laisse passer.
- Chaque raccourci existe aussi en bouton (zone « Fiche et outils »), car sur un portable il faut souvent Fn.
- Les flèches ne sont gérées par le jeu que dans la liste d'actions, quand NVDA est en mode formulaire.

## Modèle de lecture : les « tours » (`narration.js`)

Un tour = tout le texte produit entre deux affichages de choix. Il est ajouté à l'historique `#narration` dans un `<div class="tour" tabindex="-1">`.

Quand `afficherActions()` affiche les choix, le focus va **au début du nouveau tour**. NVDA le lit, et la flèche bas mène au reste du texte puis aux boutons, qui suivent dans le DOM. S'il n'y a pas de nouveau texte, le focus va sur le premier bouton actif.

**Pourquoi pas de région live pour la narration** : un déplacement de focus coupe la parole de NVDA. Remplir une région live puis déplacer le focus fait perdre le texte, et laisser le focus en place est impossible puisque les boutons sont remplacés.

API :
- `narrer(texte)` : paragraphe dans le tour.
- `narrerFrais(texte)` : idem, marqué comme début d'écran (séparation visuelle seulement). Ne coupe **pas** le tour : un résultat annoncé juste avant reste lu.
- `alerter(texte)` : paragraphe important (en gras). Plus de région assertive.
- `terminerTour()` : ferme le tour et le renvoie (utilisé par `actions.js`).
- `relire()` : F9, remet le focus au début du dernier tour.
- `annoncer(texte, { urgent })` / `statuer(texte)` : régions `#alerte` (role alert) et `#statut` (role status), **seulement quand le focus ne bouge pas** (fiche F1-F5, sauvegarde F8, champ vide, « Aucun retour possible »). Vidage puis remplissage 50 ms plus tard pour forcer la ré-annonce.
- Filet de sécurité : si du texte est narré sans être suivi de choix (message d'erreur isolé), il est annoncé par la région alert.
- L'historique est limité aux 50 derniers tours.

Règle pour les chargements JSON : **charger d'abord, narrer ensuite**. Sinon le filet de sécurité annonce le texte avant l'arrivée des choix, et il est lu deux fois.

## Boutons (`actions.js`)

- Vrais `<button type="button">` dans `<ul id="liste-actions">`.
- Action de retour (Échap) : `retour: true`, ou libellé commençant par « Retour » ou « Annuler ». Le bouton porte `aria-keyshortcuts="Escape"` et le libellé « …, touche Échap ».
- Sans retour possible, Échap annonce « Aucun retour possible ici ».
- Flèches haut/bas (en boucle), Début, Fin entre les boutons actifs.

## Saisie de texte (`demanderTexte`)

Un seul composant pour tout le jeu : `<label for>` explicite avec phrase complète et exemple, erreur dans `#erreur-saisie` liée par `aria-describedby`, `aria-invalid`, Entrée pour valider, bouton Valider, Annuler optionnel (Échap). Le focus va directement dans le champ. Le tour en cours (résultat de dé, contexte) est ajouté à `aria-describedby` pour être lu avec le libellé. Pas de `placeholder`.

## Raccourcis (`clavier.js`)

| Touche | Action |
|---|---|
| F1 à F5 | Traits, États, Sorts, Amis et rivaux, Chance et expérience (annonce, focus inchangé) |
| F8 | Sauvegarder (annoncé) |
| F9 | Revenir au début du dernier tour |
| Échap | Retour / annuler |
| Flèches, Début, Fin | Parcourir les choix (mode formulaire) |

Les touches F sont interceptées même dans un champ texte, pour que F5 ne recharge jamais la page. Les combinaisons avec Alt, Ctrl ou Méta sont ignorées.

## Sauvegarde

Automatique et **silencieuse** après chaque jet et chaque changement. Une annonce à chaque tour se mêlerait à la lecture. Seule F8 annonce « Partie sauvegardée ».

## Rédaction pour l'oreille

- Nombres et signes en toutes lettres : « plus 1 », « moins 2 », « zéro ».
- Élision : « Jet d'Intellect », « Jet de Magie » (helper `_de()`).
- Dés : « Jet de Ruse plus 2, et plus 1 de bonus de matière préférée, Potions. Dés : 4 et 5, soit 9. Total : 12. Succès complet. »
- Pas de redite : ne pas annoncer deux fois le même résultat dans un tour.
- Libellés de boutons autonomes : ils doivent se comprendre seuls (valeur du trait, coût en Chance, ce qui est indisponible et pourquoi).
- Listes longues : les regrouper en sous-menus (le menu de jeu a un sous-menu « Faire une manœuvre libre »).

## Page (`index.html`)

`<main>` : section Histoire (`#narration`), `nav#zone-actions`, `nav#zone-outils`, régions `#alerte` et `#statut`. Hors `<main>` : `section#aide` (focusable, atteinte par le bouton Aide), `aside#fiche-personnage` (visuel).

## Vérifications

- axe-core (serveur MCP `a11y-accessibility`) : 0 violation le 2026-09-24 (WCAG 2.2 AA + bonnes pratiques).
- Test automatisé du focus dans le navigateur intégré : création complète, manœuvres, Échap, F1, F9, flèches, scénario. OK.
- **À faire : test réel avec NVDA + Firefox.** Point à vérifier en priorité : quand le focus arrive sur un tour de plusieurs paragraphes, NVDA lit-il tout le tour ou seulement le premier paragraphe ? Si seulement le premier, envisager un seul paragraphe par tour.

## Dette restante

- Tours de plusieurs paragraphes : voir ci-dessus.
- Listes de sorts longues (jusqu'à 30 boutons en 3e année) : envisager un regroupement par Année ou par type.
- Création de personnage : Échap ne revient pas à l'étape précédente (sauf au Patronus).
- Le moteur de scénario ne lance pas le jet de survie quand les 8 États sont cochés (le menu de jeu, oui).
