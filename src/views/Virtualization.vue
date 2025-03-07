<template>
  <el-container class="main-page">
    <MainHeader @darkmodeChanged="handleDarkModeChange"></MainHeader>
    <!-- 侧边栏 -->
    <el-aside class="sidebar animate__animated animate__fadeInLeft">
      <el-menu :default-active="activeChart" class="chart-menu" @select="handleChartSelect">
        <el-menu-item index="tsne">
          <font-awesome-icon :icon="['fas', 'chart-pie']" style="margin-left: 5px;margin-right: 10px;" />
          <span>T-SNE</span>
        </el-menu-item>
        <el-menu-item index="a">
          <font-awesome-icon :icon="['fas', 'chart-column']" style="margin-left: 5px;margin-right: 10px;" />
          <span>Lock</span>
        </el-menu-item>
        <el-menu-item index="b">
          <font-awesome-icon :icon="['fas', 'chart-area']" style="margin-left: 5px;margin-right: 10px;" />
          <span>Lock</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center animate__animated animate__fadeInRight">
        <el-col :span="20">
          <el-card shadow="always" v-loading="loading">
            <template #header>
              <div slot="header" class="card-header">
                <el-text class="mx-1" size="large"></el-text>
                <span class="page-name">{{ taskName || "Example" }} Data Visualization</span>
                <!-- <el-button type="primary" style="float: right;" @click="download()">Download</el-button> -->
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
                      <el-table-column prop="coord" label="Position" sortable>
                        <template #default="{ row }">
                          {{ `(${row.coord[0]}, ${row.coord[1]})` }}
                        </template>
                      </el-table-column>
                    <el-table-column prop="label" label="Label" width="290" sortable></el-table-column>
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
        <el-button type="info" class="bottom-left-action-button" @click="settingVisible = true">Settings</el-button>
      </div>
      <div class="footer-button-row">
        <el-button type="primary" class="footer-action-button" @click="" 
          :disabled="taskName===undefined">
          Download Data
        </el-button>
        <el-button type="warning" class="footer-action-button" @click="download()" 
          :disabled="taskName===undefined">
          Download Charts
        </el-button>
        <el-button type="success" class="footer-action-button" @click=""
         :disabled="taskName===undefined">
          Download Report
        </el-button>
      </div>
    </div>

    <el-dialog v-model="settingVisible" title="Download Settings" width="600" align-center>
      <el-form :model="axisSettings" label-width="180px" label-position="left">
        <!-- 放大倍率设置 -->
        <el-form-item label="Chart Magnify Ratio" class="form-item" style="display: flex; justify-content: space-between; align-items: center;">
          <el-input-number v-model="magnifyRatio" :precision="2" :step="0.5" :max="10" :min="0" style="margin-left: auto;" />
        </el-form-item>

        <!-- X 轴 和 Y 轴 设置 -->
        <el-row :gutter="20">
          <!-- X 轴设置 -->
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><b>X Axis Settings</b></template>
              <el-form-item label="Show Axis">
                <el-switch v-model="axisSettings.x.show"></el-switch>
              </el-form-item>
              <el-form-item label="Show Ticks">
                <el-switch v-model="axisSettings.x.showTicks"></el-switch>
              </el-form-item>
              <el-form-item label="Show Axis Line">
                <el-switch v-model="axisSettings.x.showAxisLine"></el-switch>
              </el-form-item>
              <el-form-item label="Show Labels">
                <el-switch v-model="axisSettings.x.showLabels"></el-switch>
              </el-form-item>
              <el-form-item label="Show Grid Lines">
                <el-switch v-model="axisSettings.x.showGridLines"></el-switch>
              </el-form-item>
            </el-card>
          </el-col>

          <!-- Y 轴设置 -->
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><b>Y Axis Settings</b></template>
              <el-form-item label="Show Axis">
                <el-switch v-model="axisSettings.y.show"></el-switch>
              </el-form-item>
              <el-form-item label="Show Ticks">
                <el-switch v-model="axisSettings.y.showTicks"></el-switch>
              </el-form-item>
              <el-form-item label="Show Axis Line">
                <el-switch v-model="axisSettings.y.showAxisLine"></el-switch>
              </el-form-item>
              <el-form-item label="Show Labels">
                <el-switch v-model="axisSettings.y.showLabels"></el-switch>
              </el-form-item>
              <el-form-item label="Show Grid Lines">
                <el-switch v-model="axisSettings.y.showGridLines"></el-switch>
              </el-form-item>
            </el-card>
          </el-col>
        </el-row>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="conformSettings()">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务结果文件不存在对话框 -->
    <el-dialog v-model="resultFailVisible" title="Download Settings" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ taskName }}</strong> result failed to load, please contract to administrator.</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="resultFailVisible = false">Confirm</el-button>
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
      tableData: data.map((coord, index) => ({
        index: index + 1,
        coord,
        label: labels[index] || 'N/A',
      })),
      pageSize: 15,
      currentPage: 1,
      sortProp: '',
      sortOrder: '',
      paginatedData: [],
      taskName: this.$route.params.taskName,
      isDarkMode: JSON.parse(localStorage.getItem('isDarkMode')) || false,
      activeChart: "tsne",
      loading:false,
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},
      magnifyRatio: 1,
      settingVisible: false,
      resultFailVisible: false,
      newChart: '',
      newData: '',
      newLabel: '',
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
          this.taskName = taskName; // 确保 taskName 被赋值
          const formData = new FormData();
          formData.append('taskName', taskName);
          formData.append('type', 'data');
          formData.append('userName', this.userData.userName);
          const response = await axios.post('/api/downloadResult', formData);

          let newData = response.data.replace('export const data = ', '');
          newData = newData.replace(';', '');
          newData = JSON.parse(newData);
        
          const formData2 = new FormData();
          formData2.append('taskName', taskName);
          formData2.append('type', 'label');
          formData2.append('userName', this.userData.userName);
          const response2 = await axios.post('/api/downloadResult', formData2);

          let newLabel = response2.data.replace('export const labels = ', '');
          newLabel = newLabel.replace(';', '');
          newLabel = JSON.parse(newLabel);


          const formData3 = new FormData();
          formData3.append('taskName', taskName);
          formData3.append('type', 'config');
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
        }catch(e){
          this.resultFailVisible = true;
          console.log(e);
        }
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleTaskSelect(task) {
      activeTask.value = task;
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
  beforeRouteEnter(to, from, next) {  
    next(vm => {  
      if (to.query.taskName) {
        vm.downloadResult(to.query.taskName); 
      }
    });
  },
  mounted() {
    this.applySorting();
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
    // BUG
    initializeChart(this.isDarkMode, false, this.axisSettings, '', '', '');
  },
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
  bottom: 0;
  right: 0;
  position: absolute;
}
</style>
