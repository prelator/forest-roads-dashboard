/**
 * Script to add ALL_VEHICLES_MILEAGE and HIGHWAY_VEHICLES_ONLY_MILEAGE
 * to MVUM_ROADS at both forest and ranger district levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the data files
const forestsPath = path.join(__dirname, '../public/data/forests-with-districts.json');
const mvumRoadsPath = path.join(__dirname, '../public/data/mvum-roads.json');

console.log('Reading forests-with-districts.json...');
const forests = JSON.parse(fs.readFileSync(forestsPath, 'utf8'));

console.log('Reading mvum-roads.json...');
const mvumRoads = JSON.parse(fs.readFileSync(mvumRoadsPath, 'utf8'));

console.log(`Processing ${mvumRoads.length} MVUM roads...`);

// Create maps to store mileage by forest and district
const forestMileageMap = new Map();
const districtMileageMap = new Map();

// Process each MVUM road record
mvumRoads.forEach((road) => {
  const forestName = road.FORESTNAME;
  const districtName = road.DISTRICTNAME;
  const segLength = parseFloat(road.SEG_LENGTH) || 0;
  const symbolName = road.MVUM_SYMBOL_NAME || '';

  // Determine if this is all vehicles or highway vehicles only
  const isAllVehicles = symbolName.toLowerCase().includes('all vehicles');
  const isHighwayOnly = symbolName.toLowerCase().includes('highway legal vehicles only');

  // Initialize forest entry if it doesn't exist
  if (!forestMileageMap.has(forestName)) {
    forestMileageMap.set(forestName, {
      ALL_VEHICLES_MILEAGE: 0,
      HIGHWAY_VEHICLES_ONLY_MILEAGE: 0,
    });
  }

  // Initialize district entry if it doesn't exist
  const districtKey = `${forestName}|${districtName}`;
  if (!districtMileageMap.has(districtKey)) {
    districtMileageMap.set(districtKey, {
      ALL_VEHICLES_MILEAGE: 0,
      HIGHWAY_VEHICLES_ONLY_MILEAGE: 0,
    });
  }

  // Add mileage to appropriate categories
  if (isAllVehicles) {
    forestMileageMap.get(forestName).ALL_VEHICLES_MILEAGE += segLength;
    districtMileageMap.get(districtKey).ALL_VEHICLES_MILEAGE += segLength;
  }

  if (isHighwayOnly) {
    forestMileageMap.get(forestName).HIGHWAY_VEHICLES_ONLY_MILEAGE += segLength;
    districtMileageMap.get(districtKey).HIGHWAY_VEHICLES_ONLY_MILEAGE += segLength;
  }
});

console.log(`Processed mileage for ${forestMileageMap.size} forests`);
console.log(`Processed mileage for ${districtMileageMap.size} districts`);

// Update the forests data
let forestsUpdated = 0;
let districtsUpdated = 0;

forests.forEach((forest) => {
  const forestName = forest.FORESTNAME;

  // Initialize MVUM_ROADS if it doesn't exist
  if (!forest.MVUM_ROADS) {
    forest.MVUM_ROADS = {};
  }

  // Add the new properties to the forest level
  const forestMileage = forestMileageMap.get(forestName) || {
    ALL_VEHICLES_MILEAGE: 0,
    HIGHWAY_VEHICLES_ONLY_MILEAGE: 0,
  };

  forest.MVUM_ROADS.ALL_VEHICLES_MILEAGE = Math.round(forestMileage.ALL_VEHICLES_MILEAGE * 1000) / 1000;
  forest.MVUM_ROADS.HIGHWAY_VEHICLES_ONLY_MILEAGE = Math.round(forestMileage.HIGHWAY_VEHICLES_ONLY_MILEAGE * 1000) / 1000;
  forestsUpdated++;

  // Update ranger districts
  if (forest.RANGER_DISTRICTS && Array.isArray(forest.RANGER_DISTRICTS)) {
    forest.RANGER_DISTRICTS.forEach((district) => {
      const districtName = district.DISTRICTNAME;
      const districtKey = `${forestName}|${districtName}`;

      // Initialize MVUM_ROADS if it doesn't exist
      if (!district.MVUM_ROADS) {
        district.MVUM_ROADS = {};
      }

      // Add the new properties to the district level
      const districtMileage = districtMileageMap.get(districtKey) || {
        ALL_VEHICLES_MILEAGE: 0,
        HIGHWAY_VEHICLES_ONLY_MILEAGE: 0,
      };

      district.MVUM_ROADS.ALL_VEHICLES_MILEAGE = Math.round(districtMileage.ALL_VEHICLES_MILEAGE * 1000) / 1000;
      district.MVUM_ROADS.HIGHWAY_VEHICLES_ONLY_MILEAGE = Math.round(districtMileage.HIGHWAY_VEHICLES_ONLY_MILEAGE * 1000) / 1000;
      districtsUpdated++;
    });
  }
});

console.log(`Updated ${forestsUpdated} forests`);
console.log(`Updated ${districtsUpdated} ranger districts`);

// Write the updated data back to the file
console.log('Writing updated forests-with-districts.json...');
fs.writeFileSync(forestsPath, JSON.stringify(forests, null, 2));

console.log('✓ Successfully added ALL_VEHICLES_MILEAGE and HIGHWAY_VEHICLES_ONLY_MILEAGE properties');
