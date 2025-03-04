<template>
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center">
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
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import MainHeader from "../components/MainHeader.vue"
import axios from "axios";
import { ElMessage } from 'element-plus';

export default {
  components: {
    MainHeader
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
    };
  },
  methods: {
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
.card-header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

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
