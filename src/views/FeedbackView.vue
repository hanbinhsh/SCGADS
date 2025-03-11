<template>
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center" class="animate__animated animate__fadeInUp">
        <el-col :span="10">
          <el-card shadow="always">
            <template #header>
              <div slot="header" class="card-header">
                <span>Feedback</span>
                <p class="feedback-text">You can submit your feedback below, and we will get your message.</p>
              </div>
            </template>
            <div class="card-body">
              <el-form ref="feedbackForm" :model="feedbackForm" label-width="120px" class="feedback-form">
                <el-form-item label="Subject" prop="subject">
                  <el-input v-model="feedbackForm.subject" placeholder="Subject" class="input-field"></el-input>
                </el-form-item>
                <el-form-item label="Message" prop="message">
                  <el-input type="textarea" :rows="8" v-model="feedbackForm.message" placeholder="Your Message"
                    class="textarea-field"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitForm" class="submit-button">Send Message</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="always">
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
                <el-table-column prop="createTime" label="Date" width="180" />
                <el-table-column prop="subject" label="Subject" />
                <el-table-column fixed="right" :label="$t('Operations')" width="220">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showMessageDialog(row)">
              Message
            </el-button>
          </template>
        </el-table-column>
                <el-table-column type="expand">
                  <template #default="{row}">
                    <div class="feedback-details">
                      <p><strong>Your Message:</strong></p>
                      <p class="message-content">{{ row.message }}</p>
                      <p v-if="row.replyContent"><strong>Admin Reply:</strong></p>
                      <p class="reply-content">{{ row.replyContent }}</p>
                    </div>
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
import MainHeader from "../components/MainHeader.vue"
import axios from "axios";
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
export default {
  components: {
    MainHeader,
    Refresh
  },
  data() {
    return {
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},//存用户信息
      feedbackForm: {
        userId: '',
        subject: '',
        message: '',
        createTime: ''
      },
      feedbackReplyList: [], // 新增反馈列表
      loading: false
    };
  },
  mounted() {
    this.getFeedbackHistory();
  },
  methods: {
    async getFeedbackHistory() {
      this.loading = true;
      try {
        const response = await axios.get("/api/findFeedbackReply", {
          params: { userId: this.userData.userId }
        });
        if (response.data.code === 1) {
          this.feedbackReplyList = response.data.data;
        }
      } catch (error) {
        console.error("Failed to get feedback:", error);
        ElMessage.error("Failed to load feedback history");
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      console.log('Feedback submitted:', this.feedbackForm);
      if (this.feedbackForm.subject === '' || this.feedbackForm.message === '') {
        ElMessage.error('Please fill in all the fields');
        return;
      }
      this.feedbackForm.userId = this.userData.userId;
      try {
        await axios.post("/api/feedback", this.feedbackForm)
          .then(response => {
            if (response.data.code === 1) {
              ElMessage.success("Feedback success");

            } else {
              console.error("Feedback failed:", response.data.msg);
              ElMessage.error(response.data.msg);
            }
          })
          .catch(error => {
            console.error("Feedback failed:", error);
          });
      } catch (error) {
        console.error("Feedback failed:", error);
      }
      // 重置表单
      this.$refs.feedbackForm.resetFields();
    }
  }
};
</script>

<style scoped>
.dark-mode .card-header{
  color: #EEE;
}

.card-body {
  padding: 0px 20px 0px 20px;
}

.feedback-text {
  color: #666;
  font-size: 16px;
}

.dark-mode .feedback-text{
  color: #EEE;
}

.contact-info {
  color: #409eff;
  font-size: 14px;
  margin-bottom: 20px;
}

.input-field,
.textarea-field {
  border-radius: 4px;
}

.submit-button {
  width: 100%;
  border-radius: 4px;
  font-size: 16px;
  padding: 10px 20px;
}
</style>
