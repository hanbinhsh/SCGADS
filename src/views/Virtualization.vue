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
        <el-menu-item index="denoising" :disabled="!((type?.split(':')[0] || '') === 'denoising')">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('Visualization.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 移动端侧边栏开关 -->
    <div class="mobile-sidebar-toggle" v-if="isMobile" @click="toggleSidebar">
      <el-icon>
        <Menu />
      </el-icon>
    </div>

    <!-- 移动端侧边栏 -->
    <el-aside 
      class="mobile-sidebar"
      :class="{ 'active': mobileSidebarVisible }"
      v-show="isMobile"
      @click.self="mobileSidebarVisible = false">
      <el-menu 
        :default-active="activeTask" 
        class="task-menu" 
        @select="handleTaskSelect"
        mode="vertical">
        <el-menu-item index="tsne">
          <font-awesome-icon :icon="['fas', 'chart-pie']" style="margin-right: 10px;" />
          <span>T-SNE</span>
        </el-menu-item>
        <el-menu-item index="umap">
          <font-awesome-icon :icon="['fas', 'chart-column']" style="margin-right: 10px;" />
          <span>UMAP</span>
        </el-menu-item>
        <el-menu-item index="denoising" :disabled="!((type?.split(':')[0] || '') === 'denoising')">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-right: 10px;" />
          <span>{{ $t('Visualization.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center animate__animated animate__fadeInRight">
        <el-col :span="20">
          <el-card shadow="always" v-loading="loading">
            <template #header>
              <div class="card-header">
                <span class="page-name">{{ taskName || $t('Visualization.Example') }} {{ $t('Visualization.DataVisualization' )}}</span>
                <el-button type="primary" style="float: right;" @click="SwitchTrueLabel" :disabled="!isUserTask||!((type?.split(':')[0] || '') === 'training')">
                  <font-awesome-icon :icon="['fas', 'shuffle']" />&nbsp;{{ $t('Visualization.Switch') }}&nbsp;
                  <span v-if="trueLabel">{{ $t('Visualization.Pred') }}</span>
                  <span v-else>{{ $t('Visualization.True') }}</span>
                </el-button>
              </div>
            </template>
            <div class="card-body">
              <el-row type="flex" :class="{'mobile-column': isMobile}">
                <el-col :xs="24" :sm="24" :md="12" class="scrollable-container">
                  <div id="main" class="chart"></div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" class="scrollable-container">
                  <el-table :data="paginatedData" stripe style="width: 100%;" @sort-change="handleSortChange">
                    <el-table-column prop="index" label="ID" width="70" sortable></el-table-column>
                    <el-table-column prop="coord" :label="$t('Visualization.Position')" sortable>
                      <template #default="{ row }">
                        {{ `(${row.coord[0].toFixed(4)}, ${row.coord[1].toFixed(4)})` }}
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

    <!-- 移动端底部触发按钮 -->
    <div v-if="isMobile" 
         class="mobile-footer-trigger"
         @click.stop="toggleFooterButtons">
      <el-icon :size="24">
        <component :is="showFooterButtons ? 'Close' : 'Plus'" />
      </el-icon>
    </div>

    <!-- 底部菜单 -->
    <div class="footer animate__animated animate__fadeInUp" :class="{ 'active': showFooterButtons }">
      <div class="bottom-left-setting">
        <el-button type="info" class="bottom-left-action-button" @click="settingVisible = true">
          {{ $t('Visualization.Settings') }}
        </el-button>
      </div>
      <div class="footer-button-column">
        <el-button type="primary" class="footer-action-button" 
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadData') }}
        </el-button>
        <el-button type="warning" class="footer-action-button"
          :disabled="taskName===undefined" @click="download">
          {{ $t('Visualization.DownloadCharts') }}
        </el-button>
        <el-button type="success" class="footer-action-button"
          :disabled="taskName===undefined">
          {{ $t('Visualization.DownloadReport') }}
        </el-button>
      </div>
    </div>

    <el-dialog 
      v-model="settingVisible" 
      :title="$t('Visualization.Settings')" 
      width="600" 
      append-to-body
      :modal="false"
      align-center
      class="settings-dialog"
      @click.stop>
      <el-form :model="axisSettings" label-position="left">
        <el-form-item :label="$t('Visualization.ChartMagnifyRatio')" class="form-item">
          <el-input-number v-model="magnifyRatio" :precision="2" :step="0.5" :max="10" :min="0" class="magnify-ratio-input"/>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24">
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

          <el-col :xs="24" :sm="24" :md="24">
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

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="conformSettings()">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

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
import { ArrowLeft, Menu, Close, Plus } from '@element-plus/icons-vue';

export default {
  name: "Virtualization",
  components: {
    MainHeader,
    ElTable,
    ElTableColumn,
    ElPagination,
    ArrowLeft,
    Menu,
    Close,
    Plus
  },
  data() {
    return {
      isCollapsed: false,
      mobileSidebarVisible: false,
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
      loading: false,
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},
      magnifyRatio: 1,
      settingVisible: false,
      resultFailVisible: false,
      newChart: '',
      newData: '',
      newLabel: '',
      isUserTask: false,
      type: 'annotation',
      trueLabel: false,
      newPieces: false,
      axisSettings: {
        x: {
          show: true,
          showTicks: true,
          showAxisLine: true,
          showLabels: true,
          showGridLines: true
        },
        y: {
          show: true,
          showTicks: true,
          showAxisLine: true,
          showLabels: true,
          showGridLines: true
        }
      },
      clickOutsideHandler: null,
      showFooterButtons: false,
      clickOutsideFooterHandler: null,
      isMobile: false
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
    mobileSidebarVisible(newVal) {
      if (newVal) {
        this.clickOutsideHandler = (e) => {
          if (!this.$el.querySelector('.mobile-sidebar').contains(e.target) && 
              !this.$el.querySelector('.mobile-sidebar-toggle').contains(e.target)) {
            this.mobileSidebarVisible = false;
          }
        };
        document.addEventListener('click', this.clickOutsideHandler);
      } else {
        document.removeEventListener('click', this.clickOutsideHandler);
      }
    },
    showFooterButtons(newVal) {
      if (newVal) {
        this.clickOutsideFooterHandler = (e) => {
          const footer = this.$el.querySelector('.footer');
          const trigger = this.$el.querySelector('.mobile-footer-trigger');
          if (footer && trigger && !footer.contains(e.target) && !trigger.contains(e.target)) {
            this.showFooterButtons = false;
          }
        };
        document.addEventListener('click', this.clickOutsideFooterHandler, { passive: true });
      } else {
        document.removeEventListener('click', this.clickOutsideFooterHandler);
      }
    }
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    SwitchTrueLabel(){
      this.trueLabel = !this.trueLabel
      if(this.isUserTask){
        this.downloadResult(this.$route.query.taskName);
      }
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.mobileSidebarVisible = !this.mobileSidebarVisible;
      } else {
        this.isCollapsed = !this.isCollapsed;
      }
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    toggleFooterButtons() {
      if (this.loading) return;
      this.showFooterButtons = !this.showFooterButtons;
      this.$nextTick(() => {
        if (this.showFooterButtons) {
          const footer = this.$el.querySelector('.footer');
          footer && footer.classList.add('active');
        }
      });
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
        this.taskName = taskName;
        const formData = new FormData();
        formData.append('taskName', taskName);
        formData.append('type', 'data_' + this.activeTask);
        formData.append('userName', this.userData.userName);
        const response = await axios.post('/api/downloadResult', formData);

        let newData = response.data.replace('export const data = ', '');
        newData = newData.replace(';', '');
        newData = JSON.parse(newData);
      
        const formData2 = new FormData();
        formData2.append('taskName', taskName);
        formData2.append('type', 'label_' + (this.trueLabel ? '' : 'pred_') + this.activeTask);
        formData2.append('userName', this.userData.userName);
        const response2 = await axios.post('/api/downloadResult', formData2);

        let newLabel = response2.data.replace('export const labels = ', '');
        newLabel = newLabel.replace(';', '');
        newLabel = JSON.parse(newLabel);

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
      var img = new Image();
      img.src = myChart1.getDataURL({
        type: "png",
        pixelRatio: this.magnifyRatio,
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
        a.download = "pic.png";
        a.href = dataURL;
        a.dispatchEvent(event);
        a.remove();
      }
    },
    async findTaskType(taskName){
      const response = await axios.post('/api/findTaskByTaskName?taskName='+taskName);
      this.type = response.data.type
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    this.applySorting();
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
    initializeChart(this.isDarkMode, false, this.axisSettings, '', '', '');
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
    if (this.$route.query.taskName) {
      this.findTaskType(this.$route.query.taskName)
      this.downloadResult(this.$route.query.taskName);
      this.isUserTask = true;
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    document.removeEventListener('click', this.clickOutsideHandler);
    document.removeEventListener('click', this.clickOutsideFooterHandler);
  }
};
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
  position: relative;
  margin: 20px 0 100px;
  padding-bottom: 20px;
}

.sidebar {
  transition: width 0.3s;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.settings-dialog {
  z-index: 3000 !important;
}

.el-card {
  margin-bottom: 15px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fullscreen-section {
    margin-top: 0;
    padding: 10px;
  }

  .el-col-20 {
    width: 100%;
    max-width: 100%;
  }

  .scrollable-container {
    overflow-x: auto;
    padding: 10px 0;
    margin-bottom: 20px;
  }

  .chart {
    width: 600px;
    min-width: 600px;
    height: 600px;
  }

  .el-table {
    min-width: 600px;
  }

  .mobile-column {
    flex-direction: column;
  }

  .mobile-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 260px !important;
    z-index: 2500;
    background: var(--el-bg-color);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  }

  .mobile-sidebar.active {
    transform: translateX(0);
  }

  .mobile-sidebar-toggle {
    position: fixed;
    left: 15px;
    top: 15px;
    z-index: 3000;
    padding: 12px;
    background: var(--el-color-primary);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-sidebar-toggle:hover {
    transform: scale(1.05);
  }

  .mobile-sidebar::after {
    content: "";
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 260px;
    background: rgba(0,0,0,0.3);
    z-index: -1;
  }

  .footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    padding: 15px;
    background: var(--el-bg-color);
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transform: translateY(100%);
    visibility: hidden;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                visibility 0.2s;
  }

  .footer.active {
    transform: translateY(0);
    visibility: visible;
  }

  .el-main {
    padding-bottom: 80px !important;
  }

  .footer-button-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-footer-trigger {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2500;
    background: var(--el-color-primary);
    color: white;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s ease;
    touch-action: manipulation;
  }

  .mobile-footer-trigger:hover {
    transform: scale(1.1);
  }

  .form-item {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .magnify-ratio-input {
    width: 100%;
    margin-top: 8px;
  }

  .settings-dialog {
    width: 90% !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2001 !important;
  }

  .el-form-item__label {
    width: 100% !important;
    text-align: left;
    padding-bottom: 8px;
  }
}
</style>