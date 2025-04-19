import * as echarts from 'echarts';
import { data } from './data.js';
import { pieces } from './config.js';
import { labels } from './label.js';

export function initializeChart(dark, newChart, axisSettings, newData, newPieces, newLabel, isMobile = false) {
  const chartDom = document.getElementById('main');
  let myChart1 = echarts.getInstanceByDom(chartDom);
  if (myChart1) {
    myChart1.dispose();
  }

  const myChart = echarts.init(chartDom, false);

  const rawData = newChart ? newData : data;
  const rawLabel = newChart ? newLabel : labels;
  const rawPieces = newChart ? newPieces : pieces;

  const labelMap = {};
  rawPieces.forEach((p) => {
    labelMap[p.label] = p.value;
  });

  // 构造 seriesMap：每种 label 一组数据点
  const seriesMap = {};
  rawData.forEach((point, index) => {
    const labelIndex = labelMap[rawLabel[index]];
    const piece = rawPieces.find(p => p.value === labelIndex);
    const labelName = piece?.label || `Type ${labelIndex}`;

    if (!seriesMap[labelName]) {
      seriesMap[labelName] = {
        data: [],
        color: piece?.color || '#000000'
      };
    }
    seriesMap[labelName].data.push(point);
  });

  // 构建 series 数组
  const series = Object.entries(seriesMap).map(([labelName, info]) => ({
    name: labelName,
    type: 'scatter',
    data: info.data,
    symbolSize: 5,
    itemStyle: {
      color: info.color,
      borderColor: '#555'
    },
    tooltip: {
      formatter: function (params) {
        const [x, y] = params.value;
        return `X: ${x}<br>Y: ${y}<br>Type: ${labelName}`;
      }
    }
  }));

  const option = {
    tooltip: { trigger: 'item' },
    legend: {
      type: isMobile ? 'scroll' : 'plain',
      orient: isMobile ? 'horizontal' : 'vertical',
      left: isMobile ? '5%' : '20px',   // ✅ 手机：整体居中；桌面：稍右移
      right: isMobile ? '5%' : undefined,
      top: isMobile ? 'bottom' : 'center',
      width: isMobile ? '85%' : undefined,
      itemWidth: isMobile ? 15 : 25,
      itemHeight: isMobile ? 10 : 14,
      itemGap: isMobile ? 5 : 10,
      pageButtonItemGap: 5,
      pageButtonGap: 5,
      pageButtonPosition: 'end',
      textStyle: {
        fontSize: isMobile ? 10 : 12,
        overflow: 'truncate',
        color: dark ? '#ffffff' : '#000000'
      }
    },    
    grid: {
      top: isMobile ? 15 : 50,
      bottom: isMobile ? 30 : 50,
      left: isMobile ? 10 : 100,
      right: isMobile ? 15 : 50,
      containLabel: true
    },
    title: {
      show: false
    },
    xAxis: {
      show: axisSettings.x.show,
      axisTick: { show: axisSettings.x.showTicks },
      axisLine: { show: axisSettings.x.showAxisLine },
      axisLabel: { show: axisSettings.x.showLabels },
      splitLine: { show: axisSettings.x.showGridLines }
    },
    
    yAxis: {
      show: axisSettings.y.show,
      axisTick: { show: axisSettings.y.showTicks },
      axisLine: { show: axisSettings.y.showAxisLine },
      axisLabel: { show: axisSettings.y.showLabels },
      splitLine: { show: axisSettings.y.showGridLines }
    },
    series: series
  };

  myChart.setOption(option);

  return myChart;
}