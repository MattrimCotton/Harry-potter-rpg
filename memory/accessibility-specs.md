# Spécifications accessibilité

Public : personnes entièrement aveugles. **Référence absolue : NVDA, en mode navigation comme en mode formulaire**, avec Firefox ou Chrome. Puis VoiceOver + Safari, Orca + Firefox, JAWS + Chrome. WCAG 2.2 niveau AA au minimum.

**Pas de synthèse vocale intégrée** (retirée le 2026-09-24, décision de l'utilisateur) : le jeu se joue avec NVDA, qui lit tout.

## Contrainte de base : les deux modes de NVDA

**Tout doit fonctionner en mode navigation ET en mode formulaire** (rappel de l'utilisateur, 2026-09-24).

- Mode navigation : NVDA garde les lettres (navigation rapide), les chiffres, Espace, Entrée et les flèches. Elles n'arrivent pas à la page.
- Mode formulaire : toutes les touches arrivent à la page, **sauf Échap**, que NVDA garde pour revenir au mode navigation. Et les flèches ne lisent plus la page.

Conséquences :
- Raccourcis sur les touches F, que NVDA laisse passer dans les deux modes.
- Retour : Échap (mode navigation) **et** Retour arrière (les deux modes, ignoré dans un champ texte).
- Le curseur arrive sur un paragraphe (non interactif) : NVDA repasse de lui-même en mode navigation, et le joueur lit avec les flèches.
- Pas de raccourci à une lettre (WCAG 2.1.4).
- Chaque raccourci existe aussi en bouton (menu « Outils », replié par défaut).
- **Chaque touche n'est annoncée qu'une fois** : `aria-keyshortcuts` sur le bouton, et l'indication visible (`<kbd>`) en `aria-hidden`. Ne jamais mettre la touche dans le nom du bouton en plus : NVDA la dirait deux fois.

## Modèle de lecture : les « tours »

Un tour = tout le texte produit entre deux affichages de choix. Il est ajouté à l'historique `#narration` dans un `<div class="tour">`, lisible en mode navigation.

Quand les choix s'affichent, **le curseur se place au début du nouveau tour** : `allerAuTour()` met `tabindex="-1"` sur le premier paragraphe du tour et lui donne le focus. NVDA lit le paragraphe ; la flèche bas mène au reste du tour, puis aux choix (`nav#zone-actions`, juste après dans la page ; touche D de NVDA pour y sauter). Sans texte nouveau (retour arrière), focus sur le premier choix. Décision de l'utilisateur (2026-09-24) : ne jamais mettre le curseur directement sur les choix quand il y a du texte nouveau.


Sans nouveau texte (par exemple après un Retour), le groupe n'a pas de nom et NVDA lit seulement le choix.

**Pourquoi pas de région live pour la narration** : un déplacement de focus coupe la parole de NVDA, et le texte serait perdu. Historique : une version intermédiaire nommait le groupe de choix avec le texte du tour et mettait le focus sur le premier choix ; abandonnée à la demande de l'utilisateur, qui veut le curseur au début de la narration.

API (`src/js/ui/narration.js`) :
- `narrer(texte)` : paragraphe dans le tour.
- `narrerFrais(texte)` : idem, marqué comme début d'écran (séparation visuelle seulement). Ne coupe **pas** le tour.
- `alerter(texte)` : paragraphe important (en gras).
- `terminerTour()` : ferme le tour et le renvoie ; `choices.js` y place le curseur avec `allerAuTour()`.
- `relire()` : F9, ramène le curseur au début du dernier tour.
- `annoncer(texte, { urgent })` / `statuer(texte)` : régions `#alerte` (role alert) et `#statut` (role status), seulement quand le focus ne bouge pas (fiche F1-F5, F9, sauvegarde F8, champ vide, « Aucun retour possible »). Vidage puis remplissage 50 ms plus tard pour forcer la ré-annonce.
- Filet de sécurité : texte narré sans choix derrière (erreur isolée) → annoncé par la région alert.
- Historique limité aux 50 derniers tours.

Règle pour les chargements JSON : **charger d'abord, narrer ensuite**.

## Présentation des choix (`src/js/ui/choices.js`) — décision de l'utilisateur, 2026-09-24

- **3 choix ou plus : liste déroulante** (`<select id="liste-choix">`, libellé « Votre choix »), validée par **Entrée** ou par le bouton « Valider le choix ». Les choix indisponibles sont des `<option disabled>` (NVDA dit « indisponible »). Le focus va sur la liste.
- **1 ou 2 choix : boutons.**
- **Toujours en bouton** : les déplacements (`bouton: true` ; dans un scénario JSON, `"deplacement": true` sur l'action) et l'action de retour.
- Seuil dans la constante `SEUIL_LISTE_DEROULANTE`.
- Action de retour : `retour: true`, ou libellé commençant par « Retour » ou « Annuler ». Bouton avec `aria-keyshortcuts="Escape Backspace"` et libellé « …, touche Échap ou Retour arrière ». Retour arrière fonctionne aussi quand le focus est sur la liste déroulante.
- Sans retour possible, Échap annonce « Aucun retour possible ici ».
- Flèches haut/bas, Début, Fin : entre les boutons en mode formulaire ; dans la liste, comportement natif (changer la sélection, sans valider).

## Saisie de texte (`demanderTexte`)

Un seul composant pour tout le jeu : `<label for>` explicite avec phrase complète et exemple, erreur dans `#erreur-saisie` liée par `aria-describedby`, `aria-invalid`, Entrée pour valider, bouton Valider, bouton Annuler optionnel (Échap ne marche pas dans un champ : NVDA la garde en mode formulaire ; Retour arrière efface du texte). Le champ est dans le groupe nommé par le tour, donc le contexte est lu avant le libellé. Le focus va directement dans le champ. Pas de `placeholder`.

## Création du personnage (`src/js/engine/character-creation.js`) — décision de l'utilisateur, 2026-09-24

- **Tout sur une seule page** : un formulaire avec une section (`fieldset` + `legend`) par étape : Identité, Apparence, Baguette et ambition, Origine, Matière préférée, Sorts de départ, Traits, Maison, Ami et rival, Animal de compagnie, Patronus. Listes déroulantes pour les choix, champs texte pour les noms. Chaque liste commence par « À choisir ».
- **Bouton « Tout tirer au hasard »** en tête : tous les dés d'un coup, selon les tables du PDF (un seul dé pour ambition et bois, maison relancée sur 5 ou 6, matière en 2d6, Patronus en 2d6). Puis résumé avec chaque dé, et choix : Commencer, Relancer tous les dés, Modifier (formulaire pré-rempli).
- Listes dépendantes, mises à jour sans recharger : année → matières et sorts ; origine → nombre de listes de sorts ; maison → questions d'ami et de rival ; catégorie → animal du Patronus. Une liste en attente est désactivée avec le texte « Choisissez d'abord… ». Les changements hors de vue sont annoncés par la région status.
- Diplômé : connaît tous les sorts, rien à choisir.
- Validation à l'envoi : récapitulatif d'erreurs en tête (groupe recréé et nommé par son titre, focus sur le premier lien, chaque lien mène au champ), plus `aria-invalid` et message « Erreur : … » lié par `aria-describedby` sur chaque champ.
- **Chaque erreur dit précisément où et quoi** (demande de l'utilisateur) : « Section <légende>, <libellé du champ> : <problème>. <comment corriger>. » La section et le libellé sont lus dans le DOM (`legend`, `label`). Le titre du récapitulatif donne le nombre d'erreurs et les sections concernées.
- Cas précis : sort en double (« le sort X est déjà choisi dans Sort 1 sur 3 ») ; traits (chaque trait qui porte une valeur en trop est marqué, avec les autres traits qui ont la même valeur, et les valeurs pas encore utilisées).
- Le formulaire est affiché par `afficherContenu()` de `choices.js`, dans le groupe nommé par le tour.

## Raccourcis (`src/js/ui/keyboard.js`)

| Touche | Action |
|---|---|
| F1 à F5 | Traits, États, Sorts, Amis et rivaux, Chance et expérience (annonce, focus inchangé) |
| F8 | Sauvegarder (annoncé) |
| F9 | Revenir au début du dernier texte (curseur déplacé) |
| Échap | Retour / annuler, mode navigation |
| Retour arrière | Retour / annuler, les deux modes (sauf dans un champ texte) |
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
- Le jet de dés dit déjà « Succès complet » ou « Succès partiel » : le texte suivant ne le répète pas.

## Page (`src/index.html`) — Bootstrap pour toute l'interface (décision de l'utilisateur)

- Bootstrap 5.3.8 copié dans `src/lib/bootstrap/` (CSS, JS bundle, licence MIT) et intégré à `dist/hogwarts-rpg.html` par `tools/build.js` : **aucune connexion Internet**. Thème sombre `data-bs-theme="dark"`, `style.css` ne garde que les couleurs or, l'historique et la fiche.
- Composants : `card` (historique, fiche), `form-select` / `form-control` / `form-label` / `invalid-feedback` (choix et saisie), `btn` (choix, Valider en `btn-warning`, Retour en `btn-outline-secondary`), `collapse` (Outils, Aide), `list-group` (outils), `visually-hidden` et `visually-hidden-focusable` (lien d'évitement).
- `<main class="container">` : historique (`#narration`, corps de la carte), `nav#zone-actions`, menu **Outils** (bouton `aria-expanded` + `collapse`, **replié par défaut**), régions `#alerte` et `#statut`.
- `aside#fiche-personnage` : cartes visuelles.
- `<footer>` : **Aide, à un seul endroit**, bouton + `collapse` **replié par défaut**. Pas d'entrée d'aide dans le menu, l'accueil ou les outils.
- Collapse Bootstrap : NVDA annonce « réduit » / « développé » grâce à `aria-expanded`, mis à jour par Bootstrap.

## Vérifications

- axe-core (serveur MCP `a11y-accessibility`) : 0 violation le 2026-09-24 (WCAG 2.2 AA + bonnes pratiques).
- Test automatisé du focus dans le navigateur intégré : création complète, manœuvres, Échap, Retour arrière, F1, F9, flèches, listes déroulantes, scénario, repli/dépli Outils et Aide. OK.
- **À faire : test réel avec NVDA**, via le journal de NVDA au niveau « Entrée/sortie » (`%TEMP%\nvda.log`), dans les deux modes. À vérifier : NVDA lit-il bien le premier paragraphe quand le curseur y arrive, et repasse-t-il en mode navigation ? Échap en mode navigation ? Retour arrière dans les deux modes ?

## Dette restante

- Listes de sorts longues (jusqu'à 30 boutons en 3e année) : envisager un regroupement par Année ou par type.
- Création de personnage : Échap ne revient pas à l'étape précédente (sauf au Patronus).
- Le moteur de scénario ne lance pas le jet de survie quand les 8 États sont cochés (le menu de jeu, oui).
