import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ForestsData, NationalForest, NationalForestWithoutScorecard } from '../types/forest.types';

const calculateScorecard = (forest: NationalForestWithoutScorecard): NationalForest => {
  const mvumRoadsMileage = forest.MVUM_ROADS?.TOTAL_MILEAGE || 0;
  const fullSizeTrailsMileage = forest.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0;
  const closedRoadsMileage = forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0;

  const totalOpenMileage = mvumRoadsMileage + fullSizeTrailsMileage;
  const totalMileage = mvumRoadsMileage + fullSizeTrailsMileage + closedRoadsMileage;

  const openRoadsPercentage = totalMileage > 0 ? (totalOpenMileage / totalMileage) * 100 : 0;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (openRoadsPercentage >= 80) {
    grade = 'A';
  } else if (openRoadsPercentage >= 70) {
    grade = 'B';
  } else if (openRoadsPercentage >= 60) {
    grade = 'C';
  } else if (openRoadsPercentage >= 50) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  return {
    ...forest,
    SCORECARD: {
      OPEN_ROADS_PERCENTAGE: openRoadsPercentage,
      GRADE: grade,
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
