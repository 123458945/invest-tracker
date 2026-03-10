import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isTradingDay',
})(({ theme, isTradingDay, selected }) => ({
  ...(isTradingDay && !selected && {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(76, 175, 80, 0.08)' 
      : 'rgba(76, 175, 80, 0.16)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(76, 175, 80, 0.16)' 
        : 'rgba(76, 175, 80, 0.24)',
    },
  }),
  ...(!isTradingDay && !selected && {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.04)' 
      : 'rgba(255, 255, 255, 0.04)',
    textDecoration: 'line-through',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(255, 255, 255, 0.08)',
    },
  }),
}));

const CHINESE_HOLIDAYS_2025 = [
  '2025-01-01', '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04',
  '2025-04-04', '2025-04-05', '2025-04-06',
  '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
  '2025-05-31', '2025-06-01', '2025-06-02',
  '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08',
];

const CHINESE_WORKDAYS_2025 = [
  '2025-01-26',
  '2025-02-08',
  '2025-04-27',
  '2025-09-28',
  '2025-10-11',
];

const isWeekendDay = (date) => {
  const day = date.day();
  return day === 0 || day === 6;
};

export const isTradingDay = (date) => {
  if (!date) return false;
  
  const dateStr = date.format('YYYY-MM-DD');
  
  if (CHINESE_HOLIDAYS_2025.includes(dateStr)) {
    return false;
  }
  
  if (CHINESE_WORKDAYS_2025.includes(dateStr)) {
    return true;
  }
  
  return !isWeekendDay(date);
};

export const getTradingDayStatus = (date) => {
  if (!date) return { isTrading: false, reason: '无效日期' };
  
  const dateStr = date.format('YYYY-MM-DD');
  const today = dayjs().startOf('day');
  
  if (date.isAfter(today)) {
    return { isTrading: false, reason: '未来日期无法确定是否为交易日' };
  }
  
  if (CHINESE_HOLIDAYS_2025.includes(dateStr)) {
    return { isTrading: false, reason: '法定节假日' };
  }
  
  if (CHINESE_WORKDAYS_2025.includes(dateStr)) {
    return { isTrading: true, reason: '调休工作日' };
  }
  
  if (isWeekendDay(date)) {
    return { isTrading: false, reason: '周末' };
  }
  
  return { isTrading: true, reason: '正常交易日' };
};

const TradingDayDatePicker = ({ value, onChange, label, error, helperText, disabled, minDate, maxDate }) => {
  const [open, setOpen] = useState(false);

  const renderDay = (day, selectedDays, pickersDayProps) => {
    const dayStart = day.startOf('day');
    const today = dayjs().startOf('day');
    const isFuture = dayStart.isAfter(today);
    const trading = !isFuture && isTradingDay(day);
    
    return (
      <CustomPickersDay
        {...pickersDayProps}
        isTradingDay={trading}
        disabled={pickersDayProps.disabled || isFuture}
      />
    );
  };

  const handleDateChange = (newValue) => {
    if (newValue && !isTradingDay(newValue)) {
      const status = getTradingDayStatus(newValue);
      onChange(newValue, status);
    } else {
      onChange(newValue, null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <DatePicker
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        label={label}
        value={value}
        onChange={handleDateChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate || dayjs()}
        renderDay={renderDay}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText,
            onClick: () => !disabled && setOpen(true),
            InputLabelProps: { shrink: true },
          },
          popper: {
            sx: {
              '& .MuiDateCalendar-root': {
                '& .MuiDayCalendar-header': {
                  '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                  },
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default TradingDayDatePicker;
