<template>
  <!-- 头部图标：PC端 -->
  <div class="hidden pt-5 h-8 xl:block">
    <img
      v-lazy
      class="m-auto"
      src="https://www.hicom.fr/wp-content/uploads/2017/09/Logo_TV_2015.png"
      alt=""
    />
  </div>
  <!-- 头部图标：移动端 -->
  <div class="h-[111px] xl:hidden">
    <img
      v-lazy
      class="dark:hidden"
      src="https://res.lgdsunday.club/login-bg.png"
      alt=""
    />
    <img
      v-lazy
      class="h-5 absolute top-[5%] left-[50%] translate-x-[-50%]"
      src="https://img.icons8.com/color/1600/biotech.png"
      alt=""
      srcset=""
    />
  </div>
</template>
