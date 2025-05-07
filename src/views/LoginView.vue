<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-page-header">
        <div class="header-logo">
          <img class="logo" src="../assets/logo.png" alt="Logo" />
        </div>
        <h1 class="title">Sign in to SCGADS</h1>
        <h4 class="subtitle">
          Don't have your account yet?
          <a href="/Register">Register now</a>
        </h4>
      </div>
      <div class="login-page-body">
        <el-form :model="loginForm">
          <el-form-item prop="username"
            :rules="[{ required: true, message: 'Please input username', trigger: 'blur' }]">
            <el-input v-model="loginForm.username" placeholder="Username" class="input-field"></el-input>
          </el-form-item>
          <el-form-item prop="password"
            :rules="[{ required: true, message: 'Please input password', trigger: 'blur' }]">
            <el-input v-model="loginForm.password" type="password" placeholder="Password"
              class="input-field" show-password></el-input>
          </el-form-item>
        </el-form>
        <el-divider></el-divider>
        <el-button type="primary" class="submit-button" @click="onShow">Sign in to
          SCGADS</el-button>
        <Vcode :show="isShow" @success="onSuccess" @close="onClose" slider-text="Slide to complete the puzzle"
          success-text="Verification successful!" fail-text="Verification Failed!"/>
        <div class="backHome">
          <a href="/HomeView">Home</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from "vue";
import Vcode from "vue3-puzzle-vcode";
import { ElMessage } from 'element-plus';
const loginForm = ref({
  username: '',
  password: ''
});


const submitForm = async () => {
  const response = await axios.post('/api/login', { userName: loginForm.value.username, password: loginForm.value.password });
  if (response.data.code == 200) {
    sessionStorage.setItem('userData', JSON.stringify(response.data.data));
    ElMessage.success('Login success.');
    window.location.href = '/HomeView';
  }
  else
    ElMessage.error('The username or password is incorrect, or your request has not been approved by the administrator.');
};

const isShow = ref(false);

const onShow = () => {
  isShow.value = true;
};

const onClose = () => {
  isShow.value = false;
};

const onSuccess = () => {
  onClose();
  submitForm();
};
</script>

<script>
export default {
    name: "LoginView",
    data() {
        return {
            isDarkMode: false, // 黑暗模式开关
        };
    },
    mounted() {
        this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
        if (this.isDarkMode) {
            document.body.classList.toggle('dark-mode', this.isDarkMode);
            document.documentElement.setAttribute('class', 'dark');
        }
    },
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f7f7f7;
  padding: 0 20px;
}

.login-box {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.header-logo .logo {
  width: 120px;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 30px;
}

.input-field {
  width: 100%;
  height: 40px;
  margin-bottom: 0px;
  border-radius: 4px;
}

.submit-button {
  width: 100%;
  height: 40px;
  margin-top: 20px;
  font-size: 16px;
}

.backHome {
  margin-top: 20px;
  font-size: 14px;
}

.backHome a {
  color: #409eff;
  text-decoration: none;
}

.backHome a:hover {
  text-decoration: underline;
}
</style>
