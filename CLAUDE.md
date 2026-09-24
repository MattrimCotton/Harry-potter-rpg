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
- **`memory/accessibility-specs.md`** — Spécifications techniques détaillées (ARIA, Web Speech API, raccourcis clavier) — **lire avant toute implémentation d'interface**

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
- **ARIA Live Regions** — annonces dynamiques (`aria-live="polite"` et `assertive"`)
- **Web Speech API** — TTS hors-ligne natif du navigateur (`lang: 'fr-FR'`)
- **localStorage** — sauvegarde des parties
- **JSON** — contenu du jeu (sorts, tables, scénarios)
- **Build** — `build.js` (Node.js) → genère `poudlard-rpg.html` standalone (aucun serveur requis)

### Compatibilité lecteurs d'écran cible
- NVDA + Firefox/Chrome (Windows) — priorité 1
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
4. Obtenir ce que l'on Cherche → Bravoure (honnêteté) ou Ruse (tromperie)
5. Aider ou Entraver quelqu'un → Loyauté
6. Lancer un Sort / Dueller → Magie
7. Préparer une Potion → Magie
8. Utiliser un Objet Magique → Magie

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

1. **Navigation 100% clavier** — Tab, Flèches, Entrée, Échap, F1-F5, Espace
2. **Aucune information visuelle exclusive** — tout est dans le texte
3. **ARIA Live Regions** pour toutes les annonces dynamiques
4. **Focus management** explicite après chaque action
5. **Pas de délais** sur les interactions (pas de timeout)
6. **Langage clair** — phrases courtes, pas d'abréviations
7. **Répétition** — Espace pour relire le dernier message
8. **Web Speech API** — TTS en `fr-FR` avec contrôle vitesse/volume

### Raccourcis clavier standard du jeu
```
Tab / Shift+Tab  → naviguer entre les éléments
Flèches          → naviguer dans les listes d'options
Entrée           → confirmer / lancer les dés
Échap            → retour / annuler
Espace           → relire le dernier message du Narrateur
F1               → lire les Traits du personnage
F2               → lire les États actifs
F3               → lire les Sorts connus
F4               → lire les Amis & Rivaux
F5               → lire Chance et Expérience
R                → relancer les dés (si applicable)
S                → sauvegarder
```

---

## Fichiers clés du projet

| Fichier | Contenu |
|---|---|
| `memory/MEMORY.md` | Index mémoire — lire en premier |
| `termes-reference.md` | Référence complète des traductions FR lore HP |
| `resources-pdf/` | PDFs source du jeu original |
| `index.html` | Point d'entrée, structure sémantique + ARIA live regions |
| `style.css` | Mise en forme (secondaire pour accessibilité) |
| `build.js` | Bundler Node.js — transforme modules ES6 en script classique, inline CSS + JS + JSON dans `poudlard-rpg.html` (usage: `node build.js`) |
| `build.bat` | Script batch Windows — wrapper autour de `build.js`, vérifie Node.js, compile et propose d'ouvrir le résultat (usage: double-cliquer) |
| `js/main.js` | Point d'entrée JavaScript (module ES6+) — gère l'état global du jeu (`etat` singleton avec `personnage` et `derniereAction`), orchestration des écrans (menu principal, création, reprise, aide), initialisation au démarrage via `DOMContentLoaded`, intègre clavier + sauvegarde, imports `lancerCreation` de `creation.js` et `lancerJeu` de `jeu.js`; `demarrerCreation()` et `reprendrePartie()` appellent `_assureProgressions()` puis `lancerJeu()` pour démarrer/reprendre le jeu |
| `js/narration.js` | Module central d'annonces — ARIA live regions + TTS optionnel (tous les messages du jeu) |
| `js/personnage.js` | Gestion du personnage joueur — structure de données, calcul de traits effectifs (avec malus d'états), helpers d'application des bonus d'origine & maison |
| `js/fiche.js` | Lecture et affichage de la fiche de personnage — appelé par les touches F1-F5 (traits, états, sorts, amis/rivaux, chance/expérience), mises à jour DOM |
| `js/clavier.js` | Raccourcis clavier globaux (Espace, F1-F5, R, S) — enregistré une seule fois au démarrage |
| `js/actions.js` | Affichage des boutons d'action — construit les boutons avec ARIA labels, raccourcis, et focus management automatique |
| `js/des.js` | Moteur de dés — jets 2d6 selon les règles PbtA (succès complet 10+, partiel 7-9, échec 6-) |
| `js/manoeuvres.js` | Les 8 manœuvres de base — définition catalogue + `resoudreManoeuvre(manoeuvre, personnage, onFin)` orchestrant les choix et dépense de Chance, gestion des jets et affichage résultats (10+/7-9/6-) |
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
- [x] `index.html` — structure ARIA complète (live regions, landmarks, fiche personnage)
- [x] `style.css` — focus visible, sr-seul, lien d'évitement
- [x] `js/narration.js` — ARIA live regions + TTS Web Speech API (fr-FR), relire()
- [x] `js/des.js` — lancerDes(trait, nom), d6(), deuxD6Independants()
- [x] `js/actions.js` — afficherActions(), focus automatique
- [x] `js/clavier.js` — F1-F5, Espace, R, S
- [x] `js/personnage.js` — creerPersonnageVide(), traitEffectif(), appliquerMaison()
- [x] `js/fiche.js` — lireFiche(section), mettreAJourFiche()
- [x] `js/sauvegarde.js` — localStorage
- [x] `contenu/sorts.json` — ~90 sorts classés par Année 1-7 + Impardonnables
- [x] `contenu/tables.json` — tables de création (teint, cheveux, maisons, patronus, prénoms…)
- [x] `js/creation.js` — les 12 étapes de création de personnage (dés, texte libre, tables)
- [x] `js/manoeuvres.js` — les 8 manœuvres de base avec résultats 10+/7-9/6-, Chance, XP, jet de survie
- [x] `js/jeu.js` — boucle de jeu : manœuvres, états, relations, progression, fin de session, sélection de scénario
- [x] `js/main.js` — routing complet : menu → création → jeu (lancerJeu connecté)
- [x] `js/scenario.js` — moteur de scénario : chargement JSON, navigation de scènes, conditions, effets, fins
- [x] `contenu/scenarios/index.json` — liste des scénarios disponibles
- [x] `contenu/scenarios/compartiment.json` — scénario 1 : Le Compartiment du Fond (style narratif HP)
- [x] `build.js` — script Node.js qui bundle tout en un seul `poudlard-rpg.html` standalone
- [x] `build.bat` — raccourci Windows pour lancer le build
- [x] `poudlard-rpg.html` — fichier distributable généré (135 Ko, fonctionne sans serveur)
