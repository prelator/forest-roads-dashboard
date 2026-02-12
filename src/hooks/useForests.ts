import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ForestsData, NationalForest, NationalForestWithoutScorecard } from '../types/forest.types';

const calculateGrade = (openRoadsPercentage: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (openRoadsPercentage >= 80) {
    return 'A';
  } else if (openRoadsPercentage >= 70) {
    return 'B';
  } else if (openRoadsPercentage >= 60) {
    return 'C';
  } else if (openRoadsPercentage >= 50) {
    return 'D';
  } else {
    return 'F';
  }
};

const calculateScorecard = (forest: any): NationalForest => {
  const mvumRoadsMileage = forest.MVUM_ROADS?.TOTAL_MILEAGE || 0;
  const fullSizeTrailsMileage = forest.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0;
  const closedRoadsMileage = forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0;

  const totalOpenMileage = mvumRoadsMileage + fullSizeTrailsMileage;
  const totalMileage = mvumRoadsMileage + fullSizeTrailsMileage + closedRoadsMileage;

  const openRoadsPercentage = totalMileage > 0 ? (totalOpenMileage / totalMileage) * 100 : 0;

  // Calculate scorecard for each ranger district
  const rangerDistricts = forest.RANGER_DISTRICTS?.map((district: any) => {
    const districtMvumRoadsMileage = district.MVUM_ROADS?.TOTAL_MILEAGE || 0;
    const districtFullSizeTrailsMileage = district.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0;
    const districtClosedRoadsMileage = district.CLOSED_ROADS?.TOTAL_MILEAGE || 0;

    const districtTotalOpenMileage = districtMvumRoadsMileage + districtFullSizeTrailsMileage;
    const districtTotalMileage = districtMvumRoadsMileage + districtFullSizeTrailsMileage + districtClosedRoadsMileage;

    const districtOpenRoadsPercentage = districtTotalMileage > 0 ? (districtTotalOpenMileage / districtTotalMileage) * 100 : 0;

    return {
      ...district,
      SCORECARD: {
        OPEN_ROADS_PERCENTAGE: districtOpenRoadsPercentage,
        GRADE: calculateGrade(districtOpenRoadsPercentage),
      },
    };
  }) || [];

  return {
    ...forest,
    RANGER_DISTRICTS: rangerDistricts,
    SCORECARD: {
      OPEN_ROADS_PERCENTAGE: openRoadsPercentage,
      GRADE: calculateGrade(openRoadsPercentage),
    },
  };
};

const fetchForests = async (): Promise<ForestsData> => {
  const { data } = await axios.get<NationalForestWithoutScorecard[]>('/data/forests-with-districts.json');
  return data.map(calculateScorecard);
};

export const useForests = () => {
  return useQuery({
    queryKey: ['forests'],
    queryFn: fetchForests,
    staleTime: Infinity, // Data won't become stale
    gcTime: Infinity, // Cache will persist indefinitely (previously cacheTime)
  });
};
