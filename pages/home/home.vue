<template>
	<view class="home-container">

		<uni-search-bar v-model="searchValue" placeholder="请输入你想要了解的珍品~~~" @focus="onSearchBarFocus"
			@blur="onSearchBarBlur" @confirm="search" @cancel="onSearchBarCancel"></uni-search-bar>
			<swiper circular :indicator-dots="true" :autoplay="true" :interval="5000" indicator-color="#edecdf" indicator-active-color="#45e839" class="swipper"
				:duration="300">
				<swiper-item>
					<image src='/static/images/swipper1.jpg' class="swipper-image"></image>
				</swiper-item>
				<swiper-item>
					<image src='/static/images/swipper2.jpg' class="swipper-image"></image>
				</swiper-item>
				<swiper-item>
					<image src='/static/images/swipper3.jpg' class="swipper-image"></image>
				</swiper-item>
				<swiper-item>
					<image src='/static/images/swipper4.jpg' class="swipper-image"></image>
				</swiper-item>
			</swiper>
	</view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import {local_url,cloud_url} from '@/utils/url.js'
const userStore = useUserStore()

// #ifdef H5
onMounted(() => {
	console.log("Home Loaded")
})
// #endif
// #ifndef H5

import { onShow,onPullDownRefresh } from "@dcloudio/uni-app"
onShow(async () => {
	console.log("Home Loaded")
	uni.authorize({
		scope: 'scope.userLocation'
	})
	await init_login();

})
onPullDownRefresh(async () => {
	await init_login();
	uni.stopPullDownRefresh();
})
const init_login = async () => {
	console.log("hasLogin:", userStore.hasLogin)
	console.log("token:", userStore.token)
	if (userStore.hasLogin && userStore.token) {
		try {
			const res =await uni.request({
				method: 'POST',
				data: {
					token: userStore.token
				},
				url : `${cloud_url}/api/auth/verify_token`,
			})
			console.log("check_login_res:",res.data)
			if (!res.data?.success) {
				userStore.logout()
			}
		} catch (e) {
			console.log(e)
		}
	}
}

// #endif
const searchValue = ref('')
const onSearchBarFocus = () => {
	console.log("Search Bar Focused")
}
const onSearchBarBlur = () => {
	console.log("Search Bar Blurred")
}
const search = () => {
	console.log("Searching for: " + searchValue.value)
}
const onSearchBarCancel = () => {
	console.log("Search Bar Canceled")
}



</script>
<style lang="scss" scoped>
@import './home.scss';
</style>
