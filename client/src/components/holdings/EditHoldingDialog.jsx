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
  Alert,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const EditHoldingDialog = ({ open, onClose, onSubmit, holding }) => {
  const [formData, setFormData] = useState({
    avgBuyPrice: '',
    quantity: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holding) {
      setFormData({
        avgBuyPrice: holding.avgBuyPrice?.toString() || '',
        quantity: holding.quantity?.toString() || '',
        notes: holding.notes || '',
      });
    }
  }, [holding]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    const avgBuyPrice = parseFloat(formData.avgBuyPrice) || 0;
    if (!formData.avgBuyPrice || avgBuyPrice <= 0) {
      newErrors.avgBuyPrice = '买入均价必须大于0';
    }

    const quantity = parseFloat(formData.quantity) || 0;
    if (!formData.quantity || quantity <= 0) {
      newErrors.quantity = '持仓数量必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSubmit({
          avgBuyPrice: parseFloat(formData.avgBuyPrice),
          quantity: parseFloat(formData.quantity),
          notes: formData.notes,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      avgBuyPrice: '',
      quantity: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  if (!holding) return null;

  const oldMarketValue = (holding.avgBuyPrice || 0) * (holding.quantity || 0);
  const newMarketValue = (parseFloat(formData.avgBuyPrice) || 0) * (parseFloat(formData.quantity) || 0);
  const valueChange = newMarketValue - oldMarketValue;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>编辑持仓 - {holding.stockName}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
            修改买入均价会影响已实现盈亏的计算结果
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {holding.stockName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {holding.stockCode} ({holding.market === 'fund' ? '基金' : '股票'})
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      当前价: ¥{(holding.currentPrice || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="caption" color={holding.unrealizedProfit >= 0 ? 'error.main' : 'success.main'}>
                      浮盈: ¥{(holding.unrealizedProfit || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="买入均价"
                name="avgBuyPrice"
                value={formData.avgBuyPrice}
                onChange={handleNumberChange}
                error={!!errors.avgBuyPrice}
                helperText={errors.avgBuyPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="持仓数量"
                name="quantity"
                value={formData.quantity}
                onChange={handleNumberChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{holding.market === 'fund' ? '份' : '股'}</InputAdornment>,
                }}
                inputProps={{ step: holding.market === 'fund' ? 100 : 100, min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="添加备注信息（选填）"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.notes.length}/500`}
              />
            </Grid>

            {valueChange !== 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    成本变化
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: valueChange >= 0 ? 'error.main' : 'success.main'
                    }}
                  >
                    {valueChange >= 0 ? '+' : ''}¥{valueChange.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>取消</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHoldingDialog;
