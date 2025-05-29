<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageFeedbacks') }}</h1>
      <el-divider />

      <div>
        <el-table 
        :data="paginatedFeedbackList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <!-- 多选功能 -->
        <el-table-column type="selection" width="55"></el-table-column>
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
        <el-table-column prop="email" :label="$t('database.user.email')" sortable min-width="180"></el-table-column>
        <el-table-column prop="phone" :label="$t('database.user.phone')" sortable min-width="160"></el-table-column>
        <el-table-column prop="subject" :label="$t('database.feedback.subject')" sortable min-width="170px"></el-table-column>
        <el-table-column prop="created_time" :label="$t('database.feedback.created_time')" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_time) }}
          </template>
        </el-table-column>
        
        <el-table-column fixed="right" :label="$t('Operations')" width="220" v-if="!isMobile">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showMessageDialog(row)">
              {{ $t('feedback.Message') }}
            </el-button>
            <el-button link type="success" size="small" @click="showReplyDialog(row)">{{ $t('feedback.AdminReply') }}</el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">{{ $t('Delete') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" width="120" v-if="isMobile">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showOptDialog(row)">
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
        :total="feedbackList.length"
        :small="isMobile"
        :hide-on-single-page="false">
      </el-pagination>
    </el-main>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchFeedbacks">
          {{ $t('Refresh') }}
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedFeedbacks.length === 0">
          {{ $t('BatchDelete') }}
        </el-button>
      </div>
    </div>

<!-- 回复对话框 -->
<el-dialog
    v-model="replyDialogVisible" 
    :title="`Reply to ${selectedFeedback.user_name}`" 
    :width="isMobile ? '95%' : '700px'"
  >
    <el-input
      v-model="replyContent"
      type="textarea"
      :rows="6"
      placeholder="Please enter your reply..."
      clearable
    ></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelReply">Cancel</el-button>
        <el-button type="primary" @click="sendReply">Send</el-button>
      </div>
    </template>
  </el-dialog>

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

    <el-dialog v-model="optDialogVisible" title="Feedback Details" width="90%" align-center :label="$t('Operations')">
      <div class="operation-buttons">
        <el-button link type="primary" size="small" @click="showMessageDialog(currentRow)">
          {{ $t('Message') }}
        </el-button>
        <el-button link type="success" size="small" @click="showReplyDialog(currentRow)">
          {{ $t('Reply') }}
        </el-button>
        <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">
          {{ $t('Delete') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';
import logo from '../assets/logo.png';

export default {
  name: 'FeedbackPage',
  components: {
    MainHeader
  },
  data() {
    return {
      currentRow: {},
      feedbackList: [],
      paginatedFeedbackList: [], // 当前页的反馈数据
      optDialogVisible: false,
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
      replyDialogVisible: false,
      replyContent: '',
      selectedFeedbackId: null,
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

    showReplyDialog(feedback) {
      this.selectedFeedback = feedback;
      this.selectedFeedbackId = feedback.feedback_id;
      this.replyContent = feedback.reply_content || ''; // 如果有历史回复可以显示
      this.replyDialogVisible = true;
    },

    cancelReply() {
      this.replyDialogVisible = false;
      this.replyContent = '';
    },

    async sendReply() {
      if (!this.replyContent.trim()) {
        ElMessage.warning('Reply content cannot be empty');
        return;
      }
      
      try {
        const feedbackReply = {
          feedbackId: this.selectedFeedbackId,
          userId: this.selectedFeedback.user_id,
          replyContent: this.replyContent,
          subject: this.selectedFeedback.subject,
        }
        const response = await axios.post('/api/replyFeedback', feedbackReply);
        
        if (response.data.code === 1) {
          ElMessage.success('Reply sent successfully');
          // 更新本地数据或刷新列表
          this.fetchFeedbacks();
          this.replyDialogVisible = false;
          this.replyContent = '';
        } else {
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to send reply:', error);
        ElMessage.error('Failed to send reply');
      }
    },

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
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};

</script>

<style scoped>
.el-textarea {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.replyDialog {
  width: 600px;
  max-width: 80%;
}
</style>
