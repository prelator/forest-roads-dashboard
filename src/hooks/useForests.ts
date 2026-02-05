import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ForestsData } from '../types/forest.types';

const fetchForests = async (): Promise<ForestsData> => {
  const { data } = await axios.get<ForestsData>('/data/forests-with-districts.json');
  return data;
};

export const useForests = () => {
  return useQuery({
    queryKey: ['forests'],
    queryFn: fetchForests,
    staleTime: Infinity, // Data won't become stale
    gcTime: Infinity, // Cache will persist indefinitely (previously cacheTime)
  });
};
