import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  CircularProgress,
  InputAdornment,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Tooltip,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { stocksApi } from '../../api/stocks.api';
import TradingDayDatePicker, { isTradingDay, getTradingDayStatus } from '../common/TradingDayDatePicker';
import dayjs from 'dayjs';

const AddHoldingDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    stockCode: '',
    stockName: '',
    market: 'sh',
    assetType: 'stock',
    inputType: 'amount',
    amount: '',
    quantity: '',
    buyDate: dayjs(),
    buyPrice: '',
  });
  const [errors, setErrors] = useState({});
  const [searching, setSearching] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [stockFound, setStockFound] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceSource, setPriceSource] = useState('');
  const [nonTradingDayWarning, setNonTradingDayWarning] = useState(null);

  // dialog 打开时重置表单（解决第二次打开残留上次数据的问题）
  useEffect(() => {
    if (open) {
      setFormData({
        stockCode: '',
        stockName: '',
        market: 'sh',
        assetType: 'stock',
        inputType: 'amount',
        amount: '',
        quantity: '',
        buyDate: dayjs(),
        buyPrice: '',
      });
      setErrors({});
      setStockFound(false);
      setCurrentPrice(0);
      setPriceSource('');
      setNonTradingDayWarning(null);
    }
  }, [open]);

  const fetchHistoryPrice = async (stockCode, market, dateStr, fallbackPrice = 0) => {
    console.log('fetchHistoryPrice called:', { stockCode, market, dateStr });
    if (!stockCode || !market || !dateStr) {
      console.log('Missing params, returning early');
      return;
    }

    setLoadingPrice(true);
    setNonTradingDayWarning(null);

    try {
      console.log('Calling API with params:', { stockCode, market, dateStr });
      const response = await stocksApi.getHistoryPrice(stockCode, market, dateStr);
      console.log('API response:', response.data);
      if (response.data.success && response.data.data.closePrice > 0) {
        setFormData(prev => ({ ...prev, buyPrice: response.data.data.closePrice.toString() }));
        setPriceSource('历史收盘价');
      } else {
        throw new Error('无数据');
      }
    } catch (err) {
      console.error('fetchHistoryPrice error:', err);
      if (fallbackPrice > 0) {
        setFormData(prev => ({ ...prev, buyPrice: fallbackPrice.toString() }));
        setPriceSource('当前价格');
        setNonTradingDayWarning('所选日期无历史数据，已使用当前价格。如需准确买入价，请手动修改。');
      }
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleDateChange = (newDate, tradingDayStatus) => {
    setFormData(prev => ({ 
      ...prev, 
      buyDate: newDate,
      buyPrice: '',
    }));
    setErrors(prev => ({ ...prev, buyDate: '' }));
    setPriceSource('');
    setNonTradingDayWarning(null);
    
    if (tradingDayStatus && !tradingDayStatus.isTrading) {
      setNonTradingDayWarning(`${tradingDayStatus.reason}，建议选择交易日以获取准确的历史价格`);
    }
    
    if (newDate && stockFound && formData.stockCode && formData.market) {
      const dateStr = newDate.format('YYYY-MM-DD');
      fetchHistoryPrice(formData.stockCode, formData.market, dateStr, currentPrice);
    }
  };

  const handleStockCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({
      ...prev,
      stockCode: value,
      stockName: '',
      market: 'sh',
      assetType: 'stock',
      buyPrice: '',
    }));
    setStockFound(false);
    setCurrentPrice(0);
    setPriceSource('');
    setNonTradingDayWarning(null);
    setErrors(prev => ({ ...prev, stockCode: '' }));

    if (value.length === 6) {
      setSearching(true);
      try {
        const response = await stocksApi.search(value);
        if (response.data.success && response.data.data.length > 0) {
          const stock = response.data.data[0];
          const newMarket = stock.market || 'sh';
          
          setFormData(prev => ({
            ...prev,
            stockName: stock.stockName,
            market: newMarket,
            assetType: stock.assetType || 'stock',
          }));

          if (formData.buyDate) {
            const dateStr = formData.buyDate.format('YYYY-MM-DD');
            fetchHistoryPrice(value, newMarket, dateStr, stock.currentPrice || 0);
          }
          setCurrentPrice(stock.currentPrice || 0);
          setStockFound(true);
        } else {
          setErrors(prev => ({ ...prev, stockCode: '未找到该股票/基金代码' }));
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, stockCode: '查询失败' }));
      } finally {
        setSearching(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBuyPriceChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setFormData(prev => ({ ...prev, buyPrice: value }));
      setPriceSource('手动输入');
      setNonTradingDayWarning(null);
      setErrors(prev => ({ ...prev, buyPrice: '' }));
    }
  };

  const handleInputTypeChange = (e, newType) => {
    if (newType) {
      setFormData(prev => ({ ...prev, inputType: newType, amount: '', quantity: '' }));
      setErrors(prev => ({ ...prev, amount: '', quantity: '' }));
    }
  };

  const buyPrice = parseFloat(formData.buyPrice) || 0;
  
  const calculatedQuantity = formData.inputType === 'amount' && buyPrice > 0 && formData.amount
    ? (formData.assetType === 'fund'
        ? parseFloat((parseFloat(formData.amount) / buyPrice).toFixed(2))
        : Math.floor(parseFloat(formData.amount) / buyPrice))
    : 0;

  const calculatedAmount = formData.inputType === 'quantity' && buyPrice > 0 && formData.quantity
    ? (parseFloat(formData.quantity) * buyPrice).toFixed(2)
    : 0;

  const validate = () => {
    const newErrors = {};
    if (!formData.stockCode) newErrors.stockCode = '股票代码不能为空';
    else if (formData.stockCode.length !== 6) newErrors.stockCode = '股票代码为6位';
    else if (!stockFound) newErrors.stockCode = '请输入有效的股票代码';
    
    if (!formData.buyDate) {
      newErrors.buyDate = '请选择买入日期';
    }
    
    if (!formData.buyPrice || buyPrice <= 0) {
      newErrors.buyPrice = '买入价格必须大于0';
    }
    
    if (formData.inputType === 'amount') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = '投入金额必须大于0';
      }
    } else {
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        newErrors.quantity = '份额必须大于0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const quantity = formData.inputType === 'amount' 
        ? calculatedQuantity 
        : parseFloat(formData.quantity);
      
      onSubmit({
        stockCode: formData.stockCode,
        stockName: formData.stockName,
        market: formData.market,
        assetType: formData.assetType,
        quantity,
        buyPrice,
        buyDate: formData.buyDate.format('YYYY-MM-DD'),
        currentPrice: currentPrice || buyPrice,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      stockCode: '',
      stockName: '',
      market: 'sh',
      assetType: 'stock',
      inputType: 'amount',
      amount: '',
      quantity: '',
      buyDate: dayjs(),
      buyPrice: '',
    });
    setErrors({});
    setStockFound(false);
    setCurrentPrice(0);
    setPriceSource('');
    setNonTradingDayWarning(null);
    onClose();
  };

  const getPriceHelperText = () => {
    if (errors.buyPrice) return errors.buyPrice;
    if (priceSource) {
      if (priceSource === '历史收盘价') {
        return '✓ 已获取该交易日收盘价';
      }
      return priceSource;
    }
    return '选择买入日期后自动获取';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加持仓</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="代码"
                name="stockCode"
                value={formData.stockCode}
                onChange={handleStockCodeChange}
                error={!!errors.stockCode}
                helperText={errors.stockCode || '输入6位股票/基金代码'}
                placeholder="股票: 600519 / 基金: 110022"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  endAdornment: searching && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {stockFound && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formData.stockName}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: formData.assetType === 'fund' ? 'success.light' : 'primary.light',
                          color: 'white',
                        }}
                      >
                        {formData.assetType === 'fund' ? '基金' : '股票'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      当前价格: ¥{currentPrice.toFixed(4)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      买入日期
                    </Typography>
                    <Tooltip 
                      title={
                        <Box>
                          <Typography variant="body2">交易日说明：</Typography>
                          <Typography variant="caption" component="div">• 绿色背景：交易日</Typography>
                          <Typography variant="caption" component="div">• 划线灰色：非交易日（周末/节假日）</Typography>
                          <Typography variant="caption" component="div">• 未来日期不可选</Typography>
                        </Box>
                      }
                      arrow
                    >
                      <InfoIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                  <TradingDayDatePicker
                    value={formData.buyDate}
                    onChange={handleDateChange}
                    error={!!errors.buyDate}
                    helperText={errors.buyDate}
                    maxDate={dayjs()}
                  />
                </Grid>

                {nonTradingDayWarning && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<InfoIcon />}>
                      {nonTradingDayWarning}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="买入价格"
                    name="buyPrice"
                    value={formData.buyPrice}
                    onChange={handleBuyPriceChange}
                    error={!!errors.buyPrice}
                    helperText={getPriceHelperText()}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      endAdornment: loadingPrice && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ToggleButtonGroup
                    value={formData.inputType}
                    exclusive
                    onChange={handleInputTypeChange}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="amount">按金额</ToggleButton>
                    <ToggleButton value="quantity">按份额</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {formData.inputType === 'amount' ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="投入金额"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      error={!!errors.amount}
                      helperText={errors.amount || (buyPrice > 0 ? `可买入约 ${calculatedQuantity} 股` : '请先输入买入价格')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1000 }}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="买入份额"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      error={!!errors.quantity}
                      helperText={errors.quantity || (buyPrice > 0 ? `约需 ¥${calculatedAmount}` : '请先输入买入价格')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">股</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 100 }}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!stockFound || loadingPrice}
        >
          添加
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHoldingDialog;
