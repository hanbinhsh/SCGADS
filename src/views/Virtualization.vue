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
        <el-menu-item index="denoising">
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
        <el-menu-item index="denoising">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('Visualization.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center animate__animated animate__fadeInRight">
        <el-col :span="20">
          <el-card shadow="always" v-loading="loading">
            <template #header>
              <div slot="header" class="card-header">
                <el-text class="mx-1" size="large"></el-text>
                <span class="page-name">{{ taskName || $t('Visualization.Example') }} {{ $t('Visualization.DataVisualization' )}}</span>
                <el-button type="primary" style="float: right;" @click="SwitchTrueLabel" :disabled="!isUserTask">
                  <font-awesome-icon :icon="['fas', 'shuffle']" />&nbsp;{{ $t('Visualization.Switch') }}&nbsp;
                  <span v-if="trueLabel">{{ $t('Visualization.True') }}</span>
                  <span v-else>{{ $t('Visualization.Pred') }}</span>
                </el-button>
              </div>
            </template>
            <div class="card-body">
              <el-row type="flex" justify="space-between">
                <!-- 图表容器 -->
                <el-col :span="12">
                  <div id="main" class="chart"></div>
                </el-col>
                <!-- 表格和分页容器 -->
                <el-col :span="12">
                  <el-table :data="paginatedData" stripe style="width: 100%;" @sort-change="handleSortChange">
                    <el-table-column prop="index" label="ID" width="70" sortable></el-table-column>
                      <el-table-column prop="coord" :label="$t('Visualization.Position')" sortable>
                        <template #default="{ row }">
                          {{ `(${row.coord[0]}, ${row.coord[1]})` }}
                        </template>
                      </el-table-column>
                    <el-table-column prop="label" :label="$t('Visualization.Label')" width="290" sortable></el-table-column>
                  </el-table>
                  <el-pagination background layout="prev, pager, next" :total="totalItems" :page-size="pageSize"
                    :current-page="currentPage" @current-change="handlePageChange" class="page-control">
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
        <el-button type="primary" class="footer-action-button" @click="" 
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadData') }}
        </el-button>
        <el-button type="warning" class="footer-action-button" @click="download()" 
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadCharts') }}
        </el-button>
        <el-button type="success" class="footer-action-button" @click=""
         :disabled="taskName===undefined">
         {{ $t('Visualization.DownloadReport') }}
        </el-button>
      </div>
    </div>

    <el-dialog v-model="settingVisible" :title="$t('Visualization.Settings')" width="600" align-center>
      <el-form :model="axisSettings" label-width="180px" label-position="left">
        <!-- 放大倍率设置 -->
        <el-form-item :label="$t('Visualization.ChartMagnifyRatio')" class="form-item" style="display: flex; justify-content: space-between; align-items: center;">
          <el-input-number v-model="magnifyRatio" :precision="2" :step="0.5" :max="10" :min="0" style="margin-left: auto;" />
        </el-form-item>

        <!-- X 轴 和 Y 轴 设置 -->
        <el-row :gutter="20">
          <!-- X 轴设置 -->
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><b>X {{ $t('Visualization.AxisSettings') }}</b></template>
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
              <el-form-item :label="$t('Visualization.ShowGridLines')">
                <el-switch v-model="axisSettings.x.showGridLines"></el-switch>
              </el-form-item>
            </el-card>
          </el-col>

          <!-- Y 轴设置 -->
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><b>Y {{ $t('Visualization.AxisSettings') }}</b></template>
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
              <el-form-item :label="$t('Visualization.ShowGridLines')">
                <el-switch v-model="axisSettings.y.showGridLines"></el-switch>
              </el-form-item>
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
  </el-container>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import { initializeChart } from "../assets/example_data/example.js";
import { data } from "../assets/example_data/data.js";
import { labels } from "../assets/example_data/label.js";
import { ElTable, ElTableColumn, ElPagination } from 'element-plus';
import 'element-plus/theme-chalk/el-table.css';
import 'element-plus/theme-chalk/el-pagination.css';
import axios from 'axios';
import { pieces } from "@/assets/example_data/config";
import * as echarts from 'echarts';
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
      trueLabel: false,  // 是否真实标签
      newPieces: false,
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
      }
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
    SwitchTrueLabel(){
      this.trueLabel = !this.trueLabel
      if(this.isUserTask){
        this.downloadResult(this.$route.query.taskName);
      }
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Store sidebar state in localStorage for persistence
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    handleDarkModeChange(newValue){
      initializeChart(newValue, this.newChart, this.axisSettings, this.newData, this.newPieces, this.newLabel);
      this.isDarkMode = newValue;
    },
    conformSettings(){
      this.settingVisible = false
      initializeChart(this.isDarkMode, this.newChart, this.axisSettings, this.newData, this.newPieces, this.newLabel);
      this.applySorting();
    },
    async downloadResult(taskName) {
      try{
        this.loading = true;
        this.taskName = taskName; // 确保 taskName 被赋值
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
        formData3.append('type', 'config_' + (this.trueLabel ? '' : 'pred_') + this.activeTask);
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
        initializeChart(this.isDarkMode, true, this.axisSettings, newData, newPieces, newLabel);
        this.loading = false;
      }catch(e){
        this.resultFailVisible = true;
        console.log(e);
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleTaskSelect(task) {
      this.activeTask = task;
      if(this.isUserTask){
        this.downloadResult(this.$route.query.taskName);
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
    }
  },
  mounted() {
    this.applySorting();
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

    // 初始化图表
    initializeChart(this.isDarkMode, false, this.axisSettings, '', '', '');

    // 加载侧边栏状态
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }

    // 如果有 taskName 参数，调用下载
    if (this.$route.query.taskName) {
      this.downloadResult(this.$route.query.taskName);
      this.isUserTask = true;
    }
  }
};
</script>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; 
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.card-body {
  padding: 20px;
}

.chart {
  width: 700px;
  height: 700px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .fullscreen-section{
    margin-top: 0;
  }
}
</style>