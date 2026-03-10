import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const StockSearch = ({ onSearch, loading }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }}>
      <TextField
        fullWidth
        placeholder="输入股票代码或名称搜索"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />
    </Paper>
  );
};

export default StockSearch;
