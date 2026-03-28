import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { stocksApi } from '../../api/stocks.api';

const SellHoldingDialog = ({ open, holding, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    sellPrice: '',
    sellDate: dayjs(),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    if (!holding || !open) return;

    setFormData({
      quantity: holding.quantity || '',
      sellPrice: holding.currentPrice || '',
      sellDate: dayjs(),
      notes: '',
    });

    const fetchCurrentPrice = async () => {
      setPriceLoading(true);
      try {
        const response = await stocksApi.getCurrentPrice(holding.stockCode, holding.market);
        if (response.data.data) {
          setFormData(prev => ({
            ...prev,
            sellPrice: response.data.data.price || prev.sellPrice,
          }));
        }
      } catch (error) {
        console.error('获取当前价格失败:', error);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchCurrentPrice();
  }, [holding, open]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = '请输入有效的卖出数量';
    } else if (holding && parseFloat(formData.quantity) > holding.quantity) {
      newErrors.quantity = `卖出数量不能超过持仓数量 (${holding.quantity})`;
    }
    
    if (!formData.sellPrice || parseFloat(formData.sellPrice) <= 0) {
      newErrors.sellPrice = '请输入有效的卖出价格';
    }
    
    if (!formData.sellDate) {
      newErrors.sellDate = '请选择卖出日期';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSubmit({
        stockCode: holding.stockCode,
        market: holding.market,
        quantity: parseFloat(formData.quantity),
        sellPrice: parseFloat(formData.sellPrice),
        sellDate: formData.sellDate.format('YYYY-MM-DD'),
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || '卖出失败' });
    } finally {
      setLoading(false);
    }
  };

  const calculateRealizedProfit = () => {
    if (!holding || !formData.quantity || !formData.sellPrice) return null;
    
    const quantity = parseFloat(formData.quantity);
    const sellPrice = parseFloat(formData.sellPrice);
    const avgBuyPrice = holding.avgBuyPrice;
    
    return (sellPrice - avgBuyPrice) * quantity;
  };

  const realizedProfit = calculateRealizedProfit();

  if (!holding) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>卖出持仓</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {holding.stockName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {holding.stockCode} · {holding.market === 'fund' ? '基金' : '股票'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                持仓数量: <strong>{holding.quantity}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均成本: <strong>¥{holding.avgBuyPrice?.toFixed(4)}</strong>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="卖出数量"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              error={!!errors.quantity}
              helperText={errors.quantity}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={() => setFormData({ ...formData, quantity: holding.quantity })}
                    >
                      全部
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="卖出价格"
              type="number"
              value={formData.sellPrice}
              onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
              error={!!errors.sellPrice}
              helperText={errors.sellPrice || (priceLoading ? '正在获取最新价格...' : '')}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
            />

            <DatePicker
              label="卖出日期"
              value={formData.sellDate}
              onChange={(date) => setFormData({ ...formData, sellDate: date })}
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.sellDate,
                  helperText: errors.sellDate,
                },
              }}
            />

            <TextField
              label="备注"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>

          {realizedProfit !== null && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: realizedProfit >= 0 ? 'rgba(211, 47, 47, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                预估已实现盈亏:
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: realizedProfit >= 0 ? 'profit.main' : 'loss.main',
                }}
              >
                {realizedProfit >= 0 ? '+' : ''}¥{realizedProfit.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                = (卖出价 ¥{formData.sellPrice} - 成本价 ¥{holding.avgBuyPrice?.toFixed(4)}) × {formData.quantity}{holding.market === 'fund' ? '份' : '股'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? '处理中...' : '确认卖出'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SellHoldingDialog;
