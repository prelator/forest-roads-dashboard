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
    TOTAL_SEASONAL_MILEAGE: 0, // Will remain 0 as this data is not available in NFS roads
    MAINTENANCE_LEVELS: {
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
    stats.NUM_ROADS = (stats.NUM_ROADS) + 1;
    
    // Total mileage
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
  
  return stats;
}

// Convert FORESTORGCODE to ADMIN_ORG prefix (first 4 digits with leading zero)
function forestCodeToAdminOrgPrefix(forestOrgCode) {
  // Example: 102 -> "0102"
  return '0' + forestOrgCode.toString();
}

// Convert DISTRICTORGCODE to ADMIN_ORG (with leading zero)
function districtCodeToAdminOrg(districtOrgCode) {
  // Example: 10201 -> "010201"
  return '0' + districtOrgCode.toString();
}

console.log('Processing forests and ranger districts...');
console.log('='.repeat(80));
console.log('');

let totalForestsUpdated = 0;
let totalDistrictsUpdated = 0;

// Process each forest
for (const forest of forestsWithDistricts) {
  const forestName = forest.FORESTNAME;
  const forestOrgCode = forest.FORESTORGCODE;
  
  // Check if this forest has zero roads from MVUM data
  if (forest.MVUM_ROADS && forest.MVUM_ROADS.NUM_ROADS === 0) {
    // Get the expected ADMIN_ORG prefix for this forest
    const adminOrgPrefix = forestCodeToAdminOrgPrefix(forestOrgCode);
    
    // Get all roads for this forest that are open to all and match the org code
    const forestRoads = nfsRoads.filter(road => 
      road.OPENFORUSETO === 'ALL' &&
      road.ADMIN_ORG && 
      road.ADMIN_ORG.startsWith(adminOrgPrefix)
    );
    
    if (forestRoads.length > 0) {
      // Calculate stats for the forest
      forest.MVUM_ROADS = calculateRoadStats(forestRoads);
      
      console.log(`FOREST: ${forestName}`);
      console.log(`  Updated from NFS roads`);
      console.log(`  Roads: ${forestRoads.length}`);
      console.log(`  Total Mileage: ${forest.MVUM_ROADS.TOTAL_MILEAGE} miles`);
      console.log(`  Maintenance Levels:`);
      console.log(`    ML1 (Closed): ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.ML1} miles`);
      console.log(`    ML2 (High Clearance): ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.ML2} miles`);
      console.log(`    ML3 (Passenger Cars): ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.ML3} miles`);
      console.log(`    ML4 (Moderate Comfort): ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.ML4} miles`);
      console.log(`    ML5 (High Comfort): ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.ML5} miles`);
      console.log(`    None: ${forest.MVUM_ROADS.MAINTENANCE_LEVELS.NONE} miles`);
      
      totalForestsUpdated++;
    }
  }
  
  // Process each ranger district within this forest
  if (forest.RANGER_DISTRICTS && forest.RANGER_DISTRICTS.length > 0) {
    for (const district of forest.RANGER_DISTRICTS) {
      const districtName = district.DISTRICTNAME;
      const districtOrgCode = district.DISTRICTORGCODE;
      
      // Check if this district has zero roads from MVUM data
      if (district.MVUM_ROADS && district.MVUM_ROADS.NUM_ROADS === 0) {
        // Get the expected ADMIN_ORG for this district
        const adminOrg = districtCodeToAdminOrg(districtOrgCode);
        
        // Get all roads for this district that are open to all and match the org code
        const districtRoads = nfsRoads.filter(
          road => road.OPENFORUSETO === 'ALL' && road.ADMIN_ORG === adminOrg
        );
        
        if (districtRoads.length > 0) {
          // Calculate stats for the district
          district.MVUM_ROADS = calculateRoadStats(districtRoads);
          
          console.log(`    District: ${districtName}`);
          console.log(`      Updated from NFS roads`);
          console.log(`      Roads: ${districtRoads.length}`);
          console.log(`      Total Mileage: ${district.MVUM_ROADS.TOTAL_MILEAGE} miles`);
          
          totalDistrictsUpdated++;
        }
      }
    }
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
console.log(`✓ Updated ${totalForestsUpdated} forests with missing MVUM data`);
console.log(`✓ Updated ${totalDistrictsUpdated} ranger districts with missing MVUM data`);
console.log(`✓ Output: ${outputPath}`);
