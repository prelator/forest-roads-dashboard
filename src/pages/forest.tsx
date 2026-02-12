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
  Stack
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useForests } from '../hooks/useForests';
import RouteStatistics from '../components/routeStats';
import GradeCard from '../components/gradeCard';

const ForestPage = () => {
  const { forestId } = useParams<{ forestId: string }>();
  const { data: forests, isLoading, error } = useForests();

  const forest = useMemo(() => {
    if (!forests || !forestId) return null;
    const decodedForestName = decodeURIComponent(forestId);
    return forests.find((f) => f.FORESTNAME === decodedForestName);
  }, [forests, forestId]);

  // Prepare data for the ranger districts grid
  const rows = useMemo(() => {
    if (!forest?.RANGER_DISTRICTS) return [];

    return forest.RANGER_DISTRICTS.map((district) => ({
      id: district.RANGERDISTRICTID,
      districtName: district.DISTRICTNAME,
      districtNameEncoded: encodeURIComponent(district.DISTRICTNAME),
      mvumRoads: district.MVUM_ROADS?.TOTAL_MILEAGE || 0,
      motorizedTrails: district.MVUM_TRAILS?.TOTAL_MILEAGE || 0,
      closedRoads: district.CLOSED_ROADS?.TOTAL_MILEAGE || 0,
      grade: district.SCORECARD?.GRADE || 'F',
    }));
  }, [forest]);

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: 'districtName',
      headerName: 'Ranger District',
      flex: 2,
      minWidth: 180,
      renderCell: (params) => (
        <Link
          component={RouterLink}
          to={`/dashboard/${forestId}/${params.row.districtNameEncoded}`}
          underline="hover"
          color="primary"
          sx={{
            fontWeight: 500,
            whiteSpace: 'normal',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'mvumRoads',
      headerName: 'MVUM Roads (mi)',
      type: 'number',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'motorizedTrails',
      headerName: 'Motorized Trails (mi)',
      type: 'number',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'closedRoads',
      headerName: 'Closed Roads (mi)',
      type: 'number',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'grade',
      headerName: 'Access Grade',
      flex: 0.5,
      minWidth: 82,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const getGradeColor = (grade: string) => {
          switch (grade) {
            case 'A':
              return '#4caf50';
            case 'B':
              return '#ffeb3b';
            case 'C':
              return '#ff9800';
            case 'D':
            case 'F':
              return '#f44336';
            default:
              return '#757575';
          }
        };
        return (
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: getGradeColor(params.value),
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
  ];

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

  if (!forest) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Forest not found</Typography>
        </Box>
      </Container>
    );
  }

  const closedRoadsMileageSuitableForConversion =
    forest.CLOSED_ROADS?.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0;

  return (
    <Container maxWidth={false} sx={{ px: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">{forest.FORESTNAME}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {forest.FORESTNAME}
        </Typography>
        {forest.STATE && (
          <Typography variant="h6" component="h2" color="text.secondary">
            {forest.STATE}
          </Typography>
        )}
      </Box>

      {/* Info Box */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Forest Information
            </Typography>
            <Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}>
              <li>
                <Typography variant="body1">
                  <strong>Forest Acreage:</strong>{' '}
                  {forest.GIS_ACRES.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  acres
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>MVUM Roads:</strong> {forest.MVUM_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                  {(forest.MVUM_ROADS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  miles)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Motorized Trails:</strong> {forest.MVUM_TRAILS?.NUM_TRAILS?.toLocaleString() || 0} trails (
                  {(forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  miles)
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Total Mileage Open to Full Size Vehicles:</strong>{' '}
                  {((forest.MVUM_ROADS?.TOTAL_MILEAGE || 0) + (forest.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0)).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  miles
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Non-Full Size Trails:</strong>{' '}
                  {((forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0) - (forest.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0)).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  miles
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Closed Roads:</strong> {forest.CLOSED_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                  {(forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0).toLocaleString(undefined, {
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

        <GradeCard grade={forest.SCORECARD.GRADE} percentage={forest.SCORECARD.OPEN_ROADS_PERCENTAGE} />
      </Box>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Roads available for trail conversion include all closed roads listed as high clearance roads not maintained for passenger vehicles.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Letter grades are based on the mileage percentage of routes open to full-size vehicles compared to closed roads and are assigned as follows: A = 80-100% open, B = 70-79% open, C = 60-69% open, D = 50-59% open, F = 0-49% open.
        </Typography>
      </Stack>
      {/* Ranger Districts DataGrid */}
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Ranger Districts
          </Typography>
          {rows.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No ranger districts found for this forest
            </Typography>
          ) : (
            <Box sx={{ width: '100%', height: 'auto' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'districtName', sort: 'asc' }],
                  },
                  pagination: {
                    paginationModel: { pageSize: 50, page: 0 },
                  },
                }}
                pageSizeOptions={[50]}
                hideFooter
                disableRowSelectionOnClick
                disableVirtualization={false}
                rowHeight={60}
                sx={{
                  height: '100%',
                  '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    overflow: 'visible',
                    textOverflow: 'clip',
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Route Statistics */}
      <Box sx={{ mt: 4 }}>
        <RouteStatistics
          stats={{
            MVUM_ROADS: forest.MVUM_ROADS,
            MVUM_TRAILS: forest.MVUM_TRAILS,
            CLOSED_ROADS: forest.CLOSED_ROADS,
          }}
        />
      </Box>
    </Container>
  );
};

export default ForestPage;
