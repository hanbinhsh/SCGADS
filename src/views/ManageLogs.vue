<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageLogs') }}</h1>
      <el-divider />

      <div>
        <el-table 
          :data="paginatedLogsList" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          v-loading="loading"
        >
          <!-- 多选功能 -->
          <!-- <el-table-column type="selection" width="55"></el-table-column> -->
          <el-table-column prop="user_name" :label="$t('database.user.user_name')" sortable min-width="150">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-avatar :size="24"
                  :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
                </el-avatar>
                <span style="margin-left: 8px;">{{ row.user_name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="action" :label="$t('database.log.action')" sortable min-width="200"></el-table-column>
          <el-table-column prop="importance" :label="$t('database.log.importance')" sortable width="150">
            <template #default="{ row }">
              <el-tag :type="getImportanceType(row.importance)">
                {{ getImportanceLabel(row.importance) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" :label="$t('database.log.timestamp')" width="150" sortable>
            <template #default="{ row }">
              {{ formatDate(row.timestamp) }}
            </template>
          </el-table-column>
          
          <el-table-column fixed="right" :label="$t('Operations')" width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showDetailDialog(row)">
                {{ $t('Detail') }}
              </el-button>
            </template>
          </el-table-column> 
        </el-table>
      </div>
      
      <!-- 分页组件 -->
      <el-pagination 
        class="pagination" 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
        :current-page="currentPage" 
        :page-sizes="[5, 10, 20, 50]" 
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="logsList.length"
        :small="isMobile"
        :hide-on-single-page="false">
      </el-pagination>
    </el-main>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchLogs">
          {{ $t('Refresh') }}
        </el-button>
        <el-button type="primary" @click="showDownloadDialog">
          {{ $t('managePage.DownloadLogs') }}
        </el-button>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="$t('LogDetail')" width="500" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('database.user.user_name')">
          <div style="display: flex; align-items: center;">
            <el-avatar :size="24"
              :src="selectedLog.avatarBase64 ? 'data:image/jpeg;base64,' + selectedLog.avatarBase64 : defaultAvatar">
            </el-avatar>
            <span style="margin-left: 8px;">{{ selectedLog.user_name }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.action')">
          {{ selectedLog.action }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.importance')">
          <el-tag :type="getImportanceType(selectedLog.importance)">
            {{ getImportanceLabel(selectedLog.importance) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.timestamp')">
          {{ formatDate(selectedLog.timestamp) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div>
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移动端操作对话框 -->
    <el-dialog v-model="optDialogVisible" :title="$t('LogDetail')" width="90%" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('database.user.user_name')">
          <div style="display: flex; align-items: center;">
            <el-avatar :size="24"
              :src="currentRow.avatarBase64 ? 'data:image/jpeg;base64,' + currentRow.avatarBase64 : defaultAvatar">
            </el-avatar>
            <span style="margin-left: 8px;">{{ currentRow.user_name }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.action')">
          {{ currentRow.action }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.importance')">
          <el-tag :type="getImportanceType(currentRow.importance)">
            {{ getImportanceLabel(currentRow.importance) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.log.timestamp')">
          {{ formatDate(currentRow.timestamp) }}
        </el-descriptions-item>
      </el-descriptions>
      <div>
        <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">
          {{ $t('Delete') }}
        </el-button>
      </div>
      <template #footer>
        <div>
          <el-button type="primary" @click="optDialogVisible = false">{{ $t('Close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
  
<script>
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  import MainHeader from "../components/MainHeader.vue";
  import axios from 'axios';
  import { ElMessage } from 'element-plus';
  import logo from '../assets/logo.png';
  
  export default {
    name: 'LogsPage',
    components: {
      MainHeader
    },
    data() {
      return {
        currentRow: {},
        logsList: [],
        paginatedLogsList: [], // 当前页的日志数据
        optDialogVisible: false,
        detailDialogVisible: false,
        deleteDialogVisible: false,
        selectedLog: {},
        selectedLogs: [],
        currentPage: 1,
        pageSize: 10,
        sortProp: '',
        sortOrder: '',
        loading: false,
        defaultAvatar: logo,
        windowWidth: window.innerWidth,
      };
    },
    computed: {
      isMobile() {
        return this.windowWidth <= 768;
      },
      paginationLayout() {
        if (this.windowWidth <= 480) {
          // 小屏手机：只显示基本的分页器
          return "prev, pager, next";
        } else if (this.windowWidth <= 768) {
          // 平板/大屏手机：显示总数和基本分页
          return "total, prev, pager, next";
        } else {
          // 桌面端：显示完整功能
          return "total, sizes, prev, pager, next, jumper";
        }
      },
    },
    methods: {
      // 监听窗口大小变化
      handleResize() {
        this.windowWidth = window.innerWidth;
      },
      showOptDialog(row) {
        this.currentRow = row;
        this.optDialogVisible = true;
      },
      
      showDetailDialog(log) {
        this.detailDialogVisible = true;
        this.selectedLog = log;
      },
      
      showDeleteDialog(log) {
        this.deleteDialogVisible = true;
        this.selectedLog = log;
      },
      
      handleSelectionChange(val) {
        this.selectedLogs = val;
      },
      
      handleSortChange({ prop, order }) {
        this.sortProp = prop;
        this.sortOrder = order;
        this.applySorting();
      },
      
      applySorting() {
        if (this.sortProp && this.sortOrder) {
          this.logsList.sort((a, b) => {
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
        this.updatePaginatedLogsList();
      },
      
      updatePaginatedLogsList() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedLogsList = this.logsList.slice(start, end);
      },
      
      handleSizeChange(val) {
        this.pageSize = val;
        this.updatePaginatedLogsList();
      },
      
      handleCurrentChange(val) {
        this.currentPage = val;
        this.updatePaginatedLogsList();
      },
      
      async fetchLogs() {
        try {
          this.loading = true;
          const response = await axios.get('/api/findAllLogs');
          if (response.data.code === 200) {
            const dataObject = response.data.data;
            this.logsList = Object.values(dataObject);
            this.applySorting();
          } else {
            console.error('获取日志失败:', response.data.msg);
            ElMessage.error(response.data.msg || '获取日志失败');
          }
          this.loading = false;
        } catch (error) {
          console.error('获取日志失败:', error);
          ElMessage.error('获取日志失败');
          this.loading = false;
        }
      },
      
      async deleteLog(logId) {
        try {
          const response = await axios.delete(`/api/deleteLog/${logId}`);
          if (response.data.code === 1) {
            ElMessage.success('日志删除成功');
            this.fetchLogs();
          } else {
            console.error('删除日志失败:', response.data.msg);
            ElMessage.error(response.data.msg || '删除日志失败');
          }
        } catch (error) {
          console.error('删除日志失败:', error);
          ElMessage.error('删除日志失败');
        }
      },
      
      async deleteLogID(logId) {
        try {
          await axios.delete(`/api/deleteLog/${logId}`);
        } catch (error) {
          console.error("删除失败:", error);
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
      },
      
      getImportanceType(importance) {
        // 根据重要性返回不同的标签类型
        switch (Number(importance)) {
          case 1: return 'info';
          case 2: return 'warning';
          case 3: return 'danger';
          default: return 'info';
        }
      },
      
      getImportanceLabel(importance) {
        switch (Number(importance)) {
          case 1: return this.$t('importance.low');
          case 2: return this.$t('importance.medium');
          case 3: return this.$t('importance.high');
          default: return this.$t('importance.unknown');
        }
      },

      downloadCSV() {
        try {
          // 准备CSV数据
          const csvData = this.prepareCsvData();
          
          // 创建CSV内容
          const csvContent = this.arrayToCsv(csvData);
          
          // 创建Blob对象
          const blob = new Blob(['\ufeff' + csvContent], { 
            type: 'text/csv;charset=utf-8' 
          });
          
          // 生成文件名
          const fileName = `logs_${this.formatFileDate(new Date())}.csv`;
          
          // 下载文件
          saveAs(blob, fileName);
          
          ElMessage.success(this.$t('DownloadSuccess') || '下载成功');
        } catch (error) {
          console.error('CSV下载失败:', error);
          ElMessage.error(this.$t('DownloadFailed') || '下载失败');
        }
      },

      // Excel下载功能
      downloadExcel() {
        try {
          // 准备Excel数据
          const excelData = this.prepareExcelData();
          
          // 创建工作簿
          const wb = XLSX.utils.book_new();
          
          // 创建工作表
          const ws = XLSX.utils.aoa_to_sheet(excelData);
          
          // 设置列宽
          const colWidths = [
            { wch: 15 }, // 用户名
            { wch: 30 }, // 操作
            { wch: 10 }, // 重要性
            { wch: 20 }  // 时间戳
          ];
          ws['!cols'] = colWidths;
          
          // 添加工作表到工作簿
          XLSX.utils.book_append_sheet(wb, ws, 'Logs');
          
          // 生成文件名
          const fileName = `logs_${this.formatFileDate(new Date())}.xlsx`;
          
          // 下载文件
          XLSX.writeFile(wb, fileName);
          
          ElMessage.success(this.$t('DownloadSuccess') || '下载成功');
        } catch (error) {
          console.error('Excel下载失败:', error);
          ElMessage.error(this.$t('DownloadFailed') || '下载失败');
        }
      },

      // 准备CSV数据
      prepareCsvData() {
        const headers = [
          this.$t('database.user.user_name') || '用户名',
          this.$t('database.log.action') || '操作',
          this.$t('database.log.importance') || '重要性',
          this.$t('database.log.timestamp') || '时间戳'
        ];
        
        const rows = this.logsList.map(log => [
          log.user_name || '',
          log.action || '',
          this.getImportanceLabel(log.importance),
          this.formatDate(log.timestamp)
        ]);
        
        return [headers, ...rows];
      },

      // 准备Excel数据
      prepareExcelData() {
        const headers = [
          this.$t('database.user.user_name') || '用户名',
          this.$t('database.log.action') || '操作',
          this.$t('database.log.importance') || '重要性',
          this.$t('database.log.timestamp') || '时间戳'
        ];
        
        const rows = this.logsList.map(log => [
          log.user_name || '',
          log.action || '',
          this.getImportanceLabel(log.importance),
          this.formatDate(log.timestamp)
        ]);
        
        return [headers, ...rows];
      },

      // 数组转CSV格式
      arrayToCsv(data) {
        return data.map(row => 
          row.map(cell => {
            // 处理包含逗号、换行符或引号的字段
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        ).join('\n');
      },

      // 格式化文件日期
      formatFileDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}${month}${day}_${hours}${minutes}`;
      },

      // 显示下载选择对话框
      showDownloadDialog() {
        this.$confirm(
          this.$t('managePage.ChooseDownloadFormat'),
          this.$t('Download'),
          {
            distinguishCancelAndClose: true,
            confirmButtonText: 'Excel',
            cancelButtonText: 'CSV',
            type: 'info'
          }
        ).then(() => {
          // 用户选择Excel
          this.downloadExcel();
        }).catch((action) => {
          if (action === 'cancel') {
            // 用户选择CSV
            this.downloadCSV();
          }
          // 如果是'close'则什么都不做
        });
      }
    },
    mounted() {
      this.fetchLogs();
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }
  };
</script>