<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <section class="fullscreen-section">
      <h1 class="page-name">Manage Tasks</h1>
      <el-divider />
      <!-- 任务列表表格 -->
      <el-table :data="paginatedTaskList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading">
        <!-- 多选功能 -->
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="user_name" label="User" sortable>
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="24"
                :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
              </el-avatar>
              <span style="margin-left: 8px;">{{ row.user_name }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 显示上传者的电子邮件 -->
        <el-table-column prop="email" label="Email" sortable></el-table-column>
        <!-- 显示上传者的电话 -->
        <el-table-column prop="phone" label="Phone" sortable></el-table-column>
        <!-- 显示任务名 -->
        <el-table-column prop="task_name" label="Task Name" sortable></el-table-column>
        <!-- 显示任务开始时间 -->
        <el-table-column prop="start_time" label="Start Time" sortable>
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
        <!-- 显示任务结束时间 -->
        <el-table-column prop="end_time" label="End Time" sortable>
          <template #default="{ row }">
            {{ row.end_time ? formatDate(row.end_time) : "Not completed yet" }}
          </template>
        </el-table-column>
        <!-- 显示任务状态 -->
        <el-table-column prop="status" label="Status" sortable>
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 显示操作列 -->
        <el-table-column fixed="right" label="Operations" width="420">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showAutoProgressDialog(row)">
              AutoProgress
            </el-button>
            <el-button link type="success" size="small" @click="showDownloadFileDialog(row)">
              Download
            </el-button>
            <el-button link type="" size="small" @click="showDetailDialog(row)">
              Detail
            </el-button>
            <el-button link type="" size="small" @click="showCharts( row.task_name )" :disabled="row.status !== 2">
              Virtualization
            </el-button>
            <el-button link type="warning" size="small" @click="showEditDialog(row)">
              Edit
            </el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="taskList.length">
      </el-pagination>
    </section>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchTaskList">
          Refresh
        </el-button>
        <el-button type="primary" @click="showBatchEditDialog" :disabled="selectedTasks.length === 0">
          Batch Edit
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedTasks.length === 0">
          Batch Delete
        </el-button>
        <el-button type="success" @click="showBatchDownloadDialog" :disabled="selectedTasks.length === 0">
          Batch Download
        </el-button>
      </div>
    </div>

    <!-- 自动处理对话框 -->
    <el-dialog v-model="autoProgressDialogVisible" title="Auto Progress" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be auto progressed</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="autoProgressDialogVisible = false">Cancel</el-button>
          <el-button type="success" @click="autoProgressDialogVisible = false; autoProgress()">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量下载确认对话框 -->
    <el-dialog v-model="batchDownloadDialogVisible" title="Download" width="500">
      <span>The selected tasks will be downloaded. Are you sure?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDownloadDialogVisible = false">Cancel</el-button>
          <el-button type="success" @click="confirmBatchDownload">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 单个下载确认对话框 -->
    <el-dialog v-model="downloadDialogVisible" title="Download" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be downloaded</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="downloadDialogVisible = false">Cancel</el-button>
          <el-button type="success" @click="downloadDialogVisible = false; download()">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected tasks?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量编辑对话框 -->
    <el-dialog v-model="batchEditDialogVisible" title="Batch Edit Tasks" width="500" align-center>
      <el-form :model="batchEditData" label-width="120px">
        <el-form-item label="New Status">
          <el-select v-model="batchEditData.status" placeholder="Select Status">
            <el-option label="Pending" :value="0"></el-option>
            <el-option label="Processing" :value="1"></el-option>
            <el-option label="Completed" :value="2"></el-option>
            <el-option label="Error" :value="-1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchEditDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmBatchEdit">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteTask()">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务详细信息对话框 -->
    <el-dialog v-model="detailDialogVisible" title="Detail" width="500" align-center>
      <span>{{ selectedTask.details }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit Task Status" width="500" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: When setting the status, the end time will be automatically updated.
      </div>
      <el-form :model="selectedTask" label-width="120px">
        <el-form-item label="Task Name">
          <el-input v-model="selectedTask.task_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="selectedTask.status" placeholder="Select Status" @change="handleStatusChange">
            <el-option label="Pending" :value="0"></el-option>
            <el-option label="Processing" :value="1"></el-option>
            <el-option label="Completed" :value="2"></el-option>
            <el-option label="Error" :value="-1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Detail">
          <el-input v-model="selectedTask.details" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmEdit">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="uploadDialogVisible" title="Upload Required Files" width="500" align-center
      @close="closeUploadDialog">
      <el-form>
        <!-- 文件上传组件 -->
        <el-upload v-model:file-list="configjsFile" class="upload" drag action="" :limit="1" :auto-upload="false">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">upload config.js file </div>
          </template>
        </el-upload>
        <el-upload v-model:file-list="datajsFile" class="upload" drag action="" :limit="1" :auto-upload="false">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">upload data.js file </div>
          </template>
        </el-upload>

        <el-upload v-model:file-list="lablejsFile" class="upload" drag action="" :limit="1" :auto-upload="false">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">upload lable.js file </div>
          </template>
        </el-upload>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUploadDialog">Cancel</el-button>
          <el-button type="warning" class="action-button" @click="handleResetClick">Reset</el-button>
          <el-button type="primary" @click="confirmUpload" :disabled="!canUpload">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from "axios";
import { ElMessage } from 'element-plus';
import logo from '../assets/logo.png';

export default {
  name: "WorkSpace",
  components: {
    MainHeader,
  },
  data() {
    return {
      uploadDialogVisible: false, // 新增状态，用于控制文件上传对话框的显示
      configjsFile: [],
      datajsFile: [],
      lablejsFile: [],
      canUpload: true, // 新增状态，用于判断是否可以确认上传
      taskList: [],
      paginatedTaskList: [],
      selectedTasks: [],
      deleteDialogVisible: false,
      detailDialogVisible: false,
      editDialogVisible: false,
      batchDeleteDialogVisible: false,
      batchEditDialogVisible: false,
      batchDownloadDialogVisible: false,
      downloadDialogVisible: false,
      autoProgressDialogVisible: false,
      selectedTask: null,
      batchEditData: { status: null },
      currentPage: 1,
      pageSize: 10,
      sortProp: '', // 当前排序属性
      sortOrder: '', // 当前排序顺序
      defaultAvatar: logo,
      loading:false,
    };
  },
  methods: {
    closeUploadDialog() {
      this.uploadDialogVisible = false;
      // 当对话框关闭时，将状态设置为 "Processing"
      this.selectedTask.status = 1; // 1 对应 "Processing"
    },
    handleResetClick() {
      this.configjsFile = [];
      this.datajsFile = [];
      this.lablejsFile = [];
      ElMessage.success('Reset success.');
    },
    handleUploadClick() {
      // 检查文件是否为空或类型不正确
      const isConfigjsFileValid = this.configjsFile.length > 0 && this.configjsFile.every(file => file.name.endsWith('js'));
      const isDatajsFileValid = this.datajsFile.length > 0 && this.datajsFile.every(file => file.name.endsWith('.js'));
      const isLablejsFileValid = this.lablejsFile.length > 0 && this.lablejsFile.every(file => file.name.endsWith('.js'));
      if (this.configjsFile.length === 0 || this.datajsFile.length === 0 || this.lablejsFile.length === 0) {
        ElMessage.error('Please upload all required files.');
        return;
      }
      if (!isConfigjsFileValid || !isDatajsFileValid || !isLablejsFileValid) {
        ElMessage.error('Incorrect file type. Please upload the correct file types.');
        return;
      }
      // 所有检查通过，显示任务名称输入框
      this.canUpload = true;
    },
    showCharts(taskName) {  
      this.$router.push({ name: "Virtualization", query: { taskName } });  
    },
    handleStatusChange(value) {
      if (value === 2) { // 当选择Completed状态时
        this.uploadDialogVisible = true; // 显示文件上传对话框
      }
      this.value = 1;
    },
    handleUploadSuccess(response, file, fileList) {
      // 当文件上传成功时，更新文件列表并检查是否所有文件都已上传
      this.fileList[file.name] = fileList;
      this.checkAllFilesUploaded();
    },
    async confirmUpload() {
      // 确认上传后，更新任务状态并关闭对话框
      // 检查文件是否为空或类型不正确
      const isConfigjsFileValid = this.configjsFile.length > 0 && this.configjsFile.every(file => file.name.endsWith('.js'));
      const isDatajsFileValid = this.datajsFile.length > 0 && this.datajsFile.every(file => file.name.endsWith('.js'));
      const isLablejsFileValid = this.lablejsFile.length > 0 && this.lablejsFile.every(file => file.name.endsWith('.js'));
      if (this.configjsFile.length === 0 || this.datajsFile.length === 0 || this.lablejsFile.length === 0) {
        ElMessage.error('Please upload all required files.');
        return;
      }
      if (!isConfigjsFileValid || !isDatajsFileValid || !isLablejsFileValid) {
        ElMessage.error('Incorrect file type. Please upload the correct file types.');
        return;
      }
      if (this.canUpload) {
        this.updateTaskStatus(this.selectedTask.task_id, 2);
        await this.UploadFiles();
        this.uploadDialogVisible = false;
        this.editDialogVisible = false; // 关闭编辑对话框
        window.location.reload()
        ElMessage.success('File upload was successful.');
      }
    },
    async UploadFiles() {
      const response = await axios.post('/api/findResultByTaskName?taskName=' + this.selectedTask.task_name);
      if (response.data.code === 1) {
        await axios.post('/api/insertResult', { taskName: this.selectedTask.task_name });
      }
      const files = [
        { file: this.configjsFile[0].raw, fileType: 'configjsFile' },
        { file: this.datajsFile[0].raw, fileType: 'datajsFile' },
        { file: this.lablejsFile[0].raw, fileType: 'lablejsFile' }
      ];
      const uploadPromises = files.map(({ file, fileType }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskName', this.selectedTask.task_name);
        formData.append('fileType', fileType);
        formData.append('userName', this.selectedTask.user_name);
        return axios.post('/api/uploadResult', formData);
      });
      await Promise.all(uploadPromises);
      //ElMessage.success('The file upload was successful.');
      this.configjsFile = [];
      this.datajsFile = [];
      this.lablejsFile = [];
      this.showTaskNameDialog = false; // 成功上传后关闭对话框
      //ElMessage.success('The file upload was successful.');
    },
    showAutoProgressDialog(task) {
      this.autoProgressDialogVisible = true;
      this.selectedTask = task;
    },
    showDownloadFileDialog(task) {
      this.downloadDialogVisible = true;
      this.selectedTask = task;
    },
    showBatchDownloadDialog(task) {
      this.batchDownloadDialogVisible = true;
      this.selectedTask = task;
    },
    showDeleteDialog(task) {
      this.deleteDialogVisible = true;
      this.selectedTask = task;
    },
    showDetailDialog(task) {
      this.detailDialogVisible = true;
      this.selectedTask = task;
    },
    showEditDialog(task) {
      this.editDialogVisible = true;
      this.selectedTask = { ...task }; // 复制任务对象，防止直接修改
    },
    showBatchDeleteDialog() {
      this.batchDeleteDialogVisible = true;
    },
    showBatchEditDialog() {
      this.batchEditDialogVisible = true;
    },
    async confirmEdit() {
      try {
        const params = new URLSearchParams();
        params.append('taskID', this.selectedTask.task_id);
        params.append('status', this.selectedTask.status);
        params.append('details', this.selectedTask.details);
        await axios.post('/api/updateTaskStatus', params);
        this.fetchTaskList();
        ElMessage.success('Task status updated successfully.');
      } catch (error) {
        ElMessage.error('Failed to update task status.');
        console.error("Edit failed:", error);
      } finally {
        this.editDialogVisible = false;
      }
    },
    async deleteTask() {
      try {
        const userName = this.selectedTask.user_name;
        const taskName = this.selectedTask.task_name; 
        const response = await axios.get(`/api/deleteTaskByTaskName?userName=${userName}&taskName=${taskName}`);
        ElMessage.success('Delete success.');
        this.fetchTaskList();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async autoProgress(){
      try {
        const params = new URLSearchParams();
        params.append('type', this.selectedTask.type);
        params.append('userName', this.selectedTask.user_name);
        params.append('taskName', this.selectedTask.task_name);
        await axios.post("/api/tsneProgress", params)
      } catch (error) {
        console.error("Progress failed:", error);
      }
    },
    async download() {
      try {
        fetch("/api/download?taskName=" + this.selectedTask.task_name)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.blob(); // 获取文件内容作为Blob对象
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.selectedTask.task_name + ".zip"); // or any other extension
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting();
    },
    applySorting() {
      if (!this.sortProp || !this.sortOrder) {
        this.paginatedTaskList = this.taskList.slice(); // 无排序
        this.updatePaginatedTaskList();
        return;
      }

      const sortedList = this.taskList.slice().sort((a, b) => {
        let result = 0;
        if (a[this.sortProp] > b[this.sortProp]) {
          result = 1;
        } else if (a[this.sortProp] < b[this.sortProp]) {
          result = -1;
        }
        return this.sortOrder === 'ascending' ? result : -result;
      });

      this.taskList = sortedList;
      this.updatePaginatedTaskList();
    },
    async confirmBatchDownload() {
      this.batchDownloadDialogVisible = false;
      for (const task of this.selectedTasks) {
        await this.downloadByTaskName(task.task_name);
      }
      this.fetchTaskList();
    },
    async downloadByTaskName(taskName) {
      try {
        fetch("/api/download?taskName=" + taskName)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.blob(); // 获取文件内容作为Blob对象
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', taskName + ".zip"); // or any other extension
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const task of this.selectedTasks) {
        await this.deleteTaskByTaskName(task.user_name, task.task_name);
      }
      ElMessage.success('Batch delete success.');
      this.fetchTaskList();
    },
    async deleteTaskByTaskName(userName, taskName) {
      try {
        const response = await axios.get(`/api/deleteTaskByTaskName?userName=${userName}&taskName=${taskName}`);
        await axios.get("/api/deleteTaskByID?taskID=" + taskID);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async confirmBatchEdit() {
      this.batchEditDialogVisible = false;
      const newStatus = this.batchEditData.status;
      for (const task of this.selectedTasks) {
        await this.updateTaskStatus(task.task_id, newStatus);
      }
      ElMessage.success('Batch edit success.');
      this.fetchTaskList();
    },
    async updateTaskStatus(taskID, status) {
      try {
        const params = new URLSearchParams();
        params.append('taskID', taskID);
        params.append('status', status);
        params.append('details', this.selectedTask.details);
        await axios.post('/api/updateTaskStatus', params);
      } catch (error) {
        console.error("Update failed:", error);
      }
    },
    async fetchTaskList() {
      try {
        this.loading = true;
        const response = await axios.get("/api/findAllTasksWithUserInformation");
        if (response.data.code === 200) {
          const dataObject = response.data.data;
          this.taskList = Object.values(dataObject);
          this.applySorting(); // 确保数据按照当前排序
        } else {
          console.error("Failed to fetch task list:", response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch task list:", error);
      }
    },
    updatePaginatedTaskList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedTaskList = this.taskList.slice(start, end);
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
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  },
  mounted() {
    this.fetchTaskList();
  },
};
</script>