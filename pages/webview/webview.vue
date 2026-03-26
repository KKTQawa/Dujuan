<template>
    <view class="webview-container">
      <web-view 
        :src="url" 
        @load="handleLoad"
      ></web-view>
    </view>
</template>

<script setup>

import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url=ref('')

onLoad((options) => {
  uni.showLoading({
    title: '加载中...',
    mask: true 
  })

  url.value = decodeURIComponent(options.url)
  console.log('weburl:', url.value)
})
const handleLoad = () => {
  uni.hideLoading()
}
</script>