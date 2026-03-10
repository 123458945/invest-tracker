import { Box, Toolbar, Container } from '@mui/material';
import AppBar from './AppBar';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
