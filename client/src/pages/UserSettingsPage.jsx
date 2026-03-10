import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  Lock,
  Email,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserSettingsPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 修改密码状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // 个人信息状态
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordErrors({ ...passwordErrors, [name]: '' });
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = '新密码至少6位';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (validatePassword()) {
      setLoading(true);
      try {
        // 这里应该调用修改密码的 API
        // const response = await authApi.changePassword(passwordForm);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟 API 调用

        setSnackbar({
          open: true,
          message: '密码修改成功',
          severity: 'success',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || '密码修改失败',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 这里应该调用更新个人信息的 API
      // const response = await authApi.updateProfile(profileForm);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟 API 调用

      setSnackbar({
        open: true,
        message: '个人信息更新成功',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || '更新失败',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        用户设置
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Person />} label="个人信息" />
          <Tab icon={<Lock />} label="修改密码" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  disabled
                  helperText="用户名暂时不可修改"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="邮箱"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  disabled
                  helperText="邮箱暂时不可修改"
                  InputProps={{
                    endAdornment: <Email sx={{ mr: 1, color: 'action.disabled' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : '保存更改'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            为了安全起见，修改密码需要输入当前密码进行验证
          </Alert>

          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="当前密码"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="新密码"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword || '密码至少6位'}
                  disabled={loading}
                  inputProps={{ minLength: 6 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="确认新密码"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : '修改密码'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </TabPanel>

      {/* 简单的 Snackbar 组件 */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default UserSettingsPage;
