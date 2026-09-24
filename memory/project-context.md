# Contexte du projet

## Objectif

Jeu de rôle solo, en texte uniquement, dans l'univers Harry Potter, **entièrement jouable par une personne aveugle** avec un lecteur d'écran. Adaptation de *Hogwarts: An RPG* v1.2 (David Brunell-Brutman, PbtA, licence CC BY-NC-SA 4.0 pour le contenu original — le projet doit donc rester non commercial et citer l'auteur).

Le jeu source est prévu pour un groupe avec un Narrateur humain. Ici, **le Narrateur est le moteur de scénario** (scènes JSON) : c'est lui qui choisit les Conséquences Graves, les questions/réponses de « Acquérir des Connaissances », etc.

## Dépôt

- Local : `C:\Users\asdes.ASUS\Documents\SourceCode\Harry-potter-rpg`
- GitHub : `MattrimCotton/Harry-potter-rpg` — **privé** (créé le 2026-09-24, branche `main`).
- Les PDF sources (`resources-pdf/`) sont versionnés : le dépôt doit rester privé tant qu'ils y sont.

## Stack

HTML sémantique + CSS + JavaScript vanille (modules ES6), aucune dépendance. Contenu en JSON dans `contenu/`. `node build.js` (ou `build.bat`) produit `poudlard-rpg.html`, un fichier unique jouable hors ligne sans serveur. Sauvegarde dans `localStorage` (clé `poudlard_rpg_v1`).

## Architecture (flux)

`main.js` (menu) → `creation.js` (12 étapes) → `jeu.js` (boucle : manœuvres, états, relations, progression, choix de scénario) → `scenario.js` (scènes JSON, conditions `&&`/`||`, effets, fins).
Tout le texte passe par `narration.js` (régions live + TTS). Les boutons par `actions.js`. Les raccourcis globaux par `clavier.js`. La fiche (F1-F5) par `fiche.js`.

La table détaillée des fichiers est dans `CLAUDE.md`.

## État d'avancement (2026-09-24)

Fait : tout ce qui est coché dans `CLAUDE.md` — création complète, 8 manœuvres, états, Chance/XP/progression, moteur de scénario, scénario 1 « Le Compartiment du Fond », build autonome.

## Écarts connus avec les règles source

Voir `game-rules.md` pour le détail. En résumé, pas encore implémenté :
- Manœuvre **Approcher une Créature Magique** (+Loyauté).
- Manœuvre générique **Jet** (+trait au choix) quand aucune autre ne s'applique.
- **Duel** fusionné avec « Lancer un Sort » ; les options de duel (10+ / 7-9 / 6-) sont différentes de celles du sort — à vérifier.
- Bonus **+1 Matière préférée** et **+1 Ami/Rival** pour Aider/Entraver — à vérifier dans `manoeuvres.js`.
- Quidditch, Points de Maison, Mystères, Menaces : absents.

## Écarts connus en accessibilité

Voir `accessibility-specs.md` → section « Dette d'accessibilité ».

## Pistes suivantes

1. Combler la dette d'accessibilité (Échap, flèches, réglages TTS, raccourcis à une lettre).
2. Ajouter les manœuvres manquantes.
3. Écrire d'autres scénarios (index dans `contenu/scenarios/index.json`).
4. Tests manuels NVDA + Firefox, puis VoiceOver.
