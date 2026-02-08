import { Box, Stack, Button, Container, Link, Typography } from '@mui/material';
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
          gap: 2,
        }}
      >
        <img src="/fs-logo.svg" alt="Forest Service Logo" style={{ width: '160px' }} />
        <Box>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to the Forest Roads Dashboard
          </Typography>
          <Typography variant="h4" color="text.secondary" component="p">
            A project by One Voice and Colorado Offroad Trail Defenders
          </Typography>
          <Typography variant="body1" color="text.primary" component="p" sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
            Explore data on National Forest roads, motorized trails, and closed roads across the United States, grouped by individual forests and ranger districts.
          </Typography>
          <Typography variant="body1" color="text.primary" component="p" sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
            This dashboard is designed to visualize the amount of opportunities provided on each forest for motorized recreation, reveal where such opportunities are scarce, and highlight the number of closed and administrative roads that could be opened to public motorized use to enhance recreational access.
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
      <Stack spacing={2}>
        <Typography variant="h5" color="text.primary" component="h2">
          About This Project
        </Typography>
        <Typography variant="body1" color="text.primary" component="p">
          This dashboard was created to support the efforts of One Voice and Colorado Offroad Trail Defenders in advocating for increased motorized recreational access on National Forest lands. By providing a clear visualization of the current state of roads and trails, we aim to empower advocates, inform the public, and encourage responsible recreation that benefits both people and public lands.
        </Typography>
        <Typography variant="body1" color="text.primary" component="p">
          With the possible revision of the Travel Management Rule in mid-2026, there is the potential to change its current goal of continuously reducing access through compounding closures to instead promote expanded access for motorized recreation. This presents a critical opportunity to advocate for the opening of current closed and administrative roads to public motorized use.
        </Typography>
        <Typography variant="body1" color="text.primary" component="p">
          This dashboard serves as a tool to showcase the potential for increased recreational access and to support data-driven advocacy efforts. It compares the mileage of open roads and motorized trails to the mileage of closed roads across individual forests and ranger districts, highlighting closed high clearance roads that could be converted to motorized trails. This demonstrates the potential for expanding access and enhancing recreational opportunities on National Forest lands.
        </Typography>
         <Typography variant="body1" color="text.primary" component="p">
          This website is not affiliated with the US Forest Service. Use of the Forest Service logo is solely referential for the purpose of communicating the focus of this project on National Forest lands and is not intended to imply endorsement or affiliation with the US Forest Service.
        </Typography>
      </Stack>
      <Stack spacing={2} mt={2}>
        <Typography variant="h5" color="text.primary" component="h2">
          Data Sources
        </Typography>
        <Typography variant="body1" color="text.primary" component="p">
          The data for this dashboard was sourced from the US Forest Service's Geospatial Data Discovery portal, which provides GIS data sets on National Forest lands. This site uses the latest data available as of Feburary 2026, however some data sets have not been updated in several years. The primary data sets used include:
        </Typography>
        <Box component="ul" sx={{ pl: 4, color: 'text.primary' }}>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            <Link href="https://data-usfs.hub.arcgis.com/datasets/5137012764df4f2abbd66e8077d51f38_1" target="_blank" rel="noopener noreferrer">Motor Vehicle Use Map: Roads (Feature Layer)</Link>
          </Typography>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            <Link href="https://data-usfs.hub.arcgis.com/datasets/c5d9a944d61a486d8285018395638e4f_2" target="_blank" rel="noopener noreferrer">Motor Vehicle Use Map: Trails (Feature Layer)</Link>
          </Typography>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            <Link href="https://data-usfs.hub.arcgis.com/datasets/10342a0126564b0fb468b8dcb1b94b3a_0" target="_blank" rel="noopener noreferrer">National Forest System Roads (Feature Layer)</Link>
          </Typography>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            <Link href="https://data-usfs.hub.arcgis.com/datasets/b365db10bd29460dbd5ab152aa2116c0_1" target="_blank" rel="noopener noreferrer">National Forest System Roads closed to motorized uses (Feature Layer)</Link>
          </Typography>
        </Box>
        <Typography variant="body1" color="text.primary" component="p">
          Other data sources include the GIS layers for National Forest boundaries and ranger district boundaries.
        </Typography>
      </Stack>
      <Stack spacing={2} mt={2}>
        <Typography variant="h5" color="text.primary" component="h2">
          Data Gaps and Limitations
        </Typography>
        <Typography variant="body1" color="text.primary" component="p">
          The data used to create this dashboard was pieced together from a combination of GIS data sets provided by the US Forest Service, including the Motor Vehicle Use Map (MVUM) roads and trails layers, the closed roads layer, and the National Forest System Roads layer. However, there are some limitations and gaps in the data that should be noted:
        </Typography>
        <Box component="ul" sx={{ pl: 4, color: 'text.primary' }}>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            The MVUM data is not consistently updated across all forests, and some forests have not provided updated data in several years. This means that the current state of roads and trails may not be accurately reflected for all forests. Some National Forests did not have any roads listed in the MVUM roads layer, which had to be filled in using the National Forest System Roads layer, which may not accurately reflect their public access status.
          </Typography>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            Forests that have recently undergone travel management planning may have more up-to-date MVUM data, but this data might also be in transitional state with gaps between different data sets. One notable example is the Pike San Isabel National Forest in Colorado, which completed travel management planning in 2022. That travel plan involved numerous roads that were converted to motorized trails. In some cases, a road may have already been removed from the MVUM roads layer but not yet added to the MVUM trails layer, which can create discrepancies in the data where legal routes are simply missing. Some road closures may also not yet be reflected, and some open roads may be erroneously listed as closed.
          </Typography>
          <Typography variant="body1" component="li" sx={{ mb: 2 }}>
            The closed roads layer does not specify the reason for closure, so there is no definitive way to know which closed roads are suitable for conversion to motorized trails. The numbers presented here assume that all closed roads listed as high clearance roads not maintained for passenger vehicles could provide a trail-like experience and are suitable for conversion, but this may not be the case for all roads. For example some roads may not have legal public access across private land, some may be closed due to safety concerns that cannot be mitigated, and some may be closed for resource protection reasons that would preclude them from being suitable for motorized use.
          </Typography>
        </Box>
        <Typography variant="body1" color="text.primary" component="p">
          Despite these limitations, we believe that this dashboard provides a valuable tool for visualizing the current state of motorized recreational access on National Forest lands and for supporting advocacy efforts to expand access. We will continue to update the data as new information becomes available and encourage users to provide feedback and suggestions for improvement.
        </Typography>
      </Stack>
    </Container>
  );
};

export default HomePage;