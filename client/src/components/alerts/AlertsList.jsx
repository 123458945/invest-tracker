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
  Typography,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  NotificationsActive,
  NotificationsOff,
} from '@mui/icons-material';
import { format } from 'date-fns';

const ALERT_TYPE_LABELS = {
  price_above: '价格高于',
  price_below: '价格低于',
  change_above: '涨幅高于',
  change_below: '跌幅低于',
  ma5_above: '价格上穿MA5',
  ma5_below: '价格下破MA5',
  ma10_above: '价格上穿MA10',
  ma10_below: '价格下破MA10',
  ma20_above: '价格上穿MA20',
  ma20_below: '价格下破MA20',
  ma60_above: '价格上穿MA60',
  ma60_below: '价格下破MA60',
};

const MA_ALERT_TYPES = ['ma5_above', 'ma5_below', 'ma10_above', 'ma10_below', 'ma20_above', 'ma20_below', 'ma60_above', 'ma60_below'];

const AlertsList = ({ alerts, onToggle, onDelete, onReset }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value || 0);
  };

  const getAlertDescription = (alert) => {
    const typeLabel = ALERT_TYPE_LABELS[alert.alertType] || alert.alertType;
    
    if (MA_ALERT_TYPES.includes(alert.alertType)) {
      return typeLabel;
    }
    
    const unit = alert.alertType.includes('change') ? '%' : '元';
    return `${typeLabel} ${alert.targetValue}${unit}`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>股票代码</TableCell>
            <TableCell>股票名称</TableCell>
            <TableCell>提醒条件</TableCell>
            <TableCell align="right">当前价格</TableCell>
            <TableCell align="center">状态</TableCell>
            <TableCell align="center">启用</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  暂无价格提醒
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            alerts.map((alert) => (
              <TableRow key={alert._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {alert.stockCode}
                  </Typography>
                </TableCell>
                <TableCell>{alert.stockName}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getAlertDescription(alert)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(alert.currentPrice)}
                </TableCell>
                <TableCell align="center">
                  {alert.isTriggered ? (
                    <Chip
                      icon={<NotificationsActive />}
                      label="已触发"
                      color="warning"
                      size="small"
                    />
                  ) : alert.isActive ? (
                    <Chip
                      icon={<NotificationsActive />}
                      label="监控中"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<NotificationsOff />}
                      label="已暂停"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={alert.isActive}
                    onChange={() => onToggle(alert)}
                    size="small"
                    disabled={alert.isTriggered}
                  />
                </TableCell>
                <TableCell align="center">
                  {alert.isTriggered && (
                    <Tooltip title="重置提醒">
                      <IconButton
                        size="small"
                        onClick={() => onReset(alert)}
                        color="primary"
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="删除提醒">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(alert)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AlertsList;
