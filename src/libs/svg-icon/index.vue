<template>
  <svg aria-hidden="true">
    <use :xlink:href="symbolId" :class="fillClass" :fill="color" />
  </svg>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  //tailwind指定svg颜色的类名
  fillClass: {
    type: String
  }
})

const symbolId = computed(() => `#icon-${props.name}`)
</script>
<style lang="scss" scoped></style>
