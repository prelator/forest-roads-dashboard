import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to the Forest Roads Dashboard
          </Typography>
          <Typography variant="h5" color="text.secondary" component="p">
            A project by One Voice and Colorado Offroad Trail Defenders
          </Typography>
          <Typography variant="body1" color="text.secondary" component="p" sx={{ mt: 2 }}>
            Explore data on National Forest roads, motorized trails, and closed roads across the United States, grouped by individual Forests and Ranger Districts. This dashboard is designed to visualize the amount of opportunities provided on each Forest for motorized recreation, reveal where such opportunities are scarce, and highlight the number of closed and administrative roads that could be opened to public motorized use to enhance recreational access.
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: 800,
            height: 400,
            backgroundColor: 'grey.200',
            backgroundImage: 'url(/hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        </Box>

        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 2, px: 4, py: 1.5 }}
        >
          View Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;