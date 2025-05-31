<template>
  <el-container class="main-page">
    <MainHeader @darkmodeChanged="handleDarkModeChange"></MainHeader>

    <!-- 桌面端侧边栏 -->
    <el-aside class="sidebar animate__animated animate__fadeInLeft" v-if="!isMobile" :width="isCollapsed ? '64px' : '150px'">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon :class="{ 'rotate-180': isCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>
      
      <el-menu :default-active="activeTask" class="task-menu" @select="handleTaskSelect" mode="vertical" :collapse="isCollapsed">
        <el-menu-item index="tsne">
          <font-awesome-icon :icon="['fas', 'chart-pie']" style="margin-left: 5px;margin-right: 10px;" />
          <span>T-SNE</span>
        </el-menu-item>
        <el-menu-item index="umap">
          <font-awesome-icon :icon="['fas', 'chart-column']" style="margin-left: 5px;margin-right: 10px;" />
          <span>UMAP</span>
        </el-menu-item>
        <el-menu-item index="denoising" :disabled="!((thisTask.type?.split(':')[0] || '') === 'denoising')">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('Visualization.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!-- 移动端侧边栏（顶部水平菜单） -->
    <el-header class="mobile-nav animate__animated animate__fadeInDown" v-if="isMobile">
      <el-menu 
        :default-active="activeTask" 
        class="task-menu" 
        @select="handleTaskSelect"
        mode="horizontal">
        <el-menu-item index="tsne">
          <font-awesome-icon :icon="['fas', 'chart-pie']" style="margin-left: 5px;margin-right: 10px;" />
          <span>T-SNE</span>
        </el-menu-item>
        <el-menu-item index="umap">
          <font-awesome-icon :icon="['fas', 'chart-column']" style="margin-left: 5px;margin-right: 10px;" />
          <span>UMAP</span>
        </el-menu-item>
        <el-menu-item index="denoising" :disabled="!((thisTask.type?.split(':')[0] || '') === 'denoising')">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('Visualization.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center" class="animate__animated animate__fadeInRight">
        <el-col :span="24" :lg="20">
          <el-card shadow="always" v-loading="loading" class="card">
            <template #header>
              <div slot="header" class="card-header">
                <span class="page-name">{{ taskName || $t('Visualization.Example') }} {{ $t('Visualization.DataVisualization' )}}</span>
                <div class="button-group">
                  <el-button type="success" @click="showTrainResult('pretrain')" :loading="pretrainLoading" 
                  v-if="isUserTask&&((thisTask.type?.split(':')[0] || '') === 'training')&&thisTask.rePretrain">
                    <font-awesome-icon :icon="['fas', 'chart-line']" />&nbsp;{{ $t('Visualization.PretrainResult') }}
                  </el-button>
                  <el-button type="info" @click="showTrainResult('train')" :loading="trainLoading" 
                  v-if="isUserTask&&((thisTask.type?.split(':')[0] || '') === 'training')">
                    <font-awesome-icon :icon="['fas', 'chart-area']" />&nbsp;{{ $t('Visualization.TrainResult') }}
                  </el-button>
                  <!-- 切换真实标签 -->
                  <el-button type="primary" @click="SwitchTrueLabel" 
                  v-if="isUserTask&&((thisTask.type?.split(':')[0] || '') === 'training')">
                    <font-awesome-icon :icon="['fas', 'shuffle']" />&nbsp;{{ $t('Visualization.Switch') }}&nbsp;
                    <span v-if="trueLabel">{{ $t('Visualization.Pred') }}</span>
                    <span v-else>{{ $t('Visualization.True') }}</span>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="card-body">
              <!-- Responsive layout for chart and table -->
              <el-row :gutter="20">
                <!-- Chart container - full width on mobile, half on desktop -->
                <el-col :span="24" :lg="12" class="chart-container">
                  <div id="main" class="chart"></div>
                </el-col>
                
                <!-- Table container - full width on mobile, half on desktop -->
                <el-col :span="24" :lg="12" class="table-container">
                  <el-table 
                    :data="paginatedData" 
                    stripe 
                    style="width: 100%;" 
                    @sort-change="handleSortChange"
                    :max-height="isMobile ? '300px' : '640px'">
                    <el-table-column prop="index" label="ID" width="70" sortable></el-table-column>
                    <el-table-column prop="coord" :label="$t('Visualization.Position')" sortable>
                      <template #default="{ row }">
                        {{ `(${row.coord[0].toFixed(4)}, ${row.coord[1].toFixed(4)})` }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="label" :label="$t('Visualization.Label')" :width="isMobile ? '150' : '200'" sortable></el-table-column>
                  </el-table>
                  <el-pagination 
                    background 
                    layout="prev, pager, next" 
                    :total="totalItems" 
                    :page-size="pageSize"
                    :current-page="currentPage" 
                    @current-change="handlePageChange" 
                    class="page-control"
                    :pager-count="isMobile ? 5 : 7">
                  </el-pagination>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <!-- 按钮行 -->
    <div class="footer animate__animated animate__fadeInUp">
      <div class="bottom-left-setting">
        <el-button type="info" class="bottom-left-action-button" @click="settingVisible = true">{{ $t('Visualization.Settings') }}</el-button>
      </div>
      <div class="footer-button-row">
        <el-button type="primary" class="footer-action-button" @click="downloadAllResults()" 
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadData') }}
        </el-button>
        <el-button type="success" class="footer-action-button" @click="download()" 
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadCharts') }}
        </el-button>
        <!-- <el-button type="success" class="footer-action-button" @click=""
         :disabled="taskName===undefined">
         {{ $t('Visualization.DownloadReport') }}
        </el-button> -->
      </div>
    </div>

    <el-dialog 
      v-model="settingVisible" 
      :title="$t('Visualization.Settings')" 
      :width="isMobile ? '90%' : '600px'" 
      align-center
      :fullscreen="isMobile"
      :close-on-click-modal="false">
      <el-form 
        :model="axisSettings" 
        :label-width="isMobile ? '150px' : '180px'" 
        label-position="left">
        
        <!-- 放大倍率设置 -->
        <el-form-item :label="$t('Visualization.ChartMagnifyRatio')" class="form-item" style="display: flex; justify-content: space-between; align-items: center;">
          <el-input-number v-model="magnifyRatio" :precision="2" :step="0.5" :max="10" :min="0" style="margin-left: auto;" />
        </el-form-item>

        <!-- X 轴 和 Y 轴 设置 -->
        <el-row :gutter="isMobile ? 0 : 20">
          <!-- X 轴设置 -->
          <el-col :span="24" :md="12" class="axis-settings-col">
            <el-card shadow="hover" class="axis-card">
              <template #header><b>X {{ $t('Visualization.AxisSettings') }}</b></template>
              <div class="axis-settings-content">
                <el-form-item :label="$t('Visualization.ShowAxis')">
                  <el-switch v-model="axisSettings.x.show"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowTicks')">
                  <el-switch v-model="axisSettings.x.showTicks"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowAxisLine')">
                  <el-switch v-model="axisSettings.x.showAxisLine"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowLabels')">
                  <el-switch v-model="axisSettings.x.showLabels"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowGridLines')" class="last-form-item">
                  <el-switch v-model="axisSettings.x.showGridLines"></el-switch>
                </el-form-item>
              </div>
            </el-card>
          </el-col>

          <!-- Y 轴设置 -->
          <el-col :span="24" :md="12" class="axis-settings-col">
            <el-card shadow="hover" class="axis-card">
              <template #header><b>Y {{ $t('Visualization.AxisSettings') }}</b></template>
              <div class="axis-settings-content">
                <el-form-item :label="$t('Visualization.ShowAxis')">
                  <el-switch v-model="axisSettings.y.show"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowTicks')">
                  <el-switch v-model="axisSettings.y.showTicks"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowAxisLine')">
                  <el-switch v-model="axisSettings.y.showAxisLine"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowLabels')">
                  <el-switch v-model="axisSettings.y.showLabels"></el-switch>
                </el-form-item>
                <el-form-item :label="$t('Visualization.ShowGridLines')" class="last-form-item">
                  <el-switch v-model="axisSettings.y.showGridLines"></el-switch>
                </el-form-item>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="conformSettings()">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务结果文件不存在对话框 -->
    <el-dialog v-model="resultFailVisible" :title="$t('status.Error')" width="500" align-center>
      <span>{{ $t('Visualization.Task') }} <strong style="color: #e74c3c;">{{ taskName }}</strong> {{ $t('Visualization.failLoad') }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="resultFailVisible = false">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="trainResultVisible" 
      :title="trainResultTitle" 
      :width="isMobile ? '95%' : '1000px'" 
      align-center
      :fullscreen="isMobile"
      :close-on-click-modal="false">
      <div id="trainChart" style="width: 100%; height: 500px;"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="trainResultVisible = false">{{ $t('Close') }}</el-button>
          <el-button type="primary" @click="downloadTrainChart()">{{ $t('Visualization.DownloadCharts') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passwordDialogVisible"
      title="权限验证"
      width="30%"
      :before-close="handleDialogClose"
      align-center
    >
      <div>
        <el-input
          v-model="passwordInput"
          type="password"
          placeholder="请输入分享密码或上传者的登录密码"
          show-password
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogCancel">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import { initializeChart } from "../assets/example_data/example.js";
import { data } from "../assets/example_data/data.js";
import { labels } from "../assets/example_data/label.js";
import { ElTable, ElTableColumn, ElPagination, ElMessage } from 'element-plus';
import 'element-plus/theme-chalk/el-table.css';
import 'element-plus/theme-chalk/el-pagination.css';
import axios from 'axios';
import { pieces } from "@/assets/example_data/config";
import * as echarts from 'echarts';
import { markRaw } from 'vue';
export default {
  name: "Virtualization",
  components: {
    MainHeader,
    ElTable,
    ElTableColumn,
    ElPagination
  },
  data() {
    return {
      isCollapsed: false,
      tableData: data.map((coord, index) => ({
        index: index + 1,
        coord,
        label: labels[index] || 'N/A',
      })),
      activeTask: 'tsne',
      pageSize: 15,
      currentPage: 1,
      sortProp: '',
      sortOrder: '',
      paginatedData: [],
      taskName: this.$route.params.taskName,
      isDarkMode: JSON.parse(localStorage.getItem('isDarkMode')) || false,
      activeChart: "tsne",
      loading: false,
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},
      magnifyRatio: 1,
      settingVisible: false,
      resultFailVisible: false,
      newChart: '',
      newData: '',
      newLabel: '',
      isUserTask: false, // 是否是用户的任务而不是示例
      thisTask: {},
      trueLabel: false,  // 是否真实标签
      newPieces: false,
      isMobile: false,
      myChart: null,
      axisSettings: {
        x: {
          show: true, // 是否显示 X 轴
          showTicks: true, // X 轴刻度线
          showAxisLine: true, // X 轴线
          showLabels: true, // X 轴上的文字
          showGridLines: true // X 轴网格线
        },
        y: {
          show: true, // 是否显示 Y 轴
          showTicks: true, // Y 轴刻度线
          showAxisLine: true, // Y 轴线
          showLabels: true, // Y 轴上的文字
          showGridLines: true // Y 轴网格线
        }
      },
      // 训练图表
      trainResultVisible: false,
      trainResultTitle: '',
      pretrainLoading: false,
      trainLoading: false,
      trainChart: null,
      currentTrainData: null,
      currentTrainType: '', // 'pretrain' 或 'train'

      passwordDialogVisible: false,
      passwordInput: '',
      pendingCheck: null,
    };
  },
  computed: {
    totalItems() {
      return this.tableData.length;
    },
  },
  watch: {
    pageSize() {
      this.updatePaginatedData();
    },
    currentPage() {
      this.updatePaginatedData();
    },
    sortProp() {
      this.applySorting();
    },
    sortOrder() {
      this.applySorting();
    },
  },
  methods: {
    async downloadAllResults() {
      try {
        this.loading = true;
        this.taskName = this.$route.query.taskName; // 确保 taskName 被赋值
        console.log(this.taskName);
        if (!this.taskName || !this.userName) {
          throw new Error("The task name or user information is missing");
        }
        // data
        const formData = new URLSearchParams();
        formData.append('taskName', this.taskName);
        formData.append('userName', this.userData.userName);
        
        const response = await fetch(`/api/downloadTask?${formData.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/zip'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${this.taskName}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error("Download error:", error);
        this.$message.error('Download failed: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    async showTrainResult(type) {
      try {
        if (type === 'pretrain') {
          this.pretrainLoading = true;
          this.trainResultTitle = this.$t('Visualization.PretrainResult');
        } else {
          this.trainLoading = true;
          this.trainResultTitle = this.$t('Visualization.TrainResult');
        }
        
        const formData = new FormData();
        formData.append('taskName', this.$route.query.taskName);
        formData.append('type', type === 'pretrain' ? 'pretrainresult' : 'trainresult');
        formData.append('userName', this.userData.userName);
        
        const response = await axios.post('/api/downloadTrainResult', formData);
        
        // 解析训练结果数据
        const trainData = this.parseTrainResult(response.data, type);
        this.currentTrainData = trainData;
        this.currentTrainType = type;
        
        this.trainResultVisible = true;
        
        // 等待对话框渲染完成后初始化图表
        this.$nextTick(() => {
          this.initTrainChart(trainData, type);
        });
        
      } catch (error) {
        console.error('获取训练结果失败:', error);
        this.$message.error(this.$t('Visualization.TrainResultLoadFailed'));
      } finally {
        if (type === 'pretrain') {
          this.pretrainLoading = false;
        } else {
          this.trainLoading = false;
        }
      }
    },
    
    parseTrainResult(data, type) {
      const lines = data.trim().split('\n');
      const headers = lines[0].split('\t').map(h => h.trim()); // 去除空白字符
      const epochs = [];
      const series = {};
      
      // 初始化系列数据
      headers.forEach(header => {
        if (header !== 'Epoch') {
          series[header] = [];
        }
      });
      
      // 解析数据行
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('Best') && !line.startsWith('Early')) {
          const values = line.split('\t').map(v => v.trim()); // 去除空白字符
          if (values.length === headers.length) {
            epochs.push(parseInt(values[0]));
            for (let j = 1; j < headers.length; j++) {
              const value = parseFloat(values[j]);
              if (!isNaN(value)) { // 确保是有效数字
                series[headers[j]].push(value);
              }
            }
          }
        }
      }
      
      return { epochs, series, headers };
    },
    
    initTrainChart(trainData, type) {
      const chartDom = document.getElementById('trainChart');
      if (this.trainChart) {
        this.trainChart.dispose();
      }
      this.trainChart = markRaw(echarts.init(chartDom, this.isDarkMode ? 'dark' : null));
      
      const { epochs, series, headers } = trainData;
      const seriesConfig = [];
      const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452'];
      let colorIndex = 0;
      
      // 分类指标：损失类 vs 准确率/F1类
      const lossMetrics = [];
      const accuracyMetrics = [];
      
      // 为每个指标创建系列并分类
      headers.forEach(header => {
        if (header !== 'Epoch' && series[header]) {
          const isLossMetric = header.toLowerCase().includes('loss');
          const yAxisIndex = isLossMetric ? 0 : 1; // 损失用左轴(0)，准确率/F1用右轴(1)
          
          const seriesItem = {
            name: this.getMetricDisplayName(header),
            type: 'line',
            yAxisIndex: yAxisIndex,
            data: series[header],
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: colors[colorIndex % colors.length]
            },
            showSymbol: true,
            emphasis: {
              focus: 'series'
            },
            // 动画配置
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut'
          };
          
          seriesConfig.push(seriesItem);
          
          if (isLossMetric) {
            lossMetrics.push(header);
          } else {
            accuracyMetrics.push(header);
          }
          
          colorIndex++;
        }
      });
      
      // 构建Y轴配置
      const yAxisConfig = [
        // 左轴 - 损失
        {
          type: type === 'pretrain' ? 'log' : 'value', // 预训练使用对数坐标
          name: this.$t('Visualization.Loss'),
          nameLocation: 'middle',
          nameGap: 50,
          position: 'left',
          axisLabel: {
            color: this.isDarkMode ? '#ffffff' : '#333333',
            formatter: type === 'pretrain' ? '{value}' : '{value}'
          },
          nameTextStyle: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: this.isDarkMode ? '#333333' : '#e0e0e0'
            }
          }
        }
      ];
      
      // 只有当存在准确率/F1指标时才添加右轴
      if (accuracyMetrics.length > 0) {
        yAxisConfig.push({
          type: 'value',
          name: this.$t('Visualization.AccuracyF1'),
          nameLocation: 'middle',
          nameGap: 50,
          position: 'right',
          min: 0,
          max: 1,
          axisLabel: {
            color: this.isDarkMode ? '#ffffff' : '#333333',
            formatter: '{value}'
          },
          nameTextStyle: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          },
          splitLine: {
            show: false // 右轴不显示网格线，避免与左轴冲突
          }
        });
      }
      
      const option = {
        title: {
          text: type === 'pretrain' ? this.$t('Visualization.PretrainResult') : this.$t('Visualization.TrainResult'),
          left: 'center',
          textStyle: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = `Epoch: ${params[0].axisValue}<br/>`;
            params.forEach(param => {
              const value = param.yAxisIndex === 0 ? 
                (type === 'pretrain' ? param.value.toFixed(5) : param.value.toFixed(5)) :
                param.value.toFixed(5);
              result += `${param.marker}${param.seriesName}: ${value}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: seriesConfig.map(s => s.name),
          bottom: 5,
          textStyle: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          }
        },
        grid: {
          left: '15%',
          right: accuracyMetrics.length > 0 ? '15%' : '10%', // 有右轴时增加右边距
          bottom: '20%',
          top: '15%'
        },
        xAxis: {
          type: 'category',
          data: epochs,
          name: 'Epoch',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          },
          nameTextStyle: {
            color: this.isDarkMode ? '#ffffff' : '#333333'
          }
        },
        yAxis: yAxisConfig,
        series: seriesConfig,
        // 全局配置
        animation: true,
        animationDuration: 1000
      };
      
      this.trainChart.setOption(option);
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (this.trainChart) {
          this.trainChart.resize();
        }
      });
    },
    
    getMetricDisplayName(metric) {
      // 去除可能的空白字符并进行匹配
      const cleanMetric = metric.trim();
      const metricMap = {
        'Train Loss': this.$t('Visualization.TrainLoss'),
        'Validation Loss': this.$t('Visualization.ValidationLoss'), 
        'Train Acc': this.$t('Visualization.TrainAccuracy'),
        'Train F1': this.$t('Visualization.TrainF1'),
        'Validation Acc': this.$t('Visualization.ValidationAccuracy'),
        'Validation F1': this.$t('Visualization.ValidationF1')
      };
      
      // 先尝试完全匹配
      if (metricMap[cleanMetric]) {
        return metricMap[cleanMetric];
      }
      
      // 如果没有匹配到，尝试部分匹配
      for (const key in metricMap) {
        if (cleanMetric.includes(key) || key.includes(cleanMetric)) {
          return metricMap[key];
        }
      }
      
      // 都没有匹配到，返回原始值
      return cleanMetric;
    },
    
    downloadTrainChart() {
      if (!this.trainChart) return;
      
      const img = new Image();
      img.src = this.trainChart.getDataURL({
        type: "png",
        pixelRatio: this.magnifyRatio,
        backgroundColor: "#fff",
      });
      
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
    
        const a = document.createElement("a");
        const event = new MouseEvent("click");
        a.download = `train_result_${this.currentTrainType}.png`;
        a.href = dataURL;
        a.dispatchEvent(event);
        a.remove();
      }.bind(this);
    },
    SwitchTrueLabel(){
      this.trueLabel = !this.trueLabel
      if(this.isUserTask){
        this.nextDownload(this.$route.query.taskName);
      }
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Store sidebar state in localStorage for persistence
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    handleDarkModeChange(newValue){
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null;
      }
      this.myChart = initializeChart(newValue, this.newChart, this.axisSettings, this.newData, this.newPieces, this.newLabel, this.isMobile);
      setTimeout(() => {
        if (this.myChart) {this.myChart.resize()};
      }, 10);
      this.isDarkMode = newValue;
    },
    conformSettings(){
      this.settingVisible = false
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null;
      }
      this.myChart = initializeChart(this.isDarkMode, this.newChart, this.axisSettings, this.newData, this.newPieces, this.newLabel, this.isMobile);
      setTimeout(() => {
        if (this.myChart) {this.myChart.resize()};
      }, 10);
      this.applySorting();
    },
    async downloadResult(taskName) {
      this.loading = true;
      this.taskName = taskName; // 确保 taskName 被赋值

      // 如果不是上传任务者或者分享接受者（分为公司分享和用户分享）访问任务，弹框输入上传者用户密码
      // 查询该任务是否属于该用户，或者是否为接收者
      const userId = this.userData.userId

      // 请求后端判断访问权限
      const { data: hasAccess } = await axios.get('/api/checkAccessRight', {
        params: { userId, taskName }
      })

      let access = hasAccess

      if(userId == undefined){
        access = false
      }

      if (!access) {
        this.passwordInput = '';
        this.passwordDialogVisible = true;
        this.pendingCheck = async () => {
          const { data: valid } = await axios.post('/api/checkPassword', null, {
            params: {
              taskName: this.taskName,
              password: this.passwordInput
            }
          });
          if (!valid) {
            ElMessage.error('密码错误，无法访问任务结果');
            return;
          }
          // 成功逻辑：例如允许访问
          ElMessage.success('验证成功，可以访问');
          this.nextDownload(taskName);
        };
      }else{
        this.nextDownload(taskName);
      }
    },
    async nextDownload(taskName){
      try{
        // data
        const formData = new FormData();
        formData.append('taskName', taskName);
        formData.append('type', 'data_' + this.activeTask);
        formData.append('userName', this.userData.userName);
        const response = await axios.post('/api/downloadResult', formData);

        let newData = response.data.replace('export const data = ', '');
        newData = newData.replace(';', '');
        newData = JSON.parse(newData);
      
        // label
        const formData2 = new FormData();
        formData2.append('taskName', taskName);
        formData2.append('type', 'label_' + (this.trueLabel ? '' : 'pred_') + this.activeTask);
        formData2.append('userName', this.userData.userName);
        const response2 = await axios.post('/api/downloadResult', formData2);

        let newLabel = response2.data.replace('export const labels = ', '');
        newLabel = newLabel.replace(';', '');
        newLabel = JSON.parse(newLabel);

        // config
        const formData3 = new FormData();
        formData3.append('taskName', taskName);
        formData3.append('type', 'config_' + (this.trueLabel ? '' : '') + this.activeTask); // pred_ 这里标签和预测的颜色映射应当相同
        formData3.append('userName', this.userData.userName);
        const response3 = await axios.post('/api/downloadResult', formData3);
        const match = response3.data.match(/export const pieces = (.*?);/);

        let newPieces = pieces;

        if (match && match[1]) {
          let piecesString = match[1].trim();
          piecesString = piecesString.replace(/'/g, '"');
          
          newPieces = JSON.parse(piecesString);
          // console.log(pieces); // 打印出 pieces 数组
        } else {
            console.error('未找到 pieces 的内容');
        }

        this.tableData = newData.map((coord, index) => ({
          index: index + 1,
          coord,
          label: newLabel[index] || 'N/A',
        }));

        this.applySorting();
        this.newData = newData;
        this.newPieces = newPieces;
        this.newLabel = newLabel;
        this.newChart = true;
        if (this.myChart) {
          this.myChart.dispose();
          this.myChart = null;
        }
        this.myChart = initializeChart(this.isDarkMode, true, this.axisSettings, newData, newPieces, newLabel, this.isMobile);
        setTimeout(() => {
          if (this.myChart) {this.myChart.resize()};
        }, 10);
        this.loading = false;
      }catch(e){
        this.resultFailVisible = true;
        console.log(e);
      }
    },
    handleDialogConfirm() {
      if (!this.passwordInput.trim()) {
        ElMessage.error('密码不能为空');
        return;
      }
      this.passwordDialogVisible = false;
      this.pendingCheck?.();
    },
    handleDialogCancel() {
      this.passwordDialogVisible = false;
      ElMessage.info('已取消操作');
    },
    handleDialogClose(done) {
      done();
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleTaskSelect(task) {
      this.activeTask = task;
      if(this.isUserTask){
        this.nextDownload(this.$route.query.taskName);
      }else{
        // TODO
      }
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
    },
    applySorting() {
      this.loading = true;
      if (this.sortProp && this.sortOrder) {
        this.tableData.sort((a, b) => {
          const valueA = a[this.sortProp];
          const valueB = b[this.sortProp];
          if (this.sortOrder === 'ascending') {
            return valueA > valueB ? 1 : -1;
          } else if (this.sortOrder === 'descending') {
            return valueA < valueB ? 1 : -1;
          } else {
            return 0;
          }
        });
      }
      this.updatePaginatedData();
      this.loading = false;
    },
    updatePaginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedData = this.tableData.slice(start, end);
    },
    download() {
      const chartDom = document.getElementById('main');
      let myChart1 = echarts.getInstanceByDom(chartDom);
      // 导出单个图表图片
      var img = new Image();
      img.src = myChart1.getDataURL({
        type: "png",
        pixelRatio: this.magnifyRatio, //放大2倍
        backgroundColor: "#fff",
      });
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
    
        var a = document.createElement("a");
        var event = new MouseEvent("click");
        a.download = "pic.png" || "picname";
        // 将生成的URL设置为a.href属性
        a.href = dataURL;
        // 触发a的单击事件
        a.dispatchEvent(event);
        a.remove();
      }
    },
    async findTask(taskName){
      const response = await axios.post('/api/findTaskByTaskName?taskName='+taskName);
      this.thisTask = response.data.data
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      // 先进行销毁
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null;
      }
      // 使用当前的数据状态重新初始化图表
      this.myChart = initializeChart(
        this.isDarkMode, 
        this.newChart || false,  // 保持当前图表状态
        this.axisSettings, 
        this.newData || '',      // 保持当前数据
        this.newPieces || '',    // 保持当前配置
        this.newLabel || '',     // 保持当前标签
        this.isMobile
      );
      setTimeout(() => {
        if (this.myChart) {this.myChart.resize()};
      }, 10);
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);

    this.applySorting();
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
    // 初始化图表
    this.myChart = initializeChart(this.isDarkMode, false, this.axisSettings, '', '', '', this.isMobile);
    setTimeout(() => {
      if (this.myChart) {this.myChart.resize()};
    }, 10);
    window.addEventListener('resize', () => {
      this.myChart.resize();
    });
    // 加载侧边栏状态
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }

    // 如果有 taskName 参数，调用下载
    if (this.$route.query.taskName) {
      // 判断任务类型
      this.findTask(this.$route.query.taskName)
      this.downloadResult(this.$route.query.taskName);
      this.isUserTask = true;
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('resize', () => {
      this.myChart.resize();
    });
    if (this.trainChart) {
      this.trainChart.dispose();
    }
  },
};
</script>

<style scoped>
#main {
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* 防止超出后显示滚动条或内容溢出 */
  box-sizing: border-box; /* 防止 padding/border 导致超宽 */
}

.card-body {
  padding: 20px;
}

.chart-container {
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table-container {
  position: relative;
  padding-bottom: 40px;
}

.el-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.el-pagination {
  margin-top: 10px;
  text-align: right;
}

.page-control {
  bottom: 0;
  right: 0;
  position: absolute;
}

.button-group{
  float: right;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .button-group{
    float: none;
    justify-content: space-between;
    display: flex;
  }

  .card{
    margin-bottom: 200px;
  }

  .fullscreen-section {
    overflow: visible !important; /* 覆盖 el-main 的默认 overflow: auto */
    height: auto !important;
    padding: 10px;
    margin-top: 0px;
    min-height: auto;
  }
  
  .chart {
    height: 300px;
  }
  
  .card-body {
    padding: 10px;
  }
  
  .page-control {
    text-align: center;
    position: static;
    margin-top: 15px;
  }
  
  .chart-container, .table-container {
    padding: 0;
  }
  
  .el-table {
    font-size: 12px;
  }

  .axis-card {
    overflow: hidden;
  }
  
  .axis-settings-content .el-form-item {
    margin-bottom: 5px;
  }

  .el-switch {
    transform: scale(0.9);
    transform-origin: right center;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .chart {
    height: 500px;
  }
}

/* Add these styles for larger screens to maintain your original design */
@media (min-width: 1201px) {
  .chart {
    height: 700px;
  }
}

.axis-settings-col {
  margin-bottom: 15px;
}

.axis-card {
  height: 100%;
}

.axis-settings-content .el-form-item {
  margin-bottom: 10px;
}

.axis-settings-content .last-form-item {
  margin-bottom: 0;
}
</style>