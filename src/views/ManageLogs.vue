<template>
    <div class="main-page">
      <MainHeader></MainHeader>
      <el-main class="fullscreen-section">
        <h1 class="page-name">{{ $t('navigateBar.ManageLogs') }}</h1>
        <el-divider />
        <div class="desktop-view">
          <el-table 
            :data="paginatedLogsList" 
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            v-loading="loading"
          >
            <!-- 多选功能 -->
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="user_name" :label="$t('database.user.user_name')" sortable>
              <template #default="{ row }">
                <div style="display: flex; align-items: center;">
                  <el-avatar :size="24"
                    :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
                  </el-avatar>
                  <span style="margin-left: 8px;">{{ row.user_name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="action" :label="$t('database.log.action')" sortable></el-table-column>
            <el-table-column prop="importance" :label="$t('database.log.importance')" sortable>
              <template #default="{ row }">
                <el-tag :type="getImportanceType(row.importance)">
                  {{ getImportanceLabel(row.importance) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" :label="$t('database.log.timestamp')" width="180" sortable>
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
  
        <div class="mobile-view">
          <el-table 
            :data="paginatedLogsList" 
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            v-loading="loading"
          >
            <!-- 多选功能 -->
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="user_name" :label="$t('database.user.user_name')" sortable>
              <template #default="{ row }">
                <div style="display: flex; align-items: center;">
                  <el-avatar :size="24"
                    :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
                  </el-avatar>
                  <span style="margin-left: 8px;">{{ row.user_name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="action" :label="$t('database.log.action')" sortable>
              <template #default="{ row }">
                <div class="ellipsis-text">{{ row.action }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" :label="$t('database.log.timestamp')" width="120" sortable>
              <template #default="{ row }">
                {{ formatDate(row.timestamp) }}
              </template>
            </el-table-column>
            
            <el-table-column fixed="right" :label="$t('Operations')" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="showOptDialog(row)">
                  {{ $t('Detail') }}
                </el-button>
              </template>
            </el-table-column> 
          </el-table>
        </div>
        
        <!-- 分页组件 -->
        <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="logsList.length"></el-pagination>
      </el-main>
  
      <!-- 按钮行 -->
      <div class="footer">
        <div class="footer-button-row">
          <el-button type="success" @click="fetchLogs">
            {{ $t('Refresh') }}
          </el-button>
          <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedLogs.length === 0">
            {{ $t('BatchDelete') }}
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
          <div class="dialog-footer">
            <el-button type="primary" @click="detailDialogVisible = false">{{ $t('Confirm') }}</el-button>
          </div>
        </template>
      </el-dialog>
  
      <!-- 删除确认对话框 -->
      <el-dialog v-model="deleteDialogVisible" :title="$t('Warning')" width="500" align-center>
        <span>{{ $t('logs.DeleteConfirm') }}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="danger" @click="deleteDialogVisible = false; deleteLog(selectedLog.log_id)">
              {{ $t('Confirm') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
  
      <!-- 批量删除确认对话框 -->
      <el-dialog v-model="batchDeleteDialogVisible" :title="$t('BatchDeleteConfirmation')" width="500" align-center>
        <span>{{ $t('logs.BatchDeleteConfirm') }}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="batchDeleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="danger" @click="confirmBatchDelete">
              {{ $t('Confirm') }}
            </el-button>
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
        <div class="operation-buttons">
          <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">
            {{ $t('Delete') }}
          </el-button>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="optDialogVisible = false">{{ $t('Close') }}</el-button>
          </div>
        </template>
      </el-dialog>
  
    </div>
  </template>
  
  <script>
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
        batchDeleteDialogVisible: false,
        selectedLog: {},
        selectedLogs: [],
        currentPage: 1,
        pageSize: 10,
        sortProp: '',
        sortOrder: '',
        loading: false,
        defaultAvatar: logo,
        isMobile: false,
      };
    },
    methods: {
      checkMobile() {
        this.isMobile = window.innerWidth <= 768;
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
      
      showBatchDeleteDialog() {
        this.batchDeleteDialogVisible = true;
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
            console.log(dataObject);
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
      
      async confirmBatchDelete() {
        this.batchDeleteDialogVisible = false;
        let successCount = 0;
        let failCount = 0;
        
        for (const log of this.selectedLogs) {
          try {
            await this.deleteLogID(log.log_id);
            successCount++;
          } catch (error) {
            failCount++;
          }
        }
        
        if (failCount === 0) {
          ElMessage.success(`成功删除${successCount}条日志`);
        } else {
          ElMessage.warning(`成功删除${successCount}条日志，${failCount}条删除失败`);
        }
        
        this.fetchLogs();
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
        // 根据重要性返回不同的标签文字
        switch (Number(importance)) {
          case 1: return '低';
          case 2: return '中';
          case 3: return '高';
          default: return '未知';
        }
      }
    },
    mounted() {
      this.fetchLogs();
      this.checkMobile(); // 初始检查
      window.addEventListener('resize', this.checkMobile);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.checkMobile); // 移除事件监听器
    }
  };
  </script>
  
  <style scoped>
  /* 批量操作按钮样式 */
  .batch-actions {
    margin-bottom: 15px;
  }
  
  /* 分页组件样式 */
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .desktop-view {
    display: flex;
    gap: 8px;
  }
  
  .mobile-view {
    display: none;
  }
  
  .operation-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  
  .ellipsis-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }
  
  @media (max-width: 768px) {
    .desktop-view {
      display: none;
    }
    
    .mobile-view {
      display: block;
    }
  
    .pagination {
      display: flex;
      flex-wrap: wrap;
      justify-content: left;
      margin-bottom: 20px;
    }
  }
  </style>