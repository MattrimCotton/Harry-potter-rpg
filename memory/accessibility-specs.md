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
- Le texte d'un tour doit être lu **sans que le joueur ait à le parcourir avec les flèches** (impossible en mode formulaire).
- Pas de raccourci à une lettre (WCAG 2.1.4).
- Chaque raccourci existe aussi en bouton (zone « Fiche et outils »).

## Modèle de lecture : les « tours »

Un tour = tout le texte produit entre deux affichages de choix. Il est ajouté à l'historique `#narration` dans un `<div class="tour">`, lisible en mode navigation.

Quand les choix s'affichent, `actions.js` **recrée** un `<div class="groupe-choix" role="group" aria-labelledby="tour-N">` contenant `<ul id="liste-actions">`, puis met le focus sur le premier choix. NVDA annonce le nom d'un groupe quand le focus y entre, dans les deux modes : le joueur entend le texte du tour, puis « groupe », puis le choix.

Le groupe doit être un **nouvel élément à chaque tour** : si le focus reste dans le même groupe, NVDA ne réannonce pas son nom, même s'il a changé.

Sans nouveau texte (par exemple après un Retour), le groupe n'a pas de nom et NVDA lit seulement le choix.

**Pourquoi pas de région live pour la narration** : un déplacement de focus coupe la parole de NVDA, et le texte serait perdu. Première version (abandonnée) : le focus allait sur le `div` du tour ; en mode formulaire, NVDA ne lit pas le contenu d'un `div` non interactif de façon fiable.

API (`narration.js`) :
- `narrer(texte)` : paragraphe dans le tour.
- `narrerFrais(texte)` : idem, marqué comme début d'écran (séparation visuelle seulement). Ne coupe **pas** le tour.
- `alerter(texte)` : paragraphe important (en gras).
- `terminerTour()` : ferme le tour et le renvoie ; `actions.js` en fait le nom du groupe.
- `relire()` : F9, annonce le dernier tour dans la région alert, **sans déplacer le focus**.
- `annoncer(texte, { urgent })` / `statuer(texte)` : régions `#alerte` (role alert) et `#statut` (role status), seulement quand le focus ne bouge pas (fiche F1-F5, F9, sauvegarde F8, champ vide, « Aucun retour possible »). Vidage puis remplissage 50 ms plus tard pour forcer la ré-annonce.
- Filet de sécurité : texte narré sans choix derrière (erreur isolée) → annoncé par la région alert.
- Historique limité aux 50 derniers tours.

Règle pour les chargements JSON : **charger d'abord, narrer ensuite**.

## Présentation des choix (`actions.js`) — décision de l'utilisateur, 2026-09-24

- **3 choix ou plus : liste déroulante** (`<select id="liste-choix">`, libellé « Votre choix »), validée par **Entrée** ou par le bouton « Valider le choix ». Les choix indisponibles sont des `<option disabled>` (NVDA dit « indisponible »). Le focus va sur la liste.
- **1 ou 2 choix : boutons.**
- **Toujours en bouton** : les déplacements (`bouton: true` ; dans un scénario JSON, `"deplacement": true` sur l'action) et l'action de retour.
- Seuil dans la constante `SEUIL_LISTE_DEROULANTE`.
- Action de retour : `retour: true`, ou libellé commençant par « Retour » ou « Annuler ». Bouton avec `aria-keyshortcuts="Escape Backspace"` et libellé « …, touche Échap ou Retour arrière ». Retour arrière fonctionne aussi quand le focus est sur la liste déroulante.
- Sans retour possible, Échap annonce « Aucun retour possible ici ».
- Flèches haut/bas, Début, Fin : entre les boutons en mode formulaire ; dans la liste, comportement natif (changer la sélection, sans valider).

## Saisie de texte (`demanderTexte`)

Un seul composant pour tout le jeu : `<label for>` explicite avec phrase complète et exemple, erreur dans `#erreur-saisie` liée par `aria-describedby`, `aria-invalid`, Entrée pour valider, bouton Valider, bouton Annuler optionnel (Échap ne marche pas dans un champ : NVDA la garde en mode formulaire ; Retour arrière efface du texte). Le champ est dans le groupe nommé par le tour, donc le contexte est lu avant le libellé. Le focus va directement dans le champ. Pas de `placeholder`.

## Raccourcis (`clavier.js`)

| Touche | Action |
|---|---|
| F1 à F5 | Traits, États, Sorts, Amis et rivaux, Chance et expérience (annonce, focus inchangé) |
| F8 | Sauvegarder (annoncé) |
| F9 | Relire le dernier tour (annonce, focus inchangé) |
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

## Page (`index.html`)

`<main>` : section Histoire (`#narration`), `nav#zone-actions`, `nav#zone-outils`, régions `#alerte` et `#statut`. Hors `<main>` : `details#aide` (**repliée par défaut**, décision de l'utilisateur ; le bouton Aide l'ouvre et place le focus sur son `summary` ; pas de titre dans le `summary`, qui se comporte comme un bouton), `aside#fiche-personnage` (visuel).

## Vérifications

- axe-core (serveur MCP `a11y-accessibility`) : 0 violation le 2026-09-24 (WCAG 2.2 AA + bonnes pratiques).
- Test automatisé du focus dans le navigateur intégré : création complète, manœuvres, Échap, F1, F9, flèches, scénario. OK.
- **À faire : test réel avec NVDA**, via le journal de NVDA au niveau « Entrée/sortie » (`%TEMP%\nvda.log`), dans les deux modes. À vérifier : le nom du groupe est-il lu en entier à chaque tour ? Échap passe-t-il en mode navigation ? Retour arrière dans les deux modes ?

## Dette restante

- Listes de sorts longues (jusqu'à 30 boutons en 3e année) : envisager un regroupement par Année ou par type.
- Création de personnage : Échap ne revient pas à l'étape précédente (sauf au Patronus).
- Le moteur de scénario ne lance pas le jet de survie quand les 8 États sont cochés (le menu de jeu, oui).
