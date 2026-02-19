/**
 * Script to fix forest-wide aggregate statistics by recalculating them from ranger district data
 * 
 * For forests with ranger districts, this script:
 * - Sums up all district-level statistics
 * - Replaces forest-level statistics with these calculated sums
 * - Ensures data integrity between district and forest levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('Forest Aggregate Data Correction Script');
console.log('========================================\n');

// Read the forests data
const forestsPath = path.join(__dirname, '../public/data/forests-with-districts.json');
console.log('Reading forests-with-districts.json...');
const forests = JSON.parse(fs.readFileSync(forestsPath, 'utf8'));
console.log(`✓ Loaded ${forests.length} forests\n`);

let forestsUpdated = 0;
let forestsSkipped = 0;
let forestsNoDistricts = 0;

// Helper function to round to 2 decimal places
const round = (num) => Math.round(num * 100) / 100;

// Helper function to aggregate MVUM Roads from districts
function aggregateMvumRoads(districts) {
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

  for (const district of districts) {
    if (!district.MVUM_ROADS) continue;

    stats.NUM_ROADS += district.MVUM_ROADS.NUM_ROADS || 0;
    stats.TOTAL_MILEAGE += district.MVUM_ROADS.TOTAL_MILEAGE || 0;
    stats.TOTAL_SEASONAL_MILEAGE += district.MVUM_ROADS.TOTAL_SEASONAL_MILEAGE || 0;
    stats.ALL_VEHICLES_MILEAGE += district.MVUM_ROADS.ALL_VEHICLES_MILEAGE || 0;
    stats.HIGHWAY_VEHICLES_ONLY_MILEAGE += district.MVUM_ROADS.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0;

    if (district.MVUM_ROADS.MAINTENANCE_LEVELS) {
      stats.MAINTENANCE_LEVELS.ML1 += district.MVUM_ROADS.MAINTENANCE_LEVELS.ML1 || 0;
      stats.MAINTENANCE_LEVELS.ML2 += district.MVUM_ROADS.MAINTENANCE_LEVELS.ML2 || 0;
      stats.MAINTENANCE_LEVELS.ML3 += district.MVUM_ROADS.MAINTENANCE_LEVELS.ML3 || 0;
      stats.MAINTENANCE_LEVELS.ML4 += district.MVUM_ROADS.MAINTENANCE_LEVELS.ML4 || 0;
      stats.MAINTENANCE_LEVELS.ML5 += district.MVUM_ROADS.MAINTENANCE_LEVELS.ML5 || 0;
      stats.MAINTENANCE_LEVELS.NONE += district.MVUM_ROADS.MAINTENANCE_LEVELS.NONE || 0;
    }
  }

  // Round all values
  stats.TOTAL_MILEAGE = round(stats.TOTAL_MILEAGE);
  stats.TOTAL_SEASONAL_MILEAGE = round(stats.TOTAL_SEASONAL_MILEAGE);
  stats.ALL_VEHICLES_MILEAGE = round(stats.ALL_VEHICLES_MILEAGE);
  stats.HIGHWAY_VEHICLES_ONLY_MILEAGE = round(stats.HIGHWAY_VEHICLES_ONLY_MILEAGE);
  stats.MAINTENANCE_LEVELS.ML1 = round(stats.MAINTENANCE_LEVELS.ML1);
  stats.MAINTENANCE_LEVELS.ML2 = round(stats.MAINTENANCE_LEVELS.ML2);
  stats.MAINTENANCE_LEVELS.ML3 = round(stats.MAINTENANCE_LEVELS.ML3);
  stats.MAINTENANCE_LEVELS.ML4 = round(stats.MAINTENANCE_LEVELS.ML4);
  stats.MAINTENANCE_LEVELS.ML5 = round(stats.MAINTENANCE_LEVELS.ML5);
  stats.MAINTENANCE_LEVELS.NONE = round(stats.MAINTENANCE_LEVELS.NONE);

  return stats;
}

// Helper function to aggregate MVUM Trails from districts
function aggregateMvumTrails(districts) {
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

  for (const district of districts) {
    if (!district.MVUM_TRAILS) continue;

    stats.NUM_TRAILS += district.MVUM_TRAILS.NUM_TRAILS || 0;
    stats.TOTAL_MILEAGE += district.MVUM_TRAILS.TOTAL_MILEAGE || 0;
    stats.TOTAL_SEASONAL_MILEAGE += district.MVUM_TRAILS.TOTAL_SEASONAL_MILEAGE || 0;

    if (district.MVUM_TRAILS.TRAIL_TYPE) {
      stats.TRAIL_TYPE.FULL_SIZE += district.MVUM_TRAILS.TRAIL_TYPE.FULL_SIZE || 0;
      stats.TRAIL_TYPE.ATV += district.MVUM_TRAILS.TRAIL_TYPE.ATV || 0;
      stats.TRAIL_TYPE.MOTORCYCLE += district.MVUM_TRAILS.TRAIL_TYPE.MOTORCYCLE || 0;
      stats.TRAIL_TYPE.SPECIAL += district.MVUM_TRAILS.TRAIL_TYPE.SPECIAL || 0;
      stats.TRAIL_TYPE.OTHER += district.MVUM_TRAILS.TRAIL_TYPE.OTHER || 0;
    }
  }

  // Round all values
  stats.TOTAL_MILEAGE = round(stats.TOTAL_MILEAGE);
  stats.TOTAL_SEASONAL_MILEAGE = round(stats.TOTAL_SEASONAL_MILEAGE);
  stats.TRAIL_TYPE.FULL_SIZE = round(stats.TRAIL_TYPE.FULL_SIZE);
  stats.TRAIL_TYPE.ATV = round(stats.TRAIL_TYPE.ATV);
  stats.TRAIL_TYPE.MOTORCYCLE = round(stats.TRAIL_TYPE.MOTORCYCLE);
  stats.TRAIL_TYPE.SPECIAL = round(stats.TRAIL_TYPE.SPECIAL);
  stats.TRAIL_TYPE.OTHER = round(stats.TRAIL_TYPE.OTHER);

  return stats;
}

// Helper function to aggregate Closed Roads from districts
function aggregateClosedRoads(districts) {
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

  for (const district of districts) {
    if (!district.CLOSED_ROADS) continue;

    stats.NUM_ROADS += district.CLOSED_ROADS.NUM_ROADS || 0;
    stats.TOTAL_MILEAGE += district.CLOSED_ROADS.TOTAL_MILEAGE || 0;
    stats.ADMIN_MILEAGE += district.CLOSED_ROADS.ADMIN_MILEAGE || 0;
    stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION += district.CLOSED_ROADS.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0;

    if (district.CLOSED_ROADS.MAINTENANCE_LEVELS) {
      stats.MAINTENANCE_LEVELS.DECOMMISSIONED += district.CLOSED_ROADS.MAINTENANCE_LEVELS.DECOMMISSIONED || 0;
      stats.MAINTENANCE_LEVELS.ML1 += district.CLOSED_ROADS.MAINTENANCE_LEVELS.ML1 || 0;
      stats.MAINTENANCE_LEVELS.ML2 += district.CLOSED_ROADS.MAINTENANCE_LEVELS.ML2 || 0;
      stats.MAINTENANCE_LEVELS.ML3 += district.CLOSED_ROADS.MAINTENANCE_LEVELS.ML3 || 0;
      stats.MAINTENANCE_LEVELS.ML4 += district.CLOSED_ROADS.MAINTENANCE_LEVELS.ML4 || 0;
      stats.MAINTENANCE_LEVELS.ML5 += district.CLOSED_ROADS.MAINTENANCE_LEVELS.ML5 || 0;
      stats.MAINTENANCE_LEVELS.NONE += district.CLOSED_ROADS.MAINTENANCE_LEVELS.NONE || 0;
    }
  }

  // Round all values
  stats.TOTAL_MILEAGE = round(stats.TOTAL_MILEAGE);
  stats.ADMIN_MILEAGE = round(stats.ADMIN_MILEAGE);
  stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION = round(stats.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION);
  stats.MAINTENANCE_LEVELS.DECOMMISSIONED = round(stats.MAINTENANCE_LEVELS.DECOMMISSIONED);
  stats.MAINTENANCE_LEVELS.ML1 = round(stats.MAINTENANCE_LEVELS.ML1);
  stats.MAINTENANCE_LEVELS.ML2 = round(stats.MAINTENANCE_LEVELS.ML2);
  stats.MAINTENANCE_LEVELS.ML3 = round(stats.MAINTENANCE_LEVELS.ML3);
  stats.MAINTENANCE_LEVELS.ML4 = round(stats.MAINTENANCE_LEVELS.ML4);
  stats.MAINTENANCE_LEVELS.ML5 = round(stats.MAINTENANCE_LEVELS.ML5);
  stats.MAINTENANCE_LEVELS.NONE = round(stats.MAINTENANCE_LEVELS.NONE);

  return stats;
}

// Helper function to check if values differ significantly
function valuesDiffer(val1, val2, tolerance = 0.01) {
  return Math.abs(val1 - val2) >= tolerance;
}

// Process each forest
console.log('Processing forests...');
console.log('='.repeat(80));

for (const forest of forests) {
  // Skip forests without ranger districts
  if (!forest.RANGER_DISTRICTS || forest.RANGER_DISTRICTS.length === 0) {
    forestsNoDistricts++;
    continue;
  }

  const forestName = forest.FORESTNAME;
  let forestModified = false;
  const changes = [];

  // Aggregate MVUM Roads
  const aggregatedMvumRoads = aggregateMvumRoads(forest.RANGER_DISTRICTS);
  if (valuesDiffer(forest.MVUM_ROADS?.NUM_ROADS || 0, aggregatedMvumRoads.NUM_ROADS) ||
      valuesDiffer(forest.MVUM_ROADS?.TOTAL_MILEAGE || 0, aggregatedMvumRoads.TOTAL_MILEAGE)) {
    changes.push(`MVUM Roads: ${forest.MVUM_ROADS?.NUM_ROADS || 0} → ${aggregatedMvumRoads.NUM_ROADS} roads, ${(forest.MVUM_ROADS?.TOTAL_MILEAGE || 0).toFixed(2)} → ${aggregatedMvumRoads.TOTAL_MILEAGE} miles`);
    forest.MVUM_ROADS = aggregatedMvumRoads;
    forestModified = true;
  }

  // Aggregate MVUM Trails
  const aggregatedMvumTrails = aggregateMvumTrails(forest.RANGER_DISTRICTS);
  if (valuesDiffer(forest.MVUM_TRAILS?.NUM_TRAILS || 0, aggregatedMvumTrails.NUM_TRAILS) ||
      valuesDiffer(forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0, aggregatedMvumTrails.TOTAL_MILEAGE)) {
    changes.push(`MVUM Trails: ${forest.MVUM_TRAILS?.NUM_TRAILS || 0} → ${aggregatedMvumTrails.NUM_TRAILS} trails, ${(forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0).toFixed(2)} → ${aggregatedMvumTrails.TOTAL_MILEAGE} miles`);
    forest.MVUM_TRAILS = aggregatedMvumTrails;
    forestModified = true;
  }

  // Aggregate Closed Roads
  const aggregatedClosedRoads = aggregateClosedRoads(forest.RANGER_DISTRICTS);
  if (valuesDiffer(forest.CLOSED_ROADS?.NUM_ROADS || 0, aggregatedClosedRoads.NUM_ROADS) ||
      valuesDiffer(forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0, aggregatedClosedRoads.TOTAL_MILEAGE)) {
    changes.push(`Closed Roads: ${forest.CLOSED_ROADS?.NUM_ROADS || 0} → ${aggregatedClosedRoads.NUM_ROADS} roads, ${(forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0).toFixed(2)} → ${aggregatedClosedRoads.TOTAL_MILEAGE} miles`);
    forest.CLOSED_ROADS = aggregatedClosedRoads;
    forestModified = true;
  }

  if (forestModified) {
    console.log(`\n✓ ${forestName}`);
    console.log(`  Districts: ${forest.RANGER_DISTRICTS.length}`);
    changes.forEach(change => console.log(`  ${change}`));
    forestsUpdated++;
  } else {
    forestsSkipped++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('\nSummary:');
console.log(`  Forests updated: ${forestsUpdated}`);
console.log(`  Forests already correct: ${forestsSkipped}`);
console.log(`  Forests without districts (skipped): ${forestsNoDistricts}`);
console.log(`  Total forests: ${forests.length}`);

// Write the corrected data back to the file
console.log('\nWriting corrected data to file...');
fs.writeFileSync(forestsPath, JSON.stringify(forests, null, 2), 'utf8');
console.log('✓ File updated successfully!');

console.log('\n========================================');
console.log('COMPLETE');
console.log('========================================\n');
console.log('Run the tests again to verify the corrections:');
console.log('  npm run test:run\n');
