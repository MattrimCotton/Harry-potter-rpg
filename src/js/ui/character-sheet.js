// Lecture et affichage de la fiche de personnage.
// Appelé par les touches F1-F5 : annonce sans déplacer le focus, pour ne pas perdre sa place.

import { annoncer } from './narration.js';
import { NOMS_TRAITS, traitEffectif } from '../rules/character.js';

export function lireFiche(section, personnage) {
  if (!personnage || !personnage.prenom) {
    annoncer('Aucun personnage créé pour l\'instant.');
    return;
  }

  let texte = '';

  switch (section) {
    case 'traits': {
      const lignes = Object.entries(NOMS_TRAITS).map(([cle, nom]) => {
        const effectif = traitEffectif(personnage, cle);
        const base     = personnage.traits[cle];
        const diff     = effectif - base;
        let str = `${nom} : ${_signeParle(base)}`;
        if (diff !== 0) str += ` (effectif : ${_signeParle(effectif)} à cause des états)`;
        return str;
      });
      texte = 'Vos traits. ' + lignes.join('. ') + '.';
      break;
    }

    case 'etats': {
      const actifs = personnage.etats.filter(e => e.actif);
      if (actifs.length === 0) {
        texte = 'Aucun état actif. Vous êtes en pleine forme.';
      } else {
        const noms = actifs.map(e => {
          const malus = e.malus === -99 ? 'hors jeu' : `malus ${_signeParle(e.malus)}`;
          return `${e.nom}, ${malus} en ${e.trait === 'tous' ? 'tous les traits' : NOMS_TRAITS[e.trait] ?? e.trait}`;
        });
        texte = `${actifs.length} état${actifs.length > 1 ? 's' : ''} actif${actifs.length > 1 ? 's' : ''} : ` + noms.join('. ') + '.';
      }
      break;
    }

    case 'sorts': {
      if (!personnage.sorts || personnage.sorts.length === 0) {
        texte = 'Vous ne connaissez aucun sort pour l\'instant.';
      } else {
        const liste = personnage.sorts.map(s => `${s.nom} : ${s.description}`).join('. ');
        texte = `Sorts connus, ${personnage.sorts.length} au total. ${liste}.`;
      }
      break;
    }

    case 'amis': {
      const amis   = personnage.amis.length > 0
        ? `Amis : ${personnage.amis.join(', ')}.`
        : 'Aucun ami.';
      const rivaux = personnage.rivaux.length > 0
        ? `Rivaux : ${personnage.rivaux.join(', ')}.`
        : 'Aucun rival.';
      texte = amis + ' ' + rivaux + ' Rappel : un ami ou un rival vous donne plus un au jet pour l\'aider ou l\'entraver.';
      break;
    }

    case 'chance': {
      const xpManquant = 4 - personnage.experience;
      texte = [
        `Chance : ${personnage.chance} point${personnage.chance !== 1 ? 's' : ''} sur 3.`,
        `Expérience : ${personnage.experience} point${personnage.experience !== 1 ? 's' : ''} sur 4.`,
        xpManquant > 0
          ? `Il vous faut encore ${xpManquant} point${xpManquant > 1 ? 's' : ''} pour une Progression.`
          : 'Vous pouvez prendre une Progression.',
        personnage.cicatrices.length > 0
          ? `Cicatrices : ${personnage.cicatrices.join(', ')}.`
          : ''
      ].filter(Boolean).join(' ');
      break;
    }
  }

  if (texte) annoncer(texte);
}

// Met à jour le DOM de la fiche (appelé après chaque changement d'état).
export function mettreAJourFiche(personnage) {
  if (!personnage) return;

  // Traits
  const $traits = document.getElementById('liste-traits');
  $traits.innerHTML = '';
  Object.entries(NOMS_TRAITS).forEach(([cle, nom]) => {
    const val = personnage.traits[cle];
    _ajouterDL($traits, nom, val >= 0 ? `+${val}` : `${val}`);
  });

  // États
  const $etats = document.getElementById('liste-etats');
  $etats.innerHTML = '';
  const actifs = personnage.etats.filter(e => e.actif);
  if (actifs.length === 0) {
    _ajouterLI($etats, 'Aucun état actif.');
  } else {
    actifs.forEach(e => _ajouterLI($etats, `${e.nom} (${_signeParle(e.malus)})`));
  }

  // Sorts
  const $sorts = document.getElementById('liste-sorts');
  $sorts.innerHTML = '';
  if (!personnage.sorts?.length) {
    _ajouterLI($sorts, 'Aucun sort connu.');
  } else {
    personnage.sorts.forEach(s => _ajouterLI($sorts, `${s.nom} — ${s.description}`));
  }

  // Amis & Rivaux
  const $amis = document.getElementById('liste-amis');
  $amis.innerHTML = '';
  personnage.amis.forEach(n   => _ajouterLI($amis, `Ami : ${n}`));
  personnage.rivaux.forEach(n => _ajouterLI($amis, `Rival : ${n}`));
  if (!personnage.amis.length && !personnage.rivaux.length) _ajouterLI($amis, 'Aucune relation.');

  // Chance & Expérience
  const $chance = document.getElementById('liste-chance');
  $chance.innerHTML = '';
  _ajouterDL($chance, 'Chance',      `${personnage.chance} / 3`);
  _ajouterDL($chance, 'Expérience',  `${personnage.experience} / 4`);
  _ajouterDL($chance, 'Maison',      personnage.maison      || '—');
  _ajouterDL($chance, 'Origine',     _labelOrigine(personnage.origine));
  _ajouterDL($chance, 'Année',       personnage.annee ? `${personnage.annee}e année` : '—');
  _ajouterDL($chance, 'Patronus',    personnage.patronus    || 'Non découvert');
  if (personnage.cicatrices?.length) {
    _ajouterDL($chance, 'Cicatrices', personnage.cicatrices.join(', '));
  }

  // Rendre la fiche visible
  document.getElementById('fiche-personnage').hidden = false;
}

// ---- Helpers DOM ----

function _ajouterDL($parent, terme, valeur) {
  const dt = document.createElement('dt');
  dt.textContent = terme;
  const dd = document.createElement('dd');
  dd.textContent = valeur;
  $parent.appendChild(dt);
  $parent.appendChild(dd);
}

function _ajouterLI($parent, texte) {
  const li = document.createElement('li');
  li.textContent = texte;
  $parent.appendChild(li);
}


function _signeParle(val) {
  if (val === -99) return 'hors jeu';
  if (val === 0)   return 'zéro';
  if (val > 0)     return `plus ${val}`;
  return `moins ${Math.abs(val)}`;
}

function _labelOrigine(origine) {
  const labels = { 'ne-moldu': 'Né-Moldu', 'demi-sang': 'Demi-sang', 'sang-pur': 'Sang-pur' };
  return labels[origine] || '—';
}
