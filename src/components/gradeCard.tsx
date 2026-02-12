import { Box, Card, CardContent, Typography } from '@mui/material';

interface GradeCardProps {
  grade: string;
  percentage: number;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A':
      return '#4caf50'; // green
    case 'B':
      return '#ffeb3b'; // yellow
    case 'C':
      return '#ff9800'; // orange
    case 'D':
    case 'F':
      return '#f44336'; // red
    default:
      return '#757575'; // gray
  }
};

const GradeCard = ({ grade, percentage }: GradeCardProps) => {
  return (
    <Card sx={{ flex: '0 1 300px', minWidth: 0 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ textAlign: 'center' }}>
          Motorized Access Grade
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: getGradeColor(grade),
              lineHeight: 1,
              mb: 2,
            }}
          >
            {grade}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {percentage.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            % total roads open
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            (includes open roads and full size trails)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GradeCard;
