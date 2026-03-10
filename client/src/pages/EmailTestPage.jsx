import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Grid,
  Collapse,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Visibility,
  VisibilityOff,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { emailApi } from '../api/email.api';

const SMTP_SERVICES = [
  { value: 'smtp.qq.com', label: 'QQ邮箱', port: 465 },
  { value: 'smtp.163.com', label: '163邮箱', port: 465 },
  { value: 'smtp.126.com', label: '126邮箱', port: 465 },
  { value: 'smtp.gmail.com', label: 'Gmail', port: 587 },
  { value: 'smtp.outlook.com', label: 'Outlook', port: 587 },
];

const EmailTestPage = () => {
  const [email, setEmail] = useState('123458945@qq.com');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [configResult, setConfigResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [formData, setFormData] = useState({
    service: 'smtp.qq.com',
    port: 465,
    user: '',
    pass: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await emailApi.getConfig();
      if (response.data.success) {
        setConfig(response.data.data);
        setFormData({
          service: response.data.data.service || 'smtp.qq.com',
          port: response.data.data.port || 465,
          user: response.data.data.user || '',
          pass: '',
        });
      }
    } catch (err) {
      console.error('获取配置失败:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setConfigResult(null);
  };

  const handleServiceChange = (service) => {
    const selected = SMTP_SERVICES.find(s => s.value === service);
    setFormData(prev => ({
      ...prev,
      service,
      port: selected?.port || 465,
    }));
    setConfigResult(null);
  };

  const handleSaveConfig = async () => {
    setSaveLoading(true);
    setConfigResult(null);
    
    try {
      const response = await emailApi.saveConfig(formData);
      if (response.data.success) {
        setConfig(response.data.data);
        setConfigResult({ success: true, message: response.data.message || '配置保存成功' });
      }
    } catch (err) {
      setConfigResult({ success: false, message: err.response?.data?.message || '保存失败' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendTest = async (type) => {
    if (!email) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = type === 'simple' 
        ? await emailApi.sendTest(email)
        : await emailApi.sendAlertTest(email);
      
      setResult({
        success: response.data.success,
        message: response.data.message || '发送成功',
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || '发送失败',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        邮件服务设置
      </Typography>

      {configLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setShowConfig(!showConfig)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="action" />
                <Typography variant="h6">邮件服务配置</Typography>
                {config?.configured ? (
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label="已配置" 
                    color="success" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                ) : (
                  <Chip 
                    icon={<ErrorIcon />} 
                    label="未配置" 
                    color="error" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <IconButton size="small">
                {showConfig ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={showConfig}>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="SMTP服务"
                    value={formData.service}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    helperText="选择邮箱服务提供商"
                  >
                    {SMTP_SERVICES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label} ({s.value})
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="端口"
                    type="number"
                    value={formData.port}
                    onChange={(e) => handleFormChange('port', parseInt(e.target.value) || 465)}
                    helperText="SSL通常使用465端口"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="发件邮箱"
                    type="email"
                    value={formData.user}
                    onChange={(e) => handleFormChange('user', e.target.value)}
                    placeholder="your_email@qq.com"
                    helperText="发件人邮箱地址"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="授权码/密码"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.pass}
                    onChange={(e) => handleFormChange('pass', e.target.value)}
                    placeholder="请输入授权码"
                    helperText="QQ邮箱需使用授权码，非登录密码"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>QQ邮箱授权码获取方式：</strong><br />
                  1. 登录QQ邮箱网页版 → 设置 → 账户<br />
                  2. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"<br />
                  3. 开启"POP3/SMTP服务"，按提示获取授权码<br />
                  4. <strong>注意：</strong>必须使用授权码，不能使用QQ登录密码
                </Typography>
              </Alert>

              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>常见错误及解决方法：</strong><br />
                  • <strong>535错误：</strong>通常是授权码错误或未开启SMTP服务<br />
                  • 授权码有16位，注意不要包含空格<br />
                  • 如果多次失败，建议等待10-15分钟后重试<br />
                  • 授权码可以重新生成，旧授权码仍然有效
                </Typography>
              </Alert>

              {configResult && (
                <Alert severity={configResult.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {configResult.message}
                </Alert>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={saveLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSaveConfig}
                  disabled={saveLoading || !formData.user || !formData.pass}
                >
                  保存配置
                </Button>
              </Box>
            </Collapse>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmailIcon color="action" />
              <Typography variant="h6">发送测试邮件</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="收件邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入收件人邮箱"
              disabled={!config?.configured}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={() => handleSendTest('simple')}
                disabled={!config?.configured || !email || loading}
              >
                发送简单测试邮件
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={() => handleSendTest('alert')}
                disabled={!config?.configured || !email || loading}
              >
                发送价格提醒测试邮件
              </Button>
            </Box>

            {result && (
              <Alert severity={result.success ? 'success' : 'error'}>
                {result.message}
              </Alert>
            )}
          </Paper>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                价格提醒测试邮件预览
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" color="primary" gutterBottom>
                  价格提醒通知
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    贵州茅台 (600519)
                  </Typography>
                  <Typography variant="body2">
                    <strong>提醒条件：</strong>价格高于 1800元
                  </Typography>
                  <Typography variant="body2">
                    <strong>当前价格：</strong>¥1850.50
                  </Typography>
                  <Typography variant="body2">
                    <strong>触发时间：</strong>{new Date().toLocaleString('zh-CN')}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  此邮件由 InvestTracker 自动发送，请勿回复。
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default EmailTestPage;
