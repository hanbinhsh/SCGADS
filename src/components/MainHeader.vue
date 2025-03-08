<template>
    <div class="header-container">
        <!-- Desktop Menu -->
        <el-menu :default-active="activeIndex" class="el-menu main-header desktop-menu" mode="horizontal" :ellipsis="false"
            @select="handleSelect" :router="true" v-if="!isMobile">
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

        <!-- Mobile Menu -->
        <div class="mobile-header" v-if="isMobile">
            <div class="mobile-header-top">
                <img style="width: 40px" src="../assets/logo.png" alt="logo" @click="navigateTo('HomeView')" />
                <div class="mobile-controls">
                    <el-switch id="dark-mobile" v-model="isDarkMode" :active-icon="Sunny" :inactive-icon="Moon" inline-prompt
                        width="15" @click="toggleTheme($event)" class="mobile-dark-toggle"></el-switch>
                    <el-button type="text" @click="mobileMenuOpen = !mobileMenuOpen" class="mobile-menu-button">
                        <el-icon v-if="!mobileMenuOpen"><Menu /></el-icon>
                        <el-icon v-else><Close /></el-icon>
                    </el-button>
                </div>
            </div>
            
            <!-- Mobile Menu Dropdown -->
            <el-collapse-transition>
                <div class="mobile-menu-dropdown" v-if="mobileMenuOpen">
                    <template v-if="!userData.userName">
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'Login' }" @click="navigateTo('Login')">Login</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'Register' }" @click="navigateTo('Register')">Register</div>
                    </template>
                    
                    <template v-else>
                        <div class="mobile-user-profile">
                            <el-avatar :src="userData.avatarBase64 ? 'data:image/jpeg;base64,' + userData.avatarBase64 : defaultAvatar" size="small"></el-avatar>
                            <span>{{ userData.userName }}</span>
                        </div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'Profile' }" @click="navigateTo('Profile')">Profile</div>
                        <div class="mobile-menu-item" @click="logout()">Log out</div>
                    </template>
                    
                    <template v-if="userData.userName && userData?.isAdmin">
                        <div class="mobile-menu-section">Manage</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'ManageUser' }" @click="navigateTo('ManageUser')">Manage Users</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'ManageTasks' }" @click="navigateTo('ManageTasks')">Manage Tasks</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'ManageFeedback' }" @click="navigateTo('ManageFeedback')">Manage Feedbacks</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'ManageModel' }" @click="navigateTo('ManageModel')">Manage Model</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'SystemSettings' }" @click="navigateTo('SystemSettings')">System Settings</div>
                    </template>

                    <template v-if="userData.userName">
                        <div class="mobile-menu-section">Applications</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'WorkSpace' }" @click="navigateTo('WorkSpace')">WorkSpace</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'Upload' }" @click="navigateTo('Upload')">Upload</div>
                        <div class="mobile-menu-item" :class="{ active: activeIndex === 'Feedback' }" @click="navigateTo('Feedback')">Feedback</div>
                    </template>
                    
                    <div class="mobile-menu-item" :class="{ active: activeIndex === 'Virtualization' }" @click="navigateTo('Virtualization')">Virtualization</div>
                </div>
            </el-collapse-transition>
        </div>
    </div>
</template>

<script setup>
import { Sunny, Moon, Menu, Close } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'; 
const isDark = useDark();
const toggleDark = useToggle(isDark);
const isDarkTag = ref(false);

const isMobile = ref(false);
const mobileMenuOpen = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

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
            if (this.isMobile) {
                this.mobileMenuOpen = false;
            }
        },
        navigateTo(route) {
            this.activeIndex = route;
            this.$router.push('/' + route);
            this.mobileMenuOpen = false;
        }
    },
    watch: {
        // 监听路由变化，更新激活菜单项
        $route(to) {
            this.activeIndex = to.name;
        },
        isDarkMode(newVal) {
            this.$emit('darkmodeChanged', this.isDarkMode); // 全局通知，此处用于更新图表图例文字
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
/* Desktop styles */
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

/* Mobile styles */
.mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0), #ffffff);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark-mode .mobile-header {
    background: #3e3e3e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.mobile-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    height: 56px;
}

.mobile-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.mobile-dark-toggle {
    margin-right: 5px;
}

.mobile-menu-button {
    font-size: 24px;
    padding: 5px;
}

.mobile-menu-dropdown {
    background-color: #fff;
    border-top: 1px solid #eee;
    padding: 0 0 10px 0;
}

.dark-mode .mobile-menu-dropdown {
    background-color: #3e3e3e;
    border-top: 1px solid #555;
}

.mobile-menu-item {
    padding: 12px 20px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.mobile-menu-item:hover, .mobile-menu-item.active {
    background-color: #f5f7fa;
}

.dark-mode .mobile-menu-item:hover, .dark-mode .mobile-menu-item.active {
    background-color: #4e4e4e;
}

.mobile-menu-section {
    padding: 12px 20px;
    font-weight: bold;
    color: #909399;
    border-top: 1px solid #eee;
    margin-top: 5px;
}

.dark-mode .mobile-menu-section {
    color: #a6a9ad;
    border-top: 1px solid #555;
}

.mobile-user-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-bottom: 1px solid #eee;
}

.dark-mode .mobile-user-profile {
    border-bottom: 1px solid #555;
}

/* View transition animations */
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

/* Media queries for responsive design */
@media (max-width: 768px) {
    .desktop-menu {
        display: none;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    /* Tablet-specific styles */
    .el-menu-item, .el-sub-menu__title {
        padding: 0 10px;
    }
}
</style>