import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { format } from 'date-fns';
import { holdingsApi } from '../api/holdings.api';

const TransactionsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    stockCode: '',
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchActiveTransactions();
    } else {
      fetchDeletedTransactions();
    }
  }, [filters, tabValue]);

  const fetchActiveTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.stockCode) params.stockCode = filters.stockCode;

      const [transactionsRes, statsRes] = await Promise.all([
        holdingsApi.getTransactions(params),
        holdingsApi.getTransactionStats(),
      ]);

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('获取交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.stockCode) params.stockCode = filters.stockCode;

      const transactionsRes = await holdingsApi.getDeletedTransactions(params);

      if (transactionsRes.data.success) {
        setDeletedTransactions(transactionsRes.data.data);
      }
    } catch (error) {
      console.error('获取已删除交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const uniqueStockCodes = [...new Set(transactions.map((t) => t.stockCode))];
  const displayTransactions = tabValue === 0 ? transactions : deletedTransactions;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        交易记录
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="交易记录" />
          <Tab label="已删除交易" />
        </Tabs>
      </Box>

      {stats && tabValue === 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  未实现盈亏
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: (stats.totalUnrealizedProfit || 0) >= 0 ? 'profit.main' : 'loss.main',
                  }}
                >
                  {formatCurrency(stats.totalUnrealizedProfit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  已实现盈亏
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: (stats.totalRealizedProfit || 0) >= 0 ? 'profit.main' : 'loss.main',
                  }}
                >
                  {formatCurrency(stats.totalRealizedProfit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  总盈亏
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: (stats.totalProfit || 0) >= 0 ? 'profit.main' : 'loss.main',
                  }}
                >
                  {formatCurrency(stats.totalProfit)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  交易次数
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {transactions.length}笔
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>交易类型</InputLabel>
              <Select
                value={filters.type}
                label="交易类型"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="buy">买入</MenuItem>
                <MenuItem value="sell">卖出</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="股票代码"
              value={filters.stockCode}
              onChange={(e) => setFilters({ ...filters, stockCode: e.target.value })}
              placeholder="输入股票代码筛选"
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>交易类型</TableCell>
              <TableCell>股票代码</TableCell>
              <TableCell>股票名称</TableCell>
              <TableCell>市场</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell align="right">价格</TableCell>
              <TableCell align="right">金额</TableCell>
              <TableCell align="right">已实现盈亏</TableCell>
              <TableCell align="right">交易日期</TableCell>
              {tabValue === 1 && <TableCell align="right">删除日期</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tabValue === 1 ? 10 : 9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无交易记录</Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayTransactions.map((transaction) => (
                <TableRow key={transaction._id} hover>
                  <TableCell>
                    <Chip
                      icon={transaction.type === 'buy' ? <TrendingUp /> : <TrendingDown />}
                      label={transaction.type === 'buy' ? '买入' : '卖出'}
                      color={transaction.type === 'buy' ? 'primary' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {transaction.stockCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.stockName}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        transaction.market === 'sh'
                          ? '上海'
                          : transaction.market === 'sz'
                          ? '深圳'
                          : '基金'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{transaction.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(transaction.price)}</TableCell>
                  <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell align="right">
                    {transaction.type === 'sell' ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: transaction.realizedProfit >= 0 ? 'profit.main' : 'loss.main',
                        }}
                      >
                        {formatCurrency(transaction.realizedProfit)}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {format(new Date(transaction.transactionDate), 'yyyy-MM-dd')}
                  </TableCell>
                  {tabValue === 1 && transaction.deletedAt && (
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(transaction.deletedAt), 'yyyy-MM-dd')}
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionsPage;
