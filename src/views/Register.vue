<template>
  <div class="register-page">
    <div class="register-box">
      <div class="register-page-header">
        <img class="logo" src="../assets/logo.png" alt="Logo" />
        <h1 class="title">Sign up for SCGADS</h1>
        <p class="subtitle">Create an account to log in to the system</p>
      </div>
      <el-steps :active="activeStep" finish-status="success" class="steps" align-center>
        <el-step title="Account"></el-step>
        <el-step title="Information"></el-step>
        <el-step title="Agreement"></el-step>
        <el-step title="Submit"></el-step>
      </el-steps>
      <el-form ref="Form" :model="form" label-width="80px" class="register-form">
        <div v-if="activeStep === 0">
          <el-form-item label="UserName" prop="userName" :rules="[{ validator: userName, trigger: 'blur' }]">
            <el-input v-model="form.userName" placeholder="User name"></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="password" :rules="[{ validator: validatePass, trigger: 'blur' }]">
            <el-input type="password" v-model="form.password" placeholder="Password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Confirm" prop="confirm" :rules="[{ validator: validatePass2, trigger: 'blur' }]">
            <el-input type="password" v-model="form.confirm" placeholder="Confirm Password"
              autocomplete="off"></el-input>
          </el-form-item>
        </div>
        <div v-if="activeStep === 1">
          <el-form-item label="Phone" prop="phone" :rules="[{ validator: phone, trigger: 'blur' }]">
            <el-input v-model="form.phone" placeholder="Phone Number"></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email" :rules="[{ validator: email, trigger: 'blur' }]">
            <el-input v-model="form.email" placeholder="Email Address"></el-input>
          </el-form-item>
        </div>
        <div v-if="activeStep === 2" class="agreement-step">
          <el-checkbox v-model="form.acceptTerms" style="text-align: center;">
            I agree to the <a href="#">User Agreement</a> and <a href="#">Privacy Policy</a>
          </el-checkbox>
        </div>
      </el-form>
      <div class="step-buttons">
        <el-button v-if="activeStep > 0" @click="previous">Previous Step</el-button>
        <el-button v-if="activeStep < 3" type="primary" @click="next">Next Step</el-button>
        <el-button v-if="activeStep === 3" type="success" @click="submitForm">Submit</el-button>
      </div>
      <div class="footer-links">
        <p class="text-muted">Already have an account? <a href="/Login">Login</a></p>
        <a href="/HomeView">Return to Home</a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'RegisterForm',
  data() {
    return {
      isDarkMode: false, // 黑暗模式开关
    };
  },
  setup() {
    const form = reactive({
      userName: '',
      password: '',
      confirm: '',
      phone: '',
      email: '',
      isAdmin: 0,
      acceptTerms: false
    });
    const activeStep = ref(0);
    const router = useRouter();

    const goToHome = () => {
      router.push({ name: 'HomeView' });
    };
    const goToLogin = () => {
      router.push({ name: 'Login' });
    };
    const next = () => {
      if (activeStep.value === 0) {
        if (form.userName && form.password && form.confirm && form.password === form.confirm) {
          activeStep.value++;
        } else {
          ElMessage.error('Please fill in the information correctly!');
        }
      } else if (activeStep.value === 1) {
        const phoneReg = /^[1][3-9][0-9]{9}$/;
        const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (phoneReg.test(form.phone) && emailRegExp.test(form.email)) {
          activeStep.value++;
        } else {
          ElMessage.error('Please enter valid phone and email information!');
        }
      } else if (activeStep.value === 2) {
        if (form.acceptTerms) {
          activeStep.value++;
        } else {
          ElMessage.error('Please accept the terms and policies!');
        }
      }
    };
    const previous = () => {
      activeStep.value--;
    };
    const userName = (rule, value, callback) => {
      if (!value) callback(new Error('Please enter a username'));
      else callback();
    };
    const validatePass = (rule, value, callback) => {
      if (!value) callback(new Error('Please input the password'));
      else callback();
    };
    const validatePass2 = (rule, value, callback) => {
      if (!value) callback(new Error('Please input the password again'));
      else if (value !== form.password) callback(new Error("Two inputs don't match!"));
      else callback();
    };
    const phone = (rule, value, callback) => {
      const reg = /^[1][3-9][0-9]{9}$/;
      if (!value) callback(new Error('Please enter a phone number'));
      else if (!reg.test(value)) callback(new Error('Please input correct phone number'));
      else callback();
    };
    const email = (rule, value, callback) => {
      const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value) callback(new Error('Please enter your email'));
      else if (!emailRegExp.test(value)) callback(new Error('Please input a correct email address'));
      else callback();
    };

    const submitForm = () => {
      const formData = {
        userName: form.userName,
        psw: form.password,
        email: form.email,
        isAdmin: form.isAdmin,
        phone: form.phone
      };
      axios.post("/api/register", formData)
        .then(response => {
          if (response.data.code === 1) {
            ElMessage.success("Registration is successful");
            setTimeout(() => {
              router.push({ name: 'Login' });
            }, 2000);
          } else {
            ElMessage.error(response.data.msg);
          }
        })
        .catch(error => {
          ElMessage.error("Registration failed");
          console.error("Registration failed:", error);
        });
    };

    return {
      form,
      activeStep,
      submitForm,
      next,
      previous,
      userName,
      validatePass,
      validatePass2,
      phone,
      email,
      goToHome,
      goToLogin,
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
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f7f7f7;
  padding: 20px;
}

.register-box {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
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

.steps {
  margin: 20px 0;
}

.register-form {
  text-align: left;
}

.step-buttons {
  text-align: center;
  justify-content: space-between;
  margin-top: 20px;
}

.footer-links {
  margin-top: 20px;
  font-size: 14px;
}

.footer-links a {
  color: #409eff;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>
