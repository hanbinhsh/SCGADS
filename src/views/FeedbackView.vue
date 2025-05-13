<template>
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <!-- 桌面端侧边栏 -->
    <el-aside class="sidebar animate__animated animate__fadeInLeft" v-if="!isMobile" :width="isCollapsed ? '64px' : '150px'">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon :class="{ 'rotate-180': isCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>
      <el-menu :default-active="activeTask" class="task-menu" @select="handleMenuSelect" mode="vertical" :collapse="isCollapsed">
        <el-menu-item index="feedback">
          <font-awesome-icon :icon="['fas', 'message']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('feedback.sendfeedback') }}</span>
        </el-menu-item>
        <el-menu-item index="history">
          <font-awesome-icon :icon="['fas', 'clock-rotate-left']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('feedback.history') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!-- 移动端侧边栏（顶部水平菜单） -->
    <el-header class="mobile-nav animate__animated animate__fadeInDown" v-if="isMobile">
      <el-menu :default-active="activeTask" class="task-menu" @select="handleMenuSelect" mode="horizontal">
        <el-menu-item index="feedback">
          <font-awesome-icon :icon="['fas', 'message']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('feedback.sendfeedback') }}</span>
        </el-menu-item>
        <el-menu-item index="history">
          <font-awesome-icon :icon="['fas', 'clock-rotate-left']" style="margin-left: 5px;margin-right: 10px;" />
          <span>{{ $t('feedback.history') }}</span>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="fullscreen-section">
      <el-row type="flex" justify="start" class="feedback-container">
        <!-- 右侧内容区域 -->
        <el-col :span="isMobile ? 24 : 15" class="content-col animate__animated animate__fadeInRight">
          <!-- 反馈表单 -->
          <el-card v-show="activeMenu === 'feedback'" shadow="always" class="content-card">
            <template #header>
              <div>
                <span>{{ $t('feedback.feedback') }}</span>
                <p class="feedback-text">{{ $t('feedback.feedbacktip') }}</p>
              </div>
            </template>
            <div class="card-body">
              <el-form ref="feedbackForm" :model="feedbackForm" :label-width="isMobile ? '80px' : '120px'" class="feedback-form">
                <el-form-item :label="$t('feedback.Subject')" prop="subject">
                  <el-input v-model="feedbackForm.subject" :placeholder="$t('feedback.Subject')" class="input-field"></el-input>
                </el-form-item>
                <el-form-item :label="$t('feedback.Message')" prop="message">
                  <el-input type="textarea" :rows="isMobile ? 5 : 8" v-model="feedbackForm.message" :placeholder="$t('feedback.Message')" class="textarea-field"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitForm" class="submit-button">
                    {{ $t('feedback.SendMessage') }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 反馈历史 -->
          <el-card v-show="activeMenu === 'history'"shadow="always" class="content-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t('feedback.Responsestofeedback') }}</span>
                <el-button size="small" @click="getFeedbackHistory"class="refresh-button">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="card-body">
              <el-table :data="feedbackReplyList" style="width: 100%"v-loading="loading" :empty-text="$t('feedback.Noreply')">
                <el-table-column prop="subject" :label="$t('feedback.Subject')" sortable />
                <el-table-column prop="created_time" :label="$t('feedback.Date')" width="180" sortable>
                  <template #default="{ row }">
                    {{ formatDate(row.replyTime) }}
                  </template>
                </el-table-column>
                <el-table-column fixed="right" :label="$t('Operations')" :width="isMobile ? 110 :220">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="showMessageDialog(row)">
                      {{ $t('feedback.View') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from "axios";
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  components: {
    MainHeader,
    Refresh
  },
  setup() {
    const isMobile = ref(false);
    const collapseActive = ref([]); // 控制移动端侧边栏的折叠状态
    
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 768;
    };
    
    onMounted(() => {
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize);
    });
    
    return {
      isMobile,
      collapseActive
    };
  },
  data() {
    return {
      activeMenu: 'feedback',
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},
      feedbackForm: {
        userId: '',
        subject: '',
        message: '',
        createTime: ''
      },
      feedbackReplyList: [],
      loading: false,
      isCollapsed: false,
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    },
    handleMenuSelect(index) {
      this.activeMenu = index;
      if (index === 'history') {
        this.getFeedbackHistory();
      }
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Store sidebar state in localStorage for persistence
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    async getFeedbackHistory() {
      this.loading = true;
      try {
        const response = await axios.get("/api/findFeedbackReply", {
          params: { userId: this.userData.userId }
        });
        console.log('Raw response data:', response.data.data);

        if (response.data.code === 200) {
          // 新增数据结构转换逻辑
          this.feedbackReplyList = this.transformResponseData(response.data.data);
          console.log('Transformed feedbackReplyList:', this.feedbackReplyList);
        }
      } catch (error) {
        console.error("Failed to get feedback:", error);
        ElMessage.error("Failed to load feedback history");
      } finally {
        this.loading = false;
      }
    },

    // 新增数据转换方法
    transformResponseData(rawData) {
      return Object.values(rawData).map(item => ({
        createTime: item.feedbackDate || item.createTime, // 适配不同字段名
        subject: item.feedbackSubject || item.subject,
        message: item.feedbackContent || item.message,
        replyContent: item.reply_content || item.adminReply,
        replyTime: item.reply_time // 保留原始字段
      }));
    },
    async submitForm() {
      if (!this.feedbackForm.subject || !this.feedbackForm.message) {
        ElMessage.error('Please fill in all the fields');
        return;
      }
      
      try {
        this.feedbackForm.userId = this.userData.userId;
        const response = await axios.post("/api/feedback", this.feedbackForm);
        
        if (response.data.code === 1) {
          ElMessage.success("Feedback submitted successfully");
          this.$refs.feedbackForm.resetFields();
          if (this.activeMenu === 'history') {
            await this.getFeedbackHistory();
          }
        } else {
          ElMessage.error(response.data.msg || "Submission failed");
        }
      } catch (error) {
        console.error("Feedback submission error:", error);
        ElMessage.error("Failed to submit feedback");
      }
    },
    showMessageDialog(row) {
      this.$alert(
        `
        ${row.replyContent ? `
        <p><strong>${ this.$t('feedback.AdminReply') }:</strong></p>
        <p>${row.replyContent}</p>` : ''}`,
        
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: 'OK'
        }
      );
    }
  },
  mounted() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
  },
};
</script>

<style scoped>
.feedback-text {
  color: #666;
  margin-top: 10px;
  font-size: 14px;
}
.dark-mode .feedback-text {
  color: #a0a0a0;
}
.content-col{
  margin: auto;
}

@media (max-width: 768px) {
  .fullscreen-section{
    padding: 10px;
    margin-top: 0;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.submit-button{
  width: 100%;
}
</style>