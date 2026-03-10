import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Snackbar,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import { stocksApi } from '../api/stocks.api';
import StockSearch from '../components/stocks/StockSearch';
import StockCard from '../components/stocks/StockCard';
import KLineChart from '../components/stocks/KLineChart';
import MAChart from '../components/stocks/MAChart';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const StocksPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedStock, setSelectedStock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [kLineData, setKLineData] = useState(null);
  const [kLineLoading, setKLineLoading] = useState(false);
  const [maData, setMaData] = useState(null);
  const [maLoading, setMaLoading] = useState(false);

  const handleSearch = async (keyword) => {
    try {
      setLoading(true);
      setError('');
      const response = await stocksApi.search(keyword);
      if (response.data.success) {
        setStocks(response.data.data);
      }
    } catch (err) {
      setError('搜索失败，请稍后重试');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHoldings = async () => {
    try {
      const response = await stocksApi.updateHoldings();
      if (response.data.success) {
        setSnackbar({ open: true, message: '持仓价格更新成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '更新失败，请稍后重试', severity: 'error' });
    }
  };

  const handleStockClick = async (stock) => {
    setSelectedStock(stock);
    setDialogOpen(true);
    setTabValue(0);
    setKLineData(null);
    setMaData(null);
    await fetchStockData(stock);
  };

  const fetchStockData = async (stock) => {
    setKLineLoading(true);
    setMaLoading(true);

    try {
      const [kLineRes, maRes] = await Promise.all([
        stocksApi.getKLine(stock.stockCode, stock.market, 70),
        stocksApi.getMA(stock.stockCode),
      ]);

      if (kLineRes.data.success) {
        setKLineData(kLineRes.data.data);
      }
      if (maRes.data.success) {
        setMaData(maRes.data.data);
      }
    } catch (err) {
      console.error('获取股票数据失败:', err);
    } finally {
      setKLineLoading(false);
      setMaLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStock(null);
    setKLineData(null);
    setMaData(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          行情查询
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleUpdateHoldings}
        >
          更新持仓价格
        </Button>
      </Box>

      <StockSearch onSearch={handleSearch} loading={loading} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stocks.length > 0 ? (
        <Grid container spacing={3}>
          {stocks.map((stock) => (
            <Grid item xs={12} sm={6} md={4} key={`${stock.stockCode}-${stock.market}`}>
              <StockCard stock={stock} onClick={() => handleStockClick(stock)} />
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              输入股票代码或名称进行搜索
            </Typography>
          </Box>
        )
      )}

      {/* 股票详情对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {selectedStock?.stockName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedStock?.stockCode} · {selectedStock?.market === 'sh' ? '沪市' : '深市'}
            </Typography>
          </Box>
          <Button onClick={handleCloseDialog} sx={{ minWidth: 'auto', p: 0.5 }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ mb: 2, p: 2, bgcolor: 'action.hover' }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">当前价</Typography>
                <Typography variant="h6" color={selectedStock?.changePercent >= 0 ? 'error.main' : 'success.main'}>
                  ¥{selectedStock?.currentPrice?.toFixed(2) || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">涨跌幅</Typography>
                <Typography variant="h6" color={selectedStock?.changePercent >= 0 ? 'error.main' : 'success.main'}>
                  {selectedStock?.changePercent >= 0 ? '+' : ''}{selectedStock?.changePercent?.toFixed(2) || '-'}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">最高价</Typography>
                <Typography variant="h6">
                  ¥{selectedStock?.highPrice?.toFixed(2) || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">最低价</Typography>
                <Typography variant="h6">
                  ¥{selectedStock?.lowPrice?.toFixed(2) || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="K线图" />
              <Tab label="均线图" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {kLineLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <KLineChart data={kLineData} stockName={selectedStock?.stockName} loading={kLineLoading} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {maLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: '500px' }}>
                {maData && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">MA5</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          ¥{maData.ma5?.toFixed(2) || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">MA10</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          ¥{maData.ma10?.toFixed(2) || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">MA20</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          ¥{maData.ma20?.toFixed(2) || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">MA60</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          ¥{maData.ma60?.toFixed(2) || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
            )}
          </TabPanel>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StocksPage;
