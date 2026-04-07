import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  InputAdornment,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Star as StarIcon, ShowChart as ShowChartIcon, Info as InfoIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import StockAutocomplete from '../stocks/StockAutocomplete';
import { holdingsApi } from '../../api/holdings.api';

const ALERT_TYPES = [
  { value: 'price_above', label: '价格高于', unit: '元', group: '价格提醒' },
  { value: 'price_below', label: '价格低于', unit: '元', group: '价格提醒' },
  { value: 'change_above', label: '涨幅高于', unit: '%', group: '涨跌提醒' },
  { value: 'change_below', label: '跌幅低于', unit: '%', group: '涨跌提醒' },
  { value: 'ma5_above', label: '价格上穿MA5', unit: '', group: '均线提醒', stub: true },
  { value: 'ma5_below', label: '价格下破MA5', unit: '', group: '均线提醒', stub: true },
  { value: 'ma10_above', label: '价格上穿MA10', unit: '', group: '均线提醒', stub: true },
  { value: 'ma10_below', label: '价格下破MA10', unit: '', group: '均线提醒', stub: true },
  { value: 'ma20_above', label: '价格上穿MA20', unit: '', group: '均线提醒', stub: true },
  { value: 'ma20_below', label: '价格下破MA20', unit: '', group: '均线提醒', stub: true },
  { value: 'ma60_above', label: '价格上穿MA60', unit: '', group: '均线提醒', stub: true },
  { value: 'ma60_below', label: '价格下破MA60', unit: '', group: '均线提醒', stub: true },
];

const AddAlertDialog = ({ open, onClose, onSubmit }) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    stockCode: '',
    stockName: '',
    market: 'sh',
    alertType: 'price_above',
    targetValue: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open) {
      fetchHoldings();
    }
  }, [open]);

  useEffect(() => {
    if (selectedStock) {
      setFormData(prev => ({
        ...prev,
        stockCode: selectedStock.stockCode || '',
        stockName: selectedStock.stockName || '',
        market: selectedStock.market || 'sh',
      }));
      setErrors(prev => ({ ...prev, stockCode: '', stockName: '' }));
    }
  }, [selectedStock]);

  useEffect(() => {
    if (!open) {
      setSelectedStock(null);
      setFormData({
        stockCode: '',
        stockName: '',
        market: 'sh',
        alertType: 'price_above',
        targetValue: '',
        notes: '',
      });
      setErrors({});
      setActiveTab(0);
    }
  }, [open]);

  const fetchHoldings = async () => {
    setHoldingsLoading(true);
    try {
      const response = await holdingsApi.getAll();
      if (response.data.success) {
        setHoldings(response.data.data);
      }
    } catch (err) {
      console.error('获取持仓失败:', err);
    } finally {
      setHoldingsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleStockChange = (stock) => {
    setSelectedStock(stock);
  };

  const handleHoldingSelect = (holding) => {
    setSelectedStock({
      stockCode: holding.stockCode,
      stockName: holding.stockName,
      market: holding.market,
      currentPrice: holding.currentPrice,
      changePercent: holding.profitLossRate,
      isHeld: true,
      holdingQuantity: holding.quantity,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.stockCode) newErrors.stockCode = '请选择股票/基金';
    if (!formData.stockName) newErrors.stockName = '股票名称不能为空';
    
    const selectedType = ALERT_TYPES.find(t => t.value === formData.alertType);
    if (!selectedType?.stub) {
      if (!formData.targetValue || formData.targetValue <= 0) {
        newErrors.targetValue = '目标值必须大于0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const submitData = { ...formData };
      const selectedType = ALERT_TYPES.find(t => t.value === formData.alertType);
      
      if (selectedType?.stub) {
        submitData.targetValue = 0;
      } else {
        submitData.targetValue = parseFloat(formData.targetValue);
      }
      
      onSubmit(submitData);
    }
  };

  const selectedAlertType = ALERT_TYPES.find((t) => t.value === formData.alertType);
  const isStubType = selectedAlertType?.stub;

  const groupedAlertTypes = ALERT_TYPES.reduce((acc, type) => {
    if (!acc[type.group]) acc[type.group] = [];
    acc[type.group].push(type);
    return acc;
  }, {});

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const stockHoldings = holdings.filter(h => h.market !== 'fund');
  const fundHoldings = holdings.filter(h => h.market === 'fund');

  const renderHoldingItem = (holding) => {
    const isSelected = selectedStock?.stockCode === holding.stockCode && selectedStock?.market === holding.market;
    const profitColor = (holding.profitLossRate || 0) >= 0 ? 'error.main' : 'success.main';
    
    return (
      <Paper
        key={`${holding.stockCode}-${holding.market}`}
        onClick={() => handleHoldingSelect(holding)}
        sx={{
          p: 1.5,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.lighter',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={holding.market === 'fund' ? '基' : (holding.market === 'sh' ? '沪' : '深')}
            size="small"
            color={holding.market === 'fund' ? 'secondary' : 'primary'}
            sx={{ minWidth: 28, height: 20, fontSize: '0.7rem' }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {holding.stockName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({holding.stockCode})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                持仓: {holding.quantity?.toLocaleString()}股
              </Typography>
              <Typography variant="caption" color="text.secondary">
                成本: {formatCurrency(holding.avgBuyPrice)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(holding.currentPrice)}
            </Typography>
            <Typography variant="caption" sx={{ color: profitColor }}>
              {(holding.profitLossRate || 0) >= 0 ? '+' : ''}{(holding.profitLossRate || 0).toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加价格提醒</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab 
                icon={<StarIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start" 
                label={`我的持仓 (${holdings.length})`} 
              />
              <Tab icon={<ShowChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="搜索" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  点击选择已持有的股票/基金
                </Typography>
                <Tooltip title="刷新持仓">
                  <IconButton size="small" onClick={fetchHoldings} disabled={holdingsLoading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {holdingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : holdings.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    暂无持仓，请切换到"搜索"标签添加
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflow: 'auto' }}>
                  {stockHoldings.length > 0 && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        股票 ({stockHoldings.length})
                      </Typography>
                      {stockHoldings.map(renderHoldingItem)}
                    </>
                  )}
                  {fundHoldings.length > 0 && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        基金 ({fundHoldings.length})
                      </Typography>
                      {fundHoldings.map(renderHoldingItem)}
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mb: 2 }}>
              <StockAutocomplete
                value={selectedStock}
                onChange={handleStockChange}
                label="搜索股票/基金"
                placeholder="输入代码或名称搜索"
                error={!!errors.stockCode}
                helperText={errors.stockCode}
              />
            </Box>
          )}

          {selectedStock && (
            <Box>
              <Box
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={selectedStock.market === 'fund' ? '基金' : (selectedStock.market === 'sh' ? '沪' : '深')}
                    size="small"
                    color={selectedStock.market === 'fund' ? 'secondary' : 'primary'}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedStock.stockName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({selectedStock.stockCode})
                  </Typography>
                  {selectedStock.isHeld && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
                      label={`已持有 ${selectedStock.holdingQuantity?.toLocaleString() || 0} 股`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
                {selectedStock.currentPrice > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ShowChartIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        当前价格:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: selectedStock.changePercent >= 0 ? 'error.main' : 'success.main'
                        }}
                      >
                        ¥{selectedStock.currentPrice?.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2"
                      sx={{
                        color: selectedStock.changePercent >= 0 ? 'error.main' : 'success.main',
                      }}
                    >
                      ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent?.toFixed(2)}%)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>提醒类型</InputLabel>
                <Select
                  name="alertType"
                  value={formData.alertType}
                  onChange={handleChange}
                  label="提醒类型"
                >
                  {Object.entries(groupedAlertTypes).map(([group, types]) => [
                    <MenuItem key={group} disabled sx={{ opacity: 1, fontWeight: 'bold', bgcolor: 'action.hover' }}>
                      {group}
                    </MenuItem>,
                    ...types.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))
                  ])}
                </Select>
              </FormControl>
            </Grid>

            {!isStubType && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="目标值"
                  name="targetValue"
                  type="number"
                  value={formData.targetValue}
                  onChange={handleChange}
                  error={!!errors.targetValue}
                  helperText={errors.targetValue || (selectedStock?.currentPrice ? `当前价格: ¥${selectedStock.currentPrice.toFixed(2)}` : '')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {selectedAlertType?.unit}
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0, step: formData.alertType.includes('change') ? 0.1 : 0.01 }}
                />
              </Grid>
            )}

            {isStubType && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'info.lighter', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <InfoIcon color="info" />
                  <Typography variant="body2" color="info.dark">
                    均线提醒将在价格穿越均线时触发，无需设置目标值。
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="可选，最多200个字符"
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!selectedStock}
        >
          添加
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAlertDialog;
