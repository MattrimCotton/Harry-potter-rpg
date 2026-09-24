# Contexte du projet

## Objectif

Jeu de rôle solo, en texte uniquement, dans l'univers Harry Potter, **entièrement jouable par une personne aveugle** avec un lecteur d'écran. Adaptation de *Hogwarts: An RPG* v1.2 (David Brunell-Brutman, PbtA, licence CC BY-NC-SA 4.0 pour le contenu original — le projet doit donc rester non commercial et citer l'auteur).

Le jeu source est prévu pour un groupe avec un Narrateur humain. Ici, **le Narrateur est le moteur de scénario** (scènes JSON) : c'est lui qui choisit les Conséquences Graves, les questions/réponses de « Acquérir des Connaissances », etc.

## Dépôt

- Local : `C:\Users\asdes.ASUS\Documents\SourceCode\Harry-potter-rpg`
- GitHub : `MattrimCotton/Harry-potter-rpg` — **public** (créé le 2026-09-24, passé en public le même jour, branche `main`).
- SonarCloud : projet `MattrimCotton_Harry-potter-rpg` (org `mattrimcotton`, créé le 2026-09-24). Analyse via GitHub Actions (`.github/workflows/sonarcloud.yml`, secret `SONAR_TOKEN`) ; MCP SonarQube pour Claude Code dans `.mcp.json` (Docker requis).
- Les PDF sources (`docs/sources/`) sont versionnés. Leur licence (CC BY-NC-SA 4.0) permet de les redistribuer sans modification, avec attribution et sans usage commercial.
- Structure et licences : voir `README.md` et `CREDITS.md`. Projet entier sous CC BY-NC-SA 4.0 (obligatoire, adaptation d'un jeu sous cette licence). Noms de fichiers et dossiers en anglais.

## Stack

HTML sémantique + CSS + JavaScript vanille (modules ES6), aucune dépendance. Contenu en JSON dans `src/data/`. `node tools/build.js` (ou `tools/build.bat`) produit `dist/hogwarts-rpg.html`, un fichier unique jouable hors ligne sans serveur. Sauvegarde dans `localStorage` (clé `poudlard_rpg_v1`).

## Architecture (flux)

`main.js` (menu) → `engine/character-creation.js` (formulaire unique ou tirage complet) → `engine/game.js` (boucle : manœuvres, états, relations, progression, choix de scénario) → `engine/scenario.js` (scènes JSON, conditions `&&`/`||`, effets, fins).
Tout le texte passe par `ui/narration.js` (tours). Les choix par `ui/choices.js`. Les raccourcis par `ui/keyboard.js`. La fiche (F1-F5) par `ui/character-sheet.js`. Les règles dans `rules/` (dés, manœuvres, personnage). Tous ces chemins sont sous `src/js/`.

La table détaillée des fichiers est dans `CLAUDE.md`.

## État d'avancement (2026-09-24)

Fait : tout ce qui est coché dans `CLAUDE.md` — création complète, 11 manœuvres, états, Chance/XP/progression, moteur de scénario, scénario 1 « Le Compartiment du Fond », build autonome, interface refaite pour NVDA.

## Écarts connus avec les règles source

Corrigé le 2026-09-24 : les 11 manœuvres suivent le PDF (Créature, Jet libre et Duel ajoutés ; options 10+ et 7-9 réécrites ; sort ou potion inconnu = 1 Chance ; bonus +1 matière préférée et Ami/Rival ; les options « vous prenez un État » font cocher l'État ; Progression remet l'XP à 0).

Restent absents : Quidditch, Points de Maison, Mystères, Menaces. Le jeu en solo n'a pas de Narrateur humain : les Conséquences Graves sont laissées à l'imagination du joueur, sauf dans les scénarios.

## Lore (2026-09-24)

- Les PDF ne contiennent **aucune campagne ni scénario** : tout le contenu narratif est à écrire.
- **Lore propre au jeu, pas trop canon**, construit à partir de ce qu'on sait officiellement de l'univers **après 1998** : romans et épilogue, textes Wizarding World, interviews de J.K. Rowling.
- **_L'Enfant maudit_ est exclu** (décision de l'utilisateur) : ni Delphi, ni rien qui ne vienne que de la pièce. Les maisons d'Albus, Rose, Scorpius, James redeviennent inconnues.
- **Échelle des événements** : histoires à hauteur d'élèves, sans bouleverser le monde sorcier. Un événement majeur n'est permis que s'il se termine bien et explique la situation actuelle. Règles complètes : `docs/lore/principles.md` — **à lire avant d'écrire un scénario**.
- Recensement des personnages connus et des postes à inventer : `docs/lore/characters.md` (chaque information avec sa source ; le fanon et la pièce ne sont pas repris).
- À trancher avec l'utilisateur : l'époque de la campagne, les professeurs à inventer, les directeurs de maison.
- Histoires originales uniquement : personnages connus possibles en arrière-plan, pas d'intrigues reprises des livres.

## Inspiration Hogwarts Live (2026-09-24)

Demande de l'utilisateur : s'inspirer aussi du jeu textuel Hogwarts Live (hogwartslive.com, depuis 2004, accessible aux aveugles, ton parodique). Synthèse et adaptations proposées : `docs/design/inspiration-hogwarts-live.md`. On reprend des idées et des structures (calendrier, lieux à rencontres aléatoires, Points de Maison, examens, club de duel, boutiques, courrier), jamais les textes ni les personnages. Pas de Voldemort ni de politique du Ministère. En attente : le ton (humour léger ou parodie) et l'ordre des mécaniques à ajouter.

## Décisions de conception (2026-09-24)

- **NVDA d'abord, pas de synthèse vocale intégrée.** Voir `accessibility-specs.md`.
- Lecture par « tours » avec focus, au lieu de régions live.
- Raccourcis limités aux touches F et Échap ; tout existe aussi en bouton.
- Sauvegarde automatique silencieuse.
- Menu de jeu court ; les manœuvres sont dans un sous-menu.

## Développement

- `node tools/build.js` régénère `dist/hogwarts-rpg.html` : à relancer après chaque modification dans `src/`.
- Serveur local de test : `python -m http.server 8765` (`.claude/launch.json`), puis `http://localhost:8765/dist/hogwarts-rpg.html` ou `http://localhost:8765/src/index.html` (version modules).
- Le bundler supprime les `import` et met tous les exports au même niveau : **deux modules ne doivent pas exporter le même nom**.
- Piège fréquent : une apostrophe dans une chaîne entre apostrophes casse tout le script. Utiliser des guillemets doubles quand le texte contient une apostrophe.

## Pistes suivantes

1. Test réel avec NVDA + Firefox (lecture d'un tour de plusieurs paragraphes).
2. Regrouper les longues listes de sorts.
3. Écrire d'autres scénarios (index dans `src/data/scenarios/index.json` ; l'id d'un scénario = nom de son fichier ; l'ajouter aussi à `JSON_RESOURCES` dans `tools/build.js`), en utilisant les nouvelles manœuvres (`approcher-creature`, `dueller`, `jet`).
4. Jet de survie dans le moteur de scénario.
