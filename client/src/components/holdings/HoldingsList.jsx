import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  TrendingDown,
  Sell as SellIcon,
} from '@mui/icons-material';

const HoldingsList = ({ holdings, onEdit, onDelete, onSell }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    const v = value ?? 0;
    return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              股票代码
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              名称
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              市场
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              数量
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              成本
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              现价
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              市值
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              盈亏
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              盈亏率
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2 }}>
              操作
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">
                  暂无持仓数据
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => (
              <TableRow
                key={holding._id}
                hover
                sx={{
                  transition: 'background-color 0.15s',
                  '&:last-child td': { border: 0 },
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {holding.stockCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {holding.stockName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={holding.market === 'sh' ? '沪' : holding.market === 'sz' ? '深' : '基金'}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      bgcolor: holding.market === 'sh' ? 'rgba(26,86,219,0.08)' : holding.market === 'sz' ? 'rgba(5,150,105,0.08)' : 'rgba(234,179,8,0.08)',
                      color: holding.market === 'sh' ? '#1a56db' : holding.market === 'sz' ? '#059669' : '#ca8a04',
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {holding.quantity}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(holding.avgBuyPrice)}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(holding.currentPrice)}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {formatCurrency(holding.marketValue)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    {holding.unrealizedProfit >= 0 ? (
                      <TrendingUp fontSize="small" sx={{ color: '#dc2626', fontSize: 16 }} />
                    ) : (
                      <TrendingDown fontSize="small" sx={{ color: '#059669', fontSize: 16 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: holding.unrealizedProfit >= 0 ? '#dc2626' : '#059669',
                      }}
                    >
                      {formatCurrency(holding.unrealizedProfit)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: holding.profitLossRate >= 0 ? '#dc2626' : '#059669',
                    }}
                  >
                    {formatPercent(holding.profitLossRate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
                    <Tooltip title="卖出" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onSell(holding)}
                        sx={{
                          color: '#ea580c',
                          '&:hover': { bgcolor: 'rgba(234,88,12,0.08)' },
                        }}
                      >
                        <SellIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(holding)}
                        sx={{
                          color: '#1a56db',
                          '&:hover': { bgcolor: 'rgba(26,86,219,0.08)' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(holding)}
                        sx={{
                          color: '#dc2626',
                          '&:hover': { bgcolor: 'rgba(220,38,38,0.08)' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HoldingsList;
