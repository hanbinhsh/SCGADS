<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <section class="fullscreen-section">
      <h1 class="page-name">Manage Feedbacks</h1>
      <el-divider />
      <el-table 
        :data="paginatedFeedbackList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
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
        <el-table-column prop="email" label="User Email" sortable></el-table-column>
        <el-table-column prop="phone" label="User Phone" sortable></el-table-column>
        <el-table-column prop="subject" label="Subject" sortable></el-table-column>
        <el-table-column prop="created_time" label="Create Time" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Operations" width="180">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showMessageDialog(row)">
              Message
            </el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="feedbackList.length"></el-pagination>
    </section>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchFeedbacks">
          Refresh
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedFeedbacks.length === 0">
          Batch Delete
        </el-button>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Feedback <strong style="color: #e74c3c;">{{ selectedFeedback.subject }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteFeedback(selectedFeedback.feedback_id)">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected feedbacks?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="messageDialogVisible" title="Message" width="500" align-center>
      <span>{{ selectedFeedback.message }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="messageDialogVisible = false">Confirm</el-button>
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
      feedbackList: [],
      paginatedFeedbackList: [], // 当前页的反馈数据
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      messageDialogVisible: false,
      selectedFeedback: {},
      selectedFeedbacks: [],
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      loading:false,
    };
  },
  methods: {
    showDeleteDialog(feedback) {
      this.deleteDialogVisible = true;
      this.selectedFeedback = feedback;
    },
    showBatchDeleteDialog() {
      this.batchDeleteDialogVisible = true;
    },
    showMessageDialog(feedback) {
      this.messageDialogVisible = true;
      this.selectedFeedback = feedback;
    },
    handleSelectionChange(val) {
      this.selectedFeedbacks = val;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting();
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.feedbackList.sort((a, b) => {
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
      this.paginatedFeedbackList = this.feedbackList.slice(start, end);
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
        const response = await axios.get('/api/findAllFeedbackWithUserInformation');
        if (response.data.code === 200) {
          const dataObject = response.data.data;
          this.feedbackList = Object.values(dataObject);
          this.applySorting();
        } else {
          console.error('Failed to fetch feedbacks:', response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
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
      for (const feedback of this.selectedFeedbacks) {
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
