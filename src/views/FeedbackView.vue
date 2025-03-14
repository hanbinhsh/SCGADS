<template>
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="start" class="feedback-container">
        <!-- 电脑端侧边栏 -->
        <el-col v-if="!isMobile" :span="4" class="sidebar-col">
          <el-card shadow="always" class="sidebar-card">
            <el-menu 
              :default-active="activeMenu"
              class="side-menu"
              @select="handleMenuSelect"
            >
              <el-menu-item index="feedback">
                <span>Submit Feedback</span>
              </el-menu-item>
              <el-menu-item index="history">
                <span>Feedback History</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 移动端侧边栏 -->
        <el-col v-if="isMobile" :span="24" class="mobile-sidebar-col">
          <el-collapse v-model="collapseActive">
            <el-collapse-item title="Menu" name="1">
              <el-menu 
                :default-active="activeMenu"
                class="side-menu"
                @select="handleMenuSelect"
              >
                <el-menu-item index="feedback">
                  <span>Submit Feedback</span>
                </el-menu-item>
                <el-menu-item index="history">
                  <span>Feedback History</span>
                </el-menu-item>
              </el-menu>
            </el-collapse-item>
          </el-collapse>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col :span="isMobile ? 24 : 20" class="content-col">
          <!-- 反馈表单 -->
          <el-card 
            v-show="activeMenu === 'feedback'"
            shadow="always" 
            class="content-card"
          >
            <template #header>
              <div class="card-header">
                <span>Feedback</span>
                <p class="feedback-text">You can submit your feedback below, and we will get your message.</p>
              </div>
            </template>
            <div class="card-body">
              <el-form 
                ref="feedbackForm" 
                :model="feedbackForm" 
                :label-width="isMobile ? '80px' : '120px'" 
                class="feedback-form"
              >
                <el-form-item label="Subject" prop="subject">
                  <el-input 
                    v-model="feedbackForm.subject" 
                    placeholder="Subject" 
                    class="input-field"
                  ></el-input>
                </el-form-item>
                <el-form-item label="Message" prop="message">
                  <el-input 
                    type="textarea" 
                    :rows="isMobile ? 5 : 8" 
                    v-model="feedbackForm.message" 
                    placeholder="Your Message"
                    class="textarea-field"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="submitForm" 
                    class="submit-button"
                  >
                    Send Message
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 反馈历史 -->
          <el-card 
            v-show="activeMenu === 'history'"
            shadow="always" 
            class="content-card"
          >
            <template #header>
              <div class="card-header">
                <span>Responses to feedback</span>
                <el-button 
                  size="small" 
                  @click="getFeedbackHistory"
                  class="refresh-button"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="card-body">
              <el-table 
                :data="feedbackReplyList" 
                style="width: 100%"
                v-loading="loading"
                empty-text="No reply"
              >
                <el-table-column prop="replyTime" label="Date" width="180" />
                <el-table-column prop="subject" label="Subject" />
                <el-table-column fixed="right" label="Operations" width="220">
                  <template #default="{ row }">
                    <el-button 
                      link 
                      type="primary" 
                      size="small" 
                      @click="showMessageDialog(row)"
                    >
                      Message
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
      loading: false
    };
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
      if (index === 'history') {
        this.getFeedbackHistory();
      }
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
        <p><strong>Admin Reply:</strong></p>
        <p>${row.replyContent}</p>` : ''}`,
        
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: 'OK'
        }
      );
    }
  }
};
</script>

<style scoped>
/* 移动端样式 */
.mobile-sidebar-col {
  margin-bottom: 20px;
}

.mobile-sidebar-col .el-collapse {
  border: none;
}

.mobile-sidebar-col .el-collapse-item__header {
  font-size: 16px;
  font-weight: 500;
  padding: 10px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.mobile-sidebar-col .el-collapse-item__content {
  padding: 0;
}

.mobile-sidebar-col .side-menu {
  border: none;
}

.mobile-sidebar-col .el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

/* 电脑端样式 */
.feedback-container {
  display: flex;
  flex-wrap: nowrap;
}

.sidebar-col {
  flex: 0 0 16.6667%; /* 4/24 */
  max-width: 16.6667%; /* 4/24 */
  margin-right: 20px;
}

.sidebar-card {
  min-height: 400px;
  border-radius: 8px;
}

.content-col {
  flex: 0 0 83.3333%; /* 20/24 */
  max-width: 83.3333%; /* 20/24 */
}

.content-card {
  min-height: 400px;
  border-radius: 8px;
}

.side-menu {
  border-right: none;
  background: transparent;
}

.side-menu .el-menu-item {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
  transition: all 0.3s;
}

.side-menu .el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
}

.card-header span {
  font-size: 20px;
  font-weight: 500;
}

.feedback-text {
  color: #666;
  margin-top: 10px;
  font-size: 14px;
}

.feedback-form {
  padding: 20px;
}

.input-field,
.textarea-field {
  border-radius: 6px;
}

.submit-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.feedback-details {
  padding: 20px;
}

.message-content,
.reply-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

@media screen and (max-width: 768px) {
  .sidebar-col {
    display: none;
  }
  
  .content-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .feedback-container {
    margin-top: 20px;
    padding: 0 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .feedback-form {
    padding: 15px;
  }
  
  .submit-button {
    height: 40px;
    font-size: 14px;
  }
}

.dark-mode .feedback-text {
  color: #a0a0a0;
}

.dark-mode .side-menu .el-menu-item {
  color: #e0e0e0;
}

.dark-mode .side-menu .el-menu-item.is-active {
  background-color: var(--el-color-primary-dark-2);
}
</style>