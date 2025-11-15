// Script pour ajouter le score QN (Qualité Nutritionnelle) à tous les aliments
const fs = require('fs');
const path = require('path');

// Règles de notation QN
const reglesQN = {
  // QN 5/5 - Excellent
  'légume': 5,
  'légumineuse': 5,
  
  // QN 4/5 - Très bon
  'fruit': 4,
  'gras_vegetal': 4, // Huiles saines, noix, graines
  
  // QN 3/5 - Neutre (à affiner selon sous-catégorie)
  'féculent': 3, // Sera affiné ci-dessous
  'protéine': 3, // Sera affiné ci-dessous
  
  // QN 1/5 - À limiter
  'extra': 1
};

// Affinage pour féculents
function getQNFeculent(aliment) {
  const nomLower = aliment.nom.toLowerCase();
  const sousCategorie = aliment.sousCategorie?.toLowerCase() || '';
  
  // Féculents blancs/raffinés = 2
  if (nomLower.includes('blanc') || 
      nomLower.includes('baguette') ||
      nomLower.includes('brioche') ||
      nomLower.includes('croissant') ||
      nomLower.includes('viennoiserie') ||
      nomLower.includes('biscuit') ||
      sousCategorie.includes('viennoiserie')) {
    return 2;
  }
  
  // Féculents complets/grains entiers = 3
  if (nomLower.includes('complet') ||
      nomLower.includes('quinoa') ||
      nomLower.includes('boulgour') ||
      nomLower.includes('sarrasin') ||
      nomLower.includes('épeautre') ||
      nomLower.includes('kamut') ||
      nomLower.includes('orge') ||
      nomLower.includes('millet') ||
      nomLower.includes('patate douce') ||
      nomLower.includes('noir') ||
      nomLower.includes('rouge') ||
      sousCategorie.includes('graines')) {
    return 3;
  }
  
  // Par défaut pour féculents = 2
  return 2;
}

// Affinage pour protéines
function getQNProteine(aliment) {
  const nomLower = aliment.nom.toLowerCase();
  const sousCategorie = aliment.sousCategorie?.toLowerCase() || '';
  
  // Protéines très maigres = 4
  if (nomLower.includes('blanc 0%') ||
      nomLower.includes('skyr') ||
      nomLower.includes('limande') ||
      nomLower.includes('cabillaud') ||
      nomLower.includes('daurade') ||
      nomLower.includes('crevettes') ||
      nomLower.includes('moules') ||
      nomLower.includes('crabe') ||
      nomLower.includes('surimi') ||
      sousCategorie.includes('fruits de mer')) {
    return 4;
  }
  
  // Protéines maigres = 3
  if (nomLower.includes('poulet') ||
      nomLower.includes('dinde') ||
      nomLower.includes('poisson') ||
      nomLower.includes('thon') ||
      nomLower.includes('œuf') ||
      nomLower.includes('tofu') ||
      nomLower.includes('tempeh') ||
      nomLower.includes('seitan') ||
      nomLower.includes('yaourt nature') ||
      nomLower.includes('jambon blanc')) {
    return 3;
  }
  
  // Protéines moyennes/grasses = 2
  return 2;
}

// Lecture du fichier
const filePath = path.join(__dirname, '../data/referentiel.js');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern pour trouver les objets aliments
const alimentPattern = /\{\s*\n\s*nom:\s*"([^"]+)",\s*\n\s*categorie:\s*"([^"]+)",\s*\n\s*sousCategorie:\s*"([^"]+)",\s*\n\s*kcal:\s*(\d+),/g;

let match;
let replacements = [];

// Première passe : identifier tous les aliments
while ((match = alimentPattern.exec(content)) !== null) {
  const fullMatch = match[0];
  const nom = match[1];
  const categorie = match[2];
  const sousCategorie = match[3];
  const kcal = match[4];
  
  // Si déjà un qn, skip
  if (content.slice(match.index, match.index + 200).includes('qn:')) {
    continue;
  }
  
  // Calculer le QN
  let qn = reglesQN[categorie] || 3;
  
  if (categorie === 'féculent') {
    qn = getQNFeculent({ nom, sousCategorie });
  } else if (categorie === 'protéine') {
    qn = getQNProteine({ nom, sousCategorie });
  }
  
  // Préparer le remplacement
  const newMatch = fullMatch.replace(
    `kcal: ${kcal},`,
    `kcal: ${kcal},\n    qn: ${qn},`
  );
  
  replacements.push({
    old: fullMatch,
    new: newMatch,
    nom: nom,
    qn: qn
  });
}

// Appliquer tous les remplacements
let newContent = content;
for (const rep of replacements) {
  newContent = newContent.replace(rep.old, rep.new);
}

// Écrire le nouveau contenu
fs.writeFileSync(filePath, newContent, 'utf8');

console.log(`✅ ${replacements.length} aliments mis à jour avec leur score QN`);
console.log('\n📊 Répartition des scores:');
const distribution = {};
replacements.forEach(r => {
  distribution[r.qn] = (distribution[r.qn] || 0) + 1;
});
Object.keys(distribution).sort().forEach(qn => {
  const emoji = qn >= 4 ? '🟢' : qn >= 3 ? '🟠' : '🔴';
  console.log(`${emoji} QN ${qn}/5: ${distribution[qn]} aliments`);
});
