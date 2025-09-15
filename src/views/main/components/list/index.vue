<template>
  <div>
    <!-- 列表处理 -->
    <m-infinite v-model="isLoading" :isFinished="isFinished" @onLoad="onLoad">
      <m-waterfall
        :data="pexelsList"
        :column="isMobileTerminal ? 2 : 5"
        :picturePreReading="false"
        class="w-full px-1"
      >
        <template v-slot="{ item, width }">
          <itemVue :data="item" :width="width" @click="onToPins" />
        </template>
      </m-waterfall>
    </m-infinite>
    <!-- 大图详情处理 -->
    <transition
      :css="false"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <pins-vue v-if="isVisiblePins" :id="currentPins.id" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
// import { getPexelsList } from '@/api/pexels'
import itemVue from './item.vue'
import { isMobileTerminal } from '@/utils/flexible'
import { useStore } from 'vuex'
// import pinsVue from '@/views/pins/components/pins.vue'
import gsap from 'gsap'
import { useEventListener } from '@vueuse/core'

const pinsVue = defineAsyncComponent(() =>
  import('@/views/pins/components/pins.vue')
)

const store = useStore()

const pexelsList = computed(() => store.state.pexels.list)
const isLoading = computed(() => store.state.pexels.isLoading)
const isFinished = computed(() => store.state.pexels.isFinished)

const onLoad = () => store.dispatch('pexels/fetchList')

// 控制 pins 展示
const isVisiblePins = ref(false)
// 当前选中的 pins 属性
const currentPins = ref({})
/**
 * 进入 pins
 */
const onToPins = (item) => {
  history.pushState(null, null, `/pins/${item.id}`)
  currentPins.value = item
  isVisiblePins.value = true
}

/**
 * 监听浏览器后退按钮事件
 */
useEventListener(window, 'popstate', () => {
  isVisiblePins.value = false
})

/**
 * 进入动画开始前
 */
const beforeEnter = (el) => {
  gsap.set(el, {
    scaleX: 0,
    scaleY: 0,
    transformOrigin: '0 0',
    translateX: currentPins.value.localtion?.translateX,
    translateY: currentPins.value.localtion?.translateY,
    opacity: 0
  })
}
/**
 * 进入动画执行中
 */
const enter = (el, done) => {
  gsap.to(el, {
    duration: 0.3,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    translateX: 0,
    translateY: 0,
    onComplete: done
  })
}
/**
 * 离开动画执行中
 */
const leave = (el, done) => {
  gsap.to(el, {
    duration: 0.3,
    scaleX: 0,
    scaleY: 0,
    x: currentPins.value.localtion?.translateX,
    y: currentPins.value.localtion?.translateY,
    opacity: 0
  })
}
</script>
