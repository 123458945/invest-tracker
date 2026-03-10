import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

const EmptyState = ({ message = '暂无数据', icon: Icon = InboxIcon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        color: 'text.secondary',
      }}
    >
      <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

export default EmptyState;
