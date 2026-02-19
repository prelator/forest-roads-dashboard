import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { NationalForest } from '../src/types/forest.types';

// Load the forests data
const forestsData: NationalForest[] = JSON.parse(
  readFileSync(join(__dirname, '../public/data/forests-with-districts.json'), 'utf-8')
);

// Filter forests that have ranger districts for aggregation tests
const forestsWithDistricts = forestsData.filter(forest => forest.RANGER_DISTRICTS && forest.RANGER_DISTRICTS.length > 0);

// Forests without districts (for separate validation)
const forestsWithoutDistricts = forestsData.filter(forest => !forest.RANGER_DISTRICTS || forest.RANGER_DISTRICTS.length === 0);

// Helper function to check if aggregation is valid
function checkAggregation(forest: NationalForest, tolerance = { count: 0, mileage: 0.1 }): {
  mvumRoadsValid: boolean;
  mvumTrailsValid: boolean;
  closedRoadsValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check MVUM Roads
  const mvumRoadsCount = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.MVUM_ROADS?.NUM_ROADS || 0), 0);
  const mvumRoadsMileage = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.MVUM_ROADS?.TOTAL_MILEAGE || 0), 0);
  const mvumRoadsValid = Math.abs(mvumRoadsCount - (forest.MVUM_ROADS?.NUM_ROADS || 0)) <= tolerance.count && 
    Math.abs(mvumRoadsMileage - (forest.MVUM_ROADS?.TOTAL_MILEAGE || 0)) < tolerance.mileage;
  
  if (!mvumRoadsValid) {
    errors.push(`MVUM Roads: District count=${mvumRoadsCount}, Forest count=${forest.MVUM_ROADS?.NUM_ROADS || 0}; District miles=${mvumRoadsMileage.toFixed(2)}, Forest miles=${(forest.MVUM_ROADS?.TOTAL_MILEAGE || 0).toFixed(2)}`);
  }
  
  // Check MVUM Trails
  const mvumTrailsCount = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.MVUM_TRAILS?.NUM_TRAILS || 0), 0);
  const mvumTrailsMileage = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.MVUM_TRAILS?.TOTAL_MILEAGE || 0), 0);
  const mvumTrailsValid = Math.abs(mvumTrailsCount - (forest.MVUM_TRAILS?.NUM_TRAILS || 0)) <= tolerance.count && 
    Math.abs(mvumTrailsMileage - (forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0)) < tolerance.mileage;
  
  if (!mvumTrailsValid) {
    errors.push(`MVUM Trails: District count=${mvumTrailsCount}, Forest count=${forest.MVUM_TRAILS?.NUM_TRAILS || 0}; District miles=${mvumTrailsMileage.toFixed(2)}, Forest miles=${(forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0).toFixed(2)}`);
  }
  
  // Check Closed Roads
  const closedRoadsCount = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.CLOSED_ROADS?.NUM_ROADS || 0), 0);
  const closedRoadsMileage = forest.RANGER_DISTRICTS.reduce((sum, d) => sum + (d.CLOSED_ROADS?.TOTAL_MILEAGE || 0), 0);
  const closedRoadsValid = Math.abs(closedRoadsCount - (forest.CLOSED_ROADS?.NUM_ROADS || 0)) <= tolerance.count && 
    Math.abs(closedRoadsMileage - (forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0)) < tolerance.mileage;
  
  if (!closedRoadsValid) {
    errors.push(`Closed Roads: District count=${closedRoadsCount}, Forest count=${forest.CLOSED_ROADS?.NUM_ROADS || 0}; District miles=${closedRoadsMileage.toFixed(2)}, Forest miles=${(forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0).toFixed(2)}`);
  }
  
  return { mvumRoadsValid, mvumTrailsValid, closedRoadsValid, errors };
}

describe('Forest Data Integrity Tests', () => {
  describe('Summary Report', () => {
    it('should report overall data integrity status', () => {
      const strictResults = forestsWithDistricts.map(forest => ({
        name: forest.FORESTNAME,
        ...checkAggregation(forest, { count: 0, mileage: 0.1 })
      }));
      
      const lenientResults = forestsWithDistricts.map(forest => ({
        name: forest.FORESTNAME,
        ...checkAggregation(forest, { count: 10, mileage: 5 })
      }));
      
      const strictValid = strictResults.filter(r => r.mvumRoadsValid && r.mvumTrailsValid && r.closedRoadsValid);
      const lenientValid = lenientResults.filter(r => r.mvumRoadsValid && r.mvumTrailsValid && r.closedRoadsValid);
      const strictInvalid = strictResults.filter(r => !r.mvumRoadsValid || !r.mvumTrailsValid || !r.closedRoadsValid);
      const majorIssues = lenientResults.filter(r => !r.mvumRoadsValid || !r.mvumTrailsValid || !r.closedRoadsValid);
      
      console.log('\n========================================');
      console.log('DATA INTEGRITY SUMMARY');
      console.log('========================================');
      console.log(`Total forests analyzed: ${forestsWithDistricts.length}`);
      console.log(`Forests without ranger districts: ${forestsWithoutDistricts.length}`);
      console.log('');
      console.log(`✓ Perfect aggregation (exact match): ${strictValid.length} (${((strictValid.length / forestsWithDistricts.length) * 100).toFixed(1)}%)`);
      console.log(`✓ Minor discrepancies (acceptable): ${lenientValid.length - strictValid.length} (${(((lenientValid.length - strictValid.length) / forestsWithDistricts.length) * 100).toFixed(1)}%)`);
      console.log(`✗ Major data issues: ${majorIssues.length} (${((majorIssues.length / forestsWithDistricts.length) * 100).toFixed(1)}%)`);
      console.log('');
      console.log(`Overall passing rate: ${lenientValid.length} / ${forestsWithDistricts.length} (${((lenientValid.length / forestsWithDistricts.length) * 100).toFixed(1)}%)`);
      console.log('========================================\n');
      
      if (majorIssues.length > 0) {
        console.log('FORESTS WITH MAJOR DATA ISSUES:');
        majorIssues.forEach(forest => {
          console.log(`\n${forest.name}:`);
          forest.errors.forEach(error => console.log(`  - ${error}`));
        });
        console.log('\n========================================\n');
      }
      
      // This test should pass - it's just for reporting
      expect(strictValid.length).toBeGreaterThan(0);
      expect(lenientValid.length).toBeGreaterThanOrEqual(strictValid.length);
    });
  });

  describe('MVUM Roads Aggregation', () => {
    forestsWithDistricts.forEach((forest) => {
      describe(`${forest.FORESTNAME}`, () => {
        it('should have district NUM_ROADS sum equal to forest NUM_ROADS', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_ROADS?.NUM_ROADS || 0),
            0
          );
          expect(districtSum).toBe(forest.MVUM_ROADS?.NUM_ROADS || 0);
        });

        it('should have district TOTAL_MILEAGE sum approximately equal to forest TOTAL_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_ROADS?.TOTAL_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_ROADS?.TOTAL_MILEAGE || 0;
          
          // Allow for small rounding differences (within 0.1 miles)
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district TOTAL_SEASONAL_MILEAGE sum approximately equal to forest TOTAL_SEASONAL_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_ROADS?.TOTAL_SEASONAL_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_ROADS?.TOTAL_SEASONAL_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district ALL_VEHICLES_MILEAGE sum approximately equal to forest ALL_VEHICLES_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_ROADS?.ALL_VEHICLES_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_ROADS?.ALL_VEHICLES_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district HIGHWAY_VEHICLES_ONLY_MILEAGE sum approximately equal to forest HIGHWAY_VEHICLES_ONLY_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_ROADS?.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_ROADS?.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        describe('Maintenance Levels', () => {
          const maintenanceLevels = ['ML1', 'ML2', 'ML3', 'ML4', 'ML5', 'NONE'] as const;

          maintenanceLevels.forEach((level) => {
            it(`should have district ${level} mileage sum approximately equal to forest ${level} mileage`, () => {
              const districtSum = forest.RANGER_DISTRICTS.reduce(
                (sum, district) => sum + (district.MVUM_ROADS?.MAINTENANCE_LEVELS?.[level] || 0),
                0
              );
              const forestTotal = forest.MVUM_ROADS?.MAINTENANCE_LEVELS?.[level] || 0;
              
              expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
            });
          });
        });
      });
    });
  });

  describe('MVUM Trails Aggregation', () => {
    forestsWithDistricts.forEach((forest) => {
      describe(`${forest.FORESTNAME}`, () => {
        it('should have district NUM_TRAILS sum equal to forest NUM_TRAILS', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_TRAILS?.NUM_TRAILS || 0),
            0
          );
          expect(districtSum).toBe(forest.MVUM_TRAILS?.NUM_TRAILS || 0);
        });

        it('should have district TOTAL_MILEAGE sum approximately equal to forest TOTAL_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_TRAILS?.TOTAL_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district TOTAL_SEASONAL_MILEAGE sum approximately equal to forest TOTAL_SEASONAL_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.MVUM_TRAILS?.TOTAL_SEASONAL_MILEAGE || 0),
            0
          );
          const forestTotal = forest.MVUM_TRAILS?.TOTAL_SEASONAL_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        describe('Trail Types', () => {
          const trailTypes = ['FULL_SIZE', 'ATV', 'MOTORCYCLE', 'SPECIAL', 'OTHER'] as const;

          trailTypes.forEach((type) => {
            it(`should have district ${type} mileage sum approximately equal to forest ${type} mileage`, () => {
              const districtSum = forest.RANGER_DISTRICTS.reduce(
                (sum, district) => sum + (district.MVUM_TRAILS?.TRAIL_TYPE?.[type] || 0),
                0
              );
              const forestTotal = forest.MVUM_TRAILS?.TRAIL_TYPE?.[type] || 0;
              
              expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
            });
          });
        });
      });
    });
  });

  describe('Closed Roads Aggregation', () => {
    forestsWithDistricts.forEach((forest) => {
      describe(`${forest.FORESTNAME}`, () => {
        it('should have district NUM_ROADS sum equal to forest NUM_ROADS', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.CLOSED_ROADS?.NUM_ROADS || 0),
            0
          );
          expect(districtSum).toBe(forest.CLOSED_ROADS?.NUM_ROADS || 0);
        });

        it('should have district TOTAL_MILEAGE sum approximately equal to forest TOTAL_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.CLOSED_ROADS?.TOTAL_MILEAGE || 0),
            0
          );
          const forestTotal = forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district ADMIN_MILEAGE sum approximately equal to forest ADMIN_MILEAGE', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.CLOSED_ROADS?.ADMIN_MILEAGE || 0),
            0
          );
          const forestTotal = forest.CLOSED_ROADS?.ADMIN_MILEAGE || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        it('should have district MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION sum approximately equal to forest MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION', () => {
          const districtSum = forest.RANGER_DISTRICTS.reduce(
            (sum, district) => sum + (district.CLOSED_ROADS?.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0),
            0
          );
          const forestTotal = forest.CLOSED_ROADS?.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0;
          
          expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
        });

        describe('Maintenance Levels', () => {
          const maintenanceLevels = ['DECOMMISSIONED', 'ML1', 'ML2', 'ML3', 'ML4', 'ML5', 'NONE'] as const;

          maintenanceLevels.forEach((level) => {
            it(`should have district ${level} mileage sum approximately equal to forest ${level} mileage`, () => {
              const districtSum = forest.RANGER_DISTRICTS.reduce(
                (sum, district) => sum + (district.CLOSED_ROADS?.MAINTENANCE_LEVELS?.[level] || 0),
                0
              );
              const forestTotal = forest.CLOSED_ROADS?.MAINTENANCE_LEVELS?.[level] || 0;
              
              expect(Math.abs(districtSum - forestTotal)).toBeLessThan(0.1);
            });
          });
        });
      });
    });
  });

  describe('Data Consistency', () => {
    describe('Forests with Ranger Districts', () => {
      forestsWithDistricts.forEach((forest) => {
        describe(`${forest.FORESTNAME}`, () => {
          it('should have all required top-level properties', () => {
            expect(forest).toHaveProperty('OBJECTID');
            expect(forest).toHaveProperty('FORESTNAME');
            expect(forest).toHaveProperty('RANGER_DISTRICTS');
            expect(forest).toHaveProperty('MVUM_ROADS');
            expect(forest).toHaveProperty('MVUM_TRAILS');
            expect(forest).toHaveProperty('CLOSED_ROADS');
          });

          it('should have at least one ranger district', () => {
            expect(forest.RANGER_DISTRICTS.length).toBeGreaterThan(0);
          });

          forest.RANGER_DISTRICTS.forEach((district) => {
            it(`${district.DISTRICTNAME} should have all required properties`, () => {
              expect(district).toHaveProperty('DISTRICTNAME');
              expect(district).toHaveProperty('MVUM_ROADS');
              expect(district).toHaveProperty('MVUM_TRAILS');
              expect(district).toHaveProperty('CLOSED_ROADS');
            });
          });
        });
      });
    });

    describe('Forests without Ranger Districts', () => {
      it(`should identify ${forestsWithoutDistricts.length} forests without districts`, () => {
        expect(forestsWithoutDistricts.length).toBeGreaterThan(0);
        console.log('Forests without ranger districts:', forestsWithoutDistricts.map(f => f.FORESTNAME));
      });

      forestsWithoutDistricts.forEach((forest) => {
        it(`${forest.FORESTNAME} should have all required top-level properties`, () => {
          expect(forest).toHaveProperty('OBJECTID');
          expect(forest).toHaveProperty('FORESTNAME');
          expect(forest).toHaveProperty('RANGER_DISTRICTS');
          expect(forest).toHaveProperty('MVUM_ROADS');
          expect(forest).toHaveProperty('MVUM_TRAILS');
          expect(forest).toHaveProperty('CLOSED_ROADS');
        });
      });
    });
  });
});
