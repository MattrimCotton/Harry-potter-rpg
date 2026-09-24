# Règles du jeu — référence d'implémentation

Implémentation : `js/manoeuvres.js` (ids : `faire-face`, `acquerir-connaissance`, `cacher-faufiler`, `obtenir`, `aider-entraver`, `approcher-creature`, `lancer-sort`, `dueller`, `preparer-potion`, `objet-magique`, `jet`).

Source : *Hogwarts: An RPG* v1.2, `resources-pdf/Hogwarts RPG Full Game.pdf`. Les termes français suivent `termes-reference.md` (lore Gallimard). Adaptation solo : « le Narrateur » = le moteur de scénario.

## Principes

- Une **manœuvre** se déclenche quand la fiction le demande ; son résultat doit se produire dans l'histoire.
- On ne demande pas un jet à chaque coup de baguette : seulement quand l'issue est incertaine. Un sort d'au moins deux Années en dessous de l'Année du personnage réussit sans jet, sauf en situation de stress.
- Le joueur décrit comment il réussit ; le Narrateur décrit l'échec.

## Traits

Bravoure, Ruse, Intellect, Loyauté, Magie. Répartir **-1, 0, +1, +1, +2**. Bonus de maison +1. Aucun trait ne dépasse jamais **+3**.

## Jet

2d6 + trait (+ bonus éventuels).
- **10+** : succès complet.
- **7-9** : succès avec un coût (souvent une option à choisir).
- **6-** : échec, **marquer 1 Expérience**, le Narrateur *peut* appliquer une Conséquence Grave (il doit au minimum faire une manœuvre de Narrateur).

Bonus de +1 :
- **Matière préférée** : +1 à tout jet lié à cette matière.
- **Ami ou Rival** : +1 pour Aider ou Entraver cette personne.

## Manœuvres de base

### Faire Face au Danger (+Bravoure)
- 10+, choisir 1 : vous tenez bon et personne n'est blessé · vous n'êtes pas blessé et vous blessez la menace en retour.
- 7-9, choisir 1 : vous blessez la menace mais elle vous blesse aussi · vous ne pouvez pas agir mais la menace recule · vous fuyez sans Conséquence Grave · vous évitez la Conséquence Grave mais quelqu'un d'autre la subit.
- 6- : vous n'arrivez pas à faire face ; Conséquence Grave possible.

### Acquérir des Connaissances (+Intellect)
Sur une personne, un objet, une situation, un lieu ; par une conversation, un document ; ou de mémoire.
- 10+ : une question, réponse vraie et complète.
- 7-9 : une question, réponse vraie mais pas forcément complète.
- 6- : une question, réponse ni forcément complète ni forcément vraie ; Conséquence Grave possible.
Questions types : Qu'est-ce qui n'est pas ce qu'il paraît ? Où est ce que je cherche ? Quelle est son histoire ? Comment m'en servir ? Dit-on la vérité ? Que veut vraiment cette personne ? De quoi est-ce que je me souviens ?

### Se Cacher et se Faufiler (+Ruse)
- 10+ : non détecté.
- 7-9, choisir 1 : quelqu'un vous cherche (ou cherche l'objet) · quelqu'un sait que vous êtes là mais pas où · vous laissez une trace.
- 6- : découvert ; Conséquence Grave possible.

### Obtenir ce que l'on Cherche (+Bravoure par l'honnêteté, la négociation, le charisme, l'humilité ; +Ruse par la ruse, la tricherie, le vol)
- 10+ : vous l'obtenez sans problème.
- 7-9, vous l'obtenez mais choisir 1 : la personne est méfiante · vous devez donner ou promettre quelque chose · son attitude envers vous change.
- 6- : échec ; Conséquence Grave possible.

### Aider ou Entraver quelqu'un (+Loyauté, +1 si Ami/Rival)
- Personnage du Narrateur : 10+ vous aidez/entravez comme voulu. 7-9, choisir 1 : vous prenez un État · la personne est blessée par accident · elle vous en veut · elle se méfie de vos motifs. 6- : échec ; Conséquence Grave possible.
- (Autre personnage principal : ±1 à son jet, empêcher un État, ou offrir 1 XP pour qu'il arrête. Peu utile en solo.)

### Approcher une Créature Magique (+Loyauté)
Apprivoiser, aider, obtenir l'aide d'une créature.
- 10+ : elle agit comme vous le voulez.
- 7-9, choisir 1 : elle obéit mais vous prenez un État · elle obéit mais attire l'attention · elle n'obéit pas mais fait autre chose d'utile.
- 6- : la créature s'emballe ; Conséquence Grave possible.

### Jet libre (+trait au choix)
Quand rien d'autre ne s'applique. 10+ sans problème ; 7-9 avec un coût ; 6- ça empire.

## Manœuvres magiques

### Lancer un Sort (+Magie)
Il faut connaître le sort, dire la formule et agiter la baguette. Sinon : **dépenser 1 Chance**, puis jet.
- 10+ : le sort fonctionne comme voulu.
- 7-9, choisir 1 : effet moins puissant · effet moins durable · vous attirez l'attention.
- 6- : échec ; Conséquence Grave possible.

### Dueller (+Magie)
- 10+ : votre sort touche, le sien rate.
- 7-9, choisir 1 : les sorts se percutent en plein vol · les deux ratent · les deux touchent.
- 6- : votre sort rate, le sien touche ; Conséquence Grave **obligatoire**.
Un sort défensif ou de soin : « toucher » = bloquer / réussir. Le duel finit quand quelqu'un abandonne ou ne peut plus lancer de sort.

### Préparer une Potion (+Magie)
Il faut les ingrédients, de quoi les assembler et une baguette. Potion inconnue : dépenser 1 Chance.
- 10+ : potion réussie.
- 7-9, choisir 1 : effet secondaire imprévu · la préparation tourne mal et vous prenez un État · vous faites une autre potion (le Narrateur dit laquelle).
- 6- : échec ; Conséquence Grave possible.

### Utiliser un Objet Magique (+Magie)
- 10+ : fonctionne parfaitement.
- 7-9, choisir 1 : effet inattendu mais utile · effet affaibli · fonctionne mais vous prenez un État · fonctionne mais se casse.
- 6- : ne fonctionne pas ; Conséquence Grave possible.

## États (Conditions)

| État | Effet | Se lève quand… |
|---|---|---|
| Apeuré | -2 Bravoure | vous évitez quelque chose de difficile |
| Furieux | -2 Ruse | vous blessez quelqu'un ou cassez quelque chose |
| Stressé | -2 Intellect | vous dites quelque chose de blessant |
| Jaloux | -2 Loyauté | vous trahissez un ami |
| Gêné | -2 Magie | vous prenez mal une remarque |
| Blessé | -1 à tous les traits | soigné par médecine ou magie |
| Ensorcelé | -1 à un trait choisi par le Narrateur | guéri |
| Inconscient | ne peut pas agir | ranimé ; peut être évité en prenant un autre État |

- Les 5 états émotionnels se lèvent aussi quand quelqu'un vous réconforte ou vous soutient.
- Blessé, Ensorcelé, Inconscient se soignent toujours à l'infirmerie.
- Passer du temps avec son **animal** : transformer un État coché en un autre.
- **Les 8 états cochés** → jet + trait le plus élevé : 10+ retour, tous états levés · 7-9 retour, seul Inconscient levé · 6- le personnage quitte l'histoire. En cas de retour : noter une **cicatrice** physique ou mentale.

## Sorts et États

Un sort de soin peut lever Blessé, Ensorcelé ou Inconscient. Un sort de défense peut empêcher un État. Un maléfice peut infliger Ensorcelé. Un sortilège (curse) peut infliger Blessé ou Inconscient.

Apprendre un sort : en cours, auprès d'un mentor, d'un livre ou d'un élève (qui doit réussir Aider). Pas de jet pour apprendre, sauf si l'information est cachée. Un sort vu en classe est appris immédiatement. On connaît tous les sorts des Années déjà terminées.

**Sortilèges Impardonnables** : jamais au départ, ni par Progression, ni en cours. Les lancer peut entraîner une Conséquence Grave pour le lanceur.

**Patronus** : choisi sur la table 2d6 ; ne peut être lancé qu'une fois le sortilège appris (en général en 5e année).

## Chance

3 points. Dépenser 1 point pour faire ce qu'on ne pourrait normalement pas faire (sort inconnu, potion inconnue…) **ou** pour transformer un jet en 10+. Toute la Chance revient à la fin d'une année scolaire.

## Expérience et Progression

Marquer 1 XP à chaque 6-. À **4 XP** (ou à la fin d'une année scolaire), choisir une Progression puis remettre l'XP à 0 :
- +1 à un trait (2 fois maximum, jamais au-delà de +3) ;
- une deuxième Matière préférée (1 fois) ;
- un nouveau sort de son Année (illimité) ;
- un objet magique (illimité) ;
- récupérer 1 point de Chance (illimité).

## Amis et Rivaux

Jusqu'à 2 Amis et 1 Rival. On n'en ajoute ou n'en retire qu'**à la fin d'une session**. +1 pour Aider ou Entraver cette personne.

## Création (résumé)

1. Année (1-7 ou diplômé). 2. Apparence (teint, cheveux, silhouette, 1d6 chacun). 3. Baguette : ambition/bois, cœur (dragon, phénix, licorne), aspect. 4. Origine 1d6 : 1-2 Né-Moldu (1 sort, 3 XP), 3-4 Sang-mêlé (2 sorts, 2 XP), 5-6 Sang-pur (3 sorts, 1 XP). 5. Matière préférée (2d6 : obligatoire ou option ; options dès la 3e année). 6. Sorts de son Année. 7. Traits. 8. Nom. 9. Animal optionnel (hibou/chouette : courrier ; rat : pas de courrier ; chat : refuse le courrier). 10. Maison 1d6 (5-6 relancer), ou maison du meilleur trait. 11. Amis/Rivaux via les questions de la maison. 12. Patronus (2d6).

Les tables sont dans `contenu/tables.json`, les sorts dans `contenu/sorts.json`.

## Manœuvres du Narrateur (pour écrire les scénarios)

- Générales : séparer les personnages · les réunir · changer l'attitude de quelqu'un · menacer ce qui compte pour eux · imposer un choix difficile · offrir une occasion, avec ou sans prix · retourner leur manœuvre contre eux · poser une question · « Que faites-vous ? ».
- Personnages : donner ou retirer des points de maison · donner du travail en plus · interdire un lieu ou une chose · lancer un sort.
- Histoire : montrer les signes d'une menace · introduire un personnage, un lieu ou une menace.
- **Conséquences Graves** (sur un 6-) : infliger un État cohérent · sanction (points, retenue, privilèges, parents, renvoi temporaire ou définitif) · retirer quelque chose · blesser un proche · situation impossible · attitude négative · révéler un secret · laisser gagner le rival.

Points de maison : 5 (trivial), 10 (mineur), 20 (notable), 50 (majeur).

## Principes de Poudlard (ton des scénarios)

Accueillir le fantaisiste · décrire le monde avec émerveillement et danger · menaces réelles, conséquences sérieuses · adultes sages, incrédules et inutiles · partir des livres et des films, mais suivre l'histoire.

## Non implémenté (hors périmètre pour l'instant)

Quidditch (manœuvres d'équipe et Vif d'or), Mystères, Menaces, Points de maison, lieux et objets du « Setting Quick Reference ».
