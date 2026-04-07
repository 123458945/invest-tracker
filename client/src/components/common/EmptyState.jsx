import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

const EmptyState = ({ 
  message = '暂无数据', 
  description = '',
  icon: Icon = InboxIcon, 
  actionLabel = '',
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#f0f1f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
        }}
      >
        <Icon sx={{ fontSize: 36, color: '#9ca3b8' }} />
      </Box>
      <Typography 
        variant="subtitle1" 
        sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}
      >
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 320, textAlign: 'center' }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button 
          variant="contained" 
          size="small"
          onClick={onAction}
          sx={{ mt: 1 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
