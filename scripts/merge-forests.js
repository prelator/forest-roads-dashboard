import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON files
const nationalForests = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'public', 'data', 'national-forests.json'), 'utf8')
);

const rangerDistricts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'public', 'data', 'ranger-districts.json'), 'utf8')
);

// Create a map to group ranger districts by forest name
const districtsByForest = {};

rangerDistricts.forEach(district => {
  const forestName = district.FORESTNAME;
  if (!districtsByForest[forestName]) {
    districtsByForest[forestName] = [];
  }
  districtsByForest[forestName].push(district);
});

// Merge ranger districts into national forests
const mergedData = nationalForests.map(forest => {
  const forestName = forest.FORESTNAME;
  return {
    ...forest,
    RANGER_DISTRICTS: districtsByForest[forestName] || []
  };
});

// Write the merged data to a new file
const outputPath = path.join(__dirname, 'public', 'data', 'forests-with-districts.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');

console.log(`✓ Successfully merged ${nationalForests.length} national forests with ${rangerDistricts.length} ranger districts`);
console.log(`✓ Output written to: ${outputPath}`);

// Print some stats
const forestsWithDistricts = mergedData.filter(f => f.RANGER_DISTRICTS.length > 0).length;
const forestsWithoutDistricts = mergedData.length - forestsWithDistricts;
console.log(`✓ ${forestsWithDistricts} forests have ranger districts`);
console.log(`✓ ${forestsWithoutDistricts} forests have no ranger districts`);
