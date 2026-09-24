// Gestion de la zone d'actions clavier.
// Chaque action est un <button> dans une <ul> accessible.

// Format d'une action :
// { label: string, action: () => void, raccourci?: string, desactive?: bool }

export function afficherActions(actions) {
  const $liste = document.getElementById('liste-actions');
  $liste.innerHTML = '';

  if (!actions || actions.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucune action disponible.';
    $liste.appendChild(li);
    return;
  }

  actions.forEach(({ label, action, raccourci, desactive }) => {
    const li  = document.createElement('li');
    const btn = document.createElement('button');

    if (raccourci) {
      // Label accessible complet sans le span visuel
      btn.setAttribute('aria-label', `${label}, raccourci ${raccourci}`);

      const spanLabel    = document.createElement('span');
      spanLabel.textContent = label;
      spanLabel.setAttribute('aria-hidden', 'true');

      const spanRaccourci = document.createElement('span');
      spanRaccourci.className   = 'raccourci';
      spanRaccourci.textContent = raccourci;
      spanRaccourci.setAttribute('aria-hidden', 'true');

      btn.appendChild(spanLabel);
      btn.appendChild(spanRaccourci);
    } else {
      btn.textContent = label;
    }

    if (desactive) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', action);
    }

    li.appendChild(btn);
    $liste.appendChild(li);
  });

  // Focus automatique sur le premier bouton actif
  const premier = $liste.querySelector('button:not([disabled])');
  if (premier) premier.focus();
}
