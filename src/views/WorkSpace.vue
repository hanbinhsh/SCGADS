
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.initStatusChart();
        }, 300); // 延迟 0.3 秒
      });
    },
    async fetchShareList() {
      try {
        this.shareLoading = true; // ShareLoading
        const response = await axios.get("/api/share/findSharesByUserId?userID=" + this.userData.userId);
        const responseReceived = await axios.get("/api/share/findSharesReceivedByUserId?userID=" + this.userData.userId);
        if (response.data.code === 200 && responseReceived.data.code === 200) {
          this.shareList = response.data.data;
          this.shareReceivedList = responseReceived.data.data;
        } else {
          console.error("Failed to fetch share list:", response.data.msg + responseReceived.data.msg);
        }
        this.shareLoading = false;
      } catch (error) {
        console.error("Failed to fetch share list:", error);
        this.shareLoading = false;
      }
    },
    // 调整图表大小方法
    resizeCharts() {
      if (this.statusChart) {
        this.statusChart.resize();
      }
    },
    // 初始化状态分布图表
    initStatusChart() {
      if (this.$refs.statusChart) {
        // 如果图表实例已存在，先销毁
        if (this.statusChart) {
          this.statusChart.dispose();
        }
        
        // 创建新的图表实例
        this.statusChart = echarts.init(this.$refs.statusChart);
        
        // 设置图表选项
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          series: [
            {
              name: 'Task Status',
              type: 'pie',
              radius: ['50%', '70%'], // 设置为环形图
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: this.pendingCount, name: 'Pending', itemStyle: { color: '#E6A23C' } },
                { value: this.processingCount, name: 'Processing', itemStyle: { color: '#409EFF' } },
                { value: this.completedCount, name: 'Completed', itemStyle: { color: '#67C23A' } },
                { value: this.errorCount, name: 'Error', itemStyle: { color: '#F56C6C' } }
              ]
            }
          ]
        };
        
        // 使用配置项设置图表
        this.statusChart.setOption(option);
      }
    },
    getStatusColor(status) {
      const colors = {
        0: "#E6A23C",
        1: "#409EFF",
        2: "#67C23A",
        '-1': "#F56C6C",
        4: "#909399"
      };
      return colors[status] || "#909399";
    },
    showDeleteDialog(task) {
      this.deleteDialogVisible = true;
      this.selectedTask = task;
    },
    showCharts(taskName) {  
      this.$router.push({ name: "Virtualization", query: { taskName } });  
    },
    showDetailDialog(task) {
      this.detailDialogVisible = true;
      this.selectedTask = task;
    },
    showBatchDeleteDialog() {
      if (this.selectedTasks.length === 0) {
        ElMessage.warning("Please select at least one task.");
        return;
      }
      this.batchDeleteDialogVisible = true;
    },
    async deleteTask() {
      try {
        await axios.get("/api/deleteTaskByTaskName?userName="+ this.userData.userName +"&taskName=" + this.selectedTask.task_name);
        ElMessage.success("Delete success.");
        this.Refresh();
      } catch (error) {
        console.error("Delete failed:", error);
        ElMessage.error("Delete failed.");
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const task of this.selectedTasks) {
        await this.deleteTaskByTaskName(task.task_name);
      }
      ElMessage.success("Batch delete completed.");
      this.Refresh();
    },
    async deleteTaskByTaskName(taskName) {
      try {
        await axios.get("/api/deleteTaskByTaskName?userName="+ this.userData.userName +"&taskName=" + taskName);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async fetchTaskList() {
      try {
        this.loading = true;
        const response = await axios.get("/api/findTasksByUserID?userID=" + this.userData.userId);
        if (response.data.code === 200) {
          this.taskList = response.data.data;
          this.applySorting(); // 调用排序函数
          // 获取数据后重新初始化图表
          this.$nextTick(() => {
            setTimeout(() => {
              this.initStatusChart();
            }, 300); // 延迟 0.3 秒
          });
        } else {
          console.error("Failed to fetch task list:", response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch task list:", error);
        this.loading = false;
      }
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting(); // 调用排序函数
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.taskList.sort((a, b) => {
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
      this.updatePaginatedTaskList();
    },
    statusText(status) {
      switch (status) {
        case 0:
          return this.$t('status.Pending');
        case 1:
          return this.$t('status.Processing');
        case 2:
          return this.$t('status.Completed');
        case -1:
          return this.$t('status.Error');
        default:
          return this.$t('status.Unknown');
      }
    },
    statusType(status) {
      switch (status) {
        case 0:
          return "info";
        case 1:
          return "warning";
        case 2:
          return "success";
        case -1:
          return "danger";
        default:
          return "";
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleString(undefined, options);
    },
    handleSelectionChange(val) {
      this.selectedTasks = val;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedTaskList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedTaskList();
    },
    updatePaginatedTaskList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedTaskList = this.taskList.slice(start, end);
    },
    checkScreenSize() {
      this.isMobileView = window.innerWidth < 768;
      if (this.isMobileView && this.isRightColumnExpanded) {
        this.isRightColumnExpanded = false;
      }
    },
    
    showMobileActionSheet(task) {
      this.selectedTask = task;
      this.mobileActionSheetVisible = true;
    },
    
    getTaskType(row) {
      if (!row) return '';
      
      let typeText = '';
      
      if (row.type?.split(':')[1]) {
        typeText += (row.type.split(':')[1] === "single" ? this.$t('taskType.Singleomic') :
                    row.type.split(':')[1] === "multi" ? this.$t('taskType.Multiomics') :
                    row.type.split(':')[1] === "deno" ? this.$t('taskType.Denoising') : 
                    this.$t('taskType.Unknown'));
      }
      
      if (row.type?.split(':')[0]) {
        if (row.type.split(':')[0] === "annotation") {
          typeText += ' ' + this.$t('taskType.Annotation');
        } else if (row.type.split(':')[0] === "trainning") {
          typeText += ' ' + this.$t('taskType.Trainning');
        }
      }
      
      return typeText || this.$t('taskType.Unknown');
    },
  },
  mounted() {
    this.Refresh(); // 组件挂载后获取任务数据
    // 设置图表响应式
    window.addEventListener('resize', this.resizeCharts);
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    // 组件销毁前清理图表实例和事件监听
    if (this.statusChart) {
      this.statusChart.dispose();
    }
    window.removeEventListener('resize', this.resizeCharts);
    window.removeEventListener('resize', this.checkScreenSize);
  }
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 60px; /* Add top margin to accommodate the fixed header */
  height: calc(100vh - 60px); /* Adjust height to account for header */
}

/* Left Column Styles */
.left-column {
  width: 88%; /* Default width when right column is collapsed */
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.left-column.with-expanded-right {
  width: 25%; /* Width when right column is expanded */
}

.dashboard-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.donut-chart-wrapper {
  flex: 1;
}

.status-chart {
  width: 100%;
  height: 180px;
  /* position: absolute; */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.status-count {
  font-size: 18px;
  font-weight: bold;
  display: block; /* 让 span 变为块级元素 */
  text-align: right; /* 文字右对齐 */
  width: 100%; /* 确保占满父容器 */
}

.success-tasks-list {
  overflow-y: auto;
  background-color: #f0f0f0;
  height: 100%;
  border-radius: 10px;
}

.dark-mode .success-tasks-list {
  background-color: #302E2C;
}

.success-task-item {
  margin: 15px 15px 0px 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #302E2C;
}

.dark-mode .success-task-item{
  border-bottom: 1px solid #f0f0f0;
}

.success-task-item:last-child {
  border-bottom: none;
}

.success-task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.success-task-name {
  font-weight: bold;
}

.success-task-details {
  display: flex;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-style: italic;
}

/* Right Column Styles */
.right-column {
  transition: width 0.3s ease;
  border-left: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  position: relative;
}

.right-column.collapsed {
  width: 12%; /* Collapsed width */
}

.right-column.expanded {
  width: 100%; /* Expanded width */
}

.column-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

.collapsed-task-list, 
.expanded-task-list {
  padding: 15px;
  padding-top: 60px; /* Space for the toggle button */
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;
  padding: 10px;
  border-top: 1px solid #e6e6e6;
  position: absolute;
}

.footer-button-row {
  display: flex;
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* Accommodate to dark mode when active */
:deep(.dark-mode) .dashboard-card,
:deep(.dark) .dashboard-card {
  background-color: #1d1e1f;
  border-color: #3e3e3e;
  color: #e0e0e0;
}

:deep(.dark-mode) .success-task-details,
:deep(.dark) .success-task-details {
  color: #a0a0a0;
}

:deep(.dark-mode) .empty-state,
:deep(.dark) .empty-state {
  color: #a0a0a0;
}

:deep(.dark-mode) .right-column,
:deep(.dark) .right-column {
  border-left-color: #3e3e3e;
}

:deep(.dark-mode) .footer,
:deep(.dark) .footer {
  border-top-color: #3e3e3e;
}

/* Mobile Responsive Styles */
@media (max-width: 767px) {
  .content-container {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }
  
  .left-column {
    width: 95% !important;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    padding: 10px;
    margin-top: 20px;
  }
  
  .right-column {
    display: none;
  }
  
  .dashboard-card {
    height: auto;
    min-height: 350px;
  }

  .success-tasks-list {
    max-height: 230px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .left-column {
    grid-template-columns: 1fr;
    width: 70% !important;
  }
  
  .right-column.collapsed {
    width: 30%;
  }
}

/* Mobile Task Drawer */
.mobile-task-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: transparent;
  width: 50px;
  height: 50px;
}

.mobile-action-buttons .el-button + .el-button {
  margin-left: 0;        /* 去除横向间距 */
}

.mobile-task-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.detail-label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}

.mobile-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Chart responsive fix */
.status-chart {
  height: 150px;
  min-height: 150px;
}

.left-section {
  display: flex;
  flex-direction: column;
}

/* Adjust card for smaller screens */
@media (max-width: 767px) {
  .card-header {
    padding: 10px;
  }
  
  .status-count {
    font-size: 14px;
  }
  
  .status-chart {
    height: 120px;
  }
}

/* Make mobile dialog take more screen space */
.mobile-action-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>