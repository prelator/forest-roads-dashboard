import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { useForests } from '../hooks/useForests';

const DashboardPage = () => {
  const { data: forests, isLoading, error } = useForests();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate aggregate statistics
  const aggregateStats = useMemo(() => {
    if (!forests) return { totalMvumRoads: 0, totalMotorizedTrails: 0, totalClosedRoads: 0 };

    return forests.reduce(
      (acc, forest) => ({
        totalMvumRoads: acc.totalMvumRoads + (forest.MVUM_ROADS?.NUM_ROADS || 0),
        totalMotorizedTrails: acc.totalMotorizedTrails + (forest.MVUM_TRAILS?.NUM_TRAILS || 0),
        totalClosedRoads: acc.totalClosedRoads + (forest.CLOSED_ROADS?.NUM_ROADS || 0),
      }),
      { totalMvumRoads: 0, totalMotorizedTrails: 0, totalClosedRoads: 0 }
    );
  }, [forests]);

  // Prepare data for the grid
  const rows = useMemo(() => {
    if (!forests) return [];

    return forests.map((forest) => ({
      id: forest.OBJECTID,
      forestName: forest.FORESTNAME,
      forestNameEncoded: encodeURIComponent(forest.FORESTNAME),
      mvumRoads: forest.MVUM_ROADS?.TOTAL_MILEAGE || 0,
      motorizedTrails: forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0,
      closedRoads: forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0,
      totalMileage: (forest.MVUM_ROADS?.TOTAL_MILEAGE || 0) + (forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0),
    }));
  }, [forests]);

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: 'forestName',
      headerName: 'Forest Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component={RouterLink}
          to={`/dashboard/${params.row.forestNameEncoded}`}
          underline="hover"
          color="primary"
          sx={{ fontWeight: 500 }}
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
      valueFormatter: (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'motorizedTrails',
      headerName: 'Motorized Trails (mi)',
      type: 'number',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'closedRoads',
      headerName: 'Closed Roads (mi)',
      type: 'number',
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
    {
      field: 'totalMileage',
      headerName: 'Total Public Motorized Mileage',
      flex: 1.5,
      minWidth: isSmallScreen ? 80 : 220,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ minWidth: isSmallScreen ? '50px' : '60px', textAlign: 'right', fontWeight: 500 }}>
            {params.row.totalMileage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </Typography>
          {!isSmallScreen && (
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <BarChart
                series={[
                  {
                    data: [params.row.totalMileage],
                    color: '#1976d2',
                  },
                ]}
                layout="horizontal"
                height={60}
                yAxis={[{ scaleType: 'band', data: [''], disableTicks: true, disableLine: true }]}
                xAxis={[{ disableTicks: true, disableLine: true }]}
                margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
                sx={{
                  '& .MuiChartsAxis-tickLabel': {
                    display: 'none',
                  },
                  '& .MuiChartsAxis-label': {
                    display: 'none',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      ),
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

  return (
    <Container maxWidth={false} sx={{ px: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          National Forest Roads Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of motorized routes across all U.S. National Forests
        </Typography>
      </Box>

      {/* Aggregate Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total MVUM Roads
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {aggregateStats.totalMvumRoads.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Open forest roads across all forests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total Motorized Trails
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {aggregateStats.totalMotorizedTrails.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Designated motorized trails
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total Closed Roads
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {aggregateStats.totalClosedRoads.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Roads currently closed or restricted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            All National Forests
          </Typography>
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'forestName', sort: 'asc' }],
                },
              }}
              autoHeight
              hideFooter
              disableRowSelectionOnClick
              rowHeight={60}
              sx={{
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;
