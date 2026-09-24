#!/usr/bin/env node
// build.js — Crée dist/hogwarts-rpg.html, fichier autonome sans serveur requis.
// Usage (depuis la racine du projet) : node tools/build.js
// Sources : src/ (HTML, CSS, JS, données JSON, Bootstrap dans src/lib/).
// Sortie : dist/hogwarts-rpg.html (ouvrir directement dans n'importe quel navigateur moderne)

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'src');
const SORTIE = path.join(ROOT, 'dist', 'hogwarts-rpg.html');

// ================================================================
// Ordre de traitement : feuilles en premier, main.js en dernier
// ================================================================
const MODULES = [
  'js/ui/narration.js',
  'js/rules/character.js',
  'js/engine/save.js',
  'js/ui/choices.js',
  'js/rules/dice.js',
  'js/ui/character-sheet.js',
  'js/ui/keyboard.js',
  'js/rules/moves.js',
  'js/engine/character-creation.js',
  'js/engine/scenario.js',
  'js/engine/game.js',
  'js/main.js'
];

// Ressources JSON à bundler (clé = chemin relatif à src/, tel qu'utilisé dans fetch())
const JSON_RESOURCES = [
  'data/spells.json',
  'data/tables.json',
  'data/scenarios/index.json',
  'data/scenarios/back-compartment.json'
];

// ================================================================
// Transformation d'un module ES6 → code compatible script classique
// ================================================================

function collectExports(code) {
  const names = new Set();

  // export [async] function foo
  for (const m of code.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm))
    names.add(m[1]);

  // export const / let / var foo
  for (const m of code.matchAll(/^export\s+(?:const|let|var)\s+(\w+)/gm))
    names.add(m[1]);

  // export class Foo
  for (const m of code.matchAll(/^export\s+class\s+(\w+)/gm))
    names.add(m[1]);

  // export { foo, bar as baz }
  for (const m of code.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const part of m[1].split(',')) {
      const segments = part.trim().split(/\s+as\s+/);
      const name = (segments[1] ?? segments[0]).trim();
      if (name) names.add(name);
    }
  }

  return [...names].filter(Boolean);
}

function transformModule(code) {
  // Supprime les imports (une ou plusieurs lignes)
  // Forme simple : import { ... } from '...'
  code = code.replace(/^import\s+[^;\n]+(?:;|$)/gm, '');
  // Forme multi-ligne (peu probable mais sécuritaire)
  code = code.replace(/^import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?/gm, '');

  // Retire le mot-clé export des déclarations
  code = code.replace(/^export\s+async\s+function\s+/gm, 'async function ');
  code = code.replace(/^export\s+function\s+/gm,         'function ');
  code = code.replace(/^export\s+(const|let|var)\s+/gm,  '$1 ');
  code = code.replace(/^export\s+class\s+/gm,            'class ');

  // Supprime les lignes export { ... }
  code = code.replace(/^export\s*\{[^}]*\}\s*;?\s*$/gm, '');

  return code;
}

function wrapModule(filePath) {
  const raw     = fs.readFileSync(path.join(SRC, filePath), 'utf8');
  const exports = collectExports(raw);
  const code    = transformModule(raw);

  const label = path.basename(filePath);

  if (exports.length === 0) {
    // Module sans export (peu probable) : exécuter sans capturer
    return `\n// ===== ${label} =====\n;(function() {\n${code}\n})();\n`;
  }

  const list = exports.join(', ');
  return `
// ===== ${label} =====
const { ${list} } = (function() {
${code}
  return { ${list} };
})();
`;
}

// ================================================================
// Ressources JSON : lues au moment du build, injectées comme objet JS
// ================================================================

function buildResourceMap() {
  const map = {};
  for (const rel of JSON_RESOURCES) {
    const full = path.join(SRC, rel);
    if (!fs.existsSync(full)) {
      console.warn(`  Avertissement : ${rel} introuvable — ignoré.`);
      continue;
    }
    map[rel] = JSON.parse(fs.readFileSync(full, 'utf8'));
    console.log(`  Bundlé : ${rel}`);
  }
  return map;
}

// ================================================================
// Build principal
// ================================================================

function build() {
  console.log('\nCompilation de dist/hogwarts-rpg.html...\n');

  // Vérifier les fichiers sources
  for (const mod of MODULES) {
    if (!fs.existsSync(path.join(SRC, mod))) {
      console.error(`ERREUR : ${mod} introuvable.`);
      process.exit(1);
    }
  }

  const css  = fs.readFileSync(path.join(SRC, 'css/style.css'), 'utf8');
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');

  // Bootstrap est copié dans src/lib/ et intégré au fichier : aucune connexion requise.
  // Les commentaires sourceMappingURL sont retirés (le navigateur chercherait le fichier .map).
  const sansSourceMap = (code) => code.replace(/\/[/*]# sourceMappingURL=.*$/m, '');
  const bootstrapCss = sansSourceMap(fs.readFileSync(path.join(SRC, 'lib/bootstrap/bootstrap.min.css'), 'utf8'));
  const bootstrapJs  = sansSourceMap(fs.readFileSync(path.join(SRC, 'lib/bootstrap/bootstrap.bundle.min.js'), 'utf8'));
  const resourceMap = buildResourceMap();

  // --- Fetch override : intercepte les appels JSON locaux ---
  const fetchOverride = `
// ===== Ressources JSON bundlées =====
const __RESSOURCES = ${JSON.stringify(resourceMap)};

;(function() {
  const _fetchNatif = typeof fetch !== 'undefined' ? fetch.bind(window) : null;
  window.fetch = function(url, options) {
    const cle = String(url).replace(/^\\.?\\//, '');
    if (Object.prototype.hasOwnProperty.call(__RESSOURCES, cle)) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: function() {
          return Promise.resolve(JSON.parse(JSON.stringify(__RESSOURCES[cle])));
        }
      });
    }
    if (_fetchNatif) return _fetchNatif(url, options);
    return Promise.reject(new Error('fetch non disponible pour : ' + url));
  };
})();
`;

  // --- Bundle des modules JS ---
  console.log('\nTraitement des modules JS :');
  let jsBundle = fetchOverride;
  for (const mod of MODULES) {
    console.log(`  ${mod}`);
    jsBundle += wrapModule(mod);
  }

  // --- Injection dans le HTML ---
  // Remplacements par fonction : le code injecté contient des « $ »,
  // que replace() interpréterait sinon comme des motifs spéciaux.
  let output = html
    // CSS inline
    .replace(
      /<link rel="stylesheet" href="lib\/bootstrap\/bootstrap\.min\.css">/,
      () => `<style>\n${bootstrapCss}\n</style>`
    )
    .replace(
      /<link rel="stylesheet" href="css\/style\.css">/,
      () => `<style>\n${css}\n</style>`
    )
    .replace(
      /<script src="lib\/bootstrap\/bootstrap\.bundle\.min\.js"><\/script>/,
      () => `<script>\n${bootstrapJs}\n</script>`
    )
    // Script module → script classique
    .replace(
      /<script type="module" src="js\/main\.js"><\/script>/,
      () => `<script>\n${jsBundle}\n</script>`
    );

  // --- Écriture ---
  const outPath = SORTIE;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf8');

  const sizeKo = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`\nTerminé ! dist/hogwarts-rpg.html créé (${sizeKo} Ko).`);
  console.log('Ouvrez ce fichier directement dans n\'importe quel navigateur moderne.');
  console.log('Aucun serveur, aucune installation requis.\n');
}

build();
