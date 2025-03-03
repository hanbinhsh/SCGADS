<template>
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center">
        <el-col :span="20">
          <el-card shadow="always">
            <template #header>
              <div slot="header" class="card-header">
                <span>Data Visualization</span>
                <el-button type="primary" style="float: right;" @click="download()">Download</el-button>
              </div>
            </template>
            <div class="card-body">
              <el-row type="flex" justify="space-between">
                <!-- 图表容器 -->
                <el-col :span="11">
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
                    <el-table-column prop="label" label="Label" width="200" sortable></el-table-column>
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
  name: "Example",
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
      isDarkMode:false,
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
    }
  },
  methods: {
    async downloadResult(taskName) {

        const formData = new FormData();
        formData.append('taskName', taskName);
        formData.append('type', 'data');
        const response = await axios.post('/api/downloadResult', formData);

        let newData = response.data.replace('export const data = ', '');
        newData = newData.replace(';', '');
        newData = JSON.parse(newData);
      
        const formData2 = new FormData();
        formData2.append('taskName', taskName);
        formData2.append('type', 'label');
        const response2 = await axios.post('/api/downloadResult', formData2);

        let newLabel = response2.data.replace('export const labels = ', '');
        newLabel = newLabel.replace(';', '');
        newLabel = JSON.parse(newLabel);


        const formData3 = new FormData();
        formData3.append('taskName', taskName);
        formData3.append('type', 'config');
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
      this.updatePaginatedData();
      initializeChart(false, true, newData, newPieces, newLabel);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
    },
    applySorting() {
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
        pixelRatio: 1, //放大2倍
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
    this.updatePaginatedData();
    this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
    // BUG
    initializeChart(false, false);
  },
};
</script>

<style scoped>
.card-header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.dark-mode .card-header {
  color: #EEE;
}

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
