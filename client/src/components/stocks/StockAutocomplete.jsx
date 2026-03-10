import { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Star as StarIcon } from '@mui/icons-material';
import { stocksApi } from '../../api/stocks.api';
import { debounce } from 'lodash';

const ASSET_TYPE_LABELS = {
  stock: '股票',
  fund: '基金',
};

const MARKET_LABELS = {
  sh: '沪',
  sz: '深',
  fund: '基',
};

const StockAutocomplete = ({ 
  value, 
  onChange, 
  label = '搜索股票/基金', 
  placeholder = '输入代码或名称搜索',
  error,
  helperText,
  disabled,
  excludeFunds = false,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const searchStocks = useCallback(
    debounce(async (keyword) => {
      if (!keyword || keyword.length < 1) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await stocksApi.search(keyword);
        if (response.data.success) {
          let results = response.data.data;
          if (excludeFunds) {
            results = results.filter(item => item.assetType !== 'fund');
          }
          setOptions(results);
        }
      } catch (err) {
        console.error('搜索失败:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [excludeFunds]
  );

  useEffect(() => {
    return () => {
      searchStocks.cancel();
    };
  }, [searchStocks]);

  useEffect(() => {
    if (inputValue) {
      searchStocks(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue, searchStocks]);

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return `${option.stockCode} ${option.stockName}`;
  };

  const isOptionEqualToValue = (option, val) => {
    if (typeof val === 'string') return option.stockCode === val;
    return option.stockCode === val?.stockCode && option.market === val?.market;
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const renderOption = (props, option) => {
    const { key, ...otherProps } = props;
    return (
      <li key={key} {...otherProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
          <Chip
            label={option.market === 'fund' ? '基' : (option.market === 'sh' ? '沪' : '深')}
            size="small"
            color={option.market === 'fund' ? 'secondary' : 'primary'}
            sx={{ minWidth: 28, height: 20, fontSize: '0.7rem' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 60 }}>
            {option.stockCode}
          </Typography>
          <Typography variant="body2" sx={{ flex: 1 }} noWrap>
            {option.stockName}
          </Typography>
          {option.currentPrice > 0 && (
            <Typography
              variant="body2"
              sx={{
                color: option.changePercent >= 0 ? 'error.main' : 'success.main',
                minWidth: 60,
                textAlign: 'right',
              }}
            >
              {option.changePercent >= 0 ? '+' : ''}
              {option.changePercent?.toFixed(2)}%
            </Typography>
          )}
          {option.isHeld && (
            <Chip
              icon={<StarIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="已持有"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          )}
        </Box>
      </li>
    );
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      loading={loading}
      disabled={disabled}
      noOptionsText={inputValue ? '未找到相关股票/基金' : '请输入代码或名称搜索'}
      loadingText="搜索中..."
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{
        '& .MuiAutocomplete-option': {
          py: 1,
        },
      }}
    />
  );
};

export default StockAutocomplete;
