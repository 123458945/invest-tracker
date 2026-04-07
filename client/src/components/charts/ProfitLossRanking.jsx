import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';

const ProfitLossRanking = ({ topGainers = [], topLosers = [], loading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography color="text.secondary">加载中...</Typography>
      </Box>
    );
  }

  if (topGainers.length === 0 && topLosers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography color="text.secondary">暂无持仓数据</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {topGainers.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'profit.main' }}>
            盈利排行
          </Typography>
          <List dense disablePadding>
            {topGainers.map((item, index) => (
              <ListItem key={item._id} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      bgcolor: 'profit.main',
                      color: 'white',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.stockName}
                  secondary={item.stockCode}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'profit.main' }}>
                    {formatPercent(item.profitLossRate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(item.profitLoss)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {topLosers.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'loss.main' }}>
            亏损排行
          </Typography>
          <List dense disablePadding>
            {topLosers.map((item, index) => (
              <ListItem key={item._id} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      bgcolor: 'loss.main',
                      color: 'white',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.stockName}
                  secondary={item.stockCode}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'loss.main' }}>
                    {formatPercent(item.profitLossRate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(item.profitLoss)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ProfitLossRanking;
