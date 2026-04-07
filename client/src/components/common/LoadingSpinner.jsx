import { Box, Skeleton } from '@mui/material';

const LoadingSpinner = ({ size = 40, fullScreen = false, variant = 'spinner' }) => {
  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        {fullScreen ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={32} width="40%" sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={96} sx={{ flex: 1 }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" height={320} sx={{ flex: 1 }} />
              <Skeleton variant="rounded" height={320} sx={{ flex: 1 }} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={24} width="60%" sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={200} />
          </Box>
        )}
      </Box>
    );
  }

  // fallback spinner
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : 'auto',
        p: fullScreen ? 0 : 4,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '3px solid #e5e7eb',
          borderTopColor: '#1a56db',
          animation: 'spin 0.8s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
    </Box>
  );
};

export default LoadingSpinner;
