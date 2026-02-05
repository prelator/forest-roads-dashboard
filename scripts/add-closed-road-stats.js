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
    
    // Number of roads
    stats.NUM_ROADS++;
    
    // Total mileage
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

console.log('Processing forests and ranger districts...');
console.log('='.repeat(80));
console.log('');

let totalForestsProcessed = 0;
let totalDistrictsProcessed = 0;

// Process each forest
for (const forest of forestsWithDistricts) {
  const forestOrgCode = forest.FORESTORGCODE;
  
  // Get all closed roads for this forest by matching first 3 digits of ADMIN_ORG
  const forestRoads = closedRoads.filter(road => {
    if (!road.ADMIN_ORG) return false;
    const adminOrgPrefix = road.ADMIN_ORG.toString().substring(0, 3);
    return parseInt(adminOrgPrefix) === forestOrgCode;
  });
  
  // Calculate stats for the forest
  forest.CLOSED_ROADS = calculateClosedRoadStats(forestRoads);
  
  console.log(`FOREST: ${forest.FORESTNAME}`);
  console.log(`  Closed Roads: ${forestRoads.length}`);
  console.log(`  Total Mileage: ${forest.CLOSED_ROADS.TOTAL_MILEAGE} miles`);
  console.log(`  Admin Mileage: ${forest.CLOSED_ROADS.ADMIN_MILEAGE} miles`);
  console.log(`  Suitable for Trail Conversion: ${forest.CLOSED_ROADS.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION} miles`);
  console.log(`  Maintenance Levels:`);
  console.log(`    Decommissioned: ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.DECOMMISSIONED} miles`);
  console.log(`    ML1 (Closed): ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.ML1} miles`);
  console.log(`    ML2 (High Clearance): ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.ML2} miles`);
  console.log(`    ML3 (Passenger Cars): ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.ML3} miles`);
  console.log(`    ML4 (Moderate Comfort): ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.ML4} miles`);
  console.log(`    ML5 (High Comfort): ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.ML5} miles`);
  console.log(`    None: ${forest.CLOSED_ROADS.MAINTENANCE_LEVELS.NONE} miles`);
  
  totalForestsProcessed++;
  
  // Process each ranger district within this forest
  if (forest.RANGER_DISTRICTS && forest.RANGER_DISTRICTS.length > 0) {
    console.log(`  Ranger Districts: ${forest.RANGER_DISTRICTS.length}`);
    
    for (const district of forest.RANGER_DISTRICTS) {
      const districtOrgCode = district.DISTRICTORGCODE;
      
      // Get all closed roads for this district by matching ADMIN_ORG with DISTRICTORGCODE
      const districtRoads = closedRoads.filter(road => {
        if (!road.ADMIN_ORG) return false;
        return road.ADMIN_ORG.toString() === districtOrgCode.toString();
      });
      
      // Calculate stats for the district
      district.CLOSED_ROADS = calculateClosedRoadStats(districtRoads);
      
      console.log(`    District: ${district.DISTRICTNAME}`);
      console.log(`      Closed Roads: ${districtRoads.length}`);
      console.log(`      Total Mileage: ${district.CLOSED_ROADS.TOTAL_MILEAGE} miles`);
      console.log(`      Admin Mileage: ${district.CLOSED_ROADS.ADMIN_MILEAGE} miles`);
      
      totalDistrictsProcessed++;
    }
  } else {
    console.log(`  No ranger districts`);
  }
  
  console.log('');
}

console.log('='.repeat(80));
console.log('');
console.log('Writing updated data...');

// Write the updated data back to the file
const outputPath = path.join(__dirname, '..', 'public', 'data', 'forests-with-districts.json');
fs.writeFileSync(outputPath, JSON.stringify(forestsWithDistricts, null, 2), 'utf8');

console.log('✓ Successfully updated forests-with-districts.json');
console.log(`✓ Processed ${totalForestsProcessed} forests`);
console.log(`✓ Processed ${totalDistrictsProcessed} ranger districts`);
console.log(`✓ Output: ${outputPath}`);
