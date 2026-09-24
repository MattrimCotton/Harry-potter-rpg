# CLAUDE.md — Poudlard RPG

## Lecture obligatoire au démarrage

Au début de chaque session, tu dois :
1. Lire `memory/MEMORY.md` pour charger l'index mémoire
2. Lire les fichiers mémoire pertinents à la tâche en cours (voir section Mémoire ci-dessous)
3. Annoncer brièvement à l'utilisateur ce que tu as chargé

À la fin de chaque session, tu dois mettre à jour les fichiers mémoire si :
- Une décision technique a été prise
- Une fonctionnalité a été implémentée ou modifiée
- Le contexte du projet a évolué

---

## Fichiers mémoire

- **`memory/MEMORY.md`** — Index principal (lire en premier)
- **`memory/user-profile.md`** — Profil développeur & expertise
- **`memory/project-context.md`** — Objectifs, stack technique, architecture, état d'avancement
- **`memory/game-rules.md`** — Règles complètes du système PbtA pour implémentation (traits, jets, manœuvres, états, progression, sorts, patronus) — **lire avant d'implémenter la mécanique de jeu**
- **`memory/accessibility-specs.md`** — Spécifications techniques détaillées (ARIA, focus management, raccourcis clavier) — **lire avant toute implémentation d'interface**

---

## Résumé du projet

**Poudlard RPG** — Jeu de rôle solo dans l'univers Harry Potter, jouable en mode texte uniquement, entièrement accessible aux personnes aveugles.

- **Jeu source** : Hogwarts: An RPG (David Brunell-Brutman, v1.2) — PbtA (Powered by the Apocalypse)
- **Licence** : CC BY-NC-SA 4.0 pour le contenu original — le projet doit rester non commercial et citer l'auteur
- **Langue** : Français, avec terminologie du lore officiel HP (éditions Gallimard)
- **Plateforme** : Web (HTML + CSS + JS vanille) — fonctionne hors-ligne dans un navigateur
- **Accessibilité** : Niveau textuel complet — personnes entièrement aveugles
- **Mode** : Solo uniquement (pas de multijoueur)
- **Dépôt** : GitHub `MattrimCotton/Harry-potter-rpg` (privé; contient les PDFs sources, versionnés depuis 2026-09-24, branche `main`)

---

## Stack technique

- **HTML sémantique** — structure accessible, landmarks ARIA
- **Bootstrap 5** — framework CSS pour mise en forme, thème sombre (`data-bs-theme="dark"`), système de grille, composants collapse ; copié dans `src/lib/bootstrap/` et bundlé directement (aucune CDN, offline-first)
- **CSS** — mise en forme supplémentaire (secondaire pour les non-voyants)
- **JavaScript vanille** — aucun framework de logique métier, aucune dépendance JS, modules ES6 bundlés
- **Modèle des tours** (`src/js/ui/narration.js` + `src/js/ui/choices.js`) — le texte du jeu est groupé en « tours » (historique `#narration`). Quand les choix s'affichent, **le curseur se place au début du nouveau tour** (premier paragraphe, `tabindex="-1"`) : NVDA lit le texte, la flèche bas mène au reste puis aux choix, placés juste après. Sans texte nouveau, focus sur le premier choix
- **ARIA Regions** — `role="alert"` (assertive) et `role="status"` (polite) **uniquement** pour annonces sans déplacement de focus (fiche F1-F5, sauvegarde F8, erreurs de saisie) ; **pas de région live pour la narration** (qui couperait NVDA)
- **Pas de synthèse vocale intégrée** — le jeu se joue avec NVDA, qui lit tout (décision du 2026-09-24)
- **localStorage** — sauvegarde des parties
- **JSON** — contenu du jeu (sorts, tables, scénarios)
- **Build** — `tools/build.js` (Node.js) → genère `dist/hogwarts-rpg.html` standalone (aucun serveur requis) ; includes Bootstrap CSS & JS inline

### Compatibilité lecteurs d'écran cible
- NVDA + Firefox/Chrome (Windows) — **référence** : tout doit marcher en mode navigation ET en mode formulaire
- VoiceOver + Safari (macOS/iOS)
- Orca + Firefox (Linux)
- JAWS + Chrome (Windows)

---

## Règles du jeu (résumé PbtA)

⚠️ **Lire `memory/game-rules.md` pour la référence complète** — les détails ci-dessous sont un résumé.

### Traits (valeurs : -1, 0, +1, +1, +2)
- **Bravoure** — courage, faire face au danger
- **Ruse** — tromperie, discrétion, manipulation
- **Intellect** — savoir, mémoire, observation
- **Loyauté** — aide, entraver, interaction sociale
- **Magie** — sorts, potions, objets magiques

### Jets de dés
- Lancer 2d6 + trait applicable
- **10+** : Succès complet
- **7-9** : Succès partiel avec coût (choisir une option)
- **6-** : Échec — marquer 1 Expérience, le Narrateur décide

### Manœuvres de base
1. Faire Face au Danger → Bravoure
2. Acquérir des Connaissances → Intellect
3. Se Cacher et se Faufiler → Ruse
4. Obtenir ce que l'on Cherche → Bravoure ou Ruse (choix du joueur)
5. Aider ou Entraver quelqu'un → Loyauté (bonus +1 si Ami/Rival)
6. Approcher une Créature Magique → Loyauté
7. Lancer un Sort → Magie (requiert connaître le sort ou dépenser 1 Chance)
8. Dueller → Magie (échange de sorts; Conséquence Grave obligatoire)
9. Préparer une Potion → Magie (requiert connaître la potion ou dépenser 1 Chance)
10. Utiliser un Objet Magique → Magie
11. Jet libre → n'importe quel trait (quand aucune autre manœuvre ne convient)

### États (Conditions)
Apeuré (-2 Bravoure), Furieux (-2 Ruse), Stressé (-2 Intellect),
Jaloux (-2 Loyauté), Gêné (-2 Magie), Blessé (-1 tout),
Ensorcelé (-1 trait au choix Narrateur), Inconscient (hors jeu)

### Chance & Expérience
- **Chance** : 3 points — dépenser pour réussir l'impossible ou changer un jet en 10+
- **Expérience** : marquer sur un 6-. À 4 XP → Progression

### Origines
- **Né-Moldu** : 1 sort, 3 XP de départ
- **Demi-sang** : 2 sorts, 2 XP de départ
- **Sang-pur** : 3 sorts, 1 XP de départ

### Maisons
- **Gryffondor** : +1 Bravoure
- **Poufsouffle** : +1 Loyauté
- **Serdaigle** : +1 Intellect
- **Serpentard** : +1 Ruse

---

## Exigences accessibilité (non-négociables)

1. **Navigation 100% clavier, compatible avec les deux modes de NVDA** — raccourcis sur les touches F ; retour par Échap (mode navigation) ou Retour arrière (les deux modes : NVDA garde Échap en mode formulaire)
2. **Aucune information visuelle exclusive** — tout est dans le texte
3. **Curseur au début de la narration** (demande de l'utilisateur) — après chaque choix, le focus va sur le premier paragraphe du nouveau texte, jamais directement sur les choix ; NVDA repasse de lui-même en mode navigation sur un paragraphe
4. **ARIA Live Regions** (`role="alert"` et `role="status"`) **uniquement** pour les annonces sans déplacement de focus (fiche F1-F5, sauvegarde F8, erreurs)
5. **Pas de synthèse vocale intégrée** — le jeu se joue avec NVDA, qui lit tout (décision du 2026-09-24)
6. **Pas de délais** sur les interactions (pas de timeout)
7. **Langage clair** — phrases courtes, pas d'abréviations, nombres et signes en toutes lettres (« plus 1 »)
8. **Répétition** — F9 ramène le curseur au début du dernier texte
9. **Chaque raccourci existe aussi en bouton** — menu « Outils » (collapse Bootstrap, replié par défaut) ; la touche est déclarée une seule fois (`aria-keyshortcuts`), l'indication visible `<kbd>` est `aria-hidden` pour éviter que NVDA la dise deux fois
10. **Choix** — 3 choix ou plus : liste déroulante (Entrée ou « Valider le choix ») ; 1 ou 2 choix : boutons ; déplacements (`"deplacement": true` dans les scénarios) et retour : toujours des boutons
11. **Aide** — à un seul endroit : bas de page, collapse Bootstrap replié par défaut (ni dans le menu, ni dans le message d'accueil, ni dans les outils)
12. **Bootstrap pour toute l'interface** (décision de l'utilisateur) — pas de CSS maison sauf thème et historique
13. **Sauvegarde automatique silencieuse** — seule F8 annonce « Partie sauvegardée »

### Raccourcis clavier standard du jeu (NVDA prioritaire)

| Touche | Action |
|---|---|
| F1 à F5 | Traits, États, Sorts, Amis et rivaux, Chance et expérience (annonce, focus inchangé) |
| F8 | Sauvegarder (annoncé) |
| F9 | Revenir au début du dernier texte (curseur déplacé) |
| Échap | Retour / annuler (mode navigation) |
| Retour arrière | Retour / annuler (les deux modes, sauf dans un champ texte) |
| Flèches, Début, Fin | Parcourir les choix (mode formulaire) |

Les touches F sont interceptées même dans un champ texte, pour que F5 ne recharge jamais la page. Les combinaisons avec Alt, Ctrl ou Méta sont ignorées. En mode navigation, la flèche haut relit l'historique des tours, placé juste avant les choix.

---

## Structure du projet

Noms de fichiers et de dossiers **en anglais** (décision de l'utilisateur, 2026-09-24). Le code (fonctions, variables) et les textes restent en français.

| Chemin | Contenu |
|---|---|
| `README.md` | Présentation, comment jouer, comment compiler, structure |
| `LICENSE` | Texte officiel CC BY-NC-SA 4.0 (obligatoire : adaptation d'un jeu sous cette licence) |
| `CREDITS.md` | Attributions (jeu d'origine, Bootstrap MIT) et avertissement Harry Potter (œuvre de fan) |
| `licenses/` | Textes originaux : `CC-BY-NC-SA-4.0.txt`, `CC-BY-NC-SA-4.0.fr.html` (traduction officielle), `Bootstrap-MIT.txt` |
| `memory/` | Mémoire du projet — lire `memory/MEMORY.md` en premier |
| `docs/terms-reference.md` | Référence des traductions françaises du lore HP |
| `docs/lore/characters.md` | Lore du jeu : personnages et état du monde sorcier après 1998 (canon vs libre d'invention) — consulter avant de créer des PNJ ou de fixer l'époque de la campagne |
| `docs/sources/` | PDF du jeu d'origine (redistribués sans modification, CC BY-NC-SA 4.0) |
| `tools/build.js` | Compilation : `node tools/build.js` depuis la racine. Lit `src/`, transforme les modules ES6 en script classique, intègre CSS, JS, JSON et Bootstrap (sans sourceMappingURL) dans `dist/hogwarts-rpg.html` |
| `tools/build.bat` | Double-clic sous Windows : se place à la racine, vérifie Node.js, compile, propose d'ouvrir le résultat |
| `dist/hogwarts-rpg.html` | Fichier jouable généré (~450 Ko), autonome et hors ligne |
| `.claude/launch.json` | Serveur de test `python -m http.server 8765` à la racine → `http://localhost:8765/src/index.html` (modules) ou `/dist/hogwarts-rpg.html` |
| `src/index.html` | Page Bootstrap 5 (`data-bs-theme="dark"`) : historique (carte), `nav#zone-actions`, menu Outils (collapse replié), régions alert/status, fiche en cartes, aide en bas de page (collapse replié) |
| `src/css/style.css` | Thème sombre et or au-dessus de Bootstrap, historique des tours, fiche |
| `src/lib/bootstrap/` | Bootstrap 5.3.8 (CSS, JS bundle, LICENSE MIT) copié pour fonctionner hors ligne |
| `src/js/main.js` | Point d'entrée : état global `etat`, menu principal, création, reprise, initialisation clavier et outils |
| `src/js/ui/narration.js` | Tours de texte (`narrer`, `narrerFrais`, `alerter`, `terminerTour`), `allerAuTour()` (curseur au début d'un tour), `relire()` (F9), annonces `annoncer`/`statuer` |
| `src/js/ui/choices.js` | `afficherActions()` (liste déroulante dès 3 choix, boutons sinon ; groupe nommé par le tour ; focus), `demanderTexte()`, `afficherContenu()` (formulaire ou contenu libre), `declencherRetour()`, `deplacerFocusActions()` ; action `{ label, action, desactive?, retour?, bouton?, principal? }` |
| `src/js/ui/keyboard.js` | Raccourcis F1-F5, F8, F9, Échap, Retour arrière, flèches ; boutons du menu Outils |
| `src/js/ui/character-sheet.js` | Fiche : `lireFiche(section)` (annonce F1-F5), `mettreAJourFiche()` (cartes visuelles) |
| `src/js/rules/dice.js` | Jets 2d6 (`lancerDes`, `d6`, `deuxD6Independants`), annonce orale du résultat |
| `src/js/rules/moves.js` | Les 11 manœuvres (`MANOEUVRES`) et `resoudreManoeuvre(manoeuvre, personnage, onFin, onAnnuler)` |
| `src/js/rules/character.js` | Personnage : `creerPersonnageVide()`, `traitEffectif()`, origine, maison, `NOMS_TRAITS` |
| `src/js/engine/character-creation.js` | Création de personnage : formulaire unique avec sections (identité, apparence, baguette, traits, maison, etc.) + option "Tout tirer au hasard" pour dés automatiques |
| `src/js/engine/game.js` | Boucle de jeu : menu, manœuvres, États, relations, Progression, fin de session, choix du scénario, jet de survie |
| `src/js/engine/scenario.js` | Moteur de scénario : scènes JSON, conditions `&&`/`\|\|`, effets, fins ; `"deplacement": true` → bouton |
| `src/js/engine/save.js` | Sauvegarde localStorage (clé `poudlard_rpg_v1`, inchangée pour garder les parties existantes) |
| `src/data/spells.json` | ~90 sorts et potions par Année + Impardonnables |
| `src/data/tables.json` | Tables de création (origines, maisons, apparence, baguette, matières, Patronus, noms, questions amis/rivaux) |
| `src/data/scenarios/index.json` | Catalogue des scénarios (id = nom du fichier sans `.json`) |
| `src/data/scenarios/back-compartment.json` | Scénario 1 : « Le Compartiment du Fond » (id `back-compartment`) |

Le bundler met tous les exports au même niveau : deux modules ne doivent jamais exporter le même nom. Un nouveau module ou un nouveau fichier JSON doit être ajouté aux listes `MODULES` et `JSON_RESOURCES` de `tools/build.js`.

---

## Conventions de code

- JS : ES6+, pas de framework de logique, modules natifs (`type="module"`)
- Noms de fichiers et dossiers en anglais ; fonctions, variables, textes et ARIA en français
- Pas de commentaires sauf WHY non-évident
- Fichiers JSON pour tout le contenu textuel (facile à modifier sans toucher au code)
- Texte contenant une apostrophe : chaîne entre guillemets doubles (une apostrophe non échappée casse tout le script)

---

## Ce qui a été fait

- [x] Référence des termes FR lore HP (`docs/terms-reference.md`)
- [x] Création de personnage (formulaire unique + dés automatiques), 11 manœuvres conformes au PDF, États, Chance, Expérience, Progression, jet de survie
- [x] Moteur de scénario + scénario 1 « Le Compartiment du Fond »
- [x] Interface NVDA : curseur au début de chaque nouveau texte, F1-F5/F8/F9, Échap/Retour arrière
- [x] Interface Bootstrap 5 hors ligne : listes déroulantes, menu Outils et aide repliables
- [x] Compilation en un fichier autonome `dist/hogwarts-rpg.html`
- [x] Structure en anglais (`src/`, `tools/`, `dist/`, `docs/`, `licenses/`), README, CREDITS, licences officielles
