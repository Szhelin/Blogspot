<template>
  <div
    class="h-full overflow-auto bg-white dark:bg-zinc-800 duration-500 scrollbar-thin scrollbar-thumb-transparent xl:scrollbar-thumb-zinc-200 xl:dark:scrollbar-thumb-zinc-900 scrollbar-track-transparent"
    ref="containerTarget"
  >
    <div
      class="max-w-screen-xl mx-auto my-4 relative overflow-hidden h-48 rounded"
    >
      <div
        class="flex transition-transform duration-500"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(img, index) in carouselImages"
          :key="index"
          class="flex-shrink-0 w-full h-48"
        >
          <img v-lazy :src="img" class="w-full h-full object-cover rounded" />
        </div>
      </div>

      <button
        class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded"
        @click="prev"
      >
        ‹
      </button>
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded"
        @click="next"
      >
        ›
      </button>
    </div>
    <navigation-vue></navigation-vue>
    <div class="max-w-screen-xl mx-auto relative m-1 xl:mt-4">
      <list-vue></list-vue>
    </div>
    <m-trigger-menu
      v-if="isMobileTerminal"
      class="fixed bottom-6 m-auto left-0 right-0 w-[220px]"
    >
      <m-trigger-menu-item
        icon="home"
        iconClass="fill-zinc-900 dark:fill-zinc-200"
      >
        首页
      </m-trigger-menu-item>
      <m-trigger-menu-item
        v-if="$store.getters.token"
        icon="vip"
        iconClass="fill-zinc-400 dark:fill-zinc-500"
        textClass="text-zinc-400 dark:text-zinc-500"
        @click="onVipClick"
      >
        VIP
      </m-trigger-menu-item>
      <m-trigger-menu-item
        icon="profile"
        iconClass="fill-zinc-400 dark:fill-zinc-500"
        textClass="text-zinc-400 dark:text-zinc-500"
        @click="onMyClick"
      >
        {{ $store.getters.token ? '我的' : '登录' }}
      </m-trigger-menu-item>
    </m-trigger-menu>
  </div>
</template>

<script>
export default {
  name: 'home'
}
</script>

<script setup>
import { isMobileTerminal } from '@/utils/flexible'
import navigationVue from './components/navigation/index.vue'
import listVue from './components/list/index.vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useScroll, useIntersectionObserver } from '@vueuse/core'
import { getThemes } from '@/api/pexels'
import { onActivated, ref, onMounted, watch } from 'vue'

const store = useStore()
const router = useRouter()

/**
 * VIP 按钮点击事件
 */
const onVipClick = () => {
  // 配置跳转方式
  store.commit('app/changeRouterType', 'push')
  router.push('/member')
}
/**
 * 我的按钮点击事件
 */
const onMyClick = () => {
  // 配置跳转方式
  store.commit('app/changeRouterType', 'push')
  if (store.getters.token) {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}

/**
 * 记录页面滚动位置
 */
const containerTarget = ref(null)
const { y: containerTargetScrollY } = useScroll(containerTarget)
// 被缓存的组件再次可见，会回调 onActivated 方法
onActivated(() => {
  if (!containerTarget.value) {
    return
  }
  containerTarget.value.scrollTop = containerTargetScrollY.value
})

// 轮播图部分
const carouselImages = ref([])
const currentIndex = ref(0)
const isCarouselLoading = ref(true)

const next = () => {
  if (carouselImages.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % carouselImages.value.length
}
const prev = () => {
  if (carouselImages.value.length === 0) return
  currentIndex.value =
    (currentIndex.value - 1 + carouselImages.value.length) %
    carouselImages.value.length
}

watch(
  () => store.getters.currentCategory,
  (newCategory) => {
    store.dispatch('pexels/resetQuery', { categoryId: newCategory.id })
  }
)

onMounted(async () => {
  await Promise.all([
    (async () => {
      const { themes } = await getThemes()
      carouselImages.value = themes.map((t) => t.photo)
    })(),
    store.dispatch('category/useCategoryData')
  ])
  store.dispatch('pexels/fetchList', true)
})
</script>
