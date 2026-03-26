<template>
	<view class="profile_class">
		<view class="pre-picture"> 
             <image :src="userStore.avatarUrl||'/static/images/profile.png'" class="profile-image" @click="onProfileClick"></image>
			 <text style="font-size: 40rpx; font-weight: bold;" v-if="userStore.hasLogin">{{ zipped_name(userStore.nickname + userStore.user) }}</text>
		     <text style="font-size: 40rpx; font-weight: bold;" v-else @click="onProfileClick"> 登录/注册</text>
						
			</view>
		<view class="profile-container">
         <view class="profile-item">
			 <view style="font-size:40rpx;font-weight:bold;color:#666;">版本</view> 
			 <view style="font-size: 36rpx;">v{{version}}</view>
		 </view>
		</view>
	</view>
</template>
<script setup>
import { ref,onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import {local_url,cloud_url} from '@/utils/url.js'
const userStore = useUserStore()
// #ifdef H5
onMounted(() => {
	console.log("Profile Mounted")
})
// #endif
// #ifndef H5
import { onShow } from "@dcloudio/uni-app"
const version=ref('1.0.0')
onShow(() => {

console.log("Profile Loaded")
version.value=uni.getSystemInfoSync().appVersion
//console.log(uni.getSystemInfoSync())
})
// #endif
const onProfileClick=async ()=>{
	
if(userStore.hasLogin){
	return;
}
uni.login({
  success: (res) => {
    const code = res.code

    console.log("code:", code)
    // 获取用户信息

    uni.getUserInfo({
		
      success: async (userRes) => {
        console.log("userRes",userRes)
        // userRes 包含 encryptedData 和 iv
        const { encryptedData, iv } = userRes


        // 发送 code + encryptedData + iv 给后端
        const result = await uni.request({
          url: `${cloud_url}/api/auth/login_or_register`,
          method: 'POST',
          data: { 
		  code:code, 
		  encryptedData:encryptedData, 
		  iv:iv,

		  }
        })
        console.log("login:",result.data)
		let user_info=result.data.user_info
		userStore.nickname=user_info.nickName
		userStore.avatarUrl=user_info.avatarUrl
		userStore.user=user_info.openId
		userStore.token=result.data.token
		
		userStore.hasLogin=true
      },
	  fail:(err)=>{
		  console.log("getinfoerr:",err)
		  uni.showToast({
		  title: '请重试',
		  icon: 'none',
		  duration: 2000,
		  })
	  }
    })
  }
})
}
const zipped_name = (raw_name) => {
	//console.log("userStore.nickname:",userStore.nickname)
	//console.log("raw_name:",raw_name)
	if (raw_name.length > 15) {
		return raw_name.substring(0, 16)
	}
	return raw_name
}
</script>
<style lang="scss" scoped>
    @import './profile.scss';
</style>
