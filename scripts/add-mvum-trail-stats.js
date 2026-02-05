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

const mvumTrails = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'mvum-trails.json'), 'utf8')
);

console.log(`✓ Loaded ${forestsWithDistricts.length} forests`);
console.log(`✓ Loaded ${mvumTrails.length} MVUM trails`);
console.log('');

function calculateTrailStats(trails) {
  const stats = {
    NUM_TRAILS: 0,
    TOTAL_MILEAGE: 0,
    TOTAL_SEASONAL_MILEAGE: 0,
    TRAIL_TYPE: {
      FULL_SIZE: 0,
      ATV: 0,
      MOTORCYCLE: 0,
      SPECIAL: 0,
      OTHER: 0
    }
  };

  for (const trail of trails) {
    const segLength = parseFloat(trail.SEG_LENGTH) || 0;
    
    // Number of trails
    stats.NUM_TRAILS++;
    
    // Total mileage
    stats.TOTAL_MILEAGE += segLength;
    
    // Seasonal mileage
    if (trail.SEASONAL && trail.SEASONAL.toLowerCase() === 'seasonal') {
      stats.TOTAL_SEASONAL_MILEAGE += segLength;
    }
    
    // Trail type based on MVUM_SYMBOL_NAME
    const symbolName = trail.MVUM_SYMBOL_NAME || '';
    
    if (symbolName.includes('Trails open to all vehicles')) {
      stats.TRAIL_TYPE.FULL_SIZE += segLength;
    } else if (symbolName.includes('Trails open to vehicles 50" or less') || 
               symbolName.includes('Wheeled OHV <50"')) {
      stats.TRAIL_TYPE.ATV += segLength;
    } else if (symbolName.includes('Trails open to motorcycles')) {
      stats.TRAIL_TYPE.MOTORCYCLE += segLength;
    } else if (symbolName.includes('Special Designation')) {
      stats.TRAIL_TYPE.SPECIAL += segLength;
    } else {
      stats.TRAIL_TYPE.OTHER += segLength;
    }
  }
  
  // Round all values to 2 decimal places
  stats.TOTAL_MILEAGE = Math.round(stats.TOTAL_MILEAGE * 100) / 100;
  stats.TOTAL_SEASONAL_MILEAGE = Math.round(stats.TOTAL_SEASONAL_MILEAGE * 100) / 100;
  stats.TRAIL_TYPE.FULL_SIZE = Math.round(stats.TRAIL_TYPE.FULL_SIZE * 100) / 100;
  stats.TRAIL_TYPE.ATV = Math.round(stats.TRAIL_TYPE.ATV * 100) / 100;
  stats.TRAIL_TYPE.MOTORCYCLE = Math.round(stats.TRAIL_TYPE.MOTORCYCLE * 100) / 100;
  stats.TRAIL_TYPE.SPECIAL = Math.round(stats.TRAIL_TYPE.SPECIAL * 100) / 100;
  stats.TRAIL_TYPE.OTHER = Math.round(stats.TRAIL_TYPE.OTHER * 100) / 100;
  
  return stats;
}

console.log('Processing forests and ranger districts...');
console.log('='.repeat(80));
console.log('');

let totalForestsProcessed = 0;
let totalDistrictsProcessed = 0;

// Process each forest
for (const forest of forestsWithDistricts) {
  const forestName = forest.FORESTNAME;
  
  // Get all trails for this forest
  const forestTrails = mvumTrails.filter(trail => trail.FORESTNAME === forestName);
  
  // Calculate stats for the forest
  forest.MVUM_TRAILS = calculateTrailStats(forestTrails);
  
  console.log(`FOREST: ${forestName}`);
  console.log(`  Trails: ${forestTrails.length}`);
  console.log(`  Total Mileage: ${forest.MVUM_TRAILS.TOTAL_MILEAGE} miles`);
  console.log(`  Seasonal Mileage: ${forest.MVUM_TRAILS.TOTAL_SEASONAL_MILEAGE} miles`);
  console.log(`  Trail Types:`);
  console.log(`    Full-Size: ${forest.MVUM_TRAILS.TRAIL_TYPE.FULL_SIZE} miles`);
  console.log(`    ATV: ${forest.MVUM_TRAILS.TRAIL_TYPE.ATV} miles`);
  console.log(`    Motorcycle: ${forest.MVUM_TRAILS.TRAIL_TYPE.MOTORCYCLE} miles`);
  console.log(`    Special: ${forest.MVUM_TRAILS.TRAIL_TYPE.SPECIAL} miles`);
  console.log(`    Other: ${forest.MVUM_TRAILS.TRAIL_TYPE.OTHER} miles`);
  
  totalForestsProcessed++;
  
  // Process each ranger district within this forest
  if (forest.RANGER_DISTRICTS && forest.RANGER_DISTRICTS.length > 0) {
    console.log(`  Ranger Districts: ${forest.RANGER_DISTRICTS.length}`);
    
    for (const district of forest.RANGER_DISTRICTS) {
      const districtName = district.DISTRICTNAME;
      
      // Get all trails for this district
      const districtTrails = mvumTrails.filter(
        trail => trail.FORESTNAME === forestName && trail.DISTRICTNAME === districtName
      );
      
      // Calculate stats for the district
      district.MVUM_TRAILS = calculateTrailStats(districtTrails);
      
      console.log(`    District: ${districtName}`);
      console.log(`      Trails: ${districtTrails.length}`);
      console.log(`      Total Mileage: ${district.MVUM_TRAILS.TOTAL_MILEAGE} miles`);
      console.log(`      Seasonal Mileage: ${district.MVUM_TRAILS.TOTAL_SEASONAL_MILEAGE} miles`);
      
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
