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

const closedRoads = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'closed-roads.json'), 'utf8')
);

console.log(`✓ Loaded ${forestsWithDistricts.length} forests`);
console.log(`✓ Loaded ${closedRoads.length} closed roads`);
console.log('');

function calculateClosedRoadStats(roads) {
  const stats = {
    NUM_ROADS: 0,
    TOTAL_MILEAGE: 0,
    ADMIN_MILEAGE: 0,
    MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION: 0,
    MAINTENANCE_LEVELS: {
      DECOMMISSIONED: 0,
      ML1: 0,
      ML2: 0,
      ML3: 0,
      ML4: 0,
      ML5: 0,
      NONE: 0
    }
  };

  for (const road of roads) {
    const segLength = parseFloat(road.SEG_LENGTH) || 0;
    
    stats.NUM_ROADS++;
    stats.TOTAL_MILEAGE += segLength;
    
    // Admin mileage
    if (road.OPENFORUSETO === 'ADMIN') {
      stats.ADMIN_MILEAGE += segLength;
    }
    
    // Mileage suitable for trail conversion
    if (road.SYMBOL_NAME === 'Road, Not Maintained for Passenger Car') {
      stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION += segLength;
    }
    
    // Maintenance levels
    const maintLevel = road.OPER_MAINT_LEVEL;
    if (!maintLevel) {
      stats.MAINTENANCE_LEVELS.NONE += segLength;
    } else if (maintLevel === 'D - DECOMMISSION') {
      stats.MAINTENANCE_LEVELS.DECOMMISSIONED += segLength;
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
  stats.ADMIN_MILEAGE = Math.round(stats.ADMIN_MILEAGE * 100) / 100;
  stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION = Math.round(stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION * 100) / 100;
  stats.MAINTENANCE_LEVELS.DECOMMISSIONED = Math.round(stats.MAINTENANCE_LEVELS.DECOMMISSIONED * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML1 = Math.round(stats.MAINTENANCE_LEVELS.ML1 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML2 = Math.round(stats.MAINTENANCE_LEVELS.ML2 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML3 = Math.round(stats.MAINTENANCE_LEVELS.ML3 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML4 = Math.round(stats.MAINTENANCE_LEVELS.ML4 * 100) / 100;
  stats.MAINTENANCE_LEVELS.ML5 = Math.round(stats.MAINTENANCE_LEVELS.ML5 * 100) / 100;
  stats.MAINTENANCE_LEVELS.NONE = Math.round(stats.MAINTENANCE_LEVELS.NONE * 100) / 100;
  
  return stats;
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

console.log('Current forest-level closed roads stats (INCORRECT):');
console.log(`  Roads: ${angelesForest.CLOSED_ROADS.NUM_ROADS}`);
console.log(`  Total Mileage: ${angelesForest.CLOSED_ROADS.TOTAL_MILEAGE} miles`);
console.log('');

console.log('Current ranger districts:');
angelesForest.RANGER_DISTRICTS.forEach(district => {
  console.log(`  ${district.DISTRICTNAME} (${district.DISTRICTORGCODE}): ${district.CLOSED_ROADS.TOTAL_MILEAGE} miles`);
});
console.log('');

// Get the DISTRICTORGCODE for all defined ranger districts
// Note: In closed-roads.json, ADMIN_ORG is string; in forests file, DISTRICTORGCODE is number
// Convert to strings for comparison
const definedDistrictCodes = angelesForest.RANGER_DISTRICTS.map(d => d.DISTRICTORGCODE.toString());

console.log(`Defined district codes: ${definedDistrictCodes.join(', ')}`);
console.log('');

// Get all closed roads that belong to defined districts
// Convert ADMIN_ORG to string for comparison
const forestRoadsFromDefinedDistricts = closedRoads.filter(road => 
  road.ADMIN_ORG && 
  definedDistrictCodes.includes(road.ADMIN_ORG.toString())
);

console.log('Recalculating forest closed roads stats from defined districts only...');

// Calculate the corrected stats
const correctedStats = calculateClosedRoadStats(forestRoadsFromDefinedDistricts);

console.log('');
console.log('New forest-level closed roads stats (CORRECT):');
console.log(`  Roads: ${correctedStats.NUM_ROADS}`);
console.log(`  Total Mileage: ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  Admin Mileage: ${correctedStats.ADMIN_MILEAGE} miles`);
console.log(`  Suitable for Trail Conversion: ${correctedStats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION} miles`);
console.log(`  Maintenance Levels:`);
console.log(`    Decommissioned: ${correctedStats.MAINTENANCE_LEVELS.DECOMMISSIONED} miles`);
console.log(`    ML1 (Closed): ${correctedStats.MAINTENANCE_LEVELS.ML1} miles`);
console.log(`    ML2 (High Clearance): ${correctedStats.MAINTENANCE_LEVELS.ML2} miles`);
console.log(`    ML3 (Passenger Cars): ${correctedStats.MAINTENANCE_LEVELS.ML3} miles`);
console.log(`    ML4 (Moderate Comfort): ${correctedStats.MAINTENANCE_LEVELS.ML4} miles`);
console.log(`    ML5 (High Comfort): ${correctedStats.MAINTENANCE_LEVELS.ML5} miles`);
console.log(`    None: ${correctedStats.MAINTENANCE_LEVELS.NONE} miles`);
console.log('');

// Verify: sum of district mileage should equal forest mileage
const sumOfDistrictMileage = angelesForest.RANGER_DISTRICTS.reduce((sum, d) => 
  sum + d.CLOSED_ROADS.TOTAL_MILEAGE, 0
);

console.log('Verification:');
console.log(`  Sum of district mileage: ${sumOfDistrictMileage.toFixed(2)} miles`);
console.log(`  New forest mileage: ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  Match: ${Math.abs(sumOfDistrictMileage - correctedStats.TOTAL_MILEAGE) < 0.01 ? '✓ YES' : '✗ NO'}`);
console.log('');

// Check for orphaned roads (belonging to codes with 501 prefix but not our defined districts)
const allAngelesCodedRoads = closedRoads.filter(road =>
  road.ADMIN_ORG &&
  road.ADMIN_ORG.toString().startsWith('501')
);

const orphanedRoads = allAngelesCodedRoads.filter(road => 
  !definedDistrictCodes.includes(road.ADMIN_ORG.toString())
);

if (orphanedRoads.length > 0) {
  const orphanedOrgs = [...new Set(orphanedRoads.map(r => r.ADMIN_ORG))].sort((a, b) => Number(a) - Number(b));
  console.log('⚠️  WARNING: Found closed roads with Angeles-like codes but not in defined districts:');
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
angelesForest.CLOSED_ROADS = correctedStats;

console.log('Writing updated data...');

// Write the updated data back to the file
const outputPath = path.join(__dirname, '..', 'public', 'data', 'forests-with-districts.json');
fs.writeFileSync(outputPath, JSON.stringify(forestsWithDistricts, null, 2), 'utf8');

console.log('✓ Successfully updated Angeles National Forest closed roads stats');
console.log(`✓ Output: ${outputPath}`);
console.log('');
console.log('Summary:');
console.log(`  OLD: Forest total was 394 roads, 592.85 miles`);
console.log(`  NEW: Forest total is ${correctedStats.NUM_ROADS} roads, ${correctedStats.TOTAL_MILEAGE} miles`);
console.log(`  This correctly reflects only closed roads from defined ranger districts.`);
