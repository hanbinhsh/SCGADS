<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <section class="fullscreen-section">
      <!-- 批量操作按钮 -->
      <div class="batch-actions">
        <el-button type="success" @click="fetchTaskList">
          Refresh
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedTasks.length === 0">
          Batch Delete
        </el-button>
      </div>

      <!-- 任务列表表格 -->
      <el-table :data="paginatedTaskList" style="width: 100%" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
        <!-- 多选框 -->
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="taskName" label="Task Name" sortable>
          <template #default="{ row }">
            <font-awesome-icon :style="{ color: getStatusColor(row.status)}" :icon="['fas', 'circle']" />
            {{ row.taskName }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="Type" sortable>
          <template #default="{ row }">
            {{ row.type ?? "Unknown" }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="Request Time" sortable>
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="Complete Time" sortable>
          <template #default="{ row }">
            {{ row.endTime ? formatDate(row.endTime) : "Not completed yet" }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" sortable>
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" width="300">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="showCharts( row.taskName )" :disabled="row.status !== 2">
              Virtualization
            </el-button>
            <el-button link type="primary" size="small" @click="showDetailDialog(row)">
              Detail
            </el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="taskList.length"></el-pagination>

    </section>
  </div>

  <!-- 批量删除确认对话框 -->
  <el-dialog v-model="batchDeleteDialogVisible" title="Warning" width="500">
    <span>The selected tasks will be deleted. Are you sure?</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
        <el-button type="danger" @click="confirmBatchDelete">Confirm</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 单个删除确认对话框 -->
  <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
    <span>Task <strong style="color: #e74c3c;">{{ selectedTask.taskName }}</strong> will be deleted</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">Cancel</el-button>
        <el-button type="danger" @click="deleteDialogVisible = false; deleteTask()">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 详情对话框 -->
  <el-dialog v-model="detailDialogVisible" title="Detail" width="500" align-center>
    <span>{{ selectedTask.details }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="selectedTask.status===2" type="primary" @click="showCharts( selectedTask.taskName )">Virtualization</el-button>
        <el-button type="primary" @click="">Parameters</el-button><!-- TODO -->
        <el-button type="primary" @click="detailDialogVisible = false">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "WorkSpace",
  components: {
    MainHeader,
  },
  data() {
    return {
      userData: JSON.parse(sessionStorage.getItem("userData")) || {},
      taskList: [], // 存储任务数据
      paginatedTaskList: [], // 当前页的任务数据
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      detailDialogVisible: false,
      selectedTask: null,
      selectedTasks: [], // 存储多选选中的任务
      currentPage: 1, // 当前页
      pageSize: 10, // 每页显示条数
      sortOrder: '', // 当前排序方向
      sortProp: '', // 当前排序属性
    };
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        0: "#E6A23C",
        1: "#409EFF",
        2: "#67C23A",
        3: "#F56C6C",
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
        await axios.get("/api/deleteTaskByTaskName?taskName=" + this.selectedTask.taskName);
        ElMessage.success("Delete success.");
        this.fetchTaskList();
      } catch (error) {
        console.error("Delete failed:", error);
        ElMessage.error("Delete failed.");
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const task of this.selectedTasks) {
        await this.deleteTaskByTaskName(task.taskName);
      }
      ElMessage.success("Batch delete completed.");
      this.fetchTaskList();
    },
    async deleteTaskByTaskName(taskId) {
      try {
        await axios.get("/api/deleteTaskByTaskName?taskID=" + taskId);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async fetchTaskList() {
      try {
        const response = await axios.get("/api/findTasksByUserID?userID=" + this.userData.userId);
        if (response.data.code === 200) {
          this.taskList = response.data.data;
          this.applySorting(); // 调用排序函数
        } else {
          console.error("Failed to fetch task list:", response.data.msg);
        }
      } catch (error) {
        console.error("Failed to fetch task list:", error);
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
          return "Pending";
        case 1:
          return "Processing";
        case 2:
          return "Completed";
        case -1:
          return "Error";
        default:
          return "Unknown";
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
  },
  mounted() {
    this.fetchTaskList(); // 组件挂载后获取任务数据
  },
};
</script>