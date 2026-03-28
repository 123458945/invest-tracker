import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, History as HistoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { holdingsApi } from '../api/holdings.api';
import { stocksApi } from '../api/stocks.api';
import HoldingsList from '../components/holdings/HoldingsList';
import AddHoldingDialog from '../components/holdings/AddHoldingDialog';
import EditHoldingDialog from '../components/holdings/EditHoldingDialog';
import SellHoldingDialog from '../components/holdings/SellHoldingDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const HoldingsPage = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, holding: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const response = await holdingsApi.getAll();
      if (response.data.success) {
        setHoldings(response.data.data);
      }
    } catch (err) {
      setError('获取持仓列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const handleAdd = async (data) => {
    try {
      const response = await holdingsApi.create(data);
      if (response.data.success) {
        // 添加成功后自动更新价格
        try {
          await stocksApi.updateHoldings();
        } catch (updateErr) {
          console.error('自动更新价格失败:', updateErr);
        }
        await fetchHoldings();
        setDialogOpen(false);
        setSnackbar({ open: true, message: '添加持仓成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '添加失败', severity: 'error' });
    }
  };

  const handleSell = async (data) => {
    try {
      const response = await holdingsApi.sell(data);
      if (response.data.success) {
        await fetchHoldings();
        setSellDialogOpen(false);
        setSelectedHolding(null);
        const result = response.data.data;
        setSnackbar({ 
          open: true, 
          message: `卖出成功！已实现盈亏: ¥${(result.realizedProfit ?? 0).toFixed(2)}`,
          severity: 'success' 
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '卖出失败', severity: 'error' });
    }
  };

  const handleDelete = async (holding) => {
    try {
      await holdingsApi.delete(holding._id);
      setHoldings(holdings.filter((h) => h._id !== holding._id));
      setConfirmDialog({ open: false, holding: null });
      setSnackbar({ open: true, message: '删除持仓成功', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '删除失败', severity: 'error' });
    }
  };

  const handleEdit = (holding) => {
    setSelectedHolding(holding);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      const response = await holdingsApi.update(selectedHolding._id, data);
      if (response.data.success) {
        await fetchHoldings();
        setEditDialogOpen(false);
        setSelectedHolding(null);
        setSnackbar({ open: true, message: '编辑持仓成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '编辑失败', severity: 'error' });
    }
  };

  const handleOpenSellDialog = (holding) => {
    setSelectedHolding(holding);
    setSellDialogOpen(true);
  };

  const handleUpdatePrices = async () => {
    try {
      setUpdating(true);
      const response = await stocksApi.updateHoldings();
      if (response.data.success) {
        await fetchHoldings();
        setSnackbar({ open: true, message: '持仓价格更新成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '更新失败', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0);
  const totalUnrealizedProfit = holdings.reduce((sum, h) => sum + (h.unrealizedProfit || 0), 0);
  const totalRealizedProfit = holdings.reduce((sum, h) => sum + (h.realizedProfit || 0), 0);
  const totalProfit = totalUnrealizedProfit + totalRealizedProfit;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          持仓管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/transactions')}
          >
            交易记录
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleUpdatePrices}
            disabled={updating || holdings.length === 0}
          >
            {updating ? '更新中...' : '更新价格'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            添加持仓
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {holdings.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                总市值
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ¥{totalMarketValue.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                未实现盈亏
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: totalUnrealizedProfit >= 0 ? 'profit.main' : 'loss.main'
                }}
              >
                {totalUnrealizedProfit >= 0 ? '+' : ''}¥{totalUnrealizedProfit.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                已实现盈亏
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: totalRealizedProfit >= 0 ? 'profit.main' : 'loss.main'
                }}
              >
                {totalRealizedProfit >= 0 ? '+' : ''}¥{totalRealizedProfit.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                总盈亏
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: totalProfit >= 0 ? 'profit.main' : 'loss.main'
                }}
              >
                {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <HoldingsList
        holdings={holdings}
        onEdit={handleEdit}
        onDelete={(holding) => setConfirmDialog({ open: true, holding })}
        onSell={handleOpenSellDialog}
      />

      <AddHoldingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAdd}
      />

      <EditHoldingDialog
        open={editDialogOpen}
        holding={selectedHolding}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedHolding(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <SellHoldingDialog
        open={sellDialogOpen}
        holding={selectedHolding}
        onClose={() => {
          setSellDialogOpen(false);
          setSelectedHolding(null);
        }}
        onSubmit={handleSell}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="确认删除"
        message={`确定要删除 ${confirmDialog.holding?.stockName} (${confirmDialog.holding?.stockCode}) 的持仓吗？`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={() => handleDelete(confirmDialog.holding)}
        onCancel={() => setConfirmDialog({ open: false, holding: null })}
        confirmColor="error"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HoldingsPage;
