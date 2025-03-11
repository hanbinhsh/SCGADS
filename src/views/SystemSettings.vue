<template> 
  <el-container class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <el-row type="flex" justify="center" class="animate__animated animate__fadeInUp settings-container">
        <el-col :xs="22" :sm="16" :md="12" :lg="10">
          <el-card class="form-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t('navigateBar.SystemSettings') }}</span>
              </div>
            </template>
            <el-form :label-width="isMobile ? '40%' : '30%'">
              <el-alert type="info" show-icon :closable="false">
                <p>Only set Auto Progress off if you have not put models online.</p>
              </el-alert>
              <br>
              <el-form-item v-for="(value, key) in parameterDefaults" :key="key" :label="key">
                <el-switch v-model.number="parameters[key]" :placeholder="value.toString()" class="full-width" />
              </el-form-item>
              <hr>
              <el-button type="success" @click="submitForm" class="submit-button">{{ $t('Save') }}</el-button>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from "axios";
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  components: {
    MainHeader
  },
  setup() {
    const isMobile = ref(false);
    
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
      isMobile
    };
  },
  data() {
    return {
      parameters: {
        "Auto Progress": true,
      },
      parameterDefaults: {
        "Auto Progress": true,
      },
      userData: JSON.parse(sessionStorage.getItem('userData')) || {}, // 存储用户信息
    };
  },
  created() {
    // 页面加载时从后端获取配置
    this.fetchConfig();
  },
  methods: {
    // 提交表单并保存配置
    async submitForm() {
      try {
        const response = await axios.post("/api/system-settings/saveConfig", this.parameters);
        this.$message.success('Settings saved successfully!');
      } catch (error) {
        this.$message.error('Error saving settings!');
      }
    },
    // 请求后端配置文件并应用到表单
    async fetchConfig() {
      try {
        const response = await axios.get("/api/system-settings/config");
        this.parameters = response.data || this.parameters; // 如果没有配置，使用默认值
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    }
  }
};
</script>

<style scoped>
.settings-container {
  margin-top: 20px;
  padding: 0 10px;
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

.el-form-item {
    width:400px;
  }

@media screen and (max-width: 767px) {
  .settings-container {
    margin-top: 15px;
  }
  
  .el-form-item {
    width:300px;
  }

  .submit-button {
    padding: 8px 15px;
    font-size: 14px;
  }
  
  .el-alert p {
    font-size: 13px;
  }
}
</style>