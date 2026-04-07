import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Grid, Card, CardContent, Snackbar, Paper } from '@mui/material';
import { Refresh as RefreshIcon, AccountBalance, TrendingUp, TrendingDown } from '@mui/icons-material';
import { holdingsApi } from '../api/holdings.api';
import { stocksApi } from '../api/stocks.api';
import { analyticsApi } from '../api/analytics.api';
import { alertsApi } from '../api/alerts.api';
import AssetAllocationChart from '../components/charts/AssetAllocationChart';
import ProfitLossRanking from '../components/charts/ProfitLossRanking';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      cursor: 'default',
      transition: 'box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}14`,
          color,
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const DashboardPage = () => {
  const [holdings, setHoldings] = useState([]);
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [topPerformers, setTopPerformers] = useState({ topGainers: [], topLosers: [] });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [holdingsRes, allocationRes, performersRes, alertsRes] = await Promise.all([
        holdingsApi.getAll(),
        analyticsApi.getAssetAllocation(),
        analyticsApi.getTopPerformers(5),
        alertsApi.getAll(),
      ]);

      if (holdingsRes.data.success) {
        setHoldings(holdingsRes.data.data);
      }
      if (allocationRes.data.success) {
        setAssetAllocation(allocationRes.data.data);
      }
      if (performersRes.data.success) {
        setTopPerformers(performersRes.data.data);
      }
      if (alertsRes.data.success) {
        setAlerts(alertsRes.data.data);
      }
    } catch (err) {
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePrices = async () => {
    try {
      setUpdating(true);
      const response = await stocksApi.updateHoldings();
      if (response.data.success) {
        await fetchData();
        setSnackbar({ open: true, message: '持仓价格更新成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '更新失败，请稍后重试', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + ((h.quantity || 0) * (h.avgBuyPrice || 0)), 0);
  const totalProfitLoss = totalMarketValue - totalCostBasis;
  const totalProfitLossRate = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          投资仪表板
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleUpdatePrices}
          disabled={updating || holdings.length === 0}
          sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
        >
          {updating ? '更新中...' : '更新价格'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner variant="skeleton" fullScreen />
      ) : (
      <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总资产"
            value={formatCurrency(totalMarketValue)}
            icon={<AccountBalance />}
            color="#1a56db"
            subtitle={holdings.length > 0 ? `${holdings.length} 个持仓` : '暂无持仓'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总盈亏"
            value={formatCurrency(totalProfitLoss)}
            icon={totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
            color={totalProfitLoss >= 0 ? '#dc2626' : '#059669'}
            subtitle={formatPercent(totalProfitLossRate)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="盈利持仓"
            value={holdings.filter(h => h.profitLoss > 0).length}
            icon={<TrendingUp />}
            color="#dc2626"
            subtitle={holdings.filter(h => h.profitLoss > 0).length > 0 ? '盈利中' : '无'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="亏损持仓"
            value={holdings.filter(h => h.profitLoss < 0).length}
            icon={<TrendingDown />}
            color="#059669"
            subtitle={holdings.filter(h => h.profitLoss < 0).length > 0 ? '亏损中' : '无'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                资产配置
              </Typography>
              <AssetAllocationChart data={assetAllocation} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                盈亏排行
              </Typography>
              <ProfitLossRanking
                topGainers={topPerformers.topGainers}
                topLosers={topPerformers.topLosers}
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
