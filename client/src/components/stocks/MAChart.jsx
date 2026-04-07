import React from 'react';
import ReactECharts from 'echarts-for-react';

const MAChart = ({ data, stockName, loading }) => {
  if (loading) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        加载中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        暂无数据
      </div>
    );
  }

  const dates = data.map(item => item.date);
  const closePrices = data.map(item => item.close);
  const ma5 = data.map(item => item.ma5);
  const ma10 = data.map(item => item.ma10);
  const ma20 = data.map(item => item.ma20);
  const ma60 = data.map(item => item.ma60);

  const option = {
    title: {
      text: stockName ? `${stockName} 均线图` : '均线图',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        if (!params || params.length === 0) return '';

        let result = `<div style="padding: 8px;"><div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        params.forEach(param => {
          if (param.value !== null) {
            result += `<div style="color: ${param.color};">${param.seriesName}: ¥${param.value.toFixed(2)}</div>`;
          }
        });
        result += '</div>';
        return result;
      },
    },
    legend: {
      data: ['收盘价', 'MA5', 'MA10', 'MA20', 'MA60'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '¥{value}'
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        show: true,
        type: 'slider',
        bottom: 10,
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: '收盘价',
        type: 'line',
        data: closePrices,
        symbol: 'none',
        lineStyle: {
          width: 1,
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#f57c00',
        },
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#1976d2',
        },
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#9c27b0',
        },
      },
      {
        name: 'MA60',
        type: 'line',
        data: ma60,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#009688',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px' }} />;
};

export default MAChart;
