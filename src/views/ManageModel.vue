<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <section class="fullscreen-section">
      <h1 class="page-name">Manage Model</h1>
      <el-divider />
      <div class="batch-actions">
        <el-button type="success" @click="fetchFeedbacks">
          Refresh
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedDatas.length === 0">
          Batch Delete
        </el-button>
      </div>
      <el-table 
        :data="paginatedListData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <!-- 多选功能 -->
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="modelName" label="Model Name" sortable></el-table-column>
        <el-table-column prop="modelType" label="Model Type" sortable></el-table-column>
        <el-table-column prop="modelPath" label="Model Path" sortable></el-table-column>
        <el-table-column prop="predictFilePath" label="Predict File Path" sortable></el-table-column>
        <el-table-column prop="trainFilePath" label="Train File Path" sortable></el-table-column>
        <el-table-column prop="figurePath" label="Figure Path" sortable></el-table-column>
        <el-table-column fixed="right" label="Operations" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showEditDialog(row)">
              Edit
            </el-button>
            <el-button link type="success" size="small" @click="showParametersDialog(row)">
              Parameters
            </el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="listData.length"></el-pagination>
    </section>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Model <strong style="color: #e74c3c;">{{ selectedData.modelName }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteFeedback(selectedData.feedback_id)">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected models?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit" width="500" align-center>
      <el-form>
        <!-- 输入框 -->
        <el-form :model="selectedData" label-width="150px" label-position="left">
          <el-form-item label="Model Name" class="form-item">
            <el-input v-model="selectedData.modelName" class="form-input"></el-input>
          </el-form-item>
          <el-form-item label="Model Type" class="form-item">
            <el-input v-model="selectedData.modelType" class="form-input"></el-input>
          </el-form-item>
          <el-form-item label="Model Path" class="form-item">
            <el-input v-model="selectedData.modelPath" class="form-input"></el-input>
          </el-form-item>
          <el-form-item label="Predict File Path" class="form-item">
            <el-input v-model="selectedData.predictFilePath" class="form-input"></el-input>
          </el-form-item>
          <el-form-item label="Train File Path" class="form-item">
            <el-input v-model="selectedData.trainFilePath" class="form-input"></el-input>
          </el-form-item>
          <el-form-item label="Figure Path" class="form-item">
            <el-input v-model="selectedData.figurePath" class="form-input"></el-input>
          </el-form-item>
        </el-form>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="" @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="parametersDialogSave()">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="parametersDialogVisible" title="Parameters" width="500" align-center>
      <el-form label-width="150px" label-position="left">
        <!-- 参数输入框 -->
        <el-form-item v-for="(value, key) in parameterDefaults" :key="key" :label="key">
          <el-input v-model.number="parameters[key]" :placeholder="value.toString()"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="parametersDialogReset()">Reset</el-button>
          <el-button type="" @click="parametersDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="parametersDialogSave()">Save</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'FeedbackPage',
  components: {
    MainHeader
  },
  data() {
    return {
      listData: [],
      paginatedListData: [], // 当前页的反馈数据
      deleteDialogVisible: false,
      editDialogVisible: false,
      batchDeleteDialogVisible: false,
      parametersDialogVisible: false,
      selectedData: {},
      selectedDatas: [],
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      parameters: {}, // 选中的模型参数
      parameterDefaults: {}, // 默认参数
      loading:false,
    };
  },
  methods: {
    parametersDialogSave(){
      // TODO
    },
    parametersDialogReset(){
      // TODO
    },
    showBatchDeleteDialog() {
      this.batchDeleteDialogVisible = true;
    },
    showDeleteDialog(data) {
      this.deleteDialogVisible = true;
      this.selectedData = data;
    },
    showEditDialog(data) {
      this.editDialogVisible = true;
      this.selectedData = data;
    },
    showParametersDialog(data) {
      const paramObj = {};
        data.defaultParameters.split(',').forEach(param => {
          const [key, value] = param.split(':');
          paramObj[key.trim()] = isNaN(value) ? value.trim() : parseFloat(value);
      });
      this.parameterDefaults = paramObj;
      this.parameters = paramObj;
      this.parametersDialogVisible = true;
      this.selectedData = data;
    },
    handleSelectionChange(val) {
      this.selectedDatas = val;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting();
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.listData.sort((a, b) => {
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
      this.updatePaginatedFeedbackList();
    },
    updatePaginatedFeedbackList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedListData = this.listData.slice(start, end);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedFeedbackList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedFeedbackList();
    },
    async fetchFeedbacks() {
      try {
        this.loading = true;
        const response = await axios.get('/api/models/findAllModels'); // 调用后端API
        this.listData = response.data;
        this.applySorting();
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    },
    async deleteFeedback(feedbackId) {
      try {
        const response = await axios.delete(`/api/deleteFeedback/${feedbackId}`);
        if (response.data.code === 1) {
          ElMessage.success('Feedback deleted successfully');
          this.fetchFeedbacks();
        } else {
          console.error('Failed to delete feedback:', response.data.msg);
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to delete feedback:', error);
      }
    },
    async deleteFeedbackID(feedbackId) {
      try {
        await axios.delete(`/api/deleteFeedback/${feedbackId}`);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const feedback of this.selectedDatas) {
        await this.deleteFeedbackID(feedback.feedback_id);
      }
      ElMessage.success('Batch delete success.');
      this.fetchFeedbacks();
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  },
  mounted() {
    this.fetchFeedbacks();
  },
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
</style>
