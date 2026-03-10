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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  TrendingDown,
  Sell as SellIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const HoldingsList = ({ holdings, onEdit, onDelete, onSell }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>股票代码</TableCell>
            <TableCell>股票名称</TableCell>
            <TableCell>市场</TableCell>
            <TableCell>类型</TableCell>
            <TableCell align="right">持仓数量</TableCell>
            <TableCell align="right">平均成本</TableCell>
            <TableCell align="right">当前价格</TableCell>
            <TableCell align="right">市值</TableCell>
            <TableCell align="right">未实现盈亏</TableCell>
            <TableCell align="right">盈亏率</TableCell>
            <TableCell align="right">已实现盈亏</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  暂无持仓数据
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => (
              <TableRow key={holding._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {holding.stockCode}
                  </Typography>
                </TableCell>
                <TableCell>{holding.stockName}</TableCell>
                <TableCell>
                  <Chip
                    label={holding.market === 'sh' ? '上海' : holding.market === 'sz' ? '深圳' : '基金'}
                    size="small"
                    color={holding.market === 'sh' ? 'primary' : holding.market === 'sz' ? 'secondary' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={holding.assetType === 'stock' ? '股票' : '基金'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{holding.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(holding.avgBuyPrice)}</TableCell>
                <TableCell align="right">{formatCurrency(holding.currentPrice)}</TableCell>
                <TableCell align="right">{formatCurrency(holding.marketValue)}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    {holding.unrealizedProfit >= 0 ? (
                      <TrendingUp fontSize="small" sx={{ color: 'profit.main' }} />
                    ) : (
                      <TrendingDown fontSize="small" sx={{ color: 'loss.main' }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'bold', color: holding.unrealizedProfit >= 0 ? 'profit.main' : 'loss.main' }}
                    >
                      {formatCurrency(holding.unrealizedProfit)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: holding.profitLossRate >= 0 ? 'profit.main' : 'loss.main' }}
                  >
                    {formatPercent(holding.profitLossRate)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{ 
                      fontWeight: 'bold', 
                      color: (holding.realizedProfit || 0) >= 0 ? 'profit.main' : 'loss.main' 
                    }}
                  >
                    {formatCurrency(holding.realizedProfit || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="卖出">
                      <IconButton
                        size="small"
                        onClick={() => onSell(holding)}
                        sx={{ color: 'warning.main' }}
                      >
                        <SellIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(holding)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(holding)}
                        color="error"
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
