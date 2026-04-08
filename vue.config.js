const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // 关键：生产环境用仓库名作为 publicPath，末尾斜杠不能少
  publicPath: process.env.NODE_ENV === 'production' 
    ? '/SudokuGame/' 
    : '/',
  // 其他配置保持不变（如果有）
  transpileDependencies: true,
  // 确保打包输出到 dist 目录（默认就是，可省略）
  outputDir: 'dist'
})