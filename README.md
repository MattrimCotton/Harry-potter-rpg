# Poudlard RPG

Jeu de rôle solo en texte dans l'univers de Harry Potter, **entièrement jouable par une personne aveugle avec NVDA**, en mode navigation comme en mode formulaire.

Adaptation française et solo de *Hogwarts: An RPG* v1.2 de David Brunell-Brutman (système « Powered by the Apocalypse »).

Œuvre de fan, non officielle et non commerciale. Voir [CREDITS.md](CREDITS.md).

## Jouer

Ouvrez `dist/hogwarts-rpg.html` dans Firefox ou Chrome. C'est un fichier unique : pas d'installation, pas de serveur, pas de connexion Internet. La partie est sauvegardée dans le navigateur.

L'aide du jeu se trouve en bas de page, dans le bloc « Aide » (replié au départ).

## Compiler

Après une modification dans `src/`, régénérez le fichier jouable :

- Windows : double-cliquez sur `tools/build.bat`.
- Ou, depuis la racine du projet : `node tools/build.js` (Node.js requis).

## Structure

- `src/` : le jeu.
  - `index.html` : la page.
  - `css/style.css` : le thème, au-dessus de Bootstrap.
  - `js/main.js` : le point d'entrée.
  - `js/ui/` : ce qui parle au joueur (narration, choix, clavier, fiche).
  - `js/rules/` : les règles (dés, manœuvres, personnage).
  - `js/engine/` : le déroulement (création du personnage, boucle de jeu, scénarios, sauvegarde).
  - `data/` : les données en JSON (sorts, tables de création, scénarios).
  - `lib/bootstrap/` : Bootstrap 5, copié ici pour fonctionner sans connexion.
- `tools/` : les scripts de compilation.
- `dist/hogwarts-rpg.html` : le fichier jouable, généré.
- `docs/` : la référence des termes français, les PDF du jeu d'origine (`docs/sources/`) et le lore du jeu (`docs/lore/`).
- `licenses/` : les textes originaux des licences.
- `memory/` : les notes de conception du projet (règles, accessibilité, décisions).

## Licence

Le projet est sous licence [Creative Commons BY-NC-SA 4.0](LICENSE), comme le jeu d'origine dont il est une adaptation. Détails et autres licences dans [CREDITS.md](CREDITS.md).
