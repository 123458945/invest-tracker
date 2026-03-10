import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';

const COLORS = [
  '#1976d2',
  '#2e7d32',
  '#ed6c02',
  '#9c27b0',
  '#d32f2f',
  '#0288d1',
  '#7b1fa2',
  '#f57c00',
];

const AssetAllocationChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography color="text.secondary">加载中...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography color="text.secondary">添加持仓后将显示资产配置图表</Typography>
      </Box>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: COLORS[index % COLORS.length],
    },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>市值: ¥${params.value.toFixed(2)}<br/>占比: ${params.percent.toFixed(2)}%`;
      },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: (name) => {
        const item = data.find(d => d.name === name);
        if (item) {
          return `${name} (${item.percentage.toFixed(1)}%)`;
        }
        return name;
      },
    },
    series: [
      {
        name: '资产配置',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      opts={{ renderer: 'svg' }}
    />
  );
};

export default AssetAllocationChart;
