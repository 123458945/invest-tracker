import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { alertsApi } from '../api/alerts.api';
import AlertsList from '../components/alerts/AlertsList';
import AddAlertDialog from '../components/alerts/AddAlertDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, alert: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsApi.getAll();
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (err) {
      setSnackbar({ open: true, message: '获取提醒列表失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAdd = async (data) => {
    try {
      const response = await alertsApi.create(data);
      if (response.data.success) {
        setAlerts([response.data.data, ...alerts]);
        setDialogOpen(false);
        setSnackbar({ open: true, message: '添加提醒成功', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || '添加失败', severity: 'error' });
    }
  };

  const handleToggle = async (alert) => {
    try {
      const response = await alertsApi.update(alert._id, { isActive: !alert.isActive });
      if (response.data.success) {
        setAlerts(alerts.map((a) => (a._id === alert._id ? response.data.data : a)));
        setSnackbar({ open: true, message: alert.isActive ? '已暂停提醒' : '已启用提醒', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '操作失败', severity: 'error' });
    }
  };

  const handleReset = async (alert) => {
    try {
      const response = await alertsApi.reset(alert._id);
      if (response.data.success) {
        setAlerts(alerts.map((a) => (a._id === alert._id ? response.data.data : a)));
        setSnackbar({ open: true, message: '提醒已重置', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '重置失败', severity: 'error' });
    }
  };

  const handleDelete = async (alert) => {
    try {
      const response = await alertsApi.delete(alert._id);
      if (response.data.success) {
        setAlerts(alerts.filter((a) => a._id !== alert._id));
        setConfirmDialog({ open: false, alert: null });
        setSnackbar({ open: true, message: '删除提醒成功', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || '删除失败', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' });
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.isActive && !a.isTriggered).length;
  const triggeredAlertsCount = alerts.filter((a) => a.isTriggered).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            价格提醒
          </Typography>
          {alerts.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              监控中: {activeAlertsCount} | 已触发: {triggeredAlertsCount}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          添加提醒
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
      <AlertsList
        alerts={alerts}
        onToggle={handleToggle}
        onDelete={(alert) => setConfirmDialog({ open: true, alert })}
        onReset={handleReset}
      />
      )}

      <AddAlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAdd}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="确认删除"
        message={`确定要删除 ${confirmDialog.alert?.stockName} (${confirmDialog.alert?.stockCode}) 的价格提醒吗？`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={() => handleDelete(confirmDialog.alert)}
        onCancel={() => setConfirmDialog({ open: false, alert: null })}
        confirmColor="error"
      />

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

export default AlertsPage;
