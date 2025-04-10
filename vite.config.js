import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { join } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[name]'
    })
  ],
  //代理配置
  server: {
    proxy: {
      //代理所有请求
      '/api': {
        //代理请求之后的请求地址
        target: 'https://api.imooc-front.lgdsunday.club/',
        //跨域
        changeOrigin: true
      }
    },
    watch: {
      usePolling: true // 解决某些环境下文件变更检测不到的问题
    },
    hmr: true
  },
  //软链接
  resolve: {
    alias: {
      '@': join(__dirname, '/src')
    }
  }
})
