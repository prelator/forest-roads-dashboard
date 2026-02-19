# Forest Data Integrity Tests

This test suite validates that the ranger district data properly aggregates to match forest-level totals in the `forests-with-districts.json` file.

## Test Structure

### Summary Report
Provides an overview of data quality across all forests with ranger districts:
- **Perfect aggregation**: District numbers exactly match forest totals
- **Minor discrepancies**: Small differences (≤10 roads, ≤5 miles) likely due to rounding
- **Major data issues**: Significant discrepancies that indicate data problems

### Detailed Tests

For each forest with ranger districts, the tests validate:

#### MVUM Roads
- Number of roads
- Total mileage
- Seasonal mileage
- Vehicle-specific mileage (all vehicles, highway vehicles only)
- Maintenance level breakdown (ML1-ML5, NONE)

#### MVUM Trails
- Number of trails
- Total mileage
- Seasonal mileage
- Trail type breakdown (FULL_SIZE, ATV, MOTORCYCLE, SPECIAL, OTHER)

#### Closed Roads
- Number of roads
- Total mileage
- Admin mileage
- Mileage suitable for trail conversion
- Maintenance level breakdown (DECOMMISSIONED, ML1-ML5, NONE)

## Running the Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

## Current Status

As of the latest run:
- **107 forests** have ranger districts (analyzed)
- **5 forests** have no ranger districts (excluded from aggregation tests)
- **29 forests (27.1%)** have perfect data aggregation
- **28 forests (26.2%)** have minor acceptable discrepancies
- **50 forests (46.7%)** have major data issues requiring investigation

**Overall: 57 of 107 forests (53.3%) pass data integrity checks**

## Understanding Test Failures

Test failures indicate where district-level data doesn't properly sum to forest-level totals. This can happen due to:

1. **Rounding errors** - Minor floating-point precision issues
2. **Missing district data** - Some ranger districts may not have all data populated
3. **Data source issues** - Underlying GIS data may have inconsistencies
4. **Administrative changes** - Data may have been collected at different times

## Forests with Major Data Issues

See the console output from running tests for the complete list of forests with significant discrepancies and details about what doesn't match.
