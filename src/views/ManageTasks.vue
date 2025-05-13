<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageTasks') }}</h1>
      <el-divider />
      <!-- 任务列表表格 -->
      <div class="desktop-view">
        <el-table :data="paginatedTaskList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading">
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
        <!-- 显示任务名 -->
        <el-table-column prop="task_name" :label="$t('database.task.task_name')" sortable></el-table-column>
        <!-- 显示上传者的电子邮件 -->
        <el-table-column prop="email" :label="$t('database.user.email')" sortable></el-table-column>
        <!-- 显示上传者的电话 -->
        <el-table-column prop="phone" :label="$t('database.user.phone')" sortable></el-table-column>
        <!-- 显示任务开始时间 -->
        <el-table-column prop="start_time" :label="$t('database.task.start_time')" sortable>
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
        <!-- 显示任务结束时间 -->
        <el-table-column prop="end_time" :label="$t('database.task.end_time')" sortable>
          <template #default="{ row }">
            {{ row.end_time ? formatDate(row.end_time) : $t('Notcompletedyet') }}
          </template>
        </el-table-column>
        <!-- 显示任务状态 -->
        <el-table-column prop="status" :label="$t('database.task.status')" sortable>
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 显示操作列 -->
        <el-table-column fixed="right" :label="$t('Operations')" width="380" class-name="operations-column">
          <template #default="{ row }">
            <!-- Desktop view - show all buttons -->
                <el-button link type="primary" size="small" @click="showAutoProgressDialog(row)">
                  {{ $t('taskManage.Auto') }}
                </el-button>
                <el-button link type="success" size="small" @click="showDownloadFileDialog(row)">
                  {{ $t('Download') }}
                </el-button>
                <el-button link type="" size="small" @click="showDetailDialog(row)">
                  {{ $t('Detail') }}
                </el-button>
                <el-button link type="" size="small" @click="showCharts(row.task_name)" :disabled="row.status !== 2">
                  {{ $t('navigateBar.Virtualization') }}
                </el-button>
                <el-button link type="warning" size="small" @click="showEditDialog(row)">
                  {{ $t('Edit') }}
                </el-button>
                <el-button link type="danger" size="small" @click="showDeleteDialog(row)">
                  {{ $t('Delete') }}
                </el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>
      
      <div class="mobile-view">
        <el-table :data="paginatedTaskList" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading">
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
        <!-- 显示任务名 -->
        <el-table-column prop="task_name" :label="$t('database.task.task_name')" sortable></el-table-column>
        <!-- 显示上传者的电子邮件 -->
        <el-table-column prop="email" :label="$t('database.user.email')" sortable></el-table-column>
        <!-- 显示上传者的电话 -->
        <el-table-column prop="phone" :label="$t('database.user.phone')" sortable></el-table-column>
        <!-- 显示任务开始时间 -->
        <el-table-column prop="start_time" :label="$t('database.task.start_time')" sortable>
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
        <!-- 显示任务结束时间 -->
        <el-table-column prop="end_time" :label="$t('database.task.end_time')" sortable>
          <template #default="{ row }">
            {{ row.end_time ? formatDate(row.end_time) : $t('Notcompletedyet') }}
          </template>
        </el-table-column>
        <!-- 显示任务状态 -->
        <el-table-column prop="status" :label="$t('database.task.status')" sortable>
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <!--显示操作列-->
        
        <el-table-column fixed="right" :label="$t('Operations')" width="100">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="showOptDialog(row)">Detail</el-button>
            </template>
          </el-table-column>
      </el-table>
      </div>

      <!-- 移动端详情对话框 -->
    <el-dialog v-model="optDialogVisible" title="User Details" width="90%" align-center :label="$t('Operations')">
      <div class="operation-buttons">
                <el-button link type="primary" size="small" @click="showAutoProgressDialog(currentRow)">
                  {{ $t('taskManage.Auto') }}
                </el-button>
                <el-button link type="success" size="small" @click="showDownloadFileDialog(currentRow)">
                  {{ $t('Download') }}
                </el-button>
                <el-button link type="" size="small" @click="showDetailDialog(currentRow)">
                  {{ $t('Detail') }}
                </el-button>
                <el-button link type="" size="small" @click="showCharts(currentRow.task_name)" :disabled="currentRow.status !== 2">
                  {{ $t('navigateBar.Virtualization') }}
                </el-button>
                <el-button link type="warning" size="small" @click="showEditDialog(currentRow)">
                  {{ $t('Edit') }}
                </el-button>
                <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">
                  {{ $t('Delete') }}
                </el-button>
      </div>
    </el-dialog>

      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="taskList.length">
      </el-pagination>
    </el-main>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchTaskList">
          {{ $t('Refresh') }}
        </el-button>
        <el-button type="primary" @click="showBatchEditDialog" :disabled="selectedTasks.length === 0">
          {{ $t('taskManage.BatchEdit') }}
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedTasks.length === 0">
          {{ $t('BatchDelete') }}
        </el-button>
        <el-button type="success" @click="showBatchDownloadDialog" :disabled="selectedTasks.length === 0">
          {{ $t('taskManage.BatchDownload') }}
        </el-button>
      </div>
    </div>

    <!-- 自动处理对话框 -->
    <el-dialog v-model="autoProgressDialogVisible" title="Auto Progress" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be auto progressed</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="autoProgressDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="success" @click="autoProgressDialogVisible = false; autoProgress()">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量下载确认对话框 -->
    <el-dialog v-model="batchDownloadDialogVisible" title="Download" width="500">
      <span>The selected tasks will be downloaded. Are you sure?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDownloadDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="success" @click="confirmBatchDownload">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 单个下载确认对话框 -->
    <el-dialog v-model="downloadDialogVisible" title="Download" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be downloaded</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="downloadDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="success" @click="downloadDialogVisible = false; download()">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected tasks?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="danger" @click="confirmBatchDelete">{{ $t('Confirm') }}</el-button>
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
          <el-button @click="batchEditDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="primary" @click="confirmBatchEdit">{{ $t('Save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask.task_name }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteTask()">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务详细信息对话框 -->
    <el-dialog v-model="detailDialogVisible" title="Task Detail" width="550px" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('database.task.task_name')">
          {{ selectedTask.task_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.details')">
          {{ selectedTask.details }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.type')">
          {{ (selectedTask.type?.split(':')[1] || "") === "single"     ? $t('taskType.Singleomic') :
             (selectedTask.type?.split(':')[1] || "") === "multi"      ? $t('taskType.Multiomics') :
             (selectedTask.type?.split(':')[1] || "") === "deno"       ? $t('taskType.Denoising')  : $t('taskType.Unknown')}}
          {{ (selectedTask.type?.split(':')[0] || "") === "annotation" ? $t('taskType.Annotation') :
             (selectedTask.type?.split(':')[0] || "") === "trainning"  ? $t('taskType.Trainning')  :
             (selectedTask.type?.split(':')[0] || "") === "denoising"  ? "" : $t('taskType.Unknown')}}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.models.model_name')">
          {{ selectedTask.model_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.parameters')">
          <el-scrollbar max-height="150px">
            <el-row v-for="(param, index) in (selectedTask.parameters || selectedTask.default_parameters || '').split(',')" :key="index">
              <el-col :span="24">
                <el-tag type="info" class="param-tag">
                  {{ param.trim() }}
                </el-tag>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit Task Status" width="500" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: When setting status completed, end time will be automatically updated.
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
          <el-button @click="editDialogVisible = false">{{ $t('Cancel') }}</el-button>
          <el-button type="primary" @click="confirmEdit">{{ $t('Save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="uploadDialogVisible" title="Upload Required Files" width="500" align-center
      @close="closeUploadDialog">
      <el-form>
        <!-- 文件上传组件 -->
        <el-upload v-model:file-list="uploadedFiles" class="upload" drag action="" multiple
        :auto-upload="false" :accept="'.js'">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              Required files pattern: <br>
              • data_(tsne|umap).js<br>
              • (label|config)[_pred]_(tsne|umap).js
            </div>
            <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
              {{ file.name }}
            </div>
          </template>
        </el-upload>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUploadDialog">{{ $t('Cancel') }}</el-button>
          <el-button type="warning" class="action-button" @click="handleResetClick">{{ $t('Reset') }}</el-button>
          <el-button type="primary" @click="confirmUpload" :disabled="!canUpload">{{ $t('Confirm') }}</el-button>
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
      currentRow: {},
      uploadDialogVisible: false, // 新增状态，用于控制文件上传对话框的显示
      uploadedFiles: [],
      validFiles : [],
      canUpload: true, // 新增状态，用于判断是否可以确认上传
      taskList: [],
      paginatedTaskList: [],
      selectedTasks: [],
      optDialogVisible: false,
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
    showOptDialog(row) {
      this.currentRow = row;
      this.optDialogVisible = true;
    },
    handleResetClick() {
      this.uploadedFiles = [];
      ElMessage.success('Reset success.');
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
    // 检查是否可以上传
    async confirmUpload() {
      try {
        // 初始化数据结构
        const fileGroups = {
          tsne: { data: null, label: [], config: [] },
          umap: { data: null, label: [], config: [] }
        };
        const errors = [];
        // 解析所有文件
        const allFiles = this.uploadedFiles;
        // 文件分类处理
        allFiles.forEach(file => {
          const fileName = file.name.toLowerCase();
          const rawFile = file.raw || file;
          // 使用正则表达式匹配文件名
          const dataMatch = fileName.match(/^data_(tsne|umap)\.js$/);
          const labelMatch = fileName.match(/^label(_pred)?_(tsne|umap)\.js$/);
          const configMatch = fileName.match(/^config(_pred)?_(tsne|umap)\.js$/);
          if (dataMatch) {
            const algo = dataMatch[1];
            if (fileGroups[algo].data) {
              errors.push(`Duplicate data files: ${fileName}`);
            }
            fileGroups[algo].data = rawFile;
          } else if (labelMatch) {
            const algo = labelMatch[2];
            fileGroups[algo].label.push({
              file: rawFile,
              isPred: !!labelMatch[1]
            });
          } else if (configMatch) {
            const algo = configMatch[2];
            fileGroups[algo].config.push({
              file: rawFile,
              isPred: !!configMatch[1]
            });
          } else {
            errors.push(`Invalid file name: ${fileName}`);
          }
        });

        // 验证必需文件
        // 1. 检查至少有一个data文件（tsne或umap）
        const hasData = fileGroups.tsne.data !== null || fileGroups.umap.data !== null;
        if (!hasData) {
          errors.push("At least one data file needs to be uploaded (data_tsne.js or data_umap.js)");
        }
        // 2. 检查至少有一个label文件（tsne或umap）
        const hasLabel = fileGroups.tsne.label.length > 0 || fileGroups.umap.label.length > 0;
        if (!hasLabel) {
          errors.push("At least one tag file needs to be uploaded (label[_pred]_tsne.js or label[_pred]_umap.js)");
        }
        // 3. 检查至少有一个config文件（tsne或umap）
        const hasConfig = fileGroups.tsne.config.length > 0 || fileGroups.umap.config.length > 0;
        if (!hasConfig) {
          errors.push("At least one configuration file needs to be uploaded (config[_pred]_tsne.js or config[_pred]_umap.js)");
        }
        // 4. 最终验证结果
        if (errors.length > 0) {
          ElMessage.error(`File validation failed: \n${errors.join('\n')}`);
          return false;
        }
        // 执行上传
        await this.UploadFiles(fileGroups);
        
        this.updateTaskStatus(this.selectedTask.task_id, 2);
        this.uploadDialogVisible = false;
        this.editDialogVisible = false;
        
        ElMessage.success('The file was uploaded successfully');
        window.location.reload();
      } catch (error) {
        ElMessage.error(`Upload failed: ${error.message}`);
      }
    },
    
    async UploadFiles(fileGroups) {
      try {
        const uploadTasks = [];
        const allFiles = [];
        // 遍历每个算法组
        Object.entries(fileGroups).forEach(([algo, group]) => {
          // 上传data文件（如果存在）
          if (group.data) {
            allFiles.push({ file: group.data, type: 'data', algo });
          }
          // 处理label文件
          group.label.forEach(labelFile => {
            allFiles.push({ 
              file: labelFile.file, 
              type: labelFile.isPred ? 'label_pred' : 'label',
              algo 
            });
          });
          // 处理config文件
          group.config.forEach(configFile => {
            allFiles.push({ 
              file: configFile.file, 
              type: configFile.isPred ? 'config_pred' : 'config',
              algo 
            });
          });
        });
        // 创建上传任务
        allFiles.forEach(({ file, type, algo }) => {
          console.log(file, type, algo)
          uploadTasks.push(this.uploadFile(file, type, algo));
        });
        await Promise.all(uploadTasks);
        // 清空文件列表
        this.uploadedFiles = [];
        
      } catch (error) {
        throw new Error(`File upload error: ${error.message}`);
      }
      this.showTaskNameDialog = false; // 成功上传后关闭对话框
    },
    async uploadFile(file, typePrefix, algorithm) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskName', this.selectedTask.task_name);
      formData.append('userName', this.selectedTask.user_name);
      formData.append('fileType', `${typePrefix}_${algorithm}`);
      
      const response = await axios.post('/api/uploadResult', formData);
      console.log(response.data);
      if (response.data.code !== 1) {
        throw new Error(`${file.name} Upload failed`);
      }
      return response;
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
        params.append('taskName', this.selectedTask.task_name);
        params.append('userName', this.selectedTask.user_name);
        await axios.post("/api/predictProgress", params)
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
        // await axios.get("/api/deleteTaskByID?taskID=" + taskID);
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
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  },
  
  mounted() {
    this.fetchTaskList();
  },
};
</script>

<style scoped>
.param-tag {
  margin: 2px 0;
}

.desktop-view {
  display: flex;
  gap: 8px;
}

.mobile-view {
  display: none;
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


