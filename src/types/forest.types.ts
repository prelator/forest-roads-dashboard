/**
 * TypeScript type definitions for National Forest data
 */

export interface MaintenanceLevels {
  ML1: number;
  ML2: number;
  ML3: number;
  ML4: number;
  ML5: number;
  NONE: number;
}

export interface ClosedRoadMaintenanceLevels extends MaintenanceLevels {
  DECOMMISSIONED: number;
}

export interface MvumRoads {
  NUM_ROADS: number;
  TOTAL_MILEAGE: number;
  TOTAL_SEASONAL_MILEAGE: number;
  MAINTENANCE_LEVELS: MaintenanceLevels;
}

export interface TrailType {
  FULL_SIZE: number;
  ATV: number;
  MOTORCYCLE: number;
  SPECIAL: number;
  OTHER: number;
}

export interface MvumTrails {
  NUM_TRAILS: number;
  TOTAL_MILEAGE: number;
  TOTAL_SEASONAL_MILEAGE: number;
  TRAIL_TYPE: TrailType;
}

export interface ClosedRoads {
  NUM_ROADS: number;
  TOTAL_MILEAGE: number;
  ADMIN_MILEAGE: number;
  MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION: number;
  MAINTENANCE_LEVELS: ClosedRoadMaintenanceLevels;
}

export interface RangerDistrict {
  RANGERDISTRICTID: number;
  REGION: number;
  FORESTNUMBER: number;
  FORESTNAME: string;
  DISTRICTNUMBER: number;
  DISTRICTNAME: string;
  DISTRICTORGCODE: number;
  OBJECTID: number;
  MVUM_ROADS: MvumRoads;
  MVUM_TRAILS: MvumTrails;
  CLOSED_ROADS: ClosedRoads;
}

export interface NationalForest {
  OBJECTID: number;
  ADMINFORESTID: number;
  REGION: number;
  FORESTNUMBER: number;
  FORESTORGCODE: number;
  FORESTNAME: string;
  GIS_ACRES: number;
  STATE?: string;
  RANGER_DISTRICTS: RangerDistrict[];
  MVUM_ROADS: MvumRoads;
  MVUM_TRAILS: MvumTrails;
  CLOSED_ROADS: ClosedRoads;
}

export type ForestsData = NationalForest[];

export interface RouteStats {
  MVUM_ROADS: MvumRoads;
  MVUM_TRAILS: MvumTrails;
  CLOSED_ROADS: ClosedRoads;
}
