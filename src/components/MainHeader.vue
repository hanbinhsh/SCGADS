<template>
    <div class="header-container">
        <el-menu :default-active="activeIndex" class="el-menu main-header" mode="horizontal" :ellipsis="false"
            @select="handleSelect" :router="true">
            <el-menu-item index="HomeView" :class="{ 'is-active': activeIndex === 'HomeView' }">
                <img style="width: 50px" src="../assets/logo.png" alt="logo" />
            </el-menu-item>
            <el-menu-item index="Login" :class="{ 'is-active': activeIndex === 'Login' }" v-if="!userData.userName">
                Login
            </el-menu-item>
            <el-menu-item index="Register" :class="{ 'is-active': activeIndex === 'Register' }"
                v-if="!userData.userName">
                Register
            </el-menu-item>
            <el-sub-menu v-if="userData.userName" index="1">
                <template #title>
                    <el-avatar
                        :src="userData.avatarBase64 ? 'data:image/jpeg;base64,' + userData.avatarBase64 : defaultAvatar"
                        size="small"></el-avatar>&nbsp;
                    {{ userData.userName }}
                </template>
                <el-menu-item index="Profile" :class="{ 'is-active': activeIndex === 'Profile' }"
                    id="Profile">Profile</el-menu-item>
                <el-menu-item @click="logout()">Log out</el-menu-item>
            </el-sub-menu>
            <el-sub-menu v-if="userData.userName && userData?.isAdmin" index="2">
                <template #title>
                    Manage
                </template>
                <el-menu-item index="ManageUser" :class="{ 'is-active': activeIndex === 'ManageUser' }"
                    v-if="userData?.isAdmin">
                    Manage Users
                </el-menu-item>
                <el-menu-item index="ManageTasks" :class="{ 'is-active': activeIndex === 'ManageTasks' }"
                    v-if="userData?.isAdmin">
                    Manage Tasks
                </el-menu-item>
                <el-menu-item index="ManageFeedback" :class="{ 'is-active': activeIndex === 'ManageFeedback' }"
                    v-if="userData.userName && userData.isAdmin">
                    Manage Feedbacks
                </el-menu-item>
                <el-menu-item index="ManageModel" :class="{ 'is-active': activeIndex === 'ManageModel' }"
                    v-if="userData.userName && userData.isAdmin">
                    Manage Model
                </el-menu-item>
                <el-menu-item index="SystemSettings" :class="{ 'is-active': activeIndex === 'SystemSettings' }"
                    v-if="userData.userName && userData.isAdmin">
                    System Settings
                </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="WorkSpace" :class="{ 'is-active': activeIndex === 'WorkSpace' }" id="WorkSpase"
                v-if="userData.userName">
                WorkSpace
            </el-menu-item>
            <el-menu-item index="Upload" :class="{ 'is-active': activeIndex === 'Upload' }" v-if="userData.userName">
                Upload
            </el-menu-item>
            <el-menu-item index="Virtualization" :class="{ 'is-active': activeIndex === 'Virtualization' }">
                Virtualization
            </el-menu-item>
            <el-menu-item index="Feedback" :class="{ 'is-active': activeIndex === 'Feedback' }"
                v-if="userData.userName">
                Feedback
            </el-menu-item>
            <div class="dark-mode-toggle">
                <el-switch id="dark" v-model="isDarkMode" :active-icon="Sunny" :inactive-icon="Moon" inline-prompt
                    width="15" @click="toggleTheme($event)"></el-switch>
            </div>
        </el-menu>
        <!-- 黑暗模式开关按钮，放在菜单的外部 -->
    </div>
</template>

<script setup>
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import { ref } from 'vue'; 
const isDark = useDark();
const toggleDark = useToggle(isDark);
const isDarkTag = ref(false);
const toggleTheme = (event) => {
  
  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
  );

  // 兼容性处理
  if (!document.startViewTransition) {
    toggleDark()
    return
  }
  const transition = document.startViewTransition(() => {})

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
    document.documentElement.animate(
        {
          clipPath: isDarkTag.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 300,
          easing: 'ease-in',
          pseudoElement: isDarkTag.value
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
        }
    );
  });
}
</script>

<script>
import logo from '../assets/logo.png';

export default {
    name: "MainHeader",
    data() {
        return {
            activeIndex: "", // 当前激活的菜单项
            defaultAvatar: logo,
            userData: JSON.parse(sessionStorage.getItem('userData')) || {},
            isDarkMode: false, // 黑暗模式开关
        };
    },
    methods: {
        handleSelect(index) {
            this.activeIndex = index; // 选择菜单项时更新当前激活项
        },
        logout() {
            window.sessionStorage.clear();
            this.$router.push('/Login');
        },
    },
    watch: {
        // 监听路由变化，更新激活菜单项
        $route(to) {
            this.activeIndex = to.name;
        },
        isDarkMode(newVal) {
            // 将黑暗模式状态保存到本地存储
            localStorage.setItem('isDarkMode', newVal);
            document.body.classList.toggle('dark-mode', newVal); // 切换 body 的黑暗模式类
            document.documentElement.classList.toggle('dark', newVal);
        },
    },
    mounted() {
        document.documentElement.classList.remove('dark');
        this.activeIndex = this.$route.name;
        this.isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
        if (this.isDarkMode) {
            document.body.classList.toggle('dark-mode', this.isDarkMode);
            document.documentElement.classList.add('dark');
        }
    },
};
</script>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.el-menu {
    position: fixed;
    z-index: 1000;
    width: 100%;
    border-bottom: 0px;
}

.main-header {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0), #ffffff);
}

.dark-mode-toggle {
    margin: 13px;
    margin-right: 30px;
}

.dark-mode .main-header {
    background: #3e3e3e;
}

.dark::view-transition-old(root) {
    z-index: 1;
}
.dark::view-transition-new(root) {
    z-index: 1999;
}

::view-transition-old(root) {
    z-index: 1999;
}
::view-transition-new(root) {
    z-index: 1;
}
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
}
</style>