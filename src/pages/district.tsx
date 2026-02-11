import { useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Link,
  Typography,
  Stack,
} from '@mui/material';
import { useForests } from '../hooks/useForests';
import RouteStatistics from '../components/routeStats';

const DistrictPage = () => {
  const { forestId, districtId } = useParams<{ forestId: string; districtId: string }>();
  const { data: forests, isLoading, error } = useForests();

  const { forest, district } = useMemo(() => {
    if (!forests || !forestId || !districtId) return { forest: null, district: null };
    
    const decodedForestName = decodeURIComponent(forestId);
    const decodedDistrictName = decodeURIComponent(districtId);
    
    const foundForest = forests.find((f) => f.FORESTNAME === decodedForestName);
    if (!foundForest) return { forest: null, district: null };
    
    const foundDistrict = foundForest.RANGER_DISTRICTS?.find(
      (d) => d.DISTRICTNAME === decodedDistrictName
    );
    
    return { forest: foundForest, district: foundDistrict };
  }, [forests, forestId, districtId]);

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error">Error loading forests: {error.message}</Typography>
        </Box>
      </Container>
    );
  }

  if (!forest || !district) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Ranger district not found</Typography>
        </Box>
      </Container>
    );
  }

  const closedRoadsMileageSuitableForConversion =
    district.CLOSED_ROADS?.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0;

  return (
    <Container maxWidth={false} sx={{ px: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to={`/dashboard/${forestId}`} underline="hover" color="inherit">
            {forest.FORESTNAME}
          </Link>
          <Typography color="text.primary">{district.DISTRICTNAME}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {district.DISTRICTNAME}
        </Typography>
        <Typography variant="h6" component="h2" color="text.secondary">
          {forest.FORESTNAME}
        </Typography>
      </Box>

      {/* Info Box */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Ranger District Information
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}>
            <li>
              <Typography variant="body1">
                <strong>MVUM Roads:</strong> {district.MVUM_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                {(district.MVUM_ROADS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                miles)
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Motorized Trails:</strong> {district.MVUM_TRAILS?.NUM_TRAILS?.toLocaleString() || 0} trails (
                {(district.MVUM_TRAILS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                miles)
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Total Mileage Open to Full Size Vehicles:</strong>{' '}
                {((district.MVUM_ROADS?.TOTAL_MILEAGE || 0) + (district.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0)).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                miles
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Closed Roads:</strong> {district.CLOSED_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                {(district.CLOSED_ROADS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                miles)
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Closed High Clearance Roads Available for Trail Conversion:</strong>{' '}
                {closedRoadsMileageSuitableForConversion.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                miles
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Roads available for trail conversion include all closed roads listed as high clearance roads not maintained for passenger vehicles.
        </Typography>
      </Stack>

      {/* Route Statistics */}
      <Box sx={{ mt: 4 }}>
        <RouteStatistics
          stats={{
            MVUM_ROADS: district.MVUM_ROADS,
            MVUM_TRAILS: district.MVUM_TRAILS,
            CLOSED_ROADS: district.CLOSED_ROADS,
          }}
        />
      </Box>
    </Container>
  );
};

export default DistrictPage;
