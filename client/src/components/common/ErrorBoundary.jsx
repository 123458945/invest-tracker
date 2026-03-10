import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            出错了
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || '发生了未知错误'}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            返回首页
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
