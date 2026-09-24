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
- **CSS** — mise en forme (secondaire pour les non-voyants)
- **JavaScript vanille** — aucun framework, aucune dépendance, modules ES6 bundlés
- **Modèle des tours** (`narration.js` + `actions.js`) — le texte du jeu est groupé en « tours » (historique `#narration`). Chaque tour devient le nom (`aria-labelledby`) d'un groupe de choix `role="group"` **recréé à chaque tour**, et le focus va sur le premier choix : NVDA lit le tour puis le choix, en mode navigation comme en mode formulaire
- **ARIA Regions** — `role="alert"` (assertive) et `role="status"` (polite) **uniquement** pour annonces sans déplacement de focus (fiche F1-F5, sauvegarde F8, erreurs de saisie) ; **pas de région live pour la narration** (qui couperait NVDA)
- **Pas de synthèse vocale intégrée** — le jeu se joue avec NVDA, qui lit tout (décision du 2026-09-24)
- **localStorage** — sauvegarde des parties
- **JSON** — contenu du jeu (sorts, tables, scénarios)
- **Build** — `build.js` (Node.js) → genère `poudlard-rpg.html` standalone (aucun serveur requis)

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
3. **Modèle des tours** — le texte du tour est le nom du groupe de choix ; le focus va sur le premier choix ; jamais de lecture qui exigerait les flèches (impossible en mode formulaire)
4. **ARIA Live Regions** (`role="alert"` et `role="status"`) **uniquement** pour les annonces sans déplacement de focus (fiche F1-F5, relecture F9, sauvegarde F8, erreurs)
5. **Pas de synthèse vocale intégrée** — le jeu se joue avec NVDA, qui lit tout (décision du 2026-09-24)
6. **Pas de délais** sur les interactions (pas de timeout)
7. **Langage clair** — phrases courtes, pas d'abréviations, nombres et signes en toutes lettres (« plus 1 »)
8. **Répétition** — F9 relit le dernier tour par annonce, sans déplacer le focus
9. **Chaque raccourci existe aussi en bouton** — zone « Fiche et outils »
11. **Choix** — 3 choix ou plus : liste déroulante (Entrée ou « Valider le choix ») ; 1 ou 2 choix : boutons ; déplacements (`"deplacement": true` dans les scénarios) et retour : toujours des boutons
12. **Aide** — bloc `<details>` replié par défaut
10. **Sauvegarde automatique silencieuse** — seule F8 annonce « Partie sauvegardée »

### Raccourcis clavier standard du jeu (NVDA prioritaire)

| Touche | Action |
|---|---|
| F1 à F5 | Traits, États, Sorts, Amis et rivaux, Chance et expérience (annonce, focus inchangé) |
| F8 | Sauvegarder (annoncé) |
| F9 | Relire le dernier tour (annonce, focus inchangé) |
| Échap | Retour / annuler (mode navigation) |
| Retour arrière | Retour / annuler (les deux modes, sauf dans un champ texte) |
| Flèches, Début, Fin | Parcourir les choix (mode formulaire) |

Les touches F sont interceptées même dans un champ texte, pour que F5 ne recharge jamais la page. Les combinaisons avec Alt, Ctrl ou Méta sont ignorées. En mode navigation, la flèche haut relit l'historique des tours, placé juste avant les choix.

---

## Fichiers clés du projet

| Fichier | Contenu |
|---|---|
| `memory/MEMORY.md` | Index mémoire — lire en premier |
| `termes-reference.md` | Référence complète des traductions FR lore HP |
| `resources-pdf/` | PDFs source du jeu original |
| `index.html` | Point d'entrée, structure sémantique : `<main>` contient narration (section histoire), actions (nav), outils (nav F1-F5/F8-F9), annonces (alert/status). `<section id="aide">` : aide contextuelle. `<aside>` : fiche personnage cachée (traits/états/sorts/amis/chance). Annonces via `role="alert"` (assertive) et `role="status"` (polite) sans aria-live. |
| `style.css` | Mise en forme (secondaire pour accessibilité) |
| `build.js` | Bundler Node.js — transforme modules ES6 en script classique, inline CSS + JS + JSON dans `poudlard-rpg.html` (usage: `node build.js`) |
| `build.bat` | Script batch Windows — wrapper autour de `build.js`, vérifie Node.js, compile et propose d'ouvrir le résultat (usage: double-cliquer) |
| `.claude/launch.json` | Configuration Claude Code — serveur de développement Python `http.server` sur port 8765 (usage: `python -m http.server 8765`) — permet prévisualisation live dans Claude Code |
| `js/main.js` | Point d'entrée JavaScript (module ES6+) — gère l'état global du jeu (`etat` singleton avec `personnage`), orchestration des écrans (menu principal, création, reprise), initialisation au démarrage via `DOMContentLoaded`, intègre clavier + sauvegarde, imports `lancerCreation` de `creation.js` et `lancerJeu` de `jeu.js`; `demarrerCreation()` et `reprendrePartie()` appellent `_assureProgressions()` puis `lancerJeu()` pour démarrer/reprendre le jeu; `_allerAide()` place le focus sur `#aide` (section fixe d'aide) |
| `js/narration.js` | Module central d'annonces — gestion des tours (texte groupé par écran narratif) ; le tour sert de nom au groupe de choix (compatible modes navigation et formulaire) ; `relire()` annonce le dernier tour ; annonces isolées via `role="alert"` (dés, erreurs) et `role="status"` (statut) sans aria-live ; `narrer()`, `narrerFrais()`, `alerter()`, `annoncer()`, `statuer()`, `terminerTour()`, `relire()` |
| `js/personnage.js` | Gestion du personnage joueur — structure de données, calcul de traits effectifs (avec malus d'états), helpers d'application des bonus d'origine & maison |
| `js/fiche.js` | Lecture et affichage de la fiche de personnage — appelé par les touches F1-F5 (traits, états, sorts, amis/rivaux, chance/expérience), mises à jour DOM |
| `js/clavier.js` | Raccourcis clavier globaux (F1-F5, F8, Échap, flèches) et gestion des outils (`zone-outils`) — initialisation via `initClavier(raccourcis)` et `initOutils(raccourcis)` au démarrage, branche touches/boutons aux callbacks du jeu (lireFiche, sauvegarder, afficherAide) |
| `js/actions.js` | Affichage des actions (boutons et formulaires texte) — `afficherActions(actions)` construit les boutons avec ARIA labels et focus management ; `demanderTexte({ question, exemple, onValider, onAnnuler })` pour saisie texte accessible ; `declencherRetour()` et `deplacerFocusActions(touche)` pour gestion clavier (Échap, flèches) ; format action: `{ label, action, desactive?, retour? }` (retour=true pour Échap) |
| `js/des.js` | Moteur de dés — jets 2d6 selon les règles PbtA (succès complet 10+, partiel 7-9, échec 6-) |
| `js/manoeuvres.js` | Les 11 manœuvres (base + magiques) — définition catalogue (11 objets avec `id`, `nom`, `traits: []`, `options10/79/texte6/questions`, `prealable?`, `bonusRelation?`, `consequenceObligatoire?`) + `resoudreManoeuvre(manoeuvre, personnage, onFin, onAnnuler)` orchestrant : sélection trait si multi-trait, pré-requis (sort/potion), choix bonus (matière/ami/rival), jet 2d6, résultat (10+/7-9/6-), prise d'État, dépense de Chance |
| `js/sauvegarde.js` | Sauvegarde/chargement via localStorage (clé `poudlard_rpg_v1`) — fournit `sauvegarder()`, `charger()`, `effacer()`, `aUneSauvegarde()` |
| `js/scenario.js` | Moteur de scénario — charge et orchestre les scènes JSON, gère la navigation, les conditions, les effets, et les variables (`lancerScenario(idScenario, personnage, onFin)`, support des conditions composées avec `&&` et `\|\|`, état interne avec flags et objets) |
| `contenu/` | Données JSON du jeu (scenarios, règles, sorts, etc.) |
| `contenu/tables.json` | Tables de création de personnage (origines, maisons, traits, apparence, baguette, matières, patronus, noms, questions amis/rivaux) |
| `contenu/scenarios/index.json` | Catalogue des scénarios disponibles — liste des scénarios avec id, titre, accroche, années, durée, manœuvres |
| `contenu/scenarios/compartiment.json` | Scénario d'introduction : "Le Compartiment du Fond" |

---

## Conventions de code

- JS : ES6+, pas de framework, modules natifs (`type="module"`)
- Pas de commentaires sauf WHY non-évident
- Noms de variables en français pour le domaine du jeu
- ARIA labels en français
- Fichiers JSON pour tout le contenu textuel (facile à modifier sans toucher au code)

---

## Ce qui a été fait

- [x] Référence des termes FR lore HP (`termes-reference.md`)
- [x] Décision stack validée
- [x] Architecture définie
- [x] CLAUDE.md créé
- [x] Permissions .claude/settings.json configurées
- [x] `index.html` — landmarks, zone « Fiche et outils », section d'aide, régions alert/status, fiche personnage
- [x] `style.css` — focus visible, sr-seul, lien d'évitement
- [x] `js/narration.js` — tours lus comme nom du groupe de choix (modes navigation et formulaire), régions alert/status pour annonces isolées
- [x] `js/des.js` — lancerDes(trait, nom), d6(), deuxD6Independants()
- [x] `js/actions.js` — afficherActions(), demanderTexte(), Échap, flèches
- [x] `js/clavier.js` — F1-F5, F8, F9, Échap, flèches ; boutons « Fiche et outils »
- [x] `js/personnage.js` — creerPersonnageVide(), traitEffectif(), appliquerMaison()
- [x] `js/fiche.js` — lireFiche(section), mettreAJourFiche()
- [x] `js/sauvegarde.js` — localStorage
- [x] `contenu/sorts.json` — ~90 sorts classés par Année 1-7 + Impardonnables
- [x] `contenu/tables.json` — tables de création (teint, cheveux, maisons, patronus, prénoms…)
- [x] `js/creation.js` — les 12 étapes de création de personnage (dés, texte libre, tables)
- [x] `js/manoeuvres.js` — 11 manœuvres (base + magiques) : multi-trait, pré-requis sort/potion, États optionnels, bonus matière/ami/rival, résultats 10+/7-9/6-, Chance, XP
- [x] `js/jeu.js` — boucle de jeu : manœuvres, états, relations, progression, fin de session, sélection de scénario
- [x] `js/main.js` — routing complet : menu → création → jeu (lancerJeu connecté)
- [x] `js/scenario.js` — moteur de scénario : chargement JSON, navigation de scènes, conditions, effets, fins
- [x] `contenu/scenarios/index.json` — liste des scénarios disponibles
- [x] `contenu/scenarios/compartiment.json` — scénario 1 : Le Compartiment du Fond (style narratif HP)
- [x] `build.js` — script Node.js qui bundle tout en un seul `poudlard-rpg.html` standalone
- [x] `build.bat` — raccourci Windows pour lancer le build
- [x] `poudlard-rpg.html` — fichier distributable généré (135 Ko, fonctionne sans serveur)
