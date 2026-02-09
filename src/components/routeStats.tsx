import { Box, Card, CardContent, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { PieChart } from '@mui/x-charts/PieChart';
import type { RouteStats } from '../types/forest.types';

interface RouteStatisticsProps {
  stats: RouteStats;
}

const CARD_MIN_HEIGHT = 650;

// Shared styled table component
const StatsTable = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="table"
    sx={{
      width: '100%',
      maxWidth: 300,
      mb: 2,
      '& td, & th': { py: 0.5, px: 1 },
      '& th': { textAlign: 'left', fontWeight: 'bold' },
      '& th:last-child': { textAlign: 'right' },
      '& td': { textAlign: 'left' },
      '& td:last-child': { textAlign: 'right' },
    }}
  >
    {children}
  </Box>
);

// Shared styled pie chart component
const StyledPieChart = ({ data, isMobile }: { data: any[]; isMobile: boolean }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    mt: 'auto', 
    px: 0,
    '& .MuiChartsLegend-root': isMobile ? {
      margin: '30px !important',
      justifyContent: 'center',
    } : {},
  }}>
    <PieChart
      series={[
        {
          data,
          highlightScope: { fade: 'global', highlight: 'item' },
        },
      ]}
      width={300}
      height={200}
      slotProps={{
        legend: isMobile ? {
          direction: 'row',
          position: { vertical: 'bottom', horizontal: 'middle' },
          padding: 0,
          itemGap: 10,
        } as any : undefined,
      }}
    />
  </Box>
);

// Color schemes
const maintenanceLevelColorMap: Record<string, string> = {
  'ML1': '#2196F3', // Blue
  'ML2': '#4CAF50', // Green
  'ML3': '#FFC107', // Amber
  'ML4': '#FF9800', // Orange
  'ML5': '#F44336', // Red
  'None': '#9E9E9E', // Gray
  'Decommissioned': '#757575', // Dark Gray
};

const trailTypeColorMap: Record<string, string> = {
  'Full Size': '#9C27B0', // Purple
  'ATV': '#E91E63', // Pink
  'Motorcycle': '#00BCD4', // Cyan
  'UTV or other special designation': '#3F51B5', // Indigo
  'Other': '#795548', // Brown
};

// Helper to format mileage
const formatMileage = (mileage: number) =>
  mileage.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// Helper to create pie chart data with consistent colors
const createPieData = (items: Array<{ level?: string; type?: string; mileage: number }>, colorMap: Record<string, string>) => {
  const total = items.reduce((sum, item) => sum + item.mileage, 0);
  return items.map((item, index) => {
    const percentage = total > 0 ? (item.mileage / total * 100).toFixed(1) : 0;
    const label = item.level || item.type || 'Unknown';
    return {
      id: index,
      value: item.mileage,
      label: `${label} (${percentage}%)`,
      color: colorMap[label] || '#9E9E9E',
    };
  });
};

const RouteStatistics = ({ stats }: RouteStatisticsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate maintenance level data for MVUM roads
  const mvumRoadMaintenanceLevels = [
    { level: 'ML1', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.ML1 || 0 },
    { level: 'ML2', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.ML2 || 0 },
    { level: 'ML3', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.ML3 || 0 },
    { level: 'ML4', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.ML4 || 0 },
    { level: 'ML5', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.ML5 || 0 },
    { level: 'None', mileage: stats.MVUM_ROADS?.MAINTENANCE_LEVELS?.NONE || 0 },
  ];

  const mvumRoadPieData = createPieData(
    mvumRoadMaintenanceLevels.filter((item) => item.mileage > 0),
    maintenanceLevelColorMap
  );

  // Calculate trail type data
  const trailTypeData = [
    { type: 'Full Size', mileage: stats.MVUM_TRAILS?.TRAIL_TYPE?.FULL_SIZE || 0 },
    { type: 'ATV', mileage: stats.MVUM_TRAILS?.TRAIL_TYPE?.ATV || 0 },
    { type: 'Motorcycle', mileage: stats.MVUM_TRAILS?.TRAIL_TYPE?.MOTORCYCLE || 0 },
    { type: 'UTV or other special designation', mileage: stats.MVUM_TRAILS?.TRAIL_TYPE?.SPECIAL || 0 },
    { type: 'Other', mileage: stats.MVUM_TRAILS?.TRAIL_TYPE?.OTHER || 0 },
  ];

  const trailTypePieData = createPieData(
    trailTypeData.filter((item) => item.mileage > 0),
    trailTypeColorMap
  );

  // Calculate maintenance level data for closed roads
  const closedRoadMaintenanceLevels = [
    { level: 'Decommissioned', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.DECOMMISSIONED || 0 },
    { level: 'ML1', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.ML1 || 0 },
    { level: 'ML2', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.ML2 || 0 },
    { level: 'ML3', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.ML3 || 0 },
    { level: 'ML4', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.ML4 || 0 },
    { level: 'ML5', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.ML5 || 0 },
    { level: 'None', mileage: stats.CLOSED_ROADS?.MAINTENANCE_LEVELS?.NONE || 0 },
  ];

  const closedRoadPieData = createPieData(
    closedRoadMaintenanceLevels.filter((item) => item.mileage > 0),
    maintenanceLevelColorMap
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Route Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* MVUM Roads */}
        <Grid size={{ xs: 12, md: 12, lg: 6, xl: 4 }}>
          <Card sx={{ height: isMobile ? 'auto' : CARD_MIN_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                MVUM Roads
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Total:</strong> {stats.MVUM_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                  {formatMileage(stats.MVUM_ROADS?.TOTAL_MILEAGE || 0)} miles)
                </Typography>
                <Typography variant="body1">
                  <strong>Seasonal Restrictions:</strong>{' '}
                  {formatMileage(stats.MVUM_ROADS?.TOTAL_SEASONAL_MILEAGE || 0)} miles
                </Typography>
                <Typography variant="body1">
                  <strong>Roads Open to All Vehicles:</strong>{' '}
                  {(stats.MVUM_ROADS?.ALL_VEHICLES_MILEAGE || 0) === 0 && 
                   (stats.MVUM_ROADS?.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0) === 0
                    ? 'Not available'
                    : `${formatMileage(stats.MVUM_ROADS?.ALL_VEHICLES_MILEAGE || 0)} miles`}
                </Typography>
                <Typography variant="body1">
                  <strong>Roads Open to Highway Vehicles Only:</strong>{' '}
                  {(stats.MVUM_ROADS?.ALL_VEHICLES_MILEAGE || 0) === 0 && 
                   (stats.MVUM_ROADS?.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0) === 0
                    ? 'Not available'
                    : `${formatMileage(stats.MVUM_ROADS?.HIGHWAY_VEHICLES_ONLY_MILEAGE || 0)} miles`}
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                By Maintenance Level
              </Typography>
              <StatsTable>
                <thead>
                  <tr>
                    <th>Maintenance Level</th>
                    <th>Mileage</th>
                  </tr>
                </thead>
                <tbody>
                  {mvumRoadMaintenanceLevels.map((item) => (
                    <tr key={item.level}>
                      <td>{item.level}</td>
                      <td>{formatMileage(item.mileage)}</td>
                    </tr>
                  ))}
                </tbody>
              </StatsTable>

              {mvumRoadPieData.length > 0 && <StyledPieChart data={mvumRoadPieData} isMobile={isMobile} />}
            </CardContent>
          </Card>
        </Grid>

        {/* Closed Roads */}
        <Grid size={{ xs: 12, md: 12, lg: 6, xl: 4 }}>
          <Card sx={{ height: isMobile ? 'auto' : CARD_MIN_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                Closed Roads
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Total:</strong> {stats.CLOSED_ROADS?.NUM_ROADS?.toLocaleString() || 0} roads (
                  {formatMileage(stats.CLOSED_ROADS?.TOTAL_MILEAGE || 0)} miles)
                </Typography>
                <Typography variant="body1">
                  <strong>Admin Roads:</strong> {formatMileage(stats.CLOSED_ROADS?.ADMIN_MILEAGE || 0)} miles
                </Typography>
                <Typography variant="body1">
                  <strong>Available for Trail Conversion:</strong>{' '}
                  {formatMileage(stats.CLOSED_ROADS?.MILEAGE_SUITABLE_FOR_TRAIL_CONVERSION || 0)} miles
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                By Maintenance Level
              </Typography>
              <StatsTable>
                <thead>
                  <tr>
                    <th>Maintenance Level</th>
                    <th>Mileage</th>
                  </tr>
                </thead>
                <tbody>
                  {closedRoadMaintenanceLevels.map((item) => (
                    <tr key={item.level}>
                      <td>{item.level}</td>
                      <td>{formatMileage(item.mileage)}</td>
                    </tr>
                  ))}
                </tbody>
              </StatsTable>

              {closedRoadPieData.length > 0 && <StyledPieChart data={closedRoadPieData} isMobile={isMobile} />}
            </CardContent>
          </Card>
        </Grid>

        {/* Motorized Trails */}
        <Grid size={{ xs: 12, md: 12, lg: 6, xl: 4 }}>
          <Card sx={{ height: isMobile ? 'auto' : CARD_MIN_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                Motorized Trails
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Total:</strong> {stats.MVUM_TRAILS?.NUM_TRAILS?.toLocaleString() || 0} trails (
                  {formatMileage(stats.MVUM_TRAILS?.TOTAL_MILEAGE || 0)} miles)
                </Typography>
                <Typography variant="body1">
                  <strong>Seasonal Restrictions:</strong>{' '}
                  {formatMileage(stats.MVUM_TRAILS?.TOTAL_SEASONAL_MILEAGE || 0)} miles
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                By Trail Type
              </Typography>
              <StatsTable>
                <thead>
                  <tr>
                    <th>Trail Type</th>
                    <th>Mileage</th>
                  </tr>
                </thead>
                <tbody>
                  {trailTypeData.map((item) => (
                    <tr key={item.type}>
                      {item.type === "UTV or other special designation" ? (
                        <Tooltip title={`Most forests use 'special' to designate trails for UTVs greater than 50" but less than 80" in width. Others use it for full size trails > 80".`} arrow>
                          <td>{item.type} <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} /></td>
                        </Tooltip>
                      ) : (
                        <td>{item.type}</td>
                      )}
                      <td>{formatMileage(item.mileage)}</td>
                    </tr>
                  ))}
                </tbody>
              </StatsTable>

              {trailTypePieData.length > 0 && <StyledPieChart data={trailTypePieData} isMobile={isMobile} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteStatistics;