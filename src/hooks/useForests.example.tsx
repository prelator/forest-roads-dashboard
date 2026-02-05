/**
 * Example usage of the useForests hook
 * 
 * This hook fetches forest data once when first called and caches it.
 * Subsequent calls across any component will use the cached data.
 */

import { useForests } from '../hooks/useForests';

export const ExampleComponent = () => {
  const { data: forests, isLoading, error } = useForests();

  if (isLoading) {
    return <div>Loading forests...</div>;
  }

  if (error) {
    return <div>Error loading forests: {error.message}</div>;
  }

  return (
    <div>
      <h1>National Forests</h1>
      <ul>
        {forests?.map((forest) => (
          <li key={forest.OBJECTID}>
            {forest.FORESTNAME} - {forest.RANGER_DISTRICTS.length} districts
          </li>
        ))}
      </ul>
    </div>
  );
};
