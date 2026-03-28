import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const StockCard = ({ stock, onClick }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    const v = value || 0;
    return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  };

  const isUp = stock.changePercent >= 0;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {stock.stockName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stock.stockCode}
            </Typography>
          </Box>
          <Chip
            label={isUp ? '涨' : '跌'}
            sx={{ 
              bgcolor: isUp ? 'profit.main' : 'loss.main',
              color: 'white',
            }}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isUp ? 'profit.main' : 'loss.main' }}>
              {formatCurrency(stock.currentPrice)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {isUp ? (
                <TrendingUp fontSize="small" sx={{ color: 'profit.main' }} />
              ) : (
                <TrendingDown fontSize="small" sx={{ color: 'loss.main' }} />
              )}
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', color: isUp ? 'profit.main' : 'loss.main' }}
              >
                {formatPercent(stock.changePercent)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              今开: {formatCurrency(stock.openPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最高: {formatCurrency(stock.highPrice)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              最低: {formatCurrency(stock.lowPrice)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockCard;
