<template>
  <view class="vr_container">
    <view class="vr-items">
      <view class="vr-item" v-for="img_item in markers" :key="img_item.id" @click="handlevr(img_item.vr)">
        <image :src="img_item.photo" mode="aspectFill" class="vr-img"></image>
        <view class="vr-title">{{ img_item.title }}</view>
      </view>
    </view>

  </view>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import {local_url,cloud_url} from '@/utils/url.js'
const userStore = useUserStore()
import { onShow } from "@dcloudio/uni-app"
import {marker}from "@/utils/map.js"
const markers=ref([])
onLoad(()=>{
	console.log("roam Shown")
	markers.value=marker

})
const handlevr = (vr) => {
	console.log("vr:",vr)

  uni.showToast({
    title: '敬请期待',
    icon: 'none',   // 文字提示
    duration: 3000
  })
	  // uni.navigateTo({
	  //   url: `/pages/webview/webview?url=${encodeURIComponent(vr)}`
	  // })

}
</script>
<style lang="scss" scoped>
    @import './roam.scss';
</style>