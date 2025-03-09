<template>
  <el-config-provider :locale="locale">
    <router-view/>
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
export default {
  data() {
    return {
      locale: (localStorage.getItem('language')==='zh' ? zhCn : en)  || zhCn,
    }
  },
}
</script>

<style>
body{
  margin: 0px;
  overflow: hidden; /* 隐藏整个页面的滚动条 */
}
</style>
