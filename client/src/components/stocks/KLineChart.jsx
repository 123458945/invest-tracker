import React from 'react';
import ReactECharts from 'echarts-for-react';

const KLineChart = ({ data, stockName, loading }) => {
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

  const kData = data.map(item => [
    item.date,
    item.open,
    item.close,
    item.low,
    item.high,
    item.volume,
  ]);

  const dates = data.map(item => item.date);

  const option = {
    title: {
      text: stockName ? `${stockName} K线图` : 'K线图',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: function (params) {
        const kLine = params[0];
        const volume = params[1];
        if (!kLine || !volume) return '';

        const values = kLine.data;
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px;">${values[0]}</div>
            <div>开盘: ¥${values[1].toFixed(2)}</div>
            <div>收盘: ¥${values[2].toFixed(2)}</div>
            <div>最低: ¥${values[3].toFixed(2)}</div>
            <div>最高: ¥${values[4].toFixed(2)}</div>
            <div>成交量: ${(values[5] / 10000).toFixed(2)}万手</div>
          </div>
        `;
      },
    },
    grid: [
      {
        left: '10%',
        right: '10%',
        top: '15%',
        height: '50%',
      },
      {
        left: '10%',
        right: '10%',
        top: '70%',
        height: '15%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
        axisLabel: {
          formatter: '¥{value}'
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: 10,
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: '日K',
        type: 'candlestick',
        data: kData,
        itemStyle: {
          color: '#d32f2f',
          color0: '#2e7d32',
          borderColor: '#d32f2f',
          borderColor0: '#2e7d32',
        },
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.map(item => ({
          value: item.volume,
          itemStyle: {
            color: item.close >= item.open ? '#d32f2f' : '#2e7d32',
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px' }} />;
};

export default KLineChart;
