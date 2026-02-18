import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Loading data files...');

// Read the JSON files
const forestsWithDistricts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'forests-with-districts.json'), 'utf8')
);

const nfsRoads = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'nfs-roads.json'), 'utf8')
);

console.log(`✓ Loaded ${forestsWithDistricts.length} forests`);
console.log(`✓ Loaded ${nfsRoads.length} NFS roads`);
console.log('');

function calculateRoadStats(roads) {
  const stats = {
    NUM_ROADS: 0,
    TOTAL_MILEAGE: 0,
    TOTAL_SEASONAL_MILEAGE: 0,
    MAINTENANCE_LEVELS: {
      ML1: 0,
      ML2: 0,
      ML3: 0,
      ML4: 0,
      ML5: 0,
      NONE: 0
    },
    ALL_VEHICLES_MILEAGE: 0,
    HIGHWAY_VEHICLES_ONLY_MILEAGE: 0
  };

  for (const road of roads) {
    const segLength = parseFloat(road.SEG_LENGTH) || 0;
    
    stats.NUM_ROADS = stats.NUM_ROADS + 1;
    stats.TOTAL_MILEAGE += segLength;
    
    // Maintenance levels
    const maintLevel = road.OPER_MAINT_LEVEL;
    if (!maintLevel) {
      stats.MAINTENANCE_LEVELS.NONE += segLength;
    } else if (maintLevel === '1 - BASIC CUSTODIAL CARE (CLOSED)') {
      stats.MAINTENANCE_LEVELS.ML1 += segLength;
    } else if (maintLevel === '2 - HIGH CLEARANCE VEHICLES') {
      stats.MAINTENANCE_LEVELS.ML2 += segLength;
    } else if (maintLevel === '3 - SUITABLE FOR PASSENGER CARS') {
      stats.MAINTENANCE_LEVELS.ML3 += segLength;
    } else if (maintLevel === '4 - MODERATE DEGREE OF USER COMFORT') {
      stats.MAINTENANCE_LEVELS.ML4 += segLength;
    } else if (maintLevel === '5 - HIGH DEGREE OF USER COMFORT') {
      stats.MAINTENANCE_LEVELS.ML5 += segLength;
    } else {
      stats.MAINTENANCE_LEVELS.NONE += segLength;
    }
  }
  
  // Round all values to 2 decimal places
  stats.TOTAL_MILEAGE = Math.round(stats.TOTAL_MILEAGE * 100) / 100;
  stats.TOTAL_SEASONAL_MILEAGE = Math.round(stats.TOTAL_SEASONAL_MILEAGE * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML1 = Math.round(stats.MAINTENANCE_LEVELS.ML1 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML2 = Math.round(stats.MAINTENANCE_LEVELS.ML2 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML3 = Math.round(stats.MAINTENANCE_LEVELS.ML3 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML4 = Math.round(stats.MAINTENANCE_LEVELS.ML4 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML5 = Math.round(stats.MAINTENANCE_LEVELS.ML5 * 100) / 100;
  stats.MAINTENANCE_LEVELS.NONE = Math.round(stats.MAINTENANCE_LEVELS.NONE * 100) / 100;
  stats.ALL_VEHICLES_MILEAGE = Math.round(stats.ALL_VEHICLES_MILEAGE * 100) / 100;
  stats.HIGHWAY_VEHICLES_ONLY_MILEAGE = Math.round(stats.HIGHWAY_VEHICLES_ONLY_MILEAGE * 100) / 100;
  
  return stats;
}

function districtCodeToAdminOrg(districtOrgCode) {
  return '0' + districtOrgCode.toString();
}

console.log('Finding Angeles National Forest...');

// Find Angeles National Forest
const angelesForest = forestsWithDistricts.find(f => f.FORESTNAME === 'Angeles National Forest');

if (!angelesForest) {
  console.error('❌ Angeles National Forest not found!');
  process.exit(1);
}

console.log(`✓ Found Angeles National Forest (Org Code: ${angelesForest.FORESTORGCODE})`);
console.log('');

console.log('Current forest-level stats (INCORRECT):');
console.log(`  Roads: ${angelesForest.MVUM_ROADS.NUM_ROADS}`);
console.log(`  Total Mileage: ${angelesForest.MVUM_ROADS.TOTAL_MILEAGE} miles`);
console.log('');

console.log('Current ranger districts:');
angelesForest.RANGER_DISTRICTS.forEach(district => {
  console.log(`  ${district.DISTRICTNAME} (${district.DISTRICTORGCODE}): ${district.MVUM_ROADS.TOTAL_MILEAGE} miles`);
});
console.log('');

// Get the ADMIN_ORG codes for all defined ranger districts
const definedDistrictOrgs = angelesForest.RANGER_DISTRICTS.map(d => 
  districtCodeToAdminOrg(d.DISTRICTORGCODE)
);

console.log(`Defined district ADMIN_ORG codes: ${definedDistrictOrgs.join(', ')}`);
console.log('');

// Get all roads that belong to defined districts
const forestRoadsFromDefinedDistricts = nfsRoads.filter(road => 
  road.OPENFORUSETO === 'ALL' &&
  road.ADMIN_ORG && 
  definedDistrictOrgs.includes(road.ADMIN_ORG)
);

console.log('Recalculating forest stats from defined districts only...');

// Calculate the corrected stats
const correctedStats = calculateRoadStats(forestRoadsFromDefinedDistricts);

console.log('');
console.log('New forest-level stats (CORRECT):');
console.log(`  Roads: ${correctedStats.NUM_ROADS}`);
console.log(`  Total Mileage: ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  Maintenance Levels:`);
console.log(`    ML1 (Closed): ${correctedStats.MAINTENANCE_LEVELS.ML1} miles`);
console.log(`    ML2 (High Clearance): ${correctedStats.MAINTENANCE_LEVELS.ML2} miles`);
console.log(`    ML3 (Passenger Cars): ${correctedStats.MAINTENANCE_LEVELS.ML3} miles`);
console.log(`    ML4 (Moderate Comfort): ${correctedStats.MAINTENANCE_LEVELS.ML4} miles`);
console.log(`    ML5 (High Comfort): ${correctedStats.MAINTENANCE_LEVELS.ML5} miles`);
console.log(`    None: ${correctedStats.MAINTENANCE_LEVELS.NONE} miles`);
console.log('');

// Verify: sum of district mileage should equal forest mileage
const sumOfDistrictMileage = angelesForest.RANGER_DISTRICTS.reduce((sum, d) => 
  sum + d.MVUM_ROADS.TOTAL_MILEAGE, 0
);

console.log('Verification:');
console.log(`  Sum of district mileage: ${sumOfDistrictMileage.toFixed(2)} miles`);
console.log(`  New forest mileage: ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  Match: ${Math.abs(sumOfDistrictMileage - correctedStats.TOTAL_MILEAGE) < 0.01 ? '✓ YES' : '✗ NO'}`);
console.log('');

// Check for orphaned roads (belonging to undefined districts)
const allAngelesRoads = nfsRoads.filter(road =>
  road.OPENFORUSETO === 'ALL' &&
  road.ADMIN_ORG &&
  road.ADMIN_ORG.startsWith('0501')
);

const orphanedRoads = allAngelesRoads.filter(road => 
  !definedDistrictOrgs.includes(road.ADMIN_ORG)
);

if (orphanedRoads.length > 0) {
  const orphanedOrgs = [...new Set(orphanedRoads.map(r => r.ADMIN_ORG))].sort();
  console.log('⚠️  WARNING: Found roads belonging to undefined districts:');
  orphanedOrgs.forEach(org => {
    const count = orphanedRoads.filter(r => r.ADMIN_ORG === org).length;
    const mileage = orphanedRoads
      .filter(r => r.ADMIN_ORG === org)
      .reduce((sum, r) => sum + (parseFloat(r.SEG_LENGTH) || 0), 0)
      .toFixed(2);
    console.log(`  ${org}: ${count} roads, ${mileage} miles (NOT included in forest stats)`);
  });
  console.log('');
}

// Update the forest stats
angelesForest.MVUM_ROADS = correctedStats;

console.log('Writing updated data...');

// Write the updated data back to the file
const outputPath = path.join(__dirname, '..', 'public', 'data', 'forests-with-districts.json');
fs.writeFileSync(outputPath, JSON.stringify(forestsWithDistricts, null, 2), 'utf8');

console.log('✓ Successfully updated Angeles National Forest stats');
console.log(`✓ Output: ${outputPath}`);
console.log('');
console.log('Summary:');
console.log(`  OLD: ${angelesForest.RANGER_DISTRICTS.length} districts, forest total was ${348.26} miles`);
console.log(`  NEW: ${angelesForest.RANGER_DISTRICTS.length} districts, forest total is ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  This correctly reflects only roads from defined ranger districts.`);
