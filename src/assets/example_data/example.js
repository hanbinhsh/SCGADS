import * as echarts from 'echarts';
import * as ecStat from 'echarts-stat'; // 导入 echarts-stat 库
import { data } from './data.js'; // 导入数据
import { pieces } from './config.js'; // 导入配置
import { labels } from './label.js'; // 导入标签

export function initializeChart(dark, newChart, newData, newPieces, newLabel) {
  // 确保 labels 变成数值索引
  const labelMap = {};
  (newChart ? newPieces : pieces).forEach((p, i) => {
      labelMap[p.label] = p.value;
  });

  let label = newChart ? newLabel : labels;

  // 处理数据
  const processedData = (newChart ? newData : data).map((point, index) => {
      return [...point, labelMap[label[index]]]; // label 转换为数值
  });

  const option = {
      dataset: [{ source: processedData }],
      tooltip: {
          position: 'top',
          formatter: function (params) {
              const x = params.value[0];
              const y = params.value[1];
              const clusterIndex = params.value[2];

              const clusterLabel = (newChart ? newPieces : pieces).find(p => p.value === clusterIndex)?.label || `Cluster ${clusterIndex}`;

              return `X: ${x}<br>Y: ${y}<br>Cluster: ${clusterLabel}`;
          }
      },
      visualMap: {
          type: 'piecewise',
          top: 'middle',
          left: 10,
          min: 0,
          dimension: 2,
          pieces: (newChart ? newPieces : pieces).map(p => ({
              value: p.value,
              label: p.label
          })),
          inRange: {
              color: (newChart ? newPieces : pieces).map(p => p.color) // 确保颜色映射
          }
      },
      grid: { left: 120 },
      xAxis: {},
      yAxis: {},
      series: {
          type: 'scatter',
          encode: { x: 0, y: 1, tooltip: [0, 1, 2] },
          symbolSize: 5,
          itemStyle: {
              borderColor: '#555'
          },
          datasetIndex: 0
      }
  };

  // 初始化或更新 ECharts
  const chartDom = document.getElementById('main');
  let myChart1 = echarts.getInstanceByDom(chartDom);

  if (myChart1) {
      myChart1.dispose();
  }

  const myChart = echarts.init(chartDom, dark ? 'dark' : null);
  myChart.setOption(option);
}
