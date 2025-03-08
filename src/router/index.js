import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/HomeView', // 当访问 '/' 时，重定向到 '/HomeView'
  },
  {
    path: '/HomeView',
    name: 'HomeView',
    component: HomeView,
    meta: { title: 'SCGADS' }
  },
  {
    path: '/ManageUser',
    name: 'ManageUser',
    component: () => import('../views/ManageUser.vue'),
    meta: { title: 'ManageUser', requiresAuth:true, requiresLogin:true }
  },
  {
    path: '/WorkSpace',
    name: 'WorkSpace',
    component: () => import('../views/WorkSpace.vue'),
    meta: { title: 'WorkSpace', requiresLogin:true }
  },
  {
    path: '/Upload',
    name: 'Upload',
    component: () => import('../views/UploadPage.vue'),
    meta: { title: 'Upload', requiresLogin:true }
  },
  {
    path: '/Login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Login' }
  },
  {
    path: '/Register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: 'Register' }
  },
  {
    path: '/Virtualization',
    name: 'Virtualization',
    component: () => import('../views/Virtualization.vue'),
    meta: { title: 'Virtualization' }
  },
  {
    path: '/Profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: 'Profile', requiresLogin:true }
  },
  {
    path: '/Feedback',
    name: 'Feedback',
    component: () => import('../views/FeedbackView.vue'),
    meta: { title: 'Feedback', requiresLogin:true }
  },
  {
    path: '/ManageFeedback',
    name: 'ManageFeedback',
    component: () => import('../views/ManageFeedback.vue'),
    meta: { title: 'ManageFeedback', requiresAuth:true, requiresLogin:true }
  },
  {
    path: '/ManageTasks',
    name: 'ManageTasks',
    component: () => import('../views/ManageTasks.vue'),
    meta: { title: 'ManageTasks', requiresAuth:true, requiresLogin:true }
  },
  {
    path: '/ManageModel',
    name: 'ManageModel',
    component: () => import('../views/ManageModel.vue'),
    meta: { title: 'ManageModel', requiresAuth:true, requiresLogin:true }
  },
  {
    path: '/SystemSettings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: { title: 'SystemSettings', requiresAuth:true, requiresLogin:true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  window.document.title = to.meta.title  // 更新标题
  next();
})

router.beforeEach((to, from, next) => {
  window.document.title = to.meta.title  // 更新标题
  // 登录检测
  if (to.matched.some(record => record.meta.requiresLogin)) {
    // 获取 sessionStorage 中的用户数据
    const user = JSON.parse(sessionStorage.getItem('userData')) || {}
    if (!user.userName) {
      // 如果没有用户数据，重定向到登录页面
      ElMessage.error('You are not logged in.')
      next({
        path: '/Login',
        query: { redirect: to.fullPath },
      });
    } else {
      // 如果有用户数据
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!user.isAdmin) {
          ElMessage.error('This page requires authorization.')
          next({
            path: '/HomeView',
            query: { redirect: to.fullPath },
          });
        }
      }
      // 允许访问
      next();
    }
  } else {
    // 不需要认证的路由，允许访问
    next();
  }
})

export default router

