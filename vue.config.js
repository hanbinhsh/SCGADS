const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 设置在保存文件时禁用ESLint自动检查
  lintOnSave: false,

  // 配置Vue开发服务器相关选项
  devServer: {
    //禁止全屏报错
    client: {
      overlay: false,
    },
    // 配置HTTP代理，以便在开发过程中将特定请求转发到其他服务器
    proxy: {
      // 当请求以 '/api' 开头时进行代理
      '/api': {
        // 指定目标服务器地址（例如后台API接口）
        target: 'http://localhost:8868',

        // 设置为true，允许跨域请求时重写源信息（Origin header）
        changeOrigin: true,

        // 路径重写规则，将前端应用中'/api'前缀去掉，映射到后端服务器的实际路径上
        pathRewrite: { '^/api': '' },
      }
    }
  },

})
