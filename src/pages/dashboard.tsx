import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { useForests } from '../hooks/useForests';

const DashboardPage = () => {
  const { data: forests, isLoading, error } = useForests();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate aggregate statistics
  const aggregateStats = useMemo(() => {
    if (!forests) return { 
      totalMvumRoads: 0, 
      totalMvumRoadsMileage: 0,
      totalMotorizedTrails: 0, 
      totalMotorizedTrailsMileage: 0,
      totalClosedRoads: 0,
      totalClosedRoadsMileage: 0
    };

    return forests.reduce(
      (acc, forest) => ({
        totalMvumRoads: acc.totalMvumRoads + (forest.MVUM_ROADS?.NUM_ROADS || 0),
        totalMvumRoadsMileage: acc.totalMvumRoadsMileage + (forest.MVUM_ROADS?.TOTAL_MILEAGE || 0),
        totalMotorizedTrails: acc.totalMotorizedTrails + (forest.MVUM_TRAILS?.NUM_TRAILS || 0),
        totalMotorizedTrailsMileage: acc.totalMotorizedTrailsMileage + (forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0),
        totalClosedRoads: acc.totalClosedRoads + (forest.CLOSED_ROADS?.NUM_ROADS || 0),
        totalClosedRoadsMileage: acc.totalClosedRoadsMileage + (forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0),
      }),
      { 
        totalMvumRoads: 0, 
        totalMvumRoadsMileage: 0,
        totalMotorizedTrails: 0, 
        totalMotorizedTrailsMileage: 0,
        totalClosedRoads: 0,
        totalClosedRoadsMileage: 0
      }
    );
  }, [forests]);

  // Prepare data for the grid
  const rows = useMemo(() => {
    if (!forests) return [];

    return forests.map((forest) => ({
      id: forest.OBJECTID,
      forestName: forest.FORESTNAME,
      forestNameEncoded: encodeURIComponent(forest.FORESTNAME),
      state: forest.STATE || '',
      mvumRoads: forest.MVUM_ROADS?.TOTAL_MILEAGE || 0,
      motorizedTrails: forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0,
      closedRoads: forest.CLOSED_ROADS?.TOTAL_MILEAGE || 0,
      grade: forest.SCORECARD?.GRADE || 'F',
      totalMileage: (forest.MVUM_ROADS?.TOTAL_MILEAGE || 0) + (forest.MVUM_TRAILS?.TOTAL_MILEAGE || 0),
    }));
  }, [forests]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    
    const searchLower = searchTerm.toLowerCase();
    return rows.filter((row) => 
      row.forestName.toLowerCase().includes(searchLower)
    );
  }, [rows, searchTerm]);

  // Define columns for the data grid
  const columns: GridColDef[] = [
    {
      field: 'forestName',
      headerName: 'Forest Name',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Link
          component={RouterLink}
          to={`/dashboard/${params.row.forestNameEncoded}`}
          underline="hover"
          color="primary"
          sx={{ 
            fontWeight: 500,
            whiteSpace: 'normal',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'state',
      headerName: 'States',
      flex: 1,
      minWidth: 120,
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
    {
      field: 'totalMileage',
      headerName: 'Public Motorized Mileage',
      flex: 1.5,
      minWidth: isSmallScreen ? 110 : 220,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ minWidth: isSmallScreen ? '50px' : '60px', textAlign: 'right', fontWeight: 500 }}>
            {params.row.totalMileage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </Typography>
          {!isSmallScreen && (
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', paddingTop: '22px' }}>
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
                xAxis={[{ disableTicks: true, disableLine: true, max: 8000 }]}
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
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          National Forest Roads Dashboard
        </Typography>
        <Typography variant="h6" component="h2" color="text.secondary">
          Overview of motorized routes across all U.S. National Forests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Letter grades are based on the mileage percentage of routes open to full-size vehicles compared to closed roads and are assigned as follows: A = 80-100% open, B = 70-79% open, C = 60-69% open, D = 50-59% open, F = 0-49% open.
        </Typography>
      </Stack>

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
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                {aggregateStats.totalMvumRoadsMileage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} miles
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
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                {aggregateStats.totalMotorizedTrailsMileage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} miles
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
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                {aggregateStats.totalClosedRoadsMileage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} miles
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Roads currently closed or restricted to admin use
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              All National Forests
            </Typography>
            <TextField
              placeholder="Search forests..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
            />
          </Box>
          <Box sx={{ width: '100%', height: 700, overflow: 'auto' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'forestName', sort: 'asc' }],
                },
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 },
                },
              }}
              pageSizeOptions={[50, 100]}
              disableRowSelectionOnClick
              disableVirtualization={false}
              rowHeight={60}
              columnHeaderHeight={80}
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;
