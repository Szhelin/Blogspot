import { createRouter, createWebHashHistory } from 'vue-router'
import { isMobileTerminal } from '@/utils/flexible'
import mobileRouter from './modules/mobile-router'
import pcRouter from './modules/pc-router'

//创建vueRouter 实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: isMobileTerminal.value ? mobileRouter : pcRouter
})

export default router
