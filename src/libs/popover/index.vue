<template>
  <div class="relative" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <div ref="referenceTarget">
      <!-- 具名插槽：触发弹层的视图 -->
      <slot name="reference" />
    </div>
    <!-- 气泡展示 -->
    <transition name="slide">
      <div
        ref="contentTarget"
        v-show="isVisable"
        class="absolute z-20 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md"
        :style="contentStyle"
      >
        <!-- 匿名插槽：弹出层视图中展示的内容 -->
        <slot />
      </div>
    </transition>
  </div>
</template>
<script>
//延迟关闭时长
const DELAY_TIME = 100

const PROP_TOP_LEFT = 'top-left'
const PROP_TOP_RIGHT = 'top-right'
const PROP_BOTTOM_LEFT = 'bottom-left'
const PROP_BOTTOM_RIGHT = 'botton-right'

const placementEnum = [
  PROP_TOP_LEFT,
  PROP_TOP_RIGHT,
  PROP_BOTTOM_LEFT,
  PROP_BOTTOM_RIGHT
]
</script>
<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  placement: {
    type: String,
    default: PROP_BOTTOM_LEFT,
    validator(val) {
      const result = placementEnum.includes(val)
      if (!result) {
        throw new Error(
          `你的placement必须是${placementEnum.join('、')}中的一个`
        )
      }
      return result
    }
  }
})

const isVisable = ref(false)
let timeout = null

const onMouseenter = () => {
  isVisable.value = true
  if (timeout) {
    clearTimeout(timeout)
  }
}
const onMouseleave = () => {
  timeout = setTimeout(() => {
    isVisable.value = false
    timeout = null
  }, DELAY_TIME)
}

const referenceTarget = ref(null)
const contentTarget = ref(null)
const useElementSize = (target) => {
  if (!target) return {}
  return {
    width: target.offsetWidth,
    height: target.offsetHeight
  }
}

const contentStyle = ref({
  top: 0,
  left: 0
})

watch(isVisable, (val) => {
  if (!val) return
  //等待元素渲染，因为vue在数据改变一后，需要等待一段时间DOM才会变化，所以我们可以通过nextTick函数的参数来监听DOM变化后的回调
  nextTick(() => {
    switch (props.placement) {
      case PROP_TOP_LEFT:
        contentStyle.value.top = 0
        contentStyle.value.left =
          -useElementSize(contentTarget.value).width + 'px'
        break
      case PROP_TOP_RIGHT:
        contentStyle.value.top = 0
        contentStyle.value.left =
          useElementSize(referenceTarget.value).width + 'px'
        break
      case PROP_BOTTOM_LEFT:
        contentStyle.value.top =
          useElementSize(referenceTarget.value).height + 'px'
        contentStyle.value.left =
          -useElementSize(contentTarget.value).width + 'px'
        break
      case PROP_BOTTOM_RIGHT:
        contentStyle.value.top =
          useElementSize(referenceTarget.value).height + 'px'
        contentStyle.value.left =
          useElementSize(referenceTarget.value).width + 'px'
        break
    }
  })
})
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
